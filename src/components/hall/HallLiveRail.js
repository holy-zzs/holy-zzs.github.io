import { html } from '../../react.js'
import { HALL_LIVE_RAIL } from '../../data/hallPlazaContent.mjs'

export default function HallLiveRail() {
  return html`
    <aside className="hall-live-rail">
      <div className="hall-live-rail__head">
        <div>
          <h3>AI 正在创作</h3>
          <p>实时共创状态</p>
        </div>
        <span className="hall-live-pill">Live</span>
      </div>

      <div className="hall-live-rail__list">
        ${HALL_LIVE_RAIL.map((item) => html`
          <div key=${item.id} className="hall-live-item">
            <div className="hall-live-item__meta">
              <img className="hall-live-item__avatar" src=${item.avatar} alt=${item.name} />
              <div className="hall-live-item__text">
                <div className="hall-live-item__name">${item.name}</div>
                <div className="hall-live-item__task">${item.task}</div>
              </div>
              <div className="hall-live-item__status">${item.status}</div>
            </div>
            <div className="hall-live-item__progress">
              <span style=${{ width: `${item.progress}%` }}></span>
            </div>
          </div>
        `)}
      </div>
    </aside>
  `
}
