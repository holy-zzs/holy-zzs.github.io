import { html } from '../../../deps.js'
import { useScrollReveal } from '../../../lib/useScrollReveal.js'

export default function SocialProofSection({ data }) {
  const revealRef = useScrollReveal({ selector: '.reveal-card', stagger: 0.10 })
  if (!data) return null
  const { stats = [], reviews = [] } = data

  return html`
    <section ref=${revealRef} class="brand-section social-proof-section relative">
      <!-- Pixel art stars background -->
      <div class="absolute inset-0 pointer-events-none opacity-5" style=${{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <div class="brand-shell-inner relative z-10">
        <div class="flex justify-center mb-4">
          <span class="terminal-eyebrow">&lt;USER_SIGNAL_DATA /&gt;</span>
        </div>
        <div class="flex justify-center mb-12">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-mono text-sm shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            <span class="animate-bounce">🏆</span> ACHIEVEMENT UNLOCKED: 获得用户认可
          </div>
        </div>
        
        <!-- Stats Row -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          ${stats.map((stat, idx) => html`
            <div key=${idx} class="brand-surface-card reveal-card p-6 text-center border-t-4 transform hover:scale-105 transition-transform duration-300 relative overflow-hidden group" style=${{ borderTopColor: ['#a855f7', '#ec4899', '#3b82f6', '#10b981'][idx % 4] }}>
              <!-- Shine effect -->
              <div class="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform skew-x-[-20deg] group-hover:left-[200%] transition-all duration-700 ease-in-out"></div>
              
              <div class="text-4xl md:text-5xl font-black mb-2 font-mono text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 filter drop-shadow-md">
                ${stat.value}
              </div>
              <div class="text-sm font-bold text-gray-400 tracking-wider">
                ${stat.label}
              </div>
            </div>
          `)}
        </div>
        
        <!-- Reviews Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${reviews.map((review, idx) => html`
            <div key=${idx} class="brand-surface-card reveal-card p-8 relative pl-12 group hover:border-purple-500/30 transition-colors">
              <!-- Big quote mark -->
              <div class="absolute left-4 top-6 text-5xl text-purple-500/40 font-serif font-black group-hover:text-purple-400/60 transition-colors">"</div>
              
              <p class="text-base text-gray-300 leading-relaxed mb-6 italic relative z-10">
                ${review.text}
              </p>
              
              <div class="text-right text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
                <span class="inline-block mr-2 animate-pulse text-purple-500">▶</span>
                ${review.author}
              </div>
            </div>
          `)}
        </div>
      </div>
    </section>
  `
}