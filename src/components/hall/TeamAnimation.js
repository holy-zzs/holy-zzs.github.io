// 团队协作动画 v3.0：AI 圆桌讨论 + 思维连线粒子 + NPC微表情互动
// 升级五：悬停交互、点击对话、情绪系统、空闲状态
import { html, useEffect, useRef, useState, useCallback } from '../../react.js'
import { useHall } from './GameHall.js'
import { useApp, STEPS } from '../../store/appContext.js'
import { getAgents, DEFAULT_TEAM, getAgent } from '../../data/agents.js'
import { audio } from '../../lib/audio.js'

const DIALOGUE = [
  { agent: 'captain', text: '嗯…检测到知识结构清晰，适合做成探索解谜游戏。' },
  { agent: 'scholar', text: '核心概念密度中等，建议分3个难度阶梯。' },
  { agent: 'designer', text: '深空背景配荧光UI，关键公式用全息投影。' },
  { agent: 'experience', text: '每个关卡加提示系统，确保新手不卡关。' },
  { agent: 'captain', text: '方案已生成！你的游戏原型准备好了。' }
]

// 智能体微表情动作库
const HOVER_ACTIONS = {
  captain: { emoji: '🎩', action: '推了推帽子', tip: '稳住，一切尽在掌握' },
  scholar: { emoji: '👓', action: '推了推眼镜', tip: '你知道吗？知识图谱有八个维度…' },
  designer: { emoji: '🎨', action: '挥了挥画笔', tip: '色彩心理学：紫色激发创造力' },
  storyteller: { emoji: '✨', action: '挥动魔杖', tip: '从前有一个公式，它决定去冒险…' },
  experiment: { emoji: '🧪', action: '摇晃试管', tip: '实践出真知——试错是最好的老师' },
  numbers: { emoji: '🔢', action: '敲了敲算盘', tip: '数据不会说谎，但会讲故事' },
  sound: { emoji: '🎵', action: '调了调音叉', tip: 'BPM 120 是最佳学习节奏' },
  experience: { emoji: '🎯', action: '转了转飞镖', tip: '心流状态 = 难度匹配技能 + 即时反馈' }
}

// 点击对话库
const CLICK_LINES = [
  '你准备好创造游戏了吗？',
  '把你的教材丢进黑洞，我们就能开工了！',
  '知识 + 游戏 = 上瘾学习法',
  '嘿！我在等你呢，来试试？',
  '别犹豫了，知识不会自己进脑子'
]

// 空闲状态库
const IDLE_STATES = [
  { emoji: '📖', text: '正在翻阅资料…' },
  { emoji: '😴', text: 'zzZ…（打瞌睡中）' },
  { emoji: '💬', text: '（小声和旁边讨论）' },
  { emoji: '🤔', text: '思考人生中…' }
]

// 空闲小贴士（随机显示）
const IDLE_TIPS = [
  '知识不进脑子？试试变成游戏！',
  '左边的黑洞可以拖入教材哦',
  '试试输入你想学的主题',
  '每个智能体都有不同的特长',
  '点击我试试看？'
]

