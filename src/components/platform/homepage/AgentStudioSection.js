/**
 * AgentStudioSection — 赛博朋克 AI 游戏工作室首屏 Hero 区
 *
 * 展示 5 位 AI Agent 组成的 AAA 游戏开发团队：
 *   - AI Producer 居中（金色，最大）
 *   - 玩法总监 / 世界观架构师 / 美术总监 / 系统设计师 围绕 Producer 菱形排布
 *   - SVG 神经网络连线（流动数据包 + 脉冲）
 *   - 底部协作工作流序列动画
 *   - Producer 旁的项目加载进度环
 *
 * 技术栈：React 18 + htm（无 JSX，使用 html`` 模板字符串）
 * 说明：模板内统一使用 class=（deps.js 适配器会转成 className）
 */
import { html, useState, useEffect, useRef, useMemo, useCallback, useContext } from '../../../deps.js'
import { AppContext, STEPS } from '../../../store/appContext.js?v=ctx2'

/* ────────────────────────────────────────────────────────────
 * Agent 数据
 * ──────────────────────────────────────────────────────────── */
const AGENTS = [
  {
    id: 'producer',
    name: 'AI Producer',
    role: '制作人',
    img: '/assets/agents/agent-producer.jpg',
    color: '#FCD34D',
    colorRgb: '252, 211, 77',
    quote: 'Every great game starts with the right direction.',
    quoteCn: '每一款伟大的游戏，都始于正确的方向。',
    responsibilities: ['统筹全部流程', '拆解需求', '协调所有 Agent', '控制项目质量'],
    visual: '全息控制台 · Project Dashboard · 金色能量',
    position: 'center',
  },
  {
    id: 'gameplay',
    name: 'Gameplay Director',
    role: '玩法总监',
    img: '/assets/agents/agent-gameplay.jpg',
    color: '#FB923C',
    colorRgb: '251, 146, 60',
    quote: 'No gameplay, no game.',
    quoteCn: '没有玩法，就没有游戏。',
    responsibilities: ['核心玩法', '成长循环', '战斗机制', '关卡设计'],
    visual: '蓝图 · 流程图 · 技能树 · HUD',
    position: 'top',
  },
  {
    id: 'world',
    name: 'World Architect',
    role: '世界观架构师',
    img: '/assets/agents/agent-world.jpg',
    color: '#22D3EE',
    colorRgb: '34, 211, 238',
    quote: 'Every world has its own history.',
    quoteCn: '每个世界都有自己的历史。',
    responsibilities: ['世界观', '历史设定', '国家阵营', 'NPC · 剧情'],
    visual: '卷轴 · 地图 · 星图 · 世界树',
    position: 'left',
  },
  {
    id: 'art',
    name: 'Art Director',
    role: '美术总监',
    img: '/assets/agents/agent-art.jpg',
    color: '#A855F7',
    colorRgb: '168, 85, 247',
    quote: 'Players believe what they can see.',
    quoteCn: '玩家相信他们能看到的。',
    responsibilities: ['美术风格', '角色场景', 'UI设计', 'Prompt 视觉规范'],
    visual: '发光画笔 · 角色草图 · 颜色光带',
    position: 'right',
  },
  {
    id: 'system',
    name: 'System Designer',
    role: '系统设计师',
    img: '/assets/agents/agent-system.jpg',
    color: '#3B82F6',
    colorRgb: '59, 130, 246',
    quote: 'Every mechanic must complete the loop.',
    quoteCn: '每个机制都必须完成闭环。',
    responsibilities: ['经济系统', '数值平衡', '装备技能', '成长 · 商业化'],
    visual: 'HUD · 数据流 · 数值公式 · 全息图表',
    position: 'bottom',
  },
]

/* ────────────────────────────────────────────────────────────
 * 常量
 * ──────────────────────────────────────────────────────────── */

