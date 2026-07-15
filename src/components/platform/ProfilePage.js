// 页面13：用户个人中心 — 创作者中心 Dashboard
// 完全复刻设计稿：赛博朋克暗紫风 + 玻璃拟态 + 数据可视化
import { html, useContext, useEffect, useState } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'
import { NavBar, Footer } from './PlatformCommon.js'

// ── 设计令牌（与设计稿 CSS 变量一致）──
const T = {
  bgBase: '#0a0518',
  bgDeep: '#0d0820',
  bgPanel: '#140a2e',
  bgCard: '#1a0e38',
  bgCardHover: '#221148',
  bgInput: '#0e0620',
  glassBg: 'rgba(26, 14, 56, 0.55)',
  glassBorder: 'rgba(139, 92, 246, 0.18)',
  borderDefault: 'rgba(139, 92, 246, 0.2)',
  borderStrong: 'rgba(139, 92, 246, 0.35)',
  borderCyan: 'rgba(0, 212, 255, 0.3)',
  primary: '#00d4ff',
  secondary: '#a855f7',
  magenta: '#e93ef5',
  orange: '#ff8c00',
  textPrimary: '#ffffff',
  textSecondary: '#c4b8e0',
  textTertiary: '#8b7fb0',
  successBright: '#34d399',
  gradPrimary: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  gradCyanMagenta: 'linear-gradient(135deg, #00d4ff 0%, #e93ef5 100%)',
  gradProgress: 'linear-gradient(90deg, #00d4ff 0%, #a855f7 100%)',
  gradOrange: 'linear-gradient(135deg, #ff8c00 0%, #ff6b6b 100%)',
  radiusLg: '14px',
  radiusMd: '10px',
  shadowCard: '0 2px 8px rgba(0, 0, 0, 0.3), 0 0 1px rgba(139, 92, 246, 0.1)',
}

// ── SVG 环形图 ──
function DonutChart() {
  const data = [
    { label: '世界构建', value: 28, color: '#00d4ff' },
    { label: '玩法设计', value: 24, color: '#e93ef5' },
    { label: '美术生成', value: 22, color: '#a855f7' },
    { label: '系统建模', value: 16, color: '#ff8c00' },
    { label: '其他工具', value: 10, color: '#6366f1' },
  ]
  const r = 60
  const circ = 2 * Math.PI * r
  let offset = 0
  const segments = data.map((d) => {
    const len = (d.value / 100) * circ
    const seg = { ...d, len, offset }
    offset += len
    return seg
  })

  return html`
    <div class="relative w-[160px] h-[160px] flex-shrink-0">
      <svg width="160" height="160" viewBox="0 0 160 160" style=${{ transform: 'rotate(-90deg)' }}>
        <circle cx="80" cy="80" r=${r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="22" />
        ${segments.map((s) => html`
          <circle key=${s.label}
            cx="80" cy="80" r=${r} fill="none"
            stroke=${s.color} strokeWidth="22"
            strokeDasharray=${`${s.len} ${circ - s.len}`}
            strokeDashoffset=${-s.offset}
            style=${{ filter: `drop-shadow(0 0 4px ${s.color}66)` }}
          />
        `)}
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span class="text-xl font-bold text-white">AI工具</span>
        <span class="text-[10px] mt-0.5" style=${{ color: T.textTertiary }}>使用分布</span>
      </div>
    </div>
  `
}

// ── AI 团队数据 ──
const AI_TEAM = [
  { name: '制作人', desc: '统筹全局，把控方向与质量', avatar: '/assets/agents/AI制作人头像.jpg', collab: 98, color: T.primary, borderColor: 'rgba(0,212,255,0.3)', glow: 'rgba(0,212,255,0.15)' },
  { name: '玩法总监', desc: '设计核心玩法与游戏循环', avatar: '/assets/agents/AI玩法总监头像.jpg', collab: 96, color: T.magenta, borderColor: 'rgba(233,62,245,0.3)', glow: 'rgba(233,62,245,0.15)' },
  { name: '世界构筑师', desc: '构建世界观与故事线', avatar: '/assets/agents/AI世界构筑师头像.jpg', collab: 94, color: T.secondary, borderColor: 'rgba(168,85,247,0.3)', glow: 'rgba(168,85,247,0.15)' },
  { name: '美术总监', desc: '设定风格与美术资产', avatar: '/assets/agents/AI美术总监头像.jpg', collab: 97, color: T.orange, borderColor: 'rgba(255,140,0,0.3)', glow: 'rgba(255,140,0,0.15)' },
  { name: '系统设计师', desc: '数值系统与成长模型', avatar: '/assets/agents/AI系统设计师头像.jpg', collab: 93, color: '#6366f1', borderColor: 'rgba(99,102,241,0.3)', glow: 'rgba(99,102,241,0.15)' },
]

