/**
 * useScrollReveal — 卡片交错入场动画 Hook (v2 — Robust)
 *
 * 修复：gsap.from() 的 immediateRender:true 会导致元素立即被设为 opacity:0，
 * 若 ScrollTrigger 未正确触发，元素将永久不可见。
 *
 * v2 方案：gsap.set() 设置初始隐藏态 → ScrollTrigger.create() onEnter 播放动画
 *         + 立即检查元素是否已在视口内 + 2s 兜底超时强制可见
 *
 * @param {Object} opts
 * @param {string} opts.selector — 子元素选择器（如 '.reveal-card'）
 * @param {number} opts.stagger — 交错间隔，默认 0.12
 * @param {number} opts.y — 起始 Y 偏移，默认 50
 * @returns {Ref} containerRef — 挂到容器元素
 */
import { useLayoutEffect, useRef } from '../deps.js'
import { gsap, ScrollTrigger } from './gsapSetup.js'

export function useScrollReveal({ selector, stagger = 0.12, y = 50 } = {}) {
  const containerRef = useRef(null)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el || !selector) return

    const prefersReduced = typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) return

    // 延迟一帧让 DOM 完全布局后再查询
    let rafId = requestAnimationFrame(() => {
      const items = el.querySelectorAll(selector)
      if (!items.length) return

      let animated = false
      let fallbackTimer = null

      // 设置初始隐藏态
      gsap.set(items, { y, opacity: 0 })

      const play = () => {
        if (animated) return
        animated = true
        if (fallbackTimer) clearTimeout(fallbackTimer)
        gsap.to(items, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          stagger,
          onStart: () => {
            items.forEach((item, i) => {
              setTimeout(() => {
                item.classList.add('reveal-trail')
                setTimeout(() => item.classList.remove('reveal-trail'), 700)
              }, i * stagger * 1000)
            })
          },
        })
      }

      // 检查元素是否已在视口内
      const rect = el.getBoundingClientRect()
      const isInView = rect.top < window.innerHeight * 0.85 && rect.bottom > 0

      if (isInView) {
        // 已在视口内，延迟 100ms 播放（让初始状态渲染一帧）
        setTimeout(play, 100)
      } else {
        // 不在视口内，创建 ScrollTrigger
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: play,
        })
      }

      // 兜底：2s 后若仍未动画，强制可见
      fallbackTimer = setTimeout(() => {
        if (!animated) {
          console.warn('[useScrollReveal] Fallback: forcing visible for', selector)
          play()
        }
      }, 2000)
    })

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [selector, stagger, y])

  return containerRef
}
