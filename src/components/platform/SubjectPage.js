// 页面2：学段学科细分页（三栏布局：学段确认 / 学科选择 / 推荐团队）
import { html, useContext, useState, useEffect, useMemo, useCallback, useRef } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'
import { NavBar, Footer, PageContainer, StepProgress, EmptyState } from './PlatformCommon.js'
import {
  SUBJECTS, QUICK_SCENES, GRADE_GUIDE, SEARCH_PLACEHOLDER,
  DEFAULT_SCENES, recommendTeams, GRADES
} from '../../data/platformData.js'

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

// 数字格式化器
const compactFmt = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
const intFmt = new Intl.NumberFormat('en-US')
const fmtCompact = (n) => compactFmt.format(n).toLowerCase() // 1240 -> 1.2k

// 减弱动效（无障碍）
const REDUCE_MOTION_CSS =
  '@media (prefers-reduced-motion: reduce){*,*::before,*::after{transition-duration:0.01ms!important;animation-duration:0.01ms!important;animation-iteration-count:1!important}}'

export default function SubjectPage() {
  const { state, dispatch } = useContext(AppContext)

  const grade = GRADES.find((g) => g.id === state.selectedGrade) || null
  const subjects = grade ? (SUBJECTS[grade.id] || []) : []

  // ── 本地状态 ──
  const [selectedSubject1, setSelectedSubject1] = useState(null)       // 一级学科对象
  const [selectedSubject2Ids, setSelectedSubject2Ids] = useState([])   // 二级学科ID数组
  const [selectedScenes, setSelectedScenes] = useState([])             // 场景标签数组
  const [searchQuery, setSearchQuery] = useState('')                   // 搜索文本
  const [searchResults, setSearchResults] = useState([])               // 搜索结果数组
  const [expandedSubject1, setExpandedSubject1] = useState(null)       // 展开的一级学科ID
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)  // 搜索下拉
  const [mobileRightOpen, setMobileRightOpen] = useState(false)        // 移动端右栏折叠

  const searchRef = useRef(null)

  // ── 跳转辅助 ──
  const goStep = useCallback((step) => {
    dispatch({ type: 'SET_STEP', payload: step })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  const goBack = useCallback(() => goStep(STEPS.LANDING), [goStep])

  const skipToUpload = useCallback(() => {
    dispatch({ type: 'SET_SUBJECT', payload: null })
    dispatch({ type: 'SET_STEP', payload: STEPS.UPLOAD })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  // ── 快捷场景：自动选最热门一级学科后跳上传教材 ──
  const onQuickScene = useCallback(() => {
    if (!subjects.length) return
    const hottest = [...subjects].sort((a, b) => b.uses - a.uses)[0]
    dispatch({ type: 'SET_SUBJECT', payload: hottest })
    dispatch({ type: 'SET_STEP', payload: STEPS.UPLOAD })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [subjects, dispatch])

  // ── 一级卡片：选中 + 展开/收起 ──
  const onSubject1Click = useCallback((subject) => {
    if (expandedSubject1 === subject.id) {
      setExpandedSubject1(null) // 收起
    } else {
      setSelectedSubject1(subject)
      setSelectedSubject2Ids([])
      setSelectedScenes([])
      setExpandedSubject1(subject.id)
    }
  }, [expandedSubject1])

  // ── 二级学科多选 ──
  const onSubject2Click = useCallback((subject2) => {
    setSelectedSubject2Ids((prev) =>
      prev.includes(subject2.id)
        ? prev.filter((id) => id !== subject2.id)
        : [...prev, subject2.id]
    )
  }, [])

  // ── 场景标签多选（最多2个）──
  const onSceneToggle = useCallback((scene) => {
    setSelectedScenes((prev) => {
      if (prev.includes(scene)) return prev.filter((s) => s !== scene)
      if (prev.length >= 2) return [prev[1], scene] // 替换最旧的
      return [...prev, scene]
    })
  }, [])

  // ── 实时搜索 ──
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) { setSearchResults([]); return }
    const results = []
    for (const s1 of subjects) {
      const s1Match =
        s1.name.toLowerCase().includes(q) ||
        s1.desc.toLowerCase().includes(q) ||
        (s1.tags || []).some((t) => t.toLowerCase().includes(q))
      if (s1Match) {
        results.push({ key: s1.id, subject1: s1, subject2: null, emoji: s1.emoji, label: s1.name, sub: s1.desc })
      }
      for (const s2 of (s1.children || [])) {
        const s2Match = s2.name.toLowerCase().includes(q) || s2.desc.toLowerCase().includes(q)
        if (s2Match) {
          results.push({ key: s1.id + '_' + s2.id, subject1: s1, subject2: s2, emoji: s2.emoji, label: s1.name + ' › ' + s2.name, sub: s2.desc })
        }
      }
      if (results.length >= 5) break
    }
    setSearchResults(results.slice(0, 5))
  }, [searchQuery, subjects])

  // 点击外部关闭搜索下拉
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults([])
    setShowSearchDropdown(false)
  }, [])

  const onSearchResultClick = useCallback((r) => {
    setSelectedSubject1(r.subject1)
    setExpandedSubject1(r.subject1.id)
    setSelectedSubject2Ids(r.subject2 ? [r.subject2.id] : [])
    setSelectedScenes([])
    setSearchQuery('')
    setShowSearchDropdown(false)
  }, [])

  // ── 过滤后的一级学科（网格展示）──
  const filteredSubjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return subjects
    return subjects.filter((s1) => {
      const s1Match =
        s1.name.toLowerCase().includes(q) ||
        s1.desc.toLowerCase().includes(q) ||
        (s1.tags || []).some((t) => t.toLowerCase().includes(q))
      const childMatch = (s1.children || []).some(
        (s2) => s2.name.toLowerCase().includes(q) || s2.desc.toLowerCase().includes(q)
      )
      return s1Match || childMatch
    })
  }, [subjects, searchQuery])

  // ── 二级学科 id -> 对象 映射 ──
  const subject2Map = useMemo(() => {
    const map = {}
    for (const s1 of subjects) for (const s2 of (s1.children || [])) map[s2.id] = s2
    return map
  }, [subjects])

  // ── 可用场景（来自已选二级学科）──
  const availableScenes = useMemo(() => {
    if (selectedSubject2Ids.length === 0) return []
    const set = new Set()
    for (const id of selectedSubject2Ids) {
      const s2 = subject2Map[id]
      if (s2) (s2.scenes || DEFAULT_SCENES).forEach((s) => set.add(s))
    }
    return Array.from(set)
  }, [selectedSubject2Ids, subject2Map])

  // 场景随二级学科变化自动清理
  useEffect(() => {
    setSelectedScenes((prev) => prev.filter((s) => availableScenes.includes(s)))
  }, [availableScenes])

  // ── 推荐团队（随选择实时更新）──
  const teams = useMemo(
    () => recommendTeams({ grade: grade?.id, subject1Id: selectedSubject1?.id, subject2Ids: selectedSubject2Ids }),
    [grade, selectedSubject1, selectedSubject2Ids]
  )

  // ── 一键使用团队 ──
  const useTeam = useCallback((team) => {
    dispatch({ type: 'SET_PRESET_TEAM', payload: team })
    dispatch({ type: 'SET_AGENTS', payload: team.agents.map(resolveId) })
    dispatch({ type: 'SET_STEP', payload: STEPS.UPLOAD })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  // ── 下一步 ──
  const onNext = useCallback(() => {
    if (!selectedSubject1) return
    dispatch({ type: 'SET_SUBJECT', payload: selectedSubject1 })
    dispatch({ type: 'SET_STEP', payload: STEPS.UPLOAD })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selectedSubject1, dispatch])

  // ── 取消选择 ──
  const clearSubject1 = useCallback(() => {
    setSelectedSubject1(null)
    setExpandedSubject1(null)
    setSelectedSubject2Ids([])
    setSelectedScenes([])
  }, [])
  const clearSubject2 = useCallback((id) => {
    setSelectedSubject2Ids((prev) => prev.filter((x) => x !== id))
  }, [])
  const clearScene = useCallback((scene) => {
    setSelectedScenes((prev) => prev.filter((s) => s !== scene))
  }, [])

  // ── 摘要路径 ──
  const summaryPath = useMemo(() => {
    const path = []
    if (grade) path.push({ emoji: grade.emoji, label: grade.name, onClear: null })
    if (selectedSubject1) path.push({ emoji: selectedSubject1.emoji, label: selectedSubject1.name, onClear: clearSubject1 })
    for (const id of selectedSubject2Ids) {
      const s2 = subject2Map[id]
      if (s2) path.push({ emoji: s2.emoji, label: s2.name, onClear: () => clearSubject2(id) })
    }
    for (const scene of selectedScenes) {
      path.push({ emoji: '🎯', label: scene, onClear: () => clearScene(scene) })
    }
    return path
  }, [grade, selectedSubject1, selectedSubject2Ids, selectedScenes, subject2Map, clearSubject1, clearSubject2, clearScene])

  // ── 下一步状态 ──
  const nextDisabled = !selectedSubject1
  const nextHalf = selectedSubject1 && selectedSubject2Ids.length === 0
  const nextFull = selectedSubject1 && selectedSubject2Ids.length > 0

  // ── 空状态：未选学段 ──
  if (!grade) {
    return html`
      <div class="min-h-screen" style=${{ background: '#05010f', minHeight: '100vh' }}>
        <${NavBar} />
        <${PageContainer}>
          <${EmptyState}
            emoji="🤔"
            title="还没选学段呢"
            desc="先回首页挑一个学段，咱们再继续组队开整"
            actionLabel="返回首页"
            onAction=${goBack} />
        <//>
        <${Footer} />
      </div>
    `
  }

  const nextBtnBase =
    'w-full rounded-xl py-3 text-sm font-bold transition-[transform,background-color,opacity] duration-300 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ' +
    (nextDisabled
      ? 'cursor-not-allowed bg-primary-900 text-gray-400'
      : nextHalf
        ? 'bg-primary-800 text-white hover:opacity-80'
        : 'bg-secondary-400 text-white shadow-lg shadow-secondary-400/30 motion-safe:hover:scale-[1.02]')
  const nextBtnLabel = nextDisabled
    ? '请先选择学科'
    : nextHalf
      ? '继续，看看推荐的团队'
      : '下一步：组建AI团队'

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
          <span class="text-gray-600">${grade.emoji} ${grade.name}</span>
          <span class="text-gray-300">›</span>
          <span class="font-semibold text-secondary-500">选择学科</span>
        </nav>

        <!-- 步骤进度 -->
        <div class="mt-3">
          <${StepProgress} current=${0} total=${4} labels=${['选学科', '传教材', '选玩法', 'AI工作室']} />
        </div>

        <!-- 移动端：快捷场景横向滚动条 -->
        <div class="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
          ${(QUICK_SCENES[grade.id] || []).map((scene) => html`
            <button key=${scene.id}
              class="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              onClick=${onQuickScene}>
              <span>${scene.emoji}</span><span>${scene.name}</span>
            </button>
          `)}
          <button class="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-gray-200 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-primary-300 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            onClick=${skipToUpload}>不限学科</button>
        </div>

        <!-- 三栏布局 -->
        <div class="mt-4 flex flex-col gap-6 md:flex-row">

          <!-- ════ 左栏 ════ -->
          <aside class="hidden md:flex md:w-56 md:shrink-0 md:flex-col md:gap-4">

            <!-- 学段确认卡片 -->
            <div class="rounded-xl bg-primary-50 p-4">
              <div class="text-3xl">${grade.emoji}</div>
              <div class="mt-1 text-xl font-bold text-primary-800">${grade.name}</div>
              <p class="mt-1 text-xs leading-relaxed text-gray-500">${GRADE_GUIDE[grade.id]}</p>
              <button class="mt-2 rounded text-xs font-medium text-primary-600 underline-offset-2 transition-colors hover:text-primary-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                onClick=${goBack}>更换学段</button>
            </div>

            <!-- 快捷场景入口 -->
            <div class="rounded-xl border border-gray-100 bg-white p-2">
              <div class="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">快捷入口</div>
              ${(QUICK_SCENES[grade.id] || []).map((scene) => html`
                <button key=${scene.id}
                  class="flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                  onClick=${onQuickScene}>
                  <span class="text-xl">${scene.emoji}</span>
                  <span class="min-w-0">
                    <span class="block truncate text-sm font-medium text-primary-800">${scene.name}</span>
                    <span class="block truncate text-[10px] text-gray-400">${scene.desc}</span>
                  </span>
                </button>
              `)}
            </div>

            <!-- 不限学科 -->
            <button class="w-full rounded-lg border border-dashed border-gray-200 px-3 py-2.5 text-xs text-gray-400 transition-colors hover:border-primary-300 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              onClick=${skipToUpload}>不限学科，直接开始</button>
          </aside>

          <!-- ════ 中栏 ════ -->
          <section class="min-w-0 flex-1">

            <!-- 搜索框 -->
            <div class="relative" ref=${searchRef}>
              <div class="relative">
                <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input
                  type="text"
                  class="w-full rounded-full border border-gray-200 bg-white py-3 pl-11 pr-10 text-sm text-gray-700 placeholder-gray-400 transition-[border-color,box-shadow] duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  placeholder=${SEARCH_PLACEHOLDER[grade.id] || '搜索学科…'}
                  value=${searchQuery}
                  onChange=${(e) => setSearchQuery(e.target.value)}
                  onFocus=${() => setShowSearchDropdown(true)} />
                ${searchQuery ? html`
                  <button class="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                    onClick=${clearSearch}>×</button>
                ` : null}
              </div>
              ${showSearchDropdown && searchResults.length > 0 ? html`
                <div class="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                  ${searchResults.map((r) => html`
                    <button key=${r.key}
                      class="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-primary-50 focus-visible:bg-primary-50 focus-visible:outline-none"
                      onClick=${() => onSearchResultClick(r)}>
                      <span class="text-lg">${r.emoji}</span>
                      <span class="min-w-0 flex-1">
                        <span class="block truncate text-sm font-medium text-primary-800">${r.label}</span>
                        <span class="block truncate text-[10px] text-gray-400">${r.sub}</span>
                      </span>
                      <span class="shrink-0 text-xs text-primary-500">选择</span>
                    </button>
                  `)}
                </div>
              ` : null}
            </div>

            <!-- 标题 -->
            <div class="mt-5 flex items-end justify-between gap-3">
              <div>
                <h2 class="text-xl font-bold text-primary-800">挑个学科细分方向</h2>
                <p class="mt-0.5 text-xs text-gray-400">选对学科，团队配置更对口，含金量还在上升</p>
              </div>
              <span class="shrink-0 text-xs text-gray-400">${filteredSubjects.length} 个方向</span>
            </div>

            <!-- 一级学科网格 -->
            ${filteredSubjects.length === 0 ? html`
              <div class="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-12 text-center">
                <div class="text-4xl opacity-50">🔍</div>
                <p class="mt-2 text-sm text-gray-400">没找到相关学科，换个关键词试试…</p>
              </div>
            ` : html`
              <div class="mt-4 grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
                ${filteredSubjects.map((subject) => {
                  const isExpanded = expandedSubject1 === subject.id
                  const isSelected = selectedSubject1?.id === subject.id
                  const hot = subject.uses > 500
                  const recommend = !hot && subject.uses > 200
                  return html`
                    <div key=${subject.id}
                      class=${`group rounded-xl border bg-white p-4 transition-[transform,box-shadow,border-color] duration-300 ${isSelected ? 'border-primary-400 ring-2 ring-primary-400' : 'border-gray-100'} ${isExpanded ? '' : 'hover:-translate-y-1 hover:shadow-lg hover:border-primary-200'}`}>
                      <button class="flex w-full items-start gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                        onClick=${() => onSubject1Click(subject)}>
                        <div class=${`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-3xl transition-transform duration-300 motion-safe:group-hover:scale-110 ${isSelected ? 'bg-primary-100' : 'bg-primary-50'}`}>${subject.emoji}</div>
                        <div class="min-w-0 flex-1">
                          <div class="flex items-center gap-1.5">
                            <h3 class="truncate text-lg font-bold text-primary-800">${subject.name}</h3>
                            ${hot ? html`<span class="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style=${{ background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>🔥 热门</span>` : null}
                            ${recommend ? html`<span class="shrink-0 rounded-full bg-secondary-50 px-1.5 py-0.5 text-[10px] font-semibold text-secondary-500">⭐ 推荐</span>` : null}
                          </div>
                          <p class="mt-0.5 truncate text-xs text-gray-400">${subject.desc}</p>
                          <div class="mt-2 flex flex-wrap gap-1">
                            ${(subject.tags || []).slice(0, 3).map((t) => html`
                              <span key=${t} class="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] text-primary-600">${t}</span>
                            `)}
                          </div>
                          <div class="mt-2 flex items-center justify-between">
                            <span class="text-[11px] text-gray-400">${fmtCompact(subject.uses)}个方案</span>
                            <span class=${`text-xs font-bold text-primary-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                          </div>
                        </div>
                      </button>

                      <!-- 二级学科展开区（max-h 过渡动画）-->
                      <div class=${`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isExpanded ? 'max-h-[640px]' : 'max-h-0'}`}>
                        <div class="mt-3 border-t border-gray-100 pt-3">
                          <div class="mb-2 text-[10px] font-medium text-gray-400">选择细分方向（可多选）</div>
                          <div class="flex flex-wrap gap-2">
                            ${(subject.children || []).map((s2) => {
                              const s2Selected = selectedSubject2Ids.includes(s2.id)
                              return html`
                                <button key=${s2.id}
                                  class=${`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left transition-[background-color,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${s2Selected ? 'border-primary-400 bg-primary-100' : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-primary-50'}`}
                                  onClick=${() => onSubject2Click(s2)}>
                                  <span class="text-sm">${s2.emoji}</span>
                                  <span class="min-w-0">
                                    <span class="block text-xs font-medium text-primary-800">${s2.name}</span>
                                    <span class="block max-w-[7rem] truncate text-[10px] text-gray-400">${s2.desc}</span>
                                  </span>
                                </button>
                              `
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  `
                })}
              </div>
            `}

            <!-- 三级场景标签（选中二级学科后显示）-->
            ${availableScenes.length > 0 ? html`
              <section class="mt-5 rounded-xl border border-primary-200 bg-secondary-50 p-4">
                <div class="mb-2 flex items-center gap-2">
                  <span class="text-sm">🎯</span>
                  <span class="text-xs font-semibold text-secondary-500">选择场景（可多选1-2个）</span>
                </div>
                <div class="flex flex-wrap gap-2">
                  ${availableScenes.map((scene) => html`
                    <button key=${scene}
                      class=${`rounded-full px-3 py-1 text-xs transition-[background-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${selectedScenes.includes(scene) ? 'border border-primary-200 bg-secondary-100 text-secondary-500' : 'border border-gray-200 bg-white text-gray-500 hover:bg-primary-50'}`}
                      onClick=${() => onSceneToggle(scene)}>${scene}</button>
                  `)}
                </div>
              </section>
            ` : null}

          </section>

          <!-- ════ 右栏 ════ -->
          <aside class="w-full md:w-72 md:shrink-0">

            <!-- 移动端折叠开关 -->
            <button class="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-bold text-primary-800 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              onClick=${() => setMobileRightOpen((v) => !v)}>
              <span>推荐团队 & 当前选择</span>
              <span class=${`text-xs text-primary-500 transition-transform duration-300 ${mobileRightOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>

            <div class=${`mt-4 flex flex-col gap-4 md:mt-0 ${mobileRightOpen ? 'block' : 'hidden md:block'}`}>

              <!-- 推荐团队预览 -->
              <div class="rounded-xl border border-gray-100 bg-white p-3">
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-xs font-bold text-primary-800">推荐团队</span>
                  <span class="text-[10px] text-gray-400">随选择实时更新</span>
                </div>
                <div class="flex flex-col gap-2">
                  ${teams.map((team) => html`
                    <div key=${team.id} class="rounded-lg border border-gray-100 bg-white p-2.5">
                      <div class="flex items-center gap-2">
                        <span class="text-lg">${team.emoji}</span>
                        <span class="text-xs font-bold text-primary-800">${team.name}</span>
                      </div>
                      <div class="mt-1.5 flex gap-1">
                        ${(team.agentEmojis || []).map((e, i) => html`
                          <span key=${i} class="flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 text-xs">${e}</span>
                        `)}
                      </div>
                      <p class="mt-1.5 text-[11px] leading-relaxed text-gray-400">${team.desc}</p>
                      <button class="mt-2 w-full rounded-lg bg-primary-800 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                        onClick=${() => useTeam(team)}>一键使用</button>
                    </div>
                  `)}
                </div>
              </div>

              <!-- 当前选择摘要 -->
              <div class="rounded-xl border border-gray-100 bg-white p-3">
                <div class="mb-2 text-xs font-bold text-primary-800">当前选择</div>
                ${selectedSubject1 ? html`
                  <div class="flex flex-wrap items-center gap-1">
                    ${summaryPath.map((p, i) => html`
                      <span key=${i} class="flex items-center gap-1">
                        ${i > 0 ? html`<span class="text-gray-300">→</span>` : null}
                        <span class="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] text-primary-700">
                          <span>${p.emoji}</span>
                          <span>${p.label}</span>
                          ${p.onClear ? html`<button class="ml-0.5 rounded-full text-gray-400 transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-400"
                            onClick=${p.onClear}>×</button>` : null}
                        </span>
                      </span>
                    `)}
                  </div>
                ` : html`<p class="text-[11px] text-gray-400">选择学科后，推荐更精准…</p>`}
              </div>

              <!-- 下一步（桌面）-->
              <button class=${nextBtnBase + ' hidden md:block'} disabled=${nextDisabled} onClick=${onNext}>
                ${nextBtnLabel}
              </button>

            </div>
          </aside>

        </div>

        <!-- 底部留白，避免被固定栏遮挡 -->
        <div class="h-24 md:h-12"></div>
      <//>

      <!-- 底部固定栏：平台数据 -->
      <div class="fixed bottom-0 left-0 right-0 z-30 h-9 border-t border-gray-100 bg-white/90 backdrop-blur">
        <div class="mx-auto flex h-full max-w-7xl items-center justify-between px-4 text-[11px] text-gray-400">
          <span class="truncate">已有 ${intFmt.format(2341)} 本教材通过本平台变成游戏 | ${intFmt.format(132)} 个AI角色 | ${intFmt.format(20)} 个预设团队</span>
          <button class="shrink-0 rounded font-medium text-primary-600 transition-colors hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            onClick=${() => goStep(STEPS.HELP)}>使用帮助</button>
        </div>
      </div>

      <!-- 移动端固定下一步按钮 -->
      <button class=${nextBtnBase + ' fixed bottom-9 left-2 right-2 z-40 shadow-lg md:hidden'} disabled=${nextDisabled} onClick=${onNext}>
        ${nextBtnLabel}
      </button>

      <${Footer} />
    </div>
  `
}
