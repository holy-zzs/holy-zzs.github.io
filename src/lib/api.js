// ─────────────────────────────────────────────
// 前端 API 客户端 — 双模式自适应
//
// 模式 A（后端模式）：VITE_API_URL 已设置 → 走真实 REST API
// 模式 B（本地模式）：未设置 → 降级为 localStorage 模拟
//
// 这样 Netlify 部署（无后端）也能正常使用登录/注册等功能
// 本地开发时自动检测 DEV 环境并连接 localhost:3456
// ─────────────────────────────────────────────

// ── 检测后端可用性 ──
// 优先使用 VITE_API_URL 环境变量；开发环境回退到 localhost:3456；生产环境为 null（本地模式）
const BACKEND_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV
    ? 'http://localhost:3456/api'
    : null)

export const BACKEND_AVAILABLE = !!BACKEND_URL

// ── localStorage Key ──
const ACCESS_TOKEN_KEY = 'cjs_access_token'
const REFRESH_TOKEN_KEY = 'cjs_refresh_token'
const LOCAL_SESSION_KEY = 'knb_session'
const LOCAL_USERS_KEY = 'knb_users'
const LOCAL_PROJECTS_PREFIX = 'knb_projects_'
const LOCAL_TEAMS_PREFIX = 'knb_teams_'

// ════════════════════════════════════════════
// Token 存储（双模式）
// ════════════════════════════════════════════
export const tokenStore = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || 'local-refresh'
  },
  setTokens(accessToken, refreshToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken || 'local-token')
    if (refreshToken && BACKEND_AVAILABLE) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    }
  },
  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(LOCAL_SESSION_KEY)
  },
  hasToken() {
    if (BACKEND_AVAILABLE) {
      return !!localStorage.getItem(ACCESS_TOKEN_KEY)
    }
    // 本地模式：检查 session 是否存在
    return !!localStorage.getItem(LOCAL_SESSION_KEY)
  },
}

// ════════════════════════════════════════════
// 后端模式：REST API 请求
// ════════════════════════════════════════════

let isRefreshing = false
let refreshPromise = null

async function refreshAccessToken() {
  if (isRefreshing && refreshPromise) return refreshPromise
  const refreshToken = tokenStore.getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token')

  isRefreshing = true
  refreshPromise = (async () => {
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) {
      tokenStore.clearTokens()
      throw new Error('Refresh failed')
    }
    const data = await res.json()
    tokenStore.setTokens(data.accessToken)
    return data.accessToken
  })()

  try {
    return await refreshPromise
  } finally {
    isRefreshing = false
    refreshPromise = null
  }
}