// 协作工作流步骤（底部序列动画）
const WORKFLOW_STEPS = [
  '用户输入',
  'Producer',
  '任务拆解',
  '五位Agent同时工作',
  '世界观/玩法/美术/系统',
  '最终融合',
  'Project Complete',
]

// 各位置在 SVG viewBox(0~100) 中的近似坐标，用于绘制连线
const POS_COORDS = {
  top: { x: 50, y: 15 },
  left: { x: 15, y: 50 },
  right: { x: 85, y: 50 },
  bottom: { x: 50, y: 85 },
  center: { x: 50, y: 50 },
}

// 起始步骤：优先 STEPS.GENERATE，store 暂未定义时回退到协议演示页
const START_STEP = STEPS.GENERATE || STEPS.PROTOCOL

/* ────────────────────────────────────────────────────────────
 * 工具：可复现的伪随机（seeded PRNG，保证粒子布局稳定）
 * ──────────────────────────────────────────────────────────── */
function mulberry32(seed) {
  let s = seed >>> 0
  return function () {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ────────────────────────────────────────────────────────────
 * 自包含样式（ag- 前缀）
 * ──────────────────────────────────────────────────────────── */
const AG_CSS = `
.ag-section{
  position:relative; min-height:100vh; width:100%; overflow:hidden;
  background:radial-gradient(ellipse 80% 60% at 50% 28%, #120a2e 0%, #07041a 45%, #02000a 100%);
  color:#e9e3ff; font-family:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;
  padding-bottom:72px;
}

/* ── 赛博网格背景 ── */
.ag-grid-bg{
  position:absolute; inset:0; z-index:0; pointer-events:none;
  background-image:
    linear-gradient(rgba(124,108,246,0.10) 1px, transparent 1px),
    linear-gradient(90deg, rgba(124,108,246,0.10) 1px, transparent 1px);
  background-size:46px 46px;
  -webkit-mask-image:radial-gradient(ellipse 70% 60% at 50% 40%, #000 25%, transparent 85%);
  mask-image:radial-gradient(ellipse 70% 60% at 50% 40%, #000 25%, transparent 85%);
  animation:ag-grid-pan 26s linear infinite;
}
@keyframes ag-grid-pan{ from{background-position:0 0,0 0} to{background-position:46px 46px,46px 46px} }

/* ── 浮动粒子 ── */
.ag-particles{ position:absolute; inset:0; z-index:1; pointer-events:none; }
.ag-particle{
  position:absolute; border-radius:50%;
  background:rgba(167,139,250,0.7); box-shadow:0 0 6px rgba(167,139,250,0.9);
  animation:ag-float linear infinite;
}
@keyframes ag-float{
  0%{ transform:translateY(10px) scale(1); opacity:0 }
  12%{ opacity:.85 } 88%{ opacity:.85 }
  100%{ transform:translateY(-130px) scale(.3); opacity:0 }
}

/* ── 标题区 ── */
.ag-header{ position:relative; z-index:10; text-align:center; max-width:920px; margin:0 auto; padding:96px 20px 18px; }
.ag-eyebrow{ font-family:'SF Mono',ui-monospace,Menlo,monospace; font-size:13px; letter-spacing:.18em; color:#22D3EE; text-shadow:0 0 12px rgba(34,211,238,.5); margin-bottom:14px; }
.ag-title{ font-size:clamp(26px,4.2vw,46px); font-weight:800; line-height:1.2; margin:0 0 14px; background:linear-gradient(180deg,#fff,#c4b5fd); -webkit-background-clip:text; background-clip:text; color:transparent; }
.ag-subtitle{ font-size:clamp(14px,1.6vw,17px); color:rgba(220,210,255,.7); margin:0 0 18px; }
.ag-flow-text{ font-family:'SF Mono',ui-monospace,Menlo,monospace; font-size:12px; color:rgba(167,139,250,.85); letter-spacing:.04em; line-height:1.7; }

/* ── Agent 排布区（菱形/十字网格，无重叠） ── */
.ag-studio{
  position:relative; z-index:10; max-width:1120px; margin:14px auto 0; padding:0 16px;
  display:grid; grid-template-columns:1fr 1fr 1fr; grid-template-rows:auto auto auto;
  gap:26px 16px; align-items:center; justify-items:center; min-height:560px;
}
.ag-studio::before{
  content:''; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
  width:62%; height:62%; border-radius:50%; pointer-events:none; z-index:0;
  background:radial-gradient(circle, rgba(252,211,77,.14), transparent 70%);
}

/* SVG 神经网络连线（绝对覆盖层，置于卡片之下） */
.ag-connections{ position:absolute; inset:0; width:100%; height:100%; z-index:1; pointer-events:none; }
.ag-connection-line{
  fill:none; stroke-width:1.4; vector-effect:non-scaling-stroke;
  stroke-dasharray:6 10; opacity:.7;
  animation:ag-dash 1.4s linear infinite, ag-pulse 2.6s ease-in-out infinite;
}
@keyframes ag-dash{ to{ stroke-dashoffset:-16 } }
@keyframes ag-pulse{ 0%,100%{ opacity:.3 } 50%{ opacity:.95 } }

/* 卡片网格定位 */
.ag-agent-card{ z-index:2; }
.ag-agent-pos-top{ grid-column:2; grid-row:1; }
.ag-agent-pos-left{ grid-column:1; grid-row:2; justify-self:end; }
.ag-agent-pos-center{ grid-column:2; grid-row:2; z-index:3; }
.ag-agent-pos-right{ grid-column:3; grid-row:2; justify-self:start; }
.ag-agent-pos-bottom{ grid-column:2; grid-row:3; }

.ag-agent-card{
  position:relative; width:228px; border-radius:18px; padding:14px;
  background:linear-gradient(160deg, rgba(255,255,255,.07), rgba(255,255,255,.02));
  border:1px solid rgba(var(--agent-rgb),.28);
  -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px);
  box-shadow:0 10px 34px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.07);
  transition:transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s, border-color .35s;
}
.ag-agent-card-center{ width:286px; }
.ag-agent-card:hover{
  transform:translateY(-8px) scale(1.035);
  border-color:rgba(var(--agent-rgb),.65);
  box-shadow:0 18px 48px rgba(0,0,0,.5), 0 0 30px rgba(var(--agent-rgb),.25), inset 0 1px 0 rgba(255,255,255,.1);
}

.ag-agent-img-wrap{
  position:relative; width:100%; aspect-ratio:1/1; border-radius:13px; overflow:hidden;
  border:2px solid rgba(var(--agent-rgb),.5);
  box-shadow:0 0 18px rgba(var(--agent-rgb),.3), inset 0 0 14px rgba(var(--agent-rgb),.12);
}
.ag-agent-img{ width:100%; height:100%; object-fit:cover; display:block; }
.ag-agent-scanline{ position:absolute; inset:0; pointer-events:none; overflow:hidden; border-radius:11px; }
.ag-agent-scanline::before{
  content:''; position:absolute; left:0; right:0; height:42%; top:-42%;
  background:linear-gradient(180deg, transparent, rgba(var(--agent-rgb),.22), transparent);
  animation:ag-scan 3.6s linear infinite; animation-delay:var(--scan-delay, 0s);
}
@keyframes ag-scan{ 0%{ top:-42% } 100%{ top:100% } }
.ag-agent-card:hover .ag-agent-scanline::before{ animation-duration:1.3s; }

.ag-agent-info{ margin-top:12px; }
.ag-agent-name{ font-size:16px; font-weight:700; color:var(--agent-color); letter-spacing:.01em; text-shadow:0 0 10px rgba(var(--agent-rgb),.4); }
.ag-agent-role{ font-size:12px; color:rgba(220,210,255,.6); margin-top:2px; }
.ag-agent-quote{ font-style:italic; font-size:12px; color:rgba(220,210,255,.78); margin-top:8px; line-height:1.5; }
.ag-agent-quote-cn{ font-size:11px; color:rgba(220,210,255,.45); margin-top:2px; }
.ag-agent-tags{ display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
.ag-agent-tag{ font-size:10px; padding:3px 8px; border-radius:999px; background:rgba(var(--agent-rgb),.12); color:var(--agent-color); border:1px solid rgba(var(--agent-rgb),.3); white-space:nowrap; }
.ag-agent-visual{ font-size:10px; color:rgba(220,210,255,.42); margin-top:10px; font-family:'SF Mono',ui-monospace,Menlo,monospace; letter-spacing:.02em; }

/* Producer 项目加载进度环 */
.ag-producer-status{ display:flex; align-items:center; gap:10px; margin-top:12px; padding-top:10px; border-top:1px solid rgba(var(--agent-rgb),.18); }
.ag-producer-ring{ width:50px; height:50px; flex:none; }
.ag-producer-ring .ag-ring-track{ stroke:rgba(var(--agent-rgb),.15); }
.ag-producer-ring .ag-ring-progress{ stroke:var(--agent-color); transition:stroke-dashoffset .12s linear; filter:drop-shadow(0 0 4px rgba(var(--agent-rgb),.6)); }
.ag-producer-ring .ag-ring-text{ fill:var(--agent-color); font-weight:700; font-size:12px; font-family:'SF Mono',ui-monospace,Menlo,monospace; }
.ag-producer-status-text{ font-family:'SF Mono',ui-monospace,Menlo,monospace; font-size:10px; letter-spacing:.08em; color:var(--agent-color); line-height:1.5; }
.ag-producer-status-text b{ display:block; font-size:11px; color:#fff; }

/* ── 协作工作流 ── */
.ag-workflow{ position:relative; z-index:10; max-width:1180px; margin:40px auto 0; padding:0 16px; text-align:center; }
.ag-status-indicator{ display:inline-flex; align-items:center; gap:8px; font-family:'SF Mono',ui-monospace,Menlo,monospace; font-size:11px; letter-spacing:.14em; color:#34D399; margin-bottom:14px; padding:5px 12px; border-radius:999px; background:rgba(52,211,153,.08); border:1px solid rgba(52,211,153,.25); }
.ag-status-dot{ width:8px; height:8px; border-radius:50%; background:#34D399; box-shadow:0 0 8px #34D399; animation:ag-blink 1.1s ease-in-out infinite; }
@keyframes ag-blink{ 0%,100%{ opacity:1 } 50%{ opacity:.25 } }
.ag-workflow-track{ display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:6px 8px; }
.ag-workflow-step{ font-size:12px; padding:7px 13px; border-radius:10px; color:rgba(220,210,255,.4); background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); transition:all .3s; white-space:nowrap; }
.ag-workflow-step-active{ color:#fff; background:linear-gradient(135deg, rgba(167,139,250,.28), rgba(34,211,238,.2)); border-color:rgba(167,139,250,.55); box-shadow:0 0 16px rgba(167,139,250,.3); transform:translateY(-2px); }
.ag-workflow-arrow{ color:rgba(167,139,250,.4); font-size:13px; }

/* ── CTA ── */
.ag-cta{ position:relative; z-index:10; text-align:center; margin-top:42px; padding:0 16px; }
.ag-cta-btn{ position:relative; font-size:17px; font-weight:700; letter-spacing:.08em; color:#05010f; padding:15px 46px; border:none; border-radius:14px; cursor:pointer; background:linear-gradient(135deg,#FCD34D,#FB923C); box-shadow:0 10px 30px rgba(252,211,77,.35), 0 0 0 1px rgba(252,211,77,.3); transition:transform .25s, box-shadow .25s; }
.ag-cta-btn:hover{ transform:translateY(-3px) scale(1.03); box-shadow:0 16px 40px rgba(252,211,77,.5); }
.ag-cta-btn:active{ transform:translateY(-1px) scale(1.01); }
.ag-cta-hint{ margin-top:14px; font-family:'SF Mono',ui-monospace,Menlo,monospace; font-size:12px; color:rgba(167,139,250,.7); animation:ag-blink 2s ease-in-out infinite; }

/* ── 响应式：移动端竖向堆叠，Producer 在最前 ── */
@media (max-width:980px){
  .ag-header{ padding-top:84px; }
  .ag-studio{ display:flex; flex-direction:column; align-items:center; gap:20px; min-height:auto; }
  .ag-studio::before{ display:none; }
  .ag-connections{ display:none; }
  .ag-agent-card{ grid-column:auto !important; grid-row:auto !important; justify-self:auto !important; width:100% !important; max-width:360px; }
  .ag-agent-pos-center{ order:-1; }
}
`

/* ────────────────────────────────────────────────────────────
 * ProducerStatusRing — 项目加载进度环（动画百分比）
 * ──────────────────────────────────────────────────────────── */
function ProducerStatusRing() {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    // 0 → 100 循环，每 60ms +1
    const id = setInterval(() => {
      setPct((p) => (p >= 100 ? 0 : p + 1))
    }, 60)
    return () => clearInterval(id)
  }, [])

  const r = 22
  const circumference = 2 * Math.PI * r
  const offset = circumference - (pct / 100) * circumference

  return html`
    <div class="ag-producer-status">
      <svg class="ag-producer-ring" viewBox="0 0 56 56" aria-hidden="true">
        <circle class="ag-ring-track" cx="28" cy="28" r=${r} fill="none" stroke-width="4" />
        <circle
          class="ag-ring-progress"
          cx="28" cy="28" r=${r} fill="none" stroke-width="4" stroke-linecap="round"
          stroke-dasharray=${circumference}
          stroke-dashoffset=${offset}
          transform="rotate(-90 28 28)"
        />
        <text class="ag-ring-text" x="28" y="32" text-anchor="middle">${pct}%</text>
      </svg>
      <div class="ag-producer-status-text">
        <b>PROJECT STATUS</b>
        IN PROGRESS
      </div>
    </div>
  `
}

