import { html, useState } from '../../../deps.js'
import { STAGE_DATA } from '../../../data/homepageBrandContent.mjs'
import { useScrollReveal } from '../../../lib/useScrollReveal.js'

export default function StageSelectSection({ onSelectSubject, onSelectGrade }) {
  const [activeStageId, setActiveStageId] = useState(null)
  const revealRef = useScrollReveal({ selector: '.reveal-card', stagger: 0.12 })

  const activeStage = STAGE_DATA.find(s => s.id === activeStageId)

  const handleStageClick = (stage) => {
    const newId = stage.id === activeStageId ? null : stage.id
    setActiveStageId(newId)
    if (newId && onSelectGrade) onSelectGrade(stage)
  }

  return html`
    <section id="grade-select" ref=${revealRef} class="brand-section" style=${{ paddingTop: '20px' }}
             data-connect data-connect-anchor=".stage-card"
             data-totem-target=".canvas-wm-2" data-connect-color="#67E8F9">
      <div class="brand-shell-inner">
        <div class="brand-section-heading text-center" style=${{ margin: '0 auto 40px' }}>
          <span class="terminal-eyebrow">&lt;ENTRY_POINT_SELECTION /&gt;</span>
          <h2 class="text-3xl md:text-4xl font-black text-white retro-text-shadow mb-4 cyber-title cyber-glitch-hover" data-text="你的痛苦来自哪个阶段？">你的痛苦来自哪个阶段？</h2>
          <p class="brand-section-subtitle text-purple-200">选择学段，AI 家教团队为你量身定制专属的知识游戏化方案。</p>
        </div>

        <!-- Stage Cards Grid -->
        <div class="stage-cards-grid">
          ${STAGE_DATA.map(stage => html`
            <button 
              key=${stage.id}
              class=${`stage-card brand-surface-card reveal-card ${activeStageId === stage.id ? 'stage-card-active' : ''}`}
              onClick=${() => handleStageClick(stage)}
            >
              <div class="stage-card-bg">
                <img src=${stage.image} alt=${stage.name} loading="lazy" />
                <div class="stage-card-overlay"></div>
              </div>
              <div class="stage-card-content">
                <span class="stage-emoji">${stage.emoji}</span>
                <h3 class="stage-name">${stage.name}</h3>
              </div>
            </button>
          `)}
        </div>

        <!-- Inline Expandable Subject Panel -->
        <div class=${`subject-panel-wrapper ${activeStageId ? 'subject-panel-open' : ''}`}>
          ${activeStage ? html`
            <div class="subject-panel brand-surface-card mt-6 p-6" style=${{ marginTop: '24px', padding: '24px' }}>
              <div class="flex justify-between items-center mb-6 border-b pb-4" style=${{ borderColor: 'rgba(167,139,250,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(167,139,250,0.15)' }}>
                <div class="font-mono text-sm" style=${{ color: '#4ade80', fontFamily: 'monospace', fontSize: '14px' }}>
                  <span class="animate-pulse mr-2" style=${{ marginRight: '8px' }}>_></span> 
                  正在配置 [${activeStage.name}] 知识接入节点...
                </div>
                <button class="text-xs px-3 py-1 rounded-full border transition-colors" 
                        style=${{ borderColor: 'rgba(255,255,255,0.2)', color: '#b2a5cf', fontSize: '12px', padding: '4px 12px', borderRadius: '9999px', background: 'transparent', cursor: 'pointer' }}
                        onClick=${() => setActiveStageId(null)}>
                  返回重选
                </button>
              </div>

              <div class="subject-grid">
                ${activeStage.subjects.map(sub => html`
                  <button key=${sub.id} class="subject-card" onClick=${() => onSelectSubject(sub)}>
                    <div class="subject-card-icon">${sub.icon}</div>
                    <div class="subject-card-info">
                      <h4>${sub.name}</h4>
                      <p>${sub.desc}</p>
                    </div>
                    <div class="subject-badge">AI 团队规模: ${sub.teamSize}人</div>
                  </button>
                `)}
              </div>

              <div class="mt-8 text-center" style=${{ marginTop: '32px', textAlign: 'center' }}>
                <button class="retro-neon-btn px-8 py-3 rounded-full font-bold" 
                        style=${{ padding: '12px 32px', borderRadius: '9999px', fontWeight: 'bold', border: '1px solid rgba(167,139,250,0.4)', background: 'rgba(167,139,250,0.1)', color: '#a78bfa', cursor: 'pointer' }}
                        onClick=${() => onSelectSubject(null)}>
                  不限学科，直接开始接入
                </button>
              </div>
            </div>
          ` : null}
        </div>
      </div>
    </section>
  `
}