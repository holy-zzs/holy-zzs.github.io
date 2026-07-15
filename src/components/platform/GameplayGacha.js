// ═══════════════════════════════════════════════════════════
// 玩法扭蛋机 (GameplayGacha)
// 学段游戏架构师系统：扭蛋抽取玩法 + 协作链注入可视化
// ═══════════════════════════════════════════════════════════
import { html, useContext, useState, useCallback, useMemo, useEffect } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'
import { NavBar, Footer, PageContainer, StepProgress } from './PlatformCommon.js'
import {
  GAME_ARCHITECTS,
  COLLABORATION_CHAIN,
  getArchitect,
  pullGacha,
  getChainExample,
  ARCHITECT_GRADES,
} from '../../data/gameArchitects.js'

// ── 自定义动画 CSS ──
const GACHA_CSS = `
@keyframes gachaShake {
  0%, 100% { transform: rotate(0deg); }
  15% { transform: rotate(-3deg); }
  30% { transform: rotate(3deg); }
  45% { transform: rotate(-2deg); }
  60% { transform: rotate(2deg); }
  75% { transform: rotate(-1deg); }
}
.gacha-shaking { animation: gachaShake 0.5s ease-in-out 3; }

@keyframes capsuleDrop {
  0% { transform: translateY(-80px) scale(0.5); opacity: 0; }
  50% { transform: translateY(10px) scale(1.1); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}
.capsule-drop { animation: capsuleDrop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

@keyframes capsuleFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-6px) rotate(5deg); }
  66% { transform: translateY(-3px) rotate(-3deg); }
}
.capsule-float { animation: capsuleFloat 3s ease-in-out infinite; }

@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,215,0,0.4); }
  50% { box-shadow: 0 0 24px 4px rgba(255,215,0,0.3); }
}
.glow-pulse { animation: glowPulse 2s ease-in-out infinite; }

@keyframes chainFlow {
  0% { transform: translateX(-100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}
.chain-flow { animation: chainFlow 0.5s ease-out forwards; }

@keyframes sparkleBurst {
  0% { transform: scale(0) rotate(0deg); opacity: 1; }
  100% { transform: scale(2) rotate(180deg); opacity: 0; }
}
.sparkle-burst { animation: sparkleBurst 0.8s ease-out forwards; }

@keyframes machineBubble {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-15px) scale(1.2); opacity: 0.6; }
}
.machine-bubble { animation: machineBubble 2.5s ease-in-out infinite; }
`

