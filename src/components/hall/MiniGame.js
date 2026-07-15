// 黑洞吞噬 · 知识接力 v3.0 —— 可玩小游戏
// 升级六：随机种子地图、幻影排行榜、学习弱点分析、无限重玩
import { html, useState, useEffect, useRef, useCallback } from '../../react.js'
import { useHall } from './GameHall.js'
import { useApp } from '../../store/appContext.js'
import { audio } from '../../lib/audio.js'

// 概念词库
const GOOD_CONCEPTS = ['公式', '定理', '定义', '证明', '推导', '例题', '概念', '原理', '推论', '逻辑', '归纳', '假设', '验证', '分析', '模型']
const BAD_CONCEPTS = ['抖音', '摸鱼', '打盹', '发呆', '刷剧', '走神', '摆烂', '拖延', '吃瓜', '白日梦']

const GAME_DURATION = 30000
const MAX_HEALTH = 3

// 幻影排行榜 mock 数据（看起来很真实）
const PHANTOM_LEADERBOARD = [
  { rank: 1, name: '量子猫', score: 847, avatar: '🐱' },
  { rank: 2, name: '牛顿的苹果', score: 723, avatar: '🍎' },
  { rank: 3, name: 'DNA解码者', score: 681, avatar: '🧬' },
  { rank: 4, name: '薛定谔的学霸', score: 599, avatar: '📦' },
  { rank: 5, name: '函数猎人', score: 534, avatar: '🎯' },
  { rank: 6, name: '元素大师', score: 489, avatar: '⚗️' },
  { rank: 7, name: '光合作用达人', score: 442, avatar: '🌿' },
  { rank: 8, name: '丝绸之路商队', score: 398, avatar: '🐫' },
  { rank: 9, name: '板块漂移者', score: 356, avatar: '🌍' },
  { rank: 10, name: '唐诗密室客', score: 312, avatar: '📜' }
]

// 学习弱点分析模板
const WEAKNESS_TEMPLATES = [
  { concept: '抖音', analysis: '注意力分散倾向明显，建议通过"太空交通管制员"游戏训练专注力', game: '太空交通管制员' },
  { concept: '摸鱼', analysis: '学习动力波动较大，推荐"知识打怪升级"模式建立正向反馈', game: '知识打怪升级' },
  { concept: '打盹', analysis: '疲劳学习效率低，建议采用番茄钟+微游戏交替学习法', game: '番茄冒险' },
  { concept: '发呆', analysis: '思维发散过度，可通过"概念连连看"游戏收敛注意力', game: '概念连连看' },
  { concept: '走神', analysis: '专注力需加强，推荐"黑洞引力阱"游戏训练持续注意力', game: '黑洞引力阱' },
  { concept: '摆烂', analysis: '学习倦怠信号，建议从简单关卡入手重建信心', game: '新手训练营' },
  { concept: '拖延', analysis: '决策延迟明显，可通过"限时解谜"游戏提升反应速度', game: '限时解谜' },
  { concept: '默认', analysis: '概念辨析能力待加强，建议通过"知识吞噬者"游戏强化记忆', game: '知识吞噬者' }
]

// 重玩变体文案
const REPLAY_VARIANTS = [
  '换个地图再来！',
  '这次一定破纪录！',
  '新种子已生成，挑战开始！',
  '地图已刷新，准备好了吗？',
  '再战一局，知识不等人！'
]

