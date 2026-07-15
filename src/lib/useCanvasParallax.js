/**
 * useCanvasParallax — 5 层视差 Hook
 *
 * 用 GSAP ScrollTrigger 替代手写 rAF 视差：
 *   背景层 0.15x、网格层 0.2x、图腾层 0.3x
 */
import { useLayoutEffect } from '../deps.js'
import { gsap, ScrollTrigger } from './gsapSetup.js'

export function useCanvasParallax(rootRef) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const ctx = gsap.context(() => {
      // 图腾层 0.3x（用户明确要求）
      gsap.to('.canvas-watermarks', {
        yPercent: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      })

      // 背景层 0.15x
      gsap.to('.canvas-bg-fixed', {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2,
        },
      })

      // 网格层 0.2x
      gsap.to('.canvas-grid', {
        yPercent: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2,
        },
      })

      // 滚动进度 CSS 变量（光束速度跟随）
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const progress = self.progress
          document.documentElement.style.setProperty(
            '--canvas-scroll-progress',
            progress.toFixed(4)
          )
          // 基础时长 6s，随滚动进度从 6s → 3s 渐进加速
          const speed = 6 - progress * 3
          document.documentElement.style.setProperty('--beam-duration', `${speed.toFixed(2)}s`)
          document.documentElement.style.setProperty('--beam-duration-2', `${(speed * 1.15).toFixed(2)}s`)
          document.documentElement.style.setProperty('--beam-duration-3', `${(speed * 0.85).toFixed(2)}s`)
        },
      })
    }, root)

    return () => ctx.revert()
  }, [rootRef])
}
