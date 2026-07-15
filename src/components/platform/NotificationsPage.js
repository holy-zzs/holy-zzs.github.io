// 通知中心 — 全页通知中心，分类筛选 + 已读/未读管理
import { html, useContext, useState, useCallback } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'
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

// ── 通知类型配置 ──
const TYPE_CONFIG = {
  system: { label: '系统', icon: '⚙️', color: '#a78bfa', border: '#a78bfa' },
  generation: { label: '生成完成', icon: '🎮', color: '#F5A623', border: '#F5A623' },
  community: { label: '社区互动', icon: '💬', color: '#4ade80', border: '#4ade80' },
  invitation: { label: '协作邀请', icon: '🤝', color: '#f472b6', border: '#f472b6' },
}

// ── 筛选标签 ──
const FILTER_TABS = [
  { key: 'all', label: '全部', icon: '📬' },
  { key: 'system', label: '系统', icon: '⚙️' },
  { key: 'generation', label: '生成完成', icon: '🎮' },
  { key: 'community', label: '社区互动', icon: '💬' },
  { key: 'invitation', label: '协作邀请', icon: '🤝' },
]

// ── 示例通知数据 ──
const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    type: 'system',
    icon: '🛠️',
    title: '平台维护通知',
    desc: '平台将于今晚 02:00-04:00 进行例行维护升级，届时部分功能可能暂时不可用，请提前保存好你的方案。',
    time: '2 分钟前',
    read: false,
  },
  {
    id: 2,
    type: 'generation',
    icon: '🎮',
    title: '游戏方案已生成：《物理大冒险》',
    desc: '你的 AI 团队已完成《物理大冒险》方案生成，包含 5 个关卡和 3 种玩法机制，快去查看吧！',
    time: '12 分钟前',
    read: false,
  },
  {
    id: 3,
    type: 'community',
    icon: '⭐',
    title: '你的方案被收藏了',
    desc: '用户「闪电皮卡丘」收藏了你的方案《化学消消乐》，已有 128 人收藏，热度还在涨。',
    time: '1 小时前',
    read: false,
  },
  {
    id: 4,
    type: 'invitation',
    icon: '🤝',
    title: '团队协作邀请',
    desc: '用户「数学老张」邀请你加入《高中数学闯关》项目的协作团队，担任教育顾问角色。',
    time: '2 小时前',
    read: false,
  },
  {
    id: 5,
    type: 'system',
    icon: '✨',
    title: '新功能上线：玩法扭蛋机',
    desc: '随机抽取玩法机制，给你的游戏方案加点惊喜。现在就试试手气，看能抽到什么神仙玩法。',
    time: '3 小时前',
    read: true,
  },
  {
    id: 6,
    type: 'generation',
    icon: '🤖',
    title: 'AI团队协作完成',
    desc: '你的智能体团队已完成第 3 轮讨论，共识度达到 92%，方案进入终稿阶段，可以预览了。',
    time: '5 小时前',
    read: true,
  },
  {
    id: 7,
    type: 'community',
    icon: '💬',
    title: '收到新评论',
    desc: '用户「物理魔法师」在你的方案《力学弹球大作战》下评论：「这个关卡设计太妙了，知识点和玩法的结合非常自然！」',
    time: '昨天',
    read: true,
  },
  {
    id: 8,
    type: 'community',
    icon: '👍',
    title: '你的方案获得了点赞',
    desc: '你的方案《英语单词大逃杀》本周获得了 56 个赞，进入了社区周榜 Top 10，继续冲！',
    time: '昨天',
    read: true,
  },
  {
    id: 9,
    type: 'generation',
    icon: '📥',
    title: '导出任务完成',
    desc: '你的方案《生物进化模拟器》PDF 导出已完成，文件大小 2.3MB，点击下载到本地。',
    time: '2 天前',
    read: true,
  },
  {
    id: 10,
    type: 'system',
    icon: '🏆',
    title: '成就解锁：创作达人',
    desc: '恭喜！你已累计生成 10 个游戏方案，解锁「创作达人」成就徽章，头像框已更新。',
    time: '3 天前',
    read: true,
  },
  {
    id: 11,
    type: 'invitation',
    icon: '📧',
    title: '教师认证通过',
    desc: '你的教师身份认证已通过审核，现在可以使用教师专属功能，包括布置作业和学情统计。',
    time: '5 天前',
    read: true,
  },
  {
    id: 12,
    type: 'community',
    icon: '🔄',
    title: '你的方案被改编',
    desc: '用户「编程小能手」基于你的方案《数列迷宫》创建了改编版本，加入了自己的创意，去看看吧。',
    time: '1 周前',
    read: true,
  },
]