// ── 项目数据 ──
const PROJECTS = [
  { title: '山海经：洪荒纪元', progress: 78, cover: '/assets/agents/image_6_yi19x4.jpg', tags: [{ text: '神话', color: T.secondary }, { text: 'RPG', color: T.primary }, { text: '开放世界', color: '#6366f1' }] },
  { title: '时间回溯者', progress: 100, cover: '/assets/agents/image_7_yi19x4.jpg', done: true, tags: [{ text: '科幻', color: T.magenta }, { text: '解谜', color: '#3b82f6' }, { text: '剧情', color: '#f59e0b' }] },
  { title: '元素学院物语', progress: 56, cover: '/assets/agents/image_8_yi19x4.jpg', tags: [{ text: '教育', color: T.orange }, { text: '冒险', color: '#14b8a6' }, { text: '策略', color: '#ec4899' }] },
  { title: '量子迷宫', progress: 12, cover: '/assets/agents/image_9_yi19x4.jpg', tags: [{ text: '科幻', color: T.magenta }, { text: '解谜', color: '#3b82f6' }, { text: '益智', color: T.successBright }] },
]

// ── 动态数据 ──
const ACTIVITIES = [
  { agent: 'AI制作人', action: '完成了', target: '《山海经·洪荒纪元》项目评估', time: '2分钟前', color: T.primary, glow: 'rgba(0,212,255,0.4)' },
  { agent: '玩法总监', action: '更新了', target: '战斗系统设计方案V2.1', time: '15分钟前', color: T.magenta, glow: 'rgba(233,62,245,0.3)' },
  { agent: '美术总监', action: '生成了', target: '新角色概念图集（12张）', time: '1小时前', color: T.orange, glow: 'rgba(255,140,0,0.3)' },
  { agent: '世界构筑师', action: '扩展了', target: '神话背景设定（3章）', time: '2小时前', color: T.secondary, glow: 'rgba(168,85,247,0.4)' },
  { agent: '系统设计师', action: '优化了', target: '装备成长曲线模型', time: '3小时前', color: '#6366f1', glow: 'rgba(99,102,241,0.4)' },
]

// ── 快捷入口 ──
const QUICK_ACCESS = [
  { icon: 'cpu', label: 'AI工作台', step: STEPS.AISTUDIO, color: T.primary, bg: 'rgba(0,212,255,0.12)', border: 'rgba(0,212,255,0.25)' },
  { icon: 'folder-plus', label: '新建项目', step: STEPS.SUBJECT, color: T.magenta, bg: 'rgba(233,62,245,0.12)', border: 'rgba(233,62,245,0.25)' },
  { icon: 'layout-template', label: '模板库', step: STEPS.GAMEPLAY, color: T.secondary, bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.25)' },
  { icon: 'star', label: '我的收藏', step: STEPS.PROJECTS, color: T.orange, bg: 'rgba(255,140,0,0.12)', border: 'rgba(255,140,0,0.25)' },
]

// ── 资源中心 ──
const RESOURCES = [
  { icon: 'book-open', label: '知识库', count: 42, color: T.primary, bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.15)' },
  { icon: 'image', label: '素材库', count: 128, color: T.magenta, bg: 'rgba(233,62,245,0.1)', border: 'rgba(233,62,245,0.15)' },
  { icon: 'box', label: '模型库', count: 36, color: T.secondary, bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.15)' },
  { icon: 'message-square', label: '提示词库', count: 215, color: T.orange, bg: 'rgba(255,140,0,0.1)', border: 'rgba(255,140,0,0.15)' },
]

