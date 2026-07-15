import { html } from '../../react.js'
import { HALL_TEAM_STRIP } from '../../data/hallPlazaContent.mjs'

export default function HallTeamStrip() {
  return html`
    <div className="hall-team-strip">
      <div className="hall-section-head">
        <div>
          <h2>AI 团队</h2>
          <p>从立项到交付，多个专业角色同时加入游戏方案共创</p>
        </div>
      </div>

      <div className="hall-team-strip__list">
        ${HALL_TEAM_STRIP.map((item) => html`
          <div key=${item.id} className="hall-team-item">
            <div className="hall-team-item__icon">${item.icon}</div>
            <div className="hall-team-item__meta">
              <div className="hall-team-item__label">${item.label}</div>
              <div className="hall-team-item__name">${item.name}</div>
            </div>
          </div>
        `)}
      </div>
    </div>
  `
}
