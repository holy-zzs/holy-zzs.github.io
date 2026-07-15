import { html, useState, useMemo, useEffect, useRef } from '../../../deps.js'

/**
 * AgentHologramCards v6 — 8智能体非均匀拓扑交互
 *
 * v6 核心升级:
 *   - 8个智能体（新增音效/关卡/测试），非均匀布局营造轻松交流氛围
 *   - 交叉对话连线（CROSS_LINKS），智能体之间直接连线聊天
 *   - 自然对话聚类：顶部对聊、右侧协作、底部讨论、中心审视
 *   - 对话气泡方向感知，避免遮挡
 *   - 拓扑图形 + 星云 + 星尘 + 扫描线 全部保留
 */

const AGENTS = [
  {
    id: 'producer',
    name: 'AI Producer',
    nameCn: '制作人',
    role: '统筹全局',
    img: '/assets/agents/agent-producer-v3.jpg',
    color: '#FCD34D',
    colorRgb: '252, 211, 77',
    badge: 'AI-01',
    dialogues: [
      '创意收到，大家先聊聊方向？',
      '音效和美术先对一下风格。',
      '这版不错，准备打包验收。',
    ],
    pos: { top: '9%', left: '34%' },
    bubbleDir: 'bottom',
  },
  {
    id: 'sound',
    name: 'Sound Director',
    nameCn: '音效总监',
    role: '声场设计',
    img: '/assets/agents/agent-sound-v3.jpg',
    color: '#14B8A6',
    colorRgb: '20, 184, 166',
    badge: 'AI-06',
    dialogues: [
      'BGM 12 段搞定了，听听看？',
      '环境音 48 组，3D 空间音频已接入。',
      '刚才那段战斗曲加了点电子混响。',
    ],
    pos: { top: '16%', left: '66%' },
    bubbleDir: 'bottom',
  },
  {
    id: 'gameplay',
    name: 'Gameplay Director',
    nameCn: '玩法总监',
    role: '核心机制',
    img: '/assets/agents/agent-gameplay-v3.jpg',
    color: '#FB923C',
    colorRgb: '251, 146, 60',
    badge: 'AI-02',
    dialogues: [
      '战斗循环跑通了，手感很爽。',
      '技能树 42 节点，5 种流派随便选。',
      '世界观那边，主线Boss我加了彩蛋。',
    ],
    pos: { top: '31%', left: '84%' },
    bubbleDir: 'left',
  },
  {
    id: 'system',
    name: 'System Designer',
    nameCn: '系统设计师',
    role: '经济数值',
    img: '/assets/agents/agent-system-v3.jpg',
    color: '#3B82F6',
    colorRgb: '59, 130, 246',
    badge: 'AI-05',
    dialogues: [
      '经济模型稳了，通胀率 < 3%。',
      'QA 那边帮我跑一下边界条件呗？',
      '装备 6 阶品质，词条平衡过了。',
    ],
    pos: { top: '36%', left: '13%' },
    bubbleDir: 'right',
  },
  {
    id: 'qa',
    name: 'QA Engineer',
    nameCn: '测试工程师',
    role: '质量守护',
    img: '/assets/agents/agent-qa-v3.jpg',
    color: '#EF4444',
    colorRgb: '239, 68, 68',
    badge: 'AI-08',
    dialogues: [
      '回归测试 200+ 用例，0 阻塞缺陷。',
      '性能跑分 60FPS 稳定，放心。',
      '关卡那边，第 17 关有个穿墙 bug。',
    ],
    pos: { top: '53%', left: '44%' },
    bubbleDir: 'right',
  },
  {
    id: 'world',
    name: 'World Architect',
    nameCn: '世界观架构师',
    role: '叙事构建',
    img: '/assets/agents/agent-world-v3.jpg',
    color: '#22D3EE',
    colorRgb: '34, 211, 238',
    badge: 'AI-03',
    dialogues: [
      '世界观搞定了：3 文明，12 阵营。',
      '主线 7 章，23 个分支结局。',
      '关卡设计，第 5 章地图我加了个隐藏区域。',
    ],
    pos: { top: '60%', left: '77%' },
    bubbleDir: 'left',
  },
  {
    id: 'level',
    name: 'Level Designer',
    nameCn: '关卡设计师',
    role: '关卡布局',
    img: '/assets/agents/agent-level-v3.jpg',
    color: '#84CC16',
    colorRgb: '132, 204, 22',
    badge: 'AI-07',
    dialogues: [
      '关卡 30 关，难度曲线很丝滑。',
      '隐藏关卡 5 个，彩蛋 12 处埋好了。',
      '美术老师，第 8 关光影帮我看下？',
    ],
    pos: { top: '76%', left: '56%' },
    bubbleDir: 'top',
  },
  {
    id: 'art',
    name: 'Art Director',
    nameCn: '美术总监',
    role: '视觉风格',
    img: '/assets/agents/agent-art-v3.jpg',
    color: '#A855F7',
    colorRgb: '168, 85, 247',
    badge: 'AI-04',
    dialogues: [
      '美术风格锁定，色板 48 色。',
      '角色立绘 15 张，场景 8 张。',
      '第 8 关光影我来调，稍等。',
    ],
    pos: { top: '83%', left: '21%' },
    bubbleDir: 'top',
  },
]

