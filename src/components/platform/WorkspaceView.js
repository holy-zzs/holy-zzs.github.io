// AI 协作工作台 v8 — 多智能体协作生成「游戏配置 JSON」
// 左：智能体协作频道（逐个注入 knowledgePoints / levels / theme / playtest 配置块）
// 右：输出面板（游戏配置 JSON 实时组装 + 实时预览场景）
import { html, useCallback, useContext, useEffect, useRef, useState } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'

// ── 色板（硬编码，匹配平台深空主题）──
const C = {
  bg: '#05010f',
  surface: 'rgba(255,255,255,0.025)',
  surfaceHover: 'rgba(255,255,255,0.05)',
  text: '#f5e8ff',
  textMuted: '#8b7da8',
  textDim: '#5d4f7a',
  border: 'rgba(167,139,250,0.12)',
  borderBright: 'rgba(167,139,250,0.25)',
  primary: '#a78bfa',
  primaryDark: '#7c3aed',
  accent: '#F5A623',
  accentLight: '#fbbf24',
  green: '#4ade80',
  pink: '#f472b6',
  blue: '#60a5fa',
  cyan: '#22d3ee',
  orange: '#f97316',
  red: '#f87171',
}

// ── 动画 CSS ──
const WS_CSS = `
@keyframes wsGridScroll { 0%{background-position:0 0} 100%{background-position:0 -38px} }
@keyframes wsCharRun { 0%{left:8%;transform:translateY(0)} 25%{transform:translateY(-6px)} 50%{left:82%;transform:translateY(0)} 75%{transform:translateY(-6px)} 100%{left:8%;transform:translateY(0)} }
@keyframes wsOrbFloat { 0%,100%{transform:translateY(0) scale(1);opacity:.8} 50%{transform:translateY(-14px) scale(1.1);opacity:1} }
@keyframes wsStarTwinkle { 0%,100%{opacity:.2} 50%{opacity:1} }
@keyframes wsScanMove { 0%{top:-18%} 100%{top:108%} }
@keyframes wsPulse { 0%,100%{opacity:.45} 50%{opacity:1} }
@keyframes wsBlink { 0%,100%{opacity:1} 50%{opacity:.15} }
@keyframes wsMsgIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes wsFadeIn { from{opacity:0} to{opacity:1} }
.msg-enter{ animation: wsMsgIn 0.3s ease-out; }
.fade-in{ animation: wsFadeIn 0.4s ease-out; }
.ws-cursor{ animation: wsBlink 1s steps(2) infinite; }
`

// ── 协作智能体（4 位核心角色）──
const AGENTS = [
  { id: 'scholar',  name: '知识拆解师', emoji: '📚', color: C.blue,   role: '教材分析',  desc: '从教材中提取知识点与易错点' },
  { id: 'designer', name: '关卡设计师', emoji: '🎮', color: C.orange, role: '关卡设计',  desc: '将知识点映射为递进关卡' },
  { id: 'art',      name: '美术指导',   emoji: '🎨', color: C.pink,   role: '视觉风格',  desc: '定义主题、配色与资产清单' },
  { id: 'tester',   name: '体验测试员', emoji: '🫠', color: C.primary, role: '质量验收',  desc: '内部试玩并输出调优建议' },
]

// ── 主题词提取 ──
function inferTheme(material) {
  if (!material) return { name: '深空逃亡', subject: '通用' }
  const title = material.structure?.[0]?.title || material.filename || ''
  const concepts = (material.concepts || []).map(c => c.name)
  if (/力|运动|牛顿|加速度|速度/.test(title + concepts.join(''))) return { name: '深空逃亡', subject: '物理' }
  if (/光|折射|反射|干涉|衍射/.test(title + concepts.join(''))) return { name: '光之迷宫', subject: '光学' }
  if (/细胞|生物|基因|DNA|进化/.test(title + concepts.join(''))) return { name: '细胞大作战', subject: '生物' }
  if (/化学|分子|原子|反应|元素/.test(title + concepts.join(''))) return { name: '元素守护者', subject: '化学' }
  if (/函数|方程|导数|积分|矩阵/.test(title + concepts.join(''))) return { name: '数学矩阵', subject: '数学' }
  if (/历史|朝代|战争|帝国|文明/.test(title + concepts.join(''))) return { name: '帝国回响', subject: '历史' }
  return { name: title.slice(0, 6) || '知识探索', subject: '综合' }
}

