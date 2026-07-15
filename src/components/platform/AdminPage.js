// 管理员 / 教师面板 — 班级管理、学生进度、方案审核、数据统计
import { html, useContext, useState, useCallback } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js?v=ctx2'
import { NavBar, Footer, PageContainer, EmptyState } from './PlatformCommon.js?v=nav3'

// ── 复古未来主义色板 ──
const C = {
  bg: '#05010f',
  text: '#f5e8ff',
  textMuted: '#8b7da8',
  textDim: '#5d4f7a',
  primary: '#a78bfa',
  accent: '#F5A623',
  border: 'rgba(167,139,250,0.12)',
  surface: 'rgba(255,255,255,0.03)',
  surfaceHover: 'rgba(255,255,255,0.06)',
  success: '#4ade80',
  danger: '#f87171',
}

// ── 侧边栏菜单 ──
const SIDEBAR_ITEMS = [
  { id: 'overview', label: '概览', emoji: '📊' },
  { id: 'classes', label: '班级管理', emoji: '🏫' },
  { id: 'students', label: '学生进度', emoji: '📈' },
  { id: 'review', label: '方案审核', emoji: '🔍' },
  { id: 'stats', label: '数据统计', emoji: '📑' },
]

// ── 概览统计卡片 ──
const OVERVIEW_STATS = [
  { id: 'students', label: '总学生数', value: '128', emoji: '👥', color: C.primary },
  { id: 'classes', label: '活跃班级', value: '4', emoji: '🏫', color: C.accent },
  { id: 'plans', label: '本月方案', value: '47', emoji: '📦', color: C.success },
  { id: 'rate', label: '平均完成率', value: '78%', emoji: '🎯', color: '#60a5fa' },
]

// ── 最近活动 ──
const ACTIVITIES = [
  { id: 1, emoji: '🎮', text: '李同学 提交了方案《分数大作战》', time: '5 分钟前', color: C.primary },
  { id: 2, emoji: '✅', text: '王老师 审核通过了《几何侦探》', time: '23 分钟前', color: C.success },
  { id: 3, emoji: '📝', text: '初三2班 新增 3 名学生', time: '1 小时前', color: C.accent },
  { id: 4, emoji: '⭐', text: '张同学 的方案被社区收藏 50 次', time: '2 小时前', color: '#fbbf24' },
  { id: 5, emoji: '🚀', text: '初二1班 完成率突破 90%', time: '昨天', color: '#60a5fa' },
]

// ── 快捷操作 ──
const QUICK_ACTIONS = [
  { id: 1, label: '创建班级', emoji: '➕', color: C.primary },
  { id: 2, label: '批量导入学生', emoji: '📋', color: C.accent },
  { id: 3, label: '导出报告', emoji: '📄', color: C.success },
  { id: 4, label: '发布通知', emoji: '📢', color: '#60a5fa' },
]

// ── 班级列表（mock 4个）──
const CLASSES = [
  { id: 1, name: '初二1班', students: 32, teacher: '王老师', createdAt: '2026-03-01', status: 'active' },
  { id: 2, name: '初三2班', students: 28, teacher: '李老师', createdAt: '2026-03-15', status: 'active' },
  { id: 3, name: '高一数学兴趣组', students: 18, teacher: '张老师', createdAt: '2026-04-10', status: 'active' },
  { id: 4, name: '六年级提升班', students: 24, teacher: '陈老师', createdAt: '2026-05-20', status: 'paused' },
]

// ── 学生进度列表（mock）──
const STUDENTS = [
  { id: 1, name: '李明', className: '初二1班', projects: 6, rate: 92, lastActive: '2小时前', avatar: '🦊' },
  { id: 2, name: '张华', className: '初三2班', projects: 8, rate: 85, lastActive: '昨天', avatar: '🐼' },
  { id: 3, name: '王芳', className: '初二1班', projects: 4, rate: 76, lastActive: '3天前', avatar: '🐱' },
  { id: 4, name: '刘强', className: '高一数学兴趣组', projects: 10, rate: 95, lastActive: '1小时前', avatar: '🦁' },
  { id: 5, name: '赵丽', className: '初三2班', projects: 3, rate: 58, lastActive: '5天前', avatar: '🐰' },
  { id: 6, name: '孙浩', className: '六年级提升班', projects: 5, rate: 68, lastActive: '今天', avatar: '🐯' },
]