/* ────────────────────────────────────────────────────────────
 * WorkflowAnimation — 协作流程序列动画
 * 每 2 秒推进一步，循环点亮
 * ──────────────────────────────────────────────────────────── */
function WorkflowAnimation() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => (a + 1) % WORKFLOW_STEPS.length)
    }, 2000)
    return () => clearInterval(id)
  }, [])

  // 交错渲染：步骤节点 + 箭头
  const nodes = []
  WORKFLOW_STEPS.forEach((label, i) => {
    nodes.push(html`
      <div key=${`step-${i}`} class=${`ag-workflow-step ${i <= active ? 'ag-workflow-step-active' : ''}`}>
        ${label}
      </div>
    `)
    if (i < WORKFLOW_STEPS.length - 1) {
      nodes.push(html`<span key=${`arrow-${i}`} class="ag-workflow-arrow">→</span>`)
    }
  })

  return html`
    <div class="ag-workflow">
      <div class="ag-status-indicator">
        <span class="ag-status-dot"></span>
        AI WORKING
      </div>
      <div class="ag-workflow-track">${nodes}</div>
    </div>
  `
}

/* ────────────────────────────────────────────────────────────
 * AgentCard — 单个 Agent 全息玻璃卡片
 * ──────────────────────────────────────────────────────────── */
