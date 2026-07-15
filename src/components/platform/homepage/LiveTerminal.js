import { html, useState, useEffect, useRef, useMemo } from '../../../deps.js'

/**
 * LiveTerminal — 实时终端流
 *
 * 设计细节:
 *   - 左侧垂直"进度尺"，显示当前处理深度
 *   - 终端窗口左上角显示实时系统负载 (CPU/GPU) 的模拟波形图
 *   - 底部带有"虚拟光标"闪烁动效
 *   - 语法高亮: 指令 #A855F7, 变量 #22D3EE, 注释 #475569
 */

const TERMINAL_LINES = [
  { type: 'cmd',    text: '> Booting AI Game Design System...' },
  { type: 'comment', text: '# Initializing agent modules...' },
  { type: 'success', text: '  [✓] 知识架构师 :: READY' },
  { type: 'success', text: '  [✓] 游戏设计师 :: READY' },
  { type: 'success', text: '  [✓] 视觉设计师 :: READY' },
  { type: 'success', text: '  [✓] 学习科学家 :: READY' },
  { type: 'cmd',    text: '> Analyzing input: "高中历史·近代史"' },
  { type: 'var',    text: '  parsing = true | events = 18 | characters = 12' },
  { type: 'comment', text: '# Generating game configuration...' },
  { type: 'var',    text: '  → game_type = "RPG"' },
  { type: 'var',    text: '  → levels = 8 | engine = "Phaser.js"' },
  { type: 'warn',   text: '  ⚠ Balancing difficulty curve...' },
  { type: 'success', text: '  ✅ Game config generated in 2.3s' },
  { type: 'cmd',    text: '> Deploying to CDN...' },
  { type: 'success', text: '  ✅ Live at https://play.knbjlz.com/r/3x8K' },
]

function Waveform() {
  const [bars, setBars] = useState(() =>
    Array.from({ length: 16 }, () => 20 + Math.random() * 60)
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setBars(prev => {
        const next = [...prev.slice(1)]
        next.push(15 + Math.random() * 70)
        return next
      })
    }, 300)
    return () => clearInterval(interval)
  }, [])

  return html`
    <div class="terminal-waveform" title="CPU / GPU Load">
      ${bars.map((h, i) => html`
        <div
          key=${i}
          class="terminal-waveform-bar"
          style=${{
            height: `${h}%`,
            background: h > 70 ? '#F59E0B' : i > 12 ? '#22D3EE' : '#8A5CF5',
          }}
        ></div>
      `)}
    </div>
  `
}

export default function LiveTerminal() {
  const [visibleLines, setVisibleLines] = useState(0)
  const [progress, setProgress] = useState(0)
  const scrollRef = useRef(null)

  // 逐行显示终端输出
  useEffect(() => {
    if (visibleLines >= TERMINAL_LINES.length) {
      // 循环重置
      const resetTimer = setTimeout(() => {
        setVisibleLines(0)
        setProgress(0)
      }, 4000)
      return () => clearTimeout(resetTimer)
    }

    const delay = 200 + Math.random() * 300
    const timer = setTimeout(() => {
      setVisibleLines(prev => prev + 1)
      setProgress(Math.round(((visibleLines + 1) / TERMINAL_LINES.length) * 100))
    }, delay)
    return () => clearTimeout(timer)
  }, [visibleLines])

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [visibleLines])

  const syntaxClass = (type) => {
    switch (type) {
      case 'cmd':     return 'terminal-syntax-cmd'
      case 'var':     return 'terminal-syntax-var'
      case 'comment': return 'terminal-syntax-comment'
      case 'success': return 'terminal-syntax-success'
      case 'warn':    return 'terminal-syntax-warn'
      default:        return ''
    }
  }

  return html`
    <div class="hero-terminal w-full max-w-3xl mx-auto">
      <!-- 终端头部 -->
      <div class="terminal-header">
        <div class="terminal-dots">
          <div class="terminal-dot" style=${{ background: '#FF5F57' }}></div>
          <div class="terminal-dot" style=${{ background: '#FEBC2E' }}></div>
          <div class="terminal-dot" style=${{ background: '#28C840' }}></div>
        </div>
        <div class="flex items-center gap-3">
          <${Waveform} />
          <span class="terminal-title">AI_ENGINE :: LIVE</span>
        </div>
      </div>

      <!-- 终端主体 -->
      <div class="terminal-body">
        <!-- 左侧进度尺 -->
        <div class="terminal-progress">
          <div class="terminal-progress-label">DEPTH</div>
          <div class="terminal-progress-bar">
            <div
              class="terminal-progress-fill"
              style=${{ height: `${progress}%` }}
            ></div>
          </div>
        </div>

        <!-- 终端内容 -->
        <div class="terminal-content" ref=${scrollRef}>
          ${TERMINAL_LINES.slice(0, visibleLines).map((line, i) => html`
            <div key=${i} class=${`terminal-line ${syntaxClass(line.type)}`}>
              ${line.text}
            </div>
          `)}
          ${visibleLines < TERMINAL_LINES.length ? html`
            <div class="terminal-line">
              <span class="terminal-cursor-blink"></span>
            </div>
          ` : html`
            <div class="terminal-line terminal-syntax-success">
              <span class="terminal-cursor-blink"></span>
            </div>
          `}
        </div>
      </div>
    </div>
  `
}