// ── 基于教材动态生成协作脚本 ──
function generateCollabScript(material) {
  const theme = inferTheme(material)
  const concepts = (material?.concepts || []).slice(0, 5)
  const formulas = (material?.formulas || []).slice(0, 3)
  const sections = (material?.structure || []).slice(0, 3)
  const materialName = material?.filename || '示例教材'
  const title = material?.structure?.[0]?.title || materialName

  if (!material || (!concepts.length && !sections.length)) {
    return COLLAB_SCRIPT_DEFAULT
  }

  const knowledgePoints = concepts.map((c, i) => ({
    id: `kp${i + 1}`, name: c.name,
    difficulty: Math.min(5, Math.max(1, c.importance || 2)), mastery: 0
  }))
  const errorProne = concepts.slice(0, 3).map(c => `${c.name}易混点`)

  const levels = sections.map((s, i) => ({
    id: `L${i + 1}`, name: s.title?.slice(0, 8) || `第${i + 1}关`,
    knowledge: concepts.slice(i * 2, i * 2 + 2).map((_, j) => `kp${i * 2 + j + 1}`).filter(k => knowledgePoints.some(kp => kp.id === k)),
    mechanic: ['dodge', 'thrust', 'boss'][i % 3], target: 60 + i * 20
  })).filter(l => l.knowledge.length > 0 || true)

  const mechanics = [
    { id: 'm_dodge', type: 'avoid', physics: 'inertia' },
    { id: 'm_thrust', type: 'propel', physics: 'acceleration' },
    { id: 'm_boss', type: 'combat', physics: 'forceAnalysis' }
  ]

  const formulaList = formulas.length > 0 ? formulas.map(f => f.latex || f.formula || String(f)) : ['F=ma', 'v=v₀+at', 'E=mc²']

  return [
    {
      agentId: 'scholar', name: '知识拆解师', emoji: '📚', color: C.blue,
      text: `收到教材《${title}》，已拆解出 ${knowledgePoints.length} 个核心知识点和 ${errorProne.length} 个高频易错点。难度曲线建议从中等起步、逐级递增。下面是我的 knowledgePoints 配置块，关卡设计师可以直接消费这些 id：`,
      snippet: { knowledgePoints, difficulty: 'progressive', errorProne, formulas: formulaList }
    },
    {
      agentId: 'designer', name: '关卡设计师', emoji: '🎮', color: C.orange,
      text: `基于知识图谱设计了 ${levels.length} 关递进关卡，引擎用 Phaser 的 Arcade Physics，每关绑定一组知识点 id。核心机制走 ${levels.map(l => l.mechanic).join(' → ')} 三段式，3 分钟内有爽点。levels 与 mechanics 配置如下：`,
      snippet: { levels, mechanics }
    },
    {
      agentId: 'art', name: '美术指导', emoji: '🎨', color: C.pink,
      text: `主题定为「${theme.name}」，配色与平台主视觉统一（复古未来主义），用色彩给每个知识点编码。资产清单已对齐 Phaser sprite sheet 规范，可由 Pixi 纹理加载器直接消费。theme 与 assets 配置如下：`,
      snippet: {
        theme: { name: theme.name, subject: theme.subject, palette: { bg: '#05010f', primary: '#a78bfa', accent: '#F5A623' }, style: 'retro-futurism', renderer: 'Phaser.Arcade' },
        assets: [
          { id: 'spr_player', type: 'spritesheet', src: '/assets/player.png', frames: 8 },
          { id: 'spr_orb', type: 'image', src: '/assets/orb.png' },
          { id: 'bg_starfield', type: 'tileSprite', src: '/assets/starfield.png' },
          { id: 'sfx_hit', type: 'audio', src: '/assets/hit.wav' }
        ]
      }
    },
    {
      agentId: 'tester', name: '体验测试员', emoji: '🫠', color: C.primary,
      text: `我跑了一遍内部 playtest。新手引导认知负荷偏高，${levels[1]?.id || 'L2'} 难度跨度太大、弃游点就在 ${levels[1]?.id || 'L2'} 开头。已写入 playtest 报告和调优建议，建议关卡设计师按此微调 levels：`,
      snippet: {
        playtest: { dropOff: `${levels[1]?.id || 'L2'}-开头`, cognitiveLoad: 'high', clarityScore: 6.5, funScore: 8.2 },
        suggestions: [
          { target: levels[0]?.id || 'L1', action: '增加3秒引导提示' },
          { target: levels[1]?.id || 'L2', action: '拆分为两段降低难度跨度' },
          { target: 'global', action: '知识点光球色彩编码强化' }
        ]
      }
    }
  ]
}

