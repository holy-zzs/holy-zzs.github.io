import { html } from '../../../deps.js'

export default function HeroCopyBlock({
  hero,
  primaryAction,
  secondaryAction,
  onPrimary,
  onSecondary,
}) {
  return html`
    <div class="brand-copy-block relative z-20 pt-24">
      <div class="terminal-eyebrow retro-fade-up retro-fade-up-1 mb-6">&lt;AI_GAME_ENGINE /&gt;</div>
      <h1 class="text-6xl md:text-[80px] lg:text-[100px] leading-[1.1] font-black retro-fade-up retro-fade-up-1 cyber-title mb-8">
        <span class="cyber-glitch-text text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]" data-text="书扔进去，">书扔进去，</span><br/>
        <span class="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">游戏吐出来。</span>
      </h1>
      <p class="text-lg md:text-xl text-[#c4b5fd] font-medium leading-relaxed max-w-2xl mb-8 retro-fade-up retro-fade-up-2 border-l-2 border-purple-500/50 pl-6 bg-gradient-to-r from-purple-900/20 to-transparent py-4 backdrop-blur-sm">
        ${hero.subtitle}
      </p>
      
      <div class="flex flex-col sm:flex-row gap-6 mt-12 retro-fade-up retro-fade-up-4">
        <button class="relative group px-8 py-4 overflow-hidden rounded-lg bg-transparent" type="button" onClick=${onPrimary}>
          <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
          <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjwvc3ZnPg==')] opacity-30 group-hover:opacity-50"></div>
          <div class="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <span class="relative z-10 font-bold text-white tracking-widest text-lg flex items-center gap-3">
            <span class="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
            ${primaryAction?.label || hero.primaryCta.label}
          </span>
          <!-- Neo Glass Border -->
          <div class="absolute inset-0 border border-white/20 rounded-lg group-hover:border-white/50 transition-colors"></div>
        </button>
        
        <button class="relative group px-8 py-4 overflow-hidden rounded-lg bg-white/5 backdrop-blur-md border border-white/10 hover:border-cyan-500/50 transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)]" type="button" onClick=${onSecondary}>
          <span class="relative z-10 font-bold text-cyan-400 tracking-widest flex items-center gap-2">
            [ ${secondaryAction?.label || hero.secondaryCta.label} ]
          </span>
        </button>
      </div>
      
      <!-- Mini Data Stats -->
      <div class="flex items-center gap-8 mt-16 retro-fade-up retro-fade-up-4 pt-8 border-t border-white/10">
        <div>
          <div class="text-3xl font-black text-white font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">50W+</div>
          <div class="text-xs text-purple-400 font-bold tracking-widest uppercase">Active Agents</div>
        </div>
        <div>
          <div class="text-3xl font-black text-white font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">10W+</div>
          <div class="text-xs text-pink-400 font-bold tracking-widest uppercase">Games Generated</div>
        </div>
      </div>
    </div>
  `
}
