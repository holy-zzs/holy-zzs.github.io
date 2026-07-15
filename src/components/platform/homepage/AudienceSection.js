import { html } from '../../../deps.js'

export default function AudienceSection({ items }) {
  return html`
    <section class="brand-section">
      <div class="brand-shell-inner">
        <div class="brand-section-heading">
          <div class="brand-eyebrow">Audience</div>
          <h2 class="brand-section-title">一套平台，承接混合用户的不同生产目标</h2>
          <p class="brand-section-subtitle">首页不锁死单一教育场景，而是先给市场一个更大的产品叙事空间。</p>
        </div>
        <div class="brand-audience-grid">
          ${items.map((item) => html`
            <article key=${item.key} class="brand-surface-card brand-audience-card">
              <h3>${item.title}</h3>
              <p>${item.desc}</p>
            </article>
          `)}
        </div>
      </div>
    </section>
  `
}
