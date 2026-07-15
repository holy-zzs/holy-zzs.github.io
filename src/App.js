// 主应用：Provider + 步骤路由 + 布局切换
import SettingsModal from './components/common/SettingsModal.js'
import { ErrorBanner, LoadingOverlay, Stepper, Toast } from './components/common/ui.js'
import { html, useEffect } from './react.js'
import { AppProvider, STEPS, useApp } from './store/appContext.js'
import { ThemeProvider } from './store/themeContext.js'

// 已有页面
import AuthModal from './components/auth/AuthModal.js'
import AuthView from './components/auth/AuthView.js'
import GameHall from './components/hall/GameHall.js'
import GamePlaza from './components/hall/GamePlaza.js?v=gp8'
// UploadView 已迁移为平台风格的 UploadPage（见下方 import）
import WorkspaceView from './components/platform/WorkspaceView.js?v=wsv8'
import StarVoyagerWorkbench from './components/platform/StarVoyagerWorkbench.js'
import AIStudio from './components/platform/AIStudio.js'
// PreviewView 已迁移为平台风格的游戏播放器（HTML5 game player）
import PreviewView from './components/platform/PreviewView.js'

// 新平台页面（页面1-15）
import GameplayGacha from './components/platform/GameplayGacha.js'
import HelpPage from './components/platform/HelpPage.js'
import LandingPage from './components/platform/LandingPage.js'
import ModePage from './components/platform/ModePage.js'
import PlanDetailPage from './components/platform/PlanDetailPage.js'
import PreferencesPage from './components/platform/PreferencesPage.js'
import PresetTeamPage from './components/platform/PresetTeamPage.js'
import ProfilePage from './components/platform/ProfilePage.js?v=nav2'
import ProjectsPage from './components/platform/ProjectsPage.js'
import ProtocolDemo from './components/platform/ProtocolDemo.js'
import SubjectPage from './components/platform/SubjectPage.js'
import TeamBuilder from './components/platform/TeamBuilder.js'
import UploadPage from './components/platform/UploadPage.js?v=pdf20260715i'

// 新增平台页面
import AboutPage from './components/platform/AboutPage.js'
import AdminPage from './components/platform/AdminPage.js'
import BlogPage from './components/platform/BlogPage.js'
import ChangelogPage from './components/platform/ChangelogPage.js'
import ErrorPage from './components/platform/ErrorPage.js'
import FeedbackPage from './components/platform/FeedbackPage.js'
import InvitePage from './components/platform/InvitePage.js'
import LegalPage from './components/platform/LegalPage.js'
import NotificationsPage from './components/platform/NotificationsPage.js'
import PricingPage from './components/platform/PricingPage.js'
import SearchPage from './components/platform/SearchPage.js'
import SettingsPage from './components/platform/SettingsPage.js'
import StatusPage from './components/platform/StatusPage.js'
import { FeedbackButton } from './components/platform/PlatformCommon.js?v=nav2'

function scrollTopRespectMotion() {
  const reduced = typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
}

// 平台页面集合：这些页面自带 NavBar + Footer，不套 TopBar/Stepper
const PLATFORM_PAGES = new Set([
  STEPS.LANDING, STEPS.SUBJECT, STEPS.MODE, STEPS.PRESET,
  STEPS.AGENTS, STEPS.UPLOAD, STEPS.PREFERENCES, STEPS.PROJECTS,
  STEPS.PROFILE, STEPS.HELP, STEPS.AUTH, STEPS.PLAN_DETAIL, STEPS.PROTOCOL, STEPS.GAMEPLAY,
  STEPS.PRICING, STEPS.SETTINGS, STEPS.NOTIFICATIONS, STEPS.ABOUT, STEPS.BLOG,
  STEPS.LEGAL, STEPS.ERROR_404, STEPS.CHANGELOG, STEPS.STATUS, STEPS.FEEDBACK,
  STEPS.SEARCH, STEPS.INVITE, STEPS.ADMIN, STEPS.STARVOYAGER, STEPS.AISTUDIO
])

// 工作流页面：使用 TopBar + Stepper 布局
const WORKFLOW_PAGES = new Set([
  STEPS.WORKSPACE, STEPS.PREVIEW
])

