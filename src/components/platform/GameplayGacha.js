// ═══════════════════════════════════════════════════════════
// 玩法推荐 (GameplayGacha) v3.0 — 全息深色统一风格
// 使用主页 NavBar + TeamBuilder 全息青色系
// ═══════════════════════════════════════════════════════════
import { html, useContext, useState, useCallback } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'
import { NavBar } from './PlatformCommon.js?v=nav3'

// ── 设计令牌（与 TeamBuilder 统一的全息色系）──
const T = {
  // 背景层
  void: '#05010f',
  deep: '#0a0514',
  glass: 'rgba(10, 5, 20, 0.6)',
  glassHover: 'rgba(15, 10, 30, 0.75)',
  glassBorder: 'rgba(0, 212, 255, 0.15)',
  glassBorderBright: 'rgba(0, 212, 255, 0.4)',

  // 主色
  cyan: '#00d4ff',
  cyanBright: '#00ffff',
  purple: '#8b5cf6',
  pink: '#ff2e88',
  green: '#00ff88',
  amber: '#ffaa00',
  gold: '#ffd700',

  // 文字
  textBright: '#ffffff',
  textPrimary: '#e8e8ff',
  textSecondary: '#9098b8',
  textMuted: '#5a5a7a',
  textFaint: '#3a3a52',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',

  // 字体
  fontDisplay: "'Orbitron', 'Michroma', sans-serif",
  fontBody: "'Rajdhani', 'Inter', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', 'Consolas', monospace",

  // 切角
  chamfer: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
  chamferSm: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
  chamferBtn: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
}

// ── 图片路径 ──
const IMG = (n) => `/assets/gameplay/image_${n}_yi19x4.jpg`

// ── 4 个游戏模式数据 ──
const GAME_MODES = [
  {
    id: 'adventure', num: '01', type: 'Adventure', name: '探索冒险',
    match: 98, stars: 5, effect: 92,
    tags: ['探索', '收集', '剧情', '养成'],
    desc: '学生扮演探险家，在虚拟生态系统中寻找物种、记录生物关系，完成知识任务解锁新区域。',
    color: T.cyan, img: IMG(2),
    radar: [98, 95, 92, 92, 68],
  },
  {
    id: 'simulation', num: '02', type: 'Simulation', name: '模拟经营',
    match: 96, stars: 5, effect: 90,
    tags: ['策略', '管理', '决策', '模拟'],
    desc: '经营一个生态球，调节光照、温度与生物比例，观察物质循环与能量流动的平衡。',
    color: T.purple, img: IMG(3),
    radar: [96, 88, 85, 90, 76],
  },
  {
    id: 'puzzle', num: '03', type: 'Puzzle', name: '解谜闯关',
    match: 96, stars: 5, effect: 88,
    tags: ['解谜', '逻辑', '挑战', '闯关'],
    desc: '通过解谜关卡理解食物链与能量金字塔，每关对应一个核心知识点，逻辑推理通关。',
    color: T.green, img: IMG(4),
    radar: [96, 90, 80, 86, 72],
  },
  {
    id: 'rpg', num: '04', type: 'RPG', name: '角色养成',
    match: 76, stars: 4, effect: 74,
    tags: ['养成', '成长', '任务', '剧情'],
    desc: '养成专属科学角色，完成探究任务线，在剧情推进中掌握科学方法与实验技能。',
    color: T.pink, img: IMG(5),
    radar: [76, 85, 88, 74, 62],
  },
]

// ── DNA 分析数据 ──
const DNA = [
  { label: '探索元素', pct: 60, color: T.cyan },
  { label: '收集元素', pct: 20, color: T.purple },
  { label: '解谜元素', pct: 15, color: T.green },
  { label: '成长元素', pct: 5, color: T.pink },
]

// ── AI 团队数据 ──
const AI_TEAM = [
  { name: '游戏策划师', role: '负责整体游戏设计', img: IMG(6) },
  { name: '教育专家', role: '确保知识准确性', img: IMG(0) },
  { name: '剧情设计师', role: '设计故事和任务', img: IMG(7) },
  { name: '美术设计师', role: '创建视觉世界', img: IMG(8) },
  { name: '系统设计师', role: '设计游戏机制', img: IMG(9) },
  { name: '测试分析师', role: '评估学习效果', img: IMG(10) },
]