function lerp(a, b, t) { return a + (b - a) * t }
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// 简单种子随机数生成器
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export default function MiniGame() {
  const { state, dispatch } = useApp()
  const { triggerAuth } = useHall()
  const highScore = state.hall.highScore

  const [phase, setPhase] = useState('idle')
  const [finalScore, setFinalScore] = useState(0)
  const [isRecord, setIsRecord] = useState(false)
  const [gameSeed, setGameSeed] = useState(0)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showWeakness, setShowWeakness] = useState(false)
  const [badHits, setBadHits] = useState({})
  const [replayText, setReplayText] = useState('开始挑战')

  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const highScoreRef = useRef(highScore)
  const badHitsRef = useRef({})
  useEffect(() => { highScoreRef.current = highScore }, [highScore])

  // 开始 / 重玩（每次生成新种子）
  const startGame = useCallback(() => {
    audio.sfx('coin')
    const newSeed = Math.floor(Math.random() * 1000000)
    setGameSeed(newSeed)
    badHitsRef.current = {}
    setBadHits({})
    setFinalScore(0)
    setIsRecord(false)
    setShowLeaderboard(false)
    setShowWeakness(false)
    setReplayText(REPLAY_VARIANTS[Math.floor(Math.random() * REPLAY_VARIANTS.length)])
    setPhase('playing')
  }, [])

  // 游戏主循环
  useEffect(() => {
    if (phase !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let W = 0, H = 0
    const rng = seededRandom(gameSeed)

    const g = {
      player: { x: 0, y: 0, r: 26, targetX: 0, targetY: 0 },
      particles: [],
      popups: [],
      stars: [],
      score: 0,
      health: MAX_HEALTH,
      maxHealth: MAX_HEALTH,
      duration: GAME_DURATION,
      elapsed: 0,
      timeLeft: GAME_DURATION,
      startTime: 0,
      lastFrame: 0,
      spawnAcc: 0,
      shake: 0,
      flash: 0,
      running: true,
      raf: 0,
      seedOffset: rng() * 1000 // 种子偏移量，影响粒子生成模式
    }
    gameRef.current = g

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      W = rect.width
      H = rect.height
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      g.player.x = Math.max(g.player.r, Math.min(W - g.player.r, g.player.x || W / 2))
      g.player.y = Math.max(g.player.r, Math.min(H - g.player.r, g.player.y || H / 2))
      g.player.targetX = g.player.x
      g.player.targetY = g.player.y
    }
    resize()

    // 种子化星点分布
    for (let i = 0; i < 70; i++) {
      g.stars.push({
        x: rng() * W,
        y: rng() * H,
        sz: rng() * 1.6 + 0.6,
        sp: rng() * 12 + 4,
        a: rng() * 0.7 + 0.2,
        ph: rng() * Math.PI * 2
      })
    }

    function pointerPos(e) {
      const rect = canvas.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    function onPointer(e) {
      const { x, y } = pointerPos(e)
      g.player.targetX = x
      g.player.targetY = y
    }
    canvas.addEventListener('pointermove', onPointer)
    canvas.addEventListener('pointerdown', onPointer)
    window.addEventListener('resize', resize)

    // 种子化粒子生成
    function spawn(frac) {
      const badChance = lerp(0.30, 0.46, frac) + (g.seedOffset % 100) / 1000 // 种子微调
      const bad = rng() < badChance
      const pool = bad ? BAD_CONCEPTS : GOOD_CONCEPTS
      g.particles.push({
        x: 30 + rng() * (W - 60),
        y: -24,
        vy: lerp(120, 270, frac) + rng() * 40,
        r: 15 + rng() * 3,
        type: bad ? 'bad' : 'good',
        char: pool[Math.floor(rng() * pool.length)],
        rot: rng() * Math.PI * 2,
        vrot: (rng() - 0.5) * 2
      })
    }

    function addPopup(x, y, text, type) {
      g.popups.push({ x, y, vy: -50, life: 1.0, text, type })
    }

    function drawBackground(dtMs, now) {
      ctx.fillStyle = '#05010f'
      ctx.fillRect(0, 0, W, H)
      const neb = ctx.createRadialGradient(W / 2, H * 0.22, 0, W / 2, H * 0.5, Math.max(W, H))
      neb.addColorStop(0, 'rgba(30,15,77,0.55)')
      neb.addColorStop(1, 'rgba(5,1,15,0)')
      ctx.fillStyle = neb
      ctx.fillRect(0, 0, W, H)
      for (const s of g.stars) {
        s.y += s.sp * (dtMs / 1000)
        if (s.y > H) { s.y = -2; s.x = rng() * W }
        ctx.globalAlpha = s.a * (0.6 + Math.sin(now * 0.002 + s.ph) * 0.4)
        ctx.fillStyle = '#c4b5fd'
        ctx.fillRect(s.x, s.y, s.sz, s.sz)
      }
      ctx.globalAlpha = 1
    }

    function drawParticle(p) {
      const color = p.type === 'good' ? '#45E29A' : '#ff4d6d'
      ctx.save()
      ctx.shadowBlur = 16
      ctx.shadowColor = color
      ctx.fillStyle = color
      ctx.globalAlpha = 0.92
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
      ctx.save()
      ctx.fillStyle = p.type === 'good' ? '#d6fff0' : '#ffd9e0'
      ctx.globalAlpha = 0.85
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.45, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
      ctx.save()
      ctx.fillStyle = '#0a0420'
      ctx.font = `bold ${Math.round(p.r * 0.92)}px "PingFang SC", "Microsoft YaHei", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(p.char, p.x, p.y + 1)
      ctx.restore()
    }

    function drawBlackHole(now) {
      const { x, y } = g.player
      const r = g.player.r + Math.sin(now * 0.006) * 2
      const glow = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 2.4)
      glow.addColorStop(0, 'rgba(217,70,239,0.35)')
      glow.addColorStop(0.6, 'rgba(168,85,247,0.12)')
      glow.addColorStop(1, 'rgba(217,70,239,0)')
      ctx.fillStyle = glow
      ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, Math.PI * 2); ctx.fill()
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(now * 0.002)
      ctx.strokeStyle = 'rgba(232,121,249,0.8)'
      ctx.lineWidth = 2.5
      ctx.setLineDash([10, 6])
      ctx.beginPath(); ctx.arc(0, 0, r * 1.35, 0, Math.PI * 2); ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
      const core = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r)
      core.addColorStop(0, '#1a0b2e')
      core.addColorStop(0.7, '#05010f')
      core.addColorStop(1, '#000000')
      ctx.fillStyle = core
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = 'rgba(217,70,239,0.6)'
      ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke()
    }

    function drawPopups() {
      for (const pp of g.popups) {
        ctx.save()
        ctx.globalAlpha = Math.max(0, pp.life)
        ctx.fillStyle = pp.type === 'good' ? '#45E29A' : '#ff5d8f'
        ctx.font = 'bold 18px "JetBrains Mono", monospace'
        ctx.textAlign = 'center'
        ctx.shadowBlur = 8
        ctx.shadowColor = ctx.fillStyle
        ctx.fillText(pp.text, pp.x, pp.y)
        ctx.restore()
      }
    }

    function drawHUD(now) {
      ctx.save()
      ctx.fillStyle = 'rgba(10,4,32,0.6)'
      roundRect(ctx, 12, 12, 116, 36, 10); ctx.fill()
      ctx.fillStyle = '#f5e8ff'
      ctx.font = 'bold 14px "JetBrains Mono", monospace'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(`分数 ${g.score}`, 24, 31)
      const secs = Math.max(0, Math.ceil(g.timeLeft / 1000))
      const low = secs <= 5
      ctx.fillStyle = 'rgba(10,4,32,0.6)'
      roundRect(ctx, W / 2 - 60, 12, 120, 36, 10); ctx.fill()
      ctx.fillStyle = low ? `rgba(255,93,143,${0.6 + Math.sin(now * 0.02) * 0.4})` : '#f5e8ff'
      ctx.font = 'bold 16px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`⏱ ${secs}s`, W / 2, 31)
      const frac = Math.max(0, g.timeLeft / g.duration)
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      roundRect(ctx, W / 2 - 50, 46, 100, 4, 2); ctx.fill()
      ctx.fillStyle = low ? '#ff5d8f' : '#45E29A'
      roundRect(ctx, W / 2 - 50, 46, 100 * frac, 4, 2); ctx.fill()
      let hearts = ''
      for (let i = 0; i < g.maxHealth; i++) hearts += i < g.health ? '♥' : '♡'
      ctx.fillStyle = 'rgba(10,4,32,0.6)'
      roundRect(ctx, W - 128, 12, 116, 36, 10); ctx.fill()
      ctx.font = '18px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillStyle = g.health <= 1 ? '#ff5d8f' : '#ff8fab'
      ctx.fillText(hearts, W - 24, 32)
      // 种子标识
      ctx.fillStyle = 'rgba(196,181,253,0.3)'
      ctx.font = '9px "JetBrains Mono", monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`seed: ${gameSeed}`, 14, H - 10)
      ctx.restore()
    }

    function endGame() {
      if (!g.running) return
      g.running = false
      cancelAnimationFrame(g.raf)
      audio.sfx('warp')
      const fs = g.score
      const prev = highScoreRef.current
      const record = fs > prev
      if (record) {
        dispatch({ type: 'SET_HIGHSCORE', payload: fs })
        triggerAuth('把你的成绩存进社区排行榜？', 'after_score')
      }
      setBadHits({ ...badHitsRef.current })
      setFinalScore(fs)
      setIsRecord(record)
      setPhase('over')
    }

    function frame(now) {
      if (!g.running) return
      const dtMs = Math.min(now - g.lastFrame, 50)
      g.lastFrame = now
      g.elapsed = now - g.startTime
      g.timeLeft = g.duration - g.elapsed
      const frac = Math.min(g.elapsed / g.duration, 1)

      g.spawnAcc += dtMs
      const interval = lerp(760, 340, frac)
      if (g.spawnAcc >= interval) { g.spawnAcc -= interval; spawn(frac) }

      g.player.x += (g.player.targetX - g.player.x) * 0.28
      g.player.y += (g.player.targetY - g.player.y) * 0.28
      g.player.x = Math.max(g.player.r, Math.min(W - g.player.r, g.player.x))
      g.player.y = Math.max(g.player.r, Math.min(H - g.player.r, g.player.y))

      for (let i = g.particles.length - 1; i >= 0; i--) {
        const p = g.particles[i]
        p.y += p.vy * (dtMs / 1000)
        p.rot += p.vrot * (dtMs / 1000)
        const dx = p.x - g.player.x
        const dy = p.y - g.player.y
        if (Math.hypot(dx, dy) < g.player.r + p.r * 0.7) {
          if (p.type === 'good') {
            g.score++
            audio.sfx('swallow')
            audio.sfx('score')
            addPopup(p.x, p.y, '+1', 'good')
          } else {
            g.health--
            audio.sfx('hit')
            g.shake = 12
            g.flash = 1
            addPopup(p.x, p.y, '-1', 'bad')
            // 记录被击中的干扰概念（用于弱点分析）
            badHitsRef.current[p.char] = (badHitsRef.current[p.char] || 0) + 1
          }
          g.particles.splice(i, 1)
          continue
        }
        if (p.y - p.r > H) g.particles.splice(i, 1)
      }

      for (let i = g.popups.length - 1; i >= 0; i--) {
        const pp = g.popups[i]
        pp.y += pp.vy * (dtMs / 1000)
        pp.life -= (dtMs / 1000) * 1.4
        if (pp.life <= 0) g.popups.splice(i, 1)
      }

      g.shake *= Math.pow(0.9, dtMs / 16.67)
      g.flash *= Math.pow(0.88, dtMs / 16.67)

      if (g.timeLeft <= 0 || g.health <= 0) { endGame(); return }

      drawBackground(dtMs, now)
      ctx.save()
      if (g.shake > 0.5) ctx.translate((Math.random() - 0.5) * g.shake, (Math.random() - 0.5) * g.shake)
      for (const p of g.particles) drawParticle(p)
      drawBlackHole(now)
      drawPopups()
      ctx.restore()
      drawHUD(now)
      if (g.flash > 0.02) {
        ctx.fillStyle = `rgba(255,77,109,${g.flash * 0.35})`
        ctx.fillRect(0, 0, W, H)
      }

      g.raf = requestAnimationFrame(frame)
    }

    g.startTime = performance.now()
    g.lastFrame = g.startTime
    g.raf = requestAnimationFrame(frame)

    return () => {
      g.running = false
      cancelAnimationFrame(g.raf)
      canvas.removeEventListener('pointermove', onPointer)
      canvas.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('resize', resize)
    }
  }, [phase, gameSeed])

  // 生成弱点分析
  const getWeaknessAnalysis = () => {
    const entries = Object.entries(badHits).sort((a, b) => b[1] - a[1])
    if (entries.length === 0) {
      return { concept: '默认', analysis: '本局表现完美！没有受到干扰物影响，反应力满分！', game: '挑战更高难度' }
    }
    const [topBad] = entries[0]
    const template = WEAKNESS_TEMPLATES.find(t => t.concept === topBad) || WEAKNESS_TEMPLATES.find(t => t.concept === '默认')
    return { ...template, hits: entries[0][1], concept: topBad }
  }

  // 计算玩家在排行榜中的位置
  const getPlayerRank = () => {
    if (finalScore === 0) return 9999
    // 模拟排名：分数越高排名越靠前，但永远不在前10
    const baseRank = Math.max(11, 1000 - finalScore * 8)
    return Math.floor(baseRank + Math.random() * 200)
  }

  const weakness = getWeaknessAnalysis()
  const playerRank = getPlayerRank()

  return html`
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <div className="text-xs tracking-[0.3em] text-bio-400 mb-2">PLAYABLE DEMO</div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">边玩边学 · 知识接力</h2>
        <p className="text-sm text-purple-300/70 mt-2">把概念喂给黑洞，30 秒挑战你的反应力</p>
      </div>

      <div className="arcade-frame relative overflow-hidden" style=${{ height: 'clamp(420px, 60vh, 560px)' }}>
        <canvas ref=${canvasRef} className="block w-full h-full" style=${{ touchAction: 'none' }}></canvas>

        ${phase === 'idle' && html`
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-space-950/70 backdrop-blur-sm">
            <div className="text-xs tracking-[0.3em] text-bio-400 mb-2">ARCADE · v3.0</div>
            <h3 className="font-display text-3xl sm:text-4xl font-black shimmer-text mb-3">黑洞吞噬 · 知识接力</h3>
            <p className="text-sm text-purple-200/80 max-w-md mb-6">
              移动鼠标或手指操控小黑洞，<span className="text-bio-400 font-bold">吞噬绿色知识粒子</span>得分，
              <span className="text-red-400 font-bold">躲避红色干扰物</span>。每次开局地图随机变化！
            </p>
            <div className="flex gap-5 text-xs text-purple-200 mb-6">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-bio-400" style=${{ boxShadow: '0 0 10px #45E29A' }}></span>正确概念 +1
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" style=${{ boxShadow: '0 0 10px #ef4444' }}></span>干扰扣血
              </span>
              <span className="flex items-center gap-2">
                <span className="text-gold-400">🎲</span>随机种子
              </span>
            </div>
            <div className="text-xs text-purple-300 mb-5">
              当前最高分 <span className="text-gold-400 font-bold text-lg ml-1">${highScore}</span>
            </div>
            <button onClick=${startGame}
              className="px-8 py-3 rounded-full font-bold tracking-wider text-white bg-gradient-to-r from-brand-500 to-accent-500 transition-transform hover:scale-105 active:scale-95"
              style=${{ boxShadow: '0 0 24px rgba(217,70,239,0.5)' }}>
              ${replayText}
            </button>
          </div>
        `}

        ${phase === 'over' && html`
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-space-950/75 backdrop-blur-sm overflow-y-auto">
            <div className="text-xs tracking-[0.3em] text-purple-300 mb-3">GAME OVER</div>
            ${isRecord
              ? html`<div className="text-gold-400 font-bold text-lg mb-2 animate-pulse-soft">🏆 创造新纪录！</div>`
              : html`<div className="text-purple-300 text-sm mb-2">本局结束</div>`}
            <div className="font-display text-6xl font-black shimmer-text mb-1">${finalScore}</div>
            <div className="text-sm text-purple-200/80 mb-4">
              本局得分 · 历史最高 <span className="text-gold-400 font-bold">${Math.max(highScore, finalScore)}</span>
            </div>

            {/* 后续关卡锁 */}
            <div className="flex gap-2 mb-4">
              ${[1, 2, 3, 4].map(i => html`
                <div key=${i} className="w-12 h-12 rounded-lg flex items-center justify-center text-lg ${
                  i === 1 ? 'bg-bio-400/20 border border-bio-400/40' : 'bg-space-900/50 border border-purple-500/10'
                }">
                  ${i === 1 ? '✅' : '🔒'}
                </div>
              `)}
            </div>

            <div className="flex gap-3 flex-wrap justify-center mb-3">
              <button onClick=${startGame}
                className="px-6 py-2.5 rounded-full font-bold text-sm text-white bg-gradient-to-r from-brand-500 to-accent-500 transition-transform hover:scale-105 active:scale-95"
                style=${{ boxShadow: '0 0 20px rgba(217,70,239,0.4)' }}>
                🎲 ${replayText}
              </button>
              <button onClick=${() => { audio.sfx('click'); setShowLeaderboard(!showLeaderboard) }}
                className="px-4 py-2.5 rounded-full font-bold text-sm text-purple-200 border border-purple-500/40 hover:bg-purple-500/10 transition-colors">
                🏆 排行榜
              </button>
              <button onClick=${() => { audio.sfx('click'); setShowWeakness(!showWeakness) }}
                className="px-4 py-2.5 rounded-full font-bold text-sm text-bio-400 border border-bio-400/40 hover:bg-bio-400/10 transition-colors">
                📊 弱点分析
              </button>
              <button onClick=${() => { audio.sfx('click'); setPhase('idle') }}
                className="px-4 py-2.5 rounded-full font-bold text-sm text-purple-300 border border-purple-500/20 hover:bg-purple-500/10 transition-colors">
                  返回
                </button>
            </div>

            {/* 幻影排行榜 */}
            ${showLeaderboard && html`
              <div className="w-full max-w-sm glass-dark rounded-2xl p-4 mt-2 animate-fade-in">
                <div className="text-xs text-gold-400 font-bold mb-3 flex items-center gap-2">
                  🏆 全球排行榜（模拟）
                </div>
                <div className="space-y-1.5">
                  ${PHANTOM_LEADERBOARD.map(entry => html`
                    <div key=${entry.rank} className="flex items-center gap-2 text-xs">
                      <span className="w-6 text-purple-400 font-mono">${entry.rank}</span>
                      <span className="text-base">${entry.avatar}</span>
                      <span className="flex-1 text-left text-purple-200">
                        ${entry.name}${entry.rank === 1 ? html`<span className="text-gold-400 ml-1">★</span>` : ''}
                      </span>
                      <span className="text-gold-400 font-mono">${entry.score}</span>
                    </div>
                  `)}
                  <div className="border-t border-purple-500/20 pt-1.5 mt-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-6 text-bio-400 font-mono">${playerRank}</span>
                      <span className="text-base">🧑</span>
                      <span className="flex-1 text-left text-bio-400 font-bold">你</span>
                      <span className="text-bio-400 font-mono font-bold">${finalScore}</span>
                    </div>
                  </div>
                </div>
                <button onClick=${() => triggerAuth('注册后，你的成绩将真正载入史册！', 'after_score')}
                  className="w-full mt-3 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-brand-500 to-accent-500 hover:scale-[1.02] transition-transform">
                  注册后成绩将载入史册 →
                </button>
              </div>
            `}

            {/* 学习弱点分析 */}
            ${showWeakness && html`
              <div className="w-full max-w-sm glass-dark rounded-2xl p-4 mt-2 animate-fade-in">
                <div className="text-xs text-bio-400 font-bold mb-3 flex items-center gap-2">
                  📊 你的学习弱点分析
                </div>
                ${Object.keys(badHits).length > 0 ? html`
                  <div className="mb-3">
                    <div className="text-xs text-purple-300 mb-1">最容易分心的干扰：</div>
                    <div className="flex gap-1.5 flex-wrap">
                      ${Object.entries(badHits).sort((a, b) => b[1] - a[1]).map(([concept, count]) => html`
                        <span key=${concept} className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                          ${concept} ×${count}
                        </span>
                      `)}
                    </div>
                  </div>
                ` : html`
                  <div className="text-xs text-bio-400 mb-3">✅ 完美表现，没有受到任何干扰！</div>
                `}
                <div className="text-xs text-purple-200 leading-relaxed mb-2">
                  ${weakness.analysis}
                </div>
                <div className="text-xs text-purple-300 mb-3">
                  推荐游戏：<span className="text-bio-400 font-bold">${weakness.game}</span>
                </div>
                <button onClick=${() => triggerAuth('注册后查看详细学习报告和个性化推荐', 'after_score')}
                  className="w-full py-2 rounded-full text-xs font-bold text-bio-400 border border-bio-400/40 hover:bg-bio-400/10 transition-colors">
                  查看详细报告（需注册）→
                </button>
              </div>
            `}

            ${isRecord && !showLeaderboard && !showWeakness && html`
              <div className="text-xs text-bio-400/80 mt-3">已为你弹出社区排行榜入口 ↑</div>
            `}
          </div>
        `}
      </div>

      <p className="text-center text-xs text-purple-300/50 mt-4">
        提示：在画布内移动即可操控黑洞 · 每次开局随机生成新地图种子
      </p>
    </div>
  `
}
