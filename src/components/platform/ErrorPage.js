// 错误页面 — 404 / 500，复古 CRT 故障风格
import { html, useCallback, useContext, useEffect, useState } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js?v=ctx2'
import { NavBar } from './PlatformCommon.js?v=nav3'

// ── 复古未来主义色板 ──
const C = {
  bg: '#05010f',
  text: '#f5e8ff',
  textMuted: '#8b7da8',
  textDim: '#5d4f7a',
  primary: '#a78bfa',
  accent: '#F5A623',
  danger: '#f87171',
  border: 'rgba(167,139,250,0.12)',
}

// ── 错误类型配置 ──
const ERROR_CONFIG = {
  404: {
    code: '404',
    title: '页面走丢了',
    desc: '你要找的页面可能被黑洞吸走了，或者根本就不存在。别慌，它只是去别的宇宙旅行了。',
    emoji: '🛰️',
    glitchTexts: ['PAGE NOT FOUND', '信号丢失', '404 // VOID', '坐标不存在', 'NULL_POINTER'],
  },
  500: {
    code: '500',
    title: '服务器打了个盹',
    desc: '服务器内部的 AI 智能体们吵起来了，暂时没法响应你的请求。给它们一点时间冷静一下，马上回来。',
    emoji: '💤',
    glitchTexts: ['SERVER ERROR', '系统过载', '500 // OVERLOAD', '智能体罢工中', 'STACK_OVERFLOW'],
  },
}

// ── CRT 故障特效 CSS（自包含注入）──
const GLITCH_CSS = `
@keyframes crtScanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}
@keyframes neonFlicker {
  0%, 100% { opacity: 1; text-shadow: 0 0 10px #a78bfa, 0 0 20px #a78bfa, 0 0 40px #a78bfa, 0 0 80px #a78bfa; }
  3% { opacity: 0.85; text-shadow: 0 0 8px #a78bfa, 0 0 16px #a78bfa; }
  6% { opacity: 1; text-shadow: 0 0 10px #a78bfa, 0 0 20px #a78bfa, 0 0 40px #a78bfa, 0 0 80px #a78bfa; }
  7% { opacity: 0.7; text-shadow: 0 0 6px #f87171; }
  8% { opacity: 1; text-shadow: 0 0 10px #a78bfa, 0 0 20px #a78bfa, 0 0 40px #a78bfa, 0 0 80px #a78bfa; }
  50% { opacity: 0.95; text-shadow: 0 0 10px #a78bfa, 0 0 20px #a78bfa, 0 0 40px #a78bfa; }
  52% { opacity: 0.6; text-shadow: 0 0 4px #f87171; }
  54% { opacity: 1; text-shadow: 0 0 10px #a78bfa, 0 0 20px #a78bfa, 0 0 40px #a78bfa, 0 0 80px #a78bfa; }
}
@keyframes glitchShift {
  0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
  10% { clip-path: inset(20% 0 60% 0); transform: translate(-3px, 0); }
  20% { clip-path: inset(50% 0 20% 0); transform: translate(3px, 0); }
  30% { clip-path: inset(10% 0 80% 0); transform: translate(-2px, 0); }
  40% { clip-path: inset(70% 0 5% 0); transform: translate(2px, 0); }
  50% { clip-path: inset(30% 0 40% 0); transform: translate(-3px, 0); }
  60% { clip-path: inset(60% 0 10% 0); transform: translate(1px, 0); }
  70% { clip-path: inset(15% 0 70% 0); transform: translate(-1px, 0); }
  80% { clip-path: inset(45% 0 30% 0); transform: translate(2px, 0); }
  90% { clip-path: inset(5% 0 85% 0); transform: translate(-2px, 0); }
}
@keyframes glitchTextFlicker {
  0%, 100% { opacity: 0.3; transform: translateX(0); }
  25% { opacity: 0.6; transform: translateX(2px); }
  50% { opacity: 0.15; transform: translateX(-2px); }
  75% { opacity: 0.5; transform: translateX(1px); }
}
@keyframes pixelFloat {
  0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.4; }
  25% { transform: translate(8px, -12px) rotate(90deg); opacity: 0.8; }
  50% { transform: translate(-6px, -20px) rotate(180deg); opacity: 0.3; }
  75% { transform: translate(10px, -8px) rotate(270deg); opacity: 0.6; }
}
@keyframes screenShake {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-1px, 1px); }
  50% { transform: translate(1px, -1px); }
  75% { transform: translate(-1px, -1px); }
}
@keyframes scanlineSweep {
  0% { top: -10%; }
  100% { top: 110%; }
}
`

