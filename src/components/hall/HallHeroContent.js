import { html } from '../../react.js'
import { useApp } from '../../store/appContext.js'
import { useHall } from './GameHall.js'
import { HALL_PLAZA_HERO, HALL_PLAZA_STATS } from '../../data/hallPlazaContent.mjs'
import { audio } from '../../lib/audio.js'

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function HallHeroContent() {
  const { state } = useApp()
  const { triggerAuth, goStep, STEPS } = useHall()

  const onPrimary = () => {
    audio.sfx?.('warp')
    if (!state.user) triggerAuth('开始创建你的游戏宇宙', 'hall_primary_cta')
    else goStep(STEPS.UPLOAD)
  }

  const onSecondary = () => {
    audio.sfx?.('click')
    scrollToId('stage')
  }

  const onTertiary = () => {
    audio.sfx?.('click')
    if (!state.user) triggerAuth('邀请 AI 团队加入共创', 'hall_team_cta')
    else goStep(STEPS.PRESET)
  }

  return html`
    <div className="hall-hero-copy">
      <div className="hall-badge">${HALL_PLAZA_HERO.eyebrow}</div>
      <h1 className="hall-hero-title">${HALL_PLAZA_HERO.title}</h1>
      <p className="hall-hero-highlight">${HALL_PLAZA_HERO.highlight}</p>
      <p className="hall-hero-description">${HALL_PLAZA_HERO.description}</p>

      <div className="hall-hero-actions">
        <button onClick=${onPrimary} className="hall-btn hall-btn--primary">
          ${HALL_PLAZA_HERO.primaryCta.label}
        </button>
        <button onClick=${onSecondary} className="hall-btn hall-btn--secondary">
          ${HALL_PLAZA_HERO.secondaryCta.label}
        </button>
        <button onClick=${onTertiary} className="hall-btn hall-btn--ghost">
          ${HALL_PLAZA_HERO.tertiaryCta.label}
        </button>
      </div>

      <div className="hall-metrics">
        ${HALL_PLAZA_STATS.map((item) => html`
          <div key=${item.label} className="hall-metric">
            <div className="hall-metric__value">${item.value}</div>
            <div className="hall-metric__label">${item.label}</div>
          </div>
        `)}
      </div>
    </div>
  `
}