// ── 待审核方案（mock）──
const REVIEW_PLANS = [
  { id: 1, title: '函数跑酷大冒险', author: '李明', class: '初二1班', type: '动作跑酷', submittedAt: '今天 10:23', status: 'pending' },
  { id: 2, title: '几何证明密室', author: '刘强', class: '高一数学兴趣组', type: '密室逃脱', submittedAt: '昨天 16:40', status: 'pending' },
  { id: 3, title: '概率抽卡模拟', author: '张华', class: '初三2班', type: '模拟经营', submittedAt: '2天前', status: 'pending' },
]

// ── 状态标签映射 ──
const STATUS_MAP = {
  active: { label: '进行中', color: C.success, bg: 'rgba(74,222,128,0.1)' },
  paused: { label: '已暂停', color: C.textMuted, bg: 'rgba(139,125,168,0.1)' },
  pending: { label: '待审核', color: C.accent, bg: 'rgba(245,166,35,0.1)' },
}

// ── 进度条颜色 ──
function rateColor(rate) {
  if (rate >= 85) return C.success
  if (rate >= 60) return C.accent
  return C.danger
}

export default function AdminPage() {
  const { state, dispatch, toast } = useContext(AppContext)

  // 所有 hooks 必须在条件返回之前调用
  const [activeTab, setActiveTab] = useState('overview')

  const goAuth = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: STEPS.AUTH })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  const handleAction = useCallback((label) => {
    toast(`${label}功能演示中，敬请期待`, 'info')
  }, [toast])

  // ── 未登录：提示登录 ──
  if (!state.user) {
    return html`
      <div style=${{ background: C.bg, minHeight: '100vh' }}>
        <${NavBar} />
        <${PageContainer}>
          <${EmptyState}
            emoji="🔒"
            title="管理员面板需要登录"
            desc="教师/管理员功能仅对已登录用户开放，先登录再来管你的班级吧"
            actionLabel="去登录"
            onAction=${goAuth} />
        <//>
        <${Footer} />
      </div>
    `
  }

  // ── 渲染进度条 ──
  const renderProgress = (rate) => html`
    <div class="flex items-center gap-2 min-w-[120px]">
      <div class="flex-1 h-2 rounded-full overflow-hidden" style=${{ background: 'rgba(255,255,255,0.06)' }}>
        <div class="h-full rounded-full transition-all duration-500"
             style=${{ width: `${rate}%`, background: rateColor(rate) }}></div>
      </div>
      <span class="text-xs font-bold w-9 text-right" style=${{ color: rateColor(rate) }}>${rate}%</span>
    </div>
  `

  return html`
    <div style=${{ background: C.bg, minHeight: '100vh' }}>
      <${NavBar} />
      <${PageContainer}>

        <!-- ═══ 顶部标题 ═══ -->
        <div class="mb-6">
          <div class="retro-eyebrow mb-2">// ADMIN DASHBOARD</div>
          <h1 class="text-2xl sm:text-3xl font-black" style=${{ color: C.text }}>教师 / 管理面板</h1>
          <p class="text-sm mt-1" style=${{ color: C.textMuted }}>班级、学生、方案一站式管理，含金量直接拉满</p>
        </div>

        <!-- ═══ 主体：侧边栏 + 内容 ═══ -->
        <div class="flex flex-col lg:flex-row gap-5">

          <!-- 侧边栏 -->
          <aside class="lg:w-56 shrink-0">
            <div class="rounded-2xl p-2 lg:sticky lg:top-20"
                 style=${{ background: C.surface, border: `1px solid ${C.border}` }}>
              ${SIDEBAR_ITEMS.map((item) => {
                const active = activeTab === item.id
                return html`
                  <button key=${item.id}
                          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 mb-1 last:mb-0"
                          style=${active
                            ? { background: 'rgba(167,139,250,0.12)', color: C.text }
                            : { color: C.textMuted }}
                          onMouseEnter=${(e) => { if (!active) e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.color = C.text }}
                          onMouseLeave=${(e) => { if (!active) { e.target.style.background = 'transparent'; e.target.style.color = C.textMuted } }}
                          onClick=${() => setActiveTab(item.id)}>
                    <span class="text-lg">${item.emoji}</span>
                    <span>${item.label}</span>
                  </button>
                `
              })}
            </div>
          </aside>

          <!-- 内容区 -->
          <main class="flex-1 min-w-0">

            <!-- ═══ 概览 Tab ═══ -->
            ${activeTab === 'overview' && html`
              <div>
                <!-- 统计卡片 -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  ${OVERVIEW_STATS.map((stat) => html`
                    <div key=${stat.id} class="rounded-2xl p-5 transition-all duration-300"
                         style=${{ background: C.surface, border: `1px solid ${C.border}` }}>
                      <div class="flex items-center justify-between mb-3">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                             style=${{ background: 'rgba(167,139,250,0.08)' }}>${stat.emoji}</div>
                      </div>
                      <div class="text-2xl sm:text-3xl font-black" style=${{ color: stat.color }}>${stat.value}</div>
                      <div class="text-xs mt-1" style=${{ color: C.textMuted }}>${stat.label}</div>
                    </div>
                  `)}
                </div>

                <!-- 活动 + 快捷操作 -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <!-- 最近活动 -->
                  <div class="lg:col-span-2 rounded-2xl p-5" style=${{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <h3 class="text-sm font-bold mb-4" style=${{ color: C.text }}>最近活动</h3>
                    <div class="space-y-1">
                      ${ACTIVITIES.map((act) => html`
                        <div key=${act.id} class="flex items-center gap-3 py-2.5 px-2 rounded-lg transition-colors"
                             onMouseEnter=${(e) => { e.target.style.background = 'rgba(167,139,250,0.04)' }}
                             onMouseLeave=${(e) => { e.target.style.background = 'transparent' }}>
                          <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                               style=${{ background: 'rgba(255,255,255,0.04)' }}>${act.emoji}</div>
                          <div class="flex-1 min-w-0">
                            <div class="text-sm truncate" style=${{ color: C.text }}>${act.text}</div>
                          </div>
                          <div class="text-xs shrink-0" style=${{ color: C.textDim }}>${act.time}</div>
                        </div>
                      `)}
                    </div>
                  </div>

                  <!-- 快捷操作 -->
                  <div class="rounded-2xl p-5" style=${{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <h3 class="text-sm font-bold mb-4" style=${{ color: C.text }}>快捷操作</h3>
                    <div class="grid grid-cols-2 gap-3">
                      ${QUICK_ACTIONS.map((act) => html`
                        <button key=${act.id}
                                class="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200"
                                style=${{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}
                                onMouseEnter=${(e) => { e.target.style.background = 'rgba(167,139,250,0.06)'; e.target.style.borderColor = act.color }}
                                onMouseLeave=${(e) => { e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.borderColor = C.border }}
                                onClick=${() => handleAction(act.label)}>
                          <span class="text-2xl">${act.emoji}</span>
                          <span class="text-xs font-medium" style=${{ color: C.textMuted }}>${act.label}</span>
                        </button>
                      `)}
                    </div>
                  </div>
                </div>
              </div>
            `}

            <!-- ═══ 班级管理 Tab ═══ -->
            ${activeTab === 'classes' && html`
              <div>
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-bold" style=${{ color: C.text }}>班级列表</h3>
                  <button class="px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200"
                          style=${{ background: C.accent, color: '#1a0f3d', boxShadow: `0 4px 16px ${C.accent}30` }}
                          onMouseEnter=${(e) => { e.target.style.transform = 'translateY(-1px)' }}
                          onMouseLeave=${(e) => { e.target.style.transform = 'translateY(0)' }}
                          onClick=${() => handleAction('创建班级')}>
                    ➕ 创建班级
                  </button>
                </div>
                <div class="rounded-2xl overflow-hidden" style=${{ border: `1px solid ${C.border}`, background: C.surface }}>
                  <!-- 表头 -->
                  <div class="grid grid-cols-12 gap-2 px-4 sm:px-5 py-3 text-xs font-bold uppercase tracking-wider"
                       style=${{ background: 'rgba(167,139,250,0.04)', borderBottom: `1px solid ${C.border}`, color: C.primary }}>
                    <div class="col-span-4">班级名称</div>
                    <div class="col-span-2 text-center">学生数</div>
                    <div class="col-span-2 text-center">教师</div>
                    <div class="col-span-2 text-center hidden sm:block">创建时间</div>
                    <div class="col-span-2 text-center">状态</div>
                  </div>
                  ${CLASSES.map((cls) => {
                    const st = STATUS_MAP[cls.status]
                    return html`
                      <div key=${cls.id}
                           class="grid grid-cols-12 gap-2 px-4 sm:px-5 py-3.5 items-center text-sm transition-colors"
                           style=${{ borderBottom: `1px solid ${C.border}` }}
                           onMouseEnter=${(e) => { e.target.style.background = 'rgba(167,139,250,0.04)' }}
                           onMouseLeave=${(e) => { e.target.style.background = 'transparent' }}>
                        <div class="col-span-4 font-semibold truncate" style=${{ color: C.text }}>🏫 ${cls.name}</div>
                        <div class="col-span-2 text-center" style=${{ color: C.accent }}>${cls.students}</div>
                        <div class="col-span-2 text-center" style=${{ color: C.textMuted }}>${cls.teacher}</div>
                        <div class="col-span-2 text-center hidden sm:block" style=${{ color: C.textDim }}>${cls.createdAt}</div>
                        <div class="col-span-2 text-center">
                          <span class="text-xs px-2 py-1 rounded-full" style=${{ background: st.bg, color: st.color }}>${st.label}</span>
                        </div>
                      </div>
                    `
                  })}
                </div>
              </div>
            `}

            <!-- ═══ 学生进度 Tab ═══ -->
            ${activeTab === 'students' && html`
              <div>
                <h3 class="text-lg font-bold mb-4" style=${{ color: C.text }}>学生进度</h3>
                <div class="rounded-2xl overflow-hidden" style=${{ border: `1px solid ${C.border}`, background: C.surface }}>
                  <!-- 表头 -->
                  <div class="grid grid-cols-12 gap-2 px-4 sm:px-5 py-3 text-xs font-bold uppercase tracking-wider"
                       style=${{ background: 'rgba(167,139,250,0.04)', borderBottom: `1px solid ${C.border}`, color: C.primary }}>
                    <div class="col-span-3">学生</div>
                    <div class="col-span-2 hidden sm:block">班级</div>
                    <div class="col-span-1 text-center">方案</div>
                    <div class="col-span-4">完成率</div>
                    <div class="col-span-2 text-center">最近活跃</div>
                  </div>
                  ${STUDENTS.map((stu) => html`
                    <div key=${stu.id}
                         class="grid grid-cols-12 gap-2 px-4 sm:px-5 py-3.5 items-center text-sm transition-colors"
                         style=${{ borderBottom: `1px solid ${C.border}` }}
                         onMouseEnter=${(e) => { e.target.style.background = 'rgba(167,139,250,0.04)' }}
                         onMouseLeave=${(e) => { e.target.style.background = 'transparent' }}>
                      <div class="col-span-3 flex items-center gap-2 min-w-0">
                        <span class="text-lg shrink-0">${stu.avatar}</span>
                        <span class="font-semibold truncate" style=${{ color: C.text }}>${stu.name}</span>
                      </div>
                      <div class="col-span-2 hidden sm:block truncate" style=${{ color: C.textMuted }}>${stu.className}</div>
                      <div class="col-span-1 text-center" style=${{ color: C.accent }}>${stu.projects}</div>
                      <div class="col-span-4">${renderProgress(stu.rate)}</div>
                      <div class="col-span-2 text-center text-xs" style=${{ color: C.textDim }}>${stu.lastActive}</div>
                    </div>
                  `)}
                </div>
              </div>
            `}

            <!-- ═══ 方案审核 Tab ═══ -->
            ${activeTab === 'review' && html`
              <div>
                <h3 class="text-lg font-bold mb-4" style=${{ color: C.text }}>待审核方案</h3>
                <div class="space-y-3">
                  ${REVIEW_PLANS.map((plan) => {
                    const st = STATUS_MAP[plan.status]
                    return html`
                      <div key=${plan.id} class="rounded-2xl p-5 flex items-center gap-4 flex-wrap"
                           style=${{ background: C.surface, border: `1px solid ${C.border}` }}>
                        <div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                             style=${{ background: 'rgba(167,139,250,0.08)' }}>🎮</div>
                        <div class="flex-1 min-w-0">
                          <div class="font-bold truncate" style=${{ color: C.text }}>${plan.title}</div>
                          <div class="text-xs mt-0.5" style=${{ color: C.textMuted }}>
                            ${plan.author} · ${plan.class} · ${plan.type} · ${plan.submittedAt}
                          </div>
                        </div>
                        <span class="text-xs px-2 py-1 rounded-full shrink-0" style=${{ background: st.bg, color: st.color }}>${st.label}</span>
                        <div class="flex gap-2 shrink-0">
                          <button class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                  style=${{ background: C.success, color: '#06281a' }}
                                  onClick=${() => toast(`已通过《${plan.title}》`, 'success')}>通过</button>
                          <button class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                  style=${{ background: 'rgba(248,113,113,0.12)', color: C.danger, border: `1px solid rgba(248,113,113,0.3)` }}
                                  onClick=${() => toast(`已驳回《${plan.title}》`, 'info')}>驳回</button>
                        </div>
                      </div>
                    `
                  })}
                </div>
              </div>
            `}

            <!-- ═══ 数据统计 Tab ═══ -->
            ${activeTab === 'stats' && html`
              <div>
                <h3 class="text-lg font-bold mb-4" style=${{ color: C.text }}>数据统计</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div class="rounded-2xl p-5" style=${{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <h4 class="text-sm font-bold mb-4" style=${{ color: C.text }}>方案类型分布</h4>
                    ${[['解谜闯关', 35, C.primary], ['RPG冒险', 22, C.accent], ['动作跑酷', 18, C.success], ['模拟经营', 15, '#60a5fa'], ['其他', 10, C.textMuted]].map(([label, pct, color], i) => html`
                      <div key=${i} class="mb-3 last:mb-0">
                        <div class="flex justify-between text-xs mb-1">
                          <span style=${{ color: C.textMuted }}>${label}</span>
                          <span style=${{ color }}>${pct}%</span>
                        </div>
                        <div class="h-2 rounded-full overflow-hidden" style=${{ background: 'rgba(255,255,255,0.06)' }}>
                          <div class="h-full rounded-full" style=${{ width: `${pct}%`, background: color }}></div>
                        </div>
                      </div>
                    `)}
                  </div>
                  <div class="rounded-2xl p-5" style=${{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <h4 class="text-sm font-bold mb-4" style=${{ color: C.text }}>本周活跃趋势</h4>
                    <div class="flex items-end justify-between gap-2 h-32">
                      ${[40, 65, 50, 78, 90, 72, 85].map((h, i) => html`
                        <div key=${i} class="flex-1 flex flex-col items-center gap-1.5">
                          <div class="w-full rounded-t-md transition-all duration-500"
                               style=${{ height: `${h}%`, background: `linear-gradient(to top, ${C.primary}, ${C.accent})`, minHeight: '4px' }}></div>
                          <span class="text-[10px]" style=${{ color: C.textDim }}>${['一', '二', '三', '四', '五', '六', '日'][i]}</span>
                        </div>
                      `)}
                    </div>
                  </div>
                </div>
              </div>
            `}

          </main>
        </div>

      <//>
      <${Footer} />
    </div>
  `
}
