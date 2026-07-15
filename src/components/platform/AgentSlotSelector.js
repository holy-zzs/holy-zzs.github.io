// ═══════════════════════════════════════════════════════════
// 智能体插槽选择器 (AgentSlotSelector)
// 像选英雄/组牌一样拖拽角色到5个插槽
// 含羁绊系统 + 一键套用模板 + 神秘嘉宾
// ═══════════════════════════════════════════════════════════
import { html, useContext, useState, useCallback, useEffect, useRef, useMemo } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'
import { AGENTS, getAgentsByGrade } from '../../data/agents.js'
import { PRESET_TEAMS } from '../../data/platformData.js'
import { encodeTeamCode, isValidCode, getTeamByCode } from '../../data/teamShareCode.js'
import { NavBar, Footer, PageContainer, StepProgress } from './PlatformCommon.js?v=nav3'

const MIN_AGENTS = 3
const MAX_AGENTS = 5

// 学段筛选
const GRADE_FILTERS = [
  { id: 'all', name: '全部', emoji: '🌟' },
  { id: 'universal', name: '通用', emoji: '⚙️' },
  { id: 'primary', name: '小学', emoji: '🧒' },
  { id: 'junior', name: '初中', emoji: '👦' },
  { id: 'senior', name: '高中', emoji: '🧑' },
  { id: 'college', name: '大学', emoji: '🎓' },
]

const GRADE_NAMES = {
  universal: '通用', primary: '小学', junior: '初中', senior: '高中', college: '大学'
}
const GRADE_BADGE_COLORS = {
  universal: 'bg-gray-100 text-gray-500',
  primary: 'bg-green-100 text-green-600',
  junior: 'bg-blue-100 text-blue-600',
  senior: 'bg-purple-100 text-purple-600',
  college: 'bg-amber-100 text-amber-600',
}

// 确定性生成统计
function generateStats(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i)
    hash |= 0
  }
  return {
    rating: 4.3 + (Math.abs(hash) % 7) / 10,
    projects: 80 + (Math.abs(hash >> 3) % 350),
  }
}

// 羁绊检测：检查当前选中的角色是否匹配某个预设团队
function detectSynergy(selectedIds) {
  if (selectedIds.length < MIN_AGENTS) return null

  for (const team of PRESET_TEAMS) {
    const teamAgentSet = new Set(team.agents)
    const selectedSet = new Set(selectedIds)

    // 计算交集
    let matchCount = 0
    for (const id of selectedIds) {
      if (teamAgentSet.has(id)) matchCount++
    }

    // 全部匹配 → 完全羁绊
    if (matchCount === team.agents.length && selectedIds.length === team.agents.length) {
      return {
        team,
        level: 'full',
        name: team.name,
        effect: team.synergyEffect || `${team.name} · 羁绊激活`,
        matchPercent: 100,
      }
    }

    // 部分匹配 ≥ 3
    if (matchCount >= 3 && matchCount >= team.agents.length - 1) {
      return {
        team,
        level: 'partial',
        name: team.name,
        effect: `${team.name} · 羁绊 ${Math.round(matchCount / team.agents.length * 100)}%`,
        matchPercent: Math.round(matchCount / team.agents.length * 100),
      }
    }
  }
  return null
}