// ── 默认协作脚本 ──
const COLLAB_SCRIPT_DEFAULT = [
  {
    agentId: 'scholar', name: '知识拆解师', emoji: '📚', color: C.blue,
    text: '尚未检测到已上传的教材，我将基于通用学科知识演示。已拆解出 5 个核心知识点和 3 个高频易错点。难度曲线建议从中等起步、逐级递增。下面是我的 knowledgePoints 配置块：',
    snippet: {
      knowledgePoints: [
        { id: 'kp1', name: '牛顿第一定律', difficulty: 2, mastery: 0 },
        { id: 'kp2', name: '惯性参考系', difficulty: 3, mastery: 0 },
        { id: 'kp3', name: '加速度 a=Δv/Δt', difficulty: 3, mastery: 0 },
        { id: 'kp4', name: 'F=ma', difficulty: 4, mastery: 0 },
        { id: 'kp5', name: '受力分析', difficulty: 5, mastery: 0 }
      ],
      difficulty: 'progressive',
      errorProne: ['惯性 vs 力', '质量 vs 重力', '参考系选取']
    }
  },
  {
    agentId: 'designer', name: '关卡设计师', emoji: '🎮', color: C.orange,
    text: '基于知识图谱设计了 3 关递进关卡，引擎用 Phaser 的 Arcade Physics，每关绑定一组知识点 id。核心机制走 dodge → thrust → boss 三段式，3 分钟内有爽点。levels 与 mechanics 配置如下：',
    snippet: {
      levels: [
        { id: 'L1', name: '惯性走廊', knowledge: ['kp1', 'kp2'], mechanic: 'dodge', target: 60 },
        { id: 'L2', name: '加速峡谷', knowledge: ['kp3', 'kp4'], mechanic: 'thrust', target: 80 },
        { id: 'L3', name: '受力终局', knowledge: ['kp4', 'kp5'], mechanic: 'boss', target: 100 }
      ],
      mechanics: [
        { id: 'm_dodge', type: 'avoid', physics: 'inertia' },
        { id: 'm_thrust', type: 'propel', physics: 'acceleration' },
        { id: 'm_boss', type: 'combat', physics: 'forceAnalysis' }
      ]
    }
  },
  {
    agentId: 'art', name: '美术指导', emoji: '🎨', color: C.pink,
    text: '主题定为「深空逃亡」，配色与平台主视觉统一（复古未来主义），用色彩给每个知识点编码。资产清单已对齐 Phaser sprite sheet 规范，可由 Pixi 纹理加载器直接消费。theme 与 assets 配置如下：',
    snippet: {
      theme: { name: '深空逃亡', palette: { bg: '#05010f', primary: '#a78bfa', accent: '#F5A623' }, style: 'retro-futurism', renderer: 'Phaser.Arcade' },
      assets: [
        { id: 'spr_player', type: 'spritesheet', src: '/assets/player.png', frames: 8 },
        { id: 'spr_orb', type: 'image', src: '/assets/orb.png' },
        { id: 'bg_starfield', type: 'tileSprite', src: '/assets/starfield.png' },
        { id: 'sfx_hit', type: 'audio', src: '/assets/hit.wav' }
      ]
    }
  },
  {
    agentId: 'tester', name: '体验测试员', emoji: '🫠', color: C.primary,
    text: '我跑了一遍内部 playtest。新手引导认知负荷偏高，L2 难度跨度太大、弃游点就在 L2 开头。已写入 playtest 报告和调优建议，建议关卡设计师按此微调 levels：',
    snippet: {
      playtest: { dropOff: 'L2-开头', cognitiveLoad: 'high', clarityScore: 6.5, funScore: 8.2 },
      suggestions: [
        { target: 'L1', action: '增加3秒引导提示' },
        { target: 'L2', action: '拆分为L2a/L2b两段' },
        { target: 'global', action: '知识点光球色彩编码强化' }
      ]
    }
  }
]

// ── 预览场景素材 ──
const PREVIEW_STARS = [
  { left: '8%', top: '12%', size: 2, dur: 2.4, delay: '0s' },
  { left: '22%', top: '8%', size: 3, dur: 3, delay: '0.6s' },
  { left: '38%', top: '18%', size: 2, dur: 2.2, delay: '1.2s' },
  { left: '55%', top: '10%', size: 3, dur: 3.4, delay: '0.3s' },
  { left: '70%', top: '20%', size: 2, dur: 2.6, delay: '0.9s' },
  { left: '85%', top: '14%', size: 3, dur: 3, delay: '1.5s' },
  { left: '15%', top: '26%', size: 2, dur: 2.8, delay: '1.8s' },
  { left: '48%', top: '6%', size: 2, dur: 2.2, delay: '1.1s' },
  { left: '78%', top: '28%', size: 2, dur: 3.2, delay: '0.7s' },
]
const PREVIEW_ORBS = [
  { left: '20%', bottom: '42%', color: C.primary, dur: 3, delay: '0s', label: 'F' },
  { left: '40%', bottom: '55%', color: C.accent,  dur: 3.4, delay: '0.5s', label: 'a' },
  { left: '60%', bottom: '40%', color: C.green,   dur: 2.8, delay: '1s', label: 'v' },
  { left: '76%', bottom: '54%', color: C.blue,    dur: 3.2, delay: '1.5s', label: 'm' },
]
const GRID_FLOOR = {
  height: '46%',
  backgroundImage: 'repeating-linear-gradient(90deg, rgba(167,139,250,0.22) 0 1px, transparent 1px 38px), repeating-linear-gradient(0deg, rgba(167,139,250,0.22) 0 1px, transparent 1px 38px), linear-gradient(transparent, rgba(167,139,250,0.16))',
  backgroundSize: '38px 38px, 38px 38px, 100% 100%',
  animation: 'wsGridScroll 1.4s linear infinite',
  transform: 'perspective(220px) rotateX(62deg)',
  transformOrigin: 'bottom',
  opacity: 0.85,
}

