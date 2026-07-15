// 设置页 — 4 标签页设置界面
// 个人信息 / 通知偏好 / 隐私安全 / 连接账户
import { html, useContext, useState, useCallback } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'
import { NavBar, Footer, PageContainer } from './PlatformCommon.js'

// ── 复古色板 ──
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
  danger: '#f87171',
}

// ── 头像 emoji 池 ──
const AVATAR_EMOJIS = ['😎', '🚀', '🎯', '🧠', '⚡', '🔥', '💎', '🌟', '🎮', '🏆', '🦊', '🐼', '🦉', '🐉']

// ── 学段/学科选项 ──
const GRADE_OPTIONS = ['小学', '初中', '高中', '大学', '考研', '职场进修']
const SUBJECT_OPTIONS = ['数学', '物理', '化学', '生物', '语文', '英语', '历史', '地理', '政治', '信息技术']

// ── 第三方账户配置 ──
const OAUTH_ACCOUNTS = [
  { id: 'google', label: 'Google', emoji: '🔵', desc: '使用 Google 账户登录', color: '#4285F4' },
  { id: 'github', label: 'GitHub', emoji: '🐙', desc: '使用 GitHub 账户登录', color: '#f5e8ff' },
  { id: 'wechat', label: '微信', emoji: '💬', desc: '使用微信账户登录', color: '#07C160' },
]

// ── 自定义 Toggle 开关 ──
function Toggle({ checked, onChange, label, desc }) {
  return html`
    <div class="flex items-center justify-between py-3">
      <div class="flex-1 min-w-0 mr-4">
        <div class="text-sm font-medium" style=${{ color: C.text }}>${label}</div>
        ${desc ? html`<div class="text-xs mt-0.5" style=${{ color: C.textMuted }}>${desc}</div>` : null}
      </div>
      <button type="button"
              class="relative shrink-0 rounded-full transition-all duration-300"
              style=${{
                width: '44px', height: '24px',
                background: checked ? C.primary : 'rgba(255,255,255,0.1)',
                border: `1px solid ${checked ? C.primary : C.border}`,
              }}
              onClick=${() => onChange(!checked)}>
        <span class="absolute top-1/2 -translate-y-1/2 rounded-full transition-all duration-300"
              style=${{
                width: '18px', height: '18px', background: '#fff',
                left: checked ? '22px' : '3px',
                boxShadow: checked ? `0 0 8px ${C.primary}80` : 'none',
              }}></span>
      </button>
    </div>
  `
}

// ── 通用输入框样式 ──
const inputBaseStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.04)',
  border: `1px solid ${C.border}`,
  color: C.text,
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s, background 0.2s',
}

function inputFocusHandler(e) { e.target.style.borderColor = C.primary; e.target.style.background = 'rgba(167,139,250,0.06)' }
function inputBlurHandler(e) { e.target.style.borderColor = C.border; e.target.style.background = 'rgba(255,255,255,0.04)' }

// ── 标签页配置 ──
const TABS = [
  { id: 'profile', label: '个人信息', emoji: '👤' },
  { id: 'notifications', label: '通知偏好', emoji: '🔔' },
  { id: 'security', label: '隐私安全', emoji: '🔒' },
  { id: 'connections', label: '连接账户', emoji: '🔗' },
]

