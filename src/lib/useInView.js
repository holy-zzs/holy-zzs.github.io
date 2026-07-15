/**
 * useInView — IntersectionObserver 视口检测 Hook
 *
 * 元素进入视口时返回 inView=true，且只触发一次（unobserve）。
 * 用于懒触发动画、懒加载图片等。
 *
 * @param {Object} options — IntersectionObserver 选项
 * @param {number} options.threshold — 可见比例阈值，默认 0.2
 * @param {string} options.rootMargin — 根元素 margin，默认 '0px'
 * @returns {[Ref, boolean]} [ref, inView]
 */
import { useEffect, useRef, useState } from '../deps.js'

export function useInView(options = {}) {
  const { threshold = 0.2, rootMargin = '0px' } = options
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true)
            io.unobserve(el)
          }
        })
      },
      { threshold, rootMargin }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [threshold, rootMargin])

  return [ref, inView]
}
