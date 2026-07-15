// 游戏广场顶栏：参考图风格的深色悬浮导航
import { html, useState, useEffect } from '../../react.js'
import { useHall } from './GameHall.js'
import { useApp } from '../../store/appContext.js'
import { audio } from '../../lib/audio.js'

export default function HallNav() {
  const { hall, toggleMute, goStep, STEPS, onLogoClick } = useHall()
  const { state } = useApp()
  const [scrolled, setScrolled] = useState(false)
  const [navHover, setNavHover] = useState(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    audio.sfx?.('click')
    const reducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  const navToAuth = () => {
    audio.sfx?.('click')
    goStep(STEPS.AUTH)
  }

  const navItems = [
    { id: 'hero', label: '游戏广场' },
    { id: 'stage', label: '智能体团队' },
    { id: 'universe', label: '我的项目' },
    { id: 'recommend', label: '社区灵感' },
    { id: 'team', label: '文档中心' },
  ]

  return html`
    <nav
      className=${`hall-nav ${scrolled ? 'is-scrolled' : ''}`}
      style=${{
        background: scrolled ? 'rgba(7,11,29,0.88)' : 'rgba(7,11,29,0.52)',
      }}>
      <div className="hall-nav__inner">
        <button
          className="hall-nav__brand"
          aria-label="返回游戏广场顶部"
          onClick=${() => { scrollTo('hero'); onLogoClick?.() }}>
          <div className="hall-nav__brand-mark">
            <div className="hall-nav__brand-glow"></div>
            <div className="hall-nav__brand-core"></div>
          </div>
          <div className="hall-nav__brand-copy">
            <span className="hall-nav__brand-title">游戏广场</span>
            <span className="hall-nav__brand-subtitle">${hall.necromancer ? '暗夜模式' : '多 AI 共创中枢'}</span>
          </div>
        </button>

        <div className="hall-nav__links">
          ${navItems.map(item => html`
            <button
              key=${item.id}
              onClick=${() => scrollTo(item.id)}
              onMouseEnter=${() => setNavHover(item.id)}
              onMouseLeave=${() => setNavHover(null)}
              className=${`hall-nav__link ${navHover === item.id ? 'is-hovered' : ''}`}>
              ${item.label}
            </button>
          `)}
        </div>

        <div className="hall-nav-actions">
          <button className="hall-nav-icon" aria-label="搜索" title="搜索">⌕</button>
          <button className="hall-nav-icon" aria-label="通知" title="通知">◉</button>
          <button className="hall-nav-icon" aria-label="收藏" title="收藏">✦</button>
          <button
            onClick=${toggleMute}
            aria-label=${hall.muted ? '开启大厅声音' : '关闭大厅声音'}
            className="hall-nav-icon"
            title=${hall.muted ? '开启声音' : '静音'}>
            ${hall.muted ? '🔇' : '🔊'}
          </button>
          ${!state.user ? html`
            <button onClick=${navToAuth} className="hall-nav-cta">
              登录 / 注册
            </button>
          ` : html`
            <div className="hall-user-pill">
              <span className="hall-user-pill__avatar">
                ${(state.user.nickname || 'U').slice(0, 1).toUpperCase()}
              </span>
              <span className="hall-user-pill__name">${state.user.nickname || '玩家'}</span>
            </div>
          `}
        </div>
      </div>
    </nav>
  `
}