// ── JSON 语法高亮 ──
function jsonToLines(value, depth = 0, suffix = '') {
  const lines = []
  const push = (indent, ...parts) => lines.push({ indent, parts })
  if (value === null) { push(depth, { t: 'null', c: C.pink }, { t: suffix, c: C.textMuted }); return lines }
  const t = typeof value
  if (t === 'boolean') { push(depth, { t: String(value), c: C.pink }, { t: suffix, c: C.textMuted }); return lines }
  if (t === 'number') { push(depth, { t: String(value), c: C.accent }, { t: suffix, c: C.textMuted }); return lines }
  if (t === 'string') { push(depth, { t: `"${value}"`, c: C.green }, { t: suffix, c: C.textMuted }); return lines }
  if (Array.isArray(value)) {
    if (value.length === 0) { push(depth, { t: '[]', c: C.textMuted }, { t: suffix, c: C.textMuted }); return lines }
    push(depth, { t: '[', c: C.textMuted })
    value.forEach((v, i) => { jsonToLines(v, depth + 1, i < value.length - 1 ? ',' : '').forEach(l => lines.push(l)) })
    push(depth, { t: ']', c: C.textMuted }, { t: suffix, c: C.textMuted })
    return lines
  }
  const keys = Object.keys(value)
  if (keys.length === 0) { push(depth, { t: '{}', c: C.textMuted }, { t: suffix, c: C.textMuted }); return lines }
  push(depth, { t: '{', c: C.textMuted })
  keys.forEach((k, i) => {
    const sfx = i < keys.length - 1 ? ',' : ''
    const v = value[k]
    if (v !== null && typeof v === 'object') {
      // Let jsonToLines handle brackets; merge first line with key
      const subLines = jsonToLines(v, depth + 1, sfx)
      if (subLines.length > 0) {
        push(depth + 1, { t: `"${k}"`, c: C.primary }, { t: ': ', c: C.textMuted }, ...subLines[0].parts)
        subLines.slice(1).forEach(l => lines.push(l))
      }
    } else {
      const prim = jsonToLines(v, 0, sfx)[0].parts
      push(depth + 1, { t: `"${k}"`, c: C.primary }, { t: ': ', c: C.textMuted }, ...prim)
    }
  })
  push(depth, { t: '}', c: C.textMuted }, { t: suffix, c: C.textMuted })
  return lines
}

function JsonView({ value }) {
  const lines = jsonToLines(value)
  return html`
    <div class="font-mono text-[12px] leading-[1.7]">
      ${lines.map((l, i) => html`
        <div key=${i} style=${{ paddingLeft: `${l.indent * 1.5}ch` }}>
          ${l.parts.map((p, j) => html`<span key=${j} style=${{ color: p.c }}>${p.t}</span>`)}
        </div>
      `)}
    </div>
  `
}

