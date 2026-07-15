// 页面9：游戏玩家 — AI 协作完成后，在这里"玩"生成的游戏
// 这不是文档预览器，是一个 HTML5 游戏播放器：CRT 画布 / 动画场景 / 分享 / 嵌入 / 安装一条龙
import { html, useContext, useState, useCallback, useEffect, useRef } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'
import { NavBar, Footer } from './PlatformCommon.js'

// ── 复古未来主义色板 ──
const C = {
  bg: '#05010f',
  text: '#f5e8ff',
  textMuted: '#8b7da8',
  textDim: '#5d4f7a',
  primary: '#a78bfa',
  accent: '#F5A623',
  border: 'rgba(167,139,250,0.12)',
  surface: 'rgba(255,255,255,0.03)',
  surfaceHover: 'rgba(255,255,255,0.06)',
  green: '#4ade80',
  blue: '#60a5fa',
  pink: '#f472b6',
}

// ── 游戏动画 CSS（自包含注入）──
const GAME_CSS = `
@keyframes pvGridScroll {
  0% { background-position: 0 0; }
  100% { background-position: 0 40px; }
}
@keyframes pvCharRun {
  0%   { left: 6%;  transform: translateY(0) scaleX(1); }
  12%  { transform: translateY(-7px) scaleX(1); }
  24%  { transform: translateY(0) scaleX(1); }
  48%  { left: 86%; transform: translateY(0) scaleX(1); }
  50%  { left: 86%; transform: translateY(0) scaleX(-1); }
  62%  { transform: translateY(-7px) scaleX(-1); }
  74%  { transform: translateY(0) scaleX(-1); }
  98%  { left: 6%;  transform: translateY(0) scaleX(-1); }
  100% { left: 6%;  transform: translateY(0) scaleX(1); }
}
@keyframes pvOrbFloat {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.85; }
  50%      { transform: translateY(-16px) scale(1.12); opacity: 1; }
}
@keyframes pvOrbPulse {
  0%, 100% { box-shadow: 0 0 8px currentColor, 0 0 16px currentColor; }
  50%      { box-shadow: 0 0 14px currentColor, 0 0 28px currentColor; }
}
@keyframes pvCrtFlicker {
  0%, 100% { opacity: 1; }
  4%  { opacity: 0.93; }
  6%  { opacity: 1; }
  52% { opacity: 0.97; }
  54% { opacity: 1; }
}
@keyframes pvScanMove {
  0%   { top: -12%; }
  100% { top: 110%; }
}
@keyframes pvStarTwinkle {
  0%, 100% { opacity: 0.25; }
  50%      { opacity: 1; }
}
`

// ── 知识光球 ──
const ORBS = [
  { id: 1, left: '22%', bottom: '40%', color: C.primary, delay: '0s', label: 'F=ma' },
  { id: 2, left: '40%', bottom: '54%', color: C.accent, delay: '0.5s', label: '惯性' },
  { id: 3, left: '58%', bottom: '38%', color: C.green, delay: '1s', label: 'a' },
  { id: 4, left: '74%', bottom: '52%', color: C.blue, delay: '1.5s', label: 'v' },
  { id: 5, left: '33%', bottom: '30%', color: C.pink, delay: '2s', label: 'g' },
]

// ── 背景星星 ──
const STARS = [
  { left: '8%', top: '12%', size: 2, delay: '0s' },
  { left: '22%', top: '8%', size: 3, delay: '0.6s' },
  { left: '38%', top: '18%', size: 2, delay: '1.2s' },
  { left: '55%', top: '10%', size: 3, delay: '0.3s' },
  { left: '70%', top: '20%', size: 2, delay: '0.9s' },
  { left: '85%', top: '14%', size: 3, delay: '1.5s' },
  { left: '92%', top: '6%', size: 2, delay: '0.4s' },
  { left: '15%', top: '24%', size: 2, delay: '1.8s' },
  { left: '48%', top: '6%', size: 2, delay: '1.1s' },
  { left: '78%', top: '26%', size: 2, delay: '0.7s' },
]

// ── 默认知识点 ──
const DEFAULT_KNOWLEDGE = ['牛顿第一定律', '惯性参考系', '加速度', '受力分析', '匀变速直线运动']

// ── 分享平台 ──
const SHARE_PLATFORMS = [
  { id: 'wechat', label: '微信', icon: '💬', color: C.green },
  { id: 'weibo', label: '微博', icon: '📢', color: '#f87171' },
  { id: 'qq', label: 'QQ', icon: '🐧', color: C.blue },
]

