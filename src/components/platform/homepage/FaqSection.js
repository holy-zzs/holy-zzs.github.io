import { html, useState } from '../../../deps.js'
import { useScrollReveal } from '../../../lib/useScrollReveal.js'

export default function FaqSection({ items }) {
  const [flipped, setFlipped] = useState({})
  const revealRef = useScrollReveal({ selector: '.reveal-card', stagger: 0.12 })

  const toggleFlip = (index) => {
    setFlipped(prev => ({ ...prev, [index]: !prev[index] }))
  }

  return html`
    <section ref=${revealRef} class="brand-section">
      <div class="brand-shell-inner">
        <div class="brand-section-heading text-center" style=${{ margin: '0 auto 40px' }}>
          <span class="terminal-eyebrow">&lt;FREQUENT_QUERIES /&gt;</span>
          <h2 class="text-3xl md:text-4xl font-black text-white retro-text-shadow mb-4 cyber-title cyber-glitch-hover" data-text="灵魂拷问">灵魂拷问</h2>
          <p class="brand-section-subtitle text-purple-200">打消你的顾虑，点击卡牌翻看答案。</p>
        </div>
        
        <div class="faq-cards-grid">
          ${items.map((item, index) => {
            const isFlipped = flipped[index]
            return html`
              <div key=${index} class="faq-card-container reveal-card group" onClick=${() => toggleFlip(index)}>
                <div class=${`faq-card-inner ${isFlipped ? 'is-flipped' : ''}`}>
                  <!-- Front of Card (Question) -->
                  <div class="faq-card-front brand-surface-card flex flex-col justify-center items-center text-center p-6 border border-white/10 group-hover:border-purple-500/50 group-hover:shadow-[0_0_20px_rgba(167,139,250,0.3)] transition-all duration-300">
                    <div class="absolute top-3 left-3 flex gap-1 opacity-50">
                      <div class="w-2 h-2 rounded-full bg-red-500"></div>
                      <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <div class="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                    <div class="text-4xl mb-6 filter drop-shadow-[0_0_8px_rgba(167,139,250,0.8)]">❓</div>
                    <h3 class="text-lg font-bold tracking-wide" style=${{ color: '#f5e8ff' }}>${item.question || item.q}</h3>
                    <div class="absolute bottom-4 text-xs font-mono animate-pulse flex items-center gap-2" style=${{ color: '#a78bfa' }}>
                      <span class="inline-block w-2 h-2 bg-purple-500 rounded-full animate-ping"></span>
                      CLICK TO FLIP
                    </div>
                  </div>
                  <!-- Back of Card (Answer) -->
                  <div class="faq-card-back brand-surface-card flex flex-col justify-center items-center text-center p-6 border-2 border-purple-500 shadow-[0_0_30px_rgba(167,139,250,0.2)]" style=${{ background: 'linear-gradient(135deg, rgba(30,20,50,0.9), rgba(10,5,20,0.9))' }}>
                    <div class="absolute top-0 right-0 w-12 h-12 bg-purple-500/20" style=${{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
                    <div class="text-4xl mb-4 filter drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">💡</div>
                    <p class="text-sm leading-relaxed text-purple-100 font-medium">${item.answer || item.a}</p>
                  </div>
                </div>
              </div>
            `
          })}
        </div>
      </div>
    </section>
  `
}