function TopBar() {
  const { state, dispatch, toast, logout, openSettings, goStep } = useApp()
  const doLogout = () => {
    logout()
    toast('已退出登录', 'info')
  }
  const goHome = () => {
    goStep(STEPS.LANDING)
    scrollTopRespectMotion()
  }

  return html`
    <header class="sticky top-0 z-30 transition-all duration-300"
            style=${{ background: 'rgba(5,1,15,0.88)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(167,139,250,0.12)' }}>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <button type="button" class="flex items-center gap-3 min-w-0" onClick=${goHome} aria-label="返回知识不进脑子啊首页">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg"
               style=${{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 0 12px rgba(139,92,246,0.4)' }}>知</div>
          <span class="hidden md:inline text-sm font-semibold tracking-tight" style=${{ color: '#f5e8ff' }}>知识不进脑子啊</span>
        </button>
        <div class="flex items-center gap-2">
          ${state.user && html`
            <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                 style=${{ background: 'rgba(167,139,250,0.08)', color: '#c4b5e0' }}>
              <img src=${state.user?.avatar || '/assets/agents/image_0_yi19x4.jpg'} alt="头像"
                   class="w-6 h-6 rounded-full object-cover"
                   style=${{ border: '1px solid rgba(167,139,250,0.3)' }} />
              <span class="max-w-[100px] truncate">${state.user.nickname || state.user.email?.split('@')[0] || '用户'}</span>
            </div>
          `}
          <button onClick=${goHome} class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style=${{ color: '#8b7da8' }}
                  onMouseEnter=${(e) => { e.target.style.color = '#a78bfa'; e.target.style.background = 'rgba(167,139,250,0.08)' }}
                  onMouseLeave=${(e) => { e.target.style.color = '#8b7da8'; e.target.style.background = 'transparent' }}>首页</button>
          <button onClick=${openSettings} class="p-2 rounded-xl transition-all" style=${{ color: '#8b7da8' }}
                  onMouseEnter=${(e) => { e.target.style.color = '#a78bfa'; e.target.style.background = 'rgba(167,139,250,0.08)' }}
                  onMouseLeave=${(e) => { e.target.style.color = '#8b7da8'; e.target.style.background = 'transparent' }}>
            <span class="text-lg">⚙️</span>
          </button>
          ${state.user && html`
            <button onClick=${doLogout} class="p-2 rounded-xl transition-all" style=${{ color: '#8b7da8' }}
                    onMouseEnter=${(e) => { e.target.style.color = '#f87171'; e.target.style.background = 'rgba(248,113,113,0.08)' }}
                    onMouseLeave=${(e) => { e.target.style.color = '#8b7da8'; e.target.style.background = 'transparent' }}>
              <span class="text-lg">🚪</span>
            </button>
          `}
        </div>
      </div>
    </header>
  `
}

function Content() {
  const { state } = useApp()
  switch (state.step) {
    // 新平台页面（页面1-15）
    case STEPS.LANDING:     return html`<${LandingPage} />`
    case STEPS.SUBJECT:     return html`<${SubjectPage} />`
    case STEPS.MODE:        return html`<${ModePage} />`
    case STEPS.PRESET:      return html`<${PresetTeamPage} />`
    case STEPS.AGENTS:      return html`<${TeamBuilder} />`
    case STEPS.PREFERENCES:
    case STEPS.ONBOARDING:  return html`<${PreferencesPage} />`
    case STEPS.PROJECTS:    return html`<${ProjectsPage} />`
    case STEPS.COMMUNITY:   return html`<${GamePlaza} />`
    case STEPS.PLAN_DETAIL: return html`<${PlanDetailPage} />`
    case STEPS.PROFILE:     return html`<${ProfilePage} />`
    case STEPS.HELP:        return html`<${HelpPage} />`
    case STEPS.PROTOCOL:   return html`<${ProtocolDemo} />`
    case STEPS.GAMEPLAY:   return html`<${GameplayGacha} />`
    // 新增平台页面
    case STEPS.PRICING:      return html`<${PricingPage} />`
    case STEPS.SETTINGS:     return html`<${SettingsPage} />`
    case STEPS.NOTIFICATIONS: return html`<${NotificationsPage} />`
    case STEPS.ABOUT:        return html`<${AboutPage} />`
    case STEPS.BLOG:         return html`<${BlogPage} />`
    case STEPS.LEGAL:        return html`<${LegalPage} />`
    case STEPS.ERROR_404:    return html`<${ErrorPage} />`
    case STEPS.CHANGELOG:    return html`<${ChangelogPage} />`
    case STEPS.STATUS:       return html`<${StatusPage} />`
    case STEPS.FEEDBACK:     return html`<${FeedbackPage} />`
    case STEPS.SEARCH:       return html`<${SearchPage} />`
    case STEPS.INVITE:       return html`<${InvitePage} />`
    case STEPS.ADMIN:        return html`<${AdminPage} />`
    // 已有页面
    case STEPS.HALL:        return html`<${GameHall} />`
    case STEPS.AUTH:        return html`<${AuthView} />`
    case STEPS.UPLOAD:      return html`<${UploadPage} />`
    case STEPS.WORKSPACE:   return html`<${WorkspaceView} />`
    case STEPS.PREVIEW:     return html`<${PreviewView} />`
    case STEPS.STARVOYAGER: return html`<${StarVoyagerWorkbench} />`
    case STEPS.AISTUDIO:   return html`<${AIStudio} />`
    default:                return html`<${LandingPage} />`
  }
}

