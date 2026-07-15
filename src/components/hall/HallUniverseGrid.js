import { html } from '../../react.js'
import { HALL_UNIVERSE_CARDS } from '../../data/hallPlazaContent.mjs'

export default function HallUniverseGrid() {
  return html`
    <div className="hall-universe">
      <div className="hall-section-head">
        <div>
          <h2>创意宇宙</h2>
          <p>从不同题材入口，查看 AI 正在孵化的游戏概念</p>
        </div>
        <a href="#recommend">查看更多</a>
      </div>

      <div className="hall-universe__grid">
        ${HALL_UNIVERSE_CARDS.map((item) => html`
          <article key=${item.id} className="hall-universe-card">
            <img className="hall-universe-card__image" src=${item.image} alt=${item.title} />
            <div className="hall-universe-card__overlay"></div>
            <div className="hall-universe-card__body">
              <div className="hall-universe-card__badge">${item.badge}</div>
              <h3>${item.title}</h3>
              <p>${item.meta}</p>
              <button>${item.action}</button>
            </div>
          </article>
        `)}
      </div>
    </div>
  `
}
