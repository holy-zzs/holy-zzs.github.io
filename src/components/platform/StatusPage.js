// 状态页 — 系统运行状态总览 + 服务健康度 + 30天可用率 + 历史事件 + 维护通知
import { html, useContext, useState, useCallback } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js?v=ctx2'
import { NavBar, Footer, PageContainer } from './PlatformCommon.js?v=nav3'

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
}

// ── 状态指示色 ──
const STATUS_COLOR = {
  green: '#4ade80',
  yellow: '#fbbf24',
  red: '#f87171',
}

// ── 服务列表 ──
const SERVICES = [
  { id: 'web', name: 'Web 应用', desc: '网页前端与用户界面', status: 'green', uptime: '99.98%', response: '142ms' },
  { id: 'ai', name: 'AI 协作引擎', desc: '多智能体讨论与方案生成', status: 'green', uptime: '99.95%', response: '1.2s' },
  { id: 'parse', name: '教材解析服务', desc: 'PDF / 文本知识点提取', status: 'green', uptime: '99.97%', response: '380ms' },
  { id: 'community', name: '社区平台', desc: '方案广场与互动评论', status: 'green', uptime: '99.99%', response: '96ms' },
  { id: 'storage', name: '文件存储', desc: '教材与方案文件持久化', status: 'green', uptime: '99.96%', response: '58ms' },
  { id: 'gateway', name: 'API 网关', desc: '请求路由与鉴权', status: 'green', uptime: '99.99%', response: '34ms' },
]

// ── 30 天可用率历史（green=正常 / yellow=降级 / red=故障）──
const UPTIME_DAYS = (() => {
  const days = []
  const pattern = [
    'green','green','green','green','green','green','green','green','green','green',
    'green','yellow','green','green','green','green','red','green','green','green',
    'green','green','green','green','green','green','green','green','green','green',
  ]
  for (let i = 0; i < 30; i++) {
    days.push({
      day: i,
      status: pattern[i],
      date: `6/${11 + i}`,
    })
  }
  return days
})()

// ── 历史事件 ──
const INCIDENTS = [
  {
    id: 1,
    date: '2026-06-17',
    title: 'AI 协作引擎响应延迟',
    severity: 'degraded',
    desc: '部分用户反馈 AI 讨论生成耗时增加，智能体发言出现 3-5 秒延迟。经排查为模型推理队列积压。',
    resolution: '已扩容推理节点并优化请求调度策略，延迟恢复正常水平。受影响时长约 42 分钟。',
    duration: '42 分钟',
  },
  {
    id: 2,
    date: '2026-06-09',
    title: '教材解析服务短暂不可用',
    severity: 'major',
    desc: 'PDF 上传后解析任务持续失败，错误率飙升至 78%。根因为对象存储服务证书过期导致文件读取中断。',
    resolution: '已更新存储服务证书并增加证书到期自动告警。受影响时长约 1 小时 12 分钟。',
    duration: '1 小时 12 分钟',
  },
  {
    id: 3,
    date: '2026-05-28',
    title: '社区平台评论加载异常',
    severity: 'minor',
    desc: '社区方案详情页评论列表偶发加载失败，刷新后可恢复。问题出在缓存键命名冲突。',
    resolution: '已修复缓存键命名并增加空值兜底逻辑。影响范围较小，未收到大规模投诉。',
    duration: '25 分钟',
  },
]

const SEVERITY_CONFIG = {
  minor: { label: '轻微', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)' },
  degraded: { label: '降级', color: '#f5a623', bg: 'rgba(245,166,35,0.1)', border: 'rgba(245,166,35,0.3)' },
  major: { label: '严重', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)' },
}

