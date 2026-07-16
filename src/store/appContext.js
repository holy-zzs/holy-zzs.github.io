// 全局应用状态：Context + useReducer
import { createContext, useReducer, useContext, useCallback, useMemo, useEffect } from 'react'
import { html } from '../react.js'
import { authAPI, tokenStore } from '../lib/api.js'

// 步骤定义（15个页面 + 游戏大厅）
export const STEPS = {
  LANDING: 'landing',           // 页面1：首页/着陆页
  SUBJECT: 'subject',           // 页面2：学科细分页
  MODE: 'mode',                 // 页面3：选择模式页
  PRESET: 'preset',             // 页面4：预设团队选择页
  AGENTS: 'agents',             // 页面5：智能体市场（自定义团队）
  UPLOAD: 'upload',             // 页面6：上传教材页
  PREFERENCES: 'preferences',   // 页面7：偏好设置页
  WORKSPACE: 'workspace',       // 页面8：协作工作台
  PREVIEW: 'preview',           // 页面9：方案预览页
  PROJECTS: 'projects',         // 页面10：我的项目页
  COMMUNITY: 'community',       // 页面11：社区方案广场
  PLAN_DETAIL: 'plan_detail',   // 页面12：方案详情页
  PROFILE: 'profile',           // 页面13：用户个人中心
  AUTH: 'auth',                 // 页面14：注册/登录页
  HELP: 'help',                 // 页面15：帮助中心
  PROTOCOL: 'protocol',         // 映射协议演示页
  GAMEPLAY: 'gameplay',         // 玩法扭蛋机页
  HALL: 'hall',                 // 游戏大厅（沉浸式体验入口）
  PLAZA: 'plaza',               // 游戏广场（社区子页面）
  ONBOARDING: 'preferences',    // 向后兼容
  // ── 新增平台页面 ──
  PRICING: 'pricing',           // 定价页
  SETTINGS: 'settings',         // 设置页
  NOTIFICATIONS: 'notifications', // 通知中心
  ABOUT: 'about',               // 关于我们
  BLOG: 'blog',                 // 博客/资源中心
  LEGAL: 'legal',               // 法律页面
  ERROR_404: 'error_404',       // 404错误页
  CHANGELOG: 'changelog',       // 更新日志
  STATUS: 'status_page',        // 状态页
  FEEDBACK: 'feedback',         // 反馈/工单
  SEARCH: 'search',             // 全局搜索
  INVITE: 'invite',             // 邀请好友
  ADMIN: 'admin',               // 管理员/教师面板
  STARVOYAGER: 'starvoyager',   // 星海漫游者协作工作台
  AISTUDIO: 'ai_studio',       // AI 游戏工作室
}

// 主流程顺序（创建游戏的主要路径）
// 新流程：选年级 → 选科目 → 上传教材 → AI解析 → 选玩法 → AI团队组建 → AI Studio → 工作台 → 交付
// MODE 页从主流程中移除（改为隐式），AGENTS 为可选步骤（从 AI Studio 进入）
const STEP_ORDER = [
  STEPS.LANDING, STEPS.SUBJECT, STEPS.UPLOAD, STEPS.GAMEPLAY,
  STEPS.AISTUDIO, STEPS.WORKSPACE, STEPS.PREVIEW
]

// ── 模拟登录用户（开发/演示用）──
// 让个人中心等页面直接显示已登录状态
const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@chuangjieshan.com',
  nickname: '造物主·demo',
  avatar: '',
  role: 'user',
  status: 'active',
  isGuest: false,
  createdAt: '2026-06-15T08:00:00.000Z',
  lastLogin: new Date().toISOString(),
}