/* ── 交叉对话连线（非均匀，轻松聊天） ── */
const CROSS_LINKS = [
  { from: 'producer', to: 'sound' },     // 顶部对聊
  { from: 'gameplay', to: 'world' },     // 右侧协作
  { from: 'level', to: 'art' },          // 底部讨论
  { from: 'qa', to: 'system' },          // 中心↔左侧
  { from: 'world', to: 'level' },        // 右下关联
  { from: 'sound', to: 'gameplay' },     // 右上传话
]

/* ── 打字机 Hook ── */
function useTypewriter(text, speed = 32, enabled = true) {
  const [displayed, setDisplayed] = useState(enabled ? '' : text)
  const [done, setDone] = useState(!enabled)
  useEffect(() => {
    if (!enabled) { setDisplayed(text); setDone(true); return }
    setDisplayed('')
    setDone(false)
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.substring(0, i + 1))
        i++
      } else {
        setDone(true)
        clearInterval(timer)
      }
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed, enabled])
  return { displayed, done }
}

/* ═══ 拓扑学图形生成器 ═══ */

function torusKnotPath(p, q, cx = 50, cy = 50, R = 26, r = 8, steps = 300) {
  let path = ''
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const x = cx + (R + r * Math.cos(q * t)) * Math.cos(p * t)
    const y = cy + (R + r * Math.cos(q * t)) * Math.sin(p * t) * 0.85
    path += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2) + ' '
  }
  return path + 'Z'
}

function trefoilPath(cx = 50, cy = 50, scale = 20, steps = 300) {
  let path = ''
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const x = cx + scale * (Math.sin(t) + 2 * Math.sin(2 * t)) / 3
    const y = cy + scale * (Math.cos(t) - 2 * Math.cos(2 * t)) / 3
    path += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2) + ' '
  }
  return path + 'Z'
}

function mobiusEdgePath(cx = 50, cy = 50, R = 22, w = 6, steps = 300, edge = 1) {
  let path = ''
  for (let i = 0; i <= steps; i++) {
    const u = (i / steps) * Math.PI * 2
    const v = edge * w
    const x = cx + (R + v * Math.cos(u / 2)) * Math.cos(u)
    const y = cy + (R + v * Math.cos(u / 2)) * Math.sin(u) * 0.85
    path += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2) + ' '
  }
  return path + 'Z'
}

function hopfLinkPaths(cx = 50, cy = 50, r = 18, offset = 10) {
  return {
    ring1: `M ${cx - r} ${cy} A ${r} ${r * 0.85} 0 1 0 ${cx + r} ${cy} A ${r} ${r * 0.85} 0 1 0 ${cx - r} ${cy} Z`,
    ring2: `M ${cx - r + offset} ${cy - offset * 0.5} A ${r} ${r * 0.85} 0 1 0 ${cx + r + offset} ${cy - offset * 0.5} A ${r} ${r * 0.85} 0 1 0 ${cx - r + offset} ${cy - offset * 0.5} Z`,
  }
}