// ── 年龄段 Tab ──
const AGE_TABS = [
  { id: 'primary', label: '小学 6-12岁' },
  { id: 'junior', label: '中学 12-18岁' },
  { id: 'senior', label: '大学 18-22岁' },
  { id: 'adult', label: '成人 22+岁' },
]

// ── 学习目标 ──
const OBJECTIVES = [
  '理解生态系统的构成',
  '掌握食物链和能量流动',
  '培养科学探究能力',
]

// ── 雷达图 SVG ──
function RadarChart({ data, size = 240 }) {
  const labels = ['知识匹配度', '趣味性', '互动性', '学习效果', '实施难度']
  const center = size / 2
  const maxRadius = size / 2 - 40
  const angles = labels.map((_, i) => (Math.PI * 2 * i) / labels.length - Math.PI / 2)
  const gridLevels = [0.25, 0.5, 0.75, 1.0]

  const points = (values) =>
    values.map((v, i) => {
      const r = (v / 100) * maxRadius
      return `${center + r * Math.cos(angles[i])},${center + r * Math.sin(angles[i])}`
    }).join(' ')

  return html`
    <svg viewBox="0 0 ${size} ${size}" width="100%" height="100%" style=${{ maxHeight: '220px' }}>
      ${gridLevels.map((level, gi) => {
        const r = level * maxRadius
        const pts = angles.map(a => `${center + r * Math.cos(a)},${center + r * Math.sin(a)}`).join(' ')
        return html`<polygon key=${gi} points=${pts} fill="none" stroke=${T.borderSubtle} strokeWidth="1" />`
      })}
      ${angles.map((a, i) => html`
        <line key=${`ax-${i}`} x1=${center} y1=${center}
          x2=${center + maxRadius * Math.cos(a)} y2=${center + maxRadius * Math.sin(a)}
          stroke=${T.borderSubtle} strokeWidth="1" />
      `)}
      ${data.map((dataset, di) => {
        const colors = [T.cyan, T.purple, T.green, T.pink]
        const color = colors[di]
        const pts = points(dataset.radar)
        const dataPoints = dataset.radar.map((v, i) => {
          const r = (v / 100) * maxRadius
          return { x: center + r * Math.cos(angles[i]), y: center + r * Math.sin(angles[i]) }
        })
        return html`
          <polygon key=${di} points=${pts} fill=${color} fillOpacity="0.08"
            stroke=${color} strokeWidth="2" strokeLinejoin="round" />
          ${dataPoints.map((p, pi) => html`
            <circle key=${`pt-${di}-${pi}`} cx=${p.x} cy=${p.y} r="3" fill=${color} />
          `)}
        `
      })}
      ${labels.map((label, i) => {
        const labelR = maxRadius + 20
        const x = center + labelR * Math.cos(angles[i])
        const y = center + labelR * Math.sin(angles[i])
        return html`
          <text key=${`lbl-${i}`} x=${x} y=${y}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="11" fill=${T.textSecondary}
            font-family=${T.fontBody}>${label}</text>
        `
      })}
    </svg>
  `
}

// ── 页面 CSS ──
const PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Rajdhani:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;700&display=swap');

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

@keyframes cardFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.gg-card { animation: cardFadeIn 0.4s ease-out forwards; }
.gg-card:nth-child(2) { animation-delay: 0.08s; }
.gg-card:nth-child(3) { animation-delay: 0.16s; }
.gg-card:nth-child(4) { animation-delay: 0.24s; }

.gg-glass {
  background: ${T.glass};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${T.glassBorder};
}
.gg-glass-hover:hover {
  background: ${T.glassHover};
  border-color: ${T.glassBorderBright};
}
.gg-chamfer { clip-path: ${T.chamfer}; }
.gg-chamfer-sm { clip-path: ${T.chamferSm}; }
.gg-chamfer-btn { clip-path: ${T.chamferBtn}; }

