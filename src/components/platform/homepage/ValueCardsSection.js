import { html } from '../../../deps.js'
import { useScrollReveal } from '../../../lib/useScrollReveal.js'

export default function ValueCardsSection({ items = [] }) {
  const revealRef = useScrollReveal({ selector: '.reveal-card', stagger: 0.12 })

  if (!items || items.length === 0) return null

  return html`
    <section ref=${revealRef} class="brand-section value-cards-section relative z-10"
             data-connect data-connect-anchor=".reveal-card"
             data-totem-target=".canvas-wm-2" data-connect-color="#C084FC">
      <!-- Background glow to blend with hero -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-900/20 blur-[100px] pointer-events-none rounded-[100%]"></div>
      
      <!-- Cyber Circuit SVG Background -->
      <div class="absolute inset-0 pointer-events-none opacity-10" style=${{ 
        backgroundImage: 'radial-gradient(circle at 50% 0%, transparent 40%, #05010f 80%)',
        backgroundSize: '100px 100px'
      }}></div>

      <div class="brand-shell-inner relative">
        <div class="text-center mb-16">
          <span class="terminal-eyebrow">&lt;CORE_SYSTEM_SCAN /&gt;</span>
          <h2 class="text-3xl md:text-4xl font-black text-white retro-text-shadow cyber-title cyber-glitch-hover" data-text="为什么选择「知识不进脑子啊」？">
            为什么选择「知识不进脑子啊」？
          </h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${items.map((item, i) => html`
            <div key=${item.title} class="brand-surface-card reveal-card p-8 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300 relative group overflow-hidden border border-white/5 hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(167,139,250,0.15)]">
              <!-- HUD decorative corners -->
              <div class="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-500/50 opacity-50 group-hover:opacity-100 group-hover:border-purple-400 transition-all"></div>
              <div class="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-fuchsia-500/50 opacity-50 group-hover:opacity-100 group-hover:border-fuchsia-400 transition-all"></div>
              
              <!-- Scanline effect on hover -->
              <div class="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(167,139,250,0.05)_50%)] bg-[length:100%_4px] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
              
              <!-- Slot number -->
              <div class="absolute top-4 right-4 text-xs font-mono text-white/30 group-hover:text-purple-400/60 transition-colors">
                SYS.0${i + 1}
              </div>
              
              <div class="text-6xl mb-6 filter drop-shadow-[0_0_15px_rgba(167,139,250,0.8)] group-hover:scale-110 transition-transform duration-500 group-hover:animate-pulse">
                ${item.icon}
              </div>
              
              <h3 class="text-xl font-bold mb-6 text-white tracking-wider flex items-center gap-2 cyber-text-glow">
                <span class="w-2 h-2 rounded-sm bg-purple-500 group-hover:bg-fuchsia-400 transition-colors"></span>
                ${item.title}
              </h3>
              
              <ul class="flex flex-col gap-3 w-full relative z-10">
                ${item.features.map((feature, idx) => html`
                  <li key=${feature} class="text-sm text-gray-300 bg-white/5 rounded-md py-2.5 px-4 border border-white/5 group-hover:border-purple-500/20 group-hover:bg-purple-900/10 transition-all text-left flex items-center justify-between cyber-text-glow" style=${{ transitionDelay: (idx * 50) + 'ms' }}>
                    <span>${feature}</span>
                    <span class="cyber-data text-[10px] opacity-60 group-hover:opacity-100 transition-opacity">OK</span>
                  </li>
                `)}
              </ul>
            </div>
          `)}
        </div>
      </div>
    </section>
  `
}