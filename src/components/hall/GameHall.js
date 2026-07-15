// 游戏广场 · 全息模组匣子
// 通过 iframe 加载设计稿 HTML，保持原封不动的视觉效果
// 监听 iframe 内 postMessage 实现导航跳转
import { html, useEffect, useRef } from '../../react.js'
import { useApp, STEPS } from '../../store/appContext.js?v=ctx2'

// 默认用户头像（demo 阶段统一使用）
export const DEFAULT_AVATAR = '/assets/agents/image_0_yi19x4.jpg'

export default function GameHall() {
  const { state, goStep } = useApp()
  const iframeRef = useRef(null)

  // 沉浸式：iframe 铺满整个视口
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // 监听 iframe 内的 postMessage 实现导航
  useEffect(() => {
    const handler = (e) => {
      // 只处理来自 game-hall iframe 的消息
      if (!e.data || e.data.type !== 'gpz-navigate') return
      const target = e.data.target
      // 先恢复 body 滚动
      document.body.style.overflow = ''
      if (target === 'landing') goStep(STEPS.LANDING)
      else if (target === 'profile') goStep(STEPS.PROFILE)
      else if (target === 'pricing') goStep(STEPS.PRICING)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [goStep])

  return html`
    <div style=${{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: '#050208',
    }}>
      <iframe
        ref=${iframeRef}
        src="/game-hall.html"
        title="游戏广场 · 全息模组匣子"
        style=${{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
        allow="fullscreen"
      />
    </div>
  `
}
