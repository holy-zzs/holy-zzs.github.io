// 平台共享组件：导航栏、进度条、页脚等 — 复古未来主义统一深色系
// v2: 完整导航重构 — AI工作台/资源中心下拉 + 搜索 + 帮助抽屉 + 通知 + 反馈 + 头像菜单
import { PLATFORM_STATS } from '../../data/platformData.js'
import { html, useContext, useEffect, useRef, useState } from '../../deps.js'
import { AppContext, STEPS, useApp } from '../../store/appContext.js'
import { checkBridgeHealth, testApiKey } from '../../lib/aiAdapter.js?v=aip7'
import TacticalPipelineHUD from './TacticalPipelineHUD.js'

// ── 复古未来主义色板 ──
const C = {
  bg: '#05010f',
  bgRadial: 'radial-gradient(ellipse at 50% 80%, #1e0f4d 0%, #0a0420 40%, #05010f 100%)',
  surface: 'rgba(255,255,255,0.03)',
  surfaceHover: 'rgba(255,255,255,0.06)',
  text: '#f5e8ff',
  textMuted: '#8b7da8',
  textDim: '#5d4f7a',
  border: 'rgba(167,139,250,0.12)',
  borderLight: 'rgba(255,255,255,0.06)',
  primary: '#a78bfa',
  accent: '#F5A623',
  accentLight: '#fbbf24',
}

function scrollTopRespectMotion() {
  const reduced = typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
}

// ── AI工作台下拉菜单数据 ──
const WORKBENCH_MENU = [
  { icon: '🎮', label: '创建教育游戏', desc: '选年级→传教材→选玩法→AI开发', step: STEPS.SUBJECT },
  { icon: '📚', label: '上传教材', desc: '支持PDF/图片/文本', step: STEPS.UPLOAD },
  { icon: '🎰', label: '选择玩法', desc: 'AI推荐游戏类型', step: STEPS.GAMEPLAY },
  { icon: '🛸', label: 'AI Game Studio', desc: '智能体调度与开发', step: STEPS.AISTUDIO },
  { icon: '⚡', label: 'AI协作工作台', desc: '多智能体协作生成游戏', step: STEPS.WORKSPACE },
  { icon: '🧪', label: '游戏测试', desc: '预览并调试生成的游戏', step: STEPS.PREVIEW },
]

// ── AI团队下拉菜单数据（独立导航项）──
const TEAM_MENU = [
  { icon: '📦', label: 'AI团队方案库', desc: '20+ 套成熟团队模板，一键套用', step: STEPS.PRESET },
  { icon: '🤖', label: 'AI智能体市场', desc: '120+ 智能体，自由组建团队', step: STEPS.AGENTS },
]

// ── 资源中心下拉菜单数据 ──
const RESOURCE_MENU = [
  { icon: '📖', label: 'AI教学案例', desc: 'AI辅助教学实践案例', step: STEPS.BLOG },
  { icon: '🏗️', label: '游戏模板', desc: 'RPG/SLG/ACT等模板', step: STEPS.GAMEPLAY },
  { icon: '💬', label: 'Prompt模板', desc: '精选AI提示词模板库', step: STEPS.PROTOCOL },
  { icon: '🔍', label: '教材解析案例', desc: 'AI如何解析教材内容', step: STEPS.BLOG },
  { icon: '🌐', label: '社区方案', desc: '用户分享的完整方案', step: STEPS.COMMUNITY },
]

// ── 帮助中心抽屉内容 ──
const HELP_MENU = [
  { icon: '🚀', label: '新手教程', desc: '5分钟快速上手平台' },
  { icon: '👥', label: 'AI团队使用指南', desc: '如何组建和管理AI团队' },
  { icon: '🎮', label: '游戏生成教程', desc: '从上传到生成的完整流程' },
  { icon: '❓', label: '常见问题', desc: '热门问题解答' },
  { icon: '🎬', label: '视频教学', desc: '观看视频教程' },
  { icon: '📝', label: '博客/资源', desc: '技术博客和资源下载' },
]

