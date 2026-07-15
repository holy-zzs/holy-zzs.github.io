import { html, useEffect, useMemo, useRef } from '../../react.js'
import { useApp, STEPS } from '../../store/appContext.js'
import { useHeroUploadFlow } from './useHeroUploadFlow.js'

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getDropLabel(dropState, parsing) {
  if (parsing || dropState === 'parsing') return '教材解析中…'
  if (dropState === 'hover-accept') return '松手即可开始解析'
  if (dropState === 'hover-reject') return '仅支持 PDF / Word / TXT / MD'
  if (dropState === 'success') return '教材已识别，可以继续生成'
  if (dropState === 'error') return '格式不支持或解析失败，请重试'
  return '拖入教材，或点按钮选择文件'
}

export default function LandingBlackHoleHero() {
  const { state, dispatch, goStep, toast } = useApp()
  const containerRef = useRef(null)
  const fileInputRef = useRef(null)
  const engineRef = useRef(null)
  const reducedMotion = useMemo(() => prefersReducedMotion(), [])

  const flow = useHeroUploadFlow({
    dispatch,
    toast,
    user: state.user,
    goStep,
    STEPS,
    triggerAuth: (reason, intent) => dispatch({ type: 'SET_AUTH_PROMPT', payload: { reason, intent } }),
  })

  useEffect(() => {
    if (reducedMotion) return undefined

    let destroyed = false
    let engine = null

    async function init() {
      try {
        const { default: BlackHoleEngine } = await import('./three/blackHoleEngine.js')
        if (destroyed || !containerRef.current) return
        engine = new BlackHoleEngine(containerRef.current)
        engine.start()
        engineRef.current = engine
      } catch (err) {
        console.warn('首页黑洞引擎降级为静态模式', err)
      }
    }

    init()

    return () => {
      destroyed = true
      if (engine) engine.destroy()
      engineRef.current = null
    }
  }, [reducedMotion])

  useEffect(() => {
    if (!engineRef.current) return
    if (flow.dropState === 'hover-accept' || flow.dropState === 'parsing') {
      engineRef.current.setMode('consuming')
      return
    }
    engineRef.current.setMode('idle')
  }, [flow.dropState])

  const openFilePicker = () => fileInputRef.current?.click()
  const onFileChange = async (e) => {
    await flow.handleFiles(e.target.files)
    e.target.value = ''
  }

  const primaryStepHint = state.designDoc
    ? '已有游戏结果，可直接试玩'
    : state.material
      ? '教材已在项目里，可继续生成'
      : state.user
        ? '上传教材后可直接进入协作流'
        : '可以先用示例体验，再决定是否登录'

  return html`
    <div
      class="app-hero-signature relative overflow-hidden rounded-[28px] border"
      style=${{
        borderColor: flow.dropState === 'hover-accept'
          ? 'rgba(245,166,35,0.45)'
          : flow.dropState === 'hover-reject'
            ? 'rgba(248,113,113,0.35)'
            : 'rgba(167,139,250,0.18)',
        background: 'radial-gradient(circle at 50% 35%, rgba(30,15,77,0.92), rgba(10,4,32,0.96) 45%, rgba(5,1,15,0.98) 100%)',
        boxShadow: flow.dropState === 'hover-accept'
          ? '0 0 48px rgba(245,166,35,0.18)'
          : '0 24px 80px rgba(0,0,0,0.42)',
      }}
      onDragOver=${flow.onDragOver}
      onDragLeave=${flow.onDragLeave}
      onDrop=${flow.onDrop}
    >
      <div class="absolute inset-0 opacity-70 pointer-events-none" ref=${containerRef}></div>
      <div class="absolute inset-0 pointer-events-none">
        ${Array.from({ length: 28 }).map((_, i) => html`
          <span
            key=${i}
            class="app-hero-star"
            style=${{
              left: `${(i * 17 + 9) % 100}%`,
              top: `${(i * 13 + 7) % 100}%`,
              animationDelay: `${(i % 5) * 0.5}s`,
              width: `${(i % 3) + 1}px`,
              height: `${(i % 3) + 1}px`,
            }}
          ></span>
        `)}
      </div>

      <div class="relative z-10 p-6 sm:p-7 lg:p-8">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div class="min-w-0">
            <div class="app-eyebrow mb-2">Signature Upload Flow</div>
            <h3 class="text-2xl sm:text-[2rem] font-black leading-tight text-white text-balance">
              把教材扔进黑洞，<br />让 AI 吐出一个能玩的游戏
            </h3>
            <p class="mt-3 text-sm leading-6 max-w-lg" style=${{ color: 'var(--app-text-muted)' }}>
              ${primaryStepHint}
            </p>
          </div>
          <button
            class="app-chip-button"
            onClick=${() => goStep(STEPS.HALL)}
            aria-label="进入沉浸式大厅体验"
          >
            进入沉浸式大厅
          </button>
        </div>

        <div class="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div class="app-panel app-panel-hero min-w-0">
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div class="text-sm font-semibold text-white">教材入口</div>
                <p class="mt-1 text-xs" style=${{ color: 'var(--app-text-dim)' }}>
                  ${getDropLabel(flow.dropState, flow.parsing)}
                </p>
              </div>
              <span class="app-status-chip" aria-live="polite">
                ${flow.parsing ? '解析中' : flow.dropState === 'success' ? '已识别' : '可体验'}
              </span>
            </div>

            <div
              class="mt-4 rounded-[22px] border p-5 sm:p-6"
              style=${{
                borderColor: flow.dropState === 'hover-reject' ? 'rgba(248,113,113,0.35)' : 'rgba(255,255,255,0.08)',
                background: flow.dropState === 'hover-accept'
                  ? 'linear-gradient(135deg, rgba(245,166,35,0.09), rgba(167,139,250,0.08))'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
              }}
            >
              <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="min-w-0">
                  <div class="text-3xl sm:text-4xl">🌀</div>
                  <div class="mt-3 text-base font-bold text-white">从教材到可玩结果</div>
                  <p class="mt-1 text-xs leading-5 max-w-sm" style=${{ color: 'var(--app-text-muted)' }}>
                    支持 PDF / Word / TXT / MD，拖拽只是增强方式，按钮上传同样可走完整流程。
                  </p>
                </div>
                <div class="w-full sm:w-auto flex flex-col gap-2">
                  <button class="app-primary-button" onClick=${openFilePicker} aria-label="选择教材文件上传">
                    选择教材文件
                  </button>
                  <button class="app-secondary-button" onClick=${flow.tryDemo} aria-label="载入示例教材体验">
                    先用示例体验
                  </button>
                </div>
              </div>
              <input
                ref=${fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md"
                class="sr-only"
                aria-label="教材文件选择器"
                onChange=${onFileChange}
              />
            </div>

            <div class="mt-4 grid gap-2 sm:grid-cols-3" aria-live="polite">
              ${[
                ['支持格式', 'PDF / Word / TXT / MD'],
                ['体验方式', '拖拽、按钮上传、示例教材'],
                ['产出结果', '浏览器可玩的 HTML5 游戏'],
              ].map(([label, value]) => html`
                <div key=${label} class="app-trust-badge">
                  <span class="app-trust-label">${label}</span>
                  <span class="app-trust-value">${value}</span>
                </div>
              `)}
            </div>
          </div>

          <div class="app-panel min-w-0">
            <div class="flex items-center justify-between gap-2">
              <div>
                <div class="text-sm font-semibold text-white">AI 协作快照</div>
                <p class="mt-1 text-xs" style=${{ color: 'var(--app-text-dim)' }}>
                  首页先给你一个成功路径，复杂度留到后面展开
                </p>
              </div>
              <span class="app-status-chip">渐进披露</span>
            </div>

            <div class="mt-4 space-y-3">
              ${[
                ['1', '识别教材结构', state.material ? '已识别当前教材，可直接继续' : '先提取章节、概念与公式'],
                ['2', '分派 AI 角色', '知识拆解、关卡设计、美术指导、体验评估协作推进'],
                ['3', '输出可玩结果', '生成的不是文档，而是可试玩的 HTML5 游戏'],
              ].map(([index, title, desc]) => html`
                <div key=${index} class="app-process-row">
                  <div class="app-process-index">${index}</div>
                  <div class="min-w-0">
                    <div class="text-sm font-semibold text-white">${title}</div>
                    <div class="mt-1 text-xs leading-5" style=${{ color: 'var(--app-text-muted)' }}>${desc}</div>
                  </div>
                </div>
              `)}
            </div>

            <div class="mt-5 rounded-2xl border p-4" style=${{ borderColor: 'rgba(167,139,250,0.14)', background: 'rgba(255,255,255,0.03)' }}>
              <div class="flex items-center gap-2 text-xs font-semibold" style=${{ color: 'var(--app-accent)' }}>
                <span>⚡</span>
                <span>工作台随后会承接这一语言</span>
              </div>
              <p class="mt-2 text-xs leading-5" style=${{ color: 'var(--app-text-muted)' }}>
                进入工作台后默认先看到“概览与下一步”，JSON、预览与高级细节会作为二级信息逐步展开，而不是一次性压满屏幕。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}
