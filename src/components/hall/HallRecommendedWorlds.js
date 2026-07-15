import { html } from '../../react.js'
import { HALL_RECOMMENDED_WORLDS } from '../../data/hallPlazaContent.mjs'

export default function HallRecommendedWorlds() {
  return html`
    <div className="hall-recommend">
      <div className="hall-section-head">
        <div>
          <h2>AI 推荐给你的世界</h2>
          <p>基于热门题材、协作热度与完成度筛选出的高潜力项目</p>
        </div>
      </div>

      <div className="hall-recommend__grid">
        ${HALL_RECOMMENDED_WORLDS.map((item) => html`
          <article key=${item.id} className="hall-recommend-card">
            <img className="hall-recommend-card__cover" src=${item.image} alt=${item.title} />
            <div className="hall-recommend-card__overlay"></div>
            <div className="hall-recommend-card__body">
              <div className="hall-recommend-card__top">
                <span className="hall-recommend-card__tag">${item.tag}</span>
                <span className="hall-recommend-card__players">${item.players}</span>
              </div>
              <h3>${item.title}</h3>
              <p>${item.subtitle}</p>
              <div className="hall-recommend-card__footer">
                <div className="hall-recommend-card__meter">
                  <span style=${{ width: `${item.score}%` }}></span>
                </div>
                <button>${item.action}</button>
              </div>
            </div>
          </article>
        `)}
      </div>
    </div>
  `
}
