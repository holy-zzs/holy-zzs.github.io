// 页面3：选择模式页 — 产品决策系统实现
// 三选一卡片布局 · 视觉权重引导 · 犹豫检测 · 骨架屏 · 异常降级
import { html, useContext, useState, useEffect, useCallback, useMemo, useRef } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js?v=ctx2'
import { NavBar, Footer, PageContainer, StepProgress, EmptyState } from './PlatformCommon.js?v=nav3'
import { PRESET_TEAMS, recommendTeams, COMMUNITY_PLANS, GRADES } from '../../data/platformData.js'

// ── 预设团队 agent id 别名（兼容 PRESET_TEAMS 的简写 id） ──
const AGENT_ALIAS = {
  narrator: 'narrative', balance: 'numbers',
  p01: 'scholar', p02: 'captain', p03: 'designer', p04: 'numbers', p05: 'narrative',
  m01: 'scholar', m02: 'captain', m03: 'designer', m04: 'numbers', m05: 'narrative',
  h01: 'scholar', h02: 'captain', h03: 'designer', h04: 'numbers', h05: 'narrative',
  u01: 'scholar', u02: 'captain', u03: 'designer', u04: 'numbers', u05: 'narrative',
  u06: 'art', u07: 'level', u08: 'qa', u09: 'spark', u10: 'tech', u11: 'experience',
}
const resolveId = (id) => AGENT_ALIAS[id] || id

// ── 减弱动效 ──
const REDUCE_MOTION_CSS =
  '@media (prefers-reduced-motion: reduce){*,*::before,*::after{transition-duration:0.01ms!important;animation-duration:0.01ms!important;animation-iteration-count:1!important}}'

// ── 模拟API延迟加载 ──
function useSimulatedApi(fetcher, delay = 800, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    const timer = setTimeout(() => {
      try {
        const result = fetcher()
        if (!cancelled) {
          setData(result)
          setLoading(false)
        }
      } catch (e) {
        if (!cancelled) {
          setError(true)
          setLoading(false)
        }
      }
    }, delay)
    return () => { cancelled = true; clearTimeout(timer) }
  }, deps)

  return { data, loading, error }
}

