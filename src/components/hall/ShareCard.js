// 升级三：社会化分享卡片
// Canvas 2D 生成 1080x1920 竖版分享海报，支持下载、预览码、URL 参数分享
import { html, useState, useRef, useCallback, useEffect } from '../../react.js'
import { audio } from '../../lib/audio.js'

// ── Tailwind 渐变色名 → hex 映射（用于 Canvas 绘制）──
const TAILWIND_COLORS = {
  'violet-500': '#8b5cf6', 'violet-600': '#7c3aed',
  'fuchsia-500': '#d946ef', 'fuchsia-600': '#c026d3',
  'cyan-500': '#06b6d4', 'cyan-600': '#0891b2',
  'amber-500': '#f59e0b', 'amber-600': '#d97706',
  'orange-500': '#f97316', 'orange-600': '#ea580c',
  'red-500': '#ef4444', 'red-600': '#dc2626', 'red-700': '#b91c1c',
  'yellow-500': '#eab308', 'yellow-600': '#ca8a04',
  'gray-600': '#4b5563', 'gray-700': '#374151',
  'indigo-500': '#6366f1', 'indigo-600': '#4f46e5',
  'purple-500': '#a855f7', 'purple-600': '#9333ea',
  'blue-500': '#3b82f6', 'blue-600': '#2563eb',
  'green-500': '#22c55e', 'green-600': '#16a34a',
  'emerald-500': '#10b981', 'emerald-600': '#059669',
  'teal-500': '#14b8a6', 'teal-600': '#0d9488',
  'pink-500': '#ec4899', 'pink-600': '#db2777',
  'rose-500': '#f43f5e', 'rose-600': '#e11d48',
  'sky-500': '#0ea5e9', 'sky-600': '#0284c7',
}

// 从 posterGradient 字符串解析颜色数组
// 输入如 'from-violet-600 via-fuchsia-600 to-cyan-600'
function parseGradient(gradientStr) {
  if (!gradientStr) return ['#7c3aed', '#c026d3', '#06b6d4']
  const parts = gradientStr.split(/\s+/)
  const colors = []
  for (const p of parts) {
    const m = p.match(/(?:from|via|to)-([\w-]+)$/)
    if (m && TAILWIND_COLORS[m[1]]) {
      colors.push(TAILWIND_COLORS[m[1]])
    }
  }
  return colors.length >= 2 ? colors : ['#7c3aed', '#c026d3', '#06b6d4']
}

// 生成随机预览码（6 位大写字母+数字，去掉易混淆字符）
function generatePreviewCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// 自动生成 tagline
function generateTagline(topicResult) {
  const topic = topicResult?.key || '这个知识'
  const gameType = topicResult?.gameType || '游戏'
  return `我把《${topic}》变成了${gameType}，你也能！`
}

// ── Canvas 绘制辅助函数 ──

// 圆角矩形路径
function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

// 中文文字自动换行（按字符拆分），返回最终 y 坐标
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split('')
  let line = ''
  let currentY = y
  const lines = []
  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i]
    if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
      lines.push(line)
      line = chars[i]
    } else {
      line = testLine
    }
  }
  if (line) lines.push(line)
  lines.forEach(l => {
    ctx.fillText(l, x, currentY)
    currentY += lineHeight
  })
  return currentY
}

