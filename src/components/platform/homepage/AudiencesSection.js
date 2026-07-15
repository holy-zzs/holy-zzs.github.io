import { html } from '../../../deps.js'
import { useScrollReveal } from '../../../lib/useScrollReveal.js'

export default function AudiencesSection({ items = [] }) {
  const revealRef = useScrollReveal({ selector: '.reveal-card', stagger: 0.12 })

  if (!items || items.length === 0) return null

  return html`
    <section ref=${revealRef} class="brand-section audiences-section">
      <div class="brand-shell-inner">
        <div class="text-center mb-12">
          <span class="terminal-eyebrow">&lt;TARGET_AUDIENCES /&gt;</span>
          <h2 class="text-3xl md:text-4xl font-black text-white retro-text-shadow cyber-title cyber-glitch-hover" data-text="谁在用「知识不进脑子啊」？">
            谁在用「知识不进脑子啊」？
          </h2>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          ${items.map(item => html`
            <div key=${item.key} class="brand-surface-card reveal-card p-6 flex flex-col items-center text-center transform hover:scale-105 transition-all duration-300 relative group">
              <!-- Hover Glow effect -->
              <div class="absolute inset-0 bg-gradient-to-b from-purple-500/0 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
              
              <div class="text-5xl mb-4 group-hover:animate-bounce">
                ${item.icon}
              </div>
              
              <h3 class="text-lg font-bold text-white mb-4 bg-white/10 px-4 py-1 rounded-full border border-white/20">
                ${item.title}
              </h3>
              
              <div class="text-sm text-gray-400 whitespace-pre-line leading-relaxed flex-grow">
                ${item.desc}
              </div>
              
              <!-- Game element decorative dots -->
              <div class="absolute bottom-4 flex gap-1 opacity-30 group-hover:opacity-100 transition-opacity">
                <div class="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                <div class="w-1.5 h-1.5 rounded-full bg-fuchsia-400"></div>
                <div class="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
              </div>
            </div>
          `)}
        </div>
      </div>
    </section>
  `
}