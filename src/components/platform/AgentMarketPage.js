// 页面5：自定义团队 - 智能体市场页
// 自由挑选AI角色组队，含金量拉满，这不比博人传燃？
import { html, useContext, useCallback, useState, useEffect, useRef } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'
import { AGENTS, AGENT_CATEGORIES } from '../../data/agents.js'
import { NavBar, Footer, PageContainer, StepProgress } from './PlatformCommon.js?v=nav3'

// ── 学段筛选（全部/通用/小学/初中/高中/大学）──
const GRADE_FILTERS = [
  { id: 'all', name: '全部', emoji: '🌟' },
  { id: 'universal', name: '通用', emoji: '⚙️' },
  { id: 'primary', name: '小学', emoji: '🧒' },
  { id: 'junior', name: '初中', emoji: '👦' },
  { id: 'senior', name: '高中', emoji: '🧑' },
  { id: 'college', name: '大学', emoji: '🎓' },
]

// 学段名称
const GRADE_NAMES = {
  universal: '通用', primary: '小学', junior: '初中', senior: '高中', college: '大学'
}

// 学段徽标颜色
const GRADE_BADGE_COLORS = {
  universal: 'bg-gray-100 text-gray-500',
  primary: 'bg-green-100 text-green-600',
  junior: 'bg-blue-100 text-blue-600',
  senior: 'bg-purple-100 text-purple-600',
  college: 'bg-amber-100 text-amber-600',
}

// 根据 AGENT_CATEGORIES 动态构建角色类型列表（含"全部类型"）
function buildCategories() {
  const seen = new Set()
  const list = [{ id: 'all', name: '全部类型', emoji: '🌟' }]
  AGENTS.forEach(a => {
    if (a.category && !seen.has(a.category)) {
      seen.add(a.category)
      const cat = AGENT_CATEGORIES[a.category]
      list.push({ id: a.category, name: cat?.name || a.category, emoji: cat?.icon || '🔧' })
    }
  })
  return list
}

const MIN_AGENTS = 3
const MAX_AGENTS = 5

// 评分转 emoji 星星
function renderStars(rating) {
  const full = Math.floor(rating)
  const half = (rating - full) >= 0.5
  return html`<span class="inline-flex items-center">${'⭐'.repeat(full)}${half ? '💫' : ''}</span>`
}

// 根据角色 id 确定性地生成评分与项目数（无需手动维护 mock 表）
function generateStats(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i)
    hash |= 0
  }
  const rating = 4.3 + (Math.abs(hash) % 7) / 10
  const projects = 80 + (Math.abs(hash >> 3) % 350)
  return { rating, projects }
}

// 取角色的评分/项目数
function getStats(id) {
  return generateStats(id)
}