export default function GameplayGacha() {
  const { state, dispatch, navigate } = useContext(AppContext)

  const grade = state.selectedGrade || 'primary'
  const architect = useMemo(() => getArchitect(grade), [grade])
  const chainExample = useMemo(() => getChainExample(grade), [grade])

  // ── 状态 ──
  const [gachaResults, setGachaResults] = useState([])
  const [isPulling, setIsPulling] = useState(false)
  const [hasPulled, setHasPulled] = useState(false)
  const [selectedGameplay, setSelectedGameplay] = useState(null)
  const [showChain, setShowChain] = useState(false)
  const [activeChainStep, setActiveChainStep] = useState(0)

  // ── 扭蛋抽取 ──
  const handlePull = useCallback(() => {
    if (isPulling) return
    setIsPulling(true)
    setSelectedGameplay(null)
    setShowChain(false)
    setActiveChainStep(0)

    setTimeout(() => {
      const results = pullGacha(grade, 3)
      setGachaResults(results)
      setIsPulling(false)
      setHasPulled(true)
    }, 1500)
  }, [grade, isPulling])

  // ── 选择玩法 ──
  const handleSelect = useCallback((gameplay) => {
    setSelectedGameplay(gameplay)
    setShowChain(true)
    setActiveChainStep(0)

    // 逐步展示协作链
    chainExample.steps.forEach((_, i) => {
      setTimeout(() => setActiveChainStep(i + 1), (i + 1) * 600)
    })
  }, [chainExample])

  // ── 确认玩法，进入上传教材（AI自动组队，无需手动选智能体）──
  const confirmGameplay = useCallback(() => {
    if (!selectedGameplay) return
    dispatch({ type: 'SET_GAMEPLAY', payload: selectedGameplay })
    navigate(STEPS.UPLOAD)
  }, [selectedGameplay, dispatch, navigate])

  // ── 返回 ──
  const goBack = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: STEPS.MODE })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  // ── 机器内的漂浮胶囊（装饰）──
  const machineCapsules = useMemo(() => {
    const colors = ['#FF8A3D', '#7CC950', '#2563EB', '#7C3AED', '#06B6D4', '#F59E0B']
    return Array.from({ length: 6 }, (_, i) => ({
      color: colors[i % colors.length],
      left: 15 + Math.random() * 70,
      top: 15 + Math.random() * 50,
      delay: Math.random() * 2,
      size: 16 + Math.random() * 10,
    }))
  }, [grade])

  // ── 渲染：架构师卡 ──
  const renderArchitectCard = () => html`
    <section class="mb-6">
      <div class="rounded-2xl p-5 sm:p-6 relative overflow-hidden"
           style=${{
             background: architect.gradient,
             color: '#fff',
           }}>
        <!-- 背景装饰 -->
        <div class="absolute top-0 right-0 text-[120px] opacity-10 leading-none select-none">${architect.emoji}</div>

        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                 style=${{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
              ${architect.emoji}
            </div>
            <div>
              <div class="text-xs font-bold opacity-80 uppercase tracking-wider">${architect.title}</div>
              <h2 class="text-xl sm:text-2xl font-black">${architect.name}</h2>
            </div>
          </div>

          <p class="text-sm opacity-90 mb-4 leading-relaxed">${architect.coreTask}</p>

          <!-- Prompt DNA -->
          <div class="grid sm:grid-cols-2 gap-3">
            <div class="rounded-xl p-3" style=${{ background: 'rgba(255,255,255,0.12)' }}>
              <div class="text-xs font-bold opacity-70 mb-1">机制核心</div>
              <div class="text-sm font-medium">${architect.promptDNA.mechanism}</div>
            </div>
            <div class="rounded-xl p-3" style=${{ background: 'rgba(255,255,255,0.12)' }}>
              <div class="text-xs font-bold opacity-70 mb-1">反馈约束</div>
              <div class="text-sm font-medium">${architect.promptDNA.feedbackConstraint}</div>
            </div>
          </div>

          <!-- 设计原则 -->
          <div class="mt-3 flex flex-wrap gap-1.5">
            ${architect.promptDNA.principles.map((p, i) => html`
              <span key=${i} class="text-xs px-2.5 py-1 rounded-full"
                    style=${{ background: 'rgba(255,255,255,0.15)' }}>
                ${p}
              </span>
            `)}
          </div>

          <!-- 禁止项 -->
          <div class="mt-2 flex flex-wrap gap-1.5">
            ${architect.promptDNA.forbidden.map((f, i) => html`
              <span key=${i} class="text-xs px-2 py-0.5 rounded-full"
                    style=${{ background: 'rgba(0,0,0,0.15)', textDecoration: 'line-through', opacity: 0.7 }}>
                ${f}
              </span>
            `)}
          </div>
        </div>
      </div>
    </section>
  `

  // ── 渲染：扭蛋机 ──
  const renderGachaMachine = () => html`
    <section class="mb-6">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold" style=${{ color: 'var(--theme-text-muted)' }}>
          玩法扭蛋机 · 抽取你的游戏灵魂
        </h3>
        ${hasPulled ? html`
          <button class="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                  style=${{ background: 'var(--theme-primary)', color: '#fff' }}
                  onClick=${handlePull}>
            🔄 重新抽取
          </button>
        ` : null}
      </div>

      <!-- 扭蛋机主体 -->
      <div class="flex flex-col items-center py-6 rounded-2xl relative overflow-hidden"
           style=${{
             background: 'var(--theme-surface)',
             border: '1px solid var(--theme-border)',
           }}>
        <!-- 机器 -->
        <div class=${`relative ${isPulling ? 'gacha-shaking' : ''}`}
             style=${{ width: '200px', height: '240px' }}>
          <!-- 透明罩 -->
          <div class="absolute top-0 left-1/2 -translate-x-1/2 rounded-full overflow-hidden"
               style=${{
                 width: '180px',
                 height: '180px',
                 background: `linear-gradient(135deg, ${architect.color}15, ${architect.color}05)`,
                 border: `3px solid ${architect.color}40`,
                 backdropFilter: 'blur(4px)',
               }}>
            <!-- 漂浮的胶囊装饰 -->
            ${machineCapsules.map((c, i) => html`
              <div key=${i}
                   class="absolute rounded-full machine-bubble"
                   style=${{
                     left: `${c.left}%`,
                     top: `${c.top}%`,
                     width: `${c.size}px`,
                     height: `${c.size}px`,
                     background: `linear-gradient(135deg, ${c.color}, ${c.color}80)`,
                     animationDelay: `${c.delay}s`,
                   }}>
              </div>
            `)}
          </div>

          <!-- 机器底座 -->
          <div class="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-2xl flex flex-col items-center justify-center"
               style=${{
                 width: '160px',
                 height: '70px',
                 background: architect.gradient,
                 color: '#fff',
               }}>
            <div class="text-2xl font-black tracking-wider">GACHA</div>
            <div class="text-[10px] opacity-80">${architect.title}</div>
          </div>

          <!-- 出口 -->
          <div class="absolute bottom-[60px] left-1/2 -translate-x-1/2 rounded-b-lg"
               style=${{
                 width: '40px',
                 height: '15px',
                 background: 'rgba(0,0,0,0.2)',
               }}>
          </div>
        </div>

        <!-- 抽取按钮 -->
        ${!hasPulled ? html`
          <button class="mt-4 px-8 py-3 rounded-xl font-bold text-base transition-all hover:scale-105 active:scale-95"
                  style=${{
                    background: architect.gradient,
                    color: '#fff',
                    boxShadow: `0 4px 16px ${architect.color}40`,
                  }}
                  disabled=${isPulling}
                  onClick=${handlePull}>
            ${isPulling ? '⏳ 抽取中...' : '🔮 扭蛋抽取'}
          </button>
          <p class="mt-2 text-xs" style=${{ color: 'var(--theme-text-muted)' }}>
            点击抽取 3 个推荐玩法
          </p>
        ` : null}
      </div>

      <!-- 抽取结果 -->
      ${hasPulled && gachaResults.length > 0 ? html`
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          ${gachaResults.map((g, i) => {
            const isSelected = selectedGameplay?.id === g.id
            return html`
              <div key=${g.id}
                   class=${`capsule-drop rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.03] ${isSelected ? 'glow-pulse' : ''}`}
                   style=${{
                     animationDelay: `${i * 0.15}s`,
                     background: isSelected
                       ? `linear-gradient(135deg, ${architect.color}15, ${architect.color}05)`
                       : 'var(--theme-surface)',
                     border: isSelected
                       ? `2px solid ${architect.color}`
                       : '1px solid var(--theme-border)',
                   }}
                   onClick=${() => handleSelect(g)}>
                <!-- 胶囊头 -->
                <div class="flex items-center justify-center mb-3">
                  <div class="w-14 h-14 rounded-full flex items-center justify-center text-2xl capsule-float"
                       style=${{
                         background: `linear-gradient(135deg, ${architect.color}, ${architect.color}80)`,
                         color: '#fff',
                       }}>
                    ${g.typeIcon}
                  </div>
                </div>
                <!-- 标签 -->
                <div class="flex items-center justify-center gap-1.5 mb-2">
                  <span class="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        style=${{ background: 'var(--theme-primary-bg)', color: 'var(--theme-primary)' }}>
                    ${g.type}
                  </span>
                  <span class="text-[10px] px-2 py-0.5 rounded-full"
                        style=${{ background: 'var(--theme-surface-alt)', color: 'var(--theme-text-muted)' }}>
                    ${g.difficulty}
                  </span>
                </div>
                <!-- 名称 -->
                <h4 class="text-sm font-bold text-center mb-1" style=${{ color: 'var(--theme-text)' }}>
                  ${g.name}
                </h4>
                <!-- 核心机制 -->
                <div class="text-xs text-center mb-2" style=${{ color: 'var(--theme-accent)' }}>
                  核心玩法：${g.core}
                </div>
                <!-- 描述 -->
                <p class="text-xs text-center leading-relaxed" style=${{ color: 'var(--theme-text-muted)' }}>
                  ${g.desc}
                </p>
                <!-- 选中标记 -->
                ${isSelected ? html`
                  <div class="mt-3 text-center text-xs font-bold" style=${{ color: architect.color }}>
                    ✨ 已选中
                  </div>
                ` : html`
                  <div class="mt-3 text-center text-xs" style=${{ color: 'var(--theme-text-muted)' }}>
                    点击选择 →
                  </div>
                `}
              </div>
            `
          })}
        </div>
      ` : null}
    </section>
  `

  // ── 渲染：协作链注入可视化 ──
  const renderCollaborationChain = () => {
    if (!showChain || !selectedGameplay) return null

    return html`
      <section class="mb-6 rounded-2xl p-5"
               style=${{
                 background: 'var(--theme-surface)',
                 border: '1px solid var(--theme-border)',
               }}>
        <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 class="text-base font-bold" style=${{ color: 'var(--theme-text)' }}>
              🏗️ 玩法注入协作链
            </h3>
            <p class="text-xs mt-0.5" style=${{ color: 'var(--theme-text-muted)' }}>
              架构师如何把"${selectedGameplay.name}"注入到智能体团队
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs px-2.5 py-1 rounded-full font-mono"
                  style=${{ background: 'var(--theme-primary-bg)', color: 'var(--theme-primary)' }}>
              ${selectedGameplay.name}
            </span>
          </div>
        </div>

        <!-- 输入知识 -->
        <div class="mb-4 rounded-xl p-3"
             style=${{ background: 'var(--theme-surface-alt)', borderLeft: `3px solid ${architect.color}` }}>
          <div class="text-xs font-bold mb-0.5" style=${{ color: 'var(--theme-text-muted)' }}>输入知识</div>
          <div class="text-sm" style=${{ color: 'var(--theme-text)' }}>${chainExample.knowledge}</div>
        </div>

        <!-- 5 步流水线 -->
        <div class="space-y-2">
          ${chainExample.steps.map((s, i) => {
            const isVisible = i < activeChainStep
            const chainMeta = COLLABORATION_CHAIN[i]
            const isKey = s.isKey || chainMeta?.isKeyStep
            return html`
              <div key=${i}
                   class=${`flex items-start gap-3 rounded-xl p-3 transition-all ${isVisible ? 'chain-flow' : ''}`}
                   style=${{
                     opacity: isVisible ? 1 : 0.3,
                     background: isKey
                       ? `linear-gradient(90deg, ${architect.color}10, transparent)`
                       : 'var(--theme-surface-alt)',
                     border: isKey ? `1px solid ${architect.color}40` : '1px solid transparent',
                   }}>
                <!-- 步骤序号 -->
                <div class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                     style=${{
                       background: isKey ? architect.gradient : 'var(--theme-surface)',
                       color: isKey ? '#fff' : 'var(--theme-text-muted)',
                       border: isKey ? 'none' : '1px solid var(--theme-border)',
                     }}>
                  ${isVisible ? (isKey ? '🔥' : '✓') : i + 1}
                </div>
                <!-- 内容 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span class="text-sm font-bold" style=${{ color: isKey ? architect.color : 'var(--theme-text)' }}>
                      ${chainMeta?.icon} ${s.agent}
                    </span>
                    ${isKey ? html`
                      <span class="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                            style=${{ background: architect.color, color: '#fff' }}>
                        KEY · 玩法注入
                      </span>
                    ` : null}
                  </div>
                  <div class="text-sm leading-relaxed" style=${{ color: 'var(--theme-text-muted)' }}>
                    ${s.output}
                  </div>
                </div>
              </div>
            `
          })}
        </div>

        <!-- 最终输出 -->
        ${activeChainStep >= 5 ? html`
          <div class="mt-4 rounded-xl p-4 chain-flow"
               style=${{
                 background: architect.gradient,
                 color: '#fff',
               }}>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-lg">🎮</span>
              <span class="text-xs font-bold opacity-80 uppercase tracking-wider">最终输出</span>
            </div>
            <div class="text-base font-bold">${selectedGameplay.name}</div>
            <div class="text-sm opacity-90 mt-1">${selectedGameplay.desc}</div>
            <div class="mt-2 flex flex-wrap gap-1.5">
              ${selectedGameplay.tag.split(' ').map((t, i) => html`
                <span key=${i} class="text-xs px-2 py-0.5 rounded-full"
                      style=${{ background: 'rgba(255,255,255,0.2)' }}>
                  ${t}
                </span>
              `)}
            </div>
          </div>
        ` : null}
      </section>
    `
  }

  // ── 渲染：游戏模组模板 ──
  const renderTemplates = () => html`
    <section class="mb-6">
      <h3 class="text-sm font-semibold mb-2" style=${{ color: 'var(--theme-text-muted)' }}>
        📋 ${architect.title}的游戏模组库
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
        ${architect.templates.map(t => html`
          <div key=${t.id}
               class="rounded-xl p-3"
               style=${{
                 background: 'var(--theme-surface)',
                 border: '1px solid var(--theme-border)',
               }}>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xl">${t.icon}</span>
              <span class="text-sm font-bold" style=${{ color: 'var(--theme-text)' }}>${t.name}</span>
            </div>
            <p class="text-xs leading-relaxed mb-2" style=${{ color: 'var(--theme-text-muted)' }}>${t.desc}</p>
            <div class="flex flex-wrap gap-1">
              ${t.mechanics.map((m, i) => html`
                <span key=${i} class="text-[10px] px-1.5 py-0.5 rounded"
                      style=${{ background: 'var(--theme-surface-alt)', color: 'var(--theme-text-muted)' }}>
                  ${m}
                </span>
              `)}
            </div>
          </div>
        `)}
      </div>
    </section>
  `

  // ── 底部操作栏 ──
  const renderFooter = () => html`
    <div class="flex items-center justify-between gap-3 pt-4"
         style=${{ borderTop: '1px solid var(--theme-border)' }}>
      <button class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style=${{
                background: 'var(--theme-surface)',
                color: 'var(--theme-text-muted)',
                border: '1px solid var(--theme-border)',
              }}
              onClick=${goBack}>
        ← 返回模式选择
      </button>
      <button class=${`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedGameplay ? '' : 'opacity-40 cursor-not-allowed'}`}
              style=${{
                background: selectedGameplay ? architect.gradient : 'var(--theme-surface-alt)',
                color: selectedGameplay ? '#fff' : 'var(--theme-text-muted)',
              }}
              disabled=${!selectedGameplay}
              onClick=${confirmGameplay}>
        确认玩法，AI自动组队 →
      </button>
    </div>
  `

  return html`
    <div class="min-h-screen" style=${{ background: '#05010f', color: 'var(--theme-text)', minHeight: '100vh' }}>
      <style>${GACHA_CSS}</style>
      <${NavBar} />
      <${PageContainer} className="pb-16">
        <!-- 顶部标题 -->
        <div class="flex items-center justify-between gap-4 mb-2">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold" style=${{ color: 'var(--theme-primary)' }}>
              玩法扭蛋机
            </h1>
            <p class="text-sm mt-1" style=${{ color: 'var(--theme-text-muted)' }}>
              ${architect.emoji} ${architect.name} 正在为你匹配最佳玩法
            </p>
          </div>
          <button class="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
                  style=${{
                    background: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text-muted)',
                  }}
                  onClick=${goBack}>
            <span>←</span><span class="hidden sm:inline">返回</span>
          </button>
        </div>

        <${StepProgress} current=${2} total=${5} labels=${['选学科', '选模式', '抽玩法', '组团队', '传教材']} />

        <!-- 架构师卡 -->
        ${renderArchitectCard()}

        <!-- 扭蛋机 -->
        ${renderGachaMachine()}

        <!-- 协作链 -->
        ${renderCollaborationChain()}

        <!-- 游戏模组 -->
        ${renderTemplates()}

        <!-- 底部 -->
        ${renderFooter()}
      <//>
      <${Footer} />
    </div>
  `
}