export default function NotificationsPage() {
  const { dispatch } = useContext(AppContext)
  const [activeFilter, setActiveFilter] = useState('all')
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS)

  const go = useCallback((step) => {
    dispatch({ type: 'SET_STEP', payload: step })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  // 筛选通知
  const filtered = activeFilter === 'all'
    ? notifications
    : notifications.filter((n) => n.type === activeFilter)

  const unreadCount = notifications.filter((n) => !n.read).length

  // 标记单条为已读
  const markAsRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  // 全部标为已读
  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  return html`
    <div style=${{ background: C.bg, minHeight: '100vh' }}>
      <${NavBar} />
      <${PageContainer}>

        <!-- ═══ 顶部标题区 ═══ -->
        <section class="retro-section-dark relative overflow-hidden rounded-3xl px-6 py-10 sm:px-10 sm:py-12"
                 style=${{ border: `1px solid ${C.border}` }}>
          <div style=${{
            position: 'absolute', top: '-30%', right: '-5%',
            width: '360px', height: '360px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,166,35,0.1) 0%, transparent 70%)',
            filter: 'blur(40px)', pointerEvents: 'none',
          }}></div>
          <div class="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div class="retro-eyebrow mb-2">// NOTIFICATION CENTER</div>
              <h1 class="text-3xl sm:text-4xl font-black mb-2" style=${{ color: C.text }}>
                通知中心
              </h1>
              <p class="text-sm sm:text-base" style=${{ color: C.textMuted }}>
                ${unreadCount > 0
                  ? html`你有 <span style=${{ color: C.accent, fontWeight: 700 }}>${unreadCount}</span> 条未读消息，别让它们等急了`
                  : '所有消息都已读完，干净利落'}
              </p>
            </div>
            <button class="shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2"
                    style=${{
                      background: unreadCount > 0 ? C.accent : 'rgba(255,255,255,0.04)',
                      color: unreadCount > 0 ? '#1a0f3d' : C.textDim,
                      border: unreadCount > 0 ? 'none' : `1px solid ${C.border}`,
                    }}
                    onMouseEnter=${(e) => { if (unreadCount > 0) e.target.style.boxShadow = `0 4px 20px ${C.accent}30` }}
                    onMouseLeave=${(e) => { e.target.style.boxShadow = 'none' }}
                    onClick=${markAllRead}>
              <span>✓</span> 全部标为已读
            </button>
          </div>
        </section>

        <!-- ═══ 筛选标签栏 ═══ -->
        <section class="mt-6 flex flex-wrap items-center gap-2">
          ${FILTER_TABS.map((tab) => {
            const active = activeFilter === tab.key
            const count = tab.key === 'all'
              ? notifications.length
              : notifications.filter((n) => n.type === tab.key).length
            const unread = tab.key === 'all'
              ? unreadCount
              : notifications.filter((n) => n.type === tab.key && !n.read).length
            return html`
              <button key=${tab.key}
                class="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2"
                style=${active
                  ? { background: C.primary, color: '#fff', boxShadow: `0 4px 16px ${C.primary}30` }
                  : { background: C.surface, color: C.textMuted, border: `1px solid ${C.border}` }}
                onMouseEnter=${(e) => { if (!active) { e.target.style.background = 'rgba(167,139,250,0.1)'; e.target.style.color = C.primary } }}
                onMouseLeave=${(e) => { if (!active) { e.target.style.background = C.surface; e.target.style.color = C.textMuted } }}
                onClick=${() => setActiveFilter(tab.key)}>
                <span>${tab.icon}</span>
                <span>${tab.label}</span>
                ${unread > 0 ? html`
                  <span class="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                        style=${{ background: active ? 'rgba(255,255,255,0.25)' : C.accent, color: active ? '#fff' : '#1a0f3d' }}>
                    ${unread}
                  </span>
                ` : html`<span class="text-xs opacity-50">${count}</span>`}
              </button>
            `
          })}
        </section>

        <!-- ═══ 通知列表 ═══ -->
        <section class="mt-5">
          ${filtered.length === 0 ? html`
            <!-- 空状态 -->
            <div class="retro-section-dark rounded-2xl flex flex-col items-center justify-center py-20 text-center"
                 style=${{ border: `1px solid ${C.border}` }}>
              <div class="text-6xl mb-4 opacity-50">📭</div>
              <h3 class="text-lg font-bold mb-1" style=${{ color: C.text }}>这里空空如也</h3>
              <p class="text-sm" style=${{ color: C.textMuted }}>
                ${activeFilter === 'all' ? '还没有任何通知，去生成个游戏方案吧' : '该分类下暂无通知'}
              </p>
              <button class="mt-6 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                      style=${{ background: C.accent, color: '#1a0f3d' }}
                      onMouseEnter=${(e) => { e.target.style.boxShadow = `0 4px 20px ${C.accent}30` }}
                      onMouseLeave=${(e) => { e.target.style.boxShadow = 'none' }}
                      onClick=${() => go(STEPS.LANDING)}>
                去创建方案 🚀
              </button>
            </div>
          ` : html`
            <div class="space-y-3">
              ${filtered.map((n) => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system
                return html`
                  <div key=${n.id}
                    class="group relative rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-300"
                    style=${{
                      background: n.read ? C.surface : 'rgba(167,139,250,0.05)',
                      border: `1px solid ${n.read ? C.border : `${cfg.border}40`}`,
                      borderLeft: n.read ? `1px solid ${C.border}` : `4px solid ${cfg.border}`,
                    }}
                    onMouseEnter=${(e) => {
                      e.currentTarget.style.background = n.read ? 'rgba(255,255,255,0.06)' : 'rgba(167,139,250,0.08)'
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }}
                    onMouseLeave=${(e) => {
                      e.currentTarget.style.background = n.read ? C.surface : 'rgba(167,139,250,0.05)'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                    onClick=${() => markAsRead(n.id)}>

                    <div class="flex items-start gap-3 sm:gap-4">
                      <!-- 图标 -->
                      <div class="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                           style=${{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                        ${n.icon}
                      </div>

                      <!-- 内容 -->
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap mb-1">
                          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                                style=${{ background: `${cfg.color}15`, color: cfg.color }}>
                            ${cfg.label}
                          </span>
                          ${!n.read ? html`
                            <span class="flex items-center gap-1 text-[10px] font-bold"
                                  style=${{ color: C.accent }}>
                              <span class="w-1.5 h-1.5 rounded-full" style=${{ background: C.accent, boxShadow: `0 0 6px ${C.accent}` }}></span>
                              未读
                            </span>
                          ` : html`
                            <span class="text-[10px]" style=${{ color: C.textDim }}>已读</span>
                          `}
                          <span class="text-[10px] ml-auto" style=${{ color: C.textDim }}>${n.time}</span>
                        </div>
                        <h4 class="text-sm sm:text-base font-bold mb-1" style=${{ color: n.read ? C.textMuted : C.text }}>
                          ${n.title}
                        </h4>
                        <p class="text-xs sm:text-sm leading-relaxed" style=${{ color: C.textMuted }}>
                          ${n.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                `
              })}
            </div>
          `}
        </section>

        <!-- ═══ 底部提示 ═══ -->
        <section class="mt-10 retro-section-dark rounded-2xl px-6 py-6 text-center"
                 style=${{ border: `1px solid ${C.border}` }}>
          <p class="text-sm" style=${{ color: C.textMuted }}>
            通知保留 30 天，过期自动清理。不想错过重要消息？
          </p>
          <button class="mt-3 text-sm font-bold transition-colors"
                  style=${{ color: C.accent }}
                  onMouseEnter=${(e) => { e.target.style.color = '#fbbf24' }}
                  onMouseLeave=${(e) => { e.target.style.color = C.accent }}
                  onClick=${() => go(STEPS.SETTINGS)}>
            前往设置开启邮件通知 →
          </button>
        </section>

      <//>
      <${Footer} />
    </div>
  `
}