function figureEightPath(cx = 50, cy = 50, scale = 14, steps = 300) {
  let path = ''
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const x = cx + scale * (2 + Math.cos(2 * t)) * Math.cos(t) / 2.5
    const y = cy + scale * (2 + Math.cos(2 * t)) * Math.sin(t) / 2.5
    path += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2) + ' '
  }
  return path + 'Z'
}

function lissajousPath(cx = 50, cy = 50, A = 24, B = 20, steps = 400) {
  let path = ''
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const x = cx + A * Math.sin(3 * t)
    const y = cy + B * Math.sin(2 * t + Math.PI / 4)
    path += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2) + ' '
  }
  return path + 'Z'
}

function starPolygonPath(cx = 50, cy = 50, R = 22, steps = 5) {
  let path = ''
  for (let i = 0; i <= steps; i++) {
    const angle = (i * 4 * Math.PI / steps) - Math.PI / 2
    const x = cx + R * Math.cos(angle)
    const y = cy + R * Math.sin(angle) * 0.85
    path += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2) + ' '
  }
  return path + 'Z'
}

/* ── SVG 渐变与滤镜定义 ── */
function SvgDefs() {
  return html`
    <defs>
      <linearGradient id="grad-knot-main" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#A855F7" stop-opacity="0.9" />
        <stop offset="50%" stop-color="#22D3EE" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#FCD34D" stop-opacity="0.6" />
      </linearGradient>
      <linearGradient id="grad-knot-alt" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#22D3EE" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.5" />
      </linearGradient>
      <linearGradient id="grad-mobius" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#A855F7" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#FB923C" stop-opacity="0.4" />
      </linearGradient>
      <linearGradient id="grad-trefoil" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FCD34D" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#A855F7" stop-opacity="0.5" />
      </linearGradient>
      <linearGradient id="grad-hopf" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#22D3EE" stop-opacity="0.4" />
      </linearGradient>
      <linearGradient id="grad-fig8" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FB923C" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#A855F7" stop-opacity="0.4" />
      </linearGradient>
      <linearGradient id="grad-lissajous" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#22D3EE" stop-opacity="0.6" />
        <stop offset="50%" stop-color="#A855F7" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#FCD34D" stop-opacity="0.4" />
      </linearGradient>
      <linearGradient id="grad-star" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FCD34D" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#FB923C" stop-opacity="0.3" />
      </linearGradient>

      <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="0.8" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  `
}

/* ── 拓扑学图形 SVG 层 ── */
function TopoShapes() {
  const knot23 = useMemo(() => torusKnotPath(2, 3, 50, 50, 26, 8), [])
  const knot32 = useMemo(() => torusKnotPath(3, 2, 50, 50, 22, 6), [])
  const trefoil = useMemo(() => trefoilPath(50, 50, 20), [])
  const mobiusA = useMemo(() => mobiusEdgePath(50, 50, 22, 6, 300, 1), [])
  const mobiusB = useMemo(() => mobiusEdgePath(50, 50, 22, 6, 300, -1), [])
  const hopf = useMemo(() => hopfLinkPaths(50, 50, 18, 10), [])
  const fig8 = useMemo(() => figureEightPath(50, 50, 16), [])
  const lissa = useMemo(() => lissajousPath(50, 50, 28, 22), [])
  const star = useMemo(() => starPolygonPath(50, 50, 24), [])

  return html`
    <svg class="topo-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      <${SvgDefs} />
      <path d=${star} class="topo-star-poly" stroke="url(#grad-star)" filter="url(#glow-soft)" />
      <path d=${lissa} class="topo-lissajous" stroke="url(#grad-lissajous)" filter="url(#glow-soft)" />
      <path d=${mobiusA} class="topo-mobius" stroke="url(#grad-mobius)" filter="url(#glow-soft)" />
      <path d=${mobiusB} class="topo-mobius topo-mobius-2" stroke="url(#grad-mobius)" filter="url(#glow-soft)" />
      <path d=${hopf.ring1} class="topo-hopf" stroke="url(#grad-hopf)" filter="url(#glow-soft)" />
      <path d=${hopf.ring2} class="topo-hopf topo-hopf-2" stroke="url(#grad-hopf)" filter="url(#glow-soft)" />
      <path d=${knot23} class="topo-knot topo-knot-main" stroke="url(#grad-knot-main)" filter="url(#glow-strong)" />
      <path d=${knot32} class="topo-knot topo-knot-alt" stroke="url(#grad-knot-alt)" filter="url(#glow-soft)" />
      <path d=${fig8} class="topo-fig8" stroke="url(#grad-fig8)" filter="url(#glow-soft)" />
      <path d=${trefoil} class="topo-trefoil" stroke="url(#grad-trefoil)" filter="url(#glow-soft)" />
    </svg>
  `
}

