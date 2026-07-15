import { html } from '../../../deps.js'

export default function ComparisonSection({ items }) {
  return html`
    <section class="brand-section">
      <div class="brand-shell-inner">
        <div class="brand-section-heading">
          <div class="brand-eyebrow">Differentiation</div>
          <h2 class="brand-section-title">把知识不进脑子啊和旧工具区分开，而不是只做另一套说明书</h2>
        </div>
        <div class="brand-comparison-table brand-surface-card">
          <div class="brand-comparison-head">
            <span>对比对象</span>
            <span>知识不进脑子啊</span>
            <span>传统方式</span>
          </div>
          ${items.map((item) => html`
            <div key=${item.key} class="brand-comparison-row">
              <span>${item.label}</span>
              <span>${item.ours}</span>
              <span>${item.theirs}</span>
            </div>
          `)}
        </div>
      </div>
    </section>
  `
}