// ── 按钮 ──
function Btn({ children, onClick, primary, accent, ghost, danger, disabled, size }) {
  let style
  const pad = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm'
  if (accent) style = { background: 'linear-gradient(135deg,#F5A623,#fbbf24)', color: '#05010f', boxShadow: '0 0 16px rgba(245,166,35,0.4)' }
  else if (primary) style = { background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', color: '#fff', boxShadow: '0 0 16px rgba(167,139,250,0.35)' }
  else if (danger) style = { background: 'rgba(248,113,113,0.1)', color: C.red, border: `1px solid rgba(248,113,113,0.3)` }
  else if (ghost) style = { background: 'transparent', color: C.textMuted, border: `1px solid ${C.border}` }
  else style = { background: 'rgba(255,255,255,0.06)', color: C.text, border: `1px solid ${C.border}` }
  return html`
    <button class="${pad} rounded-lg font-medium transition-all duration-200" style=${style}
      onClick=${onClick} disabled=${disabled}
      onMouseEnter=${(e) => { if (!disabled) e.target.style.filter = 'brightness(1.15)' }}
      onMouseLeave=${(e) => { e.target.style.filter = 'none' }}>${children}</button>
  `
}

// ── 状态标签 ──
const STATUS_META = {
  idle:     { label: '待开始', color: C.textDim, dot: '#5a5a7a' },
  running:  { label: '构建中', color: C.primary, dot: C.primary },
  paused:   { label: '已暂停', color: C.accent, dot: C.accent },
  finished: { label: '已就绪', color: C.green, dot: C.green },
}

// ── 引擎模式标签 ──
function getEngineInfo(settings) {
  const mode = settings?.engineMode || 'demo'
  if (mode === 'apikey')    return { emoji: '🔑', label: 'API',   color: C.green }
  if (mode === 'localbridge') return { emoji: '🌉', label: 'BRIDGE', color: C.accent }
  return { emoji: '🎭', label: 'DEMO',  color: C.primary }
}

export default function WorkspaceView() {
  const { state, dispatch, goStep, toast } = useContext(AppContext)
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [status, setStatus] = useState('idle')
  const [stepIdx, setStepIdx] = useState(-1)
  const [messages, setMessages] = useState([])
  const [config, setConfig] = useState({})
  const [streamingText, setStreamingText] = useState('')
  const [currentAgent, setCurrentAgent] = useState(null)
  const [activeTab, setActiveTab] = useState('preview')

  const runningRef = useRef(false)
  const cancelRef = useRef(false)
  const chatEndRef = useRef(null)

  const sleep = (ms) => new Promise(r => setTimeout(r, ms))

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'end' }) }, [messages, streamingText, reducedMotion])

  const goPlay = useCallback(() => { toast('正在加载游戏场景…', 'info'); goStep(STEPS.PREVIEW) }, [toast, goStep])
  const goBack = useCallback(() => { goStep(STEPS.UPLOAD) }, [goStep])
  const goStudio = useCallback(() => { goStep(STEPS.AISTUDIO) }, [goStep])

  const typeText = async (full, onTick) => {
    let i = 0
    while (i < full.length) {
      if (cancelRef.current) return false
      if (!runningRef.current) { await sleep(140); continue }
      i = Math.min(full.length, i + 2)
      onTick(full.slice(0, i))
      await sleep(22)
    }
    return true
  }

  const collabScript = useRef(generateCollabScript(state.material))

  useEffect(() => { collabScript.current = generateCollabScript(state.material) }, [state.material])

  const play = async () => {
    runningRef.current = true
    cancelRef.current = false
    setStatus('running')
    const script = collabScript.current
    for (let i = 0; i < script.length; i++) {
      if (cancelRef.current) break
      setStepIdx(i)
      const step = script[i]
      setCurrentAgent(step)
      setStreamingText('')
      const ok = await typeText(step.text, setStreamingText)
      if (!ok) break
      if (cancelRef.current) break
      setConfig(prev => ({ ...prev, ...step.snippet }))
      setMessages(prev => [...prev, { ...step, content: step.text, snippet: step.snippet, idx: i, ts: Date.now() + i }])
      setCurrentAgent(null)
      setStreamingText('')
      await sleep(850)
      if (cancelRef.current) break
    }
    if (!cancelRef.current) {
      const finalConfig = {}
      script.forEach(s => Object.assign(finalConfig, s.snippet))
      const themeName = finalConfig.theme?.name || '知识探索'
      setConfig(finalConfig); setStepIdx(script.length); setStatus('finished'); setCurrentAgent(null)
      dispatch({ type: 'SET_DOC', payload: { title: themeName, config: finalConfig, meta: { agents: AGENTS.map(a => a.id), generatedAt: new Date().toISOString(), source: state.material?.filename || 'demo' } } })
      toast('游戏配置已生成', 'success')
    }
    runningRef.current = false
  }

  const startBuild = () => {
    if (status === 'paused') { runningRef.current = true; setStatus('running'); return }
    if (runningRef.current) return
    setMessages([]); setConfig({}); setStepIdx(-1); setStreamingText(''); setCurrentAgent(null)
    play()
  }
  const pauseBuild = () => { runningRef.current = false; setStatus('paused') }
  const resetBuild = () => {
    cancelRef.current = true; runningRef.current = false
    setStatus('idle'); setStepIdx(-1); setMessages([]); setConfig({}); setStreamingText(''); setCurrentAgent(null)
  }

  const exportConfig = () => {
    const json = JSON.stringify(config, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'game.json'
    a.click()
    URL.revokeObjectURL(url)
    toast('game.json 已下载', 'success')
  }

  const isIdle = status === 'idle', isRunning = status === 'running', isPaused = status === 'paused', isFinished = status === 'finished'
  const script = collabScript.current
  const progress = Math.round((messages.length / script.length) * 100)
  const panelHeight = 'calc(100vh - 300px)'
  const currentMaterialName = state.material?.filename || '尚未载入教材（演示模式）'
  const teamCount = state.selectedAgents?.length || 4
  const statusMeta = STATUS_META[status]
  const configKeys = Object.keys(config)
  const engineInfo = getEngineInfo(state.settings)
  const themeName = config.theme?.name || '待生成'

  return html`
    <div class="fade-in">
      <style>${WS_CSS}</style>
      <div class="sr-only" aria-live="polite">
        ${isFinished ? '游戏配置已准备好，可以进入试玩。' : isRunning ? 'AI 团队正在持续注入配置。' : isPaused ? '构建已暂停。' : '工作台待开始。'}
      </div>

      <!-- ═══ 头部：品牌 + 状态 + 操作 ═══ -->
      <div class="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div class="flex items-center gap-3 min-w-0">
          <!-- 品牌图标 -->
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
               style=${{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 0 14px rgba(139,92,246,0.35)' }}>知</div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold truncate" style=${{ color: C.text }}>知识不进脑子啊</h2>
              <span class="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded" style=${{ background: 'rgba(167,139,250,0.1)', color: C.textMuted }}>AI协作工作台</span>
            </div>
            <div class="flex items-center gap-2 mt-0.5 text-[11px] flex-wrap">
              <span class="inline-flex items-center gap-1" style=${{ color: C.textMuted }}>
                <span class="w-1.5 h-1.5 rounded-full" style=${{ background: statusMeta.dot, animation: isRunning ? 'wsPulse 1s ease-in-out infinite' : 'none' }}></span>
                ${statusMeta.label}
              </span>
              <span style=${{ color: C.textDim }}>·</span>
              <span class="truncate max-w-[180px]" style=${{ color: C.textMuted }}>${currentMaterialName}</span>
              <span style=${{ color: C.textDim }}>·</span>
              <span style=${{ color: C.textMuted }}>${teamCount} AI</span>
              <span style=${{ color: C.textDim }}>·</span>
              <span class="inline-flex items-center gap-0.5" style=${{ color: engineInfo.color }}>
                ${engineInfo.emoji} ${engineInfo.label}
              </span>
            </div>
          </div>
        </div>
        <div class="flex gap-2 flex-wrap shrink-0 items-center">
          <${Btn} ghost size="sm" onClick=${goBack}>← 教材</${Btn}>
          <${Btn} ghost size="sm" onClick=${goStudio}>🎛 AI Studio</${Btn}>
          ${isIdle && html`<${Btn} primary onClick=${startBuild}>▶ 开始构建</${Btn}>`}
          ${isRunning && html`<${Btn} onClick=${pauseBuild}>⏸ 暂停</${Btn}>`}
          ${isPaused && html`<${Btn} primary onClick=${startBuild}>▶ 继续</${Btn}>`}
          ${!isIdle && html`<${Btn} ghost size="sm" onClick=${resetBuild}>🔄 重来</${Btn}>`}
          ${configKeys.length > 0 && html`<${Btn} ghost size="sm" onClick=${exportConfig}>⬇ 导出</${Btn}>`}
          ${isFinished && html`<${Btn} accent onClick=${goPlay}>立即试玩 →</${Btn}>`}
        </div>
      </div>

      <!-- ═══ 进度条 + 智能体步骤 ═══ -->
      <div class="mb-4 rounded-xl p-3.5" style=${{ background: C.surface, border: `1px solid ${C.border}` }}>
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-3 text-xs">
            <span class="font-bold tracking-wider" style=${{ color: C.textMuted }}>构建进度</span>
            <span class="font-mono tabular-nums" style=${{ color: C.primary }}>${progress}%</span>
            <span style=${{ color: C.textDim }}>·</span>
            <span style=${{ color: C.textDim }}>${messages.length} / ${script.length} 轮</span>
            <span style=${{ color: C.textDim }}>·</span>
            <span style=${{ color: C.textMuted }}>主题: ${themeName}</span>
          </div>
        </div>
        <div class="h-1.5 rounded-full overflow-hidden" style=${{ background: 'rgba(255,255,255,0.06)' }}>
          <div class="h-full rounded-full transition-all duration-500"
               style=${{ width: `${progress}%`, background: 'linear-gradient(90deg,#a78bfa,#F5A623)' }}></div>
        </div>
        <div class="flex gap-1.5 mt-2.5 flex-wrap">
          ${script.map((s, i) => {
            const done = i < messages.length
            const active = i === stepIdx && isRunning
            return html`
              <span key=${i} class="text-[10px] px-2 py-0.5 rounded-full transition-all"
                style=${done
                  ? { background: 'rgba(74,222,128,0.12)', color: C.green, border: '1px solid rgba(74,222,128,0.3)' }
                  : active
                    ? { background: 'rgba(167,139,250,0.15)', color: C.primary, border: `1px solid ${C.primary}40` }
                    : { background: 'transparent', color: C.textDim, border: `1px solid ${C.border}` }}>
                ${done ? '✓ ' : ''}${s.emoji} ${s.name}
              </span>
            `
          })}
        </div>
      </div>

      <!-- ═══ 主体：左协作频道 + 右输出面板 ═══ -->
      <div class="grid lg:grid-cols-5 gap-4">

        <!-- 左侧：协作频道 -->
        <div class="lg:col-span-3 flex flex-col rounded-2xl overflow-hidden"
          style=${{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, height: panelHeight, minHeight: '420px' }}>
          <div class="px-4 py-3 flex items-center justify-between shrink-0"
               style=${{ borderBottom: `1px solid ${C.border}`, background: 'rgba(167,139,250,0.04)' }}>
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-base">${currentAgent?.emoji || (isFinished ? '✅' : '🛰️')}</span>
              <span class="text-sm font-bold truncate" style=${{ color: C.text }}>
                ${currentAgent ? `${currentAgent.name} 正在注入配置` : isFinished ? '配置构建完成' : '协作频道 #game-config'}
              </span>
            </div>
            <div class="flex -space-x-1.5 shrink-0">
              ${AGENTS.map(a => html`<div key=${a.id} class="w-6 h-6 rounded-full flex items-center justify-center text-[10px]" style=${{ background: a.color, color: '#05010f', border: '1.5px solid #05010f' }}>${a.emoji}</div>`)}
            </div>
          </div>
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            ${messages.length === 0 && !currentAgent ? html`<${EmptyState} />` : null}
            ${messages.map(m => html`<${CompletedBubble} key=${m.ts} msg=${m} />`)}
            ${currentAgent && html`<${StreamingBubble} agent=${currentAgent} text=${streamingText} />`}
            <div ref=${chatEndRef} />
          </div>
        </div>

        <!-- 右侧：输出面板 -->
        <div class="lg:col-span-2 flex flex-col rounded-2xl overflow-hidden"
          style=${{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, height: panelHeight, minHeight: '420px' }}>
          <div class="flex shrink-0" style=${{ borderBottom: `1px solid ${C.border}` }}>
            ${[['preview', '预览', '🛸'], ['config', '配置', '⚙️']].map(([id, label, icon]) => html`
              <button key=${id} class="flex-1 px-4 py-3 text-sm font-medium transition-all"
                style=${activeTab === id
                  ? { color: C.text, background: 'rgba(167,139,250,0.06)', borderBottom: `2px solid ${C.primary}` }
                  : { color: C.textMuted, borderBottom: '2px solid transparent' }}
                onClick=${() => setActiveTab(id)}>${icon} ${label}</button>
            `)}
          </div>
          <div class="flex-1 overflow-y-auto">
            ${activeTab === 'preview'
              ? html`<${PreviewScene} finished=${isFinished} progress=${progress} onPlay=${goPlay} themeName=${themeName} configKeys=${configKeys} />`
              : html`<${ConfigPanel} config=${config} finished=${isFinished} onPlay=${goPlay} onExport=${exportConfig} />`}
          </div>
        </div>
      </div>
    </div>
  `
}