/* ── 星尘 ── */
function useStarDust(count = 40) {
  return useMemo(() => {
    const stars = []
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 4,
        duration: Math.random() * 3 + 2,
        opacity: Math.random() * 0.6 + 0.2,
        hue: Math.random() > 0.5 ? '168, 85, 247' : '34, 211, 238',
      })
    }
    return stars
  }, [count])
}

/* ── 灰色发光呼吸云层 ── */
function NebulaLayer() {
  return html`
    <div class="topo-nebula">
      <div class="topo-cloud topo-cloud-1"></div>
      <div class="topo-cloud topo-cloud-2"></div>
      <div class="topo-cloud topo-cloud-3"></div>
    </div>
  `
}

/* ── 神经网络连线（中心 hub + 交叉对话） ── */
function NeuralNet({ speakingId }) {
  const center = { x: 50, y: 50 }
  const agentMap = useMemo(() => {
    const m = {}
    AGENTS.forEach(a => { m[a.id] = { x: parseFloat(a.pos.left), y: parseFloat(a.pos.top), color: a.color, colorRgb: a.colorRgb } })
    return m
  }, [])

  // 当发言者有交叉连线时，高亮对应连线
  const activeCrossLinks = useMemo(() => {
    return CROSS_LINKS.filter(l => l.from === speakingId || l.to === speakingId)
  }, [speakingId])

  return html`
    <svg class="neural-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <!-- 中心 hub 连线 -->
      ${AGENTS.map(a => {
        const t = agentMap[a.id]
        return html`
          <line
            key=${`hub-${a.id}`}
            x1=${t.x} y1=${t.y}
            x2=${center.x} y2=${center.y}
            class=${`neural-line ${speakingId === a.id ? 'neural-line-active' : ''}`}
            stroke=${a.color}
            style=${{ '--line-rgb': a.colorRgb }}
          />
        `
      })}

      <!-- 交叉对话连线 -->
      ${CROSS_LINKS.map((link, i) => {
        const from = agentMap[link.from]
        const to = agentMap[link.to]
        const isActive = speakingId === link.from || speakingId === link.to
        return html`
          <line
            key=${`cross-${i}`}
            x1=${from.x} y1=${from.y}
            x2=${to.x} y2=${to.y}
            class=${`neural-cross ${isActive ? 'neural-cross-active' : ''}`}
            stroke=${isActive ? from.color : 'rgba(255,255,255,0.08)'}
            style=${{ '--cross-rgb': from.colorRgb }}
          />
        `
      })}

      <!-- 发言者的流动粒子（到中心） -->
      ${speakingId && html`
        <circle r="1" class="neural-particle" style=${{ '--pc': agentMap[speakingId].color }}>
          <animateMotion dur="2s" repeatCount="indefinite"
            path=${`M ${agentMap[speakingId].x} ${agentMap[speakingId].y} L ${center.x} ${center.y}`} />
        </circle>
        <circle r="0.6" class="neural-particle neural-particle-2" style=${{ '--pc': agentMap[speakingId].color }}>
          <animateMotion dur="2.5s" begin="0.8s" repeatCount="indefinite"
            path=${`M ${center.x} ${center.y} L ${agentMap[speakingId].x} ${agentMap[speakingId].y}`} />
        </circle>
      `}

      <!-- 交叉对话的流动粒子 -->
      ${activeCrossLinks.map((link, i) => {
        const from = agentMap[link.from]
        const to = agentMap[link.to]
        const isSender = speakingId === link.from
        const path = isSender
          ? `M ${from.x} ${from.y} L ${to.x} ${to.y}`
          : `M ${to.x} ${to.y} L ${from.x} ${from.y}`
        return html`
          <circle key=${`cp-${i}`} r="0.7" class="neural-particle neural-particle-2" style=${{ '--pc': from.color }}>
            <animateMotion dur="1.8s" begin=${`${i * 0.3}s`} repeatCount="indefinite" path=${path} />
          </circle>
        `
      })}
    </svg>
  `
}

