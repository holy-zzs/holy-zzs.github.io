import { html, useRef, useMemo, useState } from '../../../deps.js'
import { useFrame, useThree } from '../../../deps.js'
import { Sparkles } from '../../../deps.js'
import * as THREE from 'three'

/**
 * AICoreScene v8.1 — 精密孔明锁 · 四色金属 · 分层鼠标交互
 *
 * 色彩重构：银钢 + 蓝钢 + 黄铜 + 枪铁 四色金属对比
 *   环境反射让金属呈现真实质感，高透玻璃让金属结构成为视觉主角
 *
 * 精密度提升：主棱柱+副棱柱+角楔+榫卯销钉+刻面宝石端帽
 *
 * 鼠标分层交互：
 *   悬停外壳 → 外壳跟随鼠标旋转，内部冻结
 *   悬停核心 → 内部跟随鼠标旋转，外壳冻结
 *   无悬停   → 两者同步极缓自转
 */

// ═══════════════════════════════════════════════════
// 尺寸
// ═══════════════════════════════════════════════════
const S = 1.6

const BAR_W = 0.42 * S
const BAR_H = 0.42 * S
const BAR_LEN = 4.0 * S
const NOTCH_W = 0.48 * S
const HALF_H = BAR_H / 2
const OFFSET = BAR_H * 0.52

const SUB_W = 0.24 * S
const SUB_LEN = 3.0 * S
const SUB_OFFSET = BAR_H * 0.85

const WEDGE_SIZE = 0.28 * S
const PIN_R = 0.06 * S    // 榫卯销钉半径
const GEM_R = 0.14 * S    // 端帽宝石半径

// 色彩：四色金属对比 — 银钢 + 蓝钢 + 黄铜 + 枪铁
const C = {
  glass: '#0C1430',        // 蓝宝石玻璃（高透）
  glassInner: '#101840',   // 内层蓝玻璃
  silver: '#B0B4C0',       // 抛光银钢：主棱柱
  silverEmissive: '#3A3E4A',
  bluesteel: '#3A5A9E',    // 阳极化蓝钢：副棱柱
  bluesteelEmissive: '#1A2A4E',
  gunmetal: '#2C2E38',     // 枪铁：角楔
  gunmetalEmissive: '#181A20',
  brass: '#C8A840',        // 黄铜：销钉+端帽
  brassEmissive: '#6A5820',
  amber: '#D8901E',        // 琥珀核心
  amberGlow: '#FFA030',    // 琥珀发光
  ice: '#E0E4F0',          // 冰银棱线
  iceBright: '#F0F4FF',    // 亮冰银
  cyan: '#3DE4CF',         // 青色能量
  ring: '#5A5468',
  spark: '#9A95B0',
  nebula1: '#1A1830',
  nebula2: '#151325',
  nebula3: '#1E1C35',
}

// ═══════════════════════════════════════════════════
// 棱柱段定义（同v7）
// ═══════════════════════════════════════════════════
const BAR_X_A = [
  { pos: [-(BAR_LEN/2 - 1.0*S), 0, OFFSET], size: [2.0*S, BAR_H, BAR_W] },
  { pos: [(BAR_LEN/2 - 1.0*S), 0, OFFSET],  size: [2.0*S, BAR_H, BAR_W] },
  { pos: [0, -HALF_H/2, OFFSET],              size: [NOTCH_W, HALF_H, BAR_W] },
]
const BAR_X_B = [
  { pos: [-(BAR_LEN/2 - 1.0*S), 0, -OFFSET], size: [2.0*S, BAR_H, BAR_W] },
  { pos: [(BAR_LEN/2 - 1.0*S), 0, -OFFSET],  size: [2.0*S, BAR_H, BAR_W] },
  { pos: [0, HALF_H/2, -OFFSET],              size: [NOTCH_W, HALF_H, BAR_W] },
]
const BAR_Y_A = [
  { pos: [OFFSET, (BAR_LEN/2 - 1.0*S), 0],  size: [BAR_W, 2.0*S, BAR_H] },
  { pos: [OFFSET, -(BAR_LEN/2 - 1.0*S), 0], size: [BAR_W, 2.0*S, BAR_H] },
  { pos: [OFFSET, 0, HALF_H/2],              size: [BAR_W, NOTCH_W, HALF_H] },
]
const BAR_Y_B = [
  { pos: [-OFFSET, (BAR_LEN/2 - 1.0*S), 0],  size: [BAR_W, 2.0*S, BAR_H] },
  { pos: [-OFFSET, -(BAR_LEN/2 - 1.0*S), 0], size: [BAR_W, 2.0*S, BAR_H] },
  { pos: [-OFFSET, 0, -HALF_H/2],             size: [BAR_W, NOTCH_W, HALF_H] },
]
const BAR_Z_A = [
  { pos: [0, OFFSET, -(BAR_LEN/2 - 1.0*S)], size: [BAR_W, BAR_H, 2.0*S] },
  { pos: [0, OFFSET, (BAR_LEN/2 - 1.0*S)],  size: [BAR_W, BAR_H, 2.0*S] },
  { pos: [0, OFFSET, 0],                      size: [BAR_W*0.82, BAR_H*0.82, NOTCH_W*0.9] },
]
const BAR_Z_B = [
  { pos: [0, -OFFSET, -(BAR_LEN/2 - 1.0*S)], size: [BAR_W, BAR_H, 2.0*S] },
  { pos: [0, -OFFSET, (BAR_LEN/2 - 1.0*S)],  size: [BAR_W, BAR_H, 2.0*S] },
  { pos: [0, -OFFSET, 0],                      size: [BAR_W*0.82, BAR_H*0.82, NOTCH_W*0.9] },
]
const MAIN_BARS = [BAR_X_A, BAR_X_B, BAR_Y_A, BAR_Y_B, BAR_Z_A, BAR_Z_B]

