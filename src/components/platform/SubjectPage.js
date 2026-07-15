// 页面2：学段学科细分页（三栏布局：学段确认 / 学科选择 / 推荐团队）
// v2: 深空暗色主题 + 放大字体 + 引导提示 + 清晰按钮 — 2026-07-16 重设计
import { html, useContext, useState, useEffect, useMemo, useCallback, useRef } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'
import { NavBar, Footer, PageContainer, StepProgress, EmptyState } from './PlatformCommon.js?v=nav3'
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
const fmtCompact = (n) => compactFmt.format(n).toLowerCase()

// ── 深空色板（与平台统一）──
const C = {
  bg: '#05010f',
  bgRadial: 'radial-gradient(ellipse at 50% 80%, #1e0f4d 0%, #0a0420 40%, #05010f 100%)',
  surface: 'rgba(255,255,255,0.03)',
  surfaceHover: 'rgba(255,255,255,0.06)',
  surfaceActive: 'rgba(167,139,250,0.08)',
  text: '#f5e8ff',
  textMuted: '#8b7da8',
  textDim: '#5d4f7a',
  border: 'rgba(167,139,250,0.12)',
  borderBright: 'rgba(167,139,250,0.25)',
  borderActive: 'rgba(167,139,250,0.4)',
  primary: '#a78bfa',
  primaryDark: '#7c3aed',
  accent: '#F5A623',
  accentLight: '#fbbf24',
  green: '#4ade80',
  pink: '#f472b6',
  red: '#f87171',
}

// ── 页面 CSS ──
const PAGE_CSS = `
@keyframes spFadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
@keyframes spPulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
@keyframes spBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
.sp-card-enter{ animation: spFadeIn 0.4s ease-out backwards; }
.sp-pulse{ animation: spPulse 2s ease-in-out infinite; }
.sp-bounce{ animation: spBounce 1.5s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce){
  .sp-card-enter,.sp-pulse,.sp-bounce{ animation: none !important; }
  *,*::before,*::after{ transition-duration:0.01ms!important; animation-duration:0.01ms!important; }
}
.sp-card{ transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; }
.sp-card:hover{ transform: translateY(-3px); }
.sp-subject-btn{ transition: background 0.2s ease, border-color 0.2s ease; }
.sp-subject-btn:hover{ background: ${C.surfaceHover}; }
.sp-tag{ transition: background 0.2s ease, color 0.2s ease; }
.sp-cta{ transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease; }
.sp-cta:not(:disabled):hover{ transform: scale(1.02); }
.sp-cta:not(:disabled):active{ transform: scale(0.98); }
`

