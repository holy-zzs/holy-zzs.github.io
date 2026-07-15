// 页面4：预设团队选择页
// 选一个现成AI团队模板，有手就行，含金量拉满
import { html, useContext, useCallback, useState, useEffect, useRef } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'
import { PRESET_TEAMS } from '../../data/platformData.js'
import { AGENTS } from '../../data/agents.js'
import { NavBar, Footer, PageContainer, StepProgress } from './PlatformCommon.js?v=nav3'

// PRESET_TEAMS 中 agent id 与 AGENTS 不完全一致，做别名映射
// 自定义简写 ID (p01/m01/h01/u01…) → 通用角色 ID
const ALIAS = {
  narrator: 'narrative', balance: 'numbers',
  p01: 'scholar', p02: 'captain', p03: 'designer', p04: 'numbers', p05: 'narrative',
  m01: 'scholar', m02: 'captain', m03: 'designer', m04: 'numbers', m05: 'narrative',
  h01: 'scholar', h02: 'captain', h03: 'designer', h04: 'numbers', h05: 'narrative',
  u01: 'scholar', u02: 'captain', u03: 'designer', u04: 'numbers', u05: 'narrative',
  u06: 'art', u07: 'level', u08: 'qa', u09: 'spark', u10: 'tech', u11: 'experience',
}
const resolveId = (id) => ALIAS[id] || id

// AGENTS id → 完整角色信息
const agentMap = {}
AGENTS.forEach(a => { agentMap[a.id] = a })

// 评分转 emoji 星星
function renderStars(rating) {
  const full = Math.floor(rating)
  const half = (rating - full) >= 0.5
  return html`<span class="inline-flex items-center">${'⭐'.repeat(full)}${half ? '💫' : ''}</span>`
}

// 从 PRESET_TEAMS 去重出游戏类型筛选项
function buildGameTypes() {
  const list = []
  const seen = new Set()
  PRESET_TEAMS.forEach(t => {
    if (!seen.has(t.gameType)) {
      seen.add(t.gameType)
      list.push({ id: t.gameType, name: t.gameTypeName })
    }
  })
  return list
}

// 学段筛选项
const GRADE_FILTERS = [
  { id: 'all', name: '全部学段', emoji: '🌟' },
  { id: 'primary', name: '小学', emoji: '🧒' },
  { id: 'junior', name: '初中', emoji: '👦' },
  { id: 'senior', name: '高中', emoji: '🧑' },
  { id: 'college', name: '大学', emoji: '🎓' },
]