const SUB_BARS = [
  { pos: [0, SUB_OFFSET, SUB_OFFSET], size: [SUB_LEN, SUB_W, SUB_W], rot: [0, 0, Math.PI/4] },
  { pos: [0, -SUB_OFFSET, -SUB_OFFSET], size: [SUB_LEN, SUB_W, SUB_W], rot: [0, 0, Math.PI/4] },
  { pos: [SUB_OFFSET, 0, SUB_OFFSET], size: [SUB_W, SUB_LEN, SUB_W], rot: [Math.PI/4, 0, 0] },
  { pos: [-SUB_OFFSET, 0, -OFFSET], size: [SUB_W, SUB_LEN, SUB_W], rot: [Math.PI/4, 0, 0] },
  { pos: [SUB_OFFSET, SUB_OFFSET, 0], size: [SUB_W, SUB_W, SUB_LEN], rot: [0, Math.PI/4, 0] },
  { pos: [-SUB_OFFSET, -SUB_OFFSET, 0], size: [SUB_W, SUB_W, SUB_LEN], rot: [0, Math.PI/4, 0] },
]

const WEDGE_R = 2.0 * S
const WEDGES = [
  [WEDGE_R, 0, 0], [-WEDGE_R, 0, 0],
  [0, WEDGE_R, 0], [0, -WEDGE_R, 0],
  [0, 0, WEDGE_R], [0, 0, -WEDGE_R],
  [WEDGE_R*0.6, WEDGE_R*0.6, WEDGE_R*0.6], [-WEDGE_R*0.6, -WEDGE_R*0.6, -WEDGE_R*0.6],
]

// 榫卯销钉位置（每根主棱柱的端点处）
const PINS = []
for (const bar of MAIN_BARS) {
  PINS.push(bar[0].pos, bar[1].pos)
}

// 端帽宝石位置（销钉外侧）
const GEMS = PINS.map(p => [p[0]*1.15, p[1]*1.15, p[2]*1.15])

// ═══════════════════════════════════════════════════
// 外壳组（可独立旋转）
// ═══════════════════════════════════════════════════
function OuterShell({ activePart, setActivePart }) {
  const groupRef = useRef(null)
  const shellEdgesRef = useRef(null)
  const cageEdgesRef = useRef(null)

  const shellGeo = useMemo(() => new THREE.OctahedronGeometry(2.6 * S, 0), [])
  const shellEdges = useMemo(() => new THREE.EdgesGeometry(shellGeo), [shellGeo])
  const cageGeo = useMemo(() => new THREE.DodecahedronGeometry(1.7 * S, 0), [])
  const cageEdges = useMemo(() => new THREE.EdgesGeometry(cageGeo), [cageGeo])

  const mainBarEdges = useMemo(() => {
    const geos = []
    for (const bar of MAIN_BARS)
      for (const seg of bar)
        geos.push(new THREE.EdgesGeometry(new THREE.BoxGeometry(...seg.size)))
    return geos
  }, [])

  const subBarEdges = useMemo(() =>
    SUB_BARS.map(b => new THREE.EdgesGeometry(new THREE.BoxGeometry(...b.size))), [])

  const wedgeGeo = useMemo(() => new THREE.BoxGeometry(WEDGE_SIZE, WEDGE_SIZE, WEDGE_SIZE), [])
  const wedgeEdges = useMemo(() => new THREE.EdgesGeometry(wedgeGeo), [wedgeGeo])
  const pinGeo = useMemo(() => new THREE.CylinderGeometry(PIN_R, PIN_R, BAR_H * 1.2, 8), [])
  const gemGeo = useMemo(() => new THREE.OctahedronGeometry(GEM_R, 0), [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (!groupRef.current) return

    if (activePart === 'outer') {
      // 外壳跟随鼠标，内部冻结
      const targetY = state.pointer.x * 0.8
      const targetX = -state.pointer.y * 0.5
      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.06
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.06
    } else if (activePart === 'inner') {
      // 内部激活时外壳冻结——不做任何旋转更新
    } else {
      // 默认极缓自转
      groupRef.current.rotation.y += delta * 0.025
      groupRef.current.rotation.x = Math.sin(t * 0.07) * 0.035
    }

    const breathe = 1.0 + Math.sin(t * 0.28) * 0.008
    groupRef.current.scale.setScalar(breathe)

    // 偏左定位
    const targetX = -1.5 + state.pointer.x * -0.08
    const targetY = state.pointer.y * 0.06
    groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.03
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.03

    if (shellEdgesRef.current) {
      shellEdgesRef.current.material.opacity = 0.55 + Math.sin(t * 0.3) * 0.15
    }
    if (cageEdgesRef.current) {
      cageEdgesRef.current.material.opacity = 0.35 + Math.sin(t * 0.25 + 1.0) * 0.1
    }
  })

  let mainEdgeIdx = 0
  const renderMainBars = () => {
    const els = []
    for (let bi = 0; bi < MAIN_BARS.length; bi++)
      for (let si = 0; si < MAIN_BARS[bi].length; si++) {
        const seg = MAIN_BARS[bi][si]
        const ei = mainEdgeIdx++
        els.push(html`
          <group key=${`m${bi}_${si}`} position=${seg.pos}>
            <mesh>
              <boxGeometry args=${seg.size} />
              <meshStandardMaterial color=${C.silver} metalness=${0.95} roughness=${0.15}
              emissive=${C.silverEmissive} emissiveIntensity=${0.12} envMapIntensity=${1.2} />
            </mesh>
            <lineSegments geometry=${mainBarEdges[ei]}>
              <lineBasicMaterial color=${C.ice} transparent=${true} opacity=${0.85} depthWrite=${false} />
            </lineSegments>
          </group>
        `)
      }
    return els
  }

  const renderSubBars = () => SUB_BARS.map((b, i) => html`
    <group key=${`s${i}`} position=${b.pos} rotation=${b.rot}>
      <mesh>
        <boxGeometry args=${b.size} />
        <meshStandardMaterial color=${C.bluesteel} metalness=${0.9} roughness=${0.22}
          emissive=${C.bluesteelEmissive} emissiveIntensity=${0.2} envMapIntensity=${1.0} />
      </mesh>
      <lineSegments geometry=${subBarEdges[i]}>
        <lineBasicMaterial color=${C.ice} transparent=${true} opacity=${0.6} depthWrite=${false} />
      </lineSegments>
    </group>
  `)

  const renderWedges = () => WEDGES.map((pos, i) => html`
    <group key=${`w${i}`} position=${pos}>
      <mesh geometry=${wedgeGeo}>
        <meshStandardMaterial color=${C.gunmetal} metalness=${0.95} roughness=${0.12}
          emissive=${C.gunmetalEmissive} emissiveIntensity=${0.1} envMapIntensity=${1.5} />
      </mesh>
      <lineSegments geometry=${wedgeEdges}>
        <lineBasicMaterial color=${C.ice} transparent=${true} opacity=${0.5} depthWrite=${false} />
      </lineSegments>
    </group>
  `)

  const renderPins = () => PINS.map((pos, i) => {
    // 销钉朝向：沿对应轴
    const axis = i % 3
    const rot = axis === 0 ? [0, 0, Math.PI/2] : axis === 1 ? [0, 0, 0] : [Math.PI/2, 0, 0]
    return html`
      <mesh key=${`p${i}`} position=${pos} rotation=${rot} geometry=${pinGeo}>
        <meshStandardMaterial color=${C.brass} metalness=${0.9} roughness=${0.2}
          emissive=${C.brassEmissive} emissiveIntensity=${0.35} envMapIntensity=${1.0} />
      </mesh>
    `
  })

  const renderGems = () => GEMS.map((pos, i) => html`
    <mesh key=${`g${i}`} position=${pos} geometry=${gemGeo}>
      <meshStandardMaterial color=${C.cyan} metalness=${0.3} roughness=${0.1}
        emissive=${C.cyan} emissiveIntensity=${0.8}
        transparent=${true} opacity=${0.85} />
    </mesh>
  `)

  return html`
    <group ref=${groupRef}>
      <!-- 蓝宝石玻璃外壳 -->
      <mesh geometry=${shellGeo}
        onPointerOver=${(e) => { e.stopPropagation(); setActivePart('outer') }}
        onPointerOut=${() => setActivePart(null)}>
        <meshPhysicalMaterial
          color=${C.glass}
          metalness=${0.05}
          roughness=${0.02}
          transmission=${0.96}
          thickness=${0.6}
          ior=${2.0}
          clearcoat=${1.0}
          clearcoatRoughness=${0.005}
          iridescence=${0.15}
          iridescenceIOR=${1.3}
          transparent=${true}
          opacity=${0.18}
          side=${THREE.DoubleSide}
          flatShading=${true}
        />
      </mesh>

      <!-- 外壳棱线 -->
      <lineSegments ref=${shellEdgesRef} geometry=${shellEdges}>
        <lineBasicMaterial color=${C.iceBright} transparent=${true} opacity=${0.55} depthWrite=${false} />
      </lineSegments>

      <!-- 十二面体笼 -->
      <lineSegments ref=${cageEdgesRef} geometry=${cageEdges}>
        <lineBasicMaterial color=${C.ice} transparent=${true} opacity=${0.35} depthWrite=${false} />
      </lineSegments>

      <!-- 主棱柱 -->
      ${renderMainBars()}
      <!-- 副棱柱 -->
      ${renderSubBars()}
      <!-- 角楔 -->
      ${renderWedges()}
      <!-- 榫卯销钉 -->
      ${renderPins()}
      <!-- 端帽宝石 -->
      ${renderGems()}

      <${Sparkles} count=${10} scale=${5.0*S} size=${2} speed=${0.08} color=${C.spark} opacity=${0.15} />

      <pointLight position=${[0, 0, 0]} color="#4A5070" intensity=${2.5} distance=${12*S} />
      <pointLight position=${[4, 4, 4]} color="#3A4A7E" intensity=${1.8} distance=${16*S} />
      <pointLight position=${[-4, -2, 3]} color="#C8A840" intensity=${1.0} distance=${10*S} />
    </group>
  `
}

