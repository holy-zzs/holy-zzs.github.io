import { html } from '../../../deps.js'

const STARS = (() => {
  const arr = []
  for (let i = 0; i < 90; i++) {
    arr.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.4 + 0.3,
      delay: Math.random() * 10,
      duration: Math.random() * 5 + 4,
      opacity: Math.random() * 0.5 + 0.15
    })
  }
  return arr
})()

const BRIGHT_STARS = (() => {
  const arr = []
  for (let i = 0; i < 12; i++) {
    arr.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 8,
      duration: Math.random() * 3 + 4,
    })
  }
  return arr
})()

// ── 星舰SVG: 极小远景AI探索者 ──
// 探索舰: 青色船体, 引擎光晕, 尾迹
const SHIP_SVG_1 = `<svg viewBox="0 0 80 20" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><path d="M5 10 L15 7 L60 6 L72 8 L75 10 L72 12 L60 14 L15 13 Z" fill="rgba(34,211,238,0.35)" stroke="rgba(34,211,238,0.5)" stroke-width="0.3"/><circle cx="68" cy="10" r="1.5" fill="rgba(34,211,238,0.8)"/><circle cx="68" cy="10" r="3" fill="rgba(34,211,238,0.15)"/><line x1="75" y1="9" x2="79" y2="8.5" stroke="rgba(34,211,238,0.2)" stroke-width="0.4"/><line x1="75" y1="10" x2="79" y2="10" stroke="rgba(34,211,238,0.15)" stroke-width="0.3"/><line x1="75" y1="11" x2="79" y2="11.5" stroke="rgba(34,211,238,0.2)" stroke-width="0.4"/><rect x="25" y="8" width="3" height="1" fill="rgba(255,255,255,0.25)"/><rect x="35" y="8" width="3" height="1" fill="rgba(255,255,255,0.2)"/><rect x="45" y="8" width="3" height="1" fill="rgba(255,255,255,0.15)"/></svg>`

// 探针: 橙色小型传感器船
const SHIP_SVG_2 = `<svg viewBox="0 0 40 14" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><path d="M3 7 L8 5 L28 5 L33 6 L35 7 L33 8 L28 9 L8 9 Z" fill="rgba(245,158,11,0.3)" stroke="rgba(245,158,11,0.45)" stroke-width="0.25"/><circle cx="31" cy="7" r="1" fill="rgba(245,158,11,0.7)"/><circle cx="31" cy="7" r="2" fill="rgba(245,158,11,0.12)"/><circle cx="15" cy="7" r="0.5" fill="rgba(255,255,255,0.4)"/><circle cx="22" cy="7" r="0.4" fill="rgba(255,255,255,0.3)"/></svg>`

// 母舰: 极淡紫色远景大型船
const SHIP_SVG_3 = `<svg viewBox="0 0 100 16" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><path d="M3 8 L12 6 L70 5.5 L88 6.5 L92 8 L88 9.5 L70 10.5 L12 10 Z" fill="rgba(138,92,245,0.2)" stroke="rgba(138,92,245,0.35)" stroke-width="0.2"/><circle cx="85" cy="8" r="1.2" fill="rgba(138,92,245,0.5)"/><circle cx="85" cy="8" r="2.5" fill="rgba(138,92,245,0.08)"/><rect x="25" y="7" width="2" height="1" fill="rgba(255,255,255,0.15)"/><rect x="35" y="7" width="2" height="1" fill="rgba(255,255,255,0.12)"/><rect x="45" y="7" width="2" height="1" fill="rgba(255,255,255,0.1)"/><rect x="55" y="7" width="2" height="1" fill="rgba(255,255,255,0.08)"/></svg>`

function starEl(s, i) {
  return html`<span key=${'s' + i} class="cosmic-star" style=${{
    left: s.x + '%', top: s.y + '%',
    width: s.size + 'px', height: s.size + 'px',
    opacity: s.opacity,
    animationDelay: s.delay + 's',
    animationDuration: s.duration + 's'
  }}></span>`
}

function brightStarEl(s, i) {
  return html`<span key=${'b' + i} class="cosmic-star cosmic-star-bright" style=${{
    left: s.x + '%', top: s.y + '%',
    animationDelay: s.delay + 's',
    animationDuration: s.duration + 's'
  }}></span>`
}

export default function CosmicBackground() {
  const starElements = STARS.map(starEl)
  const brightStarElements = BRIGHT_STARS.map(brightStarEl)

  return html`
    <div class="cosmic-bg" aria-hidden="true">
      <div class="cosmic-void"></div>
      <div class="cosmic-nebula"></div>
      <div class="cosmic-starfield">
        ${starElements}
        ${brightStarElements}
      </div>
      <div class="cosmic-fleet">
        <div class="cosmic-ship cosmic-ship-1" dangerouslySetInnerHTML=${{ __html: SHIP_SVG_1 }}></div>
        <div class="cosmic-ship cosmic-ship-2" dangerouslySetInnerHTML=${{ __html: SHIP_SVG_2 }}></div>
        <div class="cosmic-ship cosmic-ship-3" dangerouslySetInnerHTML=${{ __html: SHIP_SVG_3 }}></div>
      </div>
      <div class="cosmic-datastreams">
        <div class="cosmic-datastream cosmic-datastream-1"></div>
        <div class="cosmic-datastream cosmic-datastream-2"></div>
        <div class="cosmic-datastream cosmic-datastream-3"></div>
      </div>
      <div class="cosmic-glass-vignette"></div>
    </div>
  `
}
