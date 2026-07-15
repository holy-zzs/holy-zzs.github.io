import { html } from '../../react.js'
import { HALL_COSMIC_DISCIPLINES } from '../../data/hallPlazaContent.mjs'

export default function HallCosmicBoard() {
  return html`
    <div className="hall-cosmic-board">
      <div className="hall-cosmic-board__grid"></div>
      <div className="hall-cosmic-board__rings">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="hall-cosmic-board__core">
        <div className="hall-cosmic-board__core-label">主游戏宇宙</div>
        <div className="hall-cosmic-board__core-name">Genesis Prime</div>
      </div>

      ${HALL_COSMIC_DISCIPLINES.map((item, index) => html`
        <div
          key=${item.id}
          className="hall-cosmic-node"
          style=${{ '--node-index': index, '--node-accent': item.accent }}>
          <div className="hall-cosmic-node__orb"></div>
          <div className="hall-cosmic-node__label">${item.label}</div>
        </div>
      `)}
    </div>
  `
}