// ═══════════════════════════════════════════════════
// 内核组（可独立旋转）
// ═══════════════════════════════════════════════════
function InnerCore({ activePart, setActivePart }) {
  const groupRef = useRef(null)
  const coreRef = useRef(null)
  const innerCoreRef = useRef(null)
  const innerShellGeo = useMemo(() => new THREE.OctahedronGeometry(2.0 * S, 0), [])
  const tmpColor = useMemo(() => new THREE.Color(), [])

  // 内层骨架：小十二面体线框
  const innerCageGeo = useMemo(() => new THREE.DodecahedronGeometry(0.9 * S, 0), [])
  const innerCageEdges = useMemo(() => new THREE.EdgesGeometry(innerCageGeo), [innerCageGeo])

  // 内层环
  const innerRingGeo = useMemo(() => new THREE.TorusGeometry(0.7 * S, 0.015 * S, 8, 48), [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (!groupRef.current) return

    if (activePart === 'inner') {
      // 内核跟随鼠标，外壳冻结
      const targetY = state.pointer.x * 1.2
      const targetX = -state.pointer.y * 0.8
      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.08
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.08
    } else if (activePart === 'outer') {
      // 外壳激活时内核冻结
    } else {
      // 默认极缓自转
      groupRef.current.rotation.y += delta * 0.04
      groupRef.current.rotation.x += delta * 0.02
    }

    if (coreRef.current) {
      const pulse = 1.5 + Math.sin(t * 0.5) * 0.8
      coreRef.current.material.emissiveIntensity = pulse
      coreRef.current.scale.setScalar(1.0 + Math.sin(t * 0.5) * 0.05)
    }

    if (innerCoreRef.current) {
      const cycle = (Math.sin(t * 0.3) + 1) / 2
      tmpColor.setRGB(
        0.78 * (1 - cycle) + 0.18 * cycle,  // amber→cyan
        0.52 * (1 - cycle) + 0.83 * cycle,
        0.12 * (1 - cycle) + 0.75 * cycle
      )
      innerCoreRef.current.material.emissive.copy(tmpColor)
      innerCoreRef.current.material.emissiveIntensity = 3.0 + Math.sin(t * 0.7) * 1.0
    }
  })

  return html`
    <group ref=${groupRef} position=${[-1.5, 0, 0]}>
      <!-- 内层蓝玻璃壳 -->
      <mesh geometry=${innerShellGeo}
        onPointerOver=${(e) => { e.stopPropagation(); setActivePart('inner') }}
        onPointerOut=${() => setActivePart(null)}>
        <meshPhysicalMaterial
          color=${C.glassInner}
          metalness=${0.1}
          roughness=${0.04}
          transmission=${0.9}
          thickness=${0.3}
          ior=${1.8}
          clearcoat=${1.0}
          clearcoatRoughness=${0.01}
          transparent=${true}
          opacity=${0.15}
          side=${THREE.DoubleSide}
          flatShading=${true}
        />
      </mesh>

      <!-- 内层骨架 -->
      <lineSegments geometry=${innerCageEdges}>
        <lineBasicMaterial color=${C.ice} transparent=${true} opacity=${0.4} depthWrite=${false} />
      </lineSegments>

      <!-- 内层环 -->
      <mesh geometry=${innerRingGeo} rotation=${[Math.PI/2, 0, 0]}>
        <meshBasicMaterial color=${C.cyan} transparent=${true} opacity=${0.3}
          blending=${THREE.AdditiveBlending} depthWrite=${false} />
      </mesh>
      <mesh geometry=${innerRingGeo} rotation=${[0, 0, Math.PI/2]}>
        <meshBasicMaterial color=${C.amber} transparent=${true} opacity=${0.25}
          blending=${THREE.AdditiveBlending} depthWrite=${false} />
      </mesh>

      <!-- 琥珀核心 -->
      <mesh ref=${coreRef}>
        <sphereGeometry args=${[0.5 * S, 24, 24]} />
        <meshStandardMaterial
          color=${C.amber}
          emissive=${C.amberGlow}
          emissiveIntensity=${1.5}
          transparent=${true}
          opacity=${0.8}
        />
      </mesh>

      <!-- 内核球 -->
      <mesh ref=${innerCoreRef}>
        <sphereGeometry args=${[0.26 * S, 16, 16]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive=${C.amberGlow}
          emissiveIntensity=${3.0}
          transparent=${true}
          opacity=${0.95}
        />
      </mesh>

      <pointLight position=${[0,0,0]} color=${C.amberGlow} intensity=${3} distance=${8*S} />
    </group>
  `
}

