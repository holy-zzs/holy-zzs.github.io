// RoundtableDemo.js — 复古未来主义 CRT 显示器内的 AI 智能体圆桌会谈
import { html, useState, useEffect, useRef, useCallback } from '../../deps.js'

// ── 智能体定义 ──
const AGENTS = [
  {
    id: 'scholar', name: '学神本神', role: '知识拆解',
    avatar: '/src/assets/agent-scholar.jpg',
    color: '#a78bfa', glow: 'rgba(167,139,250,0.6)',
    pos: { top: '8%', left: '50%', transform: 'translateX(-50%)' }
  },
  {
    id: 'writer', name: '戏精编剧', role: '叙事设计',
    avatar: '/src/assets/agent-writer.jpg',
    color: '#fbbf24', glow: 'rgba(251,191,36,0.6)',
    pos: { top: '50%', left: '8%', transform: 'translateY(-50%)' }
  },
  {
    id: 'designer', name: '颜值正义官', role: '美术指导',
    avatar: '/src/assets/agent-designer.jpg',
    color: '#f472b6', glow: 'rgba(244,114,182,0.6)',
    pos: { top: '50%', right: '8%', transform: 'translateY(-50%)' }
  },
  {
    id: 'tester', name: '破防体验官', role: '体验评估',
    avatar: '/src/assets/agent-tester.jpg',
    color: '#4ade80', glow: 'rgba(74,222,128,0.6)',
    pos: { bottom: '20%', left: '50%', transform: 'translateX(-50%)' }
  },
]

// ── 协作脚本 ──
const SCRIPT = [
  { agent: 0, text: '检测到核心知识点：牛顿第三定律。建议拆分为5个递进关卡。' },
  { agent: 1, text: '剧情框架：玩家驾驶飞船，利用反作用力穿越小行星带！' },
  { agent: 2, text: '视觉方案：复古像素风星空 + 霓虹色飞船，氛围拉满。' },
  { agent: 3, text: '体验报告：前3关难度偏低，建议第4关加入引力弹弓机制。' },
  { agent: 0, text: '已重新编排知识图谱，公式推导拆入关卡4-5。' },
  { agent: 1, text: '完美！玩家每解锁一个公式就能推进星图，上头了！' },
]

export default function RoundtableDemo() {
  const [scriptIdx, setScriptIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [phase, setPhase] = useState('typing') // typing | display | pause
  const timerRef = useRef(null)

  const currentLine = SCRIPT[scriptIdx]
  const currentAgent = AGENTS[currentLine.agent]
  const fullText = currentLine.text

  // 打字机效果
  useEffect(() => {
    if (phase === 'typing') {
      if (charIdx < fullText.length) {
        timerRef.current = setTimeout(() => setCharIdx(c => c + 1), 45)
      } else {
        setPhase('display')
      }
    } else if (phase === 'display') {
      timerRef.current = setTimeout(() => setPhase('pause'), 1800)
    } else if (phase === 'pause') {
      setScriptIdx(i => (i + 1) % SCRIPT.length)
      setCharIdx(0)
      setPhase('typing')
    }
    return () => clearTimeout(timerRef.current)
  }, [phase, charIdx, fullText])

  const displayedText = fullText.slice(0, charIdx)
  const showCursor = phase === 'typing'

  return html`
    <div class="crt-monitor">
      <!-- 显示器边框 -->
      <div class="crt-bezel">
        <!-- 屏幕 -->
        <div class="crt-screen">
          <!-- 星空背景 -->
          <div class="crt-stars">
            ${Array.from({ length: 30 }).map((_, i) => {
              const x = (i * 37) % 100
              const y = (i * 53) % 100
              const d = (i % 3) + 2
              return html`<div key=${i} class="crt-star" style=${{
                left: `${x}%`, top: `${y}%`,
                width: `${d}px`, height: `${d}px`,
                animationDelay: `${(i % 5) * 0.6}s`
              }}></div>`
            })}
          </div>

          <!-- 透视网格地面 -->
          <div class="crt-grid-floor"></div>

          <!-- 中心全息桌面 -->
          <div class="crt-holo-table">
            <div class="crt-holo-ring crt-holo-ring-1"></div>
            <div class="crt-holo-ring crt-holo-ring-2"></div>
            <div class="crt-holo-core">
              <span style=${{ fontSize: '1.5rem' }}>🌀</span>
            </div>
          </div>

          <!-- 智能体头像 -->
          ${AGENTS.map((agent, i) => {
            const isActive = i === currentLine.agent
            const showBubble = isActive && charIdx > 0
            return html`
              <div key=${agent.id} class="crt-agent" style=${{ ...agent.pos }}>
                <!-- 语音气泡 -->
                ${showBubble ? html`
                  <div class=${`crt-bubble ${agent.id === 'tester' || agent.id === 'scholar' ? 'crt-bubble-up' : ''}`}
                       style=${{ borderColor: agent.color, boxShadow: `0 0 16px ${agent.glow}` }}>
                    <div class="crt-bubble-text" style=${{ color: agent.color }}>
                      ${displayedText}${showCursor ? html`<span class="crt-cursor">▊</span>` : null}
                    </div>
                  </div>
                ` : null}

                <!-- 头像 -->
                <div class=${`crt-avatar-wrap ${isActive ? 'crt-avatar-active' : ''}`}
                     style=${isActive ? {
                       boxShadow: `0 0 20px ${agent.glow}, 0 0 40px ${agent.glow}`,
                       borderColor: agent.color
                     } : {}}>
                  <img src=${agent.avatar} alt=${agent.name} class="crt-avatar-img" />
                  ${isActive ? html`<div class="crt-avatar-pulse" style=${{ borderColor: agent.color }}></div>` : null}
                </div>

                <!-- 名牌 -->
                <div class="crt-nameplate" style=${{ borderColor: isActive ? agent.color : 'rgba(255,255,255,0.1)' }}>
                  <span style=${{ color: isActive ? agent.color : 'rgba(255,255,255,0.4)' }}>${agent.name}</span>
                  <span class="crt-nameplate-role">${agent.role}</span>
                </div>
              </div>
            `
          })}

          <!-- 扫描线 -->
          <div class="crt-scanlines"></div>

          <!-- 状态栏 -->
          <div class="crt-statusbar">
            <div class="crt-status-left">
              <span class="crt-status-dot"></span>
              <span class="crt-status-text">MULTI_AGENT_COLLABORATION</span>
              <span class="crt-status-sep">//</span>
              <span class="crt-status-text">SESSION_${String(scriptIdx + 1).padStart(2, '0')}/${String(SCRIPT.length).padStart(2, '0')}</span>
            </div>
            <div class="crt-status-right">
              <span class="crt-status-text" style=${{ color: currentAgent.color }}>
                ▸ ${currentAgent.name} ${phase === 'typing' ? '传输中' : phase === 'display' ? '已确认' : '切换中'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 显示器底座 -->
      <div class="crt-stand">
        <div class="crt-stand-neck"></div>
        <div class="crt-stand-base"></div>
      </div>
    </div>
  `
}