async function request(path, options = {}) {
  const url = `${BACKEND_URL}${path}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const token = tokenStore.getAccessToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let res = await fetch(url, { ...options, headers })

  // 401 → 尝试刷新 token 后重试一次
  if (res.status === 401 && token) {
    try {
      const newToken = await refreshAccessToken()
      headers.Authorization = `Bearer ${newToken}`
      res = await fetch(url, { ...options, headers })
    } catch {
      tokenStore.clearTokens()
      throw { status: 401, error: '登录已过期，请重新登录' }
    }
  }

  const data = await res.json().catch(() => ({ error: '响应解析失败' }))

  if (!res.ok) {
    throw { status: res.status, error: data.error || `请求失败 (${res.status})`, data }
  }

  return data
}

const get = (path) => request(path, { method: 'GET' })
const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) })
const put = (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) })
const del = (path) => request(path, { method: 'DELETE' })

// ════════════════════════════════════════════
// 本地模式：localStorage 模拟后端
// ════════════════════════════════════════════

const localDB = {
  _getUsers() {
    try { return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]') } catch { return [] }
  },
  _setUsers(users) {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
  },
  _genId() {
    return 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  },
  _saveSession(user) {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user))
  },
  _getSession() {
    try { return JSON.parse(localStorage.getItem(LOCAL_SESSION_KEY) || 'null') } catch { return null }
  },
  _clearSession() {
    localStorage.removeItem(LOCAL_SESSION_KEY)
  },
  _publicUser(user) {
    const { password, ...rest } = user
    return rest
  },
  _getUserId() {
    const session = this._getSession()
    return session ? session.id : null
  },
}

// ── 本地认证 API ──
const localAuthAPI = {
  async register(email, nickname, password, code) {
    const users = localDB._getUsers()
    if (users.find(u => u.email === email)) {
      throw { status: 409, error: '该邮箱已注册' }
    }
    const user = {
      id: localDB._genId(),
      email, nickname, password,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(nickname)}`,
      role: 'user',
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    users.push(user)
    localDB._setUsers(users)
    const pub = localDB._publicUser(user)
    localDB._saveSession(pub)
    return { user: pub, accessToken: 'local-token', refreshToken: 'local-refresh' }
  },

  async login(email, password) {
    const users = localDB._getUsers()
    const user = users.find(u => u.email === email)
    if (!user) throw { status: 404, error: '邮箱未注册' }
    if (user.password !== password) throw { status: 401, error: '密码不正确' }
    if (user.status === 'banned') throw { status: 403, error: '账号已被封禁' }
    const pub = localDB._publicUser(user)
    localDB._saveSession(pub)
    return { user: pub, accessToken: 'local-token', refreshToken: 'local-refresh' }
  },

  async guest() {
    const guestUser = {
      id: 'guest_' + Date.now().toString(36),
      email: null,
      nickname: '体验用户' + Math.floor(Math.random() * 9999),
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=guest${Date.now()}`,
      role: 'guest',
      createdAt: new Date().toISOString(),
    }
    localDB._saveSession(guestUser)
    return { user: guestUser, accessToken: 'local-token', refreshToken: 'local-refresh' }
  },

  async me() {
    const session = localDB._getSession()
    if (!session) throw { status: 401, error: '未登录' }
    return { user: session }
  },

  async sendCode(email, purpose = 'register') {
    const code = String(Math.floor(100000 + Math.random() * 900000))
    return { devCode: code, message: '本地模式验证码' }
  },

  async verifyCode(email, code, purpose = 'register') {
    return { valid: true }
  },
}

// ── 本地用户 API ──
const localUserAPI = {
  async getProfile() {
    const session = localDB._getSession()
    if (!session) throw { status: 401, error: '未登录' }
    return { user: session }
  },

  async updateProfile(data) {
    const session = localDB._getSession()
    if (!session) throw { status: 401, error: '未登录' }
    const updated = { ...session, ...data }
    localDB._saveSession(updated)
    // 同步到 users 列表
    const users = localDB._getUsers()
    const idx = users.findIndex(u => u.id === session.id)
    if (idx >= 0) { users[idx] = { ...users[idx], ...data }; localDB._setUsers(users) }
    return { user: updated }
  },

  async changePassword(oldPassword, newPassword) {
    const session = localDB._getSession()
    if (!session) throw { status: 401, error: '未登录' }
    const users = localDB._getUsers()
    const user = users.find(u => u.id === session.id)
    if (!user || user.password !== oldPassword) throw { status: 400, error: '原密码不正确' }
    user.password = newPassword
    localDB._setUsers(users)
    return { success: true }
  },

  async deleteAccount() {
    const session = localDB._getSession()
    if (!session) throw { status: 401, error: '未登录' }
    const users = localDB._getUsers().filter(u => u.id !== session.id)
    localDB._setUsers(users)
    localDB._clearSession()
    return { success: true }
  },

  async getStats() {
    return { projects: 0, teams: 0, plays: 0 }
  },
}

// ── 本地项目 API ──
const localProjectAPI = {
  _getProjects() {
    const uid = localDB._getUserId()
    if (!uid) return []
    try { return JSON.parse(localStorage.getItem(`${LOCAL_PROJECTS_PREFIX}${uid}`) || '[]') } catch { return [] }
  },
  _setProjects(projects) {
    const uid = localDB._getUserId()
    if (!uid) return
    localStorage.setItem(`${LOCAL_PROJECTS_PREFIX}${uid}`, JSON.stringify(projects))
  },

  async list() { return { projects: this._getProjects() } },

  async get(id) {
    const p = this._getProjects().find(p => p.id === id)
    if (!p) throw { status: 404, error: '项目不存在' }
    return { project: p }
  },

  async create(data) {
    const projects = this._getProjects()
    const project = { id: localDB._genId(), ...data, createdAt: new Date().toISOString(), playCount: 0 }
    projects.unshift(project)
    this._setProjects(projects)
    return { project }
  },

  async update(id, data) {
    const projects = this._getProjects()
    const idx = projects.findIndex(p => p.id === id)
    if (idx < 0) throw { status: 404, error: '项目不存在' }
    projects[idx] = { ...projects[idx], ...data }
    this._setProjects(projects)
    return { project: projects[idx] }
  },

  async delete(id) {
    const projects = this._getProjects().filter(p => p.id !== id)
    this._setProjects(projects)
    return { success: true }
  },

  async play(id) {
    const projects = this._getProjects()
    const idx = projects.findIndex(p => p.id === id)
    if (idx >= 0) {
      projects[idx].playCount = (projects[idx].playCount || 0) + 1
      this._setProjects(projects)
    }
    return { success: true }
  },

  async publicList(limit = 20, offset = 0) {
    return { projects: [], total: 0 }
  },
}

// ── 本地团队 API ──
const localTeamAPI = {
  _getTeams() {
    const uid = localDB._getUserId()
    if (!uid) return []
    try { return JSON.parse(localStorage.getItem(`${LOCAL_TEAMS_PREFIX}${uid}`) || '[]') } catch { return [] }
  },
  _setTeams(teams) {
    const uid = localDB._getUserId()
    if (!uid) return
    localStorage.setItem(`${LOCAL_TEAMS_PREFIX}${uid}`, JSON.stringify(teams))
  },

  async list() { return { teams: this._getTeams() } },

  async get(id) {
    const t = this._getTeams().find(t => t.id === id)
    if (!t) throw { status: 404, error: '团队不存在' }
    return { team: t }
  },

  async create(data) {
    const teams = this._getTeams()
    const team = { id: localDB._genId(), ...data, createdAt: new Date().toISOString() }
    teams.push(team)
    this._setTeams(teams)
    return { team }
  },

  async update(id, data) {
    const teams = this._getTeams()
    const idx = teams.findIndex(t => t.id === id)
    if (idx < 0) throw { status: 404, error: '团队不存在' }
    teams[idx] = { ...teams[idx], ...data }
    this._setTeams(teams)
    return { team: teams[idx] }
  },

  async delete(id) {
    const teams = this._getTeams().filter(t => t.id !== id)
    this._setTeams(teams)
    return { success: true }
  },
}

// ── 本地通知 API ──
const localNotificationAPI = {
  async list() { return { notifications: [] } },
  async markRead(id) { return { success: true } },
  async markAllRead() { return { success: true } },
}

// ── 本地管理员 API ──
const localAdminAPI = {
  async listUsers(page = 1, limit = 20, search = '') {
    const users = localDB._getUsers().map(u => localDB._publicUser(u))
    const filtered = search
      ? users.filter(u => (u.email || '').includes(search) || (u.nickname || '').includes(search))
      : users
    const start = (page - 1) * limit
    return { users: filtered.slice(start, start + limit), total: filtered.length, page, limit }
  },

  async setUserStatus(userId, status) {
    const users = localDB._getUsers()
    const user = users.find(u => u.id === userId)
    if (user) { user.status = status; localDB._setUsers(users) }
    return { success: true }
  },

  async setUserRole(userId, role) {
    const users = localDB._getUsers()
    const user = users.find(u => u.id === userId)
    if (user) { user.role = role; localDB._setUsers(users) }
    return { success: true }
  },

  async deleteUser(userId) {
    const users = localDB._getUsers().filter(u => u.id !== userId)
    localDB._setUsers(users)
    return { success: true }
  },

  async stats() {
    const users = localDB._getUsers()
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status !== 'banned').length,
      totalProjects: 0,
    }
  },
}

// ════════════════════════════════════════════
// 统一导出 — 根据模式自动切换
// ════════════════════════════════════════════

// ── 认证 API ──
export const authAPI = BACKEND_AVAILABLE ? {
  register: (email, nickname, password, code) =>
    post('/auth/register', { email, nickname, password, code }),

  login: (email, password) =>
    post('/auth/login', { email, password }),

  guest: () =>
    post('/auth/guest', {}),

  me: () =>
    get('/auth/me'),

  sendCode: (email, purpose = 'register') =>
    post('/auth/send-code', { email, purpose }),

  verifyCode: (email, code, purpose = 'register') =>
    post('/auth/verify-code', { email, code, purpose }),
} : localAuthAPI

// ── 用户 API ──
export const userAPI = BACKEND_AVAILABLE ? {
  getProfile: () =>
    get('/users/profile'),

  updateProfile: (data) =>
    put('/users/profile', data),

  changePassword: (oldPassword, newPassword) =>
    put('/users/password', { oldPassword, newPassword }),

  deleteAccount: () =>
    del('/users/account'),

  getStats: () =>
    get('/users/stats'),
} : localUserAPI

// ── 项目 API ──
export const projectAPI = BACKEND_AVAILABLE ? {
  list: () =>
    get('/projects'),

  get: (id) =>
    get(`/projects/${id}`),

  create: (data) =>
    post('/projects', data),

  update: (id, data) =>
    put(`/projects/${id}`, data),

  delete: (id) =>
    del(`/projects/${id}`),

  play: (id) =>
    post(`/projects/${id}/play`, {}),

  publicList: (limit = 20, offset = 0) =>
    get(`/projects/public?limit=${limit}&offset=${offset}`),
} : localProjectAPI

// ── 团队 API ──
export const teamAPI = BACKEND_AVAILABLE ? {
  list: () =>
    get('/teams'),

  get: (id) =>
    get(`/teams/${id}`),

  create: (data) =>
    post('/teams', data),

  update: (id, data) =>
    put(`/teams/${id}`, data),

  delete: (id) =>
    del(`/teams/${id}`),
} : localTeamAPI

// ── 通知 API ──
export const notificationAPI = BACKEND_AVAILABLE ? {
  list: () =>
    get('/notifications'),

  markRead: (id) =>
    put(`/notifications/${id}/read`, {}),

  markAllRead: () =>
    put('/notifications/read-all', {}),
} : localNotificationAPI

// ── 管理员 API ──
export const adminAPI = BACKEND_AVAILABLE ? {
  listUsers: (page = 1, limit = 20, search = '') =>
    get(`/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),

  setUserStatus: (userId, status) =>
    put(`/admin/users/${userId}/status`, { status }),

  setUserRole: (userId, role) =>
    put(`/admin/users/${userId}/role`, { role }),

  deleteUser: (userId) =>
    del(`/admin/users/${userId}`),

  stats: () =>
    get('/admin/stats'),
} : localAdminAPI

// ── 默认导出 ──
export default {
  auth: authAPI,
  user: userAPI,
  project: projectAPI,
  team: teamAPI,
  notification: notificationAPI,
  admin: adminAPI,
  tokenStore,
  BACKEND_AVAILABLE,
}