// ═══════════════════════════════════════════════════
// 轨道环
// ═══════════════════════════════════════════════════
function OrbitalRings() {
  const ring1 = useRef(null)
  const ring2 = useRef(null)
  const ring3 = useRef(null)

  useFrame((state, delta) => {
    if (ring1.current) ring1.current.rotation.z += delta * 0.06
    if (ring2.current) ring2.current.rotation.z += delta * 0.09
    if (ring3.current) ring3.current.rotation.z -= delta * 0.045
  })

  const r1 = 5.2 * S, r2 = 4.5 * S, r3 = 3.8 * S
  return html`
    <group position=${[-1.5, 0, 0]}>
      <group ref=${ring1} rotation=${[Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args=${[r1, r1 + 0.06, 80]} />
          <meshBasicMaterial color=${C.ring} transparent=${true} opacity=${0.25} side=${THREE.DoubleSide} blending=${THREE.AdditiveBlending} depthWrite=${false} />
        </mesh>
      </group>
      <group ref=${ring2} rotation=${[Math.PI / 2.5, 0.5, 0]}>
        <mesh>
          <ringGeometry args=${[r2, r2 + 0.06, 80]} />
          <meshBasicMaterial color=${C.ring} transparent=${true} opacity=${0.2} side=${THREE.DoubleSide} blending=${THREE.AdditiveBlending} depthWrite=${false} />
        </mesh>
      </group>
      <group ref=${ring3} rotation=${[Math.PI / 3, -0.4, 0.3]}>
        <mesh>
          <ringGeometry args=${[r3, r3 + 0.06, 80]} />
          <meshBasicMaterial color=${C.ring} transparent=${true} opacity=${0.18} side=${THREE.DoubleSide} blending=${THREE.AdditiveBlending} depthWrite=${false} />
        </mesh>
      </group>
    </group>
  `
}

