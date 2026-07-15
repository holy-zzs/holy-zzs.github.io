import { html, useMemo } from '../../../deps.js'

/**
 * SectionBridge v3 — 渐变流体过渡
 * 
 * 设计理念：不是"带"，是"融合"
 * - 负margin让过渡区与上下section重叠，消除人为切割感
 * - 有机渐变光晕取代硬边框/网格/节点
 * - 极细流体丝线取代电路管线
 * - 微光尘粒沿丝线漂浮，不喧宾夺主
 * - 标签无边框无背景，纯文字浮于渐变中
 * 
 * 视觉层（从底到顶）：
 * 1. 有机渐变光晕 — 紫色上+金色下+中央融合
 * 2. 上下底色融合 — 双向60%渐变
 * 3. 流体丝线 — 3条柔和弯曲SVG曲线，缓慢dash流动
 * 4. 光尘 — 2-3个微光点沿水平线漂浮
 * 5. 微光粒子 — 4个极小浮动粒子
 * 6. 标签 — 纯文字+两侧渐隐装饰线
 */
export default function SectionBridge({ label = '', variant = 'default' }) {
  // 光尘 — 不同速度和颜色
  const dust = useMemo(
    () => [
      { delay: '0s',   duration: '9s',  gold: false, top: '48%' },
      { delay: '3s',   duration: '11s', gold: true,  top: '52%' },
      { delay: '6s',   duration: '10s', gold: false, top: '46%' },
    ],
    []
  )

  // 微光粒子
  const particles = useMemo(
    () => Array.from({ length: 5 }).map((_, i) => ({
      left: `${10 + i * 20}%`,
      top: `${20 + (i * 15) % 60}%`,
      delay: `${(i * 0.8).toFixed(1)}s`,
      duration: `${(5 + (i % 3)).toFixed(1)}s`,
    })),
    []
  )

  return html`
    <div class="section-bridge">
      <!-- 1. 有机渐变光晕 -->
      <div class="section-bridge-glow"></div>

      <!-- 2. 上下底色融合 -->
      <div class="section-bridge-fade-top"></div>
      <div class="section-bridge-fade-bottom"></div>

      <!-- 3. 流体丝线 -->
      <svg class="section-bridge-svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <!-- 辉光底层 -->
        <path class="flow-thread-glow" d="M 0 60 Q 300 30, 600 60 T 1200 60" />
        <!-- 主丝线 -->
        <path class="flow-thread-main" d="M 0 60 Q 300 30, 600 60 T 1200 60" />
        <!-- 金色辅助丝线 -->
        <path class="flow-thread-accent" d="M 0 65 Q 300 85, 600 65 T 1200 65" />
      </svg>

      <!-- 4. 光尘 -->
      ${dust.map((d, i) => html`
        <div key=${`dust-${i}`}
             class=${`flow-dust ${d.gold ? 'flow-dust-gold' : ''}`}
             style=${{
               top: d.top,
               animationDelay: d.delay,
               animationDuration: d.duration,
             }}>
        </div>
      `)}

      <!-- 5. 微光粒子 -->
      ${particles.map((p, i) => html`
        <div key=${`p-${i}`}
             class="flow-particle"
             style=${{
               left: p.left,
               top: p.top,
               animationDelay: p.delay,
               animationDuration: p.duration,
             }}>
        </div>
      `)}

      <!-- 6. 标签 -->
      ${label ? html`
        <div class="section-bridge-center">
          <div class="section-bridge-label">
            <span class="section-bridge-bracket">[</span>
            ${label}
            <span class="section-bridge-cursor">_</span>
            <span class="section-bridge-bracket">]</span>
          </div>
        </div>
      ` : null}
    </div>
  `
}
