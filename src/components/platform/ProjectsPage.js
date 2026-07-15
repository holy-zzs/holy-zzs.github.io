// 页面10：我的游戏页
// 管理你的游戏库，含金量还在上升，这不比博人传燃？
import { html, useContext, useCallback, useState, useEffect } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js?v=ctx2'
import { NavBar, Footer, PageContainer, EmptyState, StepProgress } from './PlatformCommon.js?v=nav3'

// ── 游戏状态配置 ──
const STATUS_CONFIG = {
  discussing: { label: '生成中', cls: 'bg-secondary-100 text-secondary-400', dot: 'bg-amber-500' },
  completed:  { label: '可试玩', cls: 'bg-primary-100 text-primary-700', dot: 'bg-green-500' },
  exported:   { label: '已发布', cls: 'bg-primary-800 text-white', dot: 'bg-primary-600' },
}

const STATUS_FILTERS = [
  { id: 'all', name: '全部' },
  { id: 'discussing', name: '生成中' },
  { id: 'completed', name: '可试玩' },
  { id: 'exported', name: '已发布' },
]

const SORT_OPTIONS = [
  { id: 'new', name: '最新优先' },
  { id: 'old', name: '最早优先' },
  { id: 'hot', name: '试玩最多' },
]

// ── 游戏封面渐变（每个游戏一个调性）──
const THUMB_GRADIENTS = {
  proj1: 'linear-gradient(135deg, #6e578d, #3D2E5C)',
  proj2: 'linear-gradient(135deg, #0891B2, #22D3EE)',
  proj3: 'linear-gradient(135deg, #F472B6, #FBBF24)',
  proj4: 'linear-gradient(135deg, #7C3AED, #F59E0B)',
}
const DEFAULT_GRADIENT = 'linear-gradient(135deg, #6e578d, #3D2E5C)'

// ── Mock 游戏数据 ──
const MOCK_PROJECTS = [
  {
    id: 'proj1',
    name: '二次函数大逃杀',
    textbook: '人教版九年级数学上册',
    createdAt: '2026-07-08 14:30',
    status: 'discussing',
    gameType: '解谜闯关',
    progress: 60,
    plays: 0,
    favorites: 12,
    code: 'GA1B2',
    agents: [
      { emoji: '🎯', name: '稳住队长' },
      { emoji: '📚', name: '学神本神' },
      { emoji: '🎮', name: '脑洞工坊主' },
    ],
  },
  {
    id: 'proj2',
    name: '牛顿定律太空逃离',
    textbook: '高中物理必修第一册',
    createdAt: '2026-07-06 09:15',
    status: 'completed',
    gameType: 'RPG冒险',
    progress: 100,
    plays: 2450,
    favorites: 156,
    code: 'GB3C4',
    agents: [
      { emoji: '📚', name: '学神本神' },
      { emoji: '🎮', name: '脑洞工坊主' },
      { emoji: '🫠', name: '破防体验官' },
      { emoji: '🎨', name: '颜值正义官' },
    ],
  },
  {
    id: 'proj3',
    name: '唐诗宋词密室',
    textbook: '初中语文古诗词汇编',
    createdAt: '2026-07-03 20:00',
    status: 'exported',
    gameType: '密室逃脱',
    progress: 100,
    plays: 3890,
    favorites: 234,
    code: 'GC5D6',
    agents: [
      { emoji: '🎯', name: '稳住队长' },
      { emoji: '📚', name: '学神本神' },
      { emoji: '✍️', name: '故事编织者' },
      { emoji: '🎮', name: '脑洞工坊主' },
    ],
  },
  {
    id: 'proj4',
    name: '化学反应消消乐',
    textbook: '高中化学必修第二册',
    createdAt: '2026-07-01 11:20',
    status: 'completed',
    gameType: '卡牌策略',
    progress: 100,
    plays: 1670,
    favorites: 102,
    code: 'GD7E8',
    agents: [
      { emoji: '📚', name: '学神本神' },
      { emoji: '🎮', name: '脑洞工坊主' },
      { emoji: '⚖️', name: '平衡大师' },
    ],
  },
]