// ═══════════════════════════════════════════════════
// 灰色星云
// ═══════════════════════════════════════════════════
function GrayNebulae() {
  const refs = useRef([])
  const nebulae = useMemo(() => [
    { pos: [8, 3, -12], scale: 6, color: C.nebula1, opacity: 0.15 },
    { pos: [-10, -2, -8], scale: 5, color: C.nebula2, opacity: 0.12 },
    { pos: [6, -4, -15], scale: 7, color: C.nebula3, opacity: 0.1 },
    { pos: [-6, 5, -10], scale: 4.5, color: C.nebula1, opacity: 0.13 },
    { pos: [12, -1, -6], scale: 5.5, color: C.nebula2, opacity: 0.11 },
  ], [])
  const geos = useMemo(() => nebulae.map(() => new THREE.SphereGeometry(1, 16, 16)), [nebulae])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < refs.current.length; i++) {
      const m = refs.current[i]
      if (!m) continue
      m.material.opacity = nebulae[i].opacity + Math.sin(t * 0.15 + i * 1.3) * 0.03
    }
  })

  return html`
    <group>
      ${nebulae.map((n, i) => html`
        <mesh key=${`neb${i}`} ref=${el => refs.current[i] = el} position=${n.pos} scale=${n.scale} geometry=${geos[i]}>
          <meshBasicMaterial color=${n.color} transparent=${true} opacity=${n.opacity}
            side=${THREE.BackSide} blending=${THREE.AdditiveBlending} depthWrite=${false} />
        </mesh>
      `)}
    </group>
  `
}

// ═══════════════════════════════════════════════════
// 远处星舰
// ═══════════════════════════════════════════════════
function Starships() {
  const ship1 = useRef(null)
  const ship2 = useRef(null)
  const ship3 = useRef(null)

  const shipGeo = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.15, 0.8, 4)
    geo.rotateZ(-Math.PI / 2)
    return geo
  }, [])
  const trailGeo = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.06, 0.4, 4)
    geo.rotateZ(Math.PI / 2)
    return geo
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ship1.current) {
      ship1.current.position.x = 6 - ((t * 0.3) % 16)
      ship1.current.position.y = -1 + ((t * 0.3) % 16) * 0.1
    }
    if (ship2.current) {
      ship2.current.position.x = -3 + Math.sin(t * 0.1) * 2
      ship2.current.position.y = 4 + Math.cos(t * 0.08) * 0.5
    }
    if (ship3.current) {
      ship3.current.position.x = -8 + ((t * 0.2) % 20)
      ship3.current.position.y = 2 - ((t * 0.2) % 20) * 0.05
    }
  })

  return html`
    <group>
      <group ref=${ship1} position=${[6, -1, -8]}>
        <mesh geometry=${shipGeo}><meshBasicMaterial color="#4A4860" transparent=${true} opacity=${0.6} /></mesh>
        <mesh geometry=${trailGeo} position=${[-0.5, 0, 0]}><meshBasicMaterial color="#3A3850" transparent=${true} opacity=${0.3} blending=${THREE.AdditiveBlending} /></mesh>
      </group>
      <group ref=${ship2} position=${[-3, 4, -12]}>
        <mesh geometry=${shipGeo} scale=${0.6}><meshBasicMaterial color="#3A3850" transparent=${true} opacity=${0.4} /></mesh>
        <mesh geometry=${trailGeo} scale=${0.6} position=${[-0.3, 0, 0]}><meshBasicMaterial color="#2A2840" transparent=${true} opacity=${0.2} blending=${THREE.AdditiveBlending} /></mesh>
      </group>
      <group ref=${ship3} position=${[-8, 2, -6]}>
        <mesh geometry=${shipGeo} scale=${0.45}><meshBasicMaterial color="#383648" transparent=${true} opacity=${0.35} /></mesh>
        <mesh geometry=${trailGeo} scale=${0.45} position=${[-0.22, 0, 0]}><meshBasicMaterial color="#252438" transparent=${true} opacity=${0.15} blending=${THREE.AdditiveBlending} /></mesh>
      </group>
    </group>
  `
}