// ── 通知数据 ──
const NOTIFICATIONS = [
  { icon: '✅', title: 'AI任务完成', desc: '《细胞大作战》游戏已生成完毕', time: '2分钟前', unread: true },
  { icon: '🎮', title: '游戏生成完成', desc: '《力学大师》可以试玩了', time: '1小时前', unread: true },
  { icon: '👥', title: '团队邀请', desc: '张老师邀请你加入「物理游戏」团队', time: '3小时前', unread: true },
  { icon: '📢', title: '系统通知', desc: '平台已升级至v2.0，支持更多游戏类型', time: '昨天', unread: false },
]

// ── 头像菜单数据 ──
const AVATAR_MENU = [
  { icon: '👤', label: '基础资料', step: STEPS.PROFILE },
  { icon: '⚙️', label: 'AI偏好设置', step: STEPS.PREFERENCES },
  { icon: '🔑', label: 'API Key', openSettings: true },
  { icon: '🔧', label: '模型配置', step: STEPS.SETTINGS },
  { icon: '💾', label: '数据管理', step: STEPS.SETTINGS },
  { icon: '🛡️', label: '安全设置', step: STEPS.SETTINGS },
]

// ── 下拉菜单组件 ──
function DropdownMenu({ items, onClose, go }) {
  return html`
    <div class="nav-dropdown-menu">
      <div class="nav-dropdown-inner">
        ${items.map(item => html`
          <button key=${item.label}
            class="nav-dropdown-item"
            onClick=${() => { go(item.step); onClose() }}>
            <span class="nav-dropdown-icon">${item.icon}</span>
            <div class="nav-dropdown-text">
              <div class="nav-dropdown-label">${item.label}</div>
              <div class="nav-dropdown-desc">${item.desc}</div>
            </div>
          </button>
        `)}
      </div>
    </div>
  `
}

// ── 帮助中心抽屉 ──
function HelpDrawer({ open, onClose, go }) {
  if (!open) return null
  return html`
    <div class="help-drawer-overlay" onClick=${onClose}>
      <div class="help-drawer" onClick=${(e) => e.stopPropagation()}>
        <div class="help-drawer-header">
          <h3 class="help-drawer-title">帮助中心</h3>
          <button class="help-drawer-close" onClick=${onClose}>✕</button>
        </div>
        <div class="help-drawer-body">
          ${HELP_MENU.map((item, i) => html`
            <button key=${i}
              class="help-drawer-item"
              onClick=${() => {
                if (item.label === '博客/资源') go(STEPS.BLOG)
                else if (item.label === '常见问题') go(STEPS.HELP)
                else go(STEPS.HELP)
                onClose()
              }}>
              <span class="help-drawer-icon">${item.icon}</span>
              <div class="help-drawer-text">
                <div class="help-drawer-label">${item.label}</div>
                <div class="help-drawer-desc">${item.desc}</div>
              </div>
              <span class="help-drawer-arrow">→</span>
            </button>
          `)}
        </div>
        <div class="help-drawer-footer">
          <p>还有问题？</p>
          <button class="help-drawer-contact" onClick=${() => { go(STEPS.FEEDBACK); onClose() }}>提交反馈 →</button>
        </div>
      </div>
    </div>
  `
}

// ── 通知下拉 ──
function NotificationDropdown({ onClose, go }) {
  return html`
    <div class="nav-dropdown-menu nav-noti-menu">
      <div class="nav-dropdown-inner">
        <div class="nav-noti-header">
          <span>通知中心</span>
          <button class="nav-noti-all" onClick=${() => { go(STEPS.NOTIFICATIONS); onClose() }}>查看全部</button>
        </div>
        ${NOTIFICATIONS.map((n, i) => html`
          <div key=${i} class=${`nav-noti-item ${n.unread ? 'nav-noti-unread' : ''}`}>
            <span class="nav-noti-icon">${n.icon}</span>
            <div class="nav-noti-content">
              <div class="nav-noti-title">${n.title}</div>
              <div class="nav-noti-desc">${n.desc}</div>
              <div class="nav-noti-time">${n.time}</div>
            </div>
            ${n.unread ? html`<span class="nav-noti-dot"></span>` : null}
          </div>
        `)}
      </div>
    </div>
  `
}

