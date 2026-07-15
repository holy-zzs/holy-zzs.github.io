/**
 * useLazyImage — 图片懒加载 Hook
 *
 * 用 IntersectionObserver 在图片接近视口时才设置 src。
 * 支持 rootMargin 预加载。
 *
 * @param {string} src — 图片真实地址
 * @param {string} rootMargin — 预加载距离，默认 '200px'
 * @returns {Ref} ref — 挂到 <img> 元素
 */
import { useEffect, useRef } from '../deps.js'

export function useLazyImage(src, rootMargin = '200px') {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      el.src = src
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.src = src
            io.unobserve(el)
          }
        })
      },
      { rootMargin }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [src, rootMargin])

  return ref
}