// 初始状态
const initialState = {
  // 用户 — 默认注入 demo 用户，模拟已登录
  user: DEMO_USER,
  users: [],            // 所有注册用户（localStorage 同步）
  // 流程
  step: STEPS.LANDING,
  // 创建流程状态
  selectedGrade: null,    // 学段: primary/junior/senior/college
  selectedSubject: null,  // 学科对象
  selectedMode: null,     // 模式: quick/custom/browse
  selectedPresetTeam: null, // 预设团队ID
  selectedGameplay: null,   // 扭蛋机选中的玩法对象
  gamePreferences: null,  // 游戏偏好 { types, difficulty, visualStyle, depth, duration }
  // 智能体团队
  selectedAgents: [],   // 选中的智能体 id 列表
  savedTeams: [],       // 保存的团队
  // 教材
  material: null,       // 解析后的教材 ParsedMaterial
  userCreativeInput: '',  // 用户创意想法输入
  gameplayRecommendation: null,  // AI 生成的游戏化推荐数据
  recommendationLoading: false,  // 推荐数据加载中
  // 讨论
  discussion: {
    messages: [],       // 讨论消息列表
    round: 0,           // 当前轮次
    status: 'idle',     // idle | running | paused | finished
    currentSpeaker: null
  },
  // 成果
  designDoc: null,      // 生成的游戏设计文档
  projects: [],         // 用户项目列表
  // 社区方案
  selectedPlan: null,   // 当前选中的社区方案（用于跳转详情页）
  // 设置
  settings: {
    engineMode: 'demo',    // 'demo' | 'apikey' | 'localbridge'
    // API Key 模式
    apiKey: '',
    apiBase: 'https://api.deepseek.com/v1',
    apiModel: 'deepseek-chat',
    apiProvider: 'deepseek',
    // Local Bridge 模式
    bridgeUrl: 'http://localhost:19820',
    bridgeModel: 'auto',
    // 向后兼容
    useMock: true
  },
  // 游戏大厅
  hall: {
    booted: false,              // 是否已完成开机动画（本次会话）
    highScore: 0,               // 小游戏最高分
    creations: [],              // 我的社区创作
    authPrompt: null,           // 延迟注册触发器 { reason, intent }
    muted: true                 // 默认静音
  },
  // UI
  ui: {
    loading: false,
    loadingText: '',
    error: null,
    toast: null,        // { type, msg, id }
    settingsModalOpen: false,  // 全局 AI 引擎设置弹窗开关
    // AI 连接状态指示灯
    connectionStatus: 'demo',  // 'demo' | 'unconfigured' | 'untested' | 'checking' | 'connected' | 'disconnected'
    connectionLabel: '',      // 显示文本：模型名 / 桥接状态 / 错误信息
  }
}

// Action 类型
const A = {
  SET_USER: 'SET_USER',
  SET_USERS: 'SET_USERS',
  SET_STEP: 'SET_STEP',
  SET_GRADE: 'SET_GRADE',
  SET_SUBJECT: 'SET_SUBJECT',
  SET_MODE: 'SET_MODE',
  SET_PRESET_TEAM: 'SET_PRESET_TEAM',
  SET_GAMEPLAY: 'SET_GAMEPLAY',
  SET_PREFERENCES: 'SET_PREFERENCES',
  SET_PROJECTS: 'SET_PROJECTS',
  SET_AGENTS: 'SET_AGENTS',
  ADD_AGENT: 'ADD_AGENT',
  REMOVE_AGENT: 'REMOVE_AGENT',
  REORDER_AGENTS: 'REORDER_AGENTS',
  SET_SAVED_TEAMS: 'SET_SAVED_TEAMS',
  SET_MATERIAL: 'SET_MATERIAL',
  SET_CREATIVE_INPUT: 'SET_CREATIVE_INPUT',
  SET_GAMEPLAY_RECOMMENDATION: 'SET_GAMEPLAY_RECOMMENDATION',
  SET_RECOMMENDATION_LOADING: 'SET_RECOMMENDATION_LOADING',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_MESSAGES: 'SET_MESSAGES',
  SET_DISCUSSION: 'SET_DISCUSSION',
  SET_DOC: 'SET_DOC',
  SET_PLAN: 'SET_PLAN',
  SET_SETTINGS: 'SET_SETTINGS',
  SET_SETTINGS_MODAL: 'SET_SETTINGS_MODAL',
  SET_CONNECTION_STATUS: 'SET_CONNECTION_STATUS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_TOAST: 'SET_TOAST',
  RESET_DISCUSSION: 'RESET_DISCUSSION',
  SET_HALL: 'SET_HALL',
  SET_HIGHSCORE: 'SET_HIGHSCORE',
  ADD_CREATION: 'ADD_CREATION',
  SET_AUTH_PROMPT: 'SET_AUTH_PROMPT',
  SET_MUTED: 'SET_MUTED',
  RESET: 'RESET'
}