// ── 空状态 ──
function EmptyState() {
  return html`
    <div class="h-full flex flex-col items-center justify-center text-center px-6" style=${{ color: C.textDim }}>
      <div class="text-5xl mb-3 opacity-50">🛰️</div>
      <p class="font-bold text-sm" style=${{ color: C.textMuted }}>协作频道已就绪</p>
      <p class="text-xs mt-2 max-w-xs leading-relaxed">
        点击「开始构建」，4 位 AI 智能体将依次注入 knowledgePoints / levels / theme / playtest 配置块，组装成可渲染的 game.json
      </p>
      <div class="mt-4 flex gap-2 flex-wrap justify-center">
        ${AGENTS.map(a => html`
          <span key=${a.id} class="text-[10px] px-2 py-1 rounded-full" style=${{ background: a.color + '15', color: a.color, border: `1px solid ${a.color}30` }}>
            ${a.emoji} ${a.name}
          </span>
        `)}
      </div>
    </div>
  `
}

// ── 流式消息气泡 ──
function StreamingBubble({ agent, text }) {
  return html`
    <div class="flex gap-2.5 msg-enter">
      <div class="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-base" style=${{ background: agent.color, color: '#05010f' }}>${agent.emoji}</div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-bold" style=${{ color: agent.color }}>${agent.name}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded" style=${{ background: 'rgba(167,139,250,0.1)', color: C.primary }}>注入中…</span>
        </div>
        <div class="text-sm leading-relaxed" style=${{ color: C.text }}>${text}<span class="ws-cursor" style=${{ color: C.primary }}>▍</span></div>
      </div>
    </div>
  `
}

