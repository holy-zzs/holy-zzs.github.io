// 加载动画 v3.0：动态个性欢迎仪式（时间感知 + 场景切换）
// 深夜(22-6)：深蓝夜色 + 台灯 + 趴桌学生 + 大脑敲屏
// 工作日白天：咖啡馆氛围 + 阳光 + 书本翻开
// 周末：彩虹色 + 派对气球 + 大脑派对帽
import { html, useEffect, useRef, useState, useMemo } from '../../react.js'
import { audio } from '../../lib/audio.js'

// 时间段检测
function getTimeContext() {
  const now = new Date()
  const hour = now.getHours()
  const isWeekend = now.getDay() === 0 || now.getDay() === 6
  const isLateNight = hour >= 22 || hour < 6

  if (isLateNight) return 'night'
  if (isWeekend) return 'weekend'
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  return 'evening'
}

// 各时段场景配置
const SCENES = {
  night: {
    bg: 'linear-gradient(135deg, #0a0a2e 0%, #16213e 40%, #0f3460 100%)',
    bgParticle: '#4a90d9',
    centerEmoji: '🧠',
    centerAction: '敲了敲屏幕',
    greeting: '这么晚还在学习？',
    subGreeting: '让我帮你把这本书变成一场梦吧…',
    brainDialogue: 'zzZ… 嗯？你来了？让我把知识变成梦境冒险吧',
    stages: ['唤醒夜班智能体…', '调暗星光…', '编织梦境关卡…', '准备梦游'],
    accentColor: '#4a90d9',
    glowColor: 'rgba(74,144,217,0.3)',
    studentEmoji: '😴'
  },
  morning: {
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
    bgParticle: '#FFD700',
    centerEmoji: '🧠',
    centerAction: '伸了个懒腰',
    greeting: '早安！新的一天，',
    subGreeting: '让知识像咖啡一样提神醒脑',
    brainDialogue: '元气满满！把教材丢进来，AI团队已经就位了',
    stages: ['唤醒智能体…', '冲泡知识浓缩…', '校准黑洞引力场…', '准备就绪'],
    accentColor: '#FFD700',
    glowColor: 'rgba(255,215,0,0.25)',
    studentEmoji: '☕'
  },
  afternoon: {
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
    bgParticle: '#45E29A',
    centerEmoji: '🧠',
    centerAction: '翻了翻书',
    greeting: '下午好！',
    subGreeting: '学不进去？让游戏帮你把知识吞进去',
    brainDialogue: '下午茶时间到！来一颗知识胶囊怎么样？',
    stages: ['唤醒智能体…', '校准黑洞引力场…', '连接社区节点…', '准备就绪'],
    accentColor: '#45E29A',
    glowColor: 'rgba(69,226,154,0.25)',
    studentEmoji: '📖'
  },
  evening: {
    bg: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 40%, #1a1a2e 100%)',
    bgParticle: '#d946ef',
    centerEmoji: '🧠',
    centerAction: '点了点头',
    greeting: '晚上好！',
    subGreeting: '夜幕降临，是时候把枯燥变成上头了',
    brainDialogue: '晚上的学习效率最高！来吧，把教材变成游戏',
    stages: ['唤醒智能体…', '校准黑洞引力场…', '连接社区节点…', '准备就绪'],
    accentColor: '#d946ef',
    glowColor: 'rgba(217,70,239,0.25)',
    studentEmoji: '🌆'
  },
  weekend: {
    bg: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 30%, #1a1a2e 70%, #0a2e1a 100%)',
    bgParticle: '#FFD700',
    centerEmoji: '🧠',
    centerAction: '戴上了派对帽',
    greeting: '周末愉快！',
    subGreeting: '休息日？刚好，学习可以像游戏一样上瘾！',
    brainDialogue: '周末就该玩着学！派对模式已启动，知识胶囊发射准备！',
    stages: ['启动派对模式…', '唤醒智能体…', '布置气球装饰…', '派对开始！'],
    accentColor: '#FFD700',
    glowColor: 'rgba(255,215,0,0.3)',
    studentEmoji: '🎉'
  }
}

