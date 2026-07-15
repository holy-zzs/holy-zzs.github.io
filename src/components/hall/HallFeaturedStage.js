import { html, useMemo } from '../../react.js'
import { useHall } from './GameHall.js'
import { HALL_STAGE_WORLDS } from '../../data/hallPlazaContent.mjs'

export default function HallFeaturedStage() {
  const { hall, hallDispatch } = useHall()

  const active = useMemo(
    () => HALL_STAGE_WORLDS.find((item) => item.id === hall.activeStageId) || HALL_STAGE_WORLDS[0],
    [hall.activeStageId]
  )

  return html`
    <div className="hall-stage">
      <div className="hall-section-head">
        <div>
          <h2>AI 正在创造</h2>
          <p>当前主世界与分支场景预览</p>
        </div>
        <a href="#universe">创意宇宙</a>
      </div>

      <div className="hall-stage__featured">
        <img className="hall-stage__featured-image" src=${active.image} alt=${active.title} />
        <div className="hall-stage__featured-overlay"></div>
        <div className="hall-stage__featured-copy">
          <div className="hall-stage__tag">${active.tag}</div>
          <h3>${active.title}</h3>
          <p>${active.description}</p>
        </div>
      </div>

      <div className="hall-stage__thumbs">
        ${HALL_STAGE_WORLDS.map((item) => html`
          <button
            key=${item.id}
            onClick=${() => hallDispatch({ type: 'SET_ACTIVE_STAGE', payload: item.id })}
            className=${`hall-stage__thumb ${active.id === item.id ? 'is-active' : ''}`}>
            <img src=${item.thumb} alt=${item.title} />
            <span>${item.title}</span>
          </button>
        `)}
      </div>
    </div>
  `
}