// ── 头像下拉菜单 ──
function AvatarDropdown({ onClose, go, user, dispatch }) {
  const { logout, openSettings, state, setConnectionStatus } = useApp()
  const [connTesting, setConnTesting] = useState(false)

  const doTestConn = async () => {
    const settings = state.settings
    setConnTesting(true)
    setConnectionStatus('checking', '检测中...')
    if (settings.engineMode === 'apikey' && settings.apiKey) {
      const result = await testApiKey(settings)
      if (result.ok) {
        setConnectionStatus('connected', settings.apiModel || 'API 已连接')
      } else {
        setConnectionStatus('disconnected', result.error || '连接失败')
      }
    } else if (settings.engineMode === 'localbridge') {
      const result = await checkBridgeHealth(settings.bridgeUrl)
      if (result.online) {
        setConnectionStatus('connected', `桥接在线 · ${result.model || 'auto'}`)
      } else {
        setConnectionStatus('disconnected', result.error || '桥接离线')
      }
    } else if (settings.engineMode === 'demo') {
      setConnectionStatus('demo', '演示模式')
    } else {
      setConnectionStatus('unconfigured', '未配置')
    }
    setConnTesting(false)
  }

  const cs = state.ui?.connectionStatus || 'demo'
  const csLabel = cs === 'connected' ? '已连接'
    : cs === 'disconnected' ? '连接断开'
    : cs === 'checking' ? '检测中...'
    : cs === 'untested' ? '未检测'
    : cs === 'unconfigured' ? '未配置'
    : '演示模式'
  const csLabelFull = state.ui?.connectionLabel || csLabel

  const doLogout = () => {
    logout()
    onClose()
  }
  return html`
    <div class="nav-dropdown-menu nav-avatar-menu">
      <div class="nav-dropdown-inner">
        <div class="nav-avatar-header">
          <div class="nav-avatar-circle" style=${{ background: 'none', overflow: 'hidden', border: '1px solid rgba(167,139,250,0.3)' }}>
              <img src=${user?.avatar || '/assets/agents/image_0_yi19x4.jpg'} alt="头像" style=${{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
            </div>
          <div>
            <div class="nav-avatar-name">${user?.nickname || user?.email?.split('@')[0] || '用户'}</div>
            <div class="nav-avatar-email">${user?.email || ''}</div>
          </div>
        </div>

        <!-- AI 连接状态面板 -->
        <div class="nav-conn-panel">
          <div class="nav-conn-label">AI 引擎状态</div>
          <div class="nav-conn-row">
            <span class="conn-dot ${cs}"></span>
            <div style=${{ flex: '1', minWidth: '0' }}>
              <div class="nav-conn-status ${cs}">${csLabel}</div>
              ${csLabelFull && csLabelFull !== csLabel ? html`<div class="nav-conn-model">${csLabelFull}</div>` : null}
            </div>
          </div>
          <div class="nav-conn-actions">
            <button class="nav-conn-btn primary" onClick=${doTestConn} disabled=${connTesting}>
              ${connTesting ? '⏳ 检测中...' : '🔌 测试连接'}
            </button>
            <button class="nav-conn-btn" onClick=${() => { openSettings(); onClose() }}>
              ⚙️ 设置
            </button>
          </div>
        </div>

        <div class="nav-avatar-section">
          <div class="nav-avatar-section-title">个人中心</div>
          ${AVATAR_MENU.map(item => html`
            <button key=${item.label}
              class="nav-avatar-item"
              onClick=${() => { item.openSettings ? openSettings() : go(item.step); onClose() }}>
              <span>${item.icon}</span>
              <span>${item.label}</span>
            </button>
          `)}
        </div>
        <div class="nav-avatar-section">
          <div class="nav-avatar-section-title">我的账户</div>
          <button class="nav-avatar-item" onClick=${() => { go(STEPS.PROJECTS); onClose() }}>
            <span>📁</span><span>我的项目</span>
          </button>
          <button class="nav-avatar-item" onClick=${() => { go(STEPS.PRESET); onClose() }}>
            <span>👥</span><span>我的团队</span>
          </button>
          <button class="nav-avatar-item" onClick=${() => { go(STEPS.INVITE); onClose() }}>
            <span>🎁</span><span>邀请成员</span>
          </button>
          <button class="nav-avatar-item" onClick=${() => { go(STEPS.INVITE); onClose() }}>
            <span>💰</span><span>分享奖励</span>
          </button>
          <button class="nav-avatar-item" onClick=${() => { openSettings(); onClose() }}>
            <span>🤖</span><span>AI 引擎设置</span>
          </button>
          <button class="nav-avatar-item" onClick=${() => { openSettings(); onClose() }}>
            <span>🔌</span><span>API管理</span>
          </button>
          <button class="nav-avatar-item" onClick=${() => { go(STEPS.PRICING); onClose() }}>
            <span>💎</span><span>套餐管理</span>
          </button>
        </div>
        <div class="nav-avatar-logout">
          <button onClick=${doLogout}>退出登录</button>
        </div>
      </div>
    </div>
  `
}

