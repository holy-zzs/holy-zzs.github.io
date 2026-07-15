/**
 * CanvasConnections — 连接线高亮系统
 *
 * position: fixed SVG 覆盖层，为标记了 data-connect 的 section
 * 创建从卡片到背景图腾的发光连接线。
 *
 * 标记方式：
 *   <section data-connect data-connect-anchor=".jarvis-container"
 *            data-totem-target=".canvas-wm-1"
 *            data-connect-color="#67E8F9">
 */
import { html, useEffect, useRef } from '../../../deps.js'
import { gsap, ScrollTrigger } from '../../../lib/gsapSetup.js'

export default function CanvasConnections() {
  const svgRef = useRef(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const prefersReduced = typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) return

    // 移动端不启用连接线
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    if (isMobile) return

    const lines = []
    const sections = document.querySelectorAll('[data-connect]')

    sections.forEach((section) => {
      const cardSelector = section.dataset.connectAnchor
      const totemSelector = section.dataset.totemTarget
      const color = section.dataset.connectColor || '#C084FC'

      if (!cardSelector || !totemSelector) return

      const card = section.querySelector(cardSelector)
      const totem = document.querySelector(totemSelector)
      if (!card || !totem) return

      // 创建 path 元素
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('class', 'canvas-connect-line')
      path.setAttribute('stroke', color)
      path.style.color = color
      svg.appendChild(path)

      const lineData = { path, card, totem, section }
      lines.push(lineData)

      // ScrollTrigger：进入视口时绘制
      ScrollTrigger.create({
        trigger: section,
        start: 'top 70%',
        end: 'bottom 30%',
        onEnter: () => drawLine(lineData),
        onLeave: () => fadeLine(path),
        onEnterBack: () => drawLine(lineData),
        onLeaveBack: () => fadeLine(path),
      })
    })

    function drawLine({ path, card, totem }) {
      const cardRect = card.getBoundingClientRect()
      const totemRect = totem.getBoundingClientRect()
      const x1 = cardRect.left + cardRect.width / 2
      const y1 = cardRect.top + cardRect.height / 2
      const x2 = totemRect.left + totemRect.width / 2
      const y2 = totemRect.top + totemRect.height / 2

      // 贝塞尔曲线
      const midX = (x1 + x2) / 2
      const midY = Math.min(y1, y2) - 60
      path.setAttribute('d', `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`)

      // GSAP 绘制动画
      const len = path.getTotalLength()
      gsap.fromTo(
        path,
        { strokeDasharray: len, strokeDashoffset: len, opacity: 0.6 },
        { strokeDashoffset: 0, duration: 1, ease: 'power2.out' }
      )
    }

    function fadeLine(path) {
      gsap.to(path, { opacity: 0, duration: 0.4 })
    }

    return () => {
      lines.forEach((l) => l.path.remove())
    }
  }, [])

  return html`<svg ref=${svgRef} class="canvas-connections" preserveAspectRatio="none"></svg>`
}