export default function StatusPage() {
  const { dispatch } = useContext(AppContext)
  const [hoveredDay, setHoveredDay] = useState(null)

  const go = useCallback((step) => {
    dispatch({ type: 'SET_STEP', payload: step })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  // 计算整体可用率
  const overallUptime = (() => {
    const green = UPTIME_DAYS.filter((d) => d.status === 'green').length
    const yellow = UPTIME_DAYS.filter((d) => d.status === 'yellow').length
    const penalty = yellow * 0.02 + (30 - green - yellow) * 0.1
    return (99.9 + (30 - green - yellow === 0 ? 0.08 : 0) - penalty).toFixed(2)
  })()

  const lastUpdated = '2026-07-10 14:32 (北京时间)'

  return html`
    <div style=${{ background: C.bg, minHeight: '100vh' }}>
      <${NavBar} />
      <${PageContainer}>

        <!-- ═══ 顶部标题 + 整体状态横幅 ═══ -->
        <section class="retro-section-dark relative overflow-hidden rounded-3xl px-6 py-10 sm:px-10 sm:py-12"
                 style=${{ border: `1px solid ${C.border}` }}>
          <div style=${{
            position: 'absolute', top: '-30%', right: '-5%',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%)',
            filter: 'blur(40px)', pointerEvents: 'none',
          }}></div>
          <div class="relative">
            <div class="retro-eyebrow mb-2">// SYSTEM STATUS</div>
            <div class="flex items-center gap-3 mb-3">
              <span class="relative flex h-4 w-4">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                      style=${{ background: STATUS_COLOR.green }}></span>
                <span class="relative inline-flex rounded-full h-4 w-4"
                      style=${{ background: STATUS_COLOR.green, boxShadow: `0 0 12px ${STATUS_COLOR.green}` }}></span>
              </span>
              <h1 class="text-3xl sm:text-4xl font-black" style=${{ color: C.text }}>
                所有系统运行正常
              </h1>
            </div>
            <p class="text-sm sm:text-base" style=${{ color: C.textMuted }}>
              过去 30 天整体可用率
              <span style=${{ color: STATUS_COLOR.green, fontWeight: 700 }}>${overallUptime}%</span>
              ，全部服务状态健康，最近更新于 ${lastUpdated}
            </p>
          </div>
        </section>

        <!-- ═══ 服务状态列表 ═══ -->
        <section class="mt-6 retro-section-dark rounded-2xl px-5 py-5 sm:px-6 sm:py-6"
                 style=${{ border: `1px solid ${C.border}` }}>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold flex items-center gap-2" style=${{ color: C.text }}>
              <span>🛰️</span> 服务状态
            </h2>
            <span class="text-xs" style=${{ color: C.textDim }}>${SERVICES.length} 项服务</span>
          </div>
          <div class="space-y-2.5">
            ${SERVICES.map((s) => {
              const color = STATUS_COLOR[s.status]
              return html`
                <div key=${s.id}
                  class="flex items-center gap-3 sm:gap-4 rounded-xl px-4 py-3.5 transition-all duration-200"
                  style=${{ background: C.surface, border: `1px solid ${C.border}` }}
                  onMouseEnter=${(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                  onMouseLeave=${(e) => { e.currentTarget.style.background = C.surface }}>
                  <!-- 状态指示灯 -->
                  <span class="shrink-0 w-2.5 h-2.5 rounded-full"
                        style=${{ background: color, boxShadow: `0 0 8px ${color}` }}></span>
                  <!-- 名称 + 描述 -->
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-bold" style=${{ color: C.text }}>${s.name}</div>
                    <div class="text-xs" style=${{ color: C.textDim }}>${s.desc}</div>
                  </div>
                  <!-- 状态徽章 -->
                  <span class="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style=${{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                    正常
                  </span>
                  <!-- 可用率 -->
                  <div class="hidden sm:block shrink-0 text-right">
                    <div class="text-[10px] uppercase tracking-wider" style=${{ color: C.textDim }}>可用率</div>
                    <div class="text-xs font-bold" style=${{ color: C.textMuted }}>${s.uptime}</div>
                  </div>
                  <!-- 响应时间 -->
                  <div class="shrink-0 text-right" style=${{ minWidth: '52px' }}>
                    <div class="text-[10px] uppercase tracking-wider" style=${{ color: C.textDim }}>响应</div>
                    <div class="text-xs font-bold" style=${{ color: C.textMuted }}>${s.response}</div>
                  </div>
                </div>
              `
            })}
          </div>
        </section>

        <!-- ═══ 30 天可用率历史 ═══ -->
        <section class="mt-6 retro-section-dark rounded-2xl px-5 py-5 sm:px-6 sm:py-6"
                 style=${{ border: `1px solid ${C.border}` }}>
          <div class="flex items-center justify-between mb-1">
            <h2 class="text-lg font-bold flex items-center gap-2" style=${{ color: C.text }}>
              <span>📊</span> 过去 30 天可用率
            </h2>
            <div class="flex items-center gap-3 text-[10px]" style=${{ color: C.textDim }}>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-sm" style=${{ background: STATUS_COLOR.green }}></span>正常</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-sm" style=${{ background: STATUS_COLOR.yellow }}></span>降级</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-sm" style=${{ background: STATUS_COLOR.red }}></span>故障</span>
            </div>
          </div>
          <p class="text-xs mb-4" style=${{ color: C.textDim }}>将鼠标悬停在柱状条上查看每日详情</p>

          <!-- 柱状图 -->
          <div class="flex items-end gap-[3px]" style=${{ height: '72px' }}>
            ${UPTIME_DAYS.map((d) => {
              const color = STATUS_COLOR[d.status]
              const height = d.status === 'green' ? '100%' : d.status === 'yellow' ? '60%' : '30%'
              return html`
                <div key=${d.day} class="flex-1 relative group"
                     onMouseEnter=${() => setHoveredDay(d)}
                     onMouseLeave=${() => setHoveredDay(null)}>
                  <div class="w-full rounded-sm transition-all duration-200"
                       style=${{
                         height,
                         background: color,
                         opacity: hoveredDay && hoveredDay.day !== d.day ? 0.4 : 1,
                         minHeight: '20px',
                       }}></div>
                  ${hoveredDay && hoveredDay.day === d.day ? html`
                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg whitespace-nowrap z-10"
                         style=${{ background: 'rgba(5,1,15,0.95)', border: `1px solid ${C.border}`, backdropFilter: 'blur(8px)' }}>
                      <div class="text-[10px] font-bold" style=${{ color: C.text }}>${d.date}</div>
                      <div class="text-[10px]" style=${{ color }}>
                        ${d.status === 'green' ? '正常运行' : d.status === 'yellow' ? '服务降级' : '部分故障'}
                      </div>
                    </div>
                  ` : null}
                </div>
              `
            })}
          </div>
          <div class="flex justify-between mt-2 text-[10px]" style=${{ color: C.textDim }}>
            <span>30 天前</span>
            <span>今天</span>
          </div>
        </section>

        <!-- ═══ 历史事件 ═══ -->
        <section class="mt-6 retro-section-dark rounded-2xl px-5 py-5 sm:px-6 sm:py-6"
                 style=${{ border: `1px solid ${C.border}` }}>
          <h2 class="text-lg font-bold flex items-center gap-2 mb-5" style=${{ color: C.text }}>
            <span>📋</span> 历史事件记录
          </h2>
          <div class="relative">
            <!-- 时间线竖线 -->
            <div class="absolute left-[7px] top-2 bottom-2 w-px" style=${{ background: C.border }}></div>
            <div class="space-y-5">
              ${INCIDENTS.map((inc) => {
                const sev = SEVERITY_CONFIG[inc.severity] || SEVERITY_CONFIG.minor
                return html`
                  <div key=${inc.id} class="relative pl-7">
                    <!-- 时间线节点 -->
                    <span class="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2"
                          style=${{ background: C.bg, borderColor: sev.color }}></span>
                    <div class="flex items-center gap-2 flex-wrap mb-1.5">
                      <span class="text-xs font-bold" style=${{ color: C.textMuted }}>${inc.date}</span>
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                            style=${{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                        ${sev.label}
                      </span>
                      <span class="text-[10px]" style=${{ color: C.textDim }}>持续 ${inc.duration}</span>
                    </div>
                    <h4 class="text-sm font-bold mb-1" style=${{ color: C.text }}>${inc.title}</h4>
                    <p class="text-xs leading-relaxed mb-1.5" style=${{ color: C.textMuted }}>${inc.desc}</p>
                    <div class="flex items-start gap-1.5 text-xs leading-relaxed">
                      <span style=${{ color: STATUS_COLOR.green }}>✓</span>
                      <span style=${{ color: C.textDim }}>${inc.resolution}</span>
                    </div>
                  </div>
                `
              })}
            </div>
          </div>
        </section>

        <!-- ═══ 计划维护通知 ═══ -->
        <section class="mt-6 retro-section-dark rounded-2xl px-5 py-5 sm:px-6 sm:py-6"
                 style=${{ border: `1px solid ${C.border}` }}>
          <div class="flex items-start gap-4">
            <div class="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                 style=${{ background: 'rgba(167,139,250,0.1)', border: `1px solid rgba(167,139,250,0.25)` }}>
              🔧
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h2 class="text-base font-bold" style=${{ color: C.text }}>计划维护通知</h2>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style=${{ background: 'rgba(167,139,250,0.1)', color: C.primary }}>
                  即将进行
                </span>
              </div>
              <p class="text-sm leading-relaxed mb-3" style=${{ color: C.textMuted }}>
                平台将于 <span style=${{ color: C.accent, fontWeight: 700 }}>2026-07-13 凌晨 02:00 - 04:00</span>
                进行例行维护升级，届时 AI 协作引擎与教材解析服务将暂停服务约 2 小时。请提前保存好正在进行的方案，
                维护期间可正常浏览社区与已有项目。
              </p>
              <div class="flex flex-wrap gap-3 text-xs">
                <span class="px-2.5 py-1 rounded-lg" style=${{ background: C.surface, color: C.textMuted }}>
                  影响范围：AI 生成、教材上传
                </span>
                <span class="px-2.5 py-1 rounded-lg" style=${{ background: C.surface, color: C.textMuted }}>
                  预计恢复：04:00
                </span>
                <span class="px-2.5 py-1 rounded-lg" style=${{ background: C.surface, color: C.textMuted }}>
                  无需操作
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══ 底部订阅提示 ═══ -->
        <section class="mt-8 rounded-2xl px-6 py-6 text-center"
                 style=${{ border: `1px solid ${C.border}` }}>
          <p class="text-sm mb-3" style=${{ color: C.textMuted }}>
            想第一时间收到状态变更通知？前往反馈页提交你的联系方式，我们会在维护和故障时通知你。
          </p>
          <button class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                  style=${{ background: C.accent, color: '#1a0f3d' }}
                  onMouseEnter=${(e) => { e.target.style.boxShadow = `0 4px 20px ${C.accent}30` }}
                  onMouseLeave=${(e) => { e.target.style.boxShadow = 'none' }}
                  onClick=${() => go(STEPS.FEEDBACK)}>
            前往反馈页 →
          </button>
          <p class="text-[10px] mt-4" style=${{ color: C.textDim }}>
            最后更新时间：${lastUpdated} · 自动每 5 分钟刷新
          </p>
        </section>

      <//>
      <${Footer} />
    </div>
  `
}