// ── 反馈悬浮按钮 + 弹窗 ──
export function FeedbackButton() {
  const { dispatch } = useContext(AppContext)
  const [open, setOpen] = useState(false)

  const feedbackItems = [
    { icon: '🐛', label: 'Bug反馈', desc: '报告页面或功能问题' },
    { icon: '💡', label: '功能建议', desc: '告诉我你想要什么新功能' },
    { icon: '🤖', label: 'AI效果评价', desc: '评价AI生成内容的质量' },
  ]

  const go = (step) => {
    // 工作流页面需要前置条件，用 navigate 带守卫
    const WORKFLOW_GUARD_STEPS = new Set([
      STEPS.WORKSPACE, STEPS.PREVIEW, STEPS.UPLOAD, STEPS.GAMEPLAY, STEPS.AISTUDIO
    ])
    if (WORKFLOW_GUARD_STEPS.has(step)) {
      // UPLOAD 需要已选年级+科目
      if (step === STEPS.UPLOAD && (!state.selectedGrade || !state.selectedSubject)) {
        dispatch({ type: 'SET_STEP', payload: STEPS.SUBJECT })
        scrollTopRespectMotion()
        return
      }
      // GAMEPLAY 需要已上传教材
      if (step === STEPS.GAMEPLAY && !state.material) {
        dispatch({ type: 'SET_STEP', payload: STEPS.UPLOAD })
        scrollTopRespectMotion()
        return
      }
      // AISTUDIO 需要已选玩法
      if (step === STEPS.AISTUDIO && !state.selectedGameplay) {
        dispatch({ type: 'SET_STEP', payload: STEPS.GAMEPLAY })
        scrollTopRespectMotion()
        return
      }
      // AISTUDIO 进入时自动分配默认团队
      if (step === STEPS.AISTUDIO && (!state.selectedAgents || state.selectedAgents.length === 0)) {
        dispatch({ type: 'SET_AGENTS', payload: ['captain', 'scholar', 'designer', 'numbers', 'narrative', 'art'] })
      }
      // WORKSPACE 需要已上传教材
      if (step === STEPS.WORKSPACE && !state.material) {
        dispatch({ type: 'SET_STEP', payload: STEPS.UPLOAD })
        scrollTopRespectMotion()
        return
      }
      if (step === STEPS.PREVIEW && !state.designDoc) {
        dispatch({ type: 'SET_STEP', payload: STEPS.WORKSPACE })
        scrollTopRespectMotion()
        return
      }
    }
    dispatch({ type: 'SET_STEP', payload: step })
    scrollTopRespectMotion()
  }

  return html`
    <div class="feedback-fab-wrapper">
      ${open ? html`
        <div class="feedback-popup">
          <div class="feedback-popup-header">
            <span>提交反馈</span>
            <button class="feedback-popup-close" onClick=${() => setOpen(false)}>✕</button>
          </div>
          ${feedbackItems.map((item, i) => html`
            <button key=${i}
              class="feedback-popup-item"
              onClick=${() => { go(STEPS.FEEDBACK); setOpen(false) }}>
              <span class="feedback-popup-icon">${item.icon}</span>
              <div>
                <div class="feedback-popup-label">${item.label}</div>
                <div class="feedback-popup-desc">${item.desc}</div>
              </div>
            </button>
          `)}
        </div>
      ` : null}
      <button class="feedback-fab" onClick=${() => setOpen(!open)} aria-label="提交反馈">
        <span>💬</span>
        <span class="feedback-fab-label">反馈</span>
      </button>
    </div>
  `
}