function reducer(state, action) {
  switch (action.type) {
    case A.SET_USER: return { ...state, user: action.payload }
    case A.SET_USERS: return { ...state, users: action.payload }
    case A.SET_STEP: return { ...state, step: action.payload }
    case A.SET_GRADE: return { ...state, selectedGrade: action.payload }
    case A.SET_SUBJECT: return { ...state, selectedSubject: action.payload }
    case A.SET_MODE: return { ...state, selectedMode: action.payload }
    case A.SET_PRESET_TEAM: return { ...state, selectedPresetTeam: action.payload }
    case A.SET_GAMEPLAY: return { ...state, selectedGameplay: action.payload }
    case A.SET_PREFERENCES: return { ...state, gamePreferences: action.payload }
    case A.SET_PROJECTS: return { ...state, projects: action.payload }
    case A.SET_AGENTS: return { ...state, selectedAgents: action.payload }
    case A.ADD_AGENT:
      if (state.selectedAgents.includes(action.payload)) return state
      return { ...state, selectedAgents: [...state.selectedAgents, action.payload] }
    case A.REMOVE_AGENT:
      return { ...state, selectedAgents: state.selectedAgents.filter(id => id !== action.payload) }
    case A.REORDER_AGENTS: return { ...state, selectedAgents: action.payload }
    case A.SET_SAVED_TEAMS: return { ...state, savedTeams: action.payload }
    case A.SET_MATERIAL: return { ...state, material: action.payload }
    case A.SET_CREATIVE_INPUT: return { ...state, userCreativeInput: action.payload }
    case A.SET_GAMEPLAY_RECOMMENDATION: return { ...state, gameplayRecommendation: action.payload }
    case A.SET_RECOMMENDATION_LOADING: return { ...state, recommendationLoading: action.payload }
    case A.ADD_MESSAGE:
      return { ...state, discussion: { ...state.discussion, messages: [...state.discussion.messages, action.payload] } }
    case A.SET_MESSAGES:
      return { ...state, discussion: { ...state.discussion, messages: action.payload } }
    case A.SET_DISCUSSION:
      return { ...state, discussion: { ...state.discussion, ...action.payload } }
    case A.SET_DOC: return { ...state, designDoc: action.payload }
    case A.SET_PLAN: return { ...state, selectedPlan: action.payload }
    case A.SET_SETTINGS: return { ...state, settings: { ...state.settings, ...action.payload } }
    case A.SET_SETTINGS_MODAL: return { ...state, ui: { ...state.ui, settingsModalOpen: action.payload } }
    case A.SET_CONNECTION_STATUS: return { ...state, ui: { ...state.ui, connectionStatus: action.payload.status, connectionLabel: action.payload.label || '' } }
    case A.SET_LOADING: return { ...state, ui: { ...state.ui, loading: action.payload.loading, loadingText: action.payload.text || '' } }
    case A.SET_ERROR: return { ...state, ui: { ...state.ui, error: action.payload } }
    case A.SET_TOAST: return { ...state, ui: { ...state.ui, toast: action.payload } }
    case A.RESET_DISCUSSION:
      return { ...state, discussion: { messages: [], round: 0, status: 'idle', currentSpeaker: null } }
    case A.SET_HALL:
      return { ...state, hall: { ...state.hall, ...action.payload } }
    case A.SET_HIGHSCORE:
      return { ...state, hall: { ...state.hall, highScore: Math.max(state.hall.highScore, action.payload) } }
    case A.ADD_CREATION:
      return { ...state, hall: { ...state.hall, creations: [...state.hall.creations, action.payload] } }
    case A.SET_AUTH_PROMPT:
      return { ...state, hall: { ...state.hall, authPrompt: action.payload } }
    case A.SET_MUTED:
      return { ...state, hall: { ...state.hall, muted: action.payload } }
    case A.RESET:
      return { ...initialState, settings: state.settings, users: state.users }
    default: return state
  }
}