.gg-scanlines {
  position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(0deg,
    transparent, transparent 2px,
    rgba(0,212,255,0.02) 2px, rgba(0,212,255,0.02) 4px);
}
`

export default function GameplayGacha() {
  const { state, dispatch, goStep } = useContext(AppContext)

  const grade = state.selectedGrade || 'primary'
  const [selectedMode, setSelectedMode] = useState(null)
  const [activeTab, setActiveTab] = useState(grade === 'junior' ? 'junior' : 'primary')

  const handleSelect = useCallback((mode) => setSelectedMode(mode), [])

  const confirmGameplay = useCallback(() => {
    if (!selectedMode) return
    dispatch({ type: 'SET_GAMEPLAY', payload: {
      id: selectedMode.id, name: selectedMode.name,
      type: selectedMode.type, desc: selectedMode.desc, match: selectedMode.match,
    }})
    goStep(STEPS.AISTUDIO)
  }, [selectedMode, dispatch, goStep])

  const goBack = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: STEPS.UPLOAD })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  // 4 步进度
  const steps = [
    { num: '✓', label: '教材分析', done: true },
    { num: '02', label: '玩法推荐', active: true },
    { num: '03', label: '团队组建', done: false },
    { num: '04', label: '开始创作', done: false },
  ]

  return html`
    <div class="min-h-screen flex flex-col" style=${{
      background: `radial-gradient(ellipse at 50% 80%, #1e0f4d 0%, #0a0420 40%, #05010f 100%)`,
      fontFamily: T.fontBody,
      color: T.textPrimary,
    }}>
      <style>${PAGE_CSS}</style>

      <!-- ═══ 顶部导航栏 — 与主页一致 ═══ -->
      <${NavBar} />

      <!-- ═══ 步骤进度条 ═══ -->
      <div class="pt-20 px-6 pb-3 flex items-center justify-center gap-3">
        ${steps.map((s, i) => html`
          <div key=${i} class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                 style=${s.done
                   ? { background: T.cyan, color: T.void, boxShadow: '0 0 8px rgba(0,212,255,0.4)' }
                   : s.active
                     ? { background: T.cyan, color: T.void, boxShadow: '0 0 0 3px rgba(0,212,255,0.2), 0 0 12px rgba(0,212,255,0.3)' }
                     : { border: `1px solid ${T.borderSubtle}`, color: T.textMuted }
                 }>
              ${s.num}
            </div>
            <span class="text-sm whitespace-nowrap ${s.active ? 'font-semibold' : 'font-medium'}"
                  style=${{ color: s.active ? T.cyan : s.done ? T.textPrimary : T.textMuted }}>
              ${s.label}
            </span>
          </div>
          ${i < steps.length - 1 ? html`
            <div class="w-8 h-px shrink-0"
                 style=${{ background: s.done || s.active ? T.cyan : T.borderSubtle, opacity: s.done || s.active ? 0.6 : 0.3 }}></div>
          ` : null}
        `)}
      </div>

      <!-- ═══ 中间：侧栏 + 主内容 ═══ -->
      <div class="flex-1 flex min-h-0 gap-5 px-6 pb-6">
        <!-- 左侧全息玻璃栏 -->
        <aside class="w-72 shrink-0 gg-glass gg-chamfer p-6 overflow-y-auto no-scrollbar hidden lg:block relative">
          <div class="gg-scanlines"></div>
          <div class="relative">
            <!-- 当前教材 -->
            <div class="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   style=${{ color: T.cyan }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span class="text-xs uppercase tracking-wider font-mono" style=${{ color: T.cyan }}>当前教材</span>
            </div>
            <h2 class="mt-2 text-base font-semibold truncate" style=${{ color: T.textBright, fontFamily: T.fontDisplay }}>
              ${state.selectedSubject || '小学科学'} ${grade === 'primary' ? '五年级上册' : grade === 'junior' ? '八年级' : grade === 'senior' ? '高一' : '通用'}
            </h2>
            <p class="text-xs mt-1 truncate" style=${{ color: T.textSecondary }}>
              ${state.material?.name || '教材.pdf'}
            </p>
            <div class="flex items-center gap-1.5 mt-2 text-xs" style=${{ color: T.textMuted }}>
              <span>126个知识点</span>
              <span style=${{ color: T.cyan }}>·</span>
              <span>23个实验</span>
            </div>

            <div class="my-5 h-px" style=${{ background: T.borderSubtle }}></div>

            <!-- 学习目标 -->
            <div class="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   style=${{ color: T.cyan }}>
                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
              </svg>
              <span class="text-xs uppercase tracking-wider font-mono" style=${{ color: T.cyan }}>学习目标</span>
            </div>
            <ul class="mt-3 space-y-2.5">
              ${OBJECTIVES.map((obj, i) => html`
                <li key=${i} class="flex items-start gap-2">
                  <span class="w-4 h-4 mt-0.5 rounded-full flex items-center justify-center shrink-0"
                        style=${{ background: T.cyan }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke=${T.void} stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  <span class="text-sm leading-snug" style=${{ color: T.textPrimary }}>${obj}</span>
                </li>
              `)}
            </ul>

            <div class="my-5 h-px" style=${{ background: T.borderSubtle }}></div>

            <!-- AI 分析结果 -->
            <div class="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   style=${{ color: T.cyan }}>
                <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"/>
              </svg>
              <span class="text-xs uppercase tracking-wider font-mono" style=${{ color: T.cyan }}>AI 分析结果</span>
            </div>
            <div class="mt-4 flex flex-col items-center">
              <div class="relative w-24 h-24 rounded-full"
                   style=${{ background: `conic-gradient(${T.cyan} 0% 98%, ${T.borderSubtle} 98% 100%)` }}>
                <div class="absolute inset-[6px] rounded-full flex flex-col items-center justify-center"
                     style=${{ background: T.deep }}>
                  <span class="text-2xl font-bold leading-none" style=${{ color: T.cyan, fontFamily: T.fontDisplay }}>98%</span>
                  <span class="text-[10px] mt-1" style=${{ color: T.textMuted }}>匹配度</span>
                </div>
              </div>
              <p class="mt-3 text-sm font-medium" style=${{ color: T.textBright }}>知识覆盖度高</p>
              <p class="text-xs mt-0.5" style=${{ color: T.textSecondary }}>非常适合游戏化学习</p>
            </div>

            <div class="my-5 h-px" style=${{ background: T.borderSubtle }}></div>

            <!-- 适合年龄 -->
            <div class="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   style=${{ color: T.cyan }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span class="text-xs uppercase tracking-wider font-mono" style=${{ color: T.cyan }}>适合年龄</span>
            </div>
            <div class="mt-3 flex items-center gap-3">
              <div class="min-w-0">
                <div class="text-lg font-semibold leading-tight" style=${{ color: T.textBright, fontFamily: T.fontDisplay }}>
                  ${grade === 'primary' ? '10-11岁' : grade === 'junior' ? '13-15岁' : grade === 'senior' ? '16-18岁' : '18+'}
                </div>
                <div class="text-xs mt-0.5" style=${{ color: T.textSecondary }}>
                  ${grade === 'primary' ? '小学高年级' : grade === 'junior' ? '初中阶段' : grade === 'senior' ? '高中阶段' : '成人学习'}
                </div>
              </div>
              <img src=${IMG(1)} alt="适龄儿童"
                   class="w-16 h-16 rounded-lg object-cover shrink-0"
                   style=${{ border: `1px solid ${T.glassBorder}` }} />
            </div>
          </div>
        </aside>

        <!-- 主内容 -->
        <section class="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <div class="pb-6">
            <!-- 标题 + 年龄 Tab -->
            <header class="mb-6">
              <h1 class="text-2xl font-bold tracking-tight" style=${{ color: T.textBright, fontFamily: T.fontDisplay }}>
                AI 推荐的游戏化学习方案
              </h1>
              <p class="text-sm mt-1.5" style=${{ color: T.textSecondary }}>
                基于教材内容分析，为目标年龄段推荐最合适的游戏化学习方案
              </p>
              <div class="flex flex-wrap items-center gap-2 mt-4">
                ${AGE_TABS.map(tab => html`
                  <button key=${tab.id} type="button"
                    class="px-4 py-2 text-sm whitespace-nowrap transition-all gg-chamfer-btn"
                    style=${activeTab === tab.id
                      ? { background: T.cyan, color: T.void, fontWeight: 600 }
                      : { background: T.glass, color: T.textSecondary, border: `1px solid ${T.borderSubtle}`, backdropFilter: 'blur(10px)' }
                    }
                    onClick=${() => setActiveTab(tab.id)}>
                    ${tab.label}
                  </button>
                `)}
              </div>
            </header>

            <!-- 4 个游戏模式卡片 -->
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              ${GAME_MODES.map((mode) => {
                const isSelected = selectedMode?.id === mode.id
                return html`
                  <article key=${mode.id}
                    class="gg-card gg-glass gg-chamfer overflow-hidden flex flex-col cursor-pointer transition-all hover:scale-[1.02] relative"
                    style=${{
                      borderColor: isSelected ? mode.color : T.glassBorder,
                      boxShadow: isSelected ? `0 0 0 1px ${mode.color}, 0 0 20px ${mode.color}33` : 'none',
                    }}
                    onClick=${() => handleSelect(mode)}>
                    <div class="gg-scanlines"></div>
                    <div class="relative">
                      <img src=${mode.img} alt=${mode.name}
                           class="h-32 w-full object-cover" />
                      <div class="absolute inset-0" style=${{ background: `linear-gradient(180deg, transparent 30%, ${T.deep}dd 100%)` }}></div>
                      ${isSelected ? html`
                        <div class="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                             style=${{ background: mode.color }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke=${T.void} stroke-width="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      ` : null}
                      <div class="absolute bottom-2 left-3 flex items-center gap-2">
                        <span class="text-xs font-mono" style=${{ color: T.textMuted }}>${mode.num}</span>
                        <span class="text-xs font-mono uppercase tracking-wide" style=${{ color: mode.color }}>
                          ${mode.type}
                        </span>
                      </div>
                    </div>
                    <div class="p-4 flex flex-col gap-3 flex-1 relative">
                      <div class="flex items-start justify-between gap-2">
                        <h3 class="text-base font-semibold leading-tight min-w-0" style=${{ color: T.textBright }}>
                          ${mode.name}
                        </h3>
                        <span class="text-lg font-bold leading-none shrink-0" style=${{ color: mode.color, fontFamily: T.fontDisplay }}>
                          ${mode.match}%
                        </span>
                      </div>
                      <div class="flex flex-wrap gap-1.5">
                        ${mode.tags.map((tag, ti) => html`
                          <span key=${ti}
                            class="px-2 py-0.5 text-xs whitespace-nowrap rounded-full"
                            style=${{ background: `${mode.color}15`, color: mode.color, border: `1px solid ${mode.color}30` }}>
                            ${tag}
                          </span>
                        `)}
                      </div>
                      <div>
                        <div class="text-xs uppercase tracking-wider mb-1 font-mono" style=${{ color: T.textMuted }}>
                          教材结合方式
                        </div>
                        <p class="text-xs leading-relaxed line-clamp-2" style=${{ color: T.textSecondary }}>
                          ${mode.desc}
                        </p>
                      </div>
                      <div class="mt-auto">
                        <div class="text-xs uppercase tracking-wider mb-1.5 font-mono" style=${{ color: T.textMuted }}>
                          学习效果预测
                        </div>
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-0.5">
                            ${Array.from({ length: 5 }, (_, si) => html`
                              <svg key=${si} width="14" height="14" viewBox="0 0 24 24"
                                fill=${si < mode.stars ? T.gold : T.borderSubtle}>
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                              </svg>
                            `)}
                          </div>
                          <span class="text-sm font-semibold" style=${{ color: T.green }}>
                            ${mode.effect}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                `
              })}
            </div>

            <!-- 下方三栏分析 -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <!-- 雷达图 -->
              <section class="gg-glass gg-chamfer p-5 flex flex-col relative">
                <div class="gg-scanlines"></div>
                <h3 class="text-sm font-semibold mb-2 relative" style=${{ color: T.textBright, fontFamily: T.fontDisplay }}>
                  方案对比
                </h3>
                <div class="relative w-full flex items-center justify-center" style=${{ height: '220px' }}>
                  <${RadarChart} data=${GAME_MODES} size=${240} />
                </div>
                <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 relative">
                  ${GAME_MODES.map((m, i) => {
                    const colors = [T.cyan, T.purple, T.green, T.pink]
                    return html`
                      <div key=${i} class="flex items-center gap-1.5">
                        <span class="w-2.5 h-2.5 rounded-full" style=${{ background: colors[i] }}></span>
                        <span class="text-xs" style=${{ color: T.textSecondary }}>${m.name}</span>
                      </div>
                    `
                  })}
                </div>
              </section>

              <!-- AI 建议 + DNA 分析 -->
              <section class="gg-glass gg-chamfer p-5 flex flex-col relative">
                <div class="gg-scanlines"></div>
                <h3 class="text-sm font-semibold relative" style=${{ color: T.textBright, fontFamily: T.fontDisplay }}>
                  AI 建议
                </h3>
                <p class="text-xs leading-relaxed mt-2 line-clamp-3 relative" style=${{ color: T.textSecondary }}>
                  基于教材分析，推荐选择「探索冒险」方案，该方案与生态系统的探索性学习高度匹配，能有效激发学生的好奇心与探究欲，知识覆盖度与学习效果均表现优异。
                </p>
                <div class="my-4 h-px relative" style=${{ background: T.borderSubtle }}></div>
                <h3 class="text-sm font-semibold relative" style=${{ color: T.textBright, fontFamily: T.fontDisplay }}>
                  游戏 DNA 分析
                </h3>
                <div class="mt-3 space-y-2.5 relative">
                  ${DNA.map((d, i) => html`
                    <div key=${i} class="flex items-center gap-2">
                      <span class="text-xs w-16 shrink-0 truncate" style=${{ color: T.textSecondary }}>${d.label}</span>
                      <div class="flex-1 h-2 rounded-full overflow-hidden" style=${{ background: T.borderSubtle }}>
                        <div class="h-full rounded-full transition-all"
                             style=${{ width: `${d.pct}%`, background: d.color, boxShadow: `0 0 6px ${d.color}66`, transitionDelay: `${i * 0.15}s` }}></div>
                      </div>
                      <span class="text-xs font-medium w-9 text-right shrink-0" style=${{ color: T.textPrimary }}>
                        ${d.pct}%
                      </span>
                    </div>
                  `)}
                </div>
              </section>

              <!-- 所需 AI 团队 -->
              <section class="gg-glass gg-chamfer p-5 flex flex-col relative">
                <div class="gg-scanlines"></div>
                <h3 class="text-sm font-semibold mb-3 relative" style=${{ color: T.textBright, fontFamily: T.fontDisplay }}>
                  所需 AI 团队
                </h3>
                <ul class="flex flex-col gap-2 relative">
                  ${AI_TEAM.map((member, i) => html`
                    <li key=${i} class="flex items-center gap-3">
                      <img src=${member.img} alt=${member.name}
                           class="w-8 h-8 rounded-full object-cover shrink-0"
                           style=${{ border: `1px solid ${T.glassBorder}` }} />
                      <div class="min-w-0">
                        <div class="text-sm font-medium truncate" style=${{ color: T.textPrimary }}>${member.name}</div>
                        <div class="text-xs truncate" style=${{ color: T.textMuted }}>${member.role}</div>
                      </div>
                    </li>
                  `)}
                </ul>
              </section>
            </div>
          </div>
        </section>
      </div>

      <!-- ═══ 底部操作栏 ═══ -->
      <footer class="shrink-0 grid grid-cols-3 items-center px-8 py-4 gap-4 border-t relative"
              style=${{ background: T.glass, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderColor: T.glassBorder }}>
        <div class="flex items-center gap-2 min-w-0 justify-self-start">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               style=${{ color: T.cyan }}>
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div class="min-w-0">
            <div class="text-sm truncate" style=${{ color: T.textSecondary }}>需要更多选择?</div>
            <div class="text-xs truncate" style=${{ color: T.textMuted }}>AI 可以为你生成更多定制化方案</div>
          </div>
        </div>
        <div class="justify-self-center">
          <button type="button"
            class="px-4 py-2 text-sm whitespace-nowrap transition-all gg-chamfer-btn hover:bg-white/5"
            style=${{ background: T.glass, color: T.textSecondary, border: `1px solid ${T.borderSubtle}` }}
            onClick=${goBack}>
            重新上传教材
          </button>
        </div>
        <div class="justify-self-end">
          <button type="button"
            class="px-6 py-2.5 text-sm font-semibold whitespace-nowrap transition-all gg-chamfer-btn ${selectedMode ? 'hover:scale-105' : 'opacity-40 cursor-not-allowed'}"
            style=${{
              background: selectedMode ? T.cyan : T.glass,
              color: selectedMode ? T.void : T.textMuted,
              boxShadow: selectedMode ? `0 0 16px ${T.cyan}44` : 'none',
            }}
            disabled=${!selectedMode}
            onClick=${confirmGameplay}>
            ${selectedMode ? `确认「${selectedMode.name}」，组建团队 →` : '请先选择玩法方案'}
          </button>
        </div>
      </footer>
    </div>
  `
}