// ── 推荐 ──
const RECOMMENDATIONS = [
  { icon: 'award', title: '灵感大师', desc: '累计产出100+灵感', color: T.orange, bg: 'rgba(255,140,0,0.12)', border: 'rgba(255,140,0,0.25)' },
  { icon: 'palette', title: '赛博都市模板包', desc: '10+精品RPG游戏模板', color: T.magenta, bg: 'rgba(233,62,245,0.12)', border: 'rgba(233,62,245,0.25)' },
  { icon: 'zap', title: 'AI叙事增强包', desc: '提示词优化合集', color: T.primary, bg: 'rgba(0,212,255,0.12)', border: 'rgba(0,212,255,0.25)' },
]

// ── 统计卡 ──
const STAT_CARDS = [
  { icon: 'lightbulb', label: '灵感产出', value: '128', trend: '42', color: T.primary, bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.2)', glowClass: 'glow-cyan' },
  { icon: 'zap', label: 'AI协作效率', value: '94%', trend: '10%', color: T.magenta, bg: 'rgba(233,62,245,0.1)', border: 'rgba(233,62,245,0.2)', glowClass: 'glow-magenta' },
  { icon: 'star', label: '作品质量评分', value: '4.9', suffix: '/5.0', trend: '0.1', color: T.orange, bg: 'rgba(255,140,0,0.1)', border: 'rgba(255,140,0,0.2)', glowClass: 'glow-orange' },
]

// ── 环形图图例 ──
const CHART_LEGEND = [
  { label: '世界构建', value: '28%', color: '#00d4ff' },
  { label: '玩法设计', value: '24%', color: '#e93ef5' },
  { label: '美术生成', value: '22%', color: '#a855f7' },
  { label: '系统建模', value: '16%', color: '#ff8c00' },
  { label: '其他工具', value: '10%', color: '#6366f1' },
]

// ── 标签药丸 ──
function TagPill({ text, color }) {
  const r = parseInt(color.slice(1, 3), 16), g = parseInt(color.slice(3, 5), 16), b = parseInt(color.slice(5, 7), 16)
  return html`
    <span class="inline-flex items-center text-[10px] leading-none px-2 py-1 rounded-full border whitespace-nowrap"
          style=${{ color, borderColor: `rgba(${r},${g},${b},0.3)`, background: `rgba(${r},${g},${b},0.08)` }}>
      ${text}
    </span>
  `
}

// ── 玻璃卡片 ──
function GlassCard({ children, style }) {
  return html`
    <div class="rounded-[14px] p-5"
         style=${{
           background: T.glassBg,
           backdropFilter: 'blur(12px)',
           WebkitBackdropFilter: 'blur(12px)',
           border: `1px solid ${T.glassBorder}`,
           boxShadow: T.shadowCard,
           ...style,
         }}>
      ${children}
    </div>
  `
}

// ── 区块标题 ──
function SectionTitle({ children }) {
  return html`
    <h2 class="flex items-center gap-2 text-[18px] font-bold leading-none tracking-wide" style=${{ color: T.textPrimary }}>
      <span class="inline-block w-1 h-[18px] rounded-sm shrink-0" style=${{ background: T.gradCyanMagenta }}></span>
      ${children}
    </h2>
  `
}

// ── 进度条 ──
function ProgressTrack({ fill, fillStyle }) {
  return html`
    <div class="w-full h-1.5 rounded-full overflow-hidden" style=${{ background: 'rgba(255,255,255,0.06)' }}>
      <div class="h-full rounded-full" style=${{ width: `${fill}%`, background: fillStyle || T.gradProgress }}></div>
    </div>
  `
}

export default function ProfilePage() {
  const { state, dispatch } = useContext(AppContext)
  const [projectTab, setProjectTab] = useState('全部')

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  // 每次渲染后初始化 Lucide 图标
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons()
    }
  })

  const go = (step) => {
    dispatch({ type: 'SET_STEP', payload: step })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goAuth = () => go(STEPS.AUTH)

  // 未登录
  if (!state.user) {
    return html`
      <div class="min-h-screen" style=${{ background: T.bgBase }}>
        <${NavBar} />
        <div class="max-w-7xl mx-auto px-6 pt-24 pb-16 text-center">
          <div class="text-6xl mb-4 opacity-60">🫥</div>
          <h3 class="text-lg font-semibold mb-1" style=${{ color: T.textPrimary }}>还没登录呢</h3>
          <p class="text-sm mb-6" style=${{ color: T.textTertiary }}>登录后才能查看个人中心</p>
          <button class="px-5 py-2.5 rounded-lg text-sm font-medium text-white" style=${{ background: T.gradCyanMagenta }} onClick=${goAuth}>去登录</button>
        </div>
        <${Footer} />
      </div>
    `
  }

  const user = state.user

  return html`
    <div class="min-h-screen" style=${{
      background: T.bgBase,
      backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(139,92,246,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(0,212,255,0.06) 0%, transparent 50%)`,
      backgroundAttachment: 'fixed',
      fontFamily: '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", "Segoe UI", system-ui, sans-serif',
    }}>
      <${NavBar} />

      <style>${`
        .glow-cyan { text-shadow: 0 0 14px rgba(0,212,255,0.5); }
        .glow-magenta { text-shadow: 0 0 14px rgba(233,62,245,0.4); }
        .glow-orange { text-shadow: 0 0 14px rgba(255,140,0,0.4); }
        .glow-purple { text-shadow: 0 0 14px rgba(168,85,247,0.4); }
        .cj-nav-link { font-size: 13px; color: ${T.textSecondary}; padding: 6px 14px; border-radius: ${T.radiusMd}; cursor: pointer; white-space: nowrap; transition: 150ms; }
        .cj-nav-link:hover { color: ${T.textPrimary}; background: rgba(139,92,246,0.1); }
        .cj-tab-btn { font-size: 12px; padding: 5px 14px; border-radius: 9999px; color: ${T.textTertiary}; cursor: pointer; border: 1px solid transparent; background: transparent; white-space: nowrap; transition: 150ms; }
        .cj-tab-btn:hover { color: ${T.textSecondary}; }
        .cj-tab-btn.active { color: ${T.primary}; background: rgba(0,212,255,0.1); border-color: rgba(0,212,255,0.25); }
        [data-lucide] { width: 1em; height: 1em; display: inline-flex; }
        @media (max-width: 900px) {
          .cj-content-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <!-- ===== Hero Banner ~280px ===== -->
      <section class="relative h-[280px] overflow-hidden mt-14"
               style=${{
                 backgroundImage: 'url(/assets/agents/image_0_yi19x4.jpg)',
                 backgroundSize: 'cover',
                 backgroundPosition: 'center center',
                 backgroundRepeat: 'no-repeat',
                 backgroundAttachment: 'fixed',
               }}>
        <div class="absolute inset-0" style=${{ background: 'linear-gradient(180deg, rgba(13,8,32,0.3) 0%, rgba(13,8,32,0.95) 100%)' }}></div>
        <div class="absolute inset-0" style=${{ background: 'linear-gradient(90deg, rgba(10,5,24,0.65) 0%, transparent 55%)' }}></div>

        <div class="relative h-full px-4 sm:px-8 py-6 flex items-center justify-between gap-4 sm:gap-8 max-w-7xl mx-auto">
          <!-- 左：资料块 -->
          <div class="flex items-start gap-5 min-w-0">
            <!-- 头像 72px + 青色光环 -->
            <div class="relative flex-shrink-0">
              <div class="w-[72px] h-[72px] rounded-full overflow-hidden"
                   style=${{ border: '2px solid rgba(0,212,255,0.5)', boxShadow: '0 0 20px rgba(0,212,255,0.35)' }}>
                <img src=${user.avatar || '/assets/agents/image_1_yi19x4.jpg'} class="w-full h-full object-cover" alt="avatar" />
              </div>
              <div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                   style=${{ background: T.bgBase, border: `2px solid ${T.bgBase}` }}>
                <div class="w-2 h-2 rounded-full" style=${{ background: T.successBright, boxShadow: '0 0 6px rgba(52,211,153,0.6)' }}></div>
              </div>
            </div>
            <!-- 资料 -->
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-xl font-bold text-white">${user.nickname || '造物主 · demo'}</span>
                <i data-lucide="badge-check" style=${{ width: '20px', height: '20px', color: '#3b82f6' }}></i>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                      style=${{ background: T.gradOrange, boxShadow: '0 0 10px rgba(255,140,0,0.3)' }}>PRO</span>
              </div>
              <div class="text-[13px] mb-1 flex items-center gap-1.5" style=${{ color: T.textSecondary }}>
                <i data-lucide="mail" style=${{ width: '14px', height: '14px' }}></i> ${user.email || 'demo@chuangjieshan.com'}
              </div>
              <div class="text-[11px] mb-2.5 flex items-center gap-1.5" style=${{ color: T.textTertiary }}>
                <i data-lucide="calendar-days" style=${{ width: '14px', height: '14px' }}></i> 2026年6月15日 注册 | 2026年7月14日 最后登录
              </div>
              <div class="flex items-center gap-2 mb-2.5 flex-wrap">
                <${TagPill} text="游戏创作者" color=${T.primary} />
                <${TagPill} text="AI原生设计师" color=${T.secondary} />
                <${TagPill} text="科幻爱好者" color=${T.magenta} />
              </div>
              <div class="text-[13px] italic" style=${{ color: T.textSecondary }}>
                "创意是火花，AI是燃料，我们一起，让游戏世界无限延展"
              </div>
            </div>
          </div>

          <!-- 右：指标 + XP 条 -->
          <div class="hidden md:flex flex-col items-end gap-5 flex-shrink-0">
            <div class="flex items-center gap-6">
              <div class="text-center">
                <div class="text-2xl font-bold glow-cyan" style=${{ color: T.primary }}>12</div>
                <div class="text-[11px] mt-0.5" style=${{ color: T.textTertiary }}>项目总数</div>
              </div>
              <div class="w-px h-9" style=${{ background: T.borderDefault }}></div>
              <div class="text-center">
                <div class="text-2xl font-bold glow-orange" style=${{ color: T.orange }}>48h</div>
                <div class="text-[11px] mt-0.5" style=${{ color: T.textTertiary }}>累计使用时长</div>
              </div>
              <div class="w-px h-9" style=${{ background: T.borderDefault }}></div>
              <div class="text-center">
                <div class="text-lg font-bold glow-magenta whitespace-nowrap" style=${{ color: T.magenta }}>学神本神</div>
                <div class="text-[11px] mt-0.5" style=${{ color: T.textTertiary }}>AI角色</div>
              </div>
              <div class="w-px h-9" style=${{ background: T.borderDefault }}></div>
              <div class="text-center">
                <div class="text-2xl font-bold glow-purple" style=${{ color: T.secondary }}>5</div>
                <div class="text-[11px] mt-0.5" style=${{ color: T.textTertiary }}>社区分享数</div>
              </div>
            </div>
            <!-- XP 进度条 -->
            <div class="w-[440px]">
              <div class="flex items-center justify-between mb-1.5">
                <div class="flex items-center gap-2">
                  <span class="text-[13px] font-bold px-2.5 py-0.5 rounded-md text-white" style=${{ background: T.gradCyanMagenta }}>Lv.28</span>
                  <span class="text-[11px]" style=${{ color: T.textTertiary }}>6320/9800 XP</span>
                </div>
                <span class="text-[11px]" style=${{ color: T.textTertiary }}>距离下一级还需 1,580 XP</span>
              </div>
              <div class="w-full h-2 rounded-full overflow-hidden" style=${{ background: 'rgba(255,255,255,0.06)' }}>
                <div class="h-full rounded-full" style=${{ width: '64.5%', background: T.gradProgress }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== 内容网格 ===== -->
      <div class="px-4 sm:px-8 py-6 grid gap-6 max-w-7xl mx-auto cj-content-grid" style=${{ gridTemplateColumns: 'minmax(0, 1.86fr) minmax(0, 1fr)' }}>

        <!-- ===== 左列 ===== -->
        <div class="flex flex-col gap-6 min-w-0">

          <!-- ── 我的AI团队 ── -->
          <${GlassCard}>
            <div class="flex items-center justify-between mb-4">
              <${SectionTitle}>我的AI团队<//>
              <button class="text-xs flex items-center gap-1" style=${{ color: T.textTertiary }} onClick=${() => go(STEPS.AGENTS)}>
                管理团队 <i data-lucide="chevron-right" style=${{ width: '14px', height: '14px' }}></i>
              </button>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              ${AI_TEAM.map((agent) => html`
                <div key=${agent.name} class="flex flex-col items-center text-center p-3 rounded-[10px]"
                     style=${{ background: 'rgba(139,92,246,0.04)', border: `1px solid ${T.glassBorder}` }}>
                  <div class="w-16 h-16 rounded-full overflow-hidden mb-2.5"
                       style=${{ border: `2px solid ${agent.borderColor}`, boxShadow: `0 0 12px ${agent.glow}` }}>
                    <img src=${agent.avatar} class="w-full h-full object-cover" alt=${agent.name} />
                  </div>
                  <div class="text-[14px] font-bold text-white mb-1">${agent.name}</div>
                  <div class="text-[10px] leading-tight mb-2.5" style=${{ color: T.textTertiary, minHeight: '26px' }}>${agent.desc}</div>
                  <div class="w-full">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-[10px]" style=${{ color: T.textTertiary }}>协作度</span>
                      <span class="text-[11px] font-bold" style=${{ color: agent.color }}>${agent.collab}%</span>
                    </div>
                    <${ProgressTrack} fill=${agent.collab} />
                  </div>
                </div>
              `)}
            </div>
            <!-- 连接线 -->
            <div class="mt-4 flex items-center gap-3">
              <div class="flex-1 h-px" style=${{ background: `linear-gradient(90deg, transparent, ${T.borderDefault} 20%, ${T.borderDefault} 80%, transparent)` }}></div>
              <div class="flex items-center gap-1.5 text-[10px] whitespace-nowrap" style=${{ color: T.textTertiary }}>
                <span class="w-1.5 h-1.5 rounded-full" style=${{ background: T.successBright, boxShadow: '0 0 6px rgba(52,211,153,0.6)' }}></span>
                <i data-lucide="zap" style=${{ width: '12px', height: '12px' }}></i> AI 团队实时协作中
              </div>
              <div class="flex-1 h-px" style=${{ background: `linear-gradient(90deg, transparent, ${T.borderDefault} 20%, ${T.borderDefault} 80%, transparent)` }}></div>
            </div>
          <//>

          <!-- ── 我的项目 ── -->
          <${GlassCard}>
            <div class="flex items-center justify-between mb-4">
              <${SectionTitle}>我的项目<//>
              <div class="flex items-center gap-1">
                ${['全部', '进行中', '已完成', '收藏'].map((tab) => html`
                  <button key=${tab} class=${`cj-tab-btn ${projectTab === tab ? 'active' : ''}`} onClick=${() => setProjectTab(tab)}>${tab}</button>
                `)}
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${PROJECTS.map((proj) => {
                return html`
                  <div key=${proj.title} class="rounded-[10px] overflow-hidden cursor-pointer"
                       style=${{ background: 'rgba(139,92,246,0.04)', border: `1px solid ${T.glassBorder}` }}
                       onClick=${() => go(STEPS.PROJECTS)}>
                    <div class="relative aspect-video overflow-hidden">
                      <img src=${proj.cover} class="w-full h-full object-cover" alt=${proj.title} />
                      <div class="absolute inset-0" style=${{ background: 'linear-gradient(180deg, transparent 40%, rgba(10,5,24,0.9) 100%)' }}></div>
                      ${proj.done ? html`
                        <div class="absolute top-2.5 right-2.5 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"
                             style=${{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: T.successBright, backdropFilter: 'blur(4px)' }}>
                          <i data-lucide="check" style=${{ width: '12px', height: '12px' }}></i> 100%
                        </div>
                      ` : html`
                        <div class="absolute top-2.5 right-2.5 px-2 py-1 rounded-full text-[10px] font-bold"
                             style=${{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', color: T.primary, backdropFilter: 'blur(4px)' }}>${proj.progress}%</div>
                      `}
                    </div>
                    <div class="p-3.5">
                      <div class="text-[14px] font-bold text-white mb-2.5">${proj.title}</div>
                      <div class="mb-2.5">
                        <${ProgressTrack} fill=${proj.progress}
                          fillStyle=${proj.done ? 'linear-gradient(90deg, #10b981, #00d4ff)' : T.gradProgress} />
                      </div>
                      <div class="flex items-center gap-1.5 flex-wrap">
                        ${proj.tags.map((tag) => html`<${TagPill} key=${tag.text} text=${tag.text} color=${tag.color} />`)}
                      </div>
                    </div>
                  </div>
                `
              })}
            </div>
          <//>

          <!-- ── 创作数据 ── -->
          <${GlassCard}>
            <div class="flex items-center justify-between mb-4">
              <${SectionTitle}>创作数据<//>
              <span class="text-[11px] flex items-center gap-1" style=${{ color: T.textTertiary }}>
                <i data-lucide="calendar-days" style=${{ width: '14px', height: '14px' }}></i> 本月数据
              </span>
            </div>
            <!-- 3 统计卡 -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              ${STAT_CARDS.map((stat) => html`
                <div key=${stat.label} class="flex items-center gap-3 p-3.5 rounded-[10px]" style=${{ background: 'rgba(139,92,246,0.05)', border: `1px solid ${T.glassBorder}` }}>
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                       style=${{ background: stat.bg, border: `1px solid ${stat.border}` }}>
                    <i data-lucide=${stat.icon} style=${{ width: '20px', height: '20px', color: stat.color }}></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-[11px] mb-1" style=${{ color: T.textTertiary }}>${stat.label}</div>
                    <div class="flex items-baseline gap-2">
                      <span class=${`text-2xl font-bold ${stat.glowClass}`} style=${{ color: stat.color }}>
                        ${stat.value}${stat.suffix ? html`<span class="text-sm font-normal" style=${{ color: T.textTertiary }}>${stat.suffix}</span>` : ''}
                      </span>
                      <span class="text-[11px] flex items-center gap-0.5 font-semibold" style=${{ color: T.successBright }}>
                        <i data-lucide="trending-up" style=${{ width: '12px', height: '12px' }}></i>${stat.trend}
                      </span>
                    </div>
                  </div>
                </div>
              `)}
            </div>
            <!-- 环形图 + 图例 -->
            <div class="flex items-center gap-6 p-4 rounded-[10px]" style=${{ background: 'rgba(139,92,246,0.03)', border: `1px solid ${T.glassBorder}` }}>
              <${DonutChart} />
              <div class="flex-1 min-w-0">
                <div class="text-[13px] font-bold text-white mb-3">AI工具使用分布</div>
                <div class="flex flex-col gap-2.5">
                  ${CHART_LEGEND.map((item) => html`
                    <div key=${item.label} class="flex items-center gap-2.5 text-[12px]">
                      <span class="w-2.5 h-2.5 rounded-sm flex-shrink-0" style=${{ background: item.color, boxShadow: `0 0 6px ${item.color}66` }}></span>
                      <span style=${{ color: T.textSecondary }}>${item.label}</span>
                      <span class="ml-auto font-bold text-white">${item.value}</span>
                    </div>
                  `)}
                </div>
              </div>
            </div>
          <//>
        </div>

        <!-- ===== 右列 ===== -->
        <div class="flex flex-col gap-6 min-w-0">

          <!-- ── 近期动态 ── -->
          <${GlassCard}>
            <div class="flex items-center justify-between mb-4">
              <${SectionTitle}>近期动态<//>
              <button class="text-xs flex items-center gap-1" style=${{ color: T.textTertiary }} onClick=${() => go(STEPS.NOTIFICATIONS)}>
                查看全部 <i data-lucide="chevron-right" style=${{ width: '14px', height: '14px' }}></i>
              </button>
            </div>
            <div class="relative pl-6">
              <div class="absolute left-[5px] top-2 bottom-2 w-px" style=${{ background: T.borderDefault }}></div>
              ${ACTIVITIES.map((act) => html`
                <div key=${act.agent} class="relative mb-4 last:mb-0">
                  <div class="absolute -left-[22px] top-1 w-3 h-3 rounded-full"
                       style=${{ background: act.color, boxShadow: `0 0 8px ${act.glow}`, border: `2px solid ${T.bgPanel}` }}></div>
                  <div class="text-[13px] leading-snug" style=${{ color: T.textSecondary }}>
                    <span class="font-bold text-white">${act.agent}</span> ${act.action} <span style=${{ color: act.color }}>${act.target}</span>
                  </div>
                  <div class="text-[11px] mt-1 flex items-center gap-1" style=${{ color: T.textTertiary }}>
                    <i data-lucide="clock" style=${{ width: '12px', height: '12px' }}></i> ${act.time}
                  </div>
                </div>
              `)}
            </div>
          <//>

          <!-- ── 快捷入口 ── -->
          <${GlassCard}>
            <${SectionTitle}>快捷入口<//>
            <div class="grid grid-cols-4 gap-3 mt-4">
              ${QUICK_ACCESS.map((qa) => html`
                <button key=${qa.label} class="flex flex-col items-center gap-2 p-4 rounded-[10px]"
                        style=${{ background: 'rgba(139,92,246,0.06)', border: `1px solid ${T.glassBorder}` }}
                        onClick=${() => go(qa.step)}>
                  <div class="w-10 h-10 rounded-full flex items-center justify-center"
                       style=${{ background: qa.bg, border: `1px solid ${qa.border}` }}>
                    <i data-lucide=${qa.icon} style=${{ width: '20px', height: '20px', color: qa.color }}></i>
                  </div>
                  <span class="text-[11px]" style=${{ color: T.textSecondary }}>${qa.label}</span>
                </button>
              `)}
            </div>
          <//>

          <!-- ── 我的资源中心 ── -->
          <${GlassCard}>
            <${SectionTitle}>我的资源中心<//>
            <div class="grid grid-cols-2 gap-3 mt-4">
              ${RESOURCES.map((res) => html`
                <div key=${res.label} class="flex items-center gap-3 p-3 rounded-[10px]"
                     style=${{ background: 'rgba(139,92,246,0.04)', border: `1px solid ${T.glassBorder}` }}>
                  <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                       style=${{ background: res.bg, border: `1px solid ${res.border}` }}>
                    <i data-lucide=${res.icon} style=${{ width: '16px', height: '16px', color: res.color }}></i>
                  </div>
                  <div>
                    <div class="text-[11px]" style=${{ color: T.textTertiary }}>${res.label}</div>
                    <div class="text-lg font-bold text-white">${res.count}</div>
                  </div>
                </div>
              `)}
            </div>
          <//>

          <!-- ── 为你推荐 ── -->
          <${GlassCard}>
            <div class="flex items-center justify-between mb-4">
              <${SectionTitle}>为你推荐<//>
              <button class="text-xs flex items-center gap-1" style=${{ color: T.textTertiary }} onClick=${() => go(STEPS.COMMUNITY)}>
                更多 <i data-lucide="chevron-right" style=${{ width: '14px', height: '14px' }}></i>
              </button>
            </div>
            <div class="flex flex-col gap-3">
              ${RECOMMENDATIONS.map((rec) => html`
                <div key=${rec.title} class="flex items-center gap-3 p-3 rounded-[10px]"
                     style=${{ background: 'rgba(139,92,246,0.04)', border: `1px solid ${T.glassBorder}` }}>
                  <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                       style=${{ background: rec.bg, border: `1px solid ${rec.border}` }}>
                    <i data-lucide=${rec.icon} style=${{ width: '20px', height: '20px', color: rec.color }}></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-[13px] font-bold text-white">${rec.title}</div>
                    <div class="text-[11px]" style=${{ color: T.textTertiary }}>${rec.desc}</div>
                  </div>
                  <button class="px-3 py-1 rounded-full text-[11px] font-bold"
                          style=${{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)', color: T.primary }}>使用</button>
                </div>
              `)}
            </div>
          <//>
        </div>
      </div>

      <${Footer} />
    </div>
  `
}
