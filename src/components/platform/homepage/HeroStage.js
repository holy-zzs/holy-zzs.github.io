import { html, Suspense, useEffect } from '../../../deps.js'
import { Canvas } from '../../../deps.js'
import AICoreScene from './AICoreScene.js'
import AgentHologramCards from './AgentHologramCards.js'
import CosmicBackground from './CosmicBackground.js'

/**
 * HeroStage v3 — 赛博朋克像素故障 Hero 区
 *
 * 改动:
 *   - 删除 Boot Loading 模块
 *   - Slogan 改为像素故障动画 (RGB分裂 + 扫描线 + 噪点抖动)
 *   - 保留 3D 引擎视觉 + Agent 卡片 + 实时终端
 */

function PixelGlitchText({ text, line = 1 }) {
  return html`
    <span class=${`pixel-glitch pixel-glitch-shake ${line === 2 ? 'pixel-glutch-line2' : ''}`}>
      <span class="pixel-glitch-cyan" aria-hidden="true">${text}</span>
      <span class="pixel-glitch-magenta" aria-hidden="true">${text}</span>
      <span class="pixel-glitch-text">${text}</span>
      <span class="pixel-glitch-scanlines" aria-hidden="true"></span>
      <span class="pixel-glitch-noise" aria-hidden="true">
        <span class="pixel-glitch-noise-bar" style=${{ top: '20%' }}></span>
        <span class="pixel-glitch-noise-bar" style=${{ top: '55%', background: '#FF00FF' }}></span>
        <span class="pixel-glitch-noise-bar" style=${{ top: '78%' }}></span>
      </span>
    </span>
  `
}

export default function HeroStage({ hero, primaryAction, secondaryAction, onPrimary, onSecondary }) {
  // 鼠标视差 — 多层不同倍率
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      document.documentElement.style.setProperty('--mouse-x', x)
      document.documentElement.style.setProperty('--mouse-y', y)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const primaryLabel = hero?.primaryCta?.label || '快速开始生成'
  const secondaryLabel = hero?.secondaryCta?.label || '浏览社区方案'

  return html`
    <section class="hero-v2">
      <!-- ═══ Layer 0: Cosmic Background (deepest) ═══ -->
      <${CosmicBackground} />

      <!-- ═══ Layer 1: 3D Engine Visual (Midground — semi-transparent) ═══ -->
      <div class="absolute inset-0 z-[1] hero-canvas-midground">
        <${Suspense} fallback=${html`
          <div class="w-full h-full flex items-center justify-center text-[#8A5CF5] hero-code">
            LOADING_AI_CORE...
          </div>
        `}>
          <${Canvas} camera=${{ position: [0, 0.5, 13], fov: 45 }} dpr=${[1, 2]} gl=${{ alpha: true, antialias: true, premultipliedAlpha: false }} style=${{ background: 'transparent' }}>
            <${AICoreScene} />
          <//>
        <//>
      </div>

      <!-- ═══ Layer 3: Content Shell ═══ -->
      <div class="relative z-10 w-full max-w-[1440px] mx-auto px-[6vw] pt-24 pb-12">

        <!-- Two-column grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[70vh]">

          <!-- ▸ Left Column: Copy & CTA -->
          <div class="hero-pull-in-left">
            <!-- AI Game Studio Badge -->
            <div class="hero-studio-badge">
              <span class="hero-studio-dot"></span>
              <span class="hero-studio-text">AI GAME STUDIO</span>
              <span class="hero-studio-pulse"></span>
            </div>

            <!-- Brand label -->
            <div class="hero-brand">
              ${hero?.title ? hero.title.replace(/《|》|——.*/g, '').trim() : '知识不进脑子啊'}
            </div>

            <!-- Hero Slogan — 像素故障字体动画 -->
            <h1 class="mb-8" style=${{ fontSize: 'clamp(48px, 7vw, 88px)', lineHeight: '1.15' }}>
              <${PixelGlitchText} text="书扔进去，" line=${1} />
              <br/>
              <${PixelGlitchText} text="游戏吐出来。" line=${2} />
            </h1>

            <!-- Narrative Subtitle — 结构化叙事宣言 -->
            <div class="hero-narrative mb-10">
              <p class="hn-line hn-hook">
                有些知识，<span class="hn-dim">看一遍就困</span>，<span class="hn-cyan">玩一遍就会</span>。
              </p>
              <p class="hn-line hn-contrast">
                <span class="hn-gold">游戏</span>明明那么好玩，<span class="hn-dim">教材</span>却写得那么<span class="hn-dim-strike">催眠</span>。
              </p>
              <p class="hn-line hn-struggle">
                我想把教材变游戏，结果去学编程、学<span class="hn-mono">C++</span>、学<span class="hn-mono">Blender</span>，折腾了三个月，游戏连个影都没有，反而成了<span class="hn-italic">半个程序员</span>。
              </p>
              <p class="hn-line hn-resolution">
                为了不让悲剧重演，我做了这个网站。
              </p>
              <p class="hn-line hn-tagline">
                叫「<span class="hn-brand">知识不进脑子啊</span>」——把书扔进去，<span class="hn-punch">AI 还你一个游戏</span>。
              </p>
            </div>

            <!-- CTA Buttons -->
            <div class="flex flex-wrap gap-4 mb-12">
              <button
                class="cta-sweep cta-sweep-primary flex items-center gap-3"
                type="button"
                onClick=${onPrimary}
              >
                <span class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                ${primaryLabel}
              </button>
              <button
                class="cta-sweep cta-sweep-secondary flex items-center gap-2"
                type="button"
                onClick=${onSecondary}
              >
                <span style=${{ fontFamily: 'var(--font-terminal)', fontSize: '0.75rem', opacity: 0.6 }}>[</span>
                ${secondaryLabel}
                <span style=${{ fontFamily: 'var(--font-terminal)', fontSize: '0.75rem', opacity: 0.6 }}>]</span>
              </button>
            </div>

            <!-- Stats Bar -->
            <div class="hero-stats">
              <div class="flex flex-col">
                <div class="hero-stat-value" style=${{ color: '#22D3EE' }}>132</div>
                <div class="hero-stat-label">AI Experts</div>
              </div>
              <div class="flex flex-col">
                <div class="hero-stat-value" style=${{ color: '#FF00FF' }}>8</div>
                <div class="hero-stat-label">Departments</div>
              </div>
              <div class="flex flex-col">
                <div class="hero-stat-value" style=${{ color: '#F59E0B' }}>AAA</div>
                <div class="hero-stat-label">Quality</div>
              </div>
              <div class="flex flex-col">
                <div class="hero-stat-value" style=${{ color: '#34D399' }}>0.8s</div>
                <div class="hero-stat-label">Latency</div>
              </div>
            </div>

            <!-- Team Auto-Build Tagline -->
            <p class="hero-team-tagline">
              <span class="hero-team-arrow">▸</span>
              已有 <span class="hero-team-num">132</span> 位 AI 专家，为你自动组建游戏团队
            </p>
          </div>

          <!-- ▸ Right Column: Agent Holographic Cards (desktop only) -->
          <div class="hero-agent-area hidden lg:block hero-pull-in-right">
            <div class="parallax-layer" style=${{
              transform: 'translate(calc(var(--mouse-x, 0) * -8px), calc(var(--mouse-y, 0) * -8px))',
            }}>
              <${AgentHologramCards} />
            </div>
          </div>
        </div>
      </div>
    </section>
  `
}
