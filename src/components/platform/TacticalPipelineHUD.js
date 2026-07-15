// ═══════════════════════════════════════════════════════════
// 战术链路指示器 (Tactical Pipeline HUD)
// 4阶段造物流程：投喂知识 → 降维解析 → 唤醒团队 → 宇宙锻造
// ═══════════════════════════════════════════════════════════

import { html } from '../../deps.js'
import { STEPS } from '../../store/appContext.js'

const PIPELINE_STAGES = [
  { id: 'data_input',    num: '01', en: 'UPLOAD_DATA',   cn: '投喂知识',   desc: '燃料注入',         step: STEPS.UPLOAD },
  { id: 'parse',         num: '02', en: 'PARSE_INIT',    cn: '降维解析',   desc: '蓝图扫描与解密',   step: STEPS.MODE },
  { id: 'awaken',        num: '03', en: 'AWAKEN_TEAM',   cn: '唤醒团队',   desc: '军火库插槽激活',   step: STEPS.AGENTS },
  { id: 'forge',         num: '04', en: 'FORGE_ENGINE',  cn: '宇宙锻造',   desc: '引擎全开，实时生成', step: STEPS.WORKSPACE },
]

/**
 * @param {object} props
 * @param {string} props.currentStep  — current STEPS value
 * @param {function} [props.onStepClick]  — optional click handler(step)
 * @param {boolean} [props.compact]  — compact mode (no text labels under nodes)
 */
export default function TacticalPipelineHUD({ currentStep, onStepClick, compact = false }) {
  const currentIdx = PIPELINE_STAGES.findIndex(s => s.step === currentStep)
  // If currentStep is before the pipeline (e.g. LANDING, SUBJECT), all stages are pending
  // If currentStep is after (e.g. PREVIEW), all stages are done
  const effectiveIdx = currentIdx === -1
    ? (currentStep === STEPS.PREVIEW ? PIPELINE_STAGES.length : -1)
    : currentIdx

  return html`
    <div class="tph-wrap">
      ${PIPELINE_STAGES.map((stage, i) => {
        const isDone = i < effectiveIdx
        const isActive = i === effectiveIdx
        const isPending = i > effectiveIdx
        const isReachable = onStepClick && i <= effectiveIdx

        return html`
          <div key=${stage.id} class="tph-stage">
            <!-- 节点 -->
            <div class=${`tph-node ${isDone ? 'tph-done' : ''} ${isActive ? 'tph-active' : ''} ${isPending ? 'tph-pending' : ''}`}
              onClick=${isReachable ? () => onStepClick(stage.step) : undefined}
              role=${isReachable ? 'button' : 'presentation'}
              tabIndex=${isReachable ? 0 : -1}>

              <!-- 节点编号 -->
              <span class="tph-num">${stage.num}</span>

              <!-- 状态标签 -->
              <span class="tph-status">
                ${isDone ? '[ SYS_OK ]' : isActive ? '[ WORKING... ]' : '[ STANDBY ]'}
              </span>
            </div>

            <!-- 连线 -->
            ${i < PIPELINE_STAGES.length - 1 ? html`
              <div class=${`tph-pipe ${isDone ? 'tph-pipe-done' : ''} ${isActive ? 'tph-pipe-active' : ''}`}>
                <div class="tph-pipe-flow"></div>
              </div>
            ` : null}
          </div>
        `
      })}

      <!-- 文本标签层 -->
      ${!compact ? html`
        <div class="tph-labels">
          ${PIPELINE_STAGES.map((stage, i) => {
            const isDone = i < effectiveIdx
            const isActive = i === effectiveIdx
            return html`
              <div key=${stage.id} class=${`tph-label ${isActive ? 'tph-label-active' : ''} ${isDone ? 'tph-label-done' : ''}`}>
                <span class="tph-label-en">${stage.en}</span>
                <span class="tph-label-cn">${stage.cn}</span>
                <span class="tph-label-desc">${stage.desc}</span>
              </div>
            `
          })}
        </div>
      ` : null}
    </div>
  `
}