const gameUrl = (p) => `play.knowledge-game.com/g/${p.code}`
const formatCount = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n)

export default function ProjectsPage() {
  const { state, dispatch, toast } = useContext(AppContext)
  const [projects, setProjects] = useState(MOCK_PROJECTS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortMode, setSortMode] = useState('new')
  const [viewMode, setViewMode] = useState('card') // 'card' | 'list'
  const [deleteTarget, setDeleteTarget] = useState(null)

  // 如果当前有刚生成的游戏，插入到列表顶部
  useEffect(() => {
    if (state.designDoc?.config) {
      const cfg = state.designDoc.config
      const existing = projects.find(p => p.id === 'current')
      const currentProj = {
        id: 'current',
        name: cfg.theme?.name || state.designDoc.title || '新游戏',
        textbook: state.designDoc.meta?.source || '自定义教材',
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        status: 'completed',
        gameType: ({ dodge: '闪避闯关', thrust: '推进冒险', boss: 'Boss战' })[cfg.mechanics?.[0]?.type] || '知识探索',
        progress: 100,
        plays: 0,
        favorites: 0,
        code: 'GCURR',
        agents: [
          { emoji: '📚', name: '知识拆解师' },
          { emoji: '🎮', name: '关卡设计师' },
          { emoji: '🎨', name: '美术指导' },
          { emoji: '🫠', name: '体验测试员' },
        ],
        isCurrent: true,
      }
      if (!existing) {
        setProjects([currentProj, ...projects])
      } else {
        setProjects(projects.map(p => p.id === 'current' ? currentProj : p))
      }
    }
  }, [state.designDoc])

  const go = useCallback((step) => {
    dispatch({ type: 'SET_STEP', payload: step })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  // 状态计数
  const counts = {
    all: projects.length,
    discussing: projects.filter(p => p.status === 'discussing').length,
    completed: projects.filter(p => p.status === 'completed').length,
    exported: projects.filter(p => p.status === 'exported').length,
  }

  // 过滤 + 排序
  const filtered = projects
    .filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const hay = (p.name + ' ' + p.textbook + ' ' + p.gameType).toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortMode === 'hot') return b.plays - a.plays
      return sortMode === 'new'
        ? b.createdAt.localeCompare(a.createdAt)
        : a.createdAt.localeCompare(b.createdAt)
    })

  // ── 操作 ──
  const handlePlay = useCallback((p) => {
    if (p.status === 'discussing') {
      dispatch({ type: 'SET_STEP', payload: STEPS.WORKSPACE })
      toast('游戏还在生成中，先去工坊看看进度', 'info')
    } else {
      dispatch({ type: 'SET_STEP', payload: STEPS.PREVIEW })
      toast(`「${p.name}」即点即玩，开冲！`, 'success')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch, toast])

  const handleShareLink = useCallback((p) => {
    const url = 'https://' + gameUrl(p)
    const text = `快来试玩我做的游戏「${p.name}」！基于《${p.textbook}》生成的${p.gameType}游戏，点击即玩：${url} ——来自「知识不进脑子啊」`
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => toast('分享链接已复制，快发给搭子一起玩', 'success'))
        .catch(() => toast('复制失败，红温了但问题不大', 'error'))
    } else {
      toast('当前环境不支持复制，但问题不大', 'error')
    }
  }, [toast])

  const handleCopy = useCallback((p) => {
    const now = new Date()
    const pad = n => String(n).padStart(2, '0')
    const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    const copy = {
      ...p,
      id: p.id + '_copy_' + Date.now(),
      name: p.name + '（副本）',
      createdAt: stamp,
      status: 'discussing',
      progress: 0,
      plays: 0,
      favorites: 0,
      code: 'G' + Math.random().toString(36).slice(2, 6).toUpperCase(),
    }
    setProjects(prev => [copy, ...prev])
    toast('游戏已复制，含金量翻倍', 'success')
  }, [toast])

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return
    setProjects(prev => prev.filter(p => p.id !== deleteTarget.id))
    toast(`「${deleteTarget.name}」已删除，这波操作很果断`, 'info')
    setDeleteTarget(null)
  }, [deleteTarget, toast])

  return html`
    <div class="min-h-screen bg-[#FAFAFA]" style=${{ background: '#05010f', minHeight: '100vh' }}>
      <${NavBar} />
      <${PageContainer}>

        <!-- 页头 -->
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-primary-800" style=${{ color: '#f5e8ff' }}>我的游戏</h1>
            <p class="text-sm text-gray-400 mt-1" style=${{ color: '#8b7da8' }}>你的游戏库都在这，书扔进去游戏吐出来，含金量还在上升 🎮</p>
          </div>
          <button class="shrink-0 px-5 py-2.5 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2 self-start"
                  style=${{ background: 'linear-gradient(135deg, #a78bfa, #7C3AED)' }}
                  onClick=${() => go(STEPS.LANDING)}>
            <span>＋</span><span>创建新游戏</span>
          </button>
        </div>

        <!-- 搜索栏 -->
        <div class="relative mb-4">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-base">🔍</span>
          <input type="text"
                 value=${search}
                 onInput=${e => setSearch(e.target.value)}
                 placeholder="搜游戏名、教材或游戏类型…"
                 class="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-700 placeholder-gray-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all" />
          ${search ? html`
            <button class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 text-xs flex items-center justify-center transition-colors"
                    onClick=${() => setSearch('')}>✕</button>
          ` : null}
        </div>

        <!-- 筛选 + 排序 + 视图切换 -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            ${STATUS_FILTERS.map(f => html`
              <button key=${f.id}
                class=${`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${statusFilter === f.id ? 'text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:border-primary-300'}`}
                style=${statusFilter === f.id ? { background: 'linear-gradient(135deg, #a78bfa, #7C3AED)' } : null}
                onClick=${() => setStatusFilter(f.id)}>
                ${f.name}
                <span class=${`ml-1 text-xs ${statusFilter === f.id ? 'text-white/80' : 'text-gray-400'}`}>${counts[f.id] ?? 0}</span>
              </button>
            `)}
          </div>
          <div class="flex items-center gap-2">
            <select value=${sortMode}
                    onChange=${e => setSortMode(e.target.value)}
                    class="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-500 outline-none focus:border-primary-400 cursor-pointer">
              ${SORT_OPTIONS.map(s => html`<option key=${s.id} value=${s.id}>${s.name}</option>`)}
            </select>
            <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1" style=${{ background: 'rgba(255,255,255,0.04)' }}>
              <button class=${`px-2.5 py-1 rounded-md text-sm font-medium transition-all ${viewMode === 'card' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-400'}`}
                      onClick=${() => setViewMode('card')} title="卡片视图">▦</button>
              <button class=${`px-2.5 py-1 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-400'}`}
                      onClick=${() => setViewMode('list')} title="列表视图">☰</button>
            </div>
          </div>
        </div>

        <!-- 游戏列表 -->
        ${filtered.length === 0 ? html`
          <${EmptyState}
            emoji="🎮"
            title="还没有游戏，上传教材生成你的第一个游戏吧"
            desc="书扔进去，游戏吐出来，有手就行"
            actionLabel="创建新游戏"
            onAction=${() => go(STEPS.LANDING)} />
        ` : html`
          ${viewMode === 'card' ? html`
            <!-- 卡片视图 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              ${filtered.map(p => {
                const status = STATUS_CONFIG[p.status]
                const playable = p.status !== 'discussing'
                return html`
                  <div key=${p.id}
                       class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col">
                    <!-- 游戏封面缩略图 + 播放按钮 -->
                    <div class="relative h-32 flex items-center justify-center overflow-hidden"
                         style=${{ background: THUMB_GRADIENTS[p.id] || DEFAULT_GRADIENT }}>
                      <div class="text-5xl opacity-50 transition-transform duration-300 group-hover:scale-110">${p.agents[0]?.emoji || '🎮'}</div>
                      ${playable ? html`
                        <button class="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/35 transition-colors"
                                onClick=${() => handlePlay(p)}>
                          <span class="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-transform"
                                style=${{ background: 'rgba(255,255,255,0.92)', color: '#a78bfa' }}>▶</span>
                        </button>
                      ` : html`
                        <div class="absolute inset-0 flex items-center justify-center">
                          <span class="px-3 py-1 rounded-full text-xs text-white" style=${{ background: 'rgba(0,0,0,0.4)' }}>生成中…</span>
                        </div>
                      `}
                      <!-- 状态徽章 -->
                      <span class=${`absolute top-2 left-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.cls}`}>
                        <span class=${`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>${status.label}
                      </span>
                      <!-- 游戏类型徽章 -->
                      <span class="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm"
                            style=${{ background: 'rgba(245,166,35,0.16)', color: '#F5A623' }}>${p.gameType}</span>
                    </div>
                    <!-- 信息区 -->
                    <div class="p-5 flex flex-col flex-1">
                      <h3 class="font-bold text-gray-800 text-base group-hover:text-primary-700 transition-colors mb-1 truncate">${p.name}</h3>
                      <p class="text-xs text-gray-500 mb-2 flex items-center gap-1"><span>📕</span><span class="truncate">${p.textbook}</span></p>
                      <!-- 试玩 / 收藏 数据 -->
                      <div class="flex items-center gap-3 text-xs mb-3">
                        <span class="flex items-center gap-1 font-semibold" style=${{ color: '#F5A623' }}><span>▶</span>${formatCount(p.plays)} 试玩</span>
                        <span class="flex items-center gap-1 text-gray-400"><span>⭐</span>${p.favorites} 收藏</span>
                      </div>
                      <!-- AI 团队头像 -->
                      <div class="flex items-center gap-2 mb-3">
                        <span class="text-[11px] text-gray-400 shrink-0">AI团队</span>
                        <div class="flex items-center">
                          ${p.agents.map((a, i) => html`
                            <div key=${i}
                                 class="w-7 h-7 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-sm border-2 border-white shadow-sm"
                                 style=${{ marginLeft: i === 0 ? 0 : '-8px' }}
                                 title=${a.name}>${a.emoji}</div>
                          `)}
                        </div>
                      </div>
                      <!-- 进度条（生成中） -->
                      ${p.status === 'discussing' ? html`
                        <div class="mb-3">
                          <div class="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                            <span>生成进度</span><span>${p.progress}%</span>
                          </div>
                          <div class="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div class="h-full rounded-full"
                                 style=${{ width: p.progress + '%', background: 'linear-gradient(90deg, #a78bfa, #F5A623)' }}></div>
                          </div>
                        </div>
                      ` : null}
                      <!-- 游戏链接 -->
                      <div class="flex items-center gap-1 text-[11px] text-gray-400 mb-3 truncate">
                        <span>🔗</span><span class="truncate">play.knowledge-game.com/g/${p.code}</span>
                      </div>
                      <!-- 操作按钮 -->
                      <div class="flex items-center gap-2 mt-auto pt-3 border-t border-gray-50">
                        <button class="flex-1 py-2 rounded-lg text-white text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
                                style=${{ background: 'linear-gradient(135deg, #a78bfa, #7C3AED)' }}
                                onClick=${() => handlePlay(p)}>
                          ${playable ? html`<span>▶</span><span>试玩</span>` : html`<span>继续生成</span>`}
                        </button>
                        <button class="flex-1 py-2 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                                onClick=${() => handleShareLink(p)}><span>🔗</span><span>分享链接</span></button>
                        <div class="flex items-center gap-1">
                          <button class="w-8 h-8 rounded-lg bg-gray-50 hover:bg-primary-50 text-gray-400 hover:text-primary-600 flex items-center justify-center transition-colors"
                                  title="复制游戏" onClick=${() => handleCopy(p)}>📋</button>
                          <button class="w-8 h-8 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
                                  title="删除" onClick=${() => setDeleteTarget(p)}>🗑️</button>
                        </div>
                      </div>
                    </div>
                  </div>
                `
              })}
            </div>
          ` : html`
            <!-- 列表视图 -->
            <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
              ${filtered.map((p, idx) => {
                const status = STATUS_CONFIG[p.status]
                const playable = p.status !== 'discussing'
                return html`
                  <div key=${p.id}
                       class=${`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-primary-50/40 ${idx < filtered.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <!-- 小封面 -->
                    <div class="shrink-0 w-11 h-11 rounded-lg flex items-center justify-center text-xl"
                         style=${{ background: THUMB_GRADIENTS[p.id] || DEFAULT_GRADIENT }}>
                      ${p.agents[0]?.emoji || '🎮'}
                    </div>
                    <span class=${`shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${status.cls}`}>
                      <span class=${`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>${status.label}
                    </span>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <h3 class="font-semibold text-gray-800 text-sm truncate">${p.name}</h3>
                        <span class="text-[11px] px-1.5 py-0.5 rounded shrink-0" style=${{ background: 'rgba(245,166,35,0.16)', color: '#F5A623' }}>${p.gameType}</span>
                      </div>
                      <p class="text-xs text-gray-400 truncate">📕 ${p.textbook} · ▶ ${formatCount(p.plays)} 试玩 · ⭐ ${p.favorites} 收藏 · 🔗 ${gameUrl(p)}</p>
                    </div>
                    <div class="hidden sm:flex items-center">
                      ${p.agents.map((a, i) => html`
                        <div key=${i}
                             class="w-6 h-6 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-xs border-2 border-white shadow-sm"
                             style=${{ marginLeft: i === 0 ? 0 : '-6px' }}
                             title=${a.name}>${a.emoji}</div>
                      `)}
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <button class="px-2.5 py-1.5 rounded-lg text-white text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1"
                              style=${{ background: 'linear-gradient(135deg, #a78bfa, #7C3AED)' }}
                              onClick=${() => handlePlay(p)}>
                        ${playable ? '▶ 试玩' : '继续生成'}
                      </button>
                      <button class="px-2.5 py-1.5 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium hover:bg-gray-100 transition-colors"
                              onClick=${() => handleShareLink(p)}>🔗 分享</button>
                      <button class="w-7 h-7 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-600 flex items-center justify-center transition-colors"
                              title="复制" onClick=${() => handleCopy(p)}>📋</button>
                      <button class="w-7 h-7 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
                              title="删除" onClick=${() => setDeleteTarget(p)}>🗑️</button>
                    </div>
                  </div>
                `
              })}
            </div>
          `}
        `}

      <//>

      <!-- 删除确认弹窗 -->
      ${deleteTarget ? html`
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" onClick=${() => setDeleteTarget(null)}></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
               style=${{ background: '#0f0820', border: '1px solid rgba(167,139,250,0.15)' }}>
            <div class="text-4xl mb-3">🗑️</div>
            <h3 class="text-lg font-bold text-gray-800 mb-2" style=${{ color: '#f5e8ff' }}>确定要删除这个游戏吗？</h3>
            <p class="text-sm text-gray-400 mb-5" style=${{ color: '#8b7da8' }}>删除「${deleteTarget.name}」后无法恢复，这波操作不可逆哦</p>
            <div class="flex gap-3">
              <button class="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                      style=${{ borderColor: 'rgba(167,139,250,0.12)', color: '#8b7da8' }}
                      onClick=${() => setDeleteTarget(null)}>再想想</button>
              <button class="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
                      onClick=${confirmDelete}>狠心删除</button>
            </div>
          </div>
        </div>
      ` : null}

      <${Footer} />
    </div>
  `
}
