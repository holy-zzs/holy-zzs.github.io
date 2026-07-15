// 更新日志 — 时间线布局 + 版本条目 + 分类变更列表
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

// ── 变更类型配置 ──
// new=green, improve=amber, fix=red
const CHANGE_TYPES = {
  new: { icon: '✨', label: '新功能', color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.25)' },
  improve: { icon: '🔧', label: '改进', color: '#F5A623', bg: 'rgba(245,166,35,0.08)', border: 'rgba(245,166,35,0.25)' },
  fix: { icon: '🐛', label: '修复', color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)' },
}

// ── 版本条目（最新在前）──
const VERSIONS = [
  {
    version: 'v2.1.0',
    date: '2026-07-10',
    tagline: '营销体验全面升级',
    isMajor: true,
    changes: [
      { type: 'new', text: '营销页面模块：新增完整的营销着陆页体系，支持核心功能展示与转化引导' },
      { type: 'new', text: '核心功能卡片：可视化展示平台八大核心能力，支持悬停交互与详情展开' },
      { type: 'new', text: 'FAQ 折叠面板：常见问题按分类组织，支持展开/折叠与搜索筛选' },
      { type: 'new', text: '用户评价系统：支持真实用户评价展示，包含星级评分与多维度反馈' },
      { type: 'new', text: '对比优势表：与竞品功能横向对比，直观展示平台差异化优势' },
      { type: 'new', text: '产品路线图：可视化展示已完成、进行中、规划中的功能进展' },
    ],
  },
  {
    version: 'v2.0.0',
    date: '2026-07-09',
    tagline: '复古未来主义全面重构',
    isMajor: true,
    changes: [
      { type: 'new', text: '复古未来主义主题：全平台采用统一的深色复古未来主义视觉语言，沉浸感拉满' },
      { type: 'new', text: 'CRT 圆桌演示：AI 智能体协作过程以 CRT 显示器风格圆桌动画呈现' },
      { type: 'improve', text: '全页面深色统一：所有页面统一深色背景（#05010f），消除浅色/深色混用的割裂感' },
    ],
  },
  {
    version: 'v1.5.0',
    date: '2026-07-08',
    tagline: '智能体生态大扩容',
    isMajor: false,
    changes: [
      { type: 'new', text: '深度分类体系：重构为 8 大部门架构（AI导演/教研/策划/美术/学习科学/叙事/技术/创作伙伴），支持更精细的知识领域匹配' },
      { type: 'new', text: '132 个 AI 专家：新增 AI 制作导演部门与学习科学扩容，覆盖小学到大学全学段' },
      { type: 'new', text: '20 个预设团队：按学段和学科场景预设最佳智能体搭配，一键开团' },
      { type: 'new', text: '学段架构师：新增学段架构师角色，负责根据学段特点调整方案深度与表达' },
    ],
  },
  {
    version: 'v1.1.0',
    date: '2026-07-06',
    tagline: '稳定性与体验优化',
    isMajor: false,
    changes: [
      { type: 'improve', text: '优化教材解析速度，PDF 解析耗时降低 40%' },
      { type: 'improve', text: '改进智能体讨论流程，减少重复发言，提升共识效率' },
      { type: 'fix', text: '修复部分教材上传后内容截断的问题' },
      { type: 'fix', text: '修复移动端导航栏在某些机型上错位的问题' },
    ],
  },
  {
    version: 'v1.0.0',
    date: '2026-07-05',
    tagline: '初始版本正式上线',
    isMajor: true,
    changes: [
      { type: 'new', text: '初始版本上线：核心功能包括学段选择、智能体组队、教材上传、AI 协作、方案生成与导出' },
      { type: 'new', text: '社区方案广场：用户可浏览、收藏、改编社区公开方案' },
      { type: 'new', text: '游戏大厅：沉浸式游戏入口，支持开机动画与高分记录' },
    ],
  },
]

// ── 按变更类型分组 ──
function groupChanges(changes) {
  const groups = { new: [], improve: [], fix: [] }
  changes.forEach(c => {
    if (groups[c.type]) groups[c.type].push(c.text)
  })
  return groups
}