export default function SettingsPage() {
  const { state, dispatch, toast } = useContext(AppContext)

  const [activeTab, setActiveTab] = useState('profile')

  // 个人信息表单
  const [profile, setProfile] = useState({
    avatar: '😎',
    nickname: state.user?.nickname || '',
    bio: state.user?.bio || '',
    grade: state.user?.preferences?.grade || '初中',
    subject: state.user?.preferences?.subject || '数学',
  })
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false)

  // 通知偏好
  const [notifications, setNotifications] = useState({
    emailSystem: true,
    emailCommunity: true,
    emailMarketing: false,
    sysInApp: true,
    sysSound: false,
    communityMentions: true,
    communityReplies: true,
    communityFollows: false,
  })

  // 隐私安全
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionAlerts: true,
    dataCollection: true,
  })
  const [pwForm, setPwForm] = useState({ old: '', new: '', confirm: '' })

  // 连接账户
  const [connections, setConnections] = useState({
    google: false,
    github: true,
    wechat: false,
  })

  // ── 未登录拦截 ──
  const goAuth = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: STEPS.AUTH })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  // ── 保存个人信息 ──
  const handleSave = useCallback(() => {
    if (!state.user) { goAuth(); return }
    const updated = {
      ...state.user,
      nickname: profile.nickname,
      bio: profile.bio,
      avatar: profile.avatar,
      preferences: {
        ...state.user.preferences,
        grade: profile.grade,
        subject: profile.subject,
      },
    }
    dispatch({ type: 'SET_USER', payload: updated })
    toast('设置已保存，含金量+1', 'success')
  }, [state.user, profile, dispatch, toast, goAuth])

  // ── 通知设置更新 ──
  const updateNotification = useCallback((key, val) => {
    setNotifications((prev) => ({ ...prev, [key]: val }))
  }, [])

  // ── 安全设置更新 ──
  const updateSecurity = useCallback((key, val) => {
    setSecurity((prev) => ({ ...prev, [key]: val }))
    toast(`${val ? '已开启' : '已关闭'} ${key === 'twoFactor' ? '两步验证' : key === 'sessionAlerts' ? '登录提醒' : '数据收集'}`, 'info')
  }, [toast])

  // ── 修改密码 ──
  const handleChangePassword = useCallback(() => {
    if (!pwForm.old || !pwForm.new) { toast('请填写旧密码和新密码', 'error'); return }
    if (pwForm.new.length < 8) { toast('新密码至少 8 位', 'error'); return }
    if (pwForm.new !== pwForm.confirm) { toast('两次新密码不一致', 'error'); return }
    toast('密码修改成功（模拟环境）', 'success')
    setPwForm({ old: '', new: '', confirm: '' })
  }, [pwForm, toast])

  // ── 连接/断开第三方 ──
  const toggleConnection = useCallback((id) => {
    setConnections((prev) => ({ ...prev, [id]: !prev[id] }))
    const provider = OAUTH_ACCOUNTS.find((p) => p.id === id)
    toast(`${provider.label} ${connections[id] ? '已断开' : '已连接'}`, 'info')
  }, [connections, toast])

  // ── 数据导出 ──
  const handleExportData = useCallback(() => {
    toast('数据导出请求已提交，稍后通过邮件发送', 'info')
  }, [toast])

  // ── 退出所有会话 ──
  const handleRevokeSessions = useCallback(() => {
    toast('已退出其他所有设备的会话', 'success')
  }, [toast])

  // ── 未登录 ──
  if (!state.user) {
    return html`
      <div style=${{ background: C.bg, minHeight: '100vh' }}>
        <${NavBar} />
        <${PageContainer}>
          <div class="flex flex-col items-center justify-center py-20 text-center">
            <div class="text-6xl mb-4 opacity-60">🫥</div>
            <h3 class="text-lg font-semibold mb-1" style=${{ color: C.text }}>还没登录呢</h3>
            <p class="text-sm mb-6" style=${{ color: C.textMuted }}>登录后才能修改设置</p>
            <button class="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style=${{ background: C.accent, color: '#1a0f3d' }}
                    onClick=${goAuth}>去登录</button>
          </div>
        <//>
        <${Footer} />
      </div>
    `
  }

  return html`
    <div style=${{ background: C.bg, minHeight: '100vh' }}>
      <${NavBar} />
      <${PageContainer}>

        <!-- ═══ 页面标题 ═══ -->
        <div class="mb-6">
          <div class="retro-eyebrow mb-2">// SETTINGS</div>
          <h1 class="text-2xl sm:text-3xl font-black" style=${{ color: C.text }}>设置</h1>
          <p class="text-sm mt-1" style=${{ color: C.textMuted }}>管理你的账户信息、通知和安全设置</p>
        </div>

        <!-- ═══ 标签导航 ═══ -->
        <div class="flex gap-1 p-1 rounded-2xl mb-6 overflow-x-auto"
             style=${{ background: C.surface, border: `1px solid ${C.border}` }}>
          ${TABS.map((tab) => html`
            <button key=${tab.id}
                    class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap"
                    style=${activeTab === tab.id
                      ? { background: C.primary, color: '#fff' }
                      : { color: C.textMuted }}
                    onClick=${() => setActiveTab(tab.id)}>
              <span>${tab.emoji}</span>
              <span>${tab.label}</span>
            </button>
          `)}
        </div>

        <!-- ═══ Tab 内容区 ═══ -->
        <div class="rounded-2xl p-5 sm:p-6"
             style=${{ background: C.surface, border: `1px solid ${C.border}` }}>

          <!-- ── Tab 1: 个人信息 ── -->
          ${activeTab === 'profile' && html`
            <div class="space-y-5 max-w-2xl">
              <!-- 头像 -->
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                     style=${{ background: 'rgba(167,139,250,0.1)', border: `1px solid ${C.border}` }}>
                  ${profile.avatar}
                </div>
                <div>
                  <button class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          style=${{ background: 'rgba(167,139,250,0.1)', color: C.primary, border: `1px solid ${C.primary}` }}
                          onClick=${() => setAvatarPickerOpen(!avatarPickerOpen)}>
                    更换头像
                  </button>
                  <p class="text-xs mt-1" style=${{ color: C.textMuted }}>选个 emoji 代表自己</p>
                </div>
              </div>
              ${avatarPickerOpen && html`
                <div class="grid grid-cols-7 sm:grid-cols-10 gap-2 p-3 rounded-xl"
                     style=${{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
                  ${AVATAR_EMOJIS.map((emoji) => html`
                    <button key=${emoji}
                            class="w-9 h-9 rounded-lg flex items-center justify-center text-xl transition-all"
                            style=${profile.avatar === emoji
                              ? { background: C.primary, transform: 'scale(1.1)' }
                              : { background: 'rgba(255,255,255,0.04)' }}
                            onClick=${() => { setProfile({ ...profile, avatar: emoji }); setAvatarPickerOpen(false) }}>
                      ${emoji}
                    </button>
                  `)}
                </div>
              `}

              <!-- 昵称 -->
              <div>
                <label class="block text-sm font-medium mb-1.5" style=${{ color: C.text }}>昵称</label>
                <input type="text" value=${profile.nickname}
                       onInput=${(e) => setProfile({ ...profile, nickname: e.target.value })}
                       onFocus=${inputFocusHandler} onBlur=${inputBlurHandler}
                       style=${inputBaseStyle} placeholder="给自己起个名字" maxLength="20" />
              </div>

              <!-- 邮箱（只读）-->
              <div>
                <label class="block text-sm font-medium mb-1.5" style=${{ color: C.text }}>邮箱</label>
                <input type="email" value=${state.user.email || ''} readOnly
                       style=${{ ...inputBaseStyle, color: C.textMuted, cursor: 'not-allowed' }} />
                <p class="text-xs mt-1" style=${{ color: C.textDim }}>邮箱不可修改，如需更换请联系客服</p>
              </div>

              <!-- 个人简介 -->
              <div>
                <label class="block text-sm font-medium mb-1.5" style=${{ color: C.text }}>个人简介</label>
                <textarea value=${profile.bio}
                          onInput=${(e) => setProfile({ ...profile, bio: e.target.value })}
                          onFocus=${inputFocusHandler} onBlur=${inputBlurHandler}
                          style=${{ ...inputBaseStyle, minHeight: '80px', resize: 'vertical' }}
                          placeholder="一句话介绍自己，比如：喜欢用游戏学数学的教书匠" maxLength="100"></textarea>
              </div>

              <!-- 学段 / 学科 -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1.5" style=${{ color: C.text }}>学段</label>
                  <select value=${profile.grade}
                          onChange=${(e) => setProfile({ ...profile, grade: e.target.value })}
                          onFocus=${inputFocusHandler} onBlur=${inputBlurHandler}
                          style=${inputBaseStyle}>
                    ${GRADE_OPTIONS.map((g) => html`<option key=${g} value=${g} style=${{ background: C.bg }}>${g}</option>`)}
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1.5" style=${{ color: C.text }}>学科</label>
                  <select value=${profile.subject}
                          onChange=${(e) => setProfile({ ...profile, subject: e.target.value })}
                          onFocus=${inputFocusHandler} onBlur=${inputBlurHandler}
                          style=${inputBaseStyle}>
                    ${SUBJECT_OPTIONS.map((s) => html`<option key=${s} value=${s} style=${{ background: C.bg }}>${s}</option>`)}
                  </select>
                </div>
              </div>
            </div>
          `}

          <!-- ── Tab 2: 通知偏好 ── -->
          ${activeTab === 'notifications' && html`
            <div class="max-w-2xl divide-y" style=${{ borderColor: C.border }}>
              <div class="pb-2">
                <h3 class="text-sm font-bold mb-1" style=${{ color: C.accent }}>📧 邮件通知</h3>
              </div>
              <${Toggle} checked=${notifications.emailSystem} onChange=${(v) => updateNotification('emailSystem', v)}
                        label="系统通知" desc="账户安全、产品更新等重要通知" />
              <${Toggle} checked=${notifications.emailCommunity} onChange=${(v) => updateNotification('emailCommunity', v)}
                        label="社区动态" desc="有人回复你的方案、@你等社区互动" />
              <${Toggle} checked=${notifications.emailMarketing} onChange=${(v) => updateNotification('emailMarketing', v)}
                        label="营销邮件" desc="活动推广、优惠信息（偶尔发发）" />

              <div class="pt-4 pb-2">
                <h3 class="text-sm font-bold mb-1" style=${{ color: C.accent }}>💻 站内通知</h3>
              </div>
              <${Toggle} checked=${notifications.sysInApp} onChange=${(v) => updateNotification('sysInApp', v)}
                        label="站内消息" desc="在网页内显示通知气泡" />
              <${Toggle} checked=${notifications.sysSound} onChange=${(v) => updateNotification('sysSound', v)}
                        label="提示音" desc="收到通知时播放声音" />

              <div class="pt-4 pb-2">
                <h3 class="text-sm font-bold mb-1" style=${{ color: C.accent }}>👥 社区互动</h3>
              </div>
              <${Toggle} checked=${notifications.communityMentions} onChange=${(v) => updateNotification('communityMentions', v)}
                        label="被提及" desc="有人在方案评论中 @你" />
              <${Toggle} checked=${notifications.communityReplies} onChange=${(v) => updateNotification('communityReplies', v)}
                        label="回复通知" desc="你的方案收到新回复" />
              <${Toggle} checked=${notifications.communityFollows} onChange=${(v) => updateNotification('communityFollows', v)}
                        label="新粉丝" desc="有人关注了你" />
            </div>
          `}

          <!-- ── Tab 3: 隐私安全 ── -->
          ${activeTab === 'security' && html`
            <div class="space-y-6 max-w-2xl">
              <!-- 修改密码 -->
              <div>
                <h3 class="text-sm font-bold mb-3" style=${{ color: C.accent }}>🔑 修改密码</h3>
                <div class="space-y-3 p-4 rounded-xl" style=${{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
                  <input type="password" value=${pwForm.old}
                         onInput=${(e) => setPwForm({ ...pwForm, old: e.target.value })}
                         onFocus=${inputFocusHandler} onBlur=${inputBlurHandler}
                         style=${inputBaseStyle} placeholder="当前密码" />
                  <input type="password" value=${pwForm.new}
                         onInput=${(e) => setPwForm({ ...pwForm, new: e.target.value })}
                         onFocus=${inputFocusHandler} onBlur=${inputBlurHandler}
                         style=${inputBaseStyle} placeholder="新密码（至少8位）" />
                  <input type="password" value=${pwForm.confirm}
                         onInput=${(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                         onFocus=${inputFocusHandler} onBlur=${inputBlurHandler}
                         style=${inputBaseStyle} placeholder="确认新密码" />
                  <button class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          style=${{ background: C.primary, color: '#fff' }}
                          onClick=${handleChangePassword}>
                    更新密码
                  </button>
                </div>
              </div>

              <!-- 两步验证 -->
              <div class="divide-y" style=${{ borderColor: C.border }}>
                <div class="pb-2">
                  <h3 class="text-sm font-bold mb-1" style=${{ color: C.accent }}>🛡️ 安全设置</h3>
                </div>
                <${Toggle} checked=${security.twoFactor} onChange=${(v) => updateSecurity('twoFactor', v)}
                          label="两步验证" desc="登录时需要额外的验证码，更安全" />
                <${Toggle} checked=${security.sessionAlerts} onChange=${(v) => updateSecurity('sessionAlerts', v)}
                          label="新设备登录提醒" desc="检测到新设备登录时发送邮件提醒" />
                <${Toggle} checked=${security.dataCollection} onChange=${(v) => updateSecurity('dataCollection', v)}
                          label="使用数据收集" desc="帮助我们改进产品，匿名收集，不涉及隐私" />
              </div>

              <!-- 会话管理 -->
              <div>
                <h3 class="text-sm font-bold mb-3" style=${{ color: C.accent }}>📱 会话管理</h3>
                <div class="p-4 rounded-xl flex items-center justify-between"
                     style=${{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
                  <div>
                    <div class="text-sm font-medium" style=${{ color: C.text }}>退出其他设备</div>
                    <div class="text-xs mt-0.5" style=${{ color: C.textMuted }}>退出除当前设备外的所有登录会话</div>
                  </div>
                  <button class="px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
                          style=${{ background: 'rgba(167,139,250,0.1)', color: C.primary, border: `1px solid ${C.primary}` }}
                          onClick=${handleRevokeSessions}>
                    退出
                  </button>
                </div>
              </div>

              <!-- 数据导出 -->
              <div>
                <h3 class="text-sm font-bold mb-3" style=${{ color: C.accent }}>📦 数据管理</h3>
                <div class="p-4 rounded-xl flex items-center justify-between"
                     style=${{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
                  <div>
                    <div class="text-sm font-medium" style=${{ color: C.text }}>导出我的数据</div>
                    <div class="text-xs mt-0.5" style=${{ color: C.textMuted }}>下载你的所有项目、方案和个人数据</div>
                  </div>
                  <button class="px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
                          style=${{ background: 'rgba(245,166,35,0.1)', color: C.accent, border: `1px solid ${C.accent}` }}
                          onClick=${handleExportData}>
                    导出
                  </button>
                </div>
              </div>
            </div>
          `}

          <!-- ── Tab 4: 连接账户 ── -->
          ${activeTab === 'connections' && html`
            <div class="max-w-2xl space-y-3">
              <div class="mb-2">
                <h3 class="text-sm font-bold" style=${{ color: C.accent }}>🔗 已连接的第三方账户</h3>
                <p class="text-xs mt-0.5" style=${{ color: C.textMuted }}>连接后可以使用第三方账户快速登录</p>
              </div>
              ${OAUTH_ACCOUNTS.map((acc) => html`
                <div key=${acc.id}
                     class="flex items-center justify-between p-4 rounded-xl transition-all"
                     style=${{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                         style=${{ background: 'rgba(255,255,255,0.04)' }}>
                      ${acc.emoji}
                    </div>
                    <div>
                      <div class="text-sm font-medium" style=${{ color: C.text }}>${acc.label}</div>
                      <div class="text-xs mt-0.5" style=${{ color: C.textMuted }}>
                        ${connections[acc.id] ? '✓ 已连接' : acc.desc}
                      </div>
                    </div>
                  </div>
                  <button class="px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0"
                          style=${connections[acc.id]
                            ? { background: 'rgba(248,113,113,0.1)', color: C.danger, border: `1px solid ${C.danger}40` }
                            : { background: 'rgba(167,139,250,0.1)', color: C.primary, border: `1px solid ${C.primary}` }}
                          onMouseEnter=${(e) => { e.target.style.opacity = '0.8' }}
                          onMouseLeave=${(e) => { e.target.style.opacity = '1' }}
                          onClick=${() => toggleConnection(acc.id)}>
                    ${connections[acc.id] ? '断开' : '连接'}
                  </button>
                </div>
              `)}

              <div class="p-4 rounded-xl mt-6 flex items-start gap-3"
                   style=${{ background: 'rgba(245,166,35,0.04)', border: `1px solid ${C.border}` }}>
                <span class="text-xl shrink-0">💡</span>
                <div>
                  <div class="text-sm font-medium" style=${{ color: C.text }}>安全提示</div>
                  <p class="text-xs mt-1 leading-relaxed" style=${{ color: C.textMuted }}>
                    断开第三方账户连接后，将无法使用该账户登录。请确保至少保留一种登录方式（邮箱密码或已连接的第三方账户）。
                  </p>
                </div>
              </div>
            </div>
          `}

        </div>

        <!-- ═══ 底部保存按钮 ═══ -->
        <div class="flex items-center justify-between mt-6 pt-5"
             style=${{ borderTop: `1px solid ${C.border}` }}>
          <p class="text-xs" style=${{ color: C.textDim }}>
            ${activeTab === 'profile' ? '修改后记得点保存' : activeTab === 'notifications' ? '通知设置即时生效' : activeTab === 'security' ? '安全设置即时生效' : '连接状态即时生效'}
          </p>
          <button class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                  style=${{ background: C.accent, color: '#1a0f3d', boxShadow: `0 4px 20px ${C.accent}30` }}
                  onMouseEnter=${(e) => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = `0 6px 24px ${C.accent}50` }}
                  onMouseLeave=${(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 4px 20px ${C.accent}30` }}
                  onClick=${handleSave}>
            💾 保存设置
          </button>
        </div>

      <//>
      <${Footer} />
    </div>
  `
}