export const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // 从 localStorage 恢复 settings，从后端 API 恢复用户会话
  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      try {
        // 恢复客户端设置（含向后兼容迁移）
        const savedSettings = localStorage.getItem('knb_settings')
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          // 向后兼容：旧格式 useMock → 新格式 engineMode
          if (!parsed.engineMode) {
            parsed.engineMode = parsed.useMock ? 'demo' : 'apikey'
          }
          // 同步 useMock
          parsed.useMock = parsed.engineMode === 'demo'
          dispatch({ type: A.SET_SETTINGS, payload: parsed })
          // 恢复连接状态
          if (parsed.engineMode === 'demo') {
            dispatch({ type: A.SET_CONNECTION_STATUS, payload: { status: 'demo', label: '演示模式' } })
          } else if (parsed.engineMode === 'apikey' && !parsed.apiKey) {
            dispatch({ type: A.SET_CONNECTION_STATUS, payload: { status: 'unconfigured', label: '未配置 API Key' } })
          } else if (parsed.engineMode === 'apikey') {
            dispatch({ type: A.SET_CONNECTION_STATUS, payload: { status: 'untested', label: parsed.apiModel || '' } })
          } else if (parsed.engineMode === 'localbridge') {
            dispatch({ type: A.SET_CONNECTION_STATUS, payload: { status: 'untested', label: '桥接未检测' } })
          }
        }

        // 恢复大厅数据
        const savedHighScore = localStorage.getItem('knb_hall_highscore')
        if (savedHighScore) dispatch({ type: A.SET_HIGHSCORE, payload: parseInt(savedHighScore) })
        const savedCreations = localStorage.getItem('knb_hall_creations')
        if (savedCreations) dispatch({ type: A.SET_HALL, payload: { creations: JSON.parse(savedCreations) } })

        // 从后端恢复用户会话（基于 JWT token）
        // 如果有真实后端 token，覆盖 demo 用户
        if (tokenStore.hasToken()) {
          const token = tokenStore.getAccessToken()
          // demo token 不调后端，直接用 DEMO_USER
          if (token && token !== 'demo-access-token') {
            try {
              const data = await authAPI.me()
              if (!cancelled) dispatch({ type: A.SET_USER, payload: data.user })
            } catch (err) {
              tokenStore.clearTokens()
              // 失败后回退到 demo 用户
              if (!cancelled) dispatch({ type: A.SET_USER, payload: DEMO_USER })
            }
          }
        }
      } catch (e) { console.warn('恢复会话失败', e) }
    }

    restoreSession()
    return () => { cancelled = true }
  }, [])

  // 持久化 settings
  useEffect(() => {
    localStorage.setItem('knb_settings', JSON.stringify(state.settings))
  }, [state.settings])

  // 用户会话由 JWT token 管理（tokenStore），不再需要 localStorage 同步

  // 持久化大厅数据
  useEffect(() => {
    localStorage.setItem('knb_hall_highscore', String(state.hall.highScore))
  }, [state.hall.highScore])

  useEffect(() => {
    localStorage.setItem('knb_hall_creations', JSON.stringify(state.hall.creations))
  }, [state.hall.creations])

  // 辅助方法
  const setLoading = useCallback((loading, text = '') => dispatch({ type: A.SET_LOADING, payload: { loading, text } }), [])
  const setError = useCallback((err) => dispatch({ type: A.SET_ERROR, payload: err }), [])
  const toast = useCallback((msg, type = 'info') => {
    const id = Date.now()
    dispatch({ type: A.SET_TOAST, payload: { msg, type, id } })
    setTimeout(() => dispatch({ type: A.SET_TOAST, payload: null }), 2800)
  }, [])
  const goStep = useCallback((step) => dispatch({ type: A.SET_STEP, payload: step }), [])
  const openSettings = useCallback(() => dispatch({ type: A.SET_SETTINGS_MODAL, payload: true }), [])
  const closeSettings = useCallback(() => dispatch({ type: A.SET_SETTINGS_MODAL, payload: false }), [])
  const setConnectionStatus = useCallback((status, label = '') => dispatch({ type: A.SET_CONNECTION_STATUS, payload: { status, label } }), [])
  const goNext = useCallback(() => {
    const idx = STEP_ORDER.indexOf(state.step)
    if (idx < STEP_ORDER.length - 1) dispatch({ type: A.SET_STEP, payload: STEP_ORDER[idx + 1] })
  }, [state.step])
  const goPrev = useCallback(() => {
    const idx = STEP_ORDER.indexOf(state.step)
    if (idx > 0) dispatch({ type: A.SET_STEP, payload: STEP_ORDER[idx - 1] })
  }, [state.step])

  // 退出登录：清理 token + 用户状态
  const logout = useCallback(() => {
    tokenStore.clearTokens()
    dispatch({ type: A.SET_USER, payload: null })
    dispatch({ type: A.SET_STEP, payload: STEPS.LANDING })
  }, [])

  // 导航守卫：带前置条件检查的跳转函数
  // 新流程守卫：SUBJECT→需年级，UPLOAD→需年级+科目，GAMEPLAY→需教材，AISTUDIO→需玩法，WORKSPACE→需教材，PREVIEW→需设计文档
  const navigate = useCallback((step) => {
    const guards = {
      [STEPS.SUBJECT]: () => !!state.selectedGrade,
      [STEPS.UPLOAD]: () => !!state.selectedGrade && !!state.selectedSubject,
      [STEPS.GAMEPLAY]: () => !!state.material,
      [STEPS.AISTUDIO]: () => !!state.selectedGameplay,
      [STEPS.WORKSPACE]: () => !!state.material,
      [STEPS.PREVIEW]: () => !!state.designDoc,
    }
    const guard = guards[step]
    if (guard && !guard()) return false
    // 进入 AI Studio 时，若未选智能体则自动分配默认团队
    if (step === STEPS.AISTUDIO && (!state.selectedAgents || state.selectedAgents.length === 0)) {
      dispatch({ type: A.SET_AGENTS, payload: ['captain', 'scholar', 'designer', 'numbers', 'narrative', 'art'] })
    }
    dispatch({ type: A.SET_STEP, payload: step })
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return true
  }, [state.selectedGrade, state.selectedSubject, state.selectedGameplay, state.selectedAgents, state.material, state.designDoc])

  const value = useMemo(() => ({
    state, dispatch,
    // 便捷方法
    setLoading, setError, toast,
    goStep, goNext, goPrev, navigate, logout,
    openSettings, closeSettings, setConnectionStatus,
    // 常量
    STEPS, STEP_ORDER,
    // Action 创建器
    A
  }), [state, setLoading, setError, toast, goStep, goNext, goPrev, navigate, logout, openSettings, closeSettings])

  return html`<${AppContext.Provider} value=${value}>${children}<//>`
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp 必须在 AppProvider 内使用')
  return ctx
}
