import { html, useEffect, useRef, useState } from '../../../deps.js'
import { useInView } from '../../../lib/useInView.js'

/**
 * DemoShowcaseSection v5 — J.A.R.V.I.S FORGE CONSOLE
 *
 * 左侧：6大"知识×游戏"实时监控屏（战术HUD覆盖+扫描线+状态标签）
 * 右侧：命令行终端（3层背景：蓝图网格+全息图腾+数据雨 + 文字外发光）
 */

// ── 6大实时监控目标 ──
const TARGETS = [
  {
    id: '0x4F',
    codename: 'SYS.TARGET_01',
    title: '引力矩阵_力学沙盘',
    img: '/assets/jarvis/physics-gravity.jpg',
    status: 'SIMULATION_STABLE',
    statusType: 'ok',
  },
  {
    id: '0xA2',
    codename: 'SYS.TARGET_02',
    title: '螺旋纪元_细胞演化',
    img: '/assets/jarvis/biotech-dna.jpg',
    status: 'RENDERING...',
    statusType: 'warn',
  },
  {
    id: '0x3C',
    codename: 'SYS.TARGET_03',
    title: '帝国回响_文明演进',
    img: '/assets/jarvis/history-warriors.jpg',
    status: 'SIMULATION_STABLE',
    statusType: 'ok',
  },
  {
    id: '0x7B',
    codename: 'SYS.TARGET_04',
    title: '链式反应_分子裂变',
    img: '/assets/jarvis/chemistry-molecules.jpg',
    status: 'RENDERING...',
    statusType: 'warn',
  },
  {
    id: '0x9D',
    codename: 'SYS.TARGET_05',
    title: '降维打击_拓扑空间',
    img: '/assets/jarvis/calculus-topology.jpg',
    status: 'SIMULATION_STABLE',
    statusType: 'ok',
  },
  {
    id: '0x1E',
    codename: 'SYS.TARGET_06',
    title: '暗网博弈_资本矩阵',
    img: '/assets/jarvis/economics-market.jpg',
    status: 'RENDERING...',
    statusType: 'warn',
  },
]

// ── 终端日志脚本 ──
const LOG_SCRIPT = [
  { tag: 'AGENT_INIT', role: '游戏设计师', msg: 'ONLINE', status: 'ok' },
  { tag: 'TASK_ALLOC', msg: '设计"诗境探幽"玩法', status: 'dim' },
  { tag: 'SYS_EXEC_01', msg: '正在生成关卡: 《静夜思—月光之旅》', status: 'arrow', suffix: 'OK', suffixStatus: 'ok' },
  { tag: 'SYS_EXEC_02', msg: '构建物理引擎边界', status: 'arrow', suffix: 'IN_PROGRESS', suffixStatus: 'warn' },
  { tag: 'AGENT_INIT', role: '美术总监', msg: 'ONLINE', status: 'ok' },
  { tag: 'RENDER_01', msg: '加载PBR材质表 [128/256]', status: 'dim' },
  { tag: 'RENDER_02', msg: '粒子系统焊接: Building_07', status: 'arrow', suffix: 'OK', suffixStatus: 'ok' },
  { tag: 'NEURAL_NET', msg: '知识点关联图谱已生成', status: 'arrow', suffix: 'OK', suffixStatus: 'ok' },
  { tag: 'AGENT_INIT', role: '引擎调度', msg: 'ONLINE', status: 'ok' },
  { tag: 'ENGINE_01', msg: 'Phaser管线接管 [FPS: 60]', status: 'dim' },
  { tag: 'ENGINE_02', msg: '碰撞检测矩阵构建', status: 'arrow', suffix: 'OK', suffixStatus: 'ok' },
  { tag: 'AGENT_INIT', role: '部署分发', msg: 'ONLINE', status: 'ok' },
  { tag: 'DEPLOY_01', msg: '压缩H5资源包 [2.3MB]', status: 'dim' },
  { tag: 'DEPLOY_02', msg: '生成短链接: k.abc/x7K2', status: 'arrow', suffix: 'OK', suffixStatus: 'ok' },
  { tag: 'SCAN_DONE', msg: '所有模块就绪，扫码即可试玩', status: 'ok' },
]

const SEG_COUNT = 24

function hex(len) {
  let s = ''
  const chars = '0123456789ABCDEF'
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * 16)]
  return s
}