function AgentCard({ agent, index }) {
  const isCenter = agent.position === 'center'
  return html`
    <div
      class=${`ag-agent-card ag-agent-pos-${agent.position} ${isCenter ? 'ag-agent-card-center' : ''}`}
      style=${{
        '--agent-color': agent.color,
        '--agent-rgb': agent.colorRgb,
        '--scan-delay': `${index * 0.7}s`,
      }}
    >
      <div class="ag-agent-img-wrap">
        <img class="ag-agent-img" src=${agent.img} alt=${agent.name} loading="lazy" draggable="false" />
        <div class="ag-agent-scanline"></div>
      </div>
      <div class="ag-agent-info">
        <div class="ag-agent-name">${agent.name}</div>
        <div class="ag-agent-role">${agent.role}</div>
        <div class="ag-agent-quote">"${agent.quote}"</div>
        <div class="ag-agent-quote-cn">${agent.quoteCn}</div>
        <div class="ag-agent-tags">
          ${agent.responsibilities.map((tag, ti) => html`
            <span key=${`tag-${ti}`} class="ag-agent-tag">${tag}</span>
          `)}
        </div>
        <div class="ag-agent-visual">${agent.visual}</div>
        ${isCenter ? html`<${ProducerStatusRing} />` : null}
      </div>
    </div>
  `
}