// ── 装饰性碎像素/星星 ──
const DECORATIONS = [
  { char: '*', top: '12%', left: '18%', size: 16, color: '#a78bfa', delay: '0s' },
  { char: '✦', top: '20%', left: '82%', size: 14, color: '#F5A623', delay: '0.5s' },
  { char: '·', top: '68%', left: '15%', size: 20, color: '#f87171', delay: '1s' },
  { char: '✧', top: '75%', left: '85%', size: 18, color: '#a78bfa', delay: '1.5s' },
  { char: '*', top: '35%', left: '8%', size: 12, color: '#4ade80', delay: '0.3s' },
  { char: '✦', top: '60%', left: '92%', size: 13, color: '#60a5fa', delay: '0.8s' },
  { char: '·', top: '15%', left: '50%', size: 22, color: '#f472b6', delay: '1.2s' },
  { char: '✧', top: '85%', left: '48%', size: 15, color: '#F5A623', delay: '0.6s' },
  { char: '*', top: '45%', left: '88%', size: 11, color: '#a78bfa', delay: '1.8s' },
  { char: '✦', top: '28%', left: '30%', size: 13, color: '#4ade80', delay: '2s' },
  { char: '·', top: '82%', left: '25%', size: 17, color: '#60a5fa', delay: '1.4s' },
  { char: '✧', top: '50%', left: '75%', size: 14, color: '#f87171', delay: '0.9s' },
]