export default function SubjectPage() {
  const { state, dispatch } = useContext(AppContext)

  const grade = GRADES.find((g) => g.id === state.selectedGrade) || null
  const subjects = grade ? (SUBJECTS[grade.id] || []) : []

  // ── 本地状态 ──
  const [selectedSubject1, setSelectedSubject1] = useState(null)
  const [selectedSubject2Ids, setSelectedSubject2Ids] = useState([])
  const [selectedScenes, setSelectedScenes] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [expandedSubject1, setExpandedSubject1] = useState(null)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [mobileRightOpen, setMobileRightOpen] = useState(false)

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
      setExpandedSubject1(null)
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
      if (prev.length >= 2) return [prev[1], scene]
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
      <div class="min-h-screen" style=${{ background: C.bg, minHeight: '100vh' }}>
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

  // ── 下一步按钮样式 ──
  const nextBtnStyle = {
    width: '100%',
    borderRadius: '14px',
    padding: '14px 20px',
    fontSize: '16px',
    fontWeight: 700,
    transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.2s',
    cursor: nextDisabled ? 'not-allowed' : 'pointer',
    ...(nextDisabled
      ? { background: 'rgba(167,139,250,0.08)', color: C.textDim, border: `1px solid ${C.border}` }
      : nextHalf
        ? { background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`, color: '#fff', boxShadow: `0 4px 20px ${C.primary}40` }
        : { background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`, color: '#1a0a00', boxShadow: `0 4px 24px ${C.accent}40` })
  }
  const nextBtnLabel = nextDisabled
    ? '👆 请先选择一个学科方向'
    : nextHalf
      ? '继续，看看推荐的团队'
      : '下一步：上传教材 →'

  return html`
    <div class="min-h-screen" style=${{ background: C.bg, minHeight: '100vh' }}>
      <style>${PAGE_CSS}</style>
      <${NavBar} />
      <${PageContainer}>

        <!-- 面包屑 -->
        <nav class="flex items-center gap-2" style=${{ fontSize: '14px', color: C.textMuted }}>
          <button style=${{ color: C.textMuted, transition: 'color 0.2s', cursor: 'pointer', background: 'none', border: 'none' }}
            onMouseEnter=${(e) => e.target.style.color = C.primary}
            onMouseLeave=${(e) => e.target.style.color = C.textMuted}
            onClick=${() => goStep(STEPS.LANDING)}>首页</button>
          <span style=${{ color: C.textDim }}>›</span>
          <span style=${{ color: C.textDim }}>${grade.emoji} ${grade.name}</span>
          <span style=${{ color: C.textDim }}>›</span>
          <span style=${{ color: C.primary, fontWeight: 600 }}>选择学科</span>
        </nav>

        <!-- 步骤进度 -->
        <div style=${{ marginTop: '12px' }}>
          <${StepProgress} current=${0} total=${4} labels=${['选学科', '传教材', '选玩法', 'AI工作室']} />
        </div>

        <!-- 引导横幅：深空配图 + 标题 + 引导文案 -->
        <div style=${{
          marginTop: '20px',
          borderRadius: '20px',
          overflow: 'hidden',
          position: 'relative',
          border: `1px solid ${C.border}`,
        }}>
          <div style=${{
            position: 'absolute', inset: 0,
            backgroundImage: 'url(/assets/illustrations/subject-cosmic.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.35,
          }}></div>
          <div style=${{
            position: 'relative',
            padding: '28px 32px',
            background: 'linear-gradient(90deg, rgba(5,1,15,0.92) 0%, rgba(5,1,15,0.7) 60%, rgba(5,1,15,0.4) 100%)',
          }}>
            <div style=${{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style=${{ fontSize: '32px' }}>${grade.emoji}</span>
              <div>
                <h1 style=${{ fontSize: '24px', fontWeight: 800, color: C.text, margin: 0 }}>
                  ${grade.name} · 选择学科方向
                </h1>
                <p style=${{ fontSize: '15px', color: C.textMuted, margin: '4px 0 0 0' }}>
                  ${GRADE_GUIDE[grade.id] || '选对学科，AI团队配置更精准'}
                </p>
              </div>
            </div>
            <!-- 引导提示 -->
            <div style=${{
              marginTop: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '12px',
              background: 'rgba(167,139,250,0.08)',
              border: `1px solid ${C.border}`,
              fontSize: '14px',
              color: C.text,
            }}>
              <span class="sp-bounce" style=${{ fontSize: '16px' }}>👇</span>
              <span>点击下方学科卡片选择方向，也可以在右侧直接使用推荐团队</span>
            </div>
          </div>
        </div>

        <!-- 移动端：快捷场景横向滚动条 -->
        <div class="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
          ${(QUICK_SCENES[grade.id] || []).map((scene) => html`
            <button key=${scene.id}
              style=${{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px',
                borderRadius: '20px', padding: '8px 14px',
                fontSize: '14px', fontWeight: 500,
                border: `1px solid ${C.border}`,
                background: C.surface, color: C.primary,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
              onClick=${onQuickScene}>
              <span>${scene.emoji}</span><span>${scene.name}</span>
            </button>
          `)}
          <button style=${{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px',
              borderRadius: '20px', padding: '8px 14px',
              fontSize: '14px', border: `1px dashed ${C.borderBright}`,
              background: 'transparent', color: C.textMuted, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
            onClick=${skipToUpload}>⏭️ 跳过选科</button>
        </div>

        <!-- 三栏布局 -->
        <div class="mt-5 flex flex-col gap-5 md:flex-row">

          <!-- ════ 左栏 ════ -->
          <aside class="hidden md:flex md:w-52 md:shrink-0 md:flex-col md:gap-4">

            <!-- 学段确认卡片 -->
            <div style=${{
              borderRadius: '16px', padding: '18px',
              background: C.surface, border: `1px solid ${C.border}`,
            }}>
              <div style=${{ fontSize: '36px' }}>${grade.emoji}</div>
              <div style=${{ marginTop: '6px', fontSize: '22px', fontWeight: 800, color: C.text }}>
                ${grade.name}
              </div>
              <p style=${{ marginTop: '6px', fontSize: '14px', lineHeight: 1.6, color: C.textMuted }}>
                ${GRADE_GUIDE[grade.id]}
              </p>
              <button style=${{
                marginTop: '10px', fontSize: '14px', fontWeight: 500,
                color: C.primary, background: 'none', border: 'none',
                cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px',
              }}
                onMouseEnter=${(e) => e.target.style.color = C.accentLight}
                onMouseLeave=${(e) => e.target.style.color = C.primary}
                onClick=${goBack}>更换学段</button>
            </div>

            <!-- 快捷入口 -->
            <div style=${{
              borderRadius: '16px', padding: '8px',
              background: C.surface, border: `1px solid ${C.border}`,
            }}>
              <div style=${{ padding: '8px 10px', fontSize: '13px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                快捷入口
              </div>
              ${(QUICK_SCENES[grade.id] || []).map((scene) => html`
                <button key=${scene.id}
                  class="sp-subject-btn"
                  style=${{
                    display: 'flex', width: '100%', alignItems: 'center', gap: '10px',
                    borderRadius: '10px', padding: '10px', textAlign: 'left',
                    border: 'none', background: 'transparent', cursor: 'pointer',
                  }}
                  onClick=${onQuickScene}>
                  <span style=${{ fontSize: '24px' }}>${scene.emoji}</span>
                  <span style=${{ minWidth: 0, flex: 1 }}>
                    <span style=${{ display: 'block', fontSize: '15px', fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>${scene.name}</span>
                    <span style=${{ display: 'block', fontSize: '13px', color: C.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>${scene.desc}</span>
                  </span>
                </button>
              `)}
            </div>

            <!-- 跳过选科 -->
            <button style=${{
              width: '100%', borderRadius: '12px', padding: '14px',
              fontSize: '15px', fontWeight: 500,
              border: `1px dashed ${C.borderBright}`,
              background: 'transparent', color: C.textMuted,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter=${(e) => {
              e.target.style.borderColor = C.primary
              e.target.style.color = C.primary
              e.target.style.background = C.surfaceActive
            }}
            onMouseLeave=${(e) => {
              e.target.style.borderColor = C.borderBright
              e.target.style.color = C.textMuted
              e.target.style.background = 'transparent'
            }}
            onClick=${skipToUpload}>
              ⏭️ 跳过选科，直接上传教材
            </button>
          </aside>

          <!-- ════ 中栏 ════ -->
          <section class="min-w-0 flex-1">

            <!-- 搜索框 -->
            <div class="relative" ref=${searchRef}>
              <div class="relative">
                <span style=${{
                  position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '18px', pointerEvents: 'none',
                }}>🔍</span>
                <input
                  type="text"
                  style=${{
                    width: '100%', borderRadius: '14px',
                    border: `1px solid ${C.border}`,
                    background: C.surface, color: C.text,
                    padding: '14px 44px 14px 46px', fontSize: '15px',
                    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  placeholder=${SEARCH_PLACEHOLDER[grade.id] || '搜索学科…'}
                  value=${searchQuery}
                  onChange=${(e) => setSearchQuery(e.target.value)}
                  onFocus=${(e) => {
                    setShowSearchDropdown(true)
                    e.target.style.borderColor = C.primary
                    e.target.style.boxShadow = `0 0 0 3px ${C.primary}20`
                  }}
                  onBlur=${(e) => {
                    e.target.style.borderColor = C.border
                    e.target.style.boxShadow = 'none'
                  }} />
                ${searchQuery ? html`
                  <button style=${{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%', border: 'none', background: 'transparent',
                    color: C.textMuted, cursor: 'pointer', fontSize: '18px',
                  }}
                  onMouseEnter=${(e) => { e.target.style.background = C.surfaceHover; e.target.style.color = C.text }}
                  onMouseLeave=${(e) => { e.target.style.background = 'transparent'; e.target.style.color = C.textMuted }}
                    onClick=${clearSearch}>×</button>
                ` : null}
              </div>
              ${showSearchDropdown && searchResults.length > 0 ? html`
                <div style=${{
                  position: 'absolute', left: 0, right: 0, zIndex: 20, marginTop: '4px',
                  borderRadius: '14px', overflow: 'hidden',
                  border: `1px solid ${C.border}`, background: '#0a0420',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}>
                  ${searchResults.map((r) => html`
                    <button key=${r.key}
                      style=${{
                        display: 'flex', width: '100%', alignItems: 'center', gap: '12px',
                        padding: '12px 16px', textAlign: 'left',
                        border: 'none', background: 'transparent', cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter=${(e) => e.target.style.background = C.surfaceActive}
                      onMouseLeave=${(e) => e.target.style.background = 'transparent'}
                      onClick=${() => onSearchResultClick(r)}>
                      <span style=${{ fontSize: '20px' }}>${r.emoji}</span>
                      <span style=${{ minWidth: 0, flex: 1 }}>
                        <span style=${{ display: 'block', fontSize: '15px', fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>${r.label}</span>
                        <span style=${{ display: 'block', fontSize: '13px', color: C.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>${r.sub}</span>
                      </span>
                      <span style=${{ fontSize: '14px', color: C.primary, flexShrink: 0 }}>选择</span>
                    </button>
                  `)}
                </div>
              ` : null}
            </div>

            <!-- 标题 + 引导 -->
            <div style=${{ marginTop: '24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <h2 style=${{ fontSize: '22px', fontWeight: 800, color: C.text, margin: 0 }}>
                  挑个学科细分方向
                </h2>
                <p style=${{ marginTop: '6px', fontSize: '15px', color: C.textMuted, margin: '6px 0 0 0' }}>
                  选对学科，团队配置更对口 · 也可以跳过直接上传
                </p>
              </div>
              <span style=${{ flexShrink: 0, fontSize: '14px', color: C.textDim }}>
                ${filteredSubjects.length} 个方向
              </span>
            </div>

            <!-- 一级学科网格（2列，更大卡片） -->
            ${filteredSubjects.length === 0 ? html`
              <div style=${{
                marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                borderRadius: '16px', border: `1px dashed ${C.border}`, padding: '48px 24px', textAlign: 'center',
              }}>
                <div style=${{ fontSize: '48px', opacity: 0.4 }}>🔍</div>
                <p style=${{ marginTop: '12px', fontSize: '16px', color: C.textMuted }}>没找到相关学科，换个关键词试试…</p>
              </div>
            ` : html`
              <div class="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
                ${filteredSubjects.map((subject, idx) => {
                  const isExpanded = expandedSubject1 === subject.id
                  const isSelected = selectedSubject1?.id === subject.id
                  const hot = subject.uses > 800
                  const recommend = !hot && subject.uses > 400
                  return html`
                    <div key=${subject.id}
                      class="sp-card sp-card-enter"
                      style=${{
                        borderRadius: '16px', padding: '20px',
                        border: `1px solid ${isSelected ? C.borderActive : C.border}`,
                        background: isSelected ? C.surfaceActive : C.surface,
                        boxShadow: isSelected ? `0 0 0 2px ${C.primary}40` : 'none',
                        animationDelay: `${idx * 60}ms`,
                      }}>
                      <button style=${{
                        display: 'flex', width: '100%', alignItems: 'flex-start', gap: '14px',
                        borderRadius: '10px', textAlign: 'left', border: 'none',
                        background: 'transparent', cursor: 'pointer',
                      }}
                        onClick=${() => onSubject1Click(subject)}>
                        <div style=${{
                          flexShrink: 0, width: '56px', height: '56px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: '14px', fontSize: '32px',
                          background: isSelected ? C.surfaceActive : 'rgba(167,139,250,0.06)',
                          border: `1px solid ${C.border}`,
                        }}>${subject.emoji}</div>
                        <div style=${{ minWidth: 0, flex: 1 }}>
                          <div style=${{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h3 style=${{
                              fontSize: '20px', fontWeight: 800, color: C.text,
                              margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>${subject.name}</h3>
                            ${hot ? html`<span style=${{
                              flexShrink: 0, borderRadius: '6px', padding: '2px 8px',
                              fontSize: '12px', fontWeight: 700,
                              background: 'rgba(248,113,113,0.15)', color: C.red,
                            }}>🔥 热门</span>` : null}
                            ${recommend ? html`<span style=${{
                              flexShrink: 0, borderRadius: '6px', padding: '2px 8px',
                              fontSize: '12px', fontWeight: 700,
                              background: 'rgba(245,166,35,0.12)', color: C.accentLight,
                            }}>⭐ 推荐</span>` : null}
                          </div>
                          <p style=${{
                            marginTop: '4px', fontSize: '14px', color: C.textMuted,
                            margin: '4px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>${subject.desc}</p>
                          <div style=${{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            ${(subject.tags || []).slice(0, 3).map((t) => html`
                              <span key=${t} class="sp-tag" style=${{
                                borderRadius: '8px', padding: '4px 10px',
                                fontSize: '13px', fontWeight: 500,
                                background: 'rgba(167,139,250,0.08)', color: C.primary,
                              }}>${t}</span>
                            `)}
                          </div>
                          <div style=${{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style=${{ fontSize: '14px', color: C.textDim }}>${fmtCompact(subject.uses)} 个方案</span>
                            <span style=${{
                              fontSize: '16px', fontWeight: 700, color: C.primary,
                              transform: isExpanded ? 'rotate(180deg)' : 'none',
                              transition: 'transform 0.3s',
                            }}>▾</span>
                          </div>
                        </div>
                      </button>

                      <!-- 二级学科展开区 -->
                      <div style=${{
                        overflow: 'hidden',
                        maxHeight: isExpanded ? '640px' : '0',
                        transition: 'max-height 0.3s ease-in-out',
                      }}>
                        <div style=${{ marginTop: '12px', paddingTop: '14px', borderTop: `1px solid ${C.border}` }}>
                          <div style=${{ marginBottom: '10px', fontSize: '14px', fontWeight: 600, color: C.textMuted }}>
                            选择细分方向（可多选）
                          </div>
                          <div style=${{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            ${(subject.children || []).map((s2) => {
                              const s2Selected = selectedSubject2Ids.includes(s2.id)
                              return html`
                                <button key=${s2.id}
                                  style=${{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    borderRadius: '10px', padding: '10px 14px', textAlign: 'left',
                                    border: `1px solid ${s2Selected ? C.borderActive : C.border}`,
                                    background: s2Selected ? C.surfaceActive : 'transparent',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                  }}
                                  onMouseEnter=${(e) => { if (!s2Selected) e.currentTarget.style.background = C.surfaceHover }}
                                  onMouseLeave=${(e) => { if (!s2Selected) e.currentTarget.style.background = 'transparent' }}
                                  onClick=${() => onSubject2Click(s2)}>
                                  <span style=${{ fontSize: '18px' }}>${s2.emoji}</span>
                                  <span style=${{ minWidth: 0 }}>
                                    <span style=${{ display: 'block', fontSize: '15px', fontWeight: 600, color: C.text }}>${s2.name}</span>
                                    <span style=${{ display: 'block', fontSize: '13px', color: C.textDim, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>${s2.desc}</span>
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
              <section style=${{
                marginTop: '20px', borderRadius: '16px', padding: '18px',
                background: 'rgba(245,166,35,0.06)', border: `1px solid rgba(245,166,35,0.15)`,
              }}>
                <div style=${{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style=${{ fontSize: '18px' }}>🎯</span>
                  <span style=${{ fontSize: '16px', fontWeight: 700, color: C.accentLight }}>选择场景（可多选 1-2 个）</span>
                </div>
                <div style=${{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  ${availableScenes.map((scene) => html`
                    <button key=${scene}
                      style=${{
                        borderRadius: '20px', padding: '8px 16px', fontSize: '14px', fontWeight: 500,
                        border: `1px solid ${selectedScenes.includes(scene) ? C.borderActive : C.border}`,
                        background: selectedScenes.includes(scene) ? C.surfaceActive : 'transparent',
                        color: selectedScenes.includes(scene) ? C.primary : C.textMuted,
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                      onMouseEnter=${(e) => { if (!selectedScenes.includes(scene)) { e.target.style.background = C.surfaceHover; e.target.style.color = C.text } }}
                      onMouseLeave=${(e) => { if (!selectedScenes.includes(scene)) { e.target.style.background = 'transparent'; e.target.style.color = C.textMuted } }}
                      onClick=${() => onSceneToggle(scene)}>${scene}</button>
                  `)}
                </div>
              </section>
            ` : null}

          </section>

          <!-- ════ 右栏 ════ -->
          <aside class="w-full md:w-72 md:shrink-0">

            <!-- 移动端折叠开关 -->
            <button style=${{
              display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between',
              borderRadius: '14px', padding: '14px 18px',
              fontSize: '16px', fontWeight: 700, color: C.text,
              border: `1px solid ${C.border}`, background: C.surface,
              cursor: 'pointer',
            }}
              class="md:hidden"
              onClick=${() => setMobileRightOpen((v) => !v)}>
              <span>推荐团队 & 当前选择</span>
              <span style=${{
                fontSize: '14px', color: C.primary,
                transform: mobileRightOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.3s',
              }}>▾</span>
            </button>

            <div class=${`mt-4 flex flex-col gap-4 md:mt-0 ${mobileRightOpen ? 'block' : 'hidden md:block'}`}>

              <!-- 推荐团队预览 -->
              <div style=${{
                borderRadius: '16px', padding: '14px',
                background: C.surface, border: `1px solid ${C.border}`,
              }}>
                <div style=${{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style=${{ fontSize: '16px', fontWeight: 700, color: C.text }}>推荐团队</span>
                  <span style=${{ fontSize: '13px', color: C.textDim }}>随选择实时更新</span>
                </div>
                <div style=${{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  ${teams.map((team) => html`
                    <div key=${team.id} style=${{
                      borderRadius: '12px', padding: '14px',
                      background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`,
                    }}>
                      <div style=${{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style=${{ fontSize: '22px' }}>${team.emoji}</span>
                        <span style=${{ fontSize: '16px', fontWeight: 700, color: C.text }}>${team.name}</span>
                      </div>
                      <div style=${{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                        ${(team.agentEmojis || []).map((e, i) => html`
                          <span key=${i} style=${{
                            width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '50%', background: 'rgba(167,139,250,0.08)', fontSize: '15px',
                          }}>${e}</span>
                        `)}
                      </div>
                      <p style=${{ marginTop: '8px', fontSize: '14px', lineHeight: 1.6, color: C.textMuted, margin: '8px 0 0 0' }}>${team.desc}</p>
                      <button class="sp-cta" style=${{
                        marginTop: '12px', width: '100%', borderRadius: '10px', padding: '12px',
                        fontSize: '15px', fontWeight: 600,
                        background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
                        color: '#fff', border: 'none', cursor: 'pointer',
                        boxShadow: `0 2px 12px ${C.primary}30`,
                      }}
                      onMouseEnter=${(e) => e.target.style.boxShadow = `0 4px 20px ${C.primary}50`}
                      onMouseLeave=${(e) => e.target.style.boxShadow = `0 2px 12px ${C.primary}30`}
                        onClick=${() => useTeam(team)}>使用这套团队 →</button>
                    </div>
                  `)}
                </div>
              </div>

              <!-- 当前选择摘要 -->
              <div style=${{
                borderRadius: '16px', padding: '14px',
                background: C.surface, border: `1px solid ${C.border}`,
              }}>
                <div style=${{ marginBottom: '10px', fontSize: '16px', fontWeight: 700, color: C.text }}>当前选择</div>
                ${selectedSubject1 ? html`
                  <div style=${{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }}>
                    ${summaryPath.map((p, i) => html`
                      <span key=${i} style=${{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ${i > 0 ? html`<span style=${{ color: C.textDim, fontSize: '14px' }}>→</span>` : null}
                        <span style=${{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          borderRadius: '8px', padding: '4px 10px',
                          fontSize: '14px', color: C.text,
                          background: 'rgba(167,139,250,0.08)',
                        }}>
                          <span>${p.emoji}</span>
                          <span>${p.label}</span>
                          ${p.onClear ? html`<button style=${{
                            marginLeft: '2px', borderRadius: '50%', border: 'none',
                            background: 'transparent', color: C.textDim, cursor: 'pointer',
                            fontSize: '16px', lineHeight: 1, padding: '0',
                          }}
                          onMouseEnter=${(e) => e.target.style.color = C.red}
                          onMouseLeave=${(e) => e.target.style.color = C.textDim}
                            onClick=${p.onClear}>×</button>` : null}
                        </span>
                      </span>
                    `)}
                  </div>
                ` : html`
                  <div style=${{
                    fontSize: '14px', color: C.textDim, lineHeight: 1.6,
                    padding: '12px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px dashed ${C.border}`,
                  }}>
                    💡 选择学科后，推荐团队会自动匹配更精准的方案
                  </div>
                `}
              </div>

              <!-- 下一步（桌面）-->
              <button class="sp-cta hidden md:block"
                style=${nextBtnStyle}
                disabled=${nextDisabled}
                onClick=${onNext}>
                ${nextBtnLabel}
              </button>

            </div>
          </aside>

        </div>

        <!-- 底部留白 -->
        <div style=${{ height: '80px' }}></div>
      <//>

      <!-- 底部固定栏：平台数据 -->
      <div style=${{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
        height: '40px', borderTop: `1px solid ${C.border}`,
        background: 'rgba(5,1,15,0.9)', backdropFilter: 'blur(12px)',
      }}>
        <div style=${{
          maxWidth: '80rem', margin: '0 auto', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', fontSize: '13px', color: C.textDim,
        }}>
          <span style=${{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            已有 ${intFmt.format(2341)} 本教材通过本平台变成游戏 | ${intFmt.format(132)} 个AI角色 | ${intFmt.format(20)} 个预设团队
          </span>
          <button style=${{
            flexShrink: 0, borderRadius: '6px', padding: '4px 10px',
            fontSize: '14px', fontWeight: 500, color: C.primary,
            background: 'transparent', border: 'none', cursor: 'pointer',
          }}
          onMouseEnter=${(e) => e.target.style.color = C.accentLight}
          onMouseLeave=${(e) => e.target.style.color = C.primary}
            onClick=${() => goStep(STEPS.HELP)}>使用帮助</button>
        </div>
      </div>

      <!-- 移动端固定下一步按钮 -->
      <button class="sp-cta md:hidden"
        style=${{
          ...nextBtnStyle,
          position: 'fixed', bottom: '40px', left: '8px', right: '8px', zIndex: 40,
          boxShadow: nextDisabled ? 'none' : '0 4px 24px rgba(0,0,0,0.3)',
        }}
        disabled=${nextDisabled}
        onClick=${onNext}>
        ${nextBtnLabel}
      </button>

      <${Footer} />
    </div>
  `
}
