import { html } from '../../../deps.js'
import { useScrollReveal } from '../../../lib/useScrollReveal.js'

export default function PipelineSection({ items }) {
  const revealRef = useScrollReveal({ selector: '.reveal-card', stagger: 0.12 })
  return html`
    <section ref=${revealRef} class="brand-section">
      <div class="brand-shell-inner">
        <div class="brand-section-heading text-center" style=${{ margin: '0 auto 40px' }}>
          <span class="terminal-eyebrow">&lt;PRODUCTION_PIPELINE /&gt;</span>
          <h2 class="text-3xl md:text-4xl font-black text-white retro-text-shadow mb-4 cyber-title cyber-glitch-hover" data-text="从意图到成果，只需三步">从意图到成果，只需三步</h2>
          <p class="brand-section-subtitle text-purple-200">AI 圆桌持续组织整个游戏生产过程，你只需提出要求并验收成果。</p>
        </div>
        <div class="brand-pipeline-grid">
          ${items.map((item, index) => html`
            <article key=${item.key} class="brand-surface-card brand-pipeline-card reveal-card">
              <div class="brand-pipeline-index">${String(index + 1).padStart(2, '0')}</div>
              <h3>${item.title}</h3>
              <p>${item.desc}</p>
            </article>
          `)}
        </div>
      </div>
    </section>
  `
}
