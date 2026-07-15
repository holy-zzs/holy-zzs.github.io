import { html, useRef } from '../../../deps.js'
import { useCanvasParallax } from '../../../lib/useCanvasParallax.js'
import CanvasConnections from './CanvasConnections.js'

/**
 * InfiniteCanvas v2 — J.A.R.V.I.S 沉浸式 5 层 Z 轴架构
 *
 *   Layer -3 (z:-3): 纯 CSS 深空渐变 — 视差 0.15x
 *   Layer -2 (z:-2): 蓝图工程网格 — 视差 0.2x
 *   Layer -1 (z:-1): 巨型 SVG 图腾 — 视差 0.3x
 *   Layer  0 (z:0):  数据光束 + 连接线 — 固定位置
 *   Layer  1 (z:1):  玻璃 UI 内容 — 正常滚动
 */

// ── 巨型暗纹 SVG 图腾 ──
function OrbitalRings() {
  return html`
    <svg class="canvas-wm-svg" viewBox="0 0 600 600" fill="none">
      <circle cx="300" cy="300" r="280" stroke="currentColor" stroke-width="1" opacity="0.3"/>
      <circle cx="300" cy="300" r="220" stroke="currentColor" stroke-width="0.8" opacity="0.2" stroke-dasharray="4 8"/>
      <circle cx="300" cy="300" r="160" stroke="currentColor" stroke-width="0.6" opacity="0.15"/>
      <circle cx="300" cy="300" r="100" stroke="currentColor" stroke-width="0.5" opacity="0.1" stroke-dasharray="2 6"/>
      <ellipse cx="300" cy="300" rx="280" ry="120" stroke="currentColor" stroke-width="0.5" opacity="0.12" transform="rotate(30 300 300)"/>
      <ellipse cx="300" cy="300" rx="280" ry="120" stroke="currentColor" stroke-width="0.5" opacity="0.12" transform="rotate(-30 300 300)"/>
      <ellipse cx="300" cy="300" rx="280" ry="80" stroke="currentColor" stroke-width="0.4" opacity="0.08" transform="rotate(60 300 300)"/>
      <circle cx="300" cy="300" r="4" fill="currentColor" opacity="0.4"/>
      <circle cx="580" cy="300" r="3" fill="currentColor" opacity="0.3"/>
      <circle cx="300" cy="20" r="3" fill="currentColor" opacity="0.3"/>
      <circle cx="160" cy="140" r="2" fill="currentColor" opacity="0.2"/>
      <circle cx="440" cy="460" r="2" fill="currentColor" opacity="0.2"/>
    </svg>
  `
}

function HexMatrix() {
  const hexes = []
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const x = 100 + col * 100 + (row % 2) * 50
      const y = 80 + row * 85
      const pts = []
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2
        pts.push(`${x + 45 * Math.cos(angle)},${y + 45 * Math.sin(angle)}`)
      }
      hexes.push(html`<polygon key=${`${row}-${col}`} points=${pts.join(' ')} stroke="currentColor" stroke-width="0.8" opacity="0.15" fill="none"/>`)
    }
  }
  return html`<svg class="canvas-wm-svg" viewBox="0 0 600 520" fill="none">${hexes}</svg>`
}

function RadarArray() {
  return html`
    <svg class="canvas-wm-svg" viewBox="0 0 600 600" fill="none">
      <circle cx="300" cy="300" r="260" stroke="currentColor" stroke-width="0.6" opacity="0.1"/>
      <circle cx="300" cy="300" r="200" stroke="currentColor" stroke-width="0.5" opacity="0.08"/>
      <circle cx="300" cy="300" r="140" stroke="currentColor" stroke-width="0.4" opacity="0.06"/>
      <circle cx="300" cy="300" r="80" stroke="currentColor" stroke-width="0.3" opacity="0.05"/>
      ${[0, 30, 60, 90, 120, 150].map(deg => html`
        <line key=${deg} x1="300" y1="300" x2=${300 + 260 * Math.cos(deg * Math.PI / 180)} y2=${300 + 260 * Math.sin(deg * Math.PI / 180)} stroke="currentColor" stroke-width="0.3" opacity="0.06"/>
      `)}
      <path d="M 300 40 A 260 260 0 0 1 530 230" stroke="currentColor" stroke-width="1.5" opacity="0.2" fill="none"/>
      <path d="M 300 40 A 260 260 0 0 1 420 80" stroke="currentColor" stroke-width="3" opacity="0.3" fill="none"/>
      <circle cx="300" cy="300" r="3" fill="currentColor" opacity="0.3"/>
    </svg>
  `
}