/* ── 对话气泡 ── */
function DialogueBubble({ agent, isSpeaking }) {
  const dialogueIdx = useMemo(
    () => Math.floor(Math.random() * agent.dialogues.length),
    [agent.id, isSpeaking]
  )
  const text = agent.dialogues[dialogueIdx]
  const { displayed, done } = useTypewriter(text, 30, isSpeaking)

  if (!isSpeaking) return null

  const dirClass = `orb-bubble-${agent.bubbleDir || 'top'}`

  return html`
    <div class=${`orb-bubble ${dirClass}`} style=${{
      '--bubble-color': agent.color,
      '--bubble-rgb': agent.colorRgb,
    }}>
      <div class="orb-bubble-content">
        <span class="orb-bubble-name">${agent.nameCn}</span>
        <span class="orb-bubble-text">${displayed}${!done ? html`<span class="orb-bubble-cursor">▋</span>` : null}</span>
      </div>
      <div class="orb-bubble-arrow" style=${{
        background: `rgba(10, 8, 21, 0.92)`,
        borderColor: `rgba(${agent.colorRgb}, 0.3)`,
      }}></div>
    </div>
  `
}

/* ── 单个 Agent 头像 ── */
function AgentOrb({ agent, isSpeaking, onClick }) {
  return html`
    <div
      class=${`orb-node ${isSpeaking ? 'orb-speaking' : ''}`}
      style=${{
        top: agent.pos.top,
        left: agent.pos.left,
        '--orb-color': agent.color,
        '--orb-rgb': agent.colorRgb,
      }}
      onClick=${onClick}
    >
      <${DialogueBubble} agent=${agent} isSpeaking=${isSpeaking} />

      <div class="orb-ring-outer"></div>
      <div class="orb-ring-inner"></div>

      <div class="orb-portrait-wrap">
        <img src=${agent.img} alt=${agent.name} class="orb-portrait" loading="eager" />
        <div class="orb-portrait-glow"></div>
        <div class="orb-portrait-scan"></div>
      </div>

      <div class="orb-badge" style=${{ background: agent.color }}>${agent.badge}</div>

      <div class="orb-label">
        <span class="orb-label-name">${agent.nameCn}</span>
        <span class="orb-label-role">${agent.role}</span>
      </div>

      <div class=${`orb-status-dot ${isSpeaking ? 'orb-status-active' : ''}`}></div>
    </div>
  `
}

/* ═══ 主组件 ═══ */
export default function AgentHologramCards() {
  const [speakingId, setSpeakingId] = useState('producer')
  const stars = useStarDust(40)
  const timerRef = useRef(null)

  useEffect(() => {
    const order = AGENTS.map(a => a.id)
    let idx = 0
    timerRef.current = setInterval(() => {
      idx = (idx + 1) % order.length
      setSpeakingId(order[idx])
    }, 3500)
    return () => clearInterval(timerRef.current)
  }, [])

  const handleOrbClick = (id) => setSpeakingId(id)

  return html`
    <div class="topo-stage">
      <${NebulaLayer} />

      <div class="topo-stardust">
        ${stars.map((s, i) => html`
          <span key=${`sd-${i}`} class="topo-star" style=${{
            left: `${s.x}%`, top: `${s.y}%`,
            width: `${s.size}px`, height: `${s.size}px`,
            opacity: s.opacity,
            background: `rgba(${s.hue}, 0.8)`,
            boxShadow: `0 0 4px rgba(${s.hue}, 0.6)`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}></span>
        `)}
      </div>

      <${TopoShapes} />

      <${NeuralNet} speakingId=${speakingId} />

      <div class="topo-core">
        <div class="topo-core-ring"></div>
        <div class="topo-core-ring-2"></div>
        <div class="topo-core-glow"></div>
        <span class="topo-core-text">AI<br/>TEAM</span>
      </div>

      ${AGENTS.map(agent => html`
        <${AgentOrb}
          key=${agent.id}
          agent=${agent}
          isSpeaking=${speakingId === agent.id}
          onClick=${() => handleOrbClick(agent.id)}
        />
      `)}
    </div>
  `
}