// ── 已完成消息气泡 ──
function CompletedBubble({ msg }) {
  return html`
    <div class="flex gap-2.5 msg-enter">
      <div class="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-base" style=${{ background: msg.color, color: '#05010f' }}>${msg.emoji}</div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-bold" style=${{ color: msg.color }}>${msg.name}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded" style=${{ background: 'rgba(74,222,128,0.1)', color: C.green }}>已注入</span>
        </div>
        <div class="text-sm leading-relaxed mb-2" style=${{ color: C.text }}>${msg.content}</div>
        <div class="rounded-lg overflow-hidden" style=${{ background: '#0a0420', border: `1px solid ${C.border}` }}>
          <div class="px-3 py-1.5 flex items-center justify-between" style=${{ borderBottom: `1px solid ${C.border}`, background: 'rgba(167,139,250,0.04)' }}>
            <span class="text-[10px] font-mono" style=${{ color: C.textMuted }}>// ${msg.agentId}.config.json</span>
            <span class="text-[10px] font-mono" style=${{ color: C.primary }}>+${Object.keys(msg.snippet).length} keys</span>
          </div>
          <div class="p-3 overflow-x-auto"><${JsonView} value=${msg.snippet} /></div>
        </div>
      </div>
    </div>
  `
}

// ── 配置面板 ──
function ConfigPanel({ config, finished, onPlay, onExport }) {
  const keys = Object.keys(config)
  return html`
    <div class="p-4 h-full flex flex-col">
      <div class="flex items-center justify-between mb-3 shrink-0">
        <div>
          <div class="text-xs font-bold tracking-wider" style=${{ color: C.textMuted }}>game.json</div>
          <div class="text-[10px] font-mono mt-0.5" style=${{ color: C.primary }}>${keys.length} 配置块 · ${keys.length}/4 智能体已贡献</div>
        </div>
        <div class="flex items-center gap-2">
          ${keys.length > 0 && html`<button class="text-[10px] px-2 py-1 rounded transition-all" style=${{ color: C.textMuted, border: `1px solid ${C.border}` }} onClick=${onExport}
            onMouseEnter=${(e) => { e.target.style.color = C.primary; e.target.style.borderColor = C.primary }}
            onMouseLeave=${(e) => { e.target.style.color = C.textMuted; e.target.style.borderColor = C.border }}>⬇ 下载</button>`}
          <div class="w-2 h-2 rounded-full" style=${{ background: finished ? C.green : C.accent, boxShadow: `0 0 8px ${finished ? C.green : C.accent}`, animation: 'wsPulse 1.2s ease-in-out infinite' }}></div>
        </div>
      </div>

      <div class="rounded-lg overflow-hidden flex-1 min-h-0" style=${{ background: '#0a0420', border: `1px solid ${C.border}` }}>
        <div class="px-3 py-2 text-[10px] font-mono flex items-center gap-1.5 shrink-0" style=${{ borderBottom: `1px solid ${C.border}`, color: C.textMuted }}>
          <span style=${{ color: C.red }}>●</span><span style=${{ color: C.accentLight }}>●</span><span style=${{ color: C.green }}>●</span>
          <span class="ml-2">~/build/game.json</span>
        </div>
        <div class="p-3 overflow-auto" style=${{ maxHeight: '100%' }}>
          ${keys.length === 0
            ? html`<div class="text-xs font-mono" style=${{ color: C.textDim }}>// 等待智能体注入配置…</div>`
            : html`<${JsonView} value=${config} />`}
        </div>
      </div>

      ${finished ? html`
        <div class="mt-3 p-3 rounded-xl text-center shrink-0" style=${{ background: 'linear-gradient(135deg, rgba(167,139,250,0.12), rgba(245,166,35,0.08))', border: `1px solid ${C.border}` }}>
          <div class="text-sm font-bold mb-1" style=${{ color: C.text }}>游戏配置已生成</div>
          <div class="text-xs mb-3" style=${{ color: C.textMuted }}>game.json 已就绪，可交给 Phaser / Pixi 渲染引擎</div>
          <button class="px-4 py-2 rounded-lg text-sm font-bold w-full transition-all"
            style=${{ background: 'linear-gradient(135deg,#F5A623,#fbbf24)', color: '#05010f', boxShadow: '0 0 16px rgba(245,166,35,0.4)' }}
            onMouseEnter=${(e) => { e.target.style.filter = 'brightness(1.15)' }}
            onMouseLeave=${(e) => { e.target.style.filter = 'none' }}
            onClick=${onPlay}>立即试玩 →</button>
        </div>
      ` : html`
        <div class="mt-2 text-[10px] flex items-center gap-1.5 shrink-0" style=${{ color: C.textDim }}>
          <span class="ws-cursor" style=${{ color: C.primary }}>▍</span>
          <span>配置随智能体发言实时增长…</span>
        </div>
      `}
    </div>
  `
}

// ── 预览场景 ──
function PreviewScene({ finished, progress, onPlay, themeName, configKeys }) {
  const sceneCount = Math.max(1, Math.ceil(progress / 34))
  return html`
    <div class="p-4">
      <div class="relative w-full overflow-hidden rounded-xl" style=${{ height: '260px', background: C.bg, border: `1px solid ${C.border}` }}>
        ${PREVIEW_STARS.map((s, i) => html`<div key=${i} class="absolute rounded-full" style=${{ left: s.left, top: s.top, width: s.size + 'px', height: s.size + 'px', background: '#f5e8ff', animation: `wsStarTwinkle ${s.dur}s ease-in-out ${s.delay} infinite` }}></div>`)}
        <div class="absolute bottom-0 left-0 right-0" style=${GRID_FLOOR}></div>
        ${PREVIEW_ORBS.map((o, i) => html`<div key=${i} class="absolute rounded-full flex items-center justify-center text-[9px] font-bold" style=${{ left: o.left, bottom: o.bottom, width: '22px', height: '22px', background: o.color, color: '#05010f', boxShadow: `0 0 10px ${o.color}`, animation: `wsOrbFloat ${o.dur}s ease-in-out ${o.delay} infinite` }}>${o.label}</div>`)}
        <div class="absolute text-2xl" style=${{ bottom: '38%', animation: 'wsCharRun 7s linear infinite' }}>🚀</div>
        <div class="absolute left-0 right-0 pointer-events-none" style=${{ height: '40%', background: 'linear-gradient(rgba(167,139,250,0) 0%, rgba(167,139,250,0.12) 50%, rgba(167,139,250,0) 100%)', animation: 'wsScanMove 4.5s linear infinite' }}></div>
        <div class="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-mono flex items-center gap-1.5" style=${{ background: 'rgba(5,1,15,0.7)', border: `1px solid ${C.border}`, color: finished ? C.green : C.accent }}>
          <span class="w-1.5 h-1.5 rounded-full" style=${{ background: finished ? C.green : C.accent, animation: 'wsPulse 1s ease-in-out infinite' }}></span>
          ${finished ? 'RENDER READY' : `BUILDING ${progress}%`}
        </div>
        <div class="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-mono" style=${{ background: 'rgba(5,1,15,0.7)', border: `1px solid ${C.border}`, color: C.textMuted }}>
          ${themeName}
        </div>
        <div class="absolute bottom-3 left-3 right-3">
          <div class="h-1 rounded-full overflow-hidden" style=${{ background: 'rgba(255,255,255,0.08)' }}>
            <div class="h-full rounded-full transition-all duration-500" style=${{ width: `${finished ? 100 : progress}%`, background: 'linear-gradient(90deg,#a78bfa,#F5A623)' }}></div>
          </div>
        </div>
      </div>

      <div class="mt-3 grid grid-cols-2 gap-2 text-[11px]">
        ${[['引擎', 'Phaser.Arcade'], ['分辨率', '800×500'], ['帧率', '60 FPS'], ['场景', `${sceneCount} / 3`]].map(([k, v], i) => html`
          <div key=${i} class="px-2.5 py-1.5 rounded-lg flex items-center justify-between" style=${{ background: C.surface, border: `1px solid ${C.border}` }}>
            <span style=${{ color: C.textMuted }}>${k}</span>
            <span class="font-mono" style=${{ color: C.primary }}>${v}</span>
          </div>
        `)}
      </div>

      ${finished ? html`
        <button class="mt-3 w-full px-4 py-2.5 rounded-lg text-sm font-bold transition-all"
          style=${{ background: 'linear-gradient(135deg,#F5A623,#fbbf24)', color: '#05010f', boxShadow: '0 0 16px rgba(245,166,35,0.4)' }}
          onMouseEnter=${(e) => { e.target.style.filter = 'brightness(1.15)' }}
          onMouseLeave=${(e) => { e.target.style.filter = 'none' }}
          onClick=${onPlay}>进入试玩 →</button>
      ` : html`
        <p class="mt-3 text-[10px] text-center" style=${{ color: C.textDim }}>
          智能体注入配置后，场景将逐步可玩
        </p>
      `}
    </div>
  `
}