// ── 顶部导航栏 v2 ──
export function NavBar() {
  const { state, dispatch } = useContext(AppContext)
  const scrolled = useRef(false)
  const closeTimer = useRef(null)
  const [activeMenu, setActiveMenu] = useState(null) // 'workbench' | 'resource' | 'notif' | 'avatar' | null
  const [helpOpen, setHelpOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(() => {
    const onScroll = () => { scrolled.current = window.scrollY > 20 }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 延迟关闭下拉菜单 — 防止鼠标移动时误触
  const openMenu = (menu) => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
    setActiveMenu(menu)
  }
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => {
      setActiveMenu(null)
      closeTimer.current = null
    }, 300)
  }

  const go = (step) => {
    dispatch({ type: 'SET_STEP', payload: step })
    scrollTopRespectMotion()
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      go(STEPS.SEARCH)
    }
  }

  return html`
    <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
         style=${{
           background: scrolled.current ? 'rgba(5,1,15,0.92)' : 'rgba(5,1,15,0.5)',
           backdropFilter: 'blur(20px)',
           WebkitBackdropFilter: 'blur(20px)',
           borderBottom: scrolled.current ? '1px solid rgba(167,139,250,0.12)' : '1px solid transparent'
         }}>
      <div class="nav-bar-inner">

        <!-- ═══ 左侧：Logo（v3: 放大） ═══ -->
        <button type="button"
          class="flex items-center gap-3 select-none shrink-0 group"
          onClick=${() => go(STEPS.LANDING)}
          aria-label="返回首页">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg transition-transform group-hover:scale-105"
               style=${{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 0 14px rgba(139,92,246,0.35)' }}>知</div>
          <div class="hidden lg:block">
            <div class="text-[15px] font-bold leading-tight tracking-tight" style=${{ color: C.text }}>知识不进脑子啊</div>
            <div class="text-[10px] leading-tight tracking-wide" style=${{ color: C.textMuted }}>AI 游戏设计与生产平台</div>
          </div>
        </button>

        <!-- ═══ 中间：导航项 ═══ -->
        <div class="hidden md:flex items-center gap-1">

          <!-- 首页 -->
          <button class="nav-item ${state.step === STEPS.LANDING ? 'nav-item-active' : ''}"
                  onClick=${() => go(STEPS.LANDING)}>首页</button>

          <!-- AI工作台（下拉） -->
          <div class="nav-dropdown-wrapper"
               onMouseEnter=${() => openMenu('workbench')}
               onMouseLeave=${scheduleClose}>
            <button class=${`nav-item nav-item-core ${['subject','preset','agents','upload','workspace','preview'].includes(state.step) ? 'nav-item-active' : ''}`}>
              AI工作台
              <svg width="10" height="10" viewBox="0 0 12 12" style=${{ marginLeft: '2px', opacity: 0.6 }}>
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
            ${activeMenu === 'workbench' ? html`<${DropdownMenu} items=${WORKBENCH_MENU} onClose=${() => setActiveMenu(null)} go=${go} />` : null}
          </div>

          <!-- AI团队（下拉） -->
          <div class="nav-dropdown-wrapper"
               onMouseEnter=${() => openMenu('team')}
               onMouseLeave=${scheduleClose}>
            <button class=${`nav-item ${state.step === STEPS.AGENTS || state.step === STEPS.PRESET ? 'nav-item-active' : ''}`}>
              AI团队
              <svg width="10" height="10" viewBox="0 0 12 12" style=${{ marginLeft: '2px', opacity: 0.6 }}>
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
            ${activeMenu === 'team' ? html`<${DropdownMenu} items=${TEAM_MENU} onClose=${() => setActiveMenu(null)} go=${go} />` : null}
          </div>

          <!-- 游戏广场 -->
          <button class="nav-item ${state.step === STEPS.HALL || state.step === STEPS.GAMEPLAY ? 'nav-item-active' : ''}"
                  onClick=${() => go(STEPS.HALL)}>游戏广场</button>

          <!-- 资源中心（下拉） -->
          <div class="nav-dropdown-wrapper"
               onMouseEnter=${() => openMenu('resource')}
               onMouseLeave=${scheduleClose}>
            <button class=${`nav-item ${['community','blog','gameplay','protocol'].includes(state.step) ? 'nav-item-active' : ''}`}>
              资源中心
              <svg width="10" height="10" viewBox="0 0 12 12" style=${{ marginLeft: '2px', opacity: 0.6 }}>
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
            ${activeMenu === 'resource' ? html`<${DropdownMenu} items=${RESOURCE_MENU} onClose=${() => setActiveMenu(null)} go=${go} />` : null}
          </div>

          <!-- 社区 -->
          <button class="nav-item ${state.step === STEPS.COMMUNITY ? 'nav-item-active' : ''}"
                  onClick=${() => go(STEPS.COMMUNITY)}>社区</button>

          <!-- 定价 -->
          <button class="nav-item ${state.step === STEPS.PRICING ? 'nav-item-active' : ''}"
                  onClick=${() => go(STEPS.PRICING)}>定价</button>
        </div>

        <!-- ═══ 右侧：搜索 + 通知 + 帮助 + 头像（v3: 放大间距） ═══ -->
        <div class="flex items-center gap-2.5 shrink-0">

          <!-- 搜索框 -->
          <div class=${`nav-search-wrapper ${searchFocused ? 'nav-search-focused' : ''}`}>
            <svg class="nav-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M11 11L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <input
              type="text"
              class="nav-search-input"
              placeholder="搜索游戏 / 模板 / Agent / 教材"
              value=${searchQuery}
              onInput=${(e) => setSearchQuery(e.target.value)}
              onKeyPress=${handleSearch}
              onFocus=${() => setSearchFocused(true)}
              onBlur=${() => setSearchFocused(false)}
            />
          </div>

          <!-- 通知铃铛 -->
          <div class="nav-dropdown-wrapper"
               onMouseEnter=${() => openMenu('notif')}
               onMouseLeave=${scheduleClose}>
            <button class="nav-icon-btn" aria-label="通知中心">
              <span>🔔</span>
              <span class="nav-icon-badge">3</span>
            </button>
            ${activeMenu === 'notif' ? html`<${NotificationDropdown} onClose=${() => setActiveMenu(null)} go=${go} />` : null}
          </div>

          <!-- 帮助中心 ? -->
          <button class="nav-icon-btn" onClick=${() => setHelpOpen(true)} aria-label="帮助中心">
            <span>?</span>
          </button>

          <!-- 头像 / 登录 -->
          ${state.user ? html`
            <div class="nav-dropdown-wrapper"
                 onMouseEnter=${() => openMenu('avatar')}
                 onMouseLeave=${scheduleClose}>
              <button class="nav-avatar-btn">
                <div class="nav-avatar-circle">${(state.user?.nickname || state.user?.email?.split('@')[0] || 'C7').slice(0, 2).toUpperCase()}</div>
              </button>
              ${activeMenu === 'avatar' ? html`<${AvatarDropdown} onClose=${() => setActiveMenu(null)} go=${go} user=${state.user} dispatch=${dispatch} />` : null}
            </div>
          ` : html`
            <button class="nav-login-btn" onClick=${() => go(STEPS.AUTH)}>登录</button>
            <button class="nav-cta-btn" onClick=${() => go(STEPS.SUBJECT)}>免费开始</button>
          `}
        </div>
      </div>

      <!-- 移动端导航 -->
      <div class="md:hidden flex items-center gap-1 px-3 py-1.5 border-t overflow-x-auto"
           style=${{ background: 'rgba(5,1,15,0.8)', borderColor: 'rgba(167,139,250,0.1)' }}>
        <button class="nav-item-mobile ${state.step === STEPS.LANDING ? 'nav-item-active' : ''}" onClick=${() => go(STEPS.LANDING)}>首页</button>
        <button class="nav-item-mobile ${state.step === STEPS.SUBJECT ? 'nav-item-active' : ''}" onClick=${() => go(STEPS.SUBJECT)}>AI工作台</button>
        <button class="nav-item-mobile ${state.step === STEPS.AGENTS || state.step === STEPS.PRESET ? 'nav-item-active' : ''}" onClick=${() => go(STEPS.AGENTS)}>AI团队</button>
        <button class="nav-item-mobile ${state.step === STEPS.HALL ? 'nav-item-active' : ''}" onClick=${() => go(STEPS.HALL)}>游戏广场</button>
        <button class="nav-item-mobile ${state.step === STEPS.COMMUNITY ? 'nav-item-active' : ''}" onClick=${() => go(STEPS.COMMUNITY)}>社区</button>
        <button class="nav-item-mobile ${state.step === STEPS.PRICING ? 'nav-item-active' : ''}" onClick=${() => go(STEPS.PRICING)}>定价</button>
      </div>

      <!-- 帮助中心抽屉 -->
      <${HelpDrawer} open=${helpOpen} onClose=${() => setHelpOpen(false)} go=${go} />
    </nav>
  `
}