// ── 稳定的 QR 占位图案（带三角定位块）──
const QR_PATTERN = (() => {
  const N = 13
  const g = Array.from({ length: N }, () => Array(N).fill(0))
  let seed = 1337
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 }
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) g[r][c] = rand() > 0.5 ? 1 : 0
  const finder = (r0, c0) => {
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      const rr = r0 + r, cc = c0 + c
      if (rr < N && cc < N) g[rr][cc] = (r === 0 || r === 2 || c === 0 || c === 2 || (r === 1 && c === 1)) ? 1 : 0
    }
  }
  finder(0, 0); finder(0, N - 3); finder(N - 3, 0)
  return g
})()

export default function PreviewView() {
  const { state, dispatch, goStep, toast } = useContext(AppContext)

  // 从已生成的设计文档取数据，缺失则回退 mock
  const doc = state.designDoc
  const cfg = doc?.config || {}
  const gameTitle = cfg.theme?.name || doc?.title || '知识探索'
  const gameType = ({ dodge: '闪避', thrust: '推进', boss: 'Boss战', avoid: '闪避', propel: '推进', combat: '战斗' })[cfg.mechanics?.[0]?.type] || '闪避探索'
  const knowledge = (() => {
    const kps = cfg.knowledgePoints
    if (Array.isArray(kps) && kps.length) {
      return kps.slice(0, 6).map(k => k.name || '知识点')
    }
    return DEFAULT_KNOWLEDGE
  })()
  const levels = cfg.levels || []
  const playtest = cfg.playtest || null
  const gameId = String(doc?.meta?.generatedAt?.slice(0, 5) || 'X7K9M').replace(/[^A-Z0-9]/g, '').slice(0, 5).toUpperCase().padEnd(5, '0')
  const gameUrl = `play.knowledge-game.com/g/${gameId}`

  // 游戏状态
  const [playing, setPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [collected, setCollected] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedEmbed, setCopiedEmbed] = useState(false)
  const [privacy, setPrivacy] = useState('public')
  const canvasRef = useRef(null)

  const won = progress >= 100

  // 游戏进行中：分数 / 收集 / 进度递增
  useEffect(() => {
    if (!playing || won) return
    const t = setInterval(() => {
      setScore((s) => s + 10)
      setCollected((c) => Math.min(c + 1, ORBS.length * 4))
      setProgress((p) => Math.min(p + 2, 100))
    }, 500)
    return () => clearInterval(t)
  }, [playing, won])

  // 全屏状态跟踪
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const startGame = useCallback(() => {
    setPlaying(true)
    setScore(0)
    setCollected(0)
    setProgress(0)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) await canvasRef.current?.requestFullscreen?.()
      else await document.exitFullscreen?.()
    } catch (e) { /* 忽略 */ }
  }, [])

  const copyText = useCallback(async (text, which) => {
    try {
      await navigator.clipboard.writeText(text)
      if (which === 'url') { setCopiedUrl(true); setTimeout(() => setCopiedUrl(false), 1500) }
      else { setCopiedEmbed(true); setTimeout(() => setCopiedEmbed(false), 1500) }
      toast('已复制到剪贴板', 'success')
    } catch (e) {
      toast('复制失败，请手动复制', 'error')
    }
  }, [toast])

  const goEdit = useCallback(() => {
    goStep(STEPS.WORKSPACE)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [goStep])

  const goStudio = useCallback(() => {
    goStep(STEPS.AISTUDIO)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [goStep])

  const regen = useCallback(() => {
    dispatch({ type: 'SET_DOC', payload: null })
    dispatch({ type: 'RESET_DISCUSSION' })
    goStep(STEPS.WORKSPACE)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    toast('已重置，重新开始协作生成', 'info')
  }, [dispatch, goStep, toast])

  const goCreate = useCallback(() => {
    goStep(STEPS.UPLOAD)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [goStep])

  const embedCode = `<iframe src="https://${gameUrl}" width="800" height="600" frameborder="0" allow="fullscreen"></iframe>`

  return html`
    <div style=${{ background: C.bg, minHeight: '100vh' }}>
      <style>${GAME_CSS}</style>
      <${NavBar} />

      <!-- 访客横幅（访客打开分享链接时看到） -->
      <div class="w-full" style=${{ marginTop: '64px', background: 'linear-gradient(90deg, rgba(245,166,35,0.14), rgba(167,139,250,0.10))', borderBottom: `1px solid ${C.border}` }}>
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-1.5 text-center">
          <span class="text-xs" style=${{ color: C.textMuted }}>此游戏由《高中物理必修一》教材生成，</span>
          <button class="text-xs font-semibold cursor-pointer" style=${{ color: C.accent }} onClick=${goCreate}>创建你自己的 →</button>
        </div>
      </div>

      <!-- 主内容 -->
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">

        <!-- 顶部栏：标题 + 操作 -->
        <div class="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div class="min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs px-2 py-0.5 rounded-full" style=${{ background: 'rgba(74,222,128,0.12)', color: C.green, border: '1px solid rgba(74,222,128,0.3)' }}>● 已生成</span>
              <span class="text-xs" style=${{ color: C.textDim }}>游戏 ID：${gameId}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black tracking-tight truncate" style=${{ color: C.text }}>${gameTitle}</h1>
          </div>
          <div class="flex items-center gap-2">
            <button class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style=${{ color: C.textMuted, border: `1px solid ${C.border}`, background: C.surface }}
              onMouseEnter=${(e) => e.currentTarget.style.background = C.surfaceHover}
              onMouseLeave=${(e) => e.currentTarget.style.background = C.surface}
              onClick=${goEdit}>← 返回修改</button>
            <button class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style=${{ color: C.primary, border: `1px solid rgba(167,139,250,0.3)`, background: 'rgba(167,139,250,0.06)' }}
              onMouseEnter=${(e) => e.currentTarget.style.background = 'rgba(167,139,250,0.12)'}
              onMouseLeave=${(e) => e.currentTarget.style.background = 'rgba(167,139,250,0.06)'}
              onClick=${goStudio}>🎛 调节智能体</button>
            <button class="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style=${{ color: '#1a0f3d', background: C.accent }}
              onMouseEnter=${(e) => e.currentTarget.style.filter = 'brightness(1.08)'}
              onMouseLeave=${(e) => e.currentTarget.style.filter = 'brightness(1)'}
              onClick=${regen}>重新生成</button>
          </div>
        </div>

        <!-- 主体网格：左画布+信息 / 右侧栏 -->
        <div class="grid lg:grid-cols-3 gap-6">

          <!-- 左：游戏画布 + 信息栏 -->
          <div class="lg:col-span-2 space-y-4">

            <!-- 游戏画布（16:9 CRT） -->
            <div ref=${canvasRef} class="relative w-full overflow-hidden"
              style=${{
                aspectRatio: '16 / 9',
                borderRadius: '16px',
                background: 'radial-gradient(ellipse at 50% 30%, #1a0f4d 0%, #0a0420 50%, #05010f 100%)',
                border: `2px solid ${C.primary}`,
                boxShadow: '0 0 0 1px rgba(167,139,250,0.2), 0 0 40px rgba(167,139,250,0.25), inset 0 0 60px rgba(167,139,250,0.08)',
                animation: 'pvCrtFlicker 5s infinite',
              }}>

              <!-- 星空 -->
              ${STARS.map((s, i) => html`
                <span key=${`star-${i}`} style=${{
                  position: 'absolute', left: s.left, top: s.top,
                  width: s.size, height: s.size, borderRadius: '50%', background: C.text,
                  animation: `pvStarTwinkle ${2 + (i % 3)}s ease-in-out ${s.delay} infinite`, pointerEvents: 'none',
                }}></span>
              `)}

              <!-- 复古网格地板 -->
              <div style=${{
                position: 'absolute', bottom: 0, left: '-10%', right: '-10%', height: '46%',
                backgroundImage: 'linear-gradient(rgba(167,139,250,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.4) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                transform: 'perspective(260px) rotateX(62deg)', transformOrigin: 'bottom',
                animation: 'pvGridScroll 1.6s linear infinite',
                maskImage: 'linear-gradient(180deg, transparent, #000 40%)',
                WebkitMaskImage: 'linear-gradient(180deg, transparent, #000 40%)',
              }}></div>

              <!-- 知识光球 -->
              ${ORBS.map((o) => html`
                <div key=${`orb-${o.id}`} style=${{
                  position: 'absolute', left: o.left, bottom: o.bottom, color: o.color, pointerEvents: 'none',
                  animation: `pvOrbFloat ${2.4 + o.id * 0.2}s ease-in-out ${o.delay} infinite`,
                }}>
                  <div style=${{
                    width: 22, height: 22, borderRadius: '50%', background: o.color, color: o.color,
                    animation: 'pvOrbPulse 1.6s ease-in-out infinite',
                  }}></div>
                  <div class="text-[9px] font-bold mt-0.5 text-center" style=${{ color: o.color, textShadow: `0 0 6px ${o.color}` }}>${o.label}</div>
                </div>
              `)}

              <!-- 角色 -->
              ${playing ? html`
                <div style=${{ position: 'absolute', bottom: '24%', left: '6%', animation: 'pvCharRun 7s linear infinite' }}>
                  <div style=${{
                    width: 30, height: 30, borderRadius: 7,
                    background: 'linear-gradient(135deg, #a78bfa, #6e578d)', border: '2px solid #f5e8ff',
                    boxShadow: '0 0 14px rgba(167,139,250,0.8)',
                  }}></div>
                  <div style=${{ width: 4, height: 10, background: C.accent, margin: '0 auto', marginTop: -2, borderRadius: 2 }}></div>
                </div>
              ` : null}

              <!-- HUD：分数 / 收集 / 进度 -->
              <div style=${{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
                <div class="flex items-center justify-between">
                  <div class="px-2.5 py-1 rounded-lg text-xs font-bold" style=${{ background: 'rgba(5,1,15,0.6)', color: C.accent, border: '1px solid rgba(245,166,35,0.3)', backdropFilter: 'blur(4px)' }}>分数 ${score}</div>
                  <div class="px-2.5 py-1 rounded-lg text-xs font-bold" style=${{ background: 'rgba(5,1,15,0.6)', color: C.primary, border: `1px solid ${C.border}`, backdropFilter: 'blur(4px)' }}>收集 ${collected}</div>
                </div>
                <div class="w-full h-1.5 rounded-full overflow-hidden" style=${{ background: 'rgba(5,1,15,0.5)' }}>
                  <div style=${{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #a78bfa, #F5A623)', transition: 'width 0.4s ease', boxShadow: '0 0 8px rgba(167,139,250,0.6)' }}></div>
                </div>
              </div>

              <!-- 全屏按钮 -->
              <button class="absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all"
                style=${{ background: 'rgba(5,1,15,0.6)', color: C.text, border: `1px solid ${C.border}`, backdropFilter: 'blur(4px)' }}
                onMouseEnter=${(e) => e.currentTarget.style.background = 'rgba(167,139,250,0.2)'}
                onMouseLeave=${(e) => e.currentTarget.style.background = 'rgba(5,1,15,0.6)'}
                onClick=${toggleFullscreen}>${isFullscreen ? '🗗' : '⛶'}</button>

              <!-- CRT 扫描线 -->
              <div style=${{ position: 'absolute', left: 0, right: 0, height: 60, background: 'linear-gradient(180deg, transparent, rgba(167,139,250,0.10), transparent)', pointerEvents: 'none', animation: 'pvScanMove 4.5s linear infinite' }}></div>
              <div style=${{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)' }}></div>

              <!-- 开始游戏遮罩 -->
              ${!playing ? html`
                <div class="absolute inset-0 flex flex-col items-center justify-center" style=${{ background: 'rgba(5,1,15,0.55)', backdropFilter: 'blur(3px)' }}>
                  <button class="px-8 py-3.5 rounded-xl text-base font-bold transition-all"
                    style=${{ color: '#1a0f3d', background: C.accent, boxShadow: '0 0 30px rgba(245,166,35,0.5)' }}
                    onMouseEnter=${(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave=${(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onClick=${startGame}>▶ 开始游戏</button>
                  <p class="text-xs mt-3" style=${{ color: C.textMuted }}>收集知识光球，解锁物理奥秘</p>
                </div>
              ` : null}

              <!-- 通关遮罩 -->
              ${won ? html`
                <div class="absolute inset-0 flex flex-col items-center justify-center" style=${{ background: 'rgba(5,1,15,0.7)', backdropFilter: 'blur(4px)' }}>
                  <div class="text-3xl mb-2">🏆</div>
                  <div class="text-lg font-black mb-1" style=${{ color: C.accent }}>通关！</div>
                  <div class="text-xs mb-4" style=${{ color: C.textMuted }}>最终分数 ${score} · 收集 ${collected}</div>
                  <button class="px-6 py-2 rounded-lg text-sm font-semibold transition-all" style=${{ color: '#1a0f3d', background: C.accent }} onClick=${startGame}>再玩一次</button>
                </div>
              ` : null}
            </div>

            <!-- 游戏信息栏 -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              ${[
                { l: '游戏类型', v: gameType, e: '🎮', color: C.primary },
                { l: '预计时长', v: '约 15 分钟', e: '⏱️', color: C.accent },
                { l: '难度', v: '★★★☆☆', e: '⚔️', color: C.green },
                { l: '关卡', v: `${doc?.gameDesign?.levels?.length || 8} 关`, e: '🧩', color: C.blue },
              ].map((s) => html`
                <div key=${s.l} class="p-3 rounded-xl text-center" style=${{ background: C.surface, border: `1px solid ${C.border}` }}>
                  <div class="text-lg mb-0.5">${s.e}</div>
                  <div class="text-sm font-bold" style=${{ color: s.color }}>${s.v}</div>
                  <div class="text-[10px]" style=${{ color: C.textDim }}>${s.l}</div>
                </div>
              `)}
            </div>

            <!-- 知识点标签 -->
            <div class="p-4 rounded-xl" style=${{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div class="text-xs font-semibold mb-2" style=${{ color: C.textMuted }}>涵盖知识点</div>
              <div class="flex flex-wrap gap-2">
                ${knowledge.map((k, i) => html`
                  <span key=${i} class="px-2.5 py-1 rounded-full text-xs font-medium" style=${{ background: 'rgba(167,139,250,0.1)', color: C.primary, border: '1px solid rgba(167,139,250,0.25)' }}>${k}</span>
                `)}
              </div>
            </div>
          </div>

          <!-- 右：侧边栏 -->
          <aside class="space-y-4">

            <!-- 分享游戏 -->
            <div class="p-4 rounded-xl" style=${{ background: C.surface, border: `1px solid ${C.border}` }}>
              <h3 class="text-sm font-bold mb-3 flex items-center gap-1.5" style=${{ color: C.text }}><span>🔗</span> 分享游戏</h3>

              <!-- 游戏链接 + 复制 -->
              <div class="flex items-center gap-2 mb-3">
                <div class="flex-1 px-3 py-2 rounded-lg text-xs truncate" style=${{ background: 'rgba(5,1,15,0.5)', color: C.textMuted, border: `1px solid ${C.border}` }}>${gameUrl}</div>
                <button class="px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                  style=${{ background: copiedUrl ? 'rgba(74,222,128,0.15)' : C.accent, color: copiedUrl ? C.green : '#1a0f3d' }}
                  onClick=${() => copyText(`https://${gameUrl}`, 'url')}>${copiedUrl ? '已复制' : '复制'}</button>
              </div>

              <!-- QR 占位 -->
              <div class="flex justify-center mb-3">
                <div style=${{ background: '#f5e8ff', padding: 8, borderRadius: 8, display: 'grid', gridTemplateColumns: 'repeat(13, 6px)', gap: 0 }}>
                  ${QR_PATTERN.flatMap((row, r) => row.map((cell, c) => html`
                    <div key=${`qr-${r}-${c}`} style=${{ width: 6, height: 6, background: cell ? '#05010f' : 'transparent' }}></div>
                  `))}
                </div>
              </div>

              <!-- 分享按钮 -->
              <div class="grid grid-cols-4 gap-2 mb-3">
                ${SHARE_PLATFORMS.map((p) => html`
                  <button key=${p.id} class="flex flex-col items-center gap-1 py-2 rounded-lg transition-all"
                    style=${{ background: 'rgba(5,1,15,0.4)', border: `1px solid ${C.border}` }}
                    onMouseEnter=${(e) => { e.currentTarget.style.background = 'rgba(167,139,250,0.12)'; e.currentTarget.style.borderColor = p.color }}
                    onMouseLeave=${(e) => { e.currentTarget.style.background = 'rgba(5,1,15,0.4)'; e.currentTarget.style.borderColor = C.border }}
                    onClick=${() => toast(`正在分享到${p.label}…`, 'info')}>
                    <span class="text-lg">${p.icon}</span>
                    <span class="text-[10px]" style=${{ color: C.textMuted }}>${p.label}</span>
                  </button>
                `)}
                <button class="flex flex-col items-center gap-1 py-2 rounded-lg transition-all"
                  style=${{ background: 'rgba(5,1,15,0.4)', border: `1px solid ${C.border}` }}
                  onMouseEnter=${(e) => { e.currentTarget.style.background = 'rgba(167,139,250,0.12)'; e.currentTarget.style.borderColor = C.primary }}
                  onMouseLeave=${(e) => { e.currentTarget.style.background = 'rgba(5,1,15,0.4)'; e.currentTarget.style.borderColor = C.border }}
                  onClick=${() => copyText(`https://${gameUrl}`, 'url')}>
                  <span class="text-lg">📋</span>
                  <span class="text-[10px]" style=${{ color: C.textMuted }}>复制链接</span>
                </button>
              </div>

              <!-- 隐私开关 -->
              <div class="flex items-center justify-between p-2.5 rounded-lg" style=${{ background: 'rgba(5,1,15,0.4)' }}>
                <span class="text-xs" style=${{ color: C.textMuted }}>访问权限</span>
                <div class="flex rounded-lg overflow-hidden" style=${{ border: `1px solid ${C.border}` }}>
                  <button class="px-3 py-1 text-xs font-medium transition-all"
                    style=${privacy === 'public' ? { background: C.accent, color: '#1a0f3d' } : { background: 'transparent', color: C.textMuted }}
                    onClick=${() => setPrivacy('public')}>公开试玩</button>
                  <button class="px-3 py-1 text-xs font-medium transition-all"
                    style=${privacy === 'private' ? { background: C.primary, color: '#fff' } : { background: 'transparent', color: C.textMuted }}
                    onClick=${() => setPrivacy('private')}>仅自己可见</button>
                </div>
              </div>
            </div>

            <!-- 嵌入代码 -->
            <div class="p-4 rounded-xl" style=${{ background: C.surface, border: `1px solid ${C.border}` }}>
              <h3 class="text-sm font-bold mb-3 flex items-center gap-1.5" style=${{ color: C.text }}><span>📐</span> 嵌入代码</h3>
              <pre class="text-[11px] font-mono p-3 rounded-lg mb-2 overflow-x-auto" style=${{ background: 'rgba(5,1,15,0.6)', color: C.green, border: `1px solid ${C.border}` }}>${embedCode}</pre>
              <button class="w-full py-2 rounded-lg text-xs font-semibold transition-all"
                style=${{ background: copiedEmbed ? 'rgba(74,222,128,0.15)' : C.primary, color: copiedEmbed ? C.green : '#fff' }}
                onClick=${() => copyText(embedCode, 'embed')}>${copiedEmbed ? '✓ 已复制嵌入代码' : '复制嵌入代码'}</button>
            </div>

            <!-- 安装到桌面 -->
            <button class="w-full p-4 rounded-xl text-left transition-all flex items-center gap-3"
              style=${{ background: 'linear-gradient(135deg, rgba(167,139,250,0.12), rgba(245,166,35,0.08))', border: `1px solid ${C.border}` }}
              onMouseEnter=${(e) => e.currentTarget.style.borderColor = C.primary}
              onMouseLeave=${(e) => e.currentTarget.style.borderColor = C.border}
              onClick=${() => toast('桌面安装已就绪（模拟）', 'success')}>
              <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0" style=${{ background: C.primary, color: '#fff' }}>⬇️</div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-bold" style=${{ color: C.text }}>安装到桌面</div>
                <div class="text-[11px]" style=${{ color: C.textMuted }}>离线随时玩，PWA 一键安装</div>
              </div>
              <span style=${{ color: C.accent }}>→</span>
            </button>
          </aside>
        </div>

        <!-- 底部 CTA -->
        <div class="mt-10 p-6 rounded-2xl text-center" style=${{ background: 'linear-gradient(135deg, rgba(167,139,250,0.12), rgba(245,166,35,0.08))', border: `1px solid ${C.border}` }}>
          <h2 class="text-xl font-black mb-1" style=${{ color: C.text }}>玩上头了？</h2>
          <p class="text-sm mb-4" style=${{ color: C.textMuted }}>把你的教材扔进来，AI 帮你吐出一个上头游戏</p>
          <button class="px-7 py-3 rounded-xl text-sm font-bold transition-all"
            style=${{ color: '#1a0f3d', background: C.accent, boxShadow: '0 0 24px rgba(245,166,35,0.4)' }}
            onMouseEnter=${(e) => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave=${(e) => e.currentTarget.style.transform = 'scale(1)'}
            onClick=${goCreate}>创建你自己的游戏 →</button>
        </div>
      </div>

      <${Footer} />
    </div>
  `
}
