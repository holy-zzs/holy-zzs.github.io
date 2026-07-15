// 升级七：社区"信号站"沉浸式探索 —— Three.js 3D 走廊画廊
// 滚轮前进 · 鼠标环顾 · 卡带悬浮发光 · 点击预览
// 移动端（屏宽 < 768）或 Three.js 加载失败时，降级为 CSS 视差网格
import { html, useState, useRef, useEffect, useCallback } from '../../react.js'
import { audio } from '../../lib/audio.js'
import { COMMUNITY_CREATIONS } from '../../data/community.js'

/* ------------------------------------------------------------------ *
 * Tailwind 渐变色解析
 * community.js 的 gradient 形如 'from-fuchsia-500 to-orange-500'
 * 需解析出两个十六进制颜色供 Three.js 材质 / Canvas 渐变使用
 * ------------------------------------------------------------------ */
const TAILWIND_COLORS = {
  fuchsia: { 400: '#e879f9', 500: '#d946ef', 600: '#c026d3', 700: '#a21caf' },
  purple: { 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce' },
  violet: { 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9' },
  indigo: { 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' },
  blue: { 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
  sky: { 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1' },
  cyan: { 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490' },
  teal: { 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e' },
  emerald: { 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857' },
  green: { 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d' },
  lime: { 400: '#a3e635', 500: '#84cc16', 600: '#65a30d', 700: '#4d7c0f' },
  yellow: { 400: '#facc15', 500: '#eab308', 600: '#ca8a04', 700: '#a16207' },
  amber: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309' },
  orange: { 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c' },
  red: { 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c' },
  rose: { 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c' },
  pink: { 400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d' }
}

// 未知颜色兜底：按名字 hash 生成一个 hsl 颜色（canvas / Three.Color 均可解析）
function hashColor(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return `hsl(${h % 360}, 72%, 56%)`
}

function extractColor(gradient, prefix) {
  if (!gradient) return null
  const tok = gradient.split(/\s+/).find(t => t.startsWith(prefix + '-'))
  if (!tok) return null
  const name = tok.slice(prefix.length + 1) // 如 'fuchsia-500'
  const [colorName, shade] = name.split('-')
  if (TAILWIND_COLORS[colorName] && TAILWIND_COLORS[colorName][shade]) {
    return TAILWIND_COLORS[colorName][shade]
  }
  return hashColor(name)
}

function parseGradientClass(gradient) {
  return {
    from: extractColor(gradient, 'from') || '#d946ef',
    to: extractColor(gradient, 'to') || '#f97316'
  }
}

/* ------------------------------------------------------------------ *
 * Canvas 文本绘制工具
 * ------------------------------------------------------------------ */
function wrapText(ctx, text, x, y, maxW, lineH, maxLines = 99) {
  if (!text) return
  const chars = Array.from(text)
  let line = ''
  let lineCount = 0
  let cursorY = y
  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i]
    if (ctx.measureText(testLine).width > maxW && line.length > 0) {
      ctx.fillText(line, x, cursorY)
      line = chars[i]
      lineCount++
      cursorY += lineH
      if (lineCount >= maxLines - 1) {
        // 最后一行：剩余文本超宽则截断加省略号
        let rest = chars.slice(i).join('')
        let truncated = false
        while (ctx.measureText(rest + '…').width > maxW && rest.length > 1) {
          rest = rest.slice(0, -1)
          truncated = true
        }
        ctx.fillText(rest + (truncated ? '…' : ''), x, cursorY)
        return
      }
    } else {
      line = testLine
    }
  }
  if (line) ctx.fillText(line, x, cursorY)
}

// 软圆形精灵纹理（星光粒子用，加法混合友好）
function createCircleTexture(THREE, size = 64) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0.0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,255,255,0.85)')
  g.addColorStop(0.55, 'rgba(255,255,255,0.35)')
  g.addColorStop(1.0, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

// 卡带 Canvas 纹理：渐变背景 + 标题 + 主题 + 点赞 + 试玩提示
function createCartridgeTexture(creation, colors, THREE) {
  const W = 512
  const H = 640
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const ctx = cv.getContext('2d')

  // 主体渐变（左上 -> 右下）
  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, colors.from)
  g.addColorStop(1, colors.to)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  // 左上柔光高光，增加质感
  const rg = ctx.createRadialGradient(W * 0.32, H * 0.24, 16, W * 0.5, H * 0.5, W * 0.85)
  rg.addColorStop(0, 'rgba(255,255,255,0.22)')
  rg.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = rg
  ctx.fillRect(0, 0, W, H)

  // 顶部标签 + 点赞
  ctx.textBaseline = 'top'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = 'bold 26px Orbitron, "PingFang SC", system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('◆ GAME CARTRIDGE', 32, 30)

  ctx.textAlign = 'right'
  ctx.font = 'bold 24px system-ui, sans-serif'
  ctx.fillText('\u2764 ' + creation.likes, W - 32, 32)

  // 主题
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(255,255,255,0.82)'
  ctx.font = '500 24px "PingFang SC", system-ui, sans-serif'
  ctx.fillText(creation.topic, 32, 78)

  // 标题（大字、自动换行）
  ctx.fillStyle = '#ffffff'
  ctx.font = '900 54px "PingFang SC", system-ui, sans-serif'
  wrapText(ctx, creation.title, 32, 150, W - 64, 62, 3)

  // 描述（底部、自动换行截断）
  ctx.fillStyle = 'rgba(255,255,255,0.88)'
  ctx.font = '400 22px "PingFang SC", system-ui, sans-serif'
  wrapText(ctx, creation.desc, 32, H - 150, W - 64, 30, 3)

  // 底部试玩条
  ctx.fillStyle = 'rgba(0,0,0,0.38)'
  ctx.fillRect(0, H - 52, W, 52)
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.font = 'bold 24px Orbitron, "PingFang SC", system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('\u25B6 点击试玩', W / 2, H - 38)

  // 描边
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'
  ctx.lineWidth = 4
  ctx.strokeRect(8, 8, W - 16, H - 16)

  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  tex.needsUpdate = true
  return tex
}

/* ------------------------------------------------------------------ *
 * 3D 画廊引擎（工厂函数，闭包持有所有 Three.js 资源）
 * ------------------------------------------------------------------ */
function createEngine(THREE, container, { onProgress, onPick }) {
  const creations = COMMUNITY_CREATIONS

  // 走廊尺寸
  const CORRIDOR_HALF = 4
  const CARD_W = 2.4
  const CARD_H = 3.2
  const SPACING = 6.5
  const START_Z = 8
  const CAM_START_Z = 16
  const lastZ = START_Z - (creations.length - 1) * SPACING
  const minZ = lastZ - 9 // 相机最远可前进到最后一幅之后
  const maxZ = CAM_START_Z

  let scene, camera, renderer
  let cartridges = []
  let starField
  let raycaster, pointerNDC
  let rafId = null
  let running = false
  let visible = true
  let lastTime = 0
  let targetZ = maxZ
  let currentZ = maxZ
  let lastReportedProgress = -1
  let lastScrollSfx = 0
  const pointer = { x: 0, y: 0 }
  const targetPointer = { x: 0, y: 0 }
  let mouseDownPos = null
  const disposables = []
  let io = null
  let resizeObs = null

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
  const track = (...res) => { for (const r of res) if (r) disposables.push(r); return res[0] }

  function init() {
    const w = container.clientWidth || 1
    const h = container.clientHeight || 1

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x05010f)
    scene.fog = new THREE.FogExp2(0x05010f, 0.015)

    camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 220)
    camera.position.set(0, 0, maxZ)
    camera.lookAt(0, 0, maxZ - 12)

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(w, h, false)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    const dom = renderer.domElement
    dom.style.display = 'block'
    dom.style.width = '100%'
    dom.style.height = '100%'
    dom.style.cursor = 'grab'
    dom.style.touchAction = 'none'
    container.appendChild(dom)

    // 基础环境光（让地板/墙体不至于全黑）
    scene.add(new THREE.AmbientLight(0x2a1a4a, 0.55))
    scene.add(new THREE.HemisphereLight(0x3a2a6a, 0x05010f, 0.45))

    buildCorridor()
    buildCartridges()
    buildStars()

    raycaster = new THREE.Raycaster()
    pointerNDC = new THREE.Vector2(-10, -10)

    bindEvents()
    renderOnce()
  }

  function buildCorridor() {
    const centerZ = (maxZ + minZ) / 2
    const length = (maxZ - minZ) + 24

    // 地板
    const floorGeo = new THREE.PlaneGeometry(CORRIDOR_HALF * 2 + 4, length)
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0a0420, roughness: 0.82, metalness: 0.25 })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.position.set(0, -3.6, centerZ)
    scene.add(floor)
    track(floorGeo, floorMat)

    // 天花板
    const ceilGeo = new THREE.PlaneGeometry(CORRIDOR_HALF * 2 + 4, length)
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x070318, roughness: 1, metalness: 0 })
    const ceil = new THREE.Mesh(ceilGeo, ceilMat)
    ceil.rotation.x = Math.PI / 2
    ceil.position.set(0, 3.6, centerZ)
    scene.add(ceil)
    track(ceilGeo, ceilMat)

    // 两侧墙体（承接卡带点光的彩色辉光）
    const wallGeo = new THREE.PlaneGeometry(length, 7.2)
    const wallMatR = new THREE.MeshStandardMaterial({ color: 0x0c0524, roughness: 0.9, metalness: 0.1 })
    const wallR = new THREE.Mesh(wallGeo, wallMatR)
    wallR.rotation.y = -Math.PI / 2
    wallR.position.set(CORRIDOR_HALF, 0, centerZ)
    scene.add(wallR)
    track(wallGeo, wallMatR)

    const wallMatL = new THREE.MeshStandardMaterial({ color: 0x0c0524, roughness: 0.9, metalness: 0.1 })
    const wallL = new THREE.Mesh(wallGeo.clone(), wallMatL)
    wallL.rotation.y = Math.PI / 2
    wallL.position.set(-CORRIDOR_HALF, 0, centerZ)
    scene.add(wallL)
    track(wallMatL)
    // 注意：wallL 用了 clone 几何体，单独追踪 dispose
    track(wallL.geometry)
  }

  function buildCartridges() {
    creations.forEach((creation, i) => {
      const colors = parseGradientClass(creation.gradient)
      const tex = createCartridgeTexture(creation, colors, THREE)
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, fog: true })
      const geo = new THREE.PlaneGeometry(CARD_W, CARD_H)
      const mesh = new THREE.Mesh(geo, mat)

      const side = i % 2 === 0 ? 1 : -1 // +1 右墙, -1 左墙
      const z = START_Z - i * SPACING
      mesh.position.set(side * (CORRIDOR_HALF - 0.35), 0, z)
      // 右墙卡带朝 -X（内侧），左墙卡带朝 +X（内侧）
      mesh.rotation.y = side === 1 ? -Math.PI / 2 : Math.PI / 2
      mesh.userData = { creation, index: i }
      scene.add(mesh)
      track(geo, mat, tex)

      // 每幅卡带配一盏点光做辉光（投射到地板/墙体上）
      const lightColor = new THREE.Color(colors.from)
      const light = new THREE.PointLight(lightColor, 1.15, 9, 2)
      light.position.set(side * (CORRIDOR_HALF - 1.5), 0.4, z)
      scene.add(light)

      cartridges.push({ mesh, baseY: 0, phase: i * 0.7, light, creation, side })
    })
  }

  function buildStars() {
    const count = 1200
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 34
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16
      positions[i * 3 + 2] = minZ - 6 + Math.random() * (maxZ - minZ + 24)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const tex = createCircleTexture(THREE, 32)
    const mat = new THREE.PointsMaterial({
      size: 0.18,
      sizeAttenuation: true,
      map: tex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xbfc6ff,
      opacity: 0.9,
      fog: true
    })
    starField = new THREE.Points(geo, mat)
    starField.frustumCulled = false
    scene.add(starField)
    track(geo, mat, tex)
  }

  /* ---------------- 事件 ---------------- */
  function bindEvents() {
    const dom = renderer.domElement
    dom.addEventListener('wheel', onWheel, { passive: false })
    dom.addEventListener('pointermove', onPointerMove, { passive: true })
    dom.addEventListener('pointerdown', onPointerDown, { passive: true })
    dom.addEventListener('pointerup', onPointerUp, { passive: true })

    resizeObs = new ResizeObserver(onResize)
    resizeObs.observe(container)

    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(onVisibility, { threshold: 0.01 })
      io.observe(container)
    }
  }

  function onWheel(e) {
    e.preventDefault()
    // deltaY > 0（向下滚）= 前进 = z 减小
    const delta = e.deltaY * 0.045
    targetZ = clamp(targetZ - delta, minZ, maxZ)

    // 滚动音效节流，避免噪音
    const now = performance.now()
    if (now - lastScrollSfx > 110) {
      lastScrollSfx = now
      audio.scrollSfx()
    }
  }

  function onPointerMove(e) {
    const rect = renderer.domElement.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    targetPointer.x = x
    targetPointer.y = y
    pointerNDC.set(x, y)
    if (typeof audio.setMousePan === 'function') audio.setMousePan(x)
  }

  function onPointerDown(e) {
    mouseDownPos = { x: e.clientX, y: e.clientY }
    renderer.domElement.style.cursor = 'grabbing'
  }

  function onPointerUp(e) {
    renderer.domElement.style.cursor = 'grab'
    if (!mouseDownPos) return
    const dx = e.clientX - mouseDownPos.x
    const dy = e.clientY - mouseDownPos.y
    mouseDownPos = null
    if (dx * dx + dy * dy > 25) return // 视为拖拽，不触发点击
    pick()
  }

  function pick() {
    raycaster.setFromCamera(pointerNDC, camera)
    const meshes = cartridges.map(c => c.mesh)
    const hits = raycaster.intersectObjects(meshes, false)
    if (hits.length) {
      const creation = hits[0].object.userData.creation
      onPick(creation)
    }
  }

  function onResize() {
    const w = container.clientWidth || 1
    const h = container.clientHeight || 1
    if (w === 0 || h === 0) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(w, h, false)
    renderOnce()
  }

  function onVisibility(entries) {
    visible = entries[0] ? entries[0].isIntersecting : true
    if (visible) ensureLoop()
    else if (rafId != null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  /* ---------------- 循环 ---------------- */
  function ensureLoop() {
    if (running && visible && rafId == null) {
      lastTime = performance.now() / 1000
      rafId = requestAnimationFrame(tick)
    }
  }

  function tick() {
    if (!running || !visible) {
      rafId = null
      return
    }
    const now = performance.now() / 1000
    let dt = now - lastTime
    lastTime = now
    if (!isFinite(dt) || dt < 0) dt = 0
    if (dt > 0.1) dt = 0.1
    const t = now

    // 前进位移（平滑插值到目标 z）
    currentZ += (targetZ - currentZ) * Math.min(1, dt * 4.5)
    // 鼠标环顾（平滑）
    pointer.x += (targetPointer.x - pointer.x) * 0.06
    pointer.y += (targetPointer.y - pointer.y) * 0.06

    camera.position.z = currentZ
    camera.position.x = pointer.x * 1.3
    camera.position.y = pointer.y * 0.9
    camera.lookAt(pointer.x * 2.4, pointer.y * 1.1, currentZ - 12)

    // 卡带浮动 + 灯光呼吸
    for (const c of cartridges) {
      c.mesh.position.y = c.baseY + Math.sin(t * 1.2 + c.phase) * 0.18
      c.light.intensity = 1.0 + Math.sin(t * 2.0 + c.phase) * 0.32
    }

    // 进度回调（节流：变化足够大才上报，避免每帧触发 React 重渲染）
    const p = clamp((maxZ - currentZ) / (maxZ - minZ), 0, 1)
    if (Math.abs(p - lastReportedProgress) > 0.004) {
      lastReportedProgress = p
      onProgress(p)
    }

    renderer.render(scene, camera)
    rafId = requestAnimationFrame(tick)
  }

  function renderOnce() {
    renderer.render(scene, camera)
  }

  /* ---------------- 公共 API ---------------- */
  function start() {
    running = true
    if (visible) ensureLoop()
  }

  function stop() {
    running = false
    if (rafId != null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  function destroy() {
    stop()
    if (io) { io.disconnect(); io = null }
    if (resizeObs) { resizeObs.disconnect(); resizeObs = null }

    const dom = renderer && renderer.domElement
    if (dom) {
      dom.removeEventListener('wheel', onWheel)
      dom.removeEventListener('pointermove', onPointerMove)
      dom.removeEventListener('pointerdown', onPointerDown)
      dom.removeEventListener('pointerup', onPointerUp)
    }

    for (const r of disposables) {
      if (r && typeof r.dispose === 'function') r.dispose()
    }
    disposables.length = 0

    if (renderer) {
      renderer.dispose()
      if (dom && dom.parentNode) dom.parentNode.removeChild(dom)
      renderer = null
    }
    scene = null
    camera = null
    cartridges = []
    starField = null
  }

  init()

  return { start, stop, destroy }
}

/* ------------------------------------------------------------------ *
 * CSS 视差网格降级（移动端 / Three.js 加载失败）
 * 横向滚动 + 多层背景按鼠标位移产生景深视差
 * ------------------------------------------------------------------ */
function FallbackGrid({ onPick }) {
  const wrapRef = useRef(null)
  const [px, setPx] = useState(0)
  const [py, setPy] = useState(0)

  const onMouseMove = useCallback((e) => {
    const r = wrapRef.current.getBoundingClientRect()
    setPx((e.clientX - r.left) / r.width - 0.5)
    setPy((e.clientY - r.top) / r.height - 0.5)
  }, [])

  return html`
    <div ref=${wrapRef} onMouseMove=${onMouseMove}
      className="absolute inset-0 overflow-x-auto no-scrollbar"
      style=${{ perspective: '1200px', background: 'radial-gradient(circle at 50% 40%, #140a35 0%, #05010f 70%)' }}>

      {/* 远景星层（位移最小） */}
      <div className="absolute inset-0 pointer-events-none" style=${{ transform: `translate(${-px * 18}px, ${-py * 18}px)` }}>
        ${Array.from({ length: 40 }).map((_, i) => html`
          <div key=${'fs' + i} className="absolute rounded-full bg-white"
            style=${{
              left: (i * 53) % 100 + '%',
              top: (i * 37) % 100 + '%',
              width: '2px', height: '2px',
              opacity: 0.3 + (i % 5) * 0.12
            }}></div>
        `)}
      </div>

      {/* 近景辉光层（位移最大） */}
      <div className="absolute inset-0 pointer-events-none" style=${{ transform: `translate(${-px * 42}px, ${-py * 42}px)` }}>
        <div className="absolute rounded-full"
          style=${{ left: '15%', top: '30%', width: '260px', height: '260px', background: 'radial-gradient(circle, rgba(217,70,239,0.18), transparent 70%)' }}></div>
        <div className="absolute rounded-full"
          style=${{ right: '10%', bottom: '15%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(249,115,22,0.14), transparent 70%)' }}></div>
      </div>

      {/* 卡带横向滚动行 */}
      <div className="relative flex gap-5 px-8 items-center h-full" style=${{ transform: `translateZ(0) rotateY(${-px * 4}deg) rotateX(${py * 4}deg)`, transformStyle: 'preserve-3d' }}>
        ${COMMUNITY_CREATIONS.map((c, i) => html`
          <div key=${c.id}
            onClick=${() => { audio.sfx('coin'); onPick(c) }}
            className="flex-shrink-0 w-56 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group hover:scale-105 hover:-translate-y-2"
            style=${{
              height: '300px',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              transform: `translateZ(${(i % 3) * 20}px)`
            }}>
            <div className="relative h-full flex flex-col justify-between p-5">
              <div className="absolute inset-0 bg-gradient-to-br ${c.gradient}"></div>
              <div className="absolute inset-0" style=${{ background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.18), transparent 60%)' }}></div>
              <div className="relative">
                <div className="text-[10px] tracking-[0.2em] text-white/70 mb-1">GAME CARTRIDGE</div>
                <div className="text-xs text-white/80">${c.topic}</div>
              </div>
              <div className="relative">
                <h3 className="text-xl font-black text-white leading-tight mb-2">${c.title}</h3>
                <p className="text-[11px] text-white/75 leading-relaxed line-clamp-2">${c.desc}</p>
                <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/30 text-[11px] text-white">
                  \u2764 ${c.likes}
                </div>
              </div>
            </div>
          </div>
        `)}
      </div>
    </div>
  `
}

/* ------------------------------------------------------------------ *
 * 卡带预览浮层
 * ------------------------------------------------------------------ */
function PreviewOverlay({ creation, onClose }) {
  const [tried, setTried] = useState(false)
  const colors = parseGradientClass(creation.gradient)

  const tryPlay = useCallback(() => {
    audio.sfx('warp')
    if (navigator.vibrate) navigator.vibrate([10, 20, 30])
    setTried(true)
  }, [])

  return html`
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4"
      style=${{ background: 'rgba(5,1,15,0.82)', backdropFilter: 'blur(8px)' }}
      onClick=${onClose}>
      <div onClick=${(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl overflow-hidden"
        style=${{ border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>

        {/* 封面 */}
        <div className="relative h-44 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br ${creation.gradient}"></div>
          <div className="absolute inset-0" style=${{ background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.22), transparent 60%)' }}></div>
          <div className="absolute inset-0 flex flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.25em] text-white/70">GAME CARTRIDGE</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-black/30 text-white">\u2764 ${creation.likes}</span>
            </div>
            <div>
              <p className="text-xs text-white/80 mb-1">${creation.topic}</p>
              <h3 className="text-2xl font-black text-white leading-tight" style=${{ fontFamily: 'Orbitron, "PingFang SC", sans-serif' }}>${creation.title}</h3>
            </div>
          </div>
        </div>

        {/* 详情 */}
        <div className="p-6" style=${{ background: '#0a0420' }}>
          <p className="text-sm text-purple-200 leading-relaxed mb-5">${creation.desc}</p>

          ${tried ? html`
            <div className="mb-4 px-4 py-3 rounded-xl text-xs text-bio-400"
              style=${{ background: 'rgba(69,226,154,0.08)', border: '1px solid rgba(69,226,154,0.25)' }}>
              \u26A0 试玩功能开发中… 先去黑洞区体验吞噬小游戏吧！
            </div>
          ` : html``}

          <div className="flex gap-3">
            <button onClick=${tryPlay}
              className="flex-1 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:scale-105"
              style=${{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`, boxShadow: `0 0 20px ${colors.from}55` }}>
              \u25B6 试玩
            </button>
            <button onClick=${() => { audio.sfx('click'); onClose() }}
              className="px-5 py-2.5 rounded-full text-sm font-bold text-purple-200 transition-colors hover:bg-purple-500/10"
              style=${{ border: '1px solid rgba(217,70,239,0.35)' }}>
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  `
}

/* ------------------------------------------------------------------ *
 * 主组件
 * ------------------------------------------------------------------ */
export default function Gallery3D({ onBack }) {
  const containerRef = useRef(null)
  const engineRef = useRef(null)
  const [mode, setMode] = useState('loading') // loading | 3d | fallback
  const [selected, setSelected] = useState(null)
  const [progress, setProgress] = useState(0)

  // 动态加载 Three.js 并初始化 3D 画廊
  useEffect(() => {
    let destroyed = false

    async function init() {
      // 移动端直接降级（屏宽 < 768）
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setMode('fallback')
        return
      }
      try {
        const THREE = await import('three')
        if (destroyed || !containerRef.current) return
        const engine = createEngine(THREE, containerRef.current, {
          onProgress: (p) => setProgress(p),
          onPick: (creation) => {
            audio.sfx('coin')
            if (navigator.vibrate) navigator.vibrate(10)
            setSelected(creation)
          }
        })
        if (destroyed) {
          engine.destroy()
          return
        }
        engine.start()
        engineRef.current = engine
        setMode('3d')
      } catch (e) {
        console.warn('Three.js 3D 画廊加载失败，降级为 CSS 视差网格', e)
        setMode('fallback')
      }
    }
    init()

    return () => {
      destroyed = true
      if (engineRef.current) {
        engineRef.current.destroy()
        engineRef.current = null
      }
    }
  }, [])

  const handleBack = useCallback(() => {
    audio.sfx('click')
    if (typeof onBack === 'function') onBack()
  }, [onBack])

  const closeOverlay = useCallback(() => setSelected(null), [])

  const pct = Math.round(progress * 100)

  return html`
    <div className="relative w-full overflow-hidden rounded-3xl"
      style=${{ height: '620px', background: '#05010f', border: '1px solid rgba(217,70,239,0.18)' }}>

      {/* Three.js 画布挂载点 */}
      <div ref=${containerRef} className="absolute inset-0"></div>

      {/* 加载态 */}
      ${mode === 'loading' && html`
        <div className="absolute inset-0 z-20 flex items-center justify-center" style=${{ background: '#05010f' }}>
          <div className="text-center">
            <div className="text-4xl mb-3 animate-spin" style=${{ display: 'inline-block' }}>\u2B55</div>
            <p className="text-purple-300 text-xs tracking-widest">正在连接信号站…</p>
          </div>
        </div>
      `}

      {/* CSS 视差降级 */}
      ${mode === 'fallback' && html`<${FallbackGrid} onPick=${(c) => { audio.sfx('coin'); setSelected(c) }} />`}

      {/* 氛围暗角 */}
      <div className="absolute inset-0 pointer-events-none z-10"
        style=${{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(5,1,15,0.55) 100%)' }}></div>

      {/* 返回网格视图按钮 */}
      <button onClick=${handleBack}
        className="absolute top-4 left-4 z-30 px-4 py-2 rounded-full text-xs font-bold text-white transition-all hover:scale-105"
        style=${{ background: 'rgba(20,10,53,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(217,70,239,0.35)' }}>
        \u2190 返回网格视图
      </button>

      {/* 探索进度条 */}
      ${mode === '3d' && html`
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2 px-3 py-2 rounded-full"
          style=${{ background: 'rgba(20,10,53,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(217,70,239,0.2)' }}>
          <span className="text-[10px] text-purple-300 tracking-wider">探索进度</span>
          <div className="relative w-28 h-1.5 rounded-full" style=${{ background: 'rgba(255,255,255,0.12)' }}>
            <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-150"
              style=${{ width: pct + '%', background: 'linear-gradient(90deg, #d946ef, #f97316)' }}></div>
          </div>
          <span className="text-[10px] text-white font-bold tabular-nums">${pct}%</span>
        </div>
      `}

      {/* 操作提示 */}
      ${mode === '3d' && html`
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full text-xs text-purple-200"
          style=${{ background: 'rgba(20,10,53,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(217,70,239,0.2)' }}>
          \u2909 用滚轮前进 \u00B7 点击卡带试玩
        </div>
      `}

      ${mode === 'fallback' && html`
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full text-xs text-purple-200"
          style=${{ background: 'rgba(20,10,53,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(217,70,239,0.2)' }}>
          \u2194 横向滑动浏览 \u00B7 移动鼠标感受视差 \u00B7 点击卡带试玩
        </div>
      `}

      {/* 卡带预览浮层 */}
      ${selected && html`<${PreviewOverlay} creation=${selected} onClose=${closeOverlay} />`}
    </div>
  `
}