// ── 三种独立布局组件 ──
// 通过组件类型变化强制 React 卸载/重挂载，避免 hooks 计数不匹配

function ImmersiveLayout() {
  return html`
    <div className="hall-root min-h-screen">
      <${Content} />
      <${AuthModal} />
      <${LoadingOverlay} />
      <${Toast} />
      <${ErrorBanner} />
    </div>
  `
}

function PlatformLayout() {
  const { state, closeSettings } = useApp()
  return html`
    <div className="min-h-screen flex flex-col">
      <${Content} />
      <${FeedbackButton} />
      <${LoadingOverlay} />
      <${Toast} />
      <${ErrorBanner} />
      <${AuthModal} />
      <${SettingsModal} open=${state.ui.settingsModalOpen} onClose=${closeSettings} />
    </div>
  `
}

function WorkflowLayout() {
  const { state, goStep, closeSettings } = useApp()
  const showStepper = state.user && WORKFLOW_PAGES.has(state.step)
  return html`
    <div class="min-h-screen flex flex-col" style=${{ background: '#05010f' }}>
      <${TopBar} />
      ${showStepper && html`<div style=${{ background: 'rgba(5,1,15,0.6)', borderBottom: '1px solid rgba(167,139,250,0.08)' }}><${Stepper} current=${state.step} onStepClick=${(s) => goStep(s)} /></div>`}
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <${Content} />
      </main>
      <footer class="py-4 text-center text-xs border-t" style=${{ color: 'rgba(139,125,168,0.4)', borderColor: 'rgba(167,139,250,0.06)' }}>
        <p>知识不进脑子啊 · AI 游戏设计与生产平台</p>
        <p class="mt-1">多智能体协作 · 游戏工厂主舞台 · ${new Date().getFullYear()}</p>
      </footer>
      <${LoadingOverlay} />
      <${Toast} />
      <${ErrorBanner} />
      <${SettingsModal} open=${state.ui.settingsModalOpen} onClose=${closeSettings} />
    </div>
  `
}

function ShellInner() {
  const { state, goStep } = useApp()

  // Hash 路由：支持 #starvoyager 直接访问星海漫游者工作台
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.slice(1)
      if (hash === 'starvoyager') {
        goStep(STEPS.STARVOYAGER)
      } else if (hash === 'ai_studio') {
        goStep(STEPS.AISTUDIO)
      } else if (hash === 'blog') {
        goStep(STEPS.BLOG)
      } else if (hash === 'profile') {
        goStep(STEPS.PROFILE)
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [goStep])

  const isImmersive = state.step === STEPS.HALL || state.step === STEPS.COMMUNITY
  const isPlatformPage = PLATFORM_PAGES.has(state.step)

  // 沉浸模式：游戏广场 → 全屏铺满（自带 J.A.R.V.I.S 顶栏与状态栏，不套平台外壳）
  if (isImmersive) {
    return html`<${ImmersiveLayout} />`
  }

  // 平台页面：页面组件自带 NavBar + Footer，不套额外布局
  if (isPlatformPage) {
    return html`<${PlatformLayout} />`
  }

  // 工作流页面：TopBar + Stepper + Content
  return html`<${WorkflowLayout} />`
}

export default function App() {
  return html`<${AppProvider}><${Shell} /><//>`
}

// 内部 Shell 包装：将 grade 传给 ThemeProvider
function Shell() {
  const { state } = useApp()
  return html`<${ThemeProvider} grade=${state.selectedGrade}><${ShellInner} /><//>`
}
