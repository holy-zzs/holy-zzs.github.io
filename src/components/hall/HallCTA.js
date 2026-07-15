// 延迟注册召唤区：大厅底部 CTA
import { html } from '../../react.js'
import { useHall } from './GameHall.js'
import { useApp, STEPS } from '../../store/appContext.js'
import { audio } from '../../lib/audio.js'

export default function HallCTA() {
  const { triggerAuth, goStep, STEPS } = useHall()
  const { state } = useApp()

  const startCreating = () => {
    audio.sfx?.('warp')
    if (!state.user) {
      triggerAuth('开始创造属于你的游戏世界', 'hall_final_cta')
    } else {
      goStep(STEPS.UPLOAD)
    }
  }

  return html`
    <section className="hall-final-cta">
      <div className="hall-final-cta__bg"></div>
      <div className="hall-final-cta__content">
        <div className="hall-badge">Final Call</div>
        <h2>不要再独自开发游戏</h2>
        <p>
          让一支由多位 AI 总监组成的团队，从你的一个念头开始，把完整游戏方案共同做出来。
        </p>
        <div className="hall-final-cta__actions">
          <button onClick=${startCreating} className="hall-btn hall-btn--primary">
            开始创造属于你的世界
          </button>
          ${!state.user && html`
            <button
              onClick=${() => { audio.sfx?.('click'); goStep(STEPS.AUTH) }}
              className="hall-btn hall-btn--ghost">
              已有账号？登录
            </button>
          `}
        </div>
      </div>
    </section>
  `
}
