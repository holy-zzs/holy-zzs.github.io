/**
 * gsapSetup.js — GSAP 注册中心
 *
 * 集中注册 ScrollTrigger 插件，避免各组件重复注册。
 * 所有需要 GSAP 的组件统一从此文件导入。
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// 尊重 prefers-reduced-motion
const prefersReduced = typeof window !== 'undefined'
  && window.matchMedia
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (prefersReduced) {
  gsap.globalTimeline.timeScale(0)
  ScrollTrigger.config({ ignoreMobileResize: true })
}

export { gsap, ScrollTrigger }
export default gsap