/* ────────────────────────────────────────────────────────────
 * AgentStudioSection — 主导出
 * ──────────────────────────────────────────────────────────── */
export default function AgentStudioSection() {
  const { dispatch } = useContext(AppContext)
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  // 跳转：dispatch SET_STEP + 平滑滚动（尊重 reduced-motion）
  const go = useCallback(
    (step) => {
      dispatch({ type: 'SET_STEP', payload: step })
      window.scrollTo({ top: 0, behavior: reducedMotion.current ? 'auto' : 'smooth' })
    },
    [dispatch]
  )

  // 浮动粒子（seeded，稳定不闪烁）
  const particles = useMemo(() => {
    const rand = mulberry32(20260713)
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: rand() * 100,
      top: rand() * 100,
      size: 2 + rand() * 4,
      duration: 6 + rand() * 10,
      delay: rand() * 8,
    }))
  }, [])

  // 神经网络连线：4 个外围 Agent → 中心 Producer
  const connections = useMemo(() => {
    const center = POS_COORDS.center
    return AGENTS.filter((a) => a.position !== 'center').map((a) => {
      const p = POS_COORDS[a.position]
      return {
        id: a.id,
        color: a.color,
        d: `M ${p.x} ${p.y} L ${center.x} ${center.y}`,
      }
    })
  }, [])

  return html`
    <section class="ag-section">
      <style>${AG_CSS}</style>

      <!-- 背景：赛博网格 -->
      <div class="ag-grid-bg"></div>

      <!-- 背景：浮动粒子 -->
      <div class="ag-particles">
        ${particles.map((p) => html`
          <span
            key=${p.id}
            class="ag-particle"
            style=${{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          ></span>
        `)}
      </div>

      <!-- 标题区 -->
      <div class="ag-header">
        <div class="ag-eyebrow">${'<AI_STUDIO />'}</div>
        <h2 class="ag-title">你的创意，将交给一支 AI AAA 游戏开发团队</h2>
        <p class="ag-subtitle">不是 AI 聊天工具 —— 是由多位专业 AI 总监组成的游戏开发团队</p>
        <p class="ag-flow-text">一本书 → AI理解内容 → 自动拆解知识 → 五位专家协同讨论 → 融合设计 → 输出完整游戏方案</p>
      </div>

      <!-- Agent 排布区 -->
      <div class="ag-studio">
        <!-- 神经网络连线 -->
        <svg class="ag-connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          ${connections.map((c) => html`
            <path
              key=${`line-${c.id}`}
              class="ag-connection-line"
              d=${c.d}
              stroke=${c.color}
            />
          `)}
        </svg>

        <!-- 5 张 Agent 卡片 -->
        ${AGENTS.map((agent, i) => html`
          <${AgentCard} key=${agent.id} agent=${agent} index=${i} />
        `)}
      </div>

      <!-- 协作工作流动画 -->
      <${WorkflowAnimation} />

      <!-- 行动号召 -->
      <div class="ag-cta">
        <button class="ag-cta-btn" type="button" onClick=${() => go(START_STEP)}>
          开始协作
        </button>
        <div class="ag-cta-hint">&gt; 一键启动 AI 工作室，免费体验_</div>
      </div>
    </section>
  `
}
