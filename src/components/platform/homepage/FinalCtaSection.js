import { html } from '../../../deps.js'
import { useScrollReveal } from '../../../lib/useScrollReveal.js'

export default function FinalCtaSection({ onPrimary }) {
  const revealRef = useScrollReveal({ selector: '.reveal-card', stagger: 0.12 })
  return html`
    <section ref=${revealRef} class="brand-section brand-final-cta-wrap relative overflow-hidden">
      <!-- Neon grid background -->
      <div class="absolute inset-0 pointer-events-none opacity-20" style=${{ backgroundImage: 'linear-gradient(transparent 95%, #a78bfa 95%), linear-gradient(90deg, transparent 95%, #a78bfa 95%)', backgroundSize: '40px 40px', transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)' }}></div>
      
      <div class="brand-shell-inner relative z-10 text-center reveal-card">
        <h2 class="text-4xl md:text-5xl font-black mb-8 text-white retro-text-shadow cyber-title">
          准备好让你的知识进脑子了吗？
        </h2>
        
        <div class="flex flex-col items-center justify-center gap-4">
          <button class="brand-button-primary text-xl px-12 py-5 transform hover:scale-105 transition-transform duration-300 relative group" type="button" onClick=${onPrimary}>
            <div class="absolute inset-0 bg-purple-500 blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <span class="relative z-10 font-bold tracking-widest">⚡ 立即开始，免费使用</span>
          </button>
          
          <p class="mt-4 text-sm font-mono text-purple-300 animate-pulse drop-shadow-[0_0_8px_rgba(167,139,250,0.8)]">
            > 无需注册即可体验（30秒快速上手）_
          </p>
        </div>
      </div>
    </section>
  `
}