// 绘制装饰性 QR 图案（非真实编码，仅视觉效果）
function drawQRPattern(ctx, x, y, size) {
  const modules = 25
  const cellSize = size / modules
  const dark = '#0a0420'

  // 白色底
  ctx.fillStyle = '#ffffff'
  roundRectPath(ctx, x, y, size, size, 12)
  ctx.fill()

  // 伪随机数据模块（基于位置稳定）
  const noise = (i, j) => {
    const v = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453
    return v - Math.floor(v)
  }
  ctx.fillStyle = dark
  for (let i = 0; i < modules; i++) {
    for (let j = 0; j < modules; j++) {
      if (noise(i, j) > 0.52) {
        ctx.fillRect(
          x + i * cellSize + 0.5,
          y + j * cellSize + 0.5,
          cellSize - 1,
          cellSize - 1
        )
      }
    }
  }

  // 三个定位标记（左上、右上、左下）
  const drawFinder = (fx, fy) => {
    const px = x + fx * cellSize
    const py = y + fy * cellSize
    const s7 = 7 * cellSize
    const s5 = 5 * cellSize
    const s3 = 3 * cellSize
    // 外框黑
    ctx.fillStyle = dark
    ctx.fillRect(px, py, s7, s7)
    // 内白
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(px + cellSize, py + cellSize, s5, s5)
    // 中心黑
    ctx.fillStyle = dark
    ctx.fillRect(px + 2 * cellSize, py + 2 * cellSize, s3, s3)
  }
  drawFinder(0, 0)
  drawFinder(modules - 7, 0)
  drawFinder(0, modules - 7)

  // 右下角小定位点（对齐图案）
  const ax = x + (modules - 5) * cellSize
  const ay = y + (modules - 5) * cellSize
  ctx.fillStyle = dark
  ctx.fillRect(ax, ay, 5 * cellSize, 5 * cellSize)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(ax + cellSize, ay + cellSize, 3 * cellSize, 3 * cellSize)
  ctx.fillStyle = dark
  ctx.fillRect(ax + 2 * cellSize, ay + 2 * cellSize, cellSize, cellSize)
}

