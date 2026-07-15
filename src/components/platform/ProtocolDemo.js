// ═══════════════════════════════════════════════════════════
// 知识-玩法映射协议演示页 (ProtocolDemo)
// 展示跨学段的AI如何把课本知识变成游戏，含 T16 医学临床队深度演示
// 技术栈：React 18 + htm（无 JSX，使用 html`` 模板字符串）
// ═══════════════════════════════════════════════════════════
import { html, useState, useMemo, useContext, useCallback } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'
import { NavBar, Footer, PageContainer } from './PlatformCommon.js'
import {
  T16_DEMO,
  mapKnowledgeToGameplay,
  getGradeThinkingMode,
  MAPPING_RULES,
  KNOWLEDGE_TYPES,
} from '../../data/mappingProtocol.js'
import { getTheme } from '../../data/themes.js'

// ── 学段配置 ──
const GRADES = [
  { id: 'primary', label: '小学', emoji: '🌲' },
  { id: 'junior', label: '初中', emoji: '🏫' },
  { id: 'senior', label: '高中', emoji: '⚡' },
  { id: 'college', label: '大学', emoji: '🔬' },
]

// ── 学段示例文本 ──
const GRADE_EXAMPLES = {
  primary: '1+1=2 教学生加法运算',
  junior: '镁条燃烧的化学反应实验',
  senior: '证明：sin²θ + cos²θ = 1',
  college: T16_DEMO.input.text,
}

// ── 学段对应的知识类型（用于精确映射）──
const GRADE_KNOWLEDGE_TYPE = {
  primary: KNOWLEDGE_TYPES.CALCULATION,
  junior: KNOWLEDGE_TYPES.EXPERIMENT,
  senior: KNOWLEDGE_TYPES.DERIVATION,
  college: KNOWLEDGE_TYPES.CASE_ANALYSIS,
}

// ── 知识类型中文标签 ──
const KNOWLEDGE_TYPE_LABELS = {
  calculation: '计算/运算',
  concept: '概念/定义',
  derivation: '推导/证明',
  experiment: '实验/操作',
  case_analysis: '案例分析',
  memorization: '记忆/背诵',
  application: '应用题/实际应用',
  reasoning: '逻辑推理',
}

// ── 医学演示步骤配置 ──
const DEMO_STEPS = [
  { label: '病例生成', agent: '临床模拟师', icon: '🩺', agentId: 'u12' },
  { label: '3D标注', agent: '解剖可视化专家', icon: '🫀', agentId: 'u13' },
  { label: '诊断设计', agent: '案例分析专家', icon: '🔬', agentId: 'u11' },
  { label: '游戏原型', agent: '最终输出', icon: '🎮', agentId: 'final' },
]

// ── 医学演示区固定配色（深色青蓝医疗风，独立于全局主题）──
const MED = {
  bg: 'linear-gradient(160deg, rgba(6,182,212,0.06) 0%, rgba(20,184,166,0.03) 45%, rgba(5,1,15,0.6) 100%)',
  surface: 'rgba(255,255,255,0.03)',
  surfaceAlt: 'rgba(255,255,255,0.05)',
  border: 'rgba(103,232,249,0.15)',
  borderSoft: 'rgba(103,232,249,0.08)',
  accent: '#67e8f9',
  accentDark: '#22d3ee',
  accentLight: '#a5f3fc',
  text: '#f5e8ff',
  muted: '#8b7da8',
  green: '#4ade80',
  greenBg: 'rgba(74,222,128,0.1)',
  red: '#f87171',
  redBg: 'rgba(248,113,113,0.1)',
  viewerBg: 'linear-gradient(135deg, #0f172a 0%, #134e4a 100%)',
}

// ── 自定义动画样式（保证自包含）──
const DEMO_CSS = `
@keyframes protoFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.proto-fade { animation: protoFade 0.4s cubic-bezier(0.16,1,0.3,1); }
@keyframes pulseRing { 0%,100% { box-shadow: 0 0 0 0 rgba(8,145,178,0.4); } 50% { box-shadow: 0 0 0 6px rgba(8,145,178,0); } }
.pulse-ring { animation: pulseRing 2s ease-in-out infinite; }
@keyframes markerPulse { 0%,100% { transform: scale(1); opacity: 0.85; } 50% { transform: scale(1.25); opacity: 1; } }
.marker-pulse { animation: markerPulse 1.8s ease-in-out infinite; }
`