function randFloat(min, max, decimals = 1) {
  return (Math.random() * (max - min) + min).toFixed(decimals)
}

// ── 跳动数据组件 ──
function useJumpingNumber(initial, { min, max, decimals = 1, interval = 50, enabled = true } = {}) {
  const [val, setVal] = useState(initial)
  useEffect(() => {
    if (!enabled) return
    const timer = setInterval(() => {
      setVal(randFloat(min, max, decimals))
    }, interval)
    return () => clearInterval(timer)
  }, [min, max, decimals, interval, enabled])
  return val
}

// ── 矩阵雨背景 ──
function MatrixRain({ enabled = true }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!enabled) return
    const el = ref.current
    if (!el) return
    let raf = 0
    const lines = []
    const lineCount = 16
    for (let i = 0; i < lineCount; i++) {
      lines.push({
        text: Array.from({ length: 48 }, () => hex(2)).join(' '),
        top: -20 - i * 3,
        speed: 0.2 + Math.random() * 0.6,
      })
    }
    function tick() {
      lines.forEach(l => {
        l.top += l.speed
        if (l.top > 105) {
          l.top = -20
          l.text = Array.from({ length: 48 }, () => hex(2)).join(' ')
        }
      })
      el.innerHTML = lines.map(l =>
        `<div style="position:absolute;top:${l.top}%;left:0;right:0;white-space:nowrap;">${l.text}</div>`
      ).join('')
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [enabled])
  return html`<div ref=${ref} class="jarvis-matrix"></div>`
}

// ── 全息图腾：旋转线框立方体 ──
function HoloWatermark() {
  return html`
    <div class="jarvis-holo">
      <svg viewBox="0 0 200 200" fill="none" class="jarvis-holo-svg">
        <!-- 外层立方体 -->
        <g class="jarvis-holo-rotate">
          <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" stroke="currentColor" stroke-width="0.8" opacity="0.5"/>
          <polygon points="100,50 145,75 145,125 100,150 55,125 55,75" stroke="currentColor" stroke-width="0.6" opacity="0.3"/>
          <line x1="100" y1="20" x2="100" y2="50" stroke="currentColor" stroke-width="0.4" opacity="0.3"/>
          <line x1="170" y1="60" x2="145" y2="75" stroke="currentColor" stroke-width="0.4" opacity="0.3"/>
          <line x1="170" y1="140" x2="145" y2="125" stroke="currentColor" stroke-width="0.4" opacity="0.3"/>
          <line x1="100" y1="180" x2="100" y2="150" stroke="currentColor" stroke-width="0.4" opacity="0.3"/>
          <line x1="30" y1="140" x2="55" y2="125" stroke="currentColor" stroke-width="0.4" opacity="0.3"/>
          <line x1="30" y1="60" x2="55" y2="75" stroke="currentColor" stroke-width="0.4" opacity="0.3"/>
        </g>
        <!-- 内层节点 -->
        <g class="jarvis-holo-pulse">
          <circle cx="100" cy="20" r="2" fill="currentColor" opacity="0.6"/>
          <circle cx="170" cy="60" r="2" fill="currentColor" opacity="0.5"/>
          <circle cx="170" cy="140" r="2" fill="currentColor" opacity="0.5"/>
          <circle cx="100" cy="180" r="2" fill="currentColor" opacity="0.6"/>
          <circle cx="30" cy="140" r="2" fill="currentColor" opacity="0.5"/>
          <circle cx="30" cy="60" r="2" fill="currentColor" opacity="0.5"/>
          <circle cx="100" cy="100" r="3" fill="currentColor" opacity="0.7"/>
          <line x1="100" y1="100" x2="100" y2="20" stroke="currentColor" stroke-width="0.3" opacity="0.2"/>
          <line x1="100" y1="100" x2="170" y2="60" stroke="currentColor" stroke-width="0.3" opacity="0.2"/>
          <line x1="100" y1="100" x2="170" y2="140" stroke="currentColor" stroke-width="0.3" opacity="0.2"/>
          <line x1="100" y1="100" x2="100" y2="180" stroke="currentColor" stroke-width="0.3" opacity="0.2"/>
          <line x1="100" y1="100" x2="30" y2="140" stroke="currentColor" stroke-width="0.3" opacity="0.2"/>
          <line x1="100" y1="100" x2="30" y2="60" stroke="currentColor" stroke-width="0.3" opacity="0.2"/>
        </g>
      </svg>
    </div>
  `
}