// ── 星座连线网络图腾（知识图谱主题） ──
function ConstellationWeb() {
  const nodes = []
  let rng = 42
  const random = () => { rng = (rng * 9301 + 49297) % 233280; return rng / 233280 }
  for (let i = 0; i < 14; i++) {
    nodes.push({
      x: 50 + random() * 500,
      y: 50 + random() * 500,
      r: 2 + random() * 3,
    })
  }
  const edges = []
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x
      const dy = nodes[i].y - nodes[j].y
      if (Math.sqrt(dx * dx + dy * dy) < 180) {
        edges.push([i, j])
      }
    }
  }
  return html`
    <svg class="canvas-wm-svg" viewBox="0 0 600 600" fill="none">
      ${edges.map(([a, b], i) => html`
        <line key=${`e-${i}`} x1=${nodes[a].x} y1=${nodes[a].y}
              x2=${nodes[b].x} y2=${nodes[b].y}
              stroke="currentColor" stroke-width="0.4" opacity="0.12"/>
      `)}
      ${nodes.map((n, i) => html`
        <circle key=${`n-${i}`} cx=${n.x} cy=${n.y} r=${n.r}
                fill="currentColor" opacity="0.2"/>
      `)}
    </svg>
  `
}

export default function InfiniteCanvas({ children }) {
  const rootRef = useRef(null)

  // ── GSAP 5 层视差 ──
  useCanvasParallax(rootRef)

  return html`
    <div class="canvas-root" ref=${rootRef}>
      <!-- Layer -3: 纯 CSS 深空渐变 (视差 0.15x) -->
      <div class="canvas-bg-fixed"></div>

      <!-- Layer -2: 蓝图工程网格 (视差 0.2x) -->
      <div class="canvas-grid"></div>

      <!-- Layer -1: 巨型暗纹图腾 (视差 0.3x) -->
      <div class="canvas-watermarks">
        <div class="canvas-wm canvas-wm-1">
          <${OrbitalRings} />
        </div>
        <div class="canvas-wm canvas-wm-2">
          <${HexMatrix} />
        </div>
        <div class="canvas-wm canvas-wm-3">
          <${RadarArray} />
        </div>
        <div class="canvas-wm canvas-wm-4">
          <${ConstellationWeb} />
        </div>
      </div>

      <!-- Layer 0: 数据光束 + 连接线 (固定位置) -->
      <div class="canvas-pipes">
        <div class="canvas-pipe canvas-pipe-left">
          <div class="canvas-pipe-line"></div>
          <div class="canvas-pipe-light"></div>
          <div class="canvas-pipe-light canvas-pipe-light-2"></div>
        </div>
        <div class="canvas-pipe canvas-pipe-right">
          <div class="canvas-pipe-line"></div>
          <div class="canvas-pipe-light"></div>
          <div class="canvas-pipe-light canvas-pipe-light-2"></div>
        </div>
        <!-- 斜向数据光束 -->
        <div class="canvas-beam canvas-beam-1"></div>
        <div class="canvas-beam canvas-beam-2"></div>
        <div class="canvas-beam canvas-beam-3"></div>
      </div>

      <!-- 连接线高亮 SVG 覆盖层 -->
      <${CanvasConnections} />

      <!-- Layer 1: 前景内容 -->
      <div class="canvas-content">
        ${children}
      </div>
    </div>
  `
}
