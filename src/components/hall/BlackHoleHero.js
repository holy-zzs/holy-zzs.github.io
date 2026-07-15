// 黑洞英雄区：full-bleed 全屏，Three.js 黑洞 + 拖放上传 + 读心术输入 + 轨道智能体
// v3.0 集成修复：演示教材使用 parseText() 生成真实解析结构，与 UploadView/WorkspaceView 流程一致
// v3.0 升级二：读心术输入框，用户输入主题 → mock AI 响应 → 概念海报 → 可转化为真实教材
import { html, useEffect, useRef, useState, useCallback } from '../../react.js'
import { useHall } from './GameHall.js'
import { useApp, STEPS } from '../../store/appContext.js'
import { audio } from '../../lib/audio.js'
import { getAgent } from '../../data/agents.js'
import { useHeroUploadFlow } from './useHeroUploadFlow.js'

export default function BlackHoleHero() {
  const { triggerAuth, goStep, showShareCard } = useHall()
  const { state, dispatch, toast } = useApp()
  const containerRef = useRef(null)
  const engineRef = useRef(null)
  const flow = useHeroUploadFlow({
    dispatch,
    toast,
    user: state.user,
    goStep,
    STEPS,
    triggerAuth,
    showShareCard,
  })
  const dragging = flow.dropState === 'hover-accept' || flow.dropState === 'hover-reject'
  const parsing = flow.parsing
  const {
    topicInput,
    setTopicInput,
    mindPhase,
    setMindPhase,
    dialogueIdx,
    setDialogueIdx,
    topicResult,
    setTopicResult,
    displayedText,
    setDisplayedText,
    tryDemo,
    submitTopic,
    resetMind,
    createFromTopic,
    shareTopic,
  } = flow

  // 动态加载 Three.js 并初始化引擎
  useEffect(() => {
    let destroyed = false
    let engine = null

    async function init() {
      try {
        const { default: BlackHoleEngine } = await import('./three/blackHoleEngine.js')
        if (destroyed || !containerRef.current) return
        engine = new BlackHoleEngine(containerRef.current)
        engine.start()
        engineRef.current = engine
      } catch (e) {
        console.warn('Three.js 黑洞引擎加载失败，降级为 CSS 黑洞', e)
      }
    }
    init()

    return () => {
      destroyed = true
      if (engine) engine.destroy()
      engineRef.current = null
    }
  }, [])

  // —— 拖放上传（集成修复：使用 parseFile 生成真实 ParsedMaterial）——
  const onDragOver = useCallback((e) => {
    const prev = flow.dropState
    flow.onDragOver(e)
    if (prev === 'idle') {
      engineRef.current?.setMode('consuming')
      audio.sfx('click')
      if (navigator.vibrate) navigator.vibrate(10)
    }
  }, [flow])

  const onDragLeave = useCallback((e) => {
    flow.onDragLeave(e)
    if (e.currentTarget === e.target) engineRef.current?.setMode('idle')
  }, [flow])

  const onDrop = useCallback(async (e) => {
    audio.sfx('swallow')
    if (navigator.vibrate) navigator.vibrate([10, 30, 10])
    engineRef.current?.setMode('idle')
    await flow.onDrop(e)
  }, [flow])

  const onTryDemo = useCallback(() => {
    audio.sfx('swallow')
    engineRef.current?.setMode('consuming')
    setTimeout(() => engineRef.current?.setMode('idle'), 1500)
    tryDemo()
  }, [tryDemo])

  const onSubmitTopic = useCallback(() => {
    audio.sfx('warp')
    if (navigator.vibrate) navigator.vibrate([10, 20, 10, 20, 30])
    engineRef.current?.setMode('consuming')
    submitTopic()
  }, [submitTopic])

  // 读心术思考阶段：逐条显示 AI 对话
  useEffect(() => {
    if (mindPhase !== 'thinking' || !topicResult) return
    const line = topicResult.dialogue[dialogueIdx]
    if (!line) {
      // 所有对话播完 → 切换到海报阶段
      const timer = setTimeout(() => {
        setMindPhase('poster')
        audio.sfx('boot')
        if (navigator.vibrate) navigator.vibrate(50)
      }, 500)
      return () => clearTimeout(timer)
    }

    // 打字机效果
    let charIdx = 0
    let timer
    const typeChar = () => {
      if (charIdx < line.text.length) {
        charIdx++
        setDisplayedText(line.text.slice(0, charIdx))
        timer = setTimeout(typeChar, 35 + Math.random() * 25)
      } else {
        audio.sfx('click')
        timer = setTimeout(() => {
          setDialogueIdx(idx => idx + 1)
          setDisplayedText('')
        }, 1200)
      }
    }
    timer = setTimeout(typeChar, 300)
    return () => clearTimeout(timer)
  }, [mindPhase, dialogueIdx, topicResult])

  const onResetMind = useCallback(() => {
    resetMind()
    engineRef.current?.setMode('idle')
  }, [resetMind])

  // 当前对话角色
  const currentDialogue = topicResult?.dialogue[dialogueIdx]
  const currentAgent = currentDialogue ? getAgent(currentDialogue.role) : null

  return html`
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden"
      onDragOver=${onDragOver}
      onDragLeave=${onDragLeave}
      onDrop=${onDrop}>

      {/* Three.js 黑洞画布 */}
      <div ref=${containerRef} className="absolute inset-0"></div>

      {/* CSS 降级黑洞（Three.js 加载失败时显示） */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style=${{ zIndex: 0 }}>
        <div className="relative" style=${{ width: '300px', height: '300px' }}>
          <div className="absolute inset-0 rounded-full animate-orbit-slow"
            style=${{ background: 'conic-gradient(from 0deg, #45E29A, #FFD700, #d946ef, #45E29A)', filter: 'blur(30px)', opacity: 0.3 }}></div>
          <div className="absolute inset-8 rounded-full bg-black"
            style=${{ boxShadow: '0 0 60px rgba(217,70,239,0.5), inset 0 0 40px rgba(0,0,0,0.9)' }}></div>
        </div>
      </div>

      {/* 中央内容区 */}
      <div className="relative z-10 text-center pointer-events-none px-4" style=${{ maxWidth: '600px' }}>

        ${mindPhase === null && html`
          <h1 className="text-4xl sm:text-6xl font-black mb-4 shimmer-text" style=${{ fontFamily: 'Orbitron, sans-serif' }}>
            知识不进脑子啊
          </h1>
          <p className="text-base sm:text-xl text-purple-200 mb-2">
            ${dragging ? '释放——让黑洞吞噬知识' : '将教材 PDF / Word / 文本 拖入黑洞…'}
          </p>
          <p className="text-xs text-purple-400 mb-8">
            AI 智能体团队会把它变成上头游戏
          </p>

          {/* 随机演示按钮 */}
          <button onClick=${onTryDemo}
            className="pointer-events-auto inline-flex items-center gap-2 px-6 py-3 rounded-full neon-border text-sm font-bold text-bio-400 hover:scale-105 transition-all duration-300"
            style=${{ background: 'rgba(20,10,53,0.6)', backdropFilter: 'blur(10px)' }}>
            <span className="text-lg">🎲</span>
            没有教材？体验神奇瞬间
          </button>

          {/* 读心术输入框（升级二）*/}
          <div className="pointer-events-auto mt-6 mx-auto" style=${{ maxWidth: '420px' }}>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full glass-dark" style=${{ border: '1px solid rgba(217,70,239,0.3)' }}>
              <span className="text-purple-400 text-sm">🧠</span>
              <input
                type="text"
                value=${topicInput}
                onChange=${(e) => setTopicInput(e.target.value)}
                onKeyDown=${(e) => { if (e.key === 'Enter') onSubmitTopic() }}
                placeholder="或者… 直接告诉我你想学什么？"
                className="flex-1 bg-transparent text-sm text-white placeholder-purple-500/60 outline-none"
                style=${{ minWidth: 0 }}
                aria-label="输入学习主题"
              />
              ${topicInput.trim().length >= 2 && html`
                <button onClick=${onSubmitTopic}
                  className="text-xs font-bold text-bio-400 hover:text-white transition-colors whitespace-nowrap">
                  召唤AI →
                </button>
              `}
            </div>
            <p className="text-[10px] text-purple-500/50 mt-2">
              试试输入：薛定谔方程 · 唐宋八大家 · 二战起因 · DNA · 光合作用…
            </p>
          </div>
        `}

        {/* 读心术思考阶段 */}
        ${mindPhase === 'thinking' && html`
          <div className="pointer-events-auto">
            <div className="text-2xl text-purple-300 mb-6 animate-pulse">
              ⚡ AI 团队正在解读"${topicInput}"…
            </div>
            ${currentAgent && html`
              <div className="glass-dark rounded-2xl p-4 mx-auto" style=${{ maxWidth: '460px', borderColor: currentAgent.color + '44' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">${currentAgent.emoji}</span>
                  <span className="text-xs font-bold" style=${{ color: currentAgent.color }}>${currentAgent.name}</span>
                </div>
                <p className="text-sm text-white leading-relaxed text-left">
                  ${displayedText}<span className="animate-typing">▊</span>
                </p>
              </div>
            `}
            <button onClick=${onResetMind}
              className="mt-6 text-xs text-purple-400 hover:text-white transition-colors">
              ← 取消
            </button>
          </div>
        `}

        {/* 读心术海报阶段 */}
        ${mindPhase === 'poster' && topicResult && html`
          <div className="pointer-events-auto">
            <div className="text-xs text-bio-400 tracking-[0.3em] mb-3">AI GENERATED</div>
            {/* 概念海报 */}
            <div className="relative mx-auto rounded-2xl overflow-hidden cursor-pointer group"
              style=${{ maxWidth: '360px', aspectRatio: '3/4' }}
              onClick=${() => { audio.sfx('click'); if (navigator.vibrate) navigator.vibrate(10) }}>
              <div className="absolute inset-0 bg-gradient-to-br ${topicResult.posterGradient}"></div>
              <div className="absolute inset-0" style=${{ background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.15), transparent 60%)' }}></div>
              {/* 海报内容 */}
              <div className="relative h-full flex flex-col items-center justify-between p-6 text-white">
                <div className="text-7xl mt-4 animate-float">${topicResult.posterEmoji}</div>
                <div className="w-full">
                  <div className="text-[10px] tracking-[0.2em] text-white/60 mb-2">GAME CONCEPT</div>
                  <h3 className="text-2xl font-black mb-3" style=${{ fontFamily: 'Orbitron, sans-serif' }}>
                    ${topicResult.gameTitle}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 justify-center mb-3">
                    ${topicResult.concepts.map(c => html`
                      <span key=${c} className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">${c}</span>
                    `)}
                  </div>
                  <p className="text-xs text-white/70">类型：${topicResult.gameType}</p>
                </div>
                <div className="text-[9px] text-white/40 mb-2">知识不进脑子啊 · 知识胶囊</div>
              </div>
              {/* hover 遮罩 */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-bold">点击创建 →</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center mt-6 flex-wrap">
              <button onClick=${createFromTopic}
                className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-brand-500 to-accent-500 hover:scale-105 transition-transform"
                style=${{ boxShadow: '0 0 20px rgba(217,70,239,0.4)' }}>
                🚀 用这个主题创建游戏
              </button>
              <button onClick=${() => { audio.sfx('click'); shareTopic() }}
                className="px-4 py-2.5 rounded-full text-sm font-bold text-bio-400 border border-bio-400/40 hover:bg-bio-400/10 transition-colors">
                📤 分享这颗知识胶囊
              </button>
              <button onClick=${onResetMind}
                className="px-4 py-2.5 rounded-full text-sm font-bold text-purple-200 border border-purple-500/40 hover:bg-purple-500/10 transition-colors">
                换一个
              </button>
            </div>
            ${!topicResult.matched && html`
              <p className="text-xs text-purple-400 mt-3">
                💡 该知识领域尚待开拓，注册后可召唤专属AI团队开荒！
              </p>
            `}
          </div>
        `}
      </div>

      {/* 拖拽高亮遮罩 */}
      ${dragging && html`
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
          style=${{ background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)' }}>
          <div className="text-6xl animate-pulse">🌀</div>
        </div>
      `}

      {/* 解析中遮罩 */}
      ${parsing && html`
        <div className="absolute inset-0 z-30 flex items-center justify-center" style=${{ background: 'rgba(5,1,15,0.7)' }}>
          <div className="text-center">
            <div className="text-4xl mb-4 animate-spin">⭕</div>
            <p className="text-purple-300 text-sm">正在解析教材…</p>
          </div>
        </div>
      `}

      {/* 向下滚动提示 */}
      ${mindPhase === null && html`
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-purple-400 text-xs animate-bounce-slow">
          ↓ 探索更多
        </div>
      `}
    </div>
  `
}