// ── 扫描目标卡片 ──
function TargetCard({ target, active }) {
  return html`
    <div class=${`jarvis-target ${active ? 'jarvis-target-active' : ''}`}>
      <img src=${target.img} alt=${target.title} loading="lazy" />
      <div class="jarvis-target-scan"></div>
      <div class="jarvis-target-corners"></div>
      <div class="jarvis-target-crosshair"></div>
      <div class="jarvis-target-titlebox">
        <span class="jarvis-target-codename">${target.codename}</span>
        <span class="jarvis-target-titletext">${target.title}</span>
      </div>
      <div class=${`jarvis-target-status jarvis-target-status-${target.statusType}`}>
        [${target.status}]
      </div>
      <div class="jarvis-target-meta">
        <span>RES:1920x1080</span>
        <span class="jarvis-target-meta-id">ID:${target.id}</span>
      </div>
    </div>
  `
}

export default function DemoShowcaseSection({ cases: _cases }) {
  const [sectionRef, inView] = useInView({ threshold: 0.15 })
  const [activeTarget, setActiveTarget] = useState(0)
  const [visibleLogs, setVisibleLogs] = useState(0)
  const [progress, setProgress] = useState(8)
  const outputRef = useRef(null)

  // 跳动数据（视口内才启动）
  const sysLoad = useJumpingNumber(87.4, { min: 82, max: 95, decimals: 1, interval: 80, enabled: inView })
  const memUse = useJumpingNumber(62.3, { min: 58, max: 71, decimals: 1, interval: 120, enabled: inView })
  const netLatency = useJumpingNumber(12, { min: 8, max: 24, decimals: 0, interval: 100, enabled: inView })
  const progressDecimal = useJumpingNumber(progress * 1000, { min: progress * 1000, max: (progress + 1) * 1000, decimals: 0, interval: 50, enabled: inView })

  // 循环切换扫描目标（视口内才启动）
  useEffect(() => {
    if (!inView) return
    const t = setInterval(() => {
      setActiveTarget(i => (i + 1) % TARGETS.length)
    }, 2500)
    return () => clearInterval(t)
  }, [inView])

  // 逐行输出日志（视口内才启动）
  useEffect(() => {
    if (!inView) return
    if (visibleLogs >= LOG_SCRIPT.length) {
      const reset = setTimeout(() => setVisibleLogs(0), 4000)
      return () => clearTimeout(reset)
    }
    const t = setTimeout(() => {
      setVisibleLogs(n => n + 1)
      setProgress(p => Math.min(p + Math.random() * 4, 95))
    }, 800 + Math.random() * 600)
    return () => clearTimeout(t)
  }, [visibleLogs, inView])

  // 自动滚动到底部
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [visibleLogs])

  const segOn = Math.round((progress / 100) * SEG_COUNT)

  return html`
    <section class="jarvis-section" ref=${sectionRef}
             data-connect data-connect-anchor=".jarvis-container"
             data-totem-target=".canvas-wm-1" data-connect-color="#67E8F9">
      <div class="jarvis-shell">
        <div class="jarvis-header">
          <div class="jarvis-header-left">
            <div class="jarvis-eyebrow">LIVE FORGE FEED // J.A.R.V.I.S</div>
            <h2>看看 AI 团队正在锻造什么</h2>
            <p>> 实时多智能体协作终端 — 透过 HUD 俯瞰 AI 生产线 _</p>
          </div>
          <div class="jarvis-header-right">
            <div class="jarvis-stat">
              <div class="jarvis-stat-label">SYS_LOAD</div>
              <div class="jarvis-stat-val">${sysLoad}%</div>
            </div>
            <div class="jarvis-stat">
              <div class="jarvis-stat-label">MEM_USE</div>
              <div class="jarvis-stat-val">${memUse}%</div>
            </div>
            <div class="jarvis-stat">
              <div class="jarvis-stat-label">NET_LATENCY</div>
              <div class="jarvis-stat-val jarvis-stat-val-cyan">${netLatency}ms</div>
            </div>
          </div>
        </div>

        <div class="jarvis-container">
          <div class="jarvis-grid-bg"></div>

          <!-- 左侧：6大实时监控屏 -->
          <div class="jarvis-targets">
            <div class="jarvis-targets-header">
              <span>▎ VISUAL_TARGETS [6]</span>
              <span>SCAN_MODE: AUTO</span>
            </div>
            <div class="jarvis-target-grid">
              ${TARGETS.map((t, i) => html`
                <${TargetCard} key=${t.id} target=${t} active=${i === activeTarget} />
              `)}
            </div>
          </div>

          <!-- 右侧：J.A.R.V.I.S 终端 -->
          <div class="jarvis-console">
            <!-- 图层1：底层蓝图网格 -->
            <div class="jarvis-console-grid"></div>

            <!-- 图层2：全息图腾水印 -->
            <${HoloWatermark} />

            <!-- 图层3：十六进制数据雨 -->
            <${MatrixRain} enabled=${inView} />

            <!-- 诊断头部 -->
            <div class="jarvis-diag">
              <div class="jarvis-diag-item jarvis-diag-item-cyan">
                AGENTS:<span>4/4</span>
              </div>
              <div class="jarvis-diag-item">
                THREADS:<span>${Math.round(sysLoad * 0.3)}</span>
              </div>
              <div class="jarvis-diag-item">
                QUEUE:<span>${Math.round(memUse * 0.1)}</span>
              </div>
              <div class="jarvis-diag-item jarvis-diag-item-cyan">
                UPTIME:<span>03:14:2${Math.floor(Math.random() * 9)}</span>
              </div>
              <div class="jarvis-heartbeat">
                <svg viewBox="0 0 80 16">
                  <path class="jarvis-heartbeat-path"
                    d="M0,8 L10,8 L13,2 L16,14 L19,8 L30,8 L33,4 L36,12 L39,8 L50,8 L53,2 L56,14 L59,8 L80,8"
                    stroke-dasharray="80"
                  />
                </svg>
              </div>
            </div>

            <!-- 代码输出区 -->
            <div class="jarvis-output" ref=${outputRef}>
              ${LOG_SCRIPT.slice(0, visibleLogs).map((line, i) => {
                const tag = line.tag
                const role = line.role
                const msg = line.msg
                const suffix = line.suffix
                const status = line.status
                const suffixStatus = line.suffixStatus

                return html`
                  <div class="jarvis-line" key=${i}>
                    ${html`<span class="jarvis-line-bracket">[</span>`}
                    ${html`<span class="jarvis-line-tag">>${tag}</span>`}
                    ${html`<span class="jarvis-line-bracket">]</span>`}
                    ${role ? html` <span class="jarvis-line-arrow">::</span> <span class="jarvis-line-tag">${role}</span> <span class="jarvis-line-dim">${msg}</span>` : html` <span class="jarvis-line-arrow">>> ${msg}</span>`}
                    ${suffix ? (suffixStatus === 'ok'
                      ? html` <span class="jarvis-line-ok">[${suffix}]</span>`
                      : html` <span class="jarvis-line-warn">[${suffix}]</span>`)
                    : status === 'ok' ? html` <span class="jarvis-line-ok">▎</span>` : ''}
                    ${status === 'dim' ? html` <span class="jarvis-line-dim">// 0x${hex(4)}</span>` : ''}
                  </div>
                `
              })}
              ${visibleLogs < LOG_SCRIPT.length ? html`<div class="jarvis-line"><span class="jarvis-cursor"></span></div>` : html`<div class="jarvis-line jarvis-line-dim">// 等待下一轮任务...<span class="jarvis-cursor"></span></div>`}
            </div>

            <!-- 底部分段进度条 -->
            <div class="jarvis-footer">
              <div class="jarvis-seg-bar">
                ${Array.from({ length: SEG_COUNT }).map((_, i) => html`
                  <div key=${i} class=${`jarvis-seg ${i < segOn ? 'jarvis-seg-on' : ''}`}></div>
                `)}
              </div>
              <div class="jarvis-progress-text">${progress.toFixed(1)}.${(progressDecimal % 1000).toString().padStart(3, '0')}%</div>
              <button class="jarvis-cta">▶ 查看完整流程</button>
            </div>
          </div>

          <!-- CRT 扫描线覆盖 -->
          <div class="jarvis-crt"></div>
        </div>
      </div>
    </section>
  `
}