export default function PresetTeamPage() {
  const { state, dispatch } = useContext(AppContext)
  const [filter, setFilter] = useState('all')                              // 游戏类型筛选
  const [gradeFilter, setGradeFilter] = useState(state.selectedGrade || 'all') // 学段筛选
  const [detail, setDetail] = useState(null)        // 详情面板展示的团队
  const [panelOpen, setPanelOpen] = useState(false) // 面板开关（控制滑入滑出动画）

  const gameTypes = buildGameTypes()
  const filtered = PRESET_TEAMS.filter(t => {
    // 学段过滤
    if (gradeFilter !== 'all' && t.grade !== gradeFilter) return false
    // 游戏类型过滤
    if (filter !== 'all' && t.gameType !== filter) return false
    return true
  })

  // 打开详情面板：先挂载（停在右侧），下一帧再滑入
  const openPanel = useCallback((team) => {
    setDetail(team)
    setPanelOpen(false)
    setTimeout(() => setPanelOpen(true), 24)
  }, [])

  // 关闭详情面板：先滑出，动画结束后卸载
  const closePanel = useCallback(() => {
    setPanelOpen(false)
    setTimeout(() => setDetail(null), 320)
  }, [])

  const goBack = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: STEPS.LANDING })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  // 选择此团队：写入预设团队 + 同步 agents，跳转上传
  const selectTeam = useCallback((team) => {
    dispatch({ type: 'SET_PRESET_TEAM', payload: team.id })
    dispatch({ type: 'SET_AGENTS', payload: team.agents.map(resolveId) })
    closePanel()
    dispatch({ type: 'SET_STEP', payload: STEPS.UPLOAD })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch, closePanel])

  return html`
    <div class="min-h-screen" style=${{ background: '#05010f', minHeight: '100vh' }}>
      <${NavBar} />

      <${PageContainer}>
        <!-- 顶部：返回 + 标题 -->
        <div class="flex items-center justify-between gap-4 mb-2">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold" style=${{ color: '#f5e8ff' }}>AI团队方案库</h1>
            <p class="text-sm mt-1" style=${{ color: '#8b7da8' }}>${PRESET_TEAMS.length} 套成熟团队模板，一键套用，省去手动组建 🎯</p>
          </div>
          <button class="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style=${{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(167,139,250,0.12)', color: '#8b7da8' }}
                  onClick=${goBack}>
            <span>←</span><span class="hidden sm:inline">返回</span>
          </button>
        </div>

        <!-- 市场说明条 -->
        <div class="flex items-center gap-2 mb-4 text-xs" style=${{ color: '#8b7da8' }}>
          <span style=${{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }}></span>
          <span>选择一套团队模板后，将自动进入上传教材流程</span>
        </div>

        <!-- 学段筛选栏 -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
          ${GRADE_FILTERS.map(g => html`
            <button key=${g.id}
              class="shrink-0 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all"
              style=${gradeFilter === g.id
                ? { background: '#a78bfa', color: '#fff' }
                : { background: 'rgba(255,255,255,0.03)', color: '#8b7da8', border: '1px solid rgba(167,139,250,0.12)' }}
              onClick=${() => setGradeFilter(g.id)}>
              <span>${g.emoji}</span> <span>${g.name}</span>
            </button>
          `)}
        </div>

        <!-- 游戏类型筛选栏 -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
          <button class="shrink-0 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style=${filter === 'all'
                    ? { background: '#a78bfa', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.03)', color: '#8b7da8', border: '1px solid rgba(167,139,250,0.12)' }}
                  onClick=${() => setFilter('all')}>
            🌟 全部
          </button>
          ${gameTypes.map(gt => html`
            <button key=${gt.id}
              class="shrink-0 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all"
              style=${filter === gt.id
                ? { background: '#a78bfa', color: '#fff' }
                : { background: 'rgba(255,255,255,0.03)', color: '#8b7da8', border: '1px solid rgba(167,139,250,0.12)' }}
              onClick=${() => setFilter(gt.id)}>
              ${gt.name}
            </button>
          `)}
        </div>

        <!-- 团队卡片网格 -->
        ${filtered.length === 0 ? html`
          <div class="flex flex-col items-center justify-center py-20 text-center">
            <div class="text-5xl mb-3 opacity-60">🫥</div>
            <p class="text-sm" style=${{ color: '#8b7da8' }}>该学段暂无团队模板，试试其他学段？</p>
          </div>
        ` : html`
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            ${filtered.map(team => html`
              <div key=${team.id}
                   class="rounded-xl p-5 hover:-translate-y-1 transition-all cursor-pointer"
                   style=${{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(167,139,250,0.12)' }}
                   onClick=${() => openPanel(team)}>
                <!-- 团队名 + 游戏类型 -->
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-2.5">
                    <span class="text-3xl">${team.emoji}</span>
                    <div>
                      <h3 class="font-bold leading-tight transition-colors" style=${{ color: '#f5e8ff' }}>${team.name}</h3>
                      <div class="flex items-center gap-1.5 mt-1">
                        <span class="text-[11px] px-2 py-0.5 rounded-full" style=${{ background: 'rgba(245,166,35,0.08)', color: '#F5A623' }}>${team.gameTypeName}</span>
                        <span class="text-[11px] px-2 py-0.5 rounded-full" style=${{ background: 'rgba(255,255,255,0.05)', color: '#8b7da8' }}>${team.gradeName || ''}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 角色头像 + 名称并排 -->
                <div class="flex items-end gap-2 mb-3 py-2 border-y" style=${{ borderColor: 'rgba(167,139,250,0.08)' }}>
                  ${team.agentEmojis.map((e, i) => html`
                    <div key=${i} class="flex flex-col items-center gap-1">
                      <div class="w-9 h-9 rounded-full flex items-center justify-center text-lg" style=${{ background: 'rgba(167,139,250,0.08)' }}>${e}</div>
                      <span class="text-[10px] max-w-[52px] truncate" style=${{ color: '#8b7da8' }}>${team.agentNames[i]}</span>
                    </div>
                  `)}
                </div>

                <!-- 适合场景 -->
                <p class="text-xs mb-3 line-clamp-2 leading-relaxed" style=${{ color: '#8b7da8' }}>${team.suitableFor}</p>

                <!-- 统计：评分 / 使用次数 / 预计时间 -->
                <div class="flex items-center justify-between text-xs mb-3" style=${{ color: '#5d4f7a' }}>
                  <span class="flex items-center gap-1">${renderStars(team.rating)}<b style=${{ color: '#8b7da8' }}>${team.rating.toFixed(1)}</b></span>
                  <span>🔥 ${team.uses.toLocaleString()} 次</span>
                  <span>⏱ ${team.estTime}</span>
                </div>

                <!-- 标签 -->
                <div class="flex flex-wrap gap-1.5">
                  ${team.tags.map(t => html`<span class="text-[10px] px-2 py-0.5 rounded" style=${{ background: 'rgba(255,255,255,0.05)', color: '#8b7da8' }}>#${t}</span>`)}
                </div>
              </div>
            `)}
          </div>
        `}
      <//>

      <!-- 详情面板（从右侧滑入） -->
      ${detail && html`
        <div class="fixed inset-0 z-50">
          <!-- 遮罩 -->
          <div class=${`absolute inset-0 bg-black/40 transition-opacity duration-300 ${panelOpen ? 'opacity-100' : 'opacity-0'}`}
               onClick=${closePanel}></div>
          <!-- 面板 -->
          <div class=${`absolute top-0 right-0 h-full w-full max-w-md shadow-2xl flex flex-col transition-transform duration-300 ease-out
                ${panelOpen ? 'translate-x-0' : 'translate-x-full'}`}
               style=${{ background: '#0a0420', borderLeft: '1px solid rgba(167,139,250,0.12)' }}>
            <!-- 面板头 -->
            <div class="flex items-center justify-between px-5 py-4 border-b" style=${{ borderColor: 'rgba(167,139,250,0.12)' }}>
              <div class="flex items-center gap-2.5">
                <span class="text-3xl">${detail.emoji}</span>
                <div>
                  <h2 class="font-bold leading-tight" style=${{ color: '#f5e8ff' }}>${detail.name}</h2>
                  <div class="flex items-center gap-1.5">
                    <span class="text-[11px] px-2 py-0.5 rounded-full" style=${{ background: 'rgba(245,166,35,0.08)', color: '#F5A623' }}>${detail.gameTypeName}</span>
                    <span class="text-[11px] px-2 py-0.5 rounded-full" style=${{ background: 'rgba(255,255,255,0.05)', color: '#8b7da8' }}>${detail.gradeName || ''}</span>
                  </div>
                </div>
              </div>
              <button class="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                      style=${{ color: '#8b7da8' }}
                      onClick=${closePanel}>✕</button>
            </div>

            <!-- 面板内容（可滚动） -->
            <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <!-- 完整介绍 -->
              <div>
                <h4 class="text-xs font-semibold uppercase tracking-wider mb-1.5" style=${{ color: '#5d4f7a' }}>团队介绍</h4>
                <p class="text-sm leading-relaxed" style=${{ color: '#8b7da8' }}>${detail.desc}</p>
              </div>

              <!-- 适合场景 -->
              <div>
                <h4 class="text-xs font-semibold uppercase tracking-wider mb-1.5" style=${{ color: '#5d4f7a' }}>适合场景</h4>
                <p class="text-sm" style=${{ color: '#8b7da8' }}>${detail.suitableFor}</p>
              </div>

              <!-- 角色详细能力 -->
              <div>
                <h4 class="text-xs font-semibold uppercase tracking-wider mb-2" style=${{ color: '#5d4f7a' }}>团队成员（${detail.agents.length}）</h4>
                <div class="space-y-2.5">
                  ${detail.agents.map((aid, i) => {
                    const full = agentMap[resolveId(aid)]
                    const name = detail.agentNames[i] || full?.name || aid
                    const emoji = detail.agentEmojis[i] || full?.emoji || '🤖'
                    return html`
                      <div key=${i} class="flex gap-3 p-3 rounded-xl" style=${{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(167,139,250,0.08)' }}>
                        <div class="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-xl" style=${{ background: 'rgba(255,255,255,0.05)' }}>${emoji}</div>
                        <div class="min-w-0 flex-1">
                          <div class="flex items-center gap-2">
                            <span class="font-semibold text-sm" style=${{ color: '#f5e8ff' }}>${name}</span>
                          </div>
                          <div class="text-xs mb-1" style=${{ color: '#a78bfa' }}>${full?.title || '团队成员'}</div>
                          ${full?.tagline ? html`<div class="text-xs italic mb-1.5" style=${{ color: '#5d4f7a' }}>"${full.tagline}"</div>` : null}
                          <div class="flex flex-wrap gap-1">
                            ${(full?.expertise || []).map(e => html`<span class="text-[10px] px-1.5 py-0.5 rounded" style=${{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(167,139,250,0.12)', color: '#8b7da8' }}>${e}</span>`)}
                          </div>
                        </div>
                      </div>
                    `
                  })}
                </div>
              </div>

              <!-- 标签 + 评分 -->
              <div class="flex flex-wrap items-center gap-2">
                ${detail.tags.map(t => html`<span class="text-[11px] px-2 py-0.5 rounded-full" style=${{ background: 'rgba(167,139,250,0.08)', color: '#a78bfa' }}>#${t}</span>`)}
              </div>
              <div class="flex items-center gap-4 text-xs" style=${{ color: '#5d4f7a' }}>
                <span>${renderStars(detail.rating)} <b style=${{ color: '#8b7da8' }}>${detail.rating.toFixed(1)}</b></span>
                <span>🔥 ${detail.uses.toLocaleString()} 次使用</span>
                <span>⏱ 预计 ${detail.estTime}</span>
              </div>
            </div>

            <!-- 面板底部：选择此团队 -->
            <div class="px-5 py-4 border-t" style=${{ borderColor: 'rgba(167,139,250,0.12)', background: '#0a0420' }}>
              <button class="w-full py-3 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                      style=${{ background: '#a78bfa', color: '#fff' }}
                      onClick=${() => selectTeam(detail)}>
                <span>就选这个队</span><span style=${{ color: '#F5A623' }}>· 稳住我们能赢</span>
              </button>
            </div>
          </div>
        </div>
      `}

      <${Footer} />
    </div>
  `
}