// ═══════════════════════════════════════════════════
// 点状光栅 + 环境粒子
// ═══════════════════════════════════════════════════
function DotProjection() {
  const gridRef = useRef(null)
  const positions = useMemo(() => {
    const dots = []
    const size = 14, spacing = 0.8
    for (let x = -size; x <= size; x++)
      for (let z = -size; z <= size; z++)
        dots.push(x * spacing, -6.0 * S, z * spacing)
    return new Float32Array(dots)
  }, [])
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.x = state.pointer.x * -0.3
      gridRef.current.position.z = state.pointer.y * -0.3
    }
  })
  return html`
    <points ref=${gridRef}>
      <bufferGeometry><bufferAttribute attach="attributes-position" count=${positions.length / 3} array=${positions} itemSize=${3} /></bufferGeometry>
      <pointsMaterial size=${0.05} color="#2A2840" transparent=${true} opacity=${0.06} sizeAttenuation=${true} blending=${THREE.AdditiveBlending} depthWrite=${false} />
    </points>
  `
}

function AmbientParticles() {
  const ref = useRef(null)
  const COUNT = 400
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 35
      arr[i * 3 + 1] = (Math.random() - 0.5) * 22
      arr[i * 3 + 2] = (Math.random() - 0.5) * 35
    }
    return arr
  }, [])
  useFrame((state, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.01 })
  return html`
    <points ref=${ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" count=${COUNT} array=${positions} itemSize=${3} /></bufferGeometry>
      <pointsMaterial size=${0.02} color="#3A3550" transparent=${true} opacity=${0.15} sizeAttenuation=${true} blending=${THREE.AdditiveBlending} depthWrite=${false} />
    </points>
  `
}

// ═══════════════════════════════════════════════════
// 环境反射：PMREM 生成金属反射所需的环境贴图
// ═══════════════════════════════════════════════════
function SetupEnv() {
  const { scene, gl } = useThree()
  useMemo(() => {
    try {
      const pmrem = new THREE.PMREMGenerator(gl)
      const envScene = new THREE.Scene()
      const geo = new THREE.SphereGeometry(1, 16, 16)
      const m1 = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xC0C8E0 }))
      m1.position.set(10, 10, 10); m1.scale.setScalar(6); envScene.add(m1)
      const m2 = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x4A6A9E }))
      m2.position.set(-10, -5, -10); m2.scale.setScalar(4); envScene.add(m2)
      const m3 = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xC8A840 }))
      m3.position.set(0, -10, 5); m3.scale.setScalar(5); envScene.add(m3)
      const m4 = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xFFA030 }))
      m4.position.set(0, 0, 0); m4.scale.setScalar(3); envScene.add(m4)
      const envMap = pmrem.fromScene(envScene, 0.04).texture
      scene.environment = envMap
      geo.dispose()
      pmrem.dispose()
    } catch (e) {
      console.warn('[SetupEnv] PMREM failed, metals will use lights only:', e.message)
    }
  }, [scene, gl])
  return null
}

// ═══════════════════════════════════════════════════
// 主组件：管理分层交互状态
// ═══════════════════════════════════════════════════
export default function AICoreScene() {
  const [activePart, setActivePart] = useState(null)

  return html`
    <ambientLight intensity=${0.25} />
    <directionalLight position=${[6, 10, 6]} intensity=${0.5} color="#C0C8E0" />
    <directionalLight position=${[-6, -4, -6]} intensity=${0.3} color="#4A6A9E" />
    <pointLight position=${[10, 2, 0]} intensity=${1.0} color="#6A8AC8" distance=${40} />
    <pointLight position=${[-10, 0, 2]} intensity=${0.8} color="#C8A840" distance=${40} />
    <${SetupEnv} />
    <${GrayNebulae} />
    <${Starships} />
    <${AmbientParticles} />
    <${DotProjection} />
    <${OrbitalRings} />
    <${OuterShell} activePart=${activePart} setActivePart=${setActivePart} />
    <${InnerCore} activePart=${activePart} setActivePart=${setActivePart} />
    <fog attach="fog" args=${['#0D0B1A', 14, 50]} />
  `
}