export default function AgentSlotSelector() {
  const { state, dispatch } = useContext(AppContext)

  const [selected, setSelected] = useState(state.selectedAgents || [])
  const [gradeFilter, setGradeFilter] = useState(state.selectedGrade || 'all')
  const [search, setSearch] = useState('')
  const [draggedAgent, setDraggedAgent] = useState(null)
  const [dragOverSlot, setDragOverSlot] = useState(null)
  const [synergy, setSynergy] = useState(null)
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [codeResult, setCodeResult] = useState(null)
  const [showCustomAgent, setShowCustomAgent] = useState(false)
  const [customAgent, setCustomAgent] = useState({ name: '', personality: '', topic: '' })
  const [detail, setDetail] = useState(null)

  // 检测羁绊
  useEffect(() => {
    const s = detectSynergy(selected)
    setSynergy(s)
  }, [selected])

  // 同步到全局 state
  const syncToGlobal = useCallback((newSelected) => {
    dispatch({ type: 'SET_AGENTS', payload: newSelected })
  }, [dispatch])

  // 过滤角色
  const filtered = useMemo(() => {
    return AGENTS.filter(a => {
      if (gradeFilter !== 'all' && a.grade !== gradeFilter) return false
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const hay = [a.name, a.title, a.tagline, ...(a.expertise || []), ...(a.skills || [])]
          .join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [gradeFilter, search])

  // 添加角色到插槽
  const addAgent = useCallback((agentId) => {
    setSelected(prev => {
      if (prev.includes(agentId)) return prev
      if (prev.length >= MAX_AGENTS) return prev
      const next = [...prev, agentId]
      syncToGlobal(next)
      return next
    })
  }, [syncToGlobal])

  // 从插槽移除
  const removeAgent = useCallback((agentId) => {
    setSelected(prev => {
      const next = prev.filter(x => x !== agentId)
      syncToGlobal(next)
      return next
    })
  }, [syncToGlobal])

  // 拖拽：从角色库拖到插槽
  const handleDragStart = useCallback((e, agent) => {
    setDraggedAgent(agent)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e, slotIndex) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverSlot(slotIndex)
  }, [])

  const handleDrop = useCallback((e, slotIndex) => {
    e.preventDefault()
    setDragOverSlot(null)
    if (!draggedAgent) return

    setSelected(prev => {
      const next = [...prev]
      // 如果该插槽已有角色，替换
      if (slotIndex < next.length) {
        // 如果拖入的角色已在其他插槽，先移除
        const existingIdx = next.indexOf(draggedAgent.id)
        if (existingIdx >= 0) {
          next[existingIdx] = next[slotIndex] // 交换
        }
        next[slotIndex] = draggedAgent.id
      } else if (next.length < MAX_AGENTS) {
        // 空插槽，添加
        if (!next.includes(draggedAgent.id)) {
          next.push(draggedAgent.id)
        }
      }
      syncToGlobal(next)
      return next
    })
    setDraggedAgent(null)
  }, [draggedAgent, syncToGlobal])

  // 一键套用模板
  const applyTemplate = useCallback((team) => {
    setSelected(team.agents.slice(0, MAX_AGENTS))
    dispatch({ type: 'SET_PRESET_TEAM', payload: team.id })
    syncToGlobal(team.agents.slice(0, MAX_AGENTS))
  }, [dispatch, syncToGlobal])

  // 分享码导入
  const handleCodeImport = useCallback(() => {
    if (!isValidCode(codeInput)) {
      setCodeResult({ success: false, msg: '格式错误：需要6位字符（不含I/L/O/U）' })
      return
    }
    const team = getTeamByCode(codeInput)
    if (team && team.agents) {
      setSelected(team.agents.slice(0, MAX_AGENTS))
      dispatch({ type: 'SET_PRESET_TEAM', payload: team.id })
      syncToGlobal(team.agents.slice(0, MAX_AGENTS))
      setCodeResult({ success: true, msg: `已套用：${team.name}`, team })
      setTimeout(() => { setShowCodeInput(false); setCodeResult(null); setCodeInput('') }, 1500)
    } else {
      setCodeResult({ success: false, msg: '未找到对应的团队模板' })
    }
  }, [codeInput, dispatch, syncToGlobal])

  // 创建神秘嘉宾
  const createCustomAgent = useCallback(() => {
    if (!customAgent.name.trim()) return
    const customId = 'custom_' + Date.now()
    const agent = {
      id: customId,
      name: customAgent.name,
      title: '神秘嘉宾 · 自定义',
      emoji: '🎭',
      color: '#8B5CF6',
      gradient: 'from-purple-400 to-pink-500',
      tagline: customAgent.personality || '我来助你一臂之力',
      expertise: ['自定义角色'],
      skills: ['用户设定'],
      grade: state.selectedGrade || 'universal',
      category: '自定义',
      isCustom: true,
      customTopic: customAgent.topic,
    }
    // 直接加入选中列表
    setSelected(prev => {
      if (prev.length >= MAX_AGENTS) return prev
      const next = [...prev, customId]
      syncToGlobal(next)
      return next
    })
    // 同时加到 AGENTS 缓存（临时）
    AGENTS.push(agent)
    setShowCustomAgent(false)
    setCustomAgent({ name: '', personality: '', topic: '' })
  }, [customAgent, state.selectedGrade, syncToGlobal])

  // 当前选中团队的分享码
  const currentCode = useMemo(() => {
    if (selected.length < MIN_AGENTS) return ''
    return encodeTeamCode({ id: 'custom', agents: selected })
  }, [selected])

  // 获取角色对象
  const getAgent = (id) => AGENTS.find(a => a.id === id)
  const selectedAgents = selected.map(id => getAgent(id)).filter(Boolean)

  // 推荐3个模板
  const recommendedTemplates = useMemo(() => {
    let teams = PRESET_TEAMS
    if (state.selectedGrade) {
      teams = teams.filter(t => t.grade === state.selectedGrade)
    }
    return teams.slice(0, 4)
  }, [state.selectedGrade])

  const needMore = Math.max(0, MIN_AGENTS - selected.length)
  const canConfirm = selected.length >= MIN_AGENTS

  const goBack = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: STEPS.MODE })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  const confirmTeam = useCallback(() => {
    if (!canConfirm) return
    dispatch({ type: 'SET_AGENTS', payload: selected })
    dispatch({ type: 'SET_PRESET_TEAM', payload: null })
    dispatch({ type: 'SET_STEP', payload: STEPS.UPLOAD })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selected, canConfirm, dispatch])

  return html`
    <div class="min-h-screen" style=${{ background: '#05010f', color: '#f5e8ff', minHeight: '100vh' }}>
      <${NavBar} />

      <${PageContainer} className="pb-28 lg:pb-16">
        <!-- 顶部 -->
        <div class="flex items-center justify-between gap-4 mb-2">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold" style=${{ color: 'var(--theme-primary)' }}>智能体组队台</h1>
            <p class="text-sm mt-1" style=${{ color: 'var(--theme-text-muted)' }}>拖拽角色到插槽，凑齐羁绊触发金光 ✨</p>
          </div>
          <button class="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
                  style=${{ background: 'var(--theme-surface)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }}
                  onClick=${goBack}>
            <span>←</span><span class="hidden sm:inline">返回</span>
          </button>
        </div>

        <${StepProgress} current=${2} total=${4} labels=${['选学科', '选模式', '组团队', '传教材']} />

        <!-- ════ 插槽区 ════ -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-semibold" style=${{ color: 'var(--theme-text-muted)' }}>智能体插槽（${selected.length}/${MAX_AGENTS}）</h2>
            <div class="flex items-center gap-2">
              <!-- 分享码按钮 -->
              ${currentCode ? html`
                <button class="text-xs px-2.5 py-1 rounded-md font-mono transition-all"
                        style=${{ background: 'var(--theme-accent-bg)', color: 'var(--theme-accent)' }}
                        onClick=${() => { navigator.clipboard?.writeText(currentCode); }}
                        title="点击复制分享码">
                  📋 ${currentCode}
                </button>
              ` : null}
              <!-- 分享码导入 -->
              <button class="text-xs px-2.5 py-1 rounded-md transition-all"
                      style=${{ background: 'var(--theme-primary-bg)', color: 'var(--theme-primary)' }}
                      onClick=${() => setShowCodeInput(!showCodeInput)}>
                🔑 导入码
              </button>
            </div>
          </div>

          <!-- 分享码导入面板 -->
          ${showCodeInput ? html`
            <div class="mb-3 p-3 rounded-xl flex items-center gap-2"
                 style=${{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
              <input type="text" maxlength="6" value=${codeInput}
                     placeholder="输入6位分享码..."
                     onInput=${e => setCodeInput(e.target.value.toUpperCase())}
                     class="flex-1 px-3 py-2 rounded-lg font-mono text-sm outline-none"
                     style=${{ background: 'var(--theme-bg)', border: '1px solid var(--theme-border)', color: 'var(--theme-text)' }} />
              <button class="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                      style=${{ background: 'var(--theme-primary)' }}
                      onClick=${handleCodeImport}>
                导入
              </button>
              ${codeResult ? html`
                <span class="text-xs ${codeResult.success ? 'text-green-500' : 'text-red-500'}">${codeResult.msg}</span>
              ` : null}
            </div>
          ` : null}

          <!-- 5个插槽 -->
          <div class="grid grid-cols-5 gap-2 sm:gap-3 mb-3">
            ${Array.from({ length: MAX_AGENTS }).map((_, i) => {
              const agent = selectedAgents[i]
              const isDragOver = dragOverSlot === i
              return html`
                <div key=${i}
                     class=${`relative aspect-[3/4] rounded-xl flex flex-col items-center justify-center p-2 transition-all
                       ${agent ? 'cursor-pointer' : 'cursor-default'}
                       ${isDragOver ? 'ring-2 ring-offset-2' : ''}`}
                     style=${{
                       background: agent ? `linear-gradient(135deg, ${agent.color}15, ${agent.color}05)` : 'var(--theme-surface-alt)',
                       border: agent ? `2px solid ${agent.color}40` : `2px dashed var(--theme-border)`,
                       '--tw-ring-color': 'var(--theme-primary)',
                     }}
                     onDragOver=${(e) => handleDragOver(e, i)}
                     onDrop=${(e) => handleDrop(e, i)}
                     onDragLeave=${() => setDragOverSlot(null)}
                     onClick=${() => agent && setDetail(agent)}>

                  ${agent ? html`
                    <!-- 已填充插槽 -->
                    <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl mb-1"
                         style=${{ background: `linear-gradient(135deg, ${agent.color}, ${agent.color}80)` }}>
                      ${agent.emoji}
                    </div>
                    <div class="text-[10px] sm:text-xs font-bold text-center truncate w-full" style=${{ color: 'var(--theme-text)' }}>
                      ${agent.name}
                    </div>
                    <div class="text-[8px] sm:text-[10px] text-center truncate w-full" style=${{ color: 'var(--theme-text-muted)' }}>
                      ${agent.title?.split(' · ')[0] || ''}
                    </div>
                    <button class="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-colors"
                            style=${{ background: 'rgba(0,0,0,0.1)' }}
                            onClick=${(e) => { e.stopPropagation(); removeAgent(agent.id) }}>
                      ✕
                    </button>
                  ` : html`
                    <!-- 空插槽 -->
                    <div class="text-2xl sm:text-3xl opacity-30">＋</div>
                    <div class="text-[10px] sm:text-xs mt-1" style=${{ color: 'var(--theme-text-muted)' }}>
                      ${i === 0 ? '主策划' : i === 1 ? '美术' : i === 2 ? '叙事' : i === 3 ? '数值' : '质检'}
                    </div>
                  `}
                </div>
              `
            })}
          </div>

          <!-- 羁绊提示 -->
          ${synergy ? html`
            <div class=${`p-3 rounded-xl flex items-center gap-3 ${synergy.level === 'full' ? 'synergy-active' : ''}`}
                 style=${{
                   background: synergy.level === 'full'
                     ? 'linear-gradient(90deg, rgba(255,215,0,0.1), rgba(255,215,0,0.05))'
                     : 'var(--theme-accent-bg)',
                   border: synergy.level === 'full'
                     ? '1px solid rgba(255,215,0,0.4)'
                     : '1px solid var(--theme-border)',
                 }}>
              <div class="text-2xl">${synergy.level === 'full' ? '✨' : '🔗'}</div>
              <div class="flex-1">
                <div class="text-sm font-bold" style=${{ color: synergy.level === 'full' ? '#B8860B' : 'var(--theme-accent)' }}>
                  ${synergy.level === 'full' ? '羁绊激活' : '羁绊接近完成'}
                </div>
                <div class="text-xs" style=${{ color: 'var(--theme-text-muted)' }}>
                  ${synergy.name} · ${synergy.matchPercent}%
                </div>
              </div>
              ${synergy.level === 'full' ? html`
                <button class="text-xs px-3 py-1.5 rounded-lg text-white font-medium"
                        style=${{ background: '#B8860B' }}
                        onClick=${() => applyTemplate(synergy.team)}>
                  确认使用
                </button>
              ` : null}
            </div>
          ` : null}

          <!-- 底部操作栏 -->
          <div class="flex items-center justify-between mt-3">
            <div class="text-sm" style=${{ color: 'var(--theme-text-muted)' }}>
              ${needMore > 0
                ? html`还需 ${needMore} 个角色`
                : html`<span class="text-green-500">✓ 已满足最少数量</span>`
              }
            </div>
            <button class=${`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${canConfirm ? '' : 'opacity-50 cursor-not-allowed'}`}
                    style=${{
                      background: canConfirm ? 'var(--theme-primary)' : 'var(--theme-surface-alt)',
                      color: canConfirm ? '#FFFFFF' : 'var(--theme-text-muted)',
                    }}
                    disabled=${!canConfirm}
                    onClick=${confirmTeam}>
              确认团队 →
            </button>
          </div>
        </div>

        <!-- ════ 一键套用模板 ════ -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-sm font-semibold" style=${{ color: 'var(--theme-text-muted)' }}>⚡ 一键套用模板</h2>
            <button class="text-xs px-2.5 py-1 rounded-md transition-all"
                    style=${{ background: 'var(--theme-accent-bg)', color: 'var(--theme-accent)' }}
                    onClick=${() => setShowCustomAgent(!showCustomAgent)}>
              🎭 召唤神秘嘉宾
            </button>
          </div>

          <!-- 神秘嘉宾面板 -->
          ${showCustomAgent ? html`
            <div class="mb-3 p-4 rounded-xl space-y-3"
                 style=${{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
              <div class="text-xs" style=${{ color: 'var(--theme-text-muted)' }}>
                自定义一个专属角色，比如"语气像周杰伦的智能体来教我历史"
              </div>
              <input type="text" value=${customAgent.name} placeholder="角色名称（如：周董历史课）"
                     class="w-full px-3 py-2 rounded-lg text-sm outline-none"
                     style=${{ background: 'var(--theme-bg)', border: '1px solid var(--theme-border)', color: 'var(--theme-text)' }}
                     onInput=${e => setCustomAgent(prev => ({ ...prev, name: e.target.value }))} />
              <input type="text" value=${customAgent.personality} placeholder="人设风格（如：语速快、爱说哎哟不错哦）"
                     class="w-full px-3 py-2 rounded-lg text-sm outline-none"
                     style=${{ background: 'var(--theme-bg)', border: '1px solid var(--theme-border)', color: 'var(--theme-text)' }}
                     onInput=${e => setCustomAgent(prev => ({ ...prev, personality: e.target.value }))} />
              <input type="text" value=${customAgent.topic} placeholder="擅长领域（如：中国近代史）"
                     class="w-full px-3 py-2 rounded-lg text-sm outline-none"
                     style=${{ background: 'var(--theme-bg)', border: '1px solid var(--theme-border)', color: 'var(--theme-text)' }}
                     onInput=${e => setCustomAgent(prev => ({ ...prev, topic: e.target.value }))} />
              <button class="w-full py-2 rounded-lg text-sm font-medium text-white transition-colors"
                      style=${{ background: 'var(--theme-primary)' }}
                      onClick=${createCustomAgent}>
                召唤！
              </button>
            </div>
          ` : null}

          <!-- 模板卡片 -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
            ${recommendedTemplates.map(team => html`
              <button key=${team.id}
                      class="p-3 rounded-xl text-left transition-all hover:scale-[1.02]"
                      style=${{
                        background: 'var(--theme-surface)',
                        border: '1px solid var(--theme-border)',
                      }}
                      onClick=${() => applyTemplate(team)}>
                <div class="text-2xl mb-1">${team.emoji || '🎯'}</div>
                <div class="text-xs font-bold mb-0.5 truncate" style=${{ color: 'var(--theme-text)' }}>${team.name}</div>
                <div class="text-[10px] truncate" style=${{ color: 'var(--theme-text-muted)' }}>${team.gradeName || ''} · ${team.gameTypeName || ''}</div>
              </button>
            `)}
          </div>
        </div>

        <!-- ════ 角色库 ════ -->
        <div>
          <h2 class="text-sm font-semibold mb-2" style=${{ color: 'var(--theme-text-muted)' }}>角色库（${filtered.length} 个）</h2>

          <!-- 学段筛选 -->
          <div class="flex items-center gap-2 overflow-x-auto pb-2 mb-3">
            ${GRADE_FILTERS.map(g => html`
              <button key=${g.id}
                class=${`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all`}
                style=${gradeFilter === g.id
                  ? { background: 'var(--theme-primary)', color: '#FFFFFF' }
                  : { background: 'var(--theme-surface)', color: 'var(--theme-text-muted)', border: '1px solid var(--theme-border)' }
                }
                onClick=${() => setGradeFilter(g.id)}>
                <span>${g.emoji}</span> <span>${g.name}</span>
              </button>
            `)}
          </div>

          <!-- 搜索 -->
          <div class="relative mb-4">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-base" style=${{ color: 'var(--theme-text-muted)' }}>🔍</span>
            <input type="text" value=${search}
                   placeholder="搜角色名或专长..."
                   class="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all"
                   style=${{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', color: 'var(--theme-text)' }}
                   onInput=${e => setSearch(e.target.value)} />
            ${search ? html`
              <button class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full text-xs flex items-center justify-center transition-colors"
                      style=${{ background: 'var(--theme-surface-alt)', color: 'var(--theme-text-muted)' }}
                      onClick=${() => setSearch('')}>✕</button>
            ` : null}
          </div>

          <!-- 角色网格 -->
          ${filtered.length === 0 ? html`
            <div class="flex flex-col items-center justify-center py-16 text-center">
              <div class="text-5xl mb-3 opacity-60">🫥</div>
              <p class="text-sm" style=${{ color: 'var(--theme-text-muted)' }}>没搜到匹配的角色，换个关键词试试？</p>
            </div>
          ` : html`
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              ${filtered.map(agent => {
                const sel = selected.includes(agent.id)
                const stats = generateStats(agent.id)
                return html`
                  <div key=${agent.id}
                       draggable=${!sel}
                       onDragStart=${(e) => handleDragStart(e, agent)}
                       class=${`p-3 rounded-xl cursor-grab transition-all ${sel ? 'opacity-40' : 'hover:scale-[1.02]'}`}
                       style=${{
                         background: 'var(--theme-surface)',
                         border: sel ? `2px solid var(--theme-primary)` : '1px solid var(--theme-border)',
                       }}
                       onClick=${() => !sel && addAgent(agent.id)}>
                    <div class="flex items-start justify-between mb-2">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                           style=${{ background: `linear-gradient(135deg, ${agent.color}, ${agent.color}80)` }}>
                        ${agent.emoji}
                      </div>
                      <span class=${`text-[9px] px-1.5 py-0.5 rounded ${GRADE_BADGE_COLORS[agent.grade] || GRADE_BADGE_COLORS.universal}`}>
                        ${GRADE_NAMES[agent.grade] || '通用'}
                      </span>
                    </div>
                    <h3 class="text-sm font-bold mb-0.5 truncate" style=${{ color: 'var(--theme-text)' }}>${agent.name}</h3>
                    <p class="text-[10px] mb-1 truncate" style=${{ color: 'var(--theme-text-muted)' }}>${agent.title}</p>
                    <p class="text-[10px] italic mb-2 line-clamp-1" style=${{ color: 'var(--theme-text-muted)' }}>"${agent.tagline}"</p>
                    <div class="flex items-center justify-between">
                      <span class="text-[10px]" style=${{ color: 'var(--theme-text-muted)' }}>⭐${stats.rating.toFixed(1)}</span>
                      ${sel
                        ? html`<span class="text-[10px] text-green-500 font-bold">✓ 已选</span>`
                        : html`<span class="text-[10px]" style=${{ color: 'var(--theme-primary)' }}>点击/拖拽 +</span>`
                      }
                    </div>
                  </div>
                `
              })}
            </div>
          `}
        </div>

        <!-- ════ 详情弹窗 ════ -->
        ${detail ? html`
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
               style=${{ background: 'rgba(0,0,0,0.5)' }}
               onClick=${() => setDetail(null)}>
            <div class="max-w-md w-full rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
                 style=${{ background: 'var(--theme-surface)' }}
                 onClick=${(e) => e.stopPropagation()}>
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
                       style=${{ background: `linear-gradient(135deg, ${detail.color}, ${detail.color}80)` }}>
                    ${detail.emoji}
                  </div>
                  <div>
                    <h3 class="text-lg font-bold" style=${{ color: 'var(--theme-text)' }}>${detail.name}</h3>
                    <p class="text-sm" style=${{ color: 'var(--theme-text-muted)' }}>${detail.title}</p>
                  </div>
                </div>
                <button class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style=${{ background: 'var(--theme-surface-alt)', color: 'var(--theme-text-muted)' }}
                        onClick=${() => setDetail(null)}>✕</button>
              </div>
              <p class="text-sm italic mb-4" style=${{ color: 'var(--theme-text-muted)' }}>"${detail.tagline}"</p>
              ${detail.background ? html`
                <div class="mb-4">
                  <h4 class="text-xs font-semibold mb-1" style=${{ color: 'var(--theme-text-muted)' }}>背景</h4>
                  <p class="text-sm" style=${{ color: 'var(--theme-text)' }}>${detail.background}</p>
                </div>
              ` : null}
              ${detail.expertise?.length ? html`
                <div class="mb-4">
                  <h4 class="text-xs font-semibold mb-1" style=${{ color: 'var(--theme-text-muted)' }}>专长</h4>
                  <div class="flex flex-wrap gap-1.5">
                    ${detail.expertise.map(exp => html`
                      <span class="text-xs px-2 py-1 rounded-md" style=${{ background: 'var(--theme-primary-bg)', color: 'var(--theme-primary)' }}>${exp}</span>
                    `)}
                  </div>
                </div>
              ` : null}
              ${detail.speakingStyle ? html`
                <div class="mb-4">
                  <h4 class="text-xs font-semibold mb-1" style=${{ color: 'var(--theme-text-muted)' }}>说话风格</h4>
                  <p class="text-sm" style=${{ color: 'var(--theme-text)' }}>${detail.speakingStyle}</p>
                </div>
              ` : null}
              ${selected.includes(detail.id) ? html`
                <button class="w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
                        style=${{ background: 'var(--theme-surface-alt)', color: 'var(--theme-text-muted)' }}
                        onClick=${() => { removeAgent(detail.id); setDetail(null) }}>
                  从团队移除
                </button>
              ` : selected.length < MAX_AGENTS ? html`
                <button class="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-colors"
                        style=${{ background: 'var(--theme-primary)' }}
                        onClick=${() => { addAgent(detail.id); setDetail(null) }}>
                  加入团队
                </button>
              ` : html`
                <div class="text-center text-xs" style=${{ color: 'var(--theme-text-muted)' }}>团队已满（${MAX_AGENTS}/5）</div>
              `}
            </div>
          </div>
        ` : null}
      </${PageContainer}>
      <${Footer} />
    </div>
  `
}