export default function ChangelogPage() {
  const { dispatch } = useContext(AppContext)
  const [filter, setFilter] = useState('all')

  const go = useCallback((step) => {
    dispatch({ type: 'SET_STEP', payload: step })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  // 筛选版本（如果选了类型，只显示包含该类型的版本）
  const filteredVersions = filter === 'all'
    ? VERSIONS
    : VERSIONS.filter(v => v.changes.some(c => c.type === filter))

  // 统计各类型数量
  const stats = {
    new: VERSIONS.reduce((sum, v) => sum + v.changes.filter(c => c.type === 'new').length, 0),
    improve: VERSIONS.reduce((sum, v) => sum + v.changes.filter(c => c.type === 'improve').length, 0),
    fix: VERSIONS.reduce((sum, v) => sum + v.changes.filter(c => c.type === 'fix').length, 0),
  }

  const filters = [
    { id: 'all', label: '全部', icon: '📋', color: C.text },
    { id: 'new', label: '新功能', icon: '✨', color: '#4ade80' },
    { id: 'improve', label: '改进', icon: '🔧', color: '#F5A623' },
    { id: 'fix', label: '修复', icon: '🐛', color: '#f87171' },
  ]

  return html`
    <div style=${{ background: C.bg, minHeight: '100vh' }}>
      <${NavBar} />
      <${PageContainer}>

        <!-- ═══ 页面头部 ═══ -->
        <section class="retro-section-dark relative overflow-hidden rounded-3xl px-6 py-14 sm:px-12 sm:py-20 text-center"
                 style=${{ border: `1px solid ${C.border}` }}>
          <!-- 背景光晕 -->
          <div style=${{
            position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
            width: '500px', height: '500px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)',
            filter: 'blur(50px)', pointerEvents: 'none',
          }}></div>
          <div style=${{
            position: 'absolute', bottom: '-20%', right: '5%',
            width: '300px', height: '300px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,166,35,0.1) 0%, transparent 70%)',
            filter: 'blur(40px)', pointerEvents: 'none',
          }}></div>

          <div class="relative">
            <div class="retro-eyebrow mb-4">// CHANGELOG</div>
            <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight" style=${{ color: C.text }}>
              更新
              <span style=${{
                background: 'linear-gradient(135deg, #a78bfa, #F5A623)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>日志</span>
            </h1>
            <p class="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-2" style=${{ color: C.textMuted }}>
              持续进化中
            </p>
            <p class="text-sm max-w-xl mx-auto leading-relaxed" style=${{ color: C.textDim }}>
              每一次更新都让知识离脑子更近一点。以下是平台的全部版本变更记录。
            </p>
          </div>
        </section>

        <!-- ═══ 统计 & 筛选栏 ═══ -->
        <div class="mt-10 mb-8">
          <!-- 统计卡片 -->
          <div class="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            ${[
              { label: '新功能', count: stats.new, color: '#4ade80', icon: '✨' },
              { label: '改进', count: stats.improve, color: '#F5A623', icon: '🔧' },
              { label: '修复', count: stats.fix, color: '#f87171', icon: '🐛' },
            ].map((s, i) => html`
              <div key=${i} class="retro-section-dark rounded-2xl px-4 py-4 sm:px-6 sm:py-5 text-center"
                   style=${{ border: `1px solid ${C.border}` }}>
                <div class="text-xl sm:text-2xl mb-1">${s.icon}</div>
                <div class="text-2xl sm:text-3xl font-black mb-0.5" style=${{ color: s.color }}>${s.count}</div>
                <div class="text-xs sm:text-sm" style=${{ color: C.textMuted }}>${s.label}</div>
              </div>
            `)}
          </div>

          <!-- 筛选按钮 -->
          <div class="flex items-center justify-center gap-2 flex-wrap">
            ${filters.map(f => {
              const active = filter === f.id
              return html`
                <button key=${f.id}
                  class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200"
                  style=${active
                    ? { background: f.color, color: '#1a0f3d', boxShadow: `0 4px 16px ${f.color}30` }
                    : { background: C.surface, color: C.textMuted, border: `1px solid ${C.border}` }}
                  onMouseEnter=${(e) => { if (!active) { e.target.style.color = f.color; e.target.style.borderColor = `${f.color}40` } }}
                  onMouseLeave=${(e) => { if (!active) { e.target.style.color = C.textMuted; e.target.style.borderColor = C.border } }}
                  onClick=${() => setFilter(f.id)}>
                  <span>${f.icon}</span>
                  <span>${f.label}</span>
                </button>
              `
            })}
          </div>
        </div>

        <!-- ═══ 时间线 ═══ -->
        <div class="relative">
          <!-- 左侧竖线 -->
          <div style=${{
            position: 'absolute',
            left: '23px',
            top: '8px',
            bottom: '8px',
            width: '2px',
            background: `linear-gradient(to bottom, ${C.primary}40, ${C.border} 30%, ${C.border} 70%, ${C.primary}20)`,
          }}></div>

          <div class="space-y-8">
            ${filteredVersions.map((ver, vIdx) => {
              const groups = groupChanges(ver.changes)
              return html`
                <div key=${vIdx} class="relative pl-16">
                  <!-- 时间线圆点 -->
                  <div class="absolute left-0 top-1 w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                       style=${{
                         background: ver.isMajor ? C.bg : 'rgba(5,1,15,0.9)',
                         border: `2px solid ${ver.isMajor ? C.accent : C.primary}`,
                         boxShadow: ver.isMajor ? `0 0 20px ${C.accent}30` : `0 0 12px ${C.primary}20`,
                         zIndex: 2,
                       }}>
                    <span class="text-lg">${ver.isMajor ? '🚀' : '📦'}</span>
                  </div>

                  <!-- 版本卡片 -->
                  <div class="retro-section-dark rounded-2xl px-6 py-6 sm:px-8 sm:py-7 transition-all duration-300"
                       style=${{ border: `1px solid ${C.border}` }}
                       onMouseEnter=${(e) => {
                         e.currentTarget.style.borderColor = `${ver.isMajor ? C.accent : C.primary}30`
                       }}
                       onMouseLeave=${(e) => {
                         e.currentTarget.style.borderColor = C.border
                       }}>
                    <!-- 版本头部 -->
                    <div class="flex items-center justify-between flex-wrap gap-3 mb-5 pb-5 border-b"
                         style=${{ borderColor: C.border }}>
                      <div>
                        <div class="flex items-center gap-2 flex-wrap">
                          <h2 class="text-2xl font-black" style=${{ color: C.text }}>${ver.version}</h2>
                          ${ver.isMajor ? html`
                            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                                  style=${{ background: `${C.accent}15`, color: C.accent, border: `1px solid ${C.accent}30` }}>
                              MAJOR
                            </span>
                          ` : null}
                        </div>
                        <div class="text-sm mt-1" style=${{ color: C.textMuted }}>${ver.tagline}</div>
                      </div>
                      <div class="text-right">
                        <div class="text-sm font-bold" style=${{ color: C.accent }}>${ver.date}</div>
                        <div class="text-xs" style=${{ color: C.textDim }}>${ver.changes.length} 项变更</div>
                      </div>
                    </div>

                    <!-- 变更列表（按类型分组） -->
                    <div class="space-y-4">
                      ${['new', 'improve', 'fix'].map(type => {
                        const items = groups[type]
                        if (!items || items.length === 0) return null
                        const ct = CHANGE_TYPES[type]
                        return html`
                          <div key=${type}>
                            <!-- 类型标签 -->
                            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold mb-2.5"
                                 style=${{ background: ct.bg, color: ct.color, border: `1px solid ${ct.border}` }}>
                              <span>${ct.icon}</span>
                              <span>${ct.label}</span>
                              <span style=${{ color: ct.color, opacity: 0.6 }}>${items.length}</span>
                            </div>
                            <!-- 变更条目 -->
                            <ul class="space-y-2 ml-1">
                              ${items.map((text, iIdx) => html`
                                <li key=${iIdx} class="flex items-start gap-2.5 text-sm leading-relaxed">
                                  <span class="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style=${{ background: ct.color }}></span>
                                  <span style=${{ color: C.textMuted }}>${text}</span>
                                </li>
                              `)}
                            </ul>
                          </div>
                        `
                      })}
                    </div>
                  </div>
                </div>
              `
            })}
          </div>
        </div>

        <!-- ═══ 底部 CTA ═══ -->
        <section class="mt-16 retro-section-dark relative overflow-hidden rounded-3xl px-6 py-12 sm:px-10 sm:py-14 text-center"
                 style=${{ border: `1px solid ${C.border}` }}>
          <div style=${{
            position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
            width: '100%', height: '100%',
            background: 'radial-gradient(ellipse at 50% 100%, rgba(167,139,250,0.1) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}></div>
          <div class="relative">
            <div class="text-3xl mb-3">🔮</div>
            <h2 class="text-2xl sm:text-3xl font-black mb-3" style=${{ color: C.text }}>接下来会更新什么？</h2>
            <p class="text-sm sm:text-base max-w-xl mx-auto mb-8" style=${{ color: C.textMuted }}>
              我们正在开发实时协作编辑、语音方案导读、更多学科智能体等功能。持续进化中，含金量还在上升。
            </p>
            <div class="flex items-center justify-center gap-3 flex-wrap">
              <button class="px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200"
                      style=${{ background: C.accent, color: '#1a0f3d', boxShadow: `0 4px 20px ${C.accent}30` }}
                      onMouseEnter=${(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = `0 8px 28px ${C.accent}50` }}
                      onMouseLeave=${(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 4px 20px ${C.accent}30` }}
                      onClick=${() => go(STEPS.LANDING)}>
                立即体验新版本 →
              </button>
              <button class="px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200"
                      style=${{ background: 'rgba(167,139,250,0.1)', color: C.primary, border: `1px solid ${C.primary}` }}
                      onMouseEnter=${(e) => { e.target.style.background = 'rgba(167,139,250,0.2)' }}
                      onMouseLeave=${(e) => { e.target.style.background = 'rgba(167,139,250,0.1)' }}
                      onClick=${() => go(STEPS.BLOG)}>
                阅读更新详解
              </button>
            </div>
          </div>
        </section>

      <//>
      <${Footer} />
    </div>
  `
}