// ── 流程进度条（深色）──
export function StepProgress({ current, total, labels }) {
  // 渲染战术链路指示器，自动读取当前步骤
  const { state } = useContext(AppContext)
  return html`<${TacticalPipelineHUD} currentStep=${state.step} />`
}

// ── 页面容器 ──
export function PageContainer({ children, className = '' }) {
  return html`<div class=${`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 ${className}`}>${children}</div>`
}

// ── 页脚 v3（极简：仅品牌+版权）──
export function Footer() {
  return html`
    <footer class="border-t mt-16" style=${{ background: C.bg, borderColor: 'rgba(167,139,250,0.08)' }}>
      <div class="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
        <div class="flex flex-col items-center justify-center gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                 style=${{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>知</div>
            <span class="font-bold tracking-tight text-sm" style=${{ color: C.text }}>知识不进脑子啊</span>
            <span class="text-xs" style=${{ color: 'rgba(139,125,168,0.5)' }}>· AI 游戏设计与生产平台</span>
          </div>
          <span class="text-xs" style=${{ color: 'rgba(139,125,168,0.35)' }}>© 2026 知识不进脑子啊 · 让知识以卑鄙的方式进入脑子</span>
        </div>
      </div>
    </footer>
  `
}

// ── 空状态（深色）──
export function EmptyState({ emoji = '📭', title, desc, actionLabel, onAction }) {
  return html`
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <div class="text-6xl mb-4 opacity-60">${emoji}</div>
      <h3 class="text-lg font-semibold mb-1" style=${{ color: C.text }}>${title}</h3>
      ${desc ? html`<p class="text-sm mb-6" style=${{ color: C.textMuted }}>${desc}</p>` : null}
      ${actionLabel ? html`
        <button class="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style=${{ background: C.accent, color: '#1a0f3d' }}
                onClick=${onAction}>
          ${actionLabel}
        </button>
      ` : null}
    </div>
  `
}

// ── Toast提示（深色）──
export function Toast() {
  const { state, dispatch } = useContext(AppContext)
  if (!state.ui.toast) return null
  const t = state.ui.toast
  const styles = {
    success: { bg: 'rgba(74,222,128,0.1)', text: '#4ade80', border: 'rgba(74,222,128,0.3)' },
    error: { bg: 'rgba(248,113,113,0.1)', text: '#f87171', border: 'rgba(248,113,113,0.3)' },
    info: { bg: 'rgba(167,139,250,0.1)', text: '#a78bfa', border: 'rgba(167,139,250,0.3)' },
  }
  const icons = { success: '✅', error: '❌', info: '💡' }
  const s = styles[t.type] || styles.info
  return html`
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-fadeIn">
      <div class="flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-lg"
           style=${{ background: s.bg, color: s.text, borderColor: s.border, backdropFilter: 'blur(12px)' }}>
        <span>${icons[t.type] || icons.info}</span>
        <span class="text-sm font-medium">${t.msg}</span>
      </div>
    </div>
  `
}