export default function ErrorPage({ errorCode = 404 }) {
  const { dispatch } = useContext(AppContext)
  const [glitchIndex, setGlitchIndex] = useState(0)

  const config = ERROR_CONFIG[errorCode] || ERROR_CONFIG[404]

  const go = useCallback((step) => {
    dispatch({ type: 'SET_STEP', payload: step })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  // 随机切换故障文字
  useEffect(() => {
    const timer = setInterval(() => {
      setGlitchIndex((prev) => (prev + 1) % config.glitchTexts.length)
    }, 1800)
    return () => clearInterval(timer)
  }, [config.glitchTexts.length])

  return html`
    <div class="brand-page-root" style=${{ background: C.bg, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <!-- 注入故障特效 CSS -->
      <style>${GLITCH_CSS}</style>

      <${NavBar} />

      <!-- ═══ 全屏居中错误展示 ═══ -->
      <div class="flex flex-col items-center justify-center"
           style=${{ minHeight: 'calc(100vh - 64px)', padding: '40px 20px', position: 'relative' }}>

        <!-- 装饰碎像素/星星 -->
        ${DECORATIONS.map((d, i) => html`
          <span key=${i}
            style=${{
              position: 'absolute',
              top: d.top,
              left: d.left,
              fontSize: `${d.size}px`,
              color: d.color,
              opacity: 0.5,
              pointerEvents: 'none',
              animation: `pixelFloat 4s ease-in-out ${d.delay} infinite`,
              textShadow: `0 0 8px ${d.color}`,
              zIndex: 0,
            }}>
            ${d.char}
          </span>
        `)}

        <!-- CRT 扫描线覆盖层 -->
        <div style=${{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(167,139,250,0.03) 2px, rgba(167,139,250,0.03) 4px)',
          zIndex: 1,
        }}></div>

        <!-- 移动扫描线 -->
        <div style=${{
          position: 'absolute',
          left: 0, right: 0, height: '120px',
          background: 'linear-gradient(180deg, transparent, rgba(167,139,250,0.06), transparent)',
          pointerEvents: 'none',
          animation: 'scanlineSweep 6s linear infinite',
          zIndex: 1,
        }}></div>

        <!-- 核心内容 -->
        <div class="relative text-center" style=${{ zIndex: 2, animation: 'screenShake 0.15s infinite' }}>

          <!-- 错误码 -->
          <div style=${{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
            <!-- 故障层 - 红色偏移 -->
            <div style=${{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              fontSize: 'clamp(80px, 18vw, 200px)',
              fontWeight: 900,
              color: '#f87171',
              opacity: 0.7,
              animation: 'glitchShift 2.5s infinite linear alternate',
              mixBlendMode: 'screen',
              pointerEvents: 'none',
              letterSpacing: '-0.05em',
            }}>${config.code}</div>
            <!-- 故障层 - 青色偏移 -->
            <div style=${{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              fontSize: 'clamp(80px, 18vw, 200px)',
              fontWeight: 900,
              color: '#60a5fa',
              opacity: 0.7,
              animation: 'glitchShift 2s infinite linear alternate-reverse',
              mixBlendMode: 'screen',
              pointerEvents: 'none',
              letterSpacing: '-0.05em',
            }}>${config.code}</div>
            <!-- 主文字层 + 霓虹闪烁 -->
            <h1 style=${{
              position: 'relative',
              fontSize: 'clamp(80px, 18vw, 200px)',
              fontWeight: 900,
              color: C.text,
              margin: 0,
              letterSpacing: '-0.05em',
              animation: 'neonFlicker 3s infinite',
              lineHeight: 1,
            }}>${config.code}</h1>
          </div>

          <!-- Emoji -->
          <div style=${{
            fontSize: '48px',
            marginBottom: '16px',
            animation: 'pixelFloat 3s ease-in-out infinite',
          }}>
            ${config.emoji}
          </div>

          <!-- 中文标题 -->
          <h2 style=${{
            fontSize: 'clamp(24px, 5vw, 40px)',
            fontWeight: 800,
            color: C.text,
            margin: '0 0 16px 0',
            letterSpacing: '0.02em',
          }}>
            ${config.title}
          </h2>

          <!-- 描述 -->
          <p style=${{
            fontSize: '15px',
            color: C.textMuted,
            maxWidth: '440px',
            margin: '0 auto 32px',
            lineHeight: 1.7,
          }}>
            ${config.desc}
          </p>

          <!-- 故障文字效果 -->
          <div style=${{
            marginBottom: '36px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px',
            letterSpacing: '0.15em',
            color: C.danger,
            animation: 'glitchTextFlicker 1.2s infinite',
            minHeight: '20px',
          }}>
            &gt; ${config.glitchTexts[glitchIndex]}_
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center justify-center gap-3 flex-wrap">
            <button
              style=${{
                padding: '12px 28px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 700,
                background: C.accent,
                color: '#1a0f3d',
                border: 'none',
                cursor: 'pointer',
                boxShadow: `0 4px 24px ${C.accent}40`,
                transition: 'all 0.2s',
              }}
              onMouseEnter=${(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = `0 8px 32px ${C.accent}60` }}
              onMouseLeave=${(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 4px 24px ${C.accent}40` }}
              onClick=${() => go(STEPS.LANDING)}>
              回到首页
            </button>
            <button
              style=${{
                padding: '12px 28px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 700,
                background: 'rgba(167,139,250,0.1)',
                color: C.primary,
                border: `1px solid ${C.primary}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter=${(e) => { e.target.style.background = 'rgba(167,139,250,0.2)'; e.target.style.transform = 'translateY(-2px)' }}
              onMouseLeave=${(e) => { e.target.style.background = 'rgba(167,139,250,0.1)'; e.target.style.transform = 'translateY(0)' }}
              onClick=${() => go(STEPS.COMMUNITY)}>
              去社区逛逛
            </button>
          </div>
        </div>
      </div>

      <!-- ═══ 底部联系入口 ═══ -->
      <footer style=${{
        borderTop: `1px solid ${C.border}`,
        padding: '24px 20px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
      }}>
        <p style=${{ fontSize: '13px', color: C.textDim, margin: 0 }}>
          遇到了麻烦？
          <button
            style=${{
              color: C.accent,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'underline',
              textDecorationStyle: 'dotted',
            }}
            onMouseEnter=${(e) => { e.target.style.color = '#fbbf24' }}
            onMouseLeave=${(e) => { e.target.style.color = C.accent }}
            onClick=${() => go(STEPS.FEEDBACK)}>
            反馈给我们
          </button>
          <span style=${{ marginLeft: '8px' }}>·</span>
          <span style=${{ marginLeft: '8px' }}>© 2026 知识不进脑子啊</span>
        </p>
      </footer>
    </div>
  `
}