export default function LoadingScreen({ onDone }) {
  const canvasRef = useRef(null)
  const [stage, setStage] = useState(0)
  const [skipHover, setSkipHover] = useState(false)
  const [showGreeting, setShowGreeting] = useState(false)

  // 时间场景（只在挂载时计算一次）
  const scene = useMemo(() => SCENES[getTimeContext()] || SCENES.evening, [])

  useEffect(() => {
    // 延迟显示问候语
    const greetTimer = setTimeout(() => setShowGreeting(true), 600)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width = window.innerWidth
    const H = canvas.height = window.innerHeight

    // 粒子从四方向中心汇聚
    const particles = []
    const cx = W / 2, cy = H / 2
    const count = 120
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const dist = Math.max(W, H) * 0.6
      particles.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        tx: cx + Math.cos(angle) * (60 + Math.random() * 40),
        ty: cy + Math.sin(angle) * (40 + Math.random() * 30),
        size: Math.random() * 3 + 1,
        hue: parseInt(scene.bgParticle.replace('#', ''), 16),
        alpha: 0,
        delay: Math.random() * 0.3
      })
    }

    let raf
    let start = performance.now()
    const duration = 2000

    function animate(now) {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)

      ctx.fillStyle = 'rgba(5,1,15,0.15)'
      ctx.fillRect(0, 0, W, H)

      // 大脑轮廓发光（中心）
      const brainScale = 0.3 + ease * 0.7
      const brainAlpha = ease
      ctx.save()
      ctx.translate(cx, cy)
      ctx.scale(brainScale, brainScale)
      ctx.globalAlpha = brainAlpha * 0.6
      ctx.fillStyle = scene.glowColor
      ctx.beginPath()
      ctx.arc(0, 0, 80, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = `rgba(${parseInt(scene.accentColor.slice(1, 3), 16)}, ${parseInt(scene.accentColor.slice(3, 5), 16)}, ${parseInt(scene.accentColor.slice(5, 7), 16)}, ${brainAlpha * 0.5})`
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.restore()

      // 大脑 emoji（周末加派对帽）
      ctx.save()
      ctx.globalAlpha = brainAlpha
      ctx.font = `${60 * brainScale}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(scene.centerEmoji, cx, cy)
      // 周末派对帽
      if (getTimeContext() === 'weekend') {
        ctx.font = `${30 * brainScale}px serif`
        ctx.fillText('🎩', cx, cy - 40 * brainScale)
      }
      ctx.restore()

      // 粒子汇聚
      particles.forEach((p, i) => {
        const localT = Math.max(0, Math.min(1, (t - p.delay) / (1 - p.delay)))
        const easeLocal = 1 - Math.pow(1 - localT, 2)
        p.x = cx + (p.x - cx) * (1 - easeLocal * 0.9)
        p.y = cy + (p.y - cy) * (1 - easeLocal * 0.9)
        p.alpha = easeLocal

        if (localT > 0.8) {
          const orbitT = (localT - 0.8) / 0.2
          const ang = orbitT * Math.PI * 2 + (i / count) * Math.PI * 2
          p.x = cx + Math.cos(ang) * (100 + Math.sin(now * 0.001 + i) * 20)
          p.y = cy + Math.sin(ang) * (80 + Math.cos(now * 0.001 + i) * 15)
        }

        ctx.save()
        ctx.globalAlpha = p.alpha * 0.8
        ctx.fillStyle = scene.bgParticle
        ctx.shadowBlur = 10
        ctx.shadowColor = scene.bgParticle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      if (t < 1) {
        raf = requestAnimationFrame(animate)
      } else {
        ctx.fillStyle = 'rgba(5,1,15,0.1)'
        ctx.fillRect(0, 0, W, H)
        cancelAnimationFrame(raf)
        audio.sfx('boot')
        setTimeout(() => onDone(), 200)
      }
    }

    raf = requestAnimationFrame(animate)

    // 进度文案
    const stageTimer = setInterval(() => {
      setStage(s => {
        if (s >= scene.stages.length - 1) { clearInterval(stageTimer); return s }
        return s + 1
      })
    }, 500)

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(stageTimer)
      clearTimeout(greetTimer)
    }
  }, [onDone, scene])

  const skip = () => {
    audio.sfx('click')
    onDone()
  }

  return html`
    <div className="fixed inset-0 z-50 flex items-center justify-center" style=${{ background: scene.bg }}>
      <canvas ref=${canvasRef} className="absolute inset-0"></canvas>

      {/* 问候语弹窗（时间感知） */}
      ${showGreeting && html`
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-20 text-center animate-fade-in" style=${{ animation: 'floatUp 0.6s ease-out' }}>
          <div className="text-4xl mb-3">${scene.studentEmoji}</div>
          <div className="glass-dark rounded-2xl px-6 py-3" style=${{ borderColor: scene.accentColor + '44' }}>
            <p className="text-sm font-bold" style=${{ color: scene.accentColor }}>${scene.greeting}</p>
            <p className="text-xs text-purple-200 mt-1">${scene.subGreeting}</p>
          </div>
        </div>
      `}

      <div className="relative z-10 text-center">
        <div className="text-5xl font-black mb-2 shimmer-text" style=${{ fontFamily: 'Orbitron, sans-serif' }}>
          知识不进脑子啊
        </div>
        <div className="text-xs text-purple-300 mb-1">
          ${scene.centerAction}…
        </div>
        <div className="text-sm tracking-widest mt-4" style=${{ color: scene.accentColor }}>
          ${scene.stages[stage]}
          <span className="animate-typing">▊</span>
        </div>
        <div className="mt-8 h-0.5 w-48 mx-auto bg-purple-900 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style=${{ width: `${((stage + 1) / scene.stages.length) * 100}%`, background: `linear-gradient(to right, ${scene.accentColor}, #45E29A)` }}></div>
        </div>
      </div>

      <button onClick=${skip}
        onMouseEnter=${() => setSkipHover(true)}
        onMouseLeave=${() => setSkipHover(false)}
        className="absolute bottom-8 right-8 text-xs text-purple-400 hover:text-white transition-all"
        style=${{ opacity: skipHover ? 1 : 0.5 }}>
        跳过 →
      </button>
    </div>
  `
}