export default function TeamAnimation() {
  const { goStep } = useHall()
  const { state, STEPS: APP_STEPS } = useApp()
  const canvasRef = useRef(null)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [round, setRound] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState(-1)
  const [hoverTip, setHoverTip] = useState('')
  const [clickMsg, setClickMsg] = useState(null)
  const [idleState, setIdleState] = useState(0)
  const [idleTip, setIdleTip] = useState('')
  const [mood, setMood] = useState('normal') // normal | cheerful | sleepy
  const rafRef = useRef(null)
  const idleTimerRef = useRef(null)
  const lastInteractionRef = useRef(Date.now())

  const team = getAgents(DEFAULT_TEAM)

  // 情绪系统：如果用户上传了教材，团队变欢快
  useEffect(() => {
    if (state.material) {
      setMood('cheerful')
    }
  }, [state.material])

  // 空闲检测：10秒无交互进入空闲状态
  useEffect(() => {
    const checkIdle = setInterval(() => {
      const elapsed = Date.now() - lastInteractionRef.current
      if (elapsed > 10000 && mood !== 'cheerful') {
        setMood('sleepy')
        setIdleState(Math.floor(Math.random() * IDLE_STATES.length))
        if (Math.random() < 0.3) {
          setIdleTip(IDLE_TIPS[Math.floor(Math.random() * IDLE_TIPS.length)])
          audio.whisper(Math.random() * 2 - 1)
        }
      }
    }, 5000)
    return () => clearInterval(checkIdle)
  }, [mood])

  const recordInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now()
    if (mood !== 'normal') setMood('normal')
  }, [mood])

  // 打字机效果 + 轮播
  useEffect(() => {
    if (!started) return
    let idx = 0
    let charIdx = 0
    let timer

    const next = () => {
      if (idx >= DIALOGUE.length) {
        setRound(r => r + 1)
        idx = 0
      }
      const line = DIALOGUE[idx]
      setActiveIdx(idx)
      charIdx = 0
      setDisplayed('')

      const typeChar = () => {
        if (charIdx < line.text.length) {
          charIdx++
          setDisplayed(line.text.slice(0, charIdx))
          timer = setTimeout(typeChar, 40 + Math.random() * 30)
        } else {
          audio.sfx('click')
          audio.whisper(idx * 0.3 - 0.3)
          timer = setTimeout(() => {
            idx++
            next()
          }, 1800)
        }
      }
      typeChar()
    }

    timer = setTimeout(next, 500)
    return () => clearTimeout(timer)
  }, [started, round])

  // 思维连线粒子
  useEffect(() => {
    if (!started) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width = canvas.offsetWidth
    const H = canvas.height = canvas.offsetHeight
    const cx = W / 2, cy = H / 2
    const radius = Math.min(W, H) * 0.32

    const positions = team.map((_, i) => {
      const angle = (i / team.length) * Math.PI * 2 - Math.PI / 2
      return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius }
    })

    const particles = []
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        for (let k = 0; k < 6; k++) {
          particles.push({
            from: i, to: j,
            t: Math.random(),
            speed: 0.003 + Math.random() * 0.004,
            hue: 270 + Math.random() * 80
          })
        }
      }
    }

    let raf
    function draw() {
      ctx.clearRect(0, 0, W, H)

      // 连线（欢快模式更亮）
      const lineAlpha = mood === 'cheerful' ? 0.25 : mood === 'sleepy' ? 0.05 : 0.15
      positions.forEach((p1, i) => {
        positions.forEach((p2, j) => {
          if (j <= i) return
          const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
          grad.addColorStop(0, `rgba(217,70,239,${lineAlpha * 0.7})`)
          grad.addColorStop(0.5, `rgba(69,226,154,${lineAlpha})`)
          grad.addColorStop(1, `rgba(217,70,239,${lineAlpha * 0.7})`)
          ctx.strokeStyle = grad
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        })
      })

      // 粒子流动（欢快模式更快）
      const speedMul = mood === 'cheerful' ? 2 : mood === 'sleepy' ? 0.3 : 1
      particles.forEach(p => {
        p.t += p.speed * speedMul
        if (p.t > 1) p.t = 0
        const from = positions[p.from]
        const to = positions[p.to]
        const x = from.x + (to.x - from.x) * p.t
        const y = from.y + (to.y - from.y) * p.t

        ctx.save()
        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${0.8 * (mood === 'sleepy' ? 0.3 : 1)})`
        ctx.shadowBlur = 8
        ctx.shadowColor = `hsl(${p.hue}, 80%, 65%)`
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [started, team, mood])

  const startShow = () => {
    audio.sfx('click')
    recordInteraction()
    setStarted(true)
  }

  const joinTeam = () => {
    audio.sfx('click')
    recordInteraction()
    goStep(STEPS.PRESET)
  }

  // 悬停智能体
  const onAgentHover = (idx) => {
    recordInteraction()
    setHoveredIdx(idx)
    const agent = team[idx]
    const action = HOVER_ACTIONS[agent.id] || HOVER_ACTIONS.captain
    setHoverTip(action.tip)
    audio.whisper(idx * 0.3 - 0.3)
  }

  const onAgentLeave = () => {
    setHoveredIdx(-1)
    setHoverTip('')
  }

  // 点击智能体
  const onAgentClick = (agent) => {
    recordInteraction()
    const line = CLICK_LINES[Math.floor(Math.random() * CLICK_LINES.length)]
    setClickMsg({ agent, line })
    audio.sfx('coin')
    if (navigator.vibrate) navigator.vibrate(10)
    setTimeout(() => setClickMsg(null), 2500)
  }

  const activeAgent = activeIdx >= 0 ? team[activeIdx] : null
  const hoveredAgent = hoveredIdx >= 0 ? team[hoveredIdx] : null

  return html`
    <div className="max-w-4xl mx-auto" onMouseMove=${recordInteraction} onClick=${recordInteraction}>
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-3" style=${{ fontFamily: 'Orbitron, sans-serif' }}>
          AI 圆桌讨论
        </h2>
        <p className="text-sm text-purple-300">
          ${mood === 'cheerful' ? '🎉 团队已就位，教材分析完毕！' : mood === 'sleepy' ? '😴 团队在打瞌睡… 试试和它们互动？' : '四个智能体为你的知识吵出最佳方案'}
        </p>
      </div>

      ${!started ? html`
        <div className="text-center py-20">
          <div className="text-6xl mb-6 animate-float">${mood === 'sleepy' ? '😴' : '🤖'}</div>
          ${idleTip && html`<div className="text-xs text-bio-400 mb-4 animate-fade-in">${idleTip}</div>`}
          <button onClick=${startShow}
            className="px-8 py-3 rounded-full text-sm font-bold text-white neon-border hover:scale-105 transition-all"
            style=${{ background: 'rgba(20,10,53,0.6)' }}>
            ▶️ 观看 AI 团队协作
          </button>
        </div>
      ` : html`
        <div className="relative" style=${{ height: '400px' }}>
          {/* 连线画布 */}
          <canvas ref=${canvasRef} className="absolute inset-0 w-full h-full"></canvas>

          {/* 角色头像 */}
          <div className="absolute inset-0">
            ${team.map((agent, i) => {
              const angle = (i / team.length) * 360 - 90
              const isActive = activeIdx === i
              const isHovered = hoveredIdx === i
              const action = HOVER_ACTIONS[agent.id] || HOVER_ACTIONS.captain
              return html`
                <div key=${agent.id}
                  className="absolute" style=${{
                    left: '50%', top: '50%',
                    transform: `rotate(${angle}deg) translate(140px) rotate(${-angle}deg) translate(-50%, -50%)`
                  }}>
                  <div className="relative flex flex-col items-center gap-2 cursor-pointer transition-all duration-300"
                    onMouseEnter=${() => onAgentHover(i)}
                    onMouseLeave=${onAgentLeave}
                    onClick=${() => onAgentClick(agent)}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all relative"
                      style=${{
                        background: isActive || isHovered ? `linear-gradient(135deg, ${agent.color}, ${agent.color}88)` : 'rgba(20,10,53,0.8)',
                        border: `2px solid ${isActive || isHovered ? agent.color : 'rgba(217,70,239,0.2)'}`,
                        boxShadow: isActive || isHovered ? `0 0 30px ${agent.color}88` : 'none',
                        backdropFilter: 'blur(10px)',
                        transform: isHovered ? 'scale(1.15) translateY(-4px)' : isActive ? 'scale(1.2)' : 'scale(1)'
                      }}>
                      ${agent.emoji}
                      {/* 悬停动作气泡 */}
                      ${isHovered && html`
                        <div className="absolute -top-2 -right-2 text-lg animate-fade-in" style=${{ animation: 'floatUp 0.3s ease-out' }}>
                          ${action.emoji}
                        </div>
                      `}
                      {/* 空闲状态表情 */}
                      ${mood === 'sleepy' && !isActive && !isHovered && html`
                        <div className="absolute -bottom-1 -right-1 text-xs">${IDLE_STATES[idleState].emoji}</div>
                      `}
                      {/* 欢快状态光圈 */}
                      ${mood === 'cheerful' && html`
                        <div className="absolute inset-0 rounded-full animate-pulse" style=${{ border: `2px solid ${agent.color}44` }}></div>
                      `}
                    </div>
                    <span className="text-xs text-purple-200 font-medium whitespace-nowrap">${agent.name}</span>
                    {/* 悬停动作文字 */}
                    ${isHovered && html`
                      <div className="absolute top-full mt-1 text-[10px] text-purple-300 whitespace-nowrap animate-fade-in">
                        ${action.action}
                      </div>
                    `}
                  </div>
                </div>
              `
            })}
          </div>

          {/* 中央对话气泡 */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 text-center">
            ${clickMsg ? html`
              <div className="glass-dark rounded-2xl p-4 animate-fade-in" style=${{ borderColor: clickMsg.agent.color + '66' }}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-lg">${clickMsg.agent.emoji}</span>
                  <span className="text-xs font-bold" style=${{ color: clickMsg.agent.color }}>${clickMsg.agent.name}</span>
                </div>
                <p className="text-sm text-white leading-relaxed">${clickMsg.line}</p>
              </div>
            ` : activeAgent ? html`
              <div className="glass-dark rounded-2xl p-4 animate-fade-in" style=${{ borderColor: activeAgent.color + '44' }}>
                <div className="text-xs text-purple-300 mb-1">${activeAgent.name}</div>
                <p className="text-sm text-white leading-relaxed">${displayed}<span className="animate-typing">▊</span></p>
              </div>
            ` : html`
              <div className="text-purple-400 text-sm">${mood === 'sleepy' ? '…（安静中）' : '讨论即将开始…'}</div>
            `}
          </div>

          {/* 悬停小贴士 */}
          ${hoverTip && hoveredAgent && html`
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 glass-dark rounded-full px-4 py-2 text-xs text-bio-400 animate-fade-in"
              style=${{ maxWidth: '300px' }}>
              💡 ${hoverTip}
            </div>
          `}

          {/* 空闲状态提示 */}
          ${mood === 'sleepy' && idleTip && html`
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] text-purple-400/60 animate-fade-in">
              ${idleTip}
            </div>
          `}
        </div>

        <div className="text-center mt-8">
          <button onClick=${joinTeam}
            className="text-sm text-bio-400 hover:text-white transition-all">
            想自己组队？来这里选智能体 →
          </button>
        </div>
      `}
    </div>
  `
}
