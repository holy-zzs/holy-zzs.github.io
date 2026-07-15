import { html } from '../../../deps.js'
import { useScrollReveal } from '../../../lib/useScrollReveal.js'

export default function ShowcaseWallSection({ items }) {
  const revealRef = useScrollReveal({ selector: '.reveal-card', stagger: 0.12 })

  return html`
    <section ref=${revealRef} class="brand-section"
             data-connect data-connect-anchor=".showcase-row-card"
             data-totem-target=".canvas-wm-4" data-connect-color="#C084FC">
      <div class="brand-shell-inner">
        <div class="brand-section-heading text-center" style=${{ margin: '0 auto 40px' }}>
          <span class="terminal-eyebrow">&lt;OUTPUT_GALLERY /&gt;</span>
          <h2 class="text-3xl md:text-4xl font-black text-white retro-text-shadow mb-4 cyber-title cyber-glitch-hover" data-text="游戏成果展示">游戏成果展示</h2>
          <p class="brand-section-subtitle text-purple-200">看看其他用户生成的互动游戏体验。</p>
        </div>
        <div class="brand-showcase-list">
          ${items.map((item, index) => html`
            <article key=${item.key} class=${`brand-surface-card showcase-row-card reveal-card ${index % 2 !== 0 ? 'showcase-row-reverse' : ''}`}>
              <div class="showcase-row-image-wrap">
                <img src=${item.image} alt=${item.title} class="showcase-row-image" loading="lazy" />
                <div class="showcase-image-glitch"></div>
              </div>
              <div class="showcase-row-content">
                <div class="brand-showcase-label">${item.label}</div>
                <h3 class="showcase-row-title">${item.title}</h3>
                <p class="showcase-row-desc">${item.desc}</p>
                <button class="retro-neon-btn showcase-try-btn">
                  体验 Demo
                </button>
              </div>
            </article>
          `)}
        </div>
      </div>
    </section>
  `
}