export default function ProtocolDemo() {
  const { dispatch } = useContext(AppContext)

  // ── 本地状态 ──
  const [selectedGrade, setSelectedGrade] = useState('college')
  const [inputText, setInputText] = useState(GRADE_EXAMPLES.college)
  const [demoStep, setDemoStep] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)

  // ── 主题与思维模式 ──
  const theme = useMemo(() => getTheme(selectedGrade), [selectedGrade])
  const thinkingMode = useMemo(() => getGradeThinkingMode(selectedGrade), [selectedGrade])

  // ── 切换学段 ──
  const handleGradeChange = useCallback((grade) => {
    setSelectedGrade(grade)
    setInputText(GRADE_EXAMPLES[grade])
    setDemoStep(0)
    setSelectedOption(null)
  }, [])

  // ── 返回模式页 ──
  const goBack = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: STEPS.MODE })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  // ── 映射结果 ──
  const mappingResult = useMemo(() => {
    return mapKnowledgeToGameplay({
      grade: selectedGrade,
      text: inputText,
      knowledgeType: GRADE_KNOWLEDGE_TYPE[selectedGrade],
    })
  }, [selectedGrade, inputText])

  // ── 当前学段映射规则 ──
  const gradeRules = useMemo(() => {
    return MAPPING_RULES.filter((r) => r.grade === selectedGrade)
  }, [selectedGrade])

  // ── 根容器样式：注入主题 CSS 变量 ──
  const rootStyle = {
    ...theme.cssVars,
    background: 'var(--theme-bg)',
    color: 'var(--theme-text)',
    minHeight: '100vh',
    fontFamily: 'var(--theme-font)',
    transition: 'background 480ms cubic-bezier(0.4,0,0.2,1), color 480ms cubic-bezier(0.4,0,0.2,1)',
  }

  // ═══════════════════════════════════════════════════════════
  // 渲染：页头
  // ═══════════════════════════════════════════════════════════
  const renderHeader = () => html`
    <section class="flex items-start justify-between flex-wrap gap-4 mb-2">
      <div>
        <div class="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3"
             style=${{ background: 'var(--theme-primary-bg)', color: 'var(--theme-primary)' }}>
          <span class="text-xs font-bold tracking-wider">PROTOCOL · v1.0</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-black leading-tight" style=${{ color: 'var(--theme-text)' }}>
          知识-玩法映射协议
        </h1>
        <p class="mt-2 text-base" style=${{ color: 'var(--theme-text-muted)' }}>
          不同学段的AI如何把课本变成游戏
        </p>
      </div>
      <button class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
              style=${{ background: 'var(--theme-surface)', color: 'var(--theme-text)', border: '1px solid var(--theme-border)' }}
              onClick=${goBack}>
        ← 返回
      </button>
    </section>
  `

  // ═══════════════════════════════════════════════════════════
  // 渲染：学段选择器 + 思维模式
  // ═══════════════════════════════════════════════════════════
  const renderGradeSelector = () => html`
    <section class="mt-8">
      <h2 class="text-xl font-bold mb-1" style=${{ color: 'var(--theme-text)' }}>
        <span style=${{ color: 'var(--theme-primary)' }}>①</span> 选择学段，查看AI思维模式
      </h2>
      <p class="text-sm mb-4" style=${{ color: 'var(--theme-text-muted)' }}>
        不同学段的AI会用完全不同的思维方式来设计游戏
      </p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        ${GRADES.map((g) => {
          const active = selectedGrade === g.id
          return html`
            <button key=${g.id}
              class="rounded-xl p-4 text-center transition-all hover:opacity-90"
              style=${active
                ? { background: 'var(--theme-primary)', color: '#fff', boxShadow: 'var(--theme-shadow-hover)', transform: 'translateY(-2px)' }
                : { background: 'var(--theme-surface)', color: 'var(--theme-text)', border: '1px solid var(--theme-border)' }}
              onClick=${() => handleGradeChange(g.id)}>
              <div class="text-2xl mb-1">${g.emoji}</div>
              <div class="text-sm font-bold">${g.label}</div>
            </button>
          `
        })}
      </div>
      <div class="rounded-2xl p-5" style=${{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
        <div class="flex items-center gap-2 mb-2 flex-wrap">
          <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                style=${{ background: 'var(--theme-primary-bg)', color: 'var(--theme-primary)' }}>
            思维模式
          </span>
          <h3 class="text-lg font-bold" style=${{ color: 'var(--theme-text)' }}>${thinkingMode.title}</h3>
        </div>
        <p class="text-sm mb-4 leading-relaxed" style=${{ color: 'var(--theme-text-muted)' }}>
          ${thinkingMode.description}
        </p>
        <div class="grid sm:grid-cols-2 gap-2">
          ${thinkingMode.principles.map((p, i) => html`
            <div key=${i} class="flex items-start gap-2.5 rounded-lg p-3"
                 style=${{ background: 'var(--theme-surface-alt)' }}>
              <span class="text-sm font-black shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style=${{ background: 'var(--theme-primary)', color: '#fff' }}>
                ${i + 1}
              </span>
              <span class="text-sm leading-relaxed" style=${{ color: 'var(--theme-text)' }}>${p}</span>
            </div>
          `)}
        </div>
      </div>
    </section>
  `

  // ═══════════════════════════════════════════════════════════
  // 渲染：实时映射演示
  // ═══════════════════════════════════════════════════════════
  const renderMappingDemo = () => {
    const rec = mappingResult.recommended
    return html`
      <section class="mt-10">
        <h2 class="text-xl font-bold mb-1" style=${{ color: 'var(--theme-text)' }}>
          <span style=${{ color: 'var(--theme-primary)' }}>②</span> 实时映射演示
        </h2>
        <p class="text-sm mb-4" style=${{ color: 'var(--theme-text-muted)' }}>
          输入一段知识文本，看AI如何把它映射成游戏玩法
        </p>
        <div class="grid md:grid-cols-2 gap-5">
          <!-- 左：输入 -->
          <div class="rounded-2xl p-5" style=${{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
            <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
              <span class="text-sm font-bold" style=${{ color: 'var(--theme-text)' }}>知识文本输入</span>
              <span class="text-xs px-2 py-0.5 rounded-full"
                    style=${{ background: 'var(--theme-surface-alt)', color: 'var(--theme-text-muted)' }}>
                ${GRADES.find((g) => g.id === selectedGrade)?.label} · ${KNOWLEDGE_TYPE_LABELS[GRADE_KNOWLEDGE_TYPE[selectedGrade]]}
              </span>
            </div>
            <textarea
              class="w-full rounded-xl p-3 text-sm resize-none focus:outline-none"
              style=${{ background: 'var(--theme-surface-alt)', color: 'var(--theme-text)', border: '1px solid var(--theme-border)', minHeight: '140px' }}
              value=${inputText}
              onChange=${(e) => setInputText(e.target.value)}>
            </textarea>
            <div class="mt-3 text-xs mb-1.5" style=${{ color: 'var(--theme-text-muted)' }}>切换示例：</div>
            <div class="flex flex-wrap gap-2">
              ${GRADES.map((g) => {
                const active = selectedGrade === g.id
                return html`
                  <button key=${g.id}
                    class="text-xs px-2.5 py-1 rounded-lg transition-all"
                    style=${active
                      ? { background: 'var(--theme-primary)', color: '#fff' }
                      : { background: 'var(--theme-surface-alt)', color: 'var(--theme-text-muted)' }}
                    onClick=${() => handleGradeChange(g.id)}>
                    ${g.emoji} ${g.label}
                  </button>
                `
              })}
            </div>
          </div>
          <!-- 右：映射结果 -->
          <div class="rounded-2xl p-5" style=${{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
            <div class="flex items-center gap-2 mb-3">
              <span class="text-sm font-bold" style=${{ color: 'var(--theme-text)' }}>推荐玩法</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded font-mono"
                    style=${{ background: 'var(--theme-accent-bg)', color: 'var(--theme-accent)' }}>
                mapKnowledgeToGameplay()
              </span>
            </div>
            ${rec
              ? html`
                  <div class="rounded-xl p-4" style=${{ background: 'var(--theme-primary-bg)' }}>
                    <div class="flex items-center gap-2 mb-2 flex-wrap">
                      <span class="text-xs px-2 py-0.5 rounded-full font-mono"
                            style=${{ background: 'var(--theme-primary)', color: '#fff' }}>
                        ${rec.gameplay}
                      </span>
                      <span class="text-base font-bold" style=${{ color: 'var(--theme-primary)' }}>
                        ${rec.gameplayName}
                      </span>
                    </div>
                    <p class="text-sm mb-3 leading-relaxed" style=${{ color: 'var(--theme-text-muted)' }}>
                      ${rec.description}
                    </p>
                    ${rec.example
                      ? html`
                          <div class="rounded-lg p-3" style=${{ background: 'var(--theme-surface)' }}>
                            <div class="text-xs font-semibold mb-1" style=${{ color: 'var(--theme-text-muted)' }}>
                              输入：${rec.example.input}
                            </div>
                            <div class="text-sm leading-relaxed" style=${{ color: 'var(--theme-text)' }}>
                              ${rec.example.output}
                            </div>
                          </div>
                        `
                      : null}
                  </div>
                  ${mappingResult.matchedCount > 1
                    ? html`
                        <div class="mt-2 text-xs flex items-center gap-1.5" style=${{ color: 'var(--theme-text-muted)' }}>
                          <span class="w-1.5 h-1.5 rounded-full" style=${{ background: 'var(--theme-accent)' }}></span>
                          共匹配 ${mappingResult.matchedCount} 条规则，已推荐最佳玩法
                        </div>
                      `
                    : null}
                `
              : html`
                  <div class="rounded-xl p-4 text-sm" style=${{ background: 'var(--theme-surface-alt)', color: 'var(--theme-text-muted)' }}>
                    ${mappingResult.description}
                  </div>
                `}
          </div>
        </div>
      </section>
    `
  }

  // ═══════════════════════════════════════════════════════════
  // 渲染：医学演示 - 步进器
  // ═══════════════════════════════════════════════════════════
  const renderStepper = () => html`
    <div class="flex items-center justify-center gap-1 mb-6 flex-wrap">
      ${DEMO_STEPS.map((s, i) => html`
        <div key=${i} class="flex items-center">
          <button class="flex flex-col items-center gap-1.5" onClick=${() => { setDemoStep(i); setSelectedOption(null) }}>
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all"
                 style=${demoStep === i
                   ? { background: MED.accent, color: '#fff', boxShadow: `0 0 0 4px ${MED.borderSoft}` }
                   : demoStep > i
                     ? { background: MED.green, color: '#fff' }
                     : { background: 'rgba(255,255,255,0.03)', color: MED.muted, border: `2px solid ${MED.border}` }}>
              ${demoStep > i ? '✓' : i + 1}
            </div>
            <span class="text-[10px] font-semibold whitespace-nowrap" style=${{ color: demoStep === i ? MED.accentDark : MED.muted }}>
              ${s.label}
            </span>
          </button>
          ${i < DEMO_STEPS.length - 1
            ? html`<div class="w-6 sm:w-10 h-0.5 mx-0.5 mb-5" style=${{ background: demoStep > i ? MED.green : MED.border }}></div>`
            : null}
        </div>
      `)}
    </div>
  `

  // ── 步骤0：病例生成（临床模拟师）──
  const renderPatientCard = (agent) => {
    const o = agent.output
    return html`
      <div class="rounded-2xl p-5" style=${{ background: MED.surface, border: `1px solid ${MED.border}` }}>
        <div class="flex items-center gap-3 mb-4 pb-4" style=${{ borderBottom: `1px dashed ${MED.border}` }}>
          <div class="w-14 h-14 rounded-full flex items-center justify-center text-3xl pulse-ring"
               style=${{ background: MED.surfaceAlt }}>👴</div>
          <div class="flex-1">
            <div class="text-xl font-black" style=${{ color: MED.text }}>${o.patientName}</div>
            <div class="text-sm" style=${{ color: MED.muted }}>${o.age} 岁 · 男</div>
          </div>
          <span class="text-xs px-2 py-1 rounded font-bold" style=${{ background: MED.surfaceAlt, color: MED.accentDark }}>
            模拟病例
          </span>
        </div>
        <div class="space-y-3">
          <div>
            <div class="text-xs font-bold mb-1 flex items-center gap-1" style=${{ color: MED.accent }}>
              <span>主诉</span>
            </div>
            <div class="text-sm leading-relaxed p-2.5 rounded-lg" style=${{ background: MED.surfaceAlt, color: MED.text }}>
              ${o.complaint}
            </div>
          </div>
          <div>
            <div class="text-xs font-bold mb-1" style=${{ color: MED.accent }}>既往史</div>
            <div class="text-sm leading-relaxed p-2.5 rounded-lg" style=${{ background: MED.surfaceAlt, color: MED.text }}>
              ${o.history}
            </div>
          </div>
          <div>
            <div class="text-xs font-bold mb-1" style=${{ color: MED.accent }}>生命体征</div>
            <div class="grid grid-cols-3 gap-2">
              ${Object.entries(o.vitals).map(([k, v]) => html`
                <div key=${k} class="rounded-lg p-2.5 text-center" style=${{ background: MED.surfaceAlt }}>
                  <div class="text-[10px] font-semibold" style=${{ color: MED.muted }}>${k}</div>
                  <div class="text-sm font-bold mt-0.5" style=${{ color: MED.text }}>${v}</div>
                </div>
              `)}
            </div>
          </div>
        </div>
      </div>
    `
  }

  // ── 步骤1：3D标注（解剖可视化专家）──
  const renderAnatomyCard = (agent) => {
    const o = agent.output
    return html`
      <div class="rounded-2xl p-5" style=${{ background: MED.surface, border: `1px solid ${MED.border}` }}>
        <div class="flex items-start justify-between mb-4 pb-4" style=${{ borderBottom: `1px dashed ${MED.border}` }}>
          <div>
            <div class="text-xs font-bold" style=${{ color: MED.accent }}>3D 标注目标</div>
            <div class="text-xl font-black mt-0.5" style=${{ color: MED.text }}>${o.target}</div>
            <div class="text-xs mt-0.5" style=${{ color: MED.muted }}>${o.position}</div>
          </div>
          <div class="text-4xl">🫀</div>
        </div>
        <!-- 模拟 3D 查看器 -->
        <div class="rounded-xl p-4 mb-4 relative overflow-hidden flex items-center justify-center"
             style=${{ background: MED.viewerBg, minHeight: '150px' }}>
          <div class="absolute top-2 left-2 text-[10px] font-mono px-1.5 py-0.5 rounded"
               style=${{ background: 'rgba(6,182,212,0.2)', color: MED.accentLight }}>
            3D VIEWER · LIVE
          </div>
          <div class="absolute top-2 right-2 flex gap-1">
            <span class="w-1.5 h-1.5 rounded-full marker-pulse" style=${{ background: '#FF6B6B' }}></span>
            <span class="w-1.5 h-1.5 rounded-full marker-pulse" style=${{ background: '#FFA94D', animationDelay: '0.3s' }}></span>
            <span class="w-1.5 h-1.5 rounded-full marker-pulse" style=${{ background: MED.accentLight, animationDelay: '0.6s' }}></span>
          </div>
          <div class="text-center">
            <div class="text-5xl mb-1">🫀</div>
            <div class="text-[10px] font-mono" style=${{ color: MED.accentLight }}>
              二尖瓣 · 舒张期开放受限
            </div>
          </div>
          <!-- 标注引线 -->
          <div class="absolute" style=${{ left: '30%', top: '40%' }}>
            <div class="w-2 h-2 rounded-full marker-pulse" style=${{ background: '#FF6B6B' }}></div>
          </div>
          <div class="absolute" style=${{ right: '32%', top: '55%' }}>
            <div class="w-2 h-2 rounded-full marker-pulse" style=${{ background: '#FFA94D', animationDelay: '0.4s' }}></div>
          </div>
        </div>
        <div class="space-y-2 mb-3">
          ${o.markers.map((m, i) => html`
            <div key=${i} class="flex items-center justify-between rounded-lg p-2.5"
                 style=${{ background: MED.surfaceAlt, borderLeft: `3px solid ${m.color || MED.accent}` }}>
              <span class="text-sm font-medium" style=${{ color: MED.text }}>${m.label}</span>
              <span class="text-sm font-bold" style=${{ color: m.severity ? MED.red : MED.accentDark }}>
                ${m.status || m.value}${m.severity ? ` · ${m.severity}` : ''}
              </span>
            </div>
          `)}
        </div>
        <div class="rounded-lg p-3" style=${{ background: 'rgba(255,255,255,0.05)' }}>
          <div class="text-xs font-bold mb-1" style=${{ color: MED.accent }}>3D 生成提示词</div>
          <div class="text-xs leading-relaxed font-mono" style=${{ color: MED.muted }}>${o.prompt3D}</div>
        </div>
      </div>
    `
  }

  // ── 步骤2：诊断选项（案例分析专家）──
  const renderDiagnosisCard = (agent) => {
    const o = agent.output
    const showResult = selectedOption !== null
    const selectedOpt = o.options.find((x) => x.id === selectedOption)
    return html`
      <div class="rounded-2xl p-5" style=${{ background: MED.surface, border: `1px solid ${MED.border}` }}>
        <div class="text-base font-bold mb-4 flex items-center gap-2" style=${{ color: MED.text }}>
          <span class="text-xl">❓</span> ${o.question}
        </div>
        <div class="space-y-2.5">
          ${o.options.map((opt) => {
            const isSelected = selectedOption === opt.id
            let cardStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(167,139,250,0.12)', cursor: 'pointer' }
            if (showResult) {
              if (opt.correct) {
                cardStyle = { background: MED.greenBg, border: `2px solid ${MED.green}`, cursor: 'pointer' }
              } else if (isSelected) {
                cardStyle = { background: MED.redBg, border: `2px solid ${MED.red}`, cursor: 'pointer' }
              } else {
                cardStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(167,139,250,0.12)', opacity: 0.55, cursor: 'pointer' }
              }
            }
            const badgeBg = showResult && opt.correct ? MED.green : showResult && isSelected ? MED.red : 'rgba(255,255,255,0.08)'
            const badgeColor = showResult && (opt.correct || isSelected) ? '#fff' : MED.text
            return html`
              <button key=${opt.id}
                class="w-full text-left rounded-xl p-3.5 transition-all"
                style=${cardStyle}
                onClick=${() => setSelectedOption(opt.id)}>
                <div class="flex items-start gap-3">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                       style=${{ background: badgeBg, color: badgeColor }}>
                    ${opt.id}
                  </div>
                  <div class="flex-1">
                    <div class="text-sm font-medium" style=${{ color: MED.text }}>${opt.text}</div>
                    ${showResult && (isSelected || opt.correct)
                      ? html`
                          <div class="text-xs mt-1.5 leading-relaxed p-2 rounded"
                               style=${{ background: 'rgba(255,255,255,0.05)', color: opt.correct ? MED.green : MED.red }}>
                            ${opt.correct ? '✓ ' : '✗ '}${opt.explanation}
                          </div>
                        `
                      : null}
                  </div>
                  ${showResult && opt.correct ? html`<span class="text-lg">✅</span>` : null}
                  ${showResult && isSelected && !opt.correct ? html`<span class="text-lg">❌</span>` : null}
                </div>
              </button>
            `
          })}
        </div>
        <div class="mt-3 text-center text-xs" style=${{ color: MED.muted }}>
          ${showResult
            ? (selectedOpt?.correct
                ? '诊断正确！典型二尖瓣狭窄表现。点击其他选项可继续探索'
                : '诊断有误，正确答案已标绿。点击选项可重试')
            : '点击你认为正确的诊断 ↓'}
        </div>
      </div>
    `
  }

  // ── 步骤3：最终游戏原型 ──
  const renderFinalOutput = () => {
    const o = T16_DEMO.finalOutput
    return html`
      <div class="rounded-2xl p-5" style=${{ background: MED.surface, border: `1px solid ${MED.border}` }}>
        <div class="flex items-center gap-2 mb-3 flex-wrap">
          <span class="text-xs font-bold px-2.5 py-1 rounded-full"
                style=${{ background: MED.accent, color: '#fff' }}>🎮 游戏原型</span>
          <span class="text-xs font-mono px-2 py-0.5 rounded" style=${{ background: MED.surfaceAlt, color: MED.muted }}>
            ${o.gameType}
          </span>
        </div>
        <div class="text-2xl font-black mb-2" style=${{ color: MED.text }}>${o.gameName}</div>
        <div class="text-sm leading-relaxed mb-4 p-3 rounded-lg" style=${{ background: MED.surfaceAlt, color: MED.muted }}>
          ${o.description}
        </div>
        <div class="text-xs font-bold mb-2 flex items-center gap-1.5" style=${{ color: MED.accent }}>
          <span>⚙️ 核心机制</span>
        </div>
        <div class="space-y-2">
          ${o.mechanics.map((m, i) => html`
            <div key=${i} class="flex items-start gap-2.5 rounded-lg p-2.5" style=${{ background: MED.surfaceAlt }}>
              <span class="text-sm font-black shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style=${{ background: MED.accent, color: '#fff' }}>${i + 1}</span>
              <span class="text-sm leading-relaxed" style=${{ color: MED.text }}>${m}</span>
            </div>
          `)}
        </div>
      </div>
    `
  }

  // ═══════════════════════════════════════════════════════════
  // 渲染：T16 医学临床队深度演示
  // ═══════════════════════════════════════════════════════════
  const renderMedicalDemo = () => {
    const currentStep = DEMO_STEPS[demoStep]
    let agentLine = null
    let stepContent = null

    if (demoStep < 3) {
      const agent = T16_DEMO.agentWorkFlow[demoStep]
      agentLine = html`
        <div class="flex items-center gap-2 text-xs font-mono" style=${{ color: MED.muted }}>
          <span class="px-1.5 py-0.5 rounded" style=${{ background: MED.surfaceAlt, color: MED.accentDark }}>
            agentId: ${agent.agentId}
          </span>
          <span>→</span>
          <span style=${{ color: MED.accentDark }}>${agent.agentName}</span>
          <span style=${{ color: MED.muted }}>·</span>
          <span>${agent.role}</span>
        </div>
      `
      if (demoStep === 0) stepContent = renderPatientCard(agent)
      else if (demoStep === 1) stepContent = renderAnatomyCard(agent)
      else if (demoStep === 2) stepContent = renderDiagnosisCard(agent)
    } else {
      agentLine = html`
        <div class="flex items-center gap-2 text-xs font-mono" style=${{ color: MED.muted }}>
          <span class="px-1.5 py-0.5 rounded" style=${{ background: MED.surfaceAlt, color: MED.accentDark }}>
            finalOutput
          </span>
          <span>→</span>
          <span style=${{ color: MED.accentDark }}>游戏原型生成</span>
        </div>
      `
      stepContent = renderFinalOutput()
    }

    return html`
      <section class="mt-2 rounded-3xl p-6 sm:p-8"
               style=${{ background: MED.bg, border: `1px solid ${MED.border}` }}>
        <!-- 团队标识 -->
        <div class="flex items-center gap-3 mb-2 flex-wrap">
          <div class="text-3xl">🏥</div>
          <div>
            <h2 class="text-2xl font-black" style=${{ color: MED.accentDark }}>
              ${T16_DEMO.teamName}
            </h2>
            <p class="text-sm" style=${{ color: MED.muted }}>
              三个智能体协作，把心脏瓣膜病知识变成可玩的诊断游戏
            </p>
          </div>
          <span class="ml-auto text-xs px-2.5 py-1 rounded-full font-mono"
                style=${{ background: 'rgba(8,145,178,0.1)', color: MED.accentDark, border: `1px solid ${MED.border}` }}>
            behind the scenes
          </span>
        </div>

        <!-- 输入知识预览 -->
        <div class="rounded-xl p-3 mb-6" style=${{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${MED.borderSoft}` }}>
          <div class="text-xs font-bold mb-1" style=${{ color: MED.accent }}>输入知识 · case_analysis</div>
          <div class="text-xs leading-relaxed font-mono" style=${{ color: MED.text }}>
            ${T16_DEMO.input.text.slice(0, 90)}…
          </div>
        </div>

        <!-- 步进器 -->
        ${renderStepper()}

        <!-- 当前步骤标题 -->
        <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div class="flex items-center gap-2.5">
            <span class="px-3 py-1 rounded-full text-xs font-black"
                  style=${{ background: MED.accent, color: '#fff' }}>
              STEP ${demoStep + 1} / 4
            </span>
            <span class="text-lg">${currentStep.icon}</span>
            <span class="font-bold" style=${{ color: MED.text }}>${currentStep.agent}</span>
            <span class="text-sm" style=${{ color: MED.muted }}>· ${currentStep.label}</span>
          </div>
          ${agentLine}
        </div>

        <!-- 步骤内容 -->
        <div class="proto-fade" key=${demoStep}>${stepContent}</div>

        <!-- 导航 -->
        <div class="flex items-center justify-between mt-6 gap-3">
          <button class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style=${{ background: 'rgba(255,255,255,0.03)', color: MED.text, border: `1px solid ${MED.border}`, opacity: demoStep === 0 ? 0.4 : 1, cursor: demoStep === 0 ? 'not-allowed' : 'pointer' }}
                  disabled=${demoStep === 0}
                  onClick=${() => { setDemoStep(Math.max(0, demoStep - 1)); setSelectedOption(null) }}>
            ← 上一步
          </button>
          <div class="flex gap-1.5">
            ${DEMO_STEPS.map((s, i) => html`
              <button key=${i} class="rounded-full transition-all"
                      style=${{ width: demoStep === i ? '24px' : '8px', height: '8px', background: demoStep === i ? MED.accent : MED.border }}
                      onClick=${() => { setDemoStep(i); setSelectedOption(null) }}></button>
            `)}
          </div>
          <button class="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                  style=${{ background: MED.accent, color: '#fff', opacity: demoStep === 3 ? 0.4 : 1, cursor: demoStep === 3 ? 'not-allowed' : 'pointer' }}
                  disabled=${demoStep === 3}
                  onClick=${() => setDemoStep(Math.min(3, demoStep + 1))}>
            下一步 →
          </button>
        </div>
      </section>
    `
  }

  // ═══════════════════════════════════════════════════════════
  // 渲染：映射规则表
  // ═══════════════════════════════════════════════════════════
  const renderRulesTable = () => html`
    <section class="mt-10">
      <h2 class="text-xl font-bold mb-1" style=${{ color: 'var(--theme-text)' }}>
        <span style=${{ color: 'var(--theme-primary)' }}>④</span>
        ${GRADES.find((g) => g.id === selectedGrade)?.label}映射规则全表
      </h2>
      <p class="text-sm mb-4" style=${{ color: 'var(--theme-text-muted)' }}>
        该学段所有"知识 → 玩法"映射规则一览（共 ${gradeRules.length} 条）
      </p>
      <div class="rounded-2xl overflow-hidden" style=${{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr style=${{ background: 'var(--theme-surface-alt)' }}>
                <th class="text-left p-3 font-bold whitespace-nowrap" style=${{ color: 'var(--theme-text)' }}>知识类型</th>
                <th class="text-left p-3 font-bold whitespace-nowrap" style=${{ color: 'var(--theme-text)' }}>触发关键词</th>
                <th class="text-left p-3 font-bold whitespace-nowrap" style=${{ color: 'var(--theme-text)' }}>玩法</th>
                <th class="text-left p-3 font-bold whitespace-nowrap" style=${{ color: 'var(--theme-text)' }}>示例</th>
              </tr>
            </thead>
            <tbody>
              ${gradeRules.map((r) => html`
                <tr key=${r.id} style=${{ borderTop: '1px solid var(--theme-border)' }}>
                  <td class="p-3 align-top">
                    <span class="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                          style=${{ background: 'var(--theme-primary-bg)', color: 'var(--theme-primary)' }}>
                      ${KNOWLEDGE_TYPE_LABELS[r.knowledgeType] || r.knowledgeType}
                    </span>
                  </td>
                  <td class="p-3 align-top">
                    <div class="flex flex-wrap gap-1">
                      ${r.triggerKeywords.map((kw) => html`
                        <span key=${kw} class="text-xs px-1.5 py-0.5 rounded"
                              style=${{ background: 'var(--theme-surface-alt)', color: 'var(--theme-text-muted)' }}>
                          ${kw}
                        </span>
                      `)}
                    </div>
                  </td>
                  <td class="p-3 align-top">
                    <div class="font-bold" style=${{ color: 'var(--theme-primary)' }}>${r.gameplayName}</div>
                    <div class="text-xs mt-0.5 leading-relaxed" style=${{ color: 'var(--theme-text-muted)' }}>${r.description}</div>
                  </td>
                  <td class="p-3 align-top text-xs" style=${{ color: 'var(--theme-text-muted)' }}>
                    <div class="font-semibold mb-0.5" style=${{ color: 'var(--theme-text)' }}>${r.example.input}</div>
                    <div class="leading-relaxed">${r.example.output}</div>
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `

  // ═══════════════════════════════════════════════════════════
  // 主渲染
  // ═══════════════════════════════════════════════════════════
  return html`
    <div style=${rootStyle}>
      <style>${DEMO_CSS}</style>
      <${NavBar} />
      <${PageContainer}>
        ${renderHeader()}
        ${renderGradeSelector()}
        ${renderMappingDemo()}
        <section class="mt-10">
          <h2 class="text-xl font-bold mb-1" style=${{ color: 'var(--theme-text)' }}>
            <span style=${{ color: 'var(--theme-primary)' }}>③</span> T16 医学临床队 · 深度演示
          </h2>
          <p class="text-sm mb-2" style=${{ color: 'var(--theme-text-muted)' }}>
            这是协议的明星案例：看三个智能体如何协作，把一段心脏瓣膜病知识变成可玩的诊断游戏
          </p>
        </section>
        ${renderMedicalDemo()}
        ${renderRulesTable()}
      <//>
      <${Footer} />
    </div>
  `
}
