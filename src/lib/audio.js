// 音频管理器 v3.0：Howler 管背景乐，Web Audio API 合成短音效 + 空间音频 + 触觉反馈
// 默认静音，首次用户交互后激活
// 升级四：空间音频（StereoPannerNode）、黑洞低频嗡声、滚动音效、navigator.vibrate

let audioCtx = null
let howlerLoaded = false
let Howl = null
let bgm = null
let muted = true
let activated = false

// 空间音频节点
let masterGain = null
let humOsc = null
let humGain = null
let humPan = null
let mousePan = 0 // -1 (左) 到 1 (右)

// 初始化 AudioContext（需用户交互后才能调用）
function ensureCtx() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)() } catch (e) { return null }
    masterGain = audioCtx.createGain()
    masterGain.gain.value = 0.8
    masterGain.connect(audioCtx.destination)
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

// 程序合成短音效（支持空间定位）
function synthSfx(type, panValue = 0) {
  const ctx = ensureCtx()
  if (!ctx || muted) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  // 空间定位
  let panner = null
  try {
    panner = ctx.createStereoPanner()
    panner.pan.value = Math.max(-1, Math.min(1, panValue))
    osc.connect(gain)
    gain.connect(panner)
    panner.connect(masterGain)
  } catch (e) {
    // 降级：无空间定位
    osc.connect(gain)
    gain.connect(masterGain)
  }

  switch (type) {
    case 'boot':
      osc.type = 'sine'
      osc.frequency.setValueAtTime(80, now)
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.8)
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.15, now + 0.1)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2)
      osc.start(now); osc.stop(now + 1.3)
      break
    case 'swallow':
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(400, now)
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.5)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
      osc.start(now); osc.stop(now + 0.7)
      break
    case 'score':
      osc.type = 'square'
      osc.frequency.setValueAtTime(600, now)
      osc.frequency.setValueAtTime(900, now + 0.08)
      gain.gain.setValueAtTime(0.1, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
      osc.start(now); osc.stop(now + 0.2)
      break
    case 'hit':
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(150, now)
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.2)
      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
      osc.start(now); osc.stop(now + 0.35)
      break
    case 'click':
      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, now)
      gain.gain.setValueAtTime(0.05, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
      osc.start(now); osc.stop(now + 0.06)
      break
    case 'coin':
      osc.type = 'square'
      osc.frequency.setValueAtTime(988, now)
      osc.frequency.setValueAtTime(1319, now + 0.08)
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
      osc.start(now); osc.stop(now + 0.25)
      break
    case 'warp':
      osc.type = 'sine'
      osc.frequency.setValueAtTime(200, now)
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.4)
      gain.gain.setValueAtTime(0.1, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
      osc.start(now); osc.stop(now + 0.6)
      break
    case 'whisper':
      // 角色低语：高频柔和短音
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(440 + Math.random() * 200, now)
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.03, now + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
      osc.start(now); osc.stop(now + 0.35)
      break
    case 'flip':
      // 翻阅卡带音效：极短噪音
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(2000 + Math.random() * 500, now)
      gain.gain.setValueAtTime(0.02, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)
      osc.start(now); osc.stop(now + 0.04)
      break
    default:
      gain.gain.setValueAtTime(0.001, now)
      osc.start(now); osc.stop(now + 0.1)
  }
}

// 黑洞持续低频嗡声
function startHum() {
  const ctx = ensureCtx()
  if (!ctx || muted || humOsc) return

  humOsc = ctx.createOscillator()
  humGain = ctx.createGain()
  humPan = ctx.createStereoPanner()

  humOsc.type = 'sine'
  humOsc.frequency.value = 55 // 低频引力嗡声
  humGain.gain.value = 0
  humGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1.0) // 渐入

  humOsc.connect(humGain)
  humGain.connect(humPan)
  humPan.connect(masterGain)

  // LFO 调制频率，增加有机感
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = 0.3
  lfoGain.gain.value = 3
  lfo.connect(lfoGain)
  lfoGain.connect(humOsc.frequency)
  lfo.start()

  humOsc.start()
}

function stopHum() {
  if (!humOsc || !audioCtx) return
  const now = audioCtx.currentTime
  humGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
  setTimeout(() => {
    try { humOsc.stop() } catch (e) {}
    humOsc = null
    humGain = null
    humPan = null
  }, 600)
}

// 设置黑洞嗡声音调（鼠标靠近时升高）
function setHumPitch(proximity) {
  if (!humOsc || !audioCtx) return
  // proximity: 0 (远) 到 1 (近)
  const baseFreq = 55
  const targetFreq = baseFreq + proximity * 30
  humOsc.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.1)
  if (humGain) {
    const targetGain = 0.04 + proximity * 0.06
    humGain.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.1)
  }
}

// 设置鼠标空间位置（-1 左 到 1 右）
function setMousePan(x) {
  mousePan = Math.max(-1, Math.min(1, x))
  if (humPan && audioCtx) {
    humPan.pan.setTargetAtTime(mousePan * 0.5, audioCtx.currentTime, 0.05)
  }
}

// 触觉反馈封装
function haptic(pattern) {
  if (navigator.vibrate && !muted) {
    navigator.vibrate(pattern)
  }
}

export const audio = {
  // 激活音频（首次用户交互后调用）
  activate() {
    if (activated) return
    activated = true
    ensureCtx()
  },

  setMuted(m) {
    muted = m
    if (bgm && Howl) bgm.mute(m)
    if (m) {
      stopHum()
    } else {
      // 重新激活时可以重启嗡声
    }
    if (m && navigator.vibrate) navigator.vibrate(0) // 取消振动
  },

  isMuted() { return muted },

  // 播放音效（支持空间定位 panValue: -1~1）
  sfx(type, panValue = 0) {
    if (!activated || muted) return
    synthSfx(type, panValue)
  },

  // 播放空间音效（基于鼠标X位置自动定位）
  sfxSpatial(type) {
    if (!activated || muted) return
    synthSfx(type, mousePan)
  },

  // 触觉反馈
  vibrate(pattern) {
    haptic(pattern)
  },

  // 黑洞嗡声控制
  startHum,
  stopHum,
  setHumPitch,

  // 鼠标空间定位
  setMousePan,

  // 滚动音效
  scrollSfx() {
    if (!activated || muted) return
    synthSfx('flip', 0)
  },

  // 角色低语（空间定位）
  whisper(panValue = 0) {
    if (!activated || muted) return
    synthSfx('whisper', panValue)
  },

  // 播放背景乐（懒加载 Howler）
  async playBgm(src) {
    if (!activated || muted) return
    if (!howlerLoaded) {
      try {
        const mod = await import('howler')
        Howl = mod.Howl
        howlerLoaded = true
      } catch (e) { console.warn('Howler 加载失败', e); return }
    }
    if (bgm) bgm.stop()
    if (src && Howl) {
      bgm = new Howl({ src: [src], loop: true, volume: 0.3 })
      bgm.mute(muted)
      bgm.play()
    }
  },

  stopBgm() {
    if (bgm) bgm.stop()
  }
}