// ── 主绘制函数：1080x1920 竖版分享海报 ──
function drawShareCard(canvas, topicResult, previewCode, tagline) {
  const ctx = canvas.getContext('2d')
  const W = 1080
  const H = 1920
  canvas.width = W
  canvas.height = H

  const colors = parseGradient(topicResult?.posterGradient)
  const emoji = topicResult?.posterEmoji || '🎮'
  const title = topicResult?.gameTitle || '知识探险家'
  const gameType = topicResult?.gameType || '探索冒险'
  const concepts = topicResult?.concepts || ['知识图谱', '核心概念', '学习路径']

  // ── 1. 深空背景 ──
  const bgGrad = ctx.createLinearGradient(0, 0, W, H)
  bgGrad.addColorStop(0, '#0a0420')
  bgGrad.addColorStop(0.5, '#140a35')
  bgGrad.addColorStop(1, '#05010f')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, W, H)

  // ── 2. 顶部彩色光晕 ──
  const glowGrad = ctx.createRadialGradient(W / 2, 380, 0, W / 2, 380, 750)
  glowGrad.addColorStop(0, colors[0] + '55')
  glowGrad.addColorStop(0.4, colors[1] + '25')
  glowGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glowGrad
  ctx.fillRect(0, 0, W, 950)

  // ── 3. 星空 ──
  ctx.fillStyle = '#ffffff'
  for (let i = 0; i < 150; i++) {
    const sx = Math.random() * W
    const sy = Math.random() * H
    const sr = Math.random() * 2.2 + 0.4
    ctx.globalAlpha = Math.random() * 0.6 + 0.15
    ctx.beginPath()
    ctx.arc(sx, sy, sr, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // ── 4. 顶部品牌 ──
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = '600 30px "Orbitron", "Arial", sans-serif'
  ctx.fillText('KNOWLEDGE  GAME  CONCEPT', W / 2, 100)

  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.font = '700 42px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText('知识不进脑子啊', W / 2, 168)

  // 分隔渐变线
  const lineGrad = ctx.createLinearGradient(W * 0.15, 0, W * 0.85, 0)
  lineGrad.addColorStop(0, 'rgba(0,0,0,0)')
  lineGrad.addColorStop(0.5, colors[0])
  lineGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = lineGrad
  ctx.fillRect(W * 0.15, 200, W * 0.7, 2)

  // ── 5. 装饰 emoji（大）──
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '190px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
  // emoji 外圈光晕
  const emojiGlow = ctx.createRadialGradient(W / 2, 400, 0, W / 2, 400, 180)
  emojiGlow.addColorStop(0, colors[1] + '40')
  emojiGlow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = emojiGlow
  ctx.beginPath()
  ctx.arc(W / 2, 400, 180, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillText(emoji, W / 2, 405)
  ctx.restore()

  // ── 6. GAME CONCEPT 标签 ──
  ctx.textAlign = 'center'
  ctx.fillStyle = colors[0]
  ctx.font = '700 26px "Orbitron", "Arial", sans-serif'
  ctx.fillText('▸ GAME CONCEPT ◂', W / 2, 580)

  // ── 7. 游戏标题（自动换行）──
  ctx.fillStyle = '#ffffff'
  ctx.font = '800 62px "PingFang SC", "Microsoft YaHei", sans-serif'
  wrapText(ctx, title, W / 2, 660, W - 120, 76)

  // ── 8. 游戏类型 ──
  ctx.font = '500 26px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillStyle = 'rgba(196,181,253,0.8)'
  ctx.fillText(`类型 · ${gameType}`, W / 2, 830)

  // ── 9. 概念标签（自动换行居中）──
  const tagPadding = 22
  const tagGap = 16
  const tagH = 52
  const tagMaxWidth = W - 120
  ctx.font = '700 26px "PingFang SC", "Microsoft YaHei", sans-serif'
  const tagWidths = concepts.map(c => ctx.measureText(c).width + tagPadding * 2)

  // 按行分组
  const tagLines = []
  let curLine = []
  let curWidth = 0
  concepts.forEach((c, i) => {
    const w = tagWidths[i]
    const addW = curLine.length > 0 ? tagGap + w : w
    if (curWidth + addW > tagMaxWidth && curLine.length > 0) {
      tagLines.push({ items: curLine, width: curWidth })
      curLine = [i]
      curWidth = w
    } else {
      curLine.push(i)
      curWidth += addW
    }
  })
  if (curLine.length > 0) tagLines.push({ items: curLine, width: curWidth })

  let tagY = 900
  tagLines.forEach(line => {
    let tagX = (W - line.width) / 2
    line.items.forEach(idx => {
      const tw = tagWidths[idx]
      const grad = ctx.createLinearGradient(tagX, tagY, tagX + tw, tagY + tagH)
      grad.addColorStop(0, colors[idx % colors.length] + '99')
      grad.addColorStop(1, colors[(idx + 1) % colors.length] + '66')
      ctx.fillStyle = grad
      roundRectPath(ctx, tagX, tagY, tw, tagH, tagH / 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'
      ctx.lineWidth = 1.5
      roundRectPath(ctx, tagX, tagY, tw, tagH, tagH / 2)
      ctx.stroke()
      // 文字
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = '700 26px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.fillText(concepts[idx], tagX + tw / 2, tagY + tagH / 2 + 2)
      ctx.textBaseline = 'alphabetic'
      tagX += tw + tagGap
    })
    tagY += tagH + tagGap
  })

  // ── 10. Tagline ──
  const taglineY = tagY + 20
  ctx.textAlign = 'center'
  ctx.fillStyle = '#c4b5fd'
  ctx.font = 'italic 500 30px "PingFang SC", "Microsoft YaHei", sans-serif'
  wrapText(ctx, tagline, W / 2, taglineY, W - 160, 42)

  // ── 11. 中间装饰点 ──
  const dotY = taglineY + 80
  ctx.fillStyle = 'rgba(217,70,239,0.4)'
  for (let i = 0; i < 5; i++) {
    ctx.beginPath()
    ctx.arc(W / 2 - 60 + i * 30, dotY, 3, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── 12. 预览码 ──
  const labelY = dotY + 50
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '600 22px "Orbitron", "Arial", sans-serif'
  ctx.fillText('PREVIEW CODE', W / 2, labelY)

  const codeText = `#${previewCode}`
  ctx.font = '700 68px "Orbitron", "Courier New", monospace'
  const codeW = ctx.measureText(codeText).width + 100
  const codeX = (W - codeW) / 2
  const codeY = labelY + 20
  const codeH = 110
  const codeGrad = ctx.createLinearGradient(codeX, codeY, codeX + codeW, codeY)
  codeGrad.addColorStop(0, colors[0])
  codeGrad.addColorStop(1, colors[colors.length - 1])
  ctx.fillStyle = codeGrad
  roundRectPath(ctx, codeX, codeY, codeW, codeH, 24)
  ctx.fill()
  // 光泽
  const sheenGrad = ctx.createLinearGradient(codeX, codeY, codeX, codeY + codeH)
  sheenGrad.addColorStop(0, 'rgba(255,255,255,0.2)')
  sheenGrad.addColorStop(0.5, 'rgba(255,255,255,0)')
  ctx.fillStyle = sheenGrad
  roundRectPath(ctx, codeX, codeY, codeW, codeH, 24)
  ctx.fill()
  // 码文字
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '700 68px "Orbitron", "Courier New", monospace'
  ctx.fillText(codeText, codeX + codeW / 2, codeY + codeH / 2 + 3)
  ctx.textBaseline = 'alphabetic'

  // ── 13. QR 图案 ──
  const qrSize = 220
  const qrX = (W - qrSize) / 2
  const qrY = codeY + codeH + 60
  // QR 白色边框（先画底层）
  ctx.fillStyle = '#ffffff'
  roundRectPath(ctx, qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 16)
  ctx.fill()
  // QR 图案
  drawQRPattern(ctx, qrX, qrY, qrSize)

  // ── 14. 底部提示 ──
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = '500 24px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText('扫码或输入预览码，立即试玩', W / 2, qrY + qrSize + 60)

  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.font = '400 20px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText('多智能体协作 · 让AI把枯燥知识变成上头游戏', W / 2, qrY + qrSize + 100)
}

// ════════════════════════════════════════════
// 主组件
// ════════════════════════════════════════════
export default function ShareCard({ topicResult, onClose }) {
  const canvasRef = useRef(null)
  const [previewCode, setPreviewCode] = useState('')
  const [friendCode, setFriendCode] = useState(null)
  const [showFriendBanner, setShowFriendBanner] = useState(false)
  const [notice, setNotice] = useState(null) // { msg, type }
  const [rendered, setRendered] = useState(false)

  // 本地 toast
  const showToast = useCallback((msg, type = 'info') => {
    setNotice({ msg, type, id: Date.now() })
    setTimeout(() => setNotice(null), 2600)
  }, [])

  // 挂载时：生成预览码 + 检查 URL 参数
  useEffect(() => {
    const code = generatePreviewCode()
    setPreviewCode(code)

    try {
      const params = new URLSearchParams(window.location.search)
      const shared = params.get('code')
      if (shared) {
        setFriendCode(shared)
        setShowFriendBanner(true)
      }
    } catch (e) {
      // URL 解析失败时静默降级
    }
  }, [])

  // Canvas 绘制
  useEffect(() => {
    if (!previewCode || !canvasRef.current) return
    const tagline = generateTagline(topicResult)

    const draw = () => {
      try {
        drawShareCard(canvasRef.current, topicResult, previewCode, tagline)
        setRendered(true)
      } catch (e) {
        console.warn('ShareCard canvas 绘制失败', e)
      }
    }

    // 等待字体加载后再绘制，避免首帧字体回退
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(draw).catch(draw)
    } else {
      draw()
    }
  }, [topicResult, previewCode])

  // 下载分享图
  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    audio.sfx('coin')
    if (navigator.vibrate) navigator.vibrate(10)
    try {
      const link = document.createElement('a')
      link.download = `知识胶囊_${previewCode}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      showToast('分享图已保存到本地', 'success')
    } catch (e) {
      showToast('下载失败，请重试', 'error')
    }
  }, [previewCode, showToast])

  // 复制分享链接（写入 URL 参数）
  const handleShare = useCallback(() => {
    audio.sfx('click')
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('code', previewCode)
      window.history.replaceState({}, '', url.toString())

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url.toString())
          .then(() => showToast('分享链接已复制到剪贴板！', 'success'))
          .catch(() => showToast('链接已生成，请手动复制地址栏', 'info'))
      } else {
        showToast('链接已写入地址栏，请手动复制', 'info')
      }
    } catch (e) {
      showToast('分享链接生成失败', 'error')
    }
  }, [previewCode, showToast])

  // 关闭
  const handleClose = useCallback(() => {
    audio.sfx('click')
    onClose()
  }, [onClose])

  // 点击遮罩关闭
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) handleClose()
  }, [handleClose])

  const tagline = generateTagline(topicResult)
  const gameTitle = topicResult?.gameTitle || '神秘知识'

  return html`
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 overflow-y-auto"
      style=${{ background: 'rgba(5,1,15,0.88)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick=${handleBackdropClick}>

      <div className="relative w-full max-w-sm my-auto rounded-3xl glass-dark overflow-hidden"
        style=${{ border: '1px solid rgba(217,70,239,0.25)', boxShadow: '0 0 60px rgba(217,70,239,0.15)' }}
        onClick=${(e) => e.stopPropagation()}>

        {/* 关闭按钮 */}
        <button onClick=${handleClose}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all"
          style=${{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          ✕
        </button>

        {/* 朋友邀请横幅 */}
        ${showFriendBanner && html`
          <div className="m-3 p-3.5 rounded-2xl flex items-start gap-3"
            style=${{ background: 'linear-gradient(135deg, rgba(217,70,239,0.2), rgba(249,115,22,0.12))', border: '1px solid rgba(217,70,239,0.35)' }}>
            <span className="text-2xl flex-shrink-0">🎁</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-bold leading-snug">
                你的朋友将《${gameTitle}》变成了游戏，要试试吗？
              </p>
              <p className="text-xs text-purple-300 mt-1">预览码：#${friendCode}</p>
            </div>
            <button onClick=${() => { audio.sfx('warp'); setShowFriendBanner(false) }}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold text-white transition-all hover:scale-105"
              style=${{ background: 'linear-gradient(135deg, #d946ef, #f97316)' }}>
              试试
            </button>
          </div>
        `}

        {/* 标题区 */}
        <div className="text-center pt-5 pb-2 px-6">
          <div className="text-[10px] tracking-[0.3em] text-bio-400 mb-1">SHARE CARD</div>
          <h2 className="text-lg font-black text-white" style=${{ fontFamily: 'Orbitron, sans-serif' }}>
            分享你的知识胶囊
          </h2>
          <p className="text-xs text-purple-300 mt-1.5 leading-relaxed px-2">${tagline}</p>
        </div>

        {/* Canvas 预览 */}
        <div className="px-4 pb-3">
          <div className="relative rounded-2xl overflow-hidden mx-auto"
            style=${{ maxWidth: '280px', border: '1px solid rgba(217,70,239,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            ${!rendered && html`
              <div className="flex items-center justify-center" style=${{ aspectRatio: '9/16', background: '#0a0420' }}>
                <div className="text-center">
                  <div className="text-3xl mb-2 animate-spin inline-block">⭕</div>
                  <p className="text-purple-400 text-xs">生成中…</p>
                </div>
              </div>
            `}
            <canvas ref=${canvasRef}
              className="w-full h-auto block"
              style=${{ display: rendered ? 'block' : 'none' }} />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="px-5 pb-5 space-y-2.5">
          <button onClick=${handleDownload}
            className="w-full py-3.5 rounded-full text-sm font-black text-white transition-all hover:scale-[1.02] active:scale-[0.99]"
            style=${{ background: 'linear-gradient(135deg, #d946ef, #f97316)', boxShadow: '0 0 20px rgba(217,70,239,0.35)' }}>
            📥 下载分享图
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button onClick=${handleShare}
              className="py-3 rounded-full text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.99]"
              style=${{ background: 'rgba(69,226,154,0.15)', border: '1px solid rgba(69,226,154,0.35)' }}>
              🔗 复制链接
            </button>
            <button onClick=${handleClose}
              className="py-3 rounded-full text-sm font-bold text-purple-200 transition-all hover:text-white hover:bg-white/5 active:scale-[0.99]"
              style=${{ background: 'rgba(20,10,53,0.5)', border: '1px solid rgba(217,70,239,0.2)' }}>
              关闭
            </button>
          </div>
        </div>

        {/* 底部小提示 */}
        <div className="text-center pb-4">
          <p className="text-[10px] text-purple-500/50">
            预览码 #${previewCode} · 保存或分享图片让朋友扫码试玩
          </p>
        </div>
      </div>

      {/* 本地 toast */}
      ${notice && html`
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full text-sm font-bold text-white float-up"
          style=${{
            background: notice.type === 'success' ? 'rgba(69,226,154,0.9)' :
                       notice.type === 'error' ? 'rgba(239,68,68,0.9)' :
                       'rgba(124,58,237,0.9)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
          ${notice.msg}
        </div>
      `}
    </div>
  `
}