export default function ModePage() {
  const { state, dispatch } = useContext(AppContext)

  const grade = GRADES.find((g) => g.id === state.selectedGrade) || null
  const subject = state.selectedSubject || null

  // ── 本地状态 ──
  const [hesitationLevel, setHesitationLevel] = useState(0) // 0=none, 1=15s, 2=30s, 3=60s
  const [showHesitationModal, setShowHesitationModal] = useState(false)
  const [activeMobileTab, setActiveMobileTab] = useState('quick') // 移动端Tab
  const [previewingTeam, setPreviewingTeam] = useState(null)
  const pageEnterTime = useRef(Date.now())
  const hasInteracted = useRef(false)

  // ── 跳转辅助 ──
  const goStep = useCallback((step) => {
    dispatch({ type: 'SET_STEP', payload: step })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  const goBack = useCallback(() => goStep(STEPS.SUBJECT), [goStep])

  // ── 模式选择 ──
  const selectMode = useCallback((mode) => {
    hasInteracted.current = true
    dispatch({ type: 'SET_MODE', payload: mode.id })

    if (mode.id === 'quick') {
      goStep(STEPS.PRESET)
    } else if (mode.id === 'custom') {
      goStep(STEPS.GAMEPLAY)
    } else if (mode.id === 'browse') {
      goStep(STEPS.COMMUNITY)
    }
  }, [dispatch, goStep])

  // ── 预设团队推荐（路径A数据）──
  const teamsApi = useSimulatedApi(() => {
    return recommendTeams({
      grade: grade?.id,
      subject1Id: subject?.id,
      subject2Ids: []
    })
  }, 800, [grade?.id, subject?.id])

  // ── 社区热门方案（路径C数据）──
  const communityApi = useSimulatedApi(() => {
    // 模拟按学科过滤
    const gradeName = grade?.name
    const subjectName = subject?.name
    let filtered = COMMUNITY_PLANS
    if (gradeName) {
      filtered = filtered.filter(p => p.grade === gradeName || p.grade === '全平台')
    }
    if (subjectName) {
      const subjectMatch = filtered.filter(p =>
        p.subject === subjectName ||
        p.title.includes(subjectName) ||
        (subject?.tags || []).some(t => p.title.includes(t))
      )
      if (subjectMatch.length >= 3) filtered = subjectMatch
    }
    if (filtered.length < 3) {
      // 降级：返回全平台热门
      return { plans: COMMUNITY_PLANS.slice(0, 3), isFallback: true }
    }
    return { plans: filtered.slice(0, 3), isFallback: false }
  }, 1200, [grade?.id, subject?.id])

  // ── 犹豫检测（三段式渐进干预）──
  useEffect(() => {
    const timers = [
      setTimeout(() => { if (!hasInteracted.current) setHesitationLevel(1) }, 15000),
      setTimeout(() => { if (!hasInteracted.current) setHesitationLevel(2) }, 30000),
      setTimeout(() => {
        if (!hasInteracted.current) {
          setHesitationLevel(3)
          setShowHesitationModal(true)
        }
      }, 60000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const dismissHesitation = useCallback(() => {
    setShowHesitationModal(false)
    hasInteracted.current = true
  }, [])

  const acceptHesitation = useCallback(() => {
    setShowHesitationModal(false)
    hasInteracted.current = true
    selectMode({ id: 'quick', step: STEPS.PRESET })
  }, [selectMode])

  // ── 一键使用预设团队（直接跳到上传）──
  const useTeamDirectly = useCallback((team) => {
    hasInteracted.current = true
    dispatch({ type: 'SET_PRESET_TEAM', payload: team })
    dispatch({ type: 'SET_AGENTS', payload: team.agents.map(resolveId) })
    dispatch({ type: 'SET_MODE', payload: 'quick' })
    goStep(STEPS.UPLOAD)
  }, [dispatch, goStep])

  // ── 模式配置 ──
  const modes = useMemo(() => [
    {
      id: 'quick',
      title: '快速开始',
      emoji: '⚡',
      desc: 'AI 根据你的学科自动匹配最佳团队模板，一键生成游戏',
      estTime: '约 2 分钟',
      suitableFor: '想快速搞定、不想折腾的你',
      step: STEPS.PRESET,
      badge: '🔥 90%用户选择',
      badgeColor: 'bg-secondary-400 text-white',
      btnText: '一键生成 →',
      btnClass: 'bg-secondary-400 text-white hover:bg-secondary-500 shadow-lg shadow-secondary-400/30',
      cardClass: 'ring-2 ring-primary-100',
      iconBg: 'bg-secondary-50',
    },
    {
      id: 'custom',
      title: '自定义团队',
      emoji: '🎨',
      desc: '从智能体市场挑选角色组建团队，想要什么风格自己搭',
      estTime: '约 5 分钟',
      suitableFor: '对游戏有独特想法、喜欢DIY的你',
      step: STEPS.AGENTS,
      badge: '🎯 深度玩家推荐',
      badgeColor: 'bg-primary-100 text-primary-700',
      btnText: '进入智能体市场 →',
      btnClass: 'bg-primary-100 text-primary-700 hover:bg-primary-200 border border-primary-200',
      cardClass: '',
      iconBg: 'bg-primary-50',
    },
    {
      id: 'browse',
      title: '浏览推荐',
      emoji: '👀',
      desc: '看看别人怎么搭配的，一键复制热门团队配置',
      estTime: '约 1 分钟',
      suitableFor: '想先看看别人怎么玩、找灵感的你',
      step: STEPS.COMMUNITY,
      badge: '💡 灵感探索',
      badgeColor: 'bg-primary-50 text-primary-500',
      btnText: '去社区逛逛 →',
      btnClass: 'border border-primary-200 text-primary-600 hover:bg-primary-50',
      cardClass: '',
      iconBg: 'bg-primary-50',
    },
  ], [])

  // ── 空状态：未选学段 ──
  if (!grade) {
    return html`
      <div class="min-h-screen" style=${{ background: '#05010f', minHeight: '100vh' }}>
        <${NavBar} />
        <${PageContainer}>
          <${EmptyState}
            emoji="🤔"
            title="还没选学段呢"
            desc="先回首页挑一个学段，咱们再继续选模式"
            actionLabel="返回首页"
            onAction=${() => goStep(STEPS.LANDING)} />
        <//>
        <${Footer} />
      </div>
    `
  }

  // ── 路径A内容渲染 ──
  const renderPathAContent = () => {
    if (teamsApi.loading) {
      return html`
        <div class="mt-3 space-y-2">
          <div class="h-9 rounded-lg bg-primary-900 animate-pulse"></div>
          <div class="h-9 rounded-lg bg-primary-900 animate-pulse"></div>
          <div class="h-9 rounded-lg bg-primary-900 animate-pulse"></div>
        </div>
      `
    }
    if (teamsApi.error || !teamsApi.data || teamsApi.data.length === 0) {
      // 降级：通用推荐
      const fallback = PRESET_TEAMS.slice(0, 3)
      return html`
        <div class="mt-3 space-y-2">
          <div class="text-[10px] text-gray-400 mb-1">该学科暂无专属团队，为你推荐通用方案</div>
          ${fallback.map((team, i) => html`
            <div key=${team.id} class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span class="text-xs text-gray-600">${team.emoji} ${team.name}</span>
              <span class="text-xs font-bold text-secondary-500">通用推荐</span>
            </div>
          `)}
        </div>
      `
    }
    return html`
      <div class="mt-3 space-y-2">
        ${teamsApi.data.map((team, i) => {
          const matchScore = 95 - i * 7
          return html`
            <button key=${team.id}
              class="flex w-full items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-left transition-colors hover:bg-secondary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400"
              onClick=${() => useTeamDirectly(team)}>
              <span class="text-xs text-gray-600">${team.emoji} ${team.name}</span>
              <span class="text-xs font-bold text-secondary-500">匹配度 ${matchScore}%</span>
            </button>
          `
        })}
      </div>
    `
  }

  // ── 路径B内容渲染 ──
  const renderPathBContent = () => {
    const agentCount = 12
    const gameTypes = ['解谜闯关', '叙事选择', '卡牌策略', '模拟实验', '音乐节奏']
    return html`
      <div class="mt-3 space-y-2">
        <div class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
          <span class="text-xs text-gray-600">🤖 可选角色</span>
          <span class="text-xs font-bold text-primary-600">${agentCount} 个全开放</span>
        </div>
        <div class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
          <span class="text-xs text-gray-600">🎮 游戏类型</span>
          <span class="text-xs font-bold text-primary-600">${gameTypes.length} 种自由选</span>
        </div>
        <div class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
          <span class="text-xs text-gray-600">⚙️ 预设可修改</span>
          <span class="text-xs font-bold text-primary-600">不锁死</span>
        </div>
      </div>
    `
  }

  // ── 路径C内容渲染 ──
  const renderPathCContent = () => {
    if (communityApi.loading) {
      return html`
        <div class="mt-3 space-y-2">
          <div class="h-9 rounded-lg bg-primary-900 animate-pulse"></div>
          <div class="h-9 rounded-lg bg-primary-900 animate-pulse"></div>
          <div class="h-9 rounded-lg bg-primary-900 animate-pulse"></div>
        </div>
      `
    }
    if (communityApi.error || !communityApi.data) {
      return html`
        <div class="mt-3 rounded-lg bg-gray-50 px-3 py-3 text-center">
          <div class="text-lg mb-1">⏳</div>
          <div class="text-xs text-gray-400">正在为你搜寻优质方案…</div>
        </div>
      `
    }
    const { plans, isFallback } = communityApi.data
    if (!plans || plans.length === 0) {
      return html`
        <div class="mt-3 rounded-lg bg-gray-50 px-3 py-3 text-center">
          <div class="text-xs text-gray-400">社区方案正在生长中，敬请期待</div>
        </div>
      `
    }
    return html`
      <div class="mt-3 space-y-2">
        ${isFallback && html`
          <div class="text-[10px] text-gray-400 mb-1">该学科暂无方案，推荐全平台精选</div>
        `}
        ${plans.map((plan) => html`
          <div key=${plan.id} class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
            <span class="truncate text-xs text-gray-600">${plan.emoji} ${plan.title}</span>
            <span class="shrink-0 text-xs font-bold text-secondary-500">★${plan.rating}</span>
          </div>
        `)}
      </div>
    `
  }

  // ── 单个卡片渲染 ──
  const renderCard = (mode, index) => {
    const isQuick = mode.id === 'quick'
    const content = isQuick ? renderPathAContent() : mode.id === 'custom' ? renderPathBContent() : renderPathCContent()
    const gridSpan = isQuick ? 'lg:col-span-1 lg:scale-[1.03]' : ''

    return html`
      <button key=${mode.id}
        class=${`group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary-400 ${mode.cardClass} ${gridSpan}`}
        onClick=${() => selectMode(mode)}>
        <div class="absolute inset-x-0 top-0 h-1.5" style=${{ background: isQuick ? 'linear-gradient(90deg, #F5A623, #fbbf24)' : mode.id === 'custom' ? 'linear-gradient(90deg, #a78bfa, #c4b5fd)' : 'linear-gradient(90deg, #6e578d, #a78bfa)' }}></div>
        <span class=${`absolute right-4 top-4 rounded-full px-2 py-0.5 text-[10px] font-bold ${mode.badgeColor}`}>${mode.badge}</span>
        <div class=${`inline-flex h-14 w-14 items-center justify-center rounded-xl ${mode.iconBg} text-3xl transition-transform group-hover:scale-110`}>${mode.emoji}</div>
        <h3 class="mt-4 text-xl font-bold text-primary-800">${mode.title}</h3>
        <p class="mt-2 text-sm leading-relaxed text-gray-400">${mode.desc}</p>
        ${content}
        <div class="mt-4 flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-500">⏱️ ${mode.estTime}</span>
        </div>
        <div class="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
          <span class="text-xs text-gray-300">${mode.suitableFor}</span>
        </div>
        <div class=${`mt-3 rounded-xl py-2.5 text-center text-sm font-bold transition-all ${mode.btnClass}`}>${mode.btnText}</div>
      </button>
    `
  }

  return html`
    <div class="min-h-screen" style=${{ background: '#05010f', minHeight: '100vh' }}>
      <style>${REDUCE_MOTION_CSS}</style>
      <${NavBar} />
      <${PageContainer}>

        <!-- 面包屑 -->
        <nav class="flex items-center gap-1.5 text-xs text-gray-400">
          <button class="rounded transition-colors hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            onClick=${() => goStep(STEPS.LANDING)}>首页</button>
          <span class="text-gray-300">›</span>
          <button class="rounded transition-colors hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            onClick=${goBack}>${grade.emoji} ${grade.name}${subject ? ' · ' + subject.name : ''}</button>
          <span class="text-gray-300">›</span>
          <span class="font-semibold text-secondary-500">选择模式</span>
        </nav>

        <!-- 步骤进度 -->
        <div class="mt-3">
          <${StepProgress} current=${1} total=${4} labels=${['选学科', '选模式', '组团队', '传教材']} />
        </div>

        <!-- 返回链接 -->
        <div class="flex items-center gap-3">
          <button class="mt-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            onClick=${goBack}>
            ← 返回学科选择
          </button>
          <button class="mt-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-secondary-500 transition-colors hover:bg-primary-50"
            onClick=${() => { dispatch({ type: 'SET_STEP', payload: STEPS.PROTOCOL }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            🧬 查看映射协议演示
          </button>
        </div>

        <!-- 标题 -->
        <section class="mt-4 text-center">
          <h1 class="text-3xl font-black text-primary-800">选个姿势开局</h1>
          <p class="mt-2 text-gray-400">三种模式总有一款适合你，主打一个灵活</p>
        </section>

        <!-- 犹豫引导气泡（15秒触发） -->
        ${hesitationLevel >= 1 && !showHesitationModal ? html`
          <div class="mt-4 mx-auto max-w-md rounded-xl border border-primary-200 bg-secondary-50 px-4 py-3 text-center animate-fadeIn">
            <span class="text-sm text-secondary-500">💡 纠结选哪个？试试<span class="font-bold">快速开始</span>，30秒搞定 →</span>
          </div>
        ` : null}

        <!-- 犹豫高亮（30秒触发） -->
        ${hesitationLevel >= 2 && !showHesitationModal ? html`
          <div class="mt-2 mx-auto max-w-md text-center">
            <span class="inline-block animate-bounce rounded-lg bg-secondary-400 px-3 py-1 text-xs font-bold text-white">帮你选好了 ↑</span>
          </div>
        ` : null}

        <!-- ════ 桌面端：三列卡片 ════ -->
        <section class="mt-6 hidden md:grid md:grid-cols-3 md:gap-5 lg:gap-6">
          ${modes.map((mode, i) => renderCard(mode, i))}
        </section>

        <!-- ════ 移动端：Tab切换 ════ -->
        <section class="mt-6 md:hidden">
          <!-- Tab栏 -->
          <div class="flex gap-1 rounded-xl bg-primary-900 p-1">
            ${modes.map((mode) => html`
              <button key=${mode.id}
                class=${`flex-1 rounded-lg py-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400 ${
                  activeMobileTab === mode.id
                    ? mode.id === 'quick' ? 'bg-secondary-400 text-white shadow'
                      : mode.id === 'custom' ? 'bg-primary-800 text-white shadow'
                      : 'bg-primary-800 text-white shadow'
                    : 'text-gray-500'
                }`}
                onClick=${() => setActiveMobileTab(mode.id)}>
                ${mode.emoji} ${mode.title}
              </button>
            `)}
          </div>
          <!-- Tab内容 -->
          <div class="mt-4">
            ${modes.filter(m => m.id === activeMobileTab).map(mode => renderCard(mode, 0))}
          </div>
        </section>

        <!-- 步骤进度（底部） -->
        <div class="mt-10">
          <${StepProgress} current=${1} total=${4} labels=${['选学科', '选模式', '组团队', '传教材']} />
        </div>

      <//>

      ${showHesitationModal ? html`
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div class="mx-4 max-w-sm rounded-2xl p-6 text-center shadow-2xl animate-fadeIn" style=${{ background: 'rgba(20,10,53,0.95)', border: '1px solid rgba(167,139,250,0.15)' }}>
            <div class="text-4xl mb-3">🤔</div>
            <h3 class="text-lg font-bold text-primary-800">看起来你在犹豫</h3>
            <p class="mt-2 text-sm text-gray-400">没关系，我们帮你选了最省时的方案。<br/>快速开始，30秒就能看到AI为你推荐的团队。</p>
            <div class="mt-5 flex gap-3">
              <button class="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                onClick=${dismissHesitation}>
                再看看
              </button>
              <button class="flex-1 rounded-xl bg-secondary-400 py-2.5 text-sm font-bold text-white transition-colors hover:bg-secondary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400"
                onClick=${acceptHesitation}>
                试试快速开始
              </button>
            </div>
          </div>
        </div>
      ` : null}

      <${Footer} />
    </div>
  `
}