export default function AgentMarketPage() {
  const { state, dispatch } = useContext(AppContext)

  // 本地已选列表，初始化时与全局 state.selectedAgents 同步
  const [selected, setSelected] = useState(state.selectedAgents || [])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')        // 角色类型
  const [gradeFilter, setGradeFilter] = useState(state.selectedGrade || 'all')  // 学段（默认跟随用户选择）
  const [ratingFilter, setRatingFilter] = useState('all')  // 4星以上 / 全部
  const [detail, setDetail] = useState(null)               // 详情弹窗的角色

  // 动态构建角色类型列表（render 内每次重新计算，确保数据一致）
  const categories = buildCategories()

  // 过滤逻辑
  const filtered = AGENTS.filter(a => {
    // 学段过滤
    if (gradeFilter !== 'all' && a.grade !== gradeFilter) return false
    // 角色类型过滤（直接用 agent 自带 category）
    if (catFilter !== 'all' && a.category !== catFilter) return false
    // 评分
    if (ratingFilter === '4+' && getStats(a.id).rating < 4) return false
    // 搜索（名称 / 标题 / 专长 / 技能）
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      const hay = [a.name, a.title, a.tagline, ...(a.expertise || []), ...(a.skills || [])]
        .join(' ').toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  // 添加角色（上限 MAX_AGENTS）
  const addAgent = useCallback((agent) => {
    setSelected(prev => {
      if (prev.includes(agent.id)) return prev
      if (prev.length >= MAX_AGENTS) return prev
      const next = [...prev, agent.id]
      dispatch({ type: 'SET_AGENTS', payload: next })
      return next
    })
  }, [dispatch])

  // 移除角色
  const removeAgent = useCallback((id) => {
    setSelected(prev => {
      const next = prev.filter(x => x !== id)
      dispatch({ type: 'SET_AGENTS', payload: next })
      return next
    })
  }, [dispatch])

  const isSelected = useCallback((id) => selected.includes(id), [selected])

  const goBack = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: STEPS.MODE })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  // 确认团队：选够最少数量后跳转上传
  const confirmTeam = useCallback(() => {
    if (selected.length < MIN_AGENTS) return
    dispatch({ type: 'SET_AGENTS', payload: selected })
    dispatch({ type: 'SET_PRESET_TEAM', payload: null }) // 自定义团队，清空预设
    dispatch({ type: 'SET_STEP', payload: STEPS.UPLOAD })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selected, dispatch])

  const needMore = Math.max(0, MIN_AGENTS - selected.length)
  const canConfirm = selected.length >= MIN_AGENTS

  // 已选角色的完整对象列表
  const selectedAgents = selected.map(id => AGENTS.find(a => a.id === id)).filter(Boolean)

  return html`
    <div class="min-h-screen bg-[#FAFAFA]">
      <${NavBar} />

      <${PageContainer} className="pb-28 lg:pb-16">
        <!-- 顶部：返回 + 标题 -->
        <div class="flex items-center justify-between gap-4 mb-2">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-primary-800">智能体市场</h1>
            <p class="text-sm text-gray-400 mt-1">从 ${AGENTS.length} 个角色中挑选 ${MIN_AGENTS}-${MAX_AGENTS} 个组队，含金量拉满 🛒</p>
          </div>
          <button class="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:border-primary-300 hover:text-primary-700 transition-colors"
                  onClick=${goBack}>
            <span>←</span><span class="hidden sm:inline">返回</span>
          </button>
        </div>

        <!-- 流程进度条：步骤3/4 -->
        <${StepProgress} current=${2} total=${4} labels=${['选学科', '选模式', '组团队', '传教材']} />

        <!-- 学段筛选栏 -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
          ${GRADE_FILTERS.map(g => html`
            <button key=${g.id}
              class=${`shrink-0 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all
                ${gradeFilter === g.id ? 'bg-primary-800 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:border-primary-300'}`}
              onClick=${() => setGradeFilter(g.id)}>
              <span>${g.emoji}</span> <span>${g.name}</span>
            </button>
          `)}
        </div>

        <!-- 搜索栏 -->
        <div class="relative mb-5">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-base">🔍</span>
          <input type="text"
                 value=${search}
                 onInput=${e => setSearch(e.target.value)}
                 placeholder="搜角色名或专长，比如"知识拆解""关卡"..."
                 class="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-700 placeholder-gray-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all" />
          ${search ? html`
            <button class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 text-xs flex items-center justify-center transition-colors"
                    onClick=${() => setSearch('')}>✕</button>
          ` : null}
        </div>

        <!-- 主体：左侧筛选 + 中间网格 + 右侧购物车 -->
        <div class="flex gap-6">
          <!-- 左侧筛选（≥768px 显示为侧栏） -->
          <aside class="hidden md:block w-52 shrink-0">
            <div class="sticky top-24 space-y-5">
              <!-- 角色类型 -->
              <div>
                <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">角色类型</h4>
                <div class="space-y-1">
                  ${categories.map(c => html`
                    <button key=${c.id}
                      class=${`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left
                        ${catFilter === c.id ? 'bg-primary-800 text-white font-medium' : 'text-gray-600 hover:bg-white hover:text-primary-700'}`}
                      onClick=${() => setCatFilter(c.id)}>
                      <span>${c.emoji}</span><span>${c.name}</span>
                    </button>
                  `)}
                </div>
              </div>
              <!-- 评分 -->
              <div>
                <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">评分</h4>
                <div class="space-y-1">
                  ${[{ id: 'all', name: '全部' }, { id: '4+', name: '4星以上' }].map(r => html`
                    <button key=${r.id}
                      class=${`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left
                        ${ratingFilter === r.id ? 'bg-primary-800 text-white font-medium' : 'text-gray-600 hover:bg-white hover:text-primary-700'}`}
                      onClick=${() => setRatingFilter(r.id)}>
                      ${r.id === '4+' ? '⭐' : '🌀'}<span>${r.name}</span>
                    </button>
                  `)}
                </div>
              </div>
            </div>
          </aside>

          <!-- 中间：角色卡片网格 -->
          <main class="flex-1 min-w-0">
            <!-- 移动端筛选（<768px 折叠为下拉） -->
            <div class="md:hidden mb-4 flex items-center gap-2">
              <select value=${gradeFilter}
                      onChange=${e => setGradeFilter(e.target.value)}
                      class="px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 outline-none focus:border-primary-400">
                ${GRADE_FILTERS.map(g => html`<option key=${g.id} value=${g.id}>${g.emoji} ${g.name}</option>`)}
              </select>
              <select value=${catFilter}
                      onChange=${e => setCatFilter(e.target.value)}
                      class="flex-1 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 outline-none focus:border-primary-400">
                ${categories.map(c => html`<option key=${c.id} value=${c.id}>${c.emoji} ${c.name}</option>`)}
              </select>
              <select value=${ratingFilter}
                      onChange=${e => setRatingFilter(e.target.value)}
                      class="px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 outline-none focus:border-primary-400">
                <option value="all">全部评分</option>
                <option value="4+">4星以上</option>
              </select>
            </div>

            <!-- 结果计数 -->
            <p class="text-xs text-gray-400 mb-3">共 ${filtered.length} 个角色 · 已选 ${selected.length}/${MAX_AGENTS}</p>

            ${filtered.length === 0 ? html`
              <div class="flex flex-col items-center justify-center py-20 text-center">
                <div class="text-5xl mb-3 opacity-60">🫥</div>
                <p class="text-gray-400 text-sm">没搜到匹配的角色，换个关键词试试？</p>
              </div>
            ` : html`
              <div class="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
                ${filtered.map(agent => {
                  const stats = getStats(agent.id)
                  const sel = isSelected(agent.id)
                  const full = selected.length >= MAX_AGENTS && !sel
                  return html`
                    <div key=${agent.id}
                         class=${`bg-white rounded-xl border p-4 transition-all cursor-pointer
                           ${sel ? 'border-primary-300 ring-2 ring-primary-100' : 'border-gray-100 hover:border-primary-200 hover:shadow-md'}`}
                         onClick=${() => setDetail(agent)}>
                      <!-- 头像 + 名称 + 添加按钮 -->
                      <div class="flex items-start justify-between mb-2">
                        <div class="flex items-center gap-2.5">
                          <div class=${`w-11 h-11 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br ${agent.gradient} shadow-sm`}>${agent.emoji}</div>
                          <div class="min-w-0">
                            <h3 class="font-bold text-gray-800 text-sm leading-tight truncate">${agent.name}</h3>
                            <div class="flex items-center gap-1">
                              <span class="text-[10px] text-secondary-600 bg-secondary-50 px-1.5 py-0.5 rounded">${agent.category || '综合'}</span>
                              <span class=${`text-[10px] px-1.5 py-0.5 rounded ${GRADE_BADGE_COLORS[agent.grade] || GRADE_BADGE_COLORS.universal}`}>${GRADE_NAMES[agent.grade] || '通用'}</span>
                            </div>
                          </div>
                        </div>
                        <button class=${`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold transition-all
                              ${sel ? 'bg-green-100 text-green-600' : full ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-primary-50 text-primary-600 hover:bg-primary-800 hover:text-white'}`}
                                disabled=${full}
                                onClick=${(e) => { e.stopPropagation(); if (!full) sel ? removeAgent(agent.id) : addAgent(agent) }}
                                title=${sel ? '已添加，点击移除' : full ? '已达上限' : '添加到团队'}>
                          ${sel ? '✓' : '+'}
                        </button>
                      </div>
                      <!-- 一句话简介 -->
                      <p class="text-xs text-gray-500 mb-2 line-clamp-1">${agent.title}</p>
                      <p class="text-[11px] text-gray-400 italic mb-2.5 line-clamp-1">"${agent.tagline}"</p>
                      <!-- 专长标签 -->
                      <div class="flex flex-wrap gap-1 mb-2.5">
                        ${(agent.expertise || []).slice(0, 3).map(e => html`<span class="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">${e}</span>`)}
                      </div>
                      <!-- 评分 + 项目数 -->
                      <div class="flex items-center justify-between text-[11px] text-gray-400">
                        <span>${renderStars(stats.rating)} <b class="text-gray-500">${stats.rating.toFixed(1)}</b></span>
                        <span>📦 ${stats.projects} 个项目</span>
                      </div>
                    </div>
                  `
                })}
              </div>
            `}
          </main>

          <!-- 右侧：已选角色面板（桌面端 sticky） -->
          <aside class="hidden lg:block w-72 shrink-0">
            <div class="sticky top-24 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div class="px-4 py-3 bg-primary-800 text-white flex items-center justify-between">
                <span class="font-semibold text-sm flex items-center gap-1.5">🛒 我的团队</span>
                <span class=${`text-xs px-2 py-0.5 rounded-full ${canConfirm ? 'bg-green-400 text-white' : 'bg-white/20 text-white'}`}>${selected.length}/${MAX_AGENTS}</span>
              </div>

              <div class="p-4 space-y-2 max-h-[360px] overflow-y-auto">
                ${selectedAgents.length === 0 ? html`
                  <div class="text-center py-8">
                    <div class="text-4xl mb-2 opacity-50">🛒</div>
                    <p class="text-xs text-gray-400">还没选角色<br/>至少选 ${MIN_AGENTS} 个才能开整</p>
                  </div>
                ` : html`
                  ${selectedAgents.map(a => html`
                    <div key=${a.id} class="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 group">
                      <div class=${`w-8 h-8 rounded-full flex items-center justify-center text-base bg-gradient-to-br ${a.gradient} shrink-0`}>${a.emoji}</div>
                      <div class="min-w-0 flex-1">
                        <div class="text-xs font-medium text-gray-700 truncate">${a.name}</div>
                        <div class="text-[10px] text-gray-400 truncate">${a.title}</div>
                      </div>
                      <button class="w-6 h-6 rounded-full bg-white hover:bg-red-50 text-gray-300 hover:text-red-500 text-xs flex items-center justify-center transition-colors shrink-0"
                              onClick=${() => removeAgent(a.id)}>✕</button>
                    </div>
                  `)}
                `}
              </div>

              <!-- 确认按钮 -->
              <div class="p-4 border-t border-gray-100">
                <button class=${`w-full py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-1.5
                  ${canConfirm ? 'bg-secondary-400 hover:bg-secondary-500 text-white shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        disabled=${!canConfirm}
                        onClick=${confirmTeam}>
                  ${canConfirm ? html`<span>确认团队 · 开整！</span>` : html`<span>还需选 ${needMore} 个</span>`}
                </button>
                <p class="text-[10px] text-gray-300 text-center mt-2">最少 ${MIN_AGENTS} 个，最多 ${MAX_AGENTS} 个</p>
              </div>
            </div>
          </aside>
        </div>
      <//>

      <!-- 移动端底部已选栏（lg 以下显示） -->
      <div class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div class="flex items-center gap-3 px-4 py-3">
          <div class="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto no-scrollbar">
            ${selectedAgents.length === 0 ? html`<span class="text-xs text-gray-400">还没选角色…</span>`
              : selectedAgents.map(a => html`
                <div key=${a.id} class="shrink-0 relative">
                  <div class=${`w-8 h-8 rounded-full flex items-center justify-center text-base bg-gradient-to-br ${a.gradient}`}>${a.emoji}</div>
                  <button class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-400 text-white text-[9px] flex items-center justify-center"
                          onClick=${() => removeAgent(a.id)}>✕</button>
                </div>
              `)}
          </div>
          <button class=${`shrink-0 px-4 py-2.5 rounded-lg font-semibold text-xs transition-all
                ${canConfirm ? 'bg-secondary-400 text-white' : 'bg-gray-100 text-gray-400'}`}
                  disabled=${!canConfirm}
                  onClick=${confirmTeam}>
            ${canConfirm ? '确认团队' : `还需${needMore}个`}
          </button>
        </div>
      </div>

      <!-- 角色详情弹窗 -->
      ${detail && html`
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 animate-fade-in" onClick=${() => setDetail(null)}></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slide-up">
            <!-- 弹窗头 -->
            <div class=${`relative px-6 py-5 bg-gradient-to-br ${detail.gradient} text-white`}>
              <button class="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                      onClick=${() => setDetail(null)}>✕</button>
              <div class="flex items-center gap-3">
                <div class="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">${detail.emoji}</div>
                <div>
                  <h2 class="text-xl font-bold">${detail.name}</h2>
                  <p class="text-sm text-white/80">${detail.title}</p>
                </div>
              </div>
              <p class="mt-3 text-sm text-white/90 italic">"${detail.tagline}"</p>
            </div>

            <!-- 弹窗内容 -->
            <div class="px-6 py-5 space-y-4">
              <!-- 背景 -->
              <div>
                <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">背景故事</h4>
                <p class="text-sm text-gray-600 leading-relaxed">${detail.background}</p>
              </div>
              <!-- 专长 -->
              <div>
                <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">专长领域</h4>
                <div class="flex flex-wrap gap-1.5">
                  ${(detail.expertise || []).map(e => html`<span class="text-xs px-2 py-1 rounded-lg bg-primary-50 text-primary-600">${e}</span>`)}
                </div>
              </div>
              <!-- 技能 -->
              <div>
                <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">技能标签</h4>
                <div class="flex flex-wrap gap-1.5">
                  ${(detail.skills || []).map(s => html`<span class="text-xs px-2 py-1 rounded-lg bg-secondary-50 text-secondary-600">${s}</span>`)}
                </div>
              </div>
              <!-- 发言风格 -->
              <div>
                <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">发言风格</h4>
                <p class="text-sm text-gray-600 leading-relaxed">${detail.speakingStyle}</p>
              </div>
              <!-- 统计 -->
              <div class="flex items-center gap-4 pt-2 border-t border-gray-100 text-xs text-gray-400">
                <span>${renderStars(getStats(detail.id).rating)} <b class="text-gray-600">${getStats(detail.id).rating.toFixed(1)}</b></span>
                <span>📦 ${getStats(detail.id).projects} 个项目</span>
                <span class=${`text-[10px] px-1.5 py-0.5 rounded ${GRADE_BADGE_COLORS[detail.grade] || GRADE_BADGE_COLORS.universal}`}>${GRADE_NAMES[detail.grade] || '通用'}</span>
                <span class="text-secondary-500">${detail.category || '综合'}</span>
              </div>
            </div>

            <!-- 弹窗底部 -->
            <div class="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
              <button class="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                      onClick=${() => setDetail(null)}>关闭</button>
              <button class=${`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5
                    ${isSelected(detail.id) ? 'bg-red-50 text-red-500 hover:bg-red-100' : (selected.length >= MAX_AGENTS ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-primary-800 text-white hover:bg-primary-900')}`}
                      disabled=${selected.length >= MAX_AGENTS && !isSelected(detail.id)}
                      onClick=${() => { isSelected(detail.id) ? removeAgent(detail.id) : addAgent(detail) }}>
                ${isSelected(detail.id) ? '✓ 已选 · 点击移除' : (selected.length >= MAX_AGENTS ? '已达上限' : '+ 添加到团队')}
              </button>
            </div>
          </div>
        </div>
      `}

      <${Footer} />
    </div>
  `
}
