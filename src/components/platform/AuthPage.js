// 页面14：注册/登录页 — 复古CRT风格双栏布局
// 左侧品牌视觉 + CRT 扫描线动效，右侧登录/注册表单
import { html, useCallback, useContext, useState } from '../../deps.js'
import {
  generateSalt,
  hashPassword,
  isStrongPassword,
  isValidEmail,
  verifyPassword
} from '../../lib/crypto.js'
import { uid } from '../../lib/storage.js'
import { AppContext, STEPS } from '../../store/appContext.js'
import { Footer, NavBar } from './PlatformCommon.js'

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
}

// ── 第三方登录按钮配置 ──
const OAUTH_PROVIDERS = [
  { id: 'google', label: 'Google', emoji: '🔵', color: '#4285F4' },
  { id: 'github', label: 'GitHub', emoji: '🐙', color: '#f5e8ff' },
  { id: 'wechat', label: '微信', emoji: '💬', color: '#07C160' },
]

export default function AuthPage() {
  const { state, dispatch, toast } = useContext(AppContext)

  const [mode, setMode] = useState('login') // login | register
  const [form, setForm] = useState({
    email: '', password: '', confirm: '', nickname: '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  // ── 表单字段更新 ──
  const set = useCallback((key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }, [errors])

  // ── 切换模式时清空表单 ──
  const switchMode = useCallback((newMode) => {
    setMode(newMode)
    setForm({ email: '', password: '', confirm: '', nickname: '' })
    setErrors({})
  }, [])

  // ── 登录校验 ──
  const validateLogin = useCallback(() => {
    const e = {}
    if (!isValidEmail(form.email)) e.email = '邮箱格式不对，检查一下'
    if (!form.password) e.password = '密码不能为空'
    setErrors(e)
    return Object.keys(e).length === 0
  }, [form])

  // ── 注册校验 ──
  const validateRegister = useCallback(() => {
    const e = {}
    if (!form.nickname.trim()) e.nickname = '给自己起个名字吧'
    if (!isValidEmail(form.email)) e.email = '邮箱格式不对，检查一下'
    if (!isStrongPassword(form.password)) e.password = '密码至少8位，含字母和数字'
    if (form.password !== form.confirm) e.confirm = '两次密码不一致'
    if (state.users.some((u) => u.email === form.email)) e.email = '该邮箱已注册，直接去登录'
    setErrors(e)
    return Object.keys(e).length === 0
  }, [form, state.users])

  // ── 执行登录 ──
  const doLogin = useCallback(() => {
    if (!validateLogin()) return
    const user = state.users.find((u) => u.email === form.email)
    if (!user) {
      setErrors({ email: '该邮箱还没注册，先去注册一个' })
      return
    }
    if (!verifyPassword(form.password, user.salt, user.passwordHash)) {
      setErrors({ password: '密码不对，再想想' })
      return
    }
    const updated = { ...user, lastLogin: new Date().toISOString(), isNew: false }
    dispatch({ type: 'SET_USER', payload: updated })
    toast(`欢迎回来，${updated.nickname}！`, 'success')
    dispatch({ type: 'SET_STEP', payload: STEPS.LANDING })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [form, state.users, validateLogin, dispatch, toast])

  // ── 执行注册 ──
  const doRegister = useCallback(() => {
    if (!validateRegister()) return
    const salt = generateSalt()
    const user = {
      id: uid('user'),
      email: form.email,
      nickname: form.nickname.trim(),
      passwordHash: hashPassword(form.password, salt),
      salt,
      avatar: '',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      preferences: { learningStyle: '', gameTypes: [], difficulty: '', pace: '' },
      isNew: true,
    }
    dispatch({ type: 'SET_USERS', payload: [...state.users, user] })
    dispatch({ type: 'SET_USER', payload: user })
    toast(`欢迎加入，${user.nickname}！含金量开始上升`, 'success')
    dispatch({ type: 'SET_STEP', payload: STEPS.LANDING })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [form, state.users, validateRegister, dispatch, toast])

  // ── 提交表单 ──
  const submit = useCallback((e) => {
    e.preventDefault()
    if (mode === 'login') doLogin()
    else doRegister()
  }, [mode, doLogin, doRegister])

  // ── 游客进入 ──
  const enterGuest = useCallback(() => {
    const guest = {
      id: uid('guest'),
      email: 'guest@knb.demo',
      nickname: '体验用户',
      passwordHash: '', salt: '',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      preferences: { learningStyle: '', gameTypes: [], difficulty: '', pace: '' },
      isNew: false, isGuest: true,
    }
    dispatch({ type: 'SET_USER', payload: guest })
    toast('以游客身份进入，随便逛逛', 'info')
    dispatch({ type: 'SET_STEP', payload: STEPS.LANDING })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch, toast])

  // ── 第三方登录（模拟）──
  const handleOAuth = useCallback((provider) => {
    toast(`${provider.label} 登录功能即将上线，先用邮箱注册吧`, 'info')
  }, [toast])

  // ── 输入框样式 ──
  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${C.border}`,
    color: C.text,
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s, background 0.2s',
  }
  const inputFocus = (e) => { e.target.style.borderColor = C.primary; e.target.style.background = 'rgba(167,139,250,0.06)' }
  const inputBlur = (e) => { e.target.style.borderColor = C.border; e.target.style.background = 'rgba(255,255,255,0.04)' }

  return html`
    <div class="brand-page-root" style=${{ background: C.bg, minHeight: '100vh' }}>
      <${NavBar} />

      <!-- ═══ 双栏布局 ═══ -->
      <div class="min-h-screen flex items-stretch pt-16">
        <div class="brand-shell-inner brand-auth-layout w-full px-4 sm:px-6 py-8 lg:py-12">

          <!-- ═══ 左侧：品牌视觉 + CRT 效果 ═══ -->
          <div class="brand-side-visual hidden lg:flex relative overflow-hidden rounded-3xl"
               style=${{ border: `1px solid ${C.border}`, minHeight: '600px' }}>
            <!-- CRT 扫描线背景 -->
            <div style=${{
              position: 'absolute', inset: '0',
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(167,139,250,0.03) 2px, rgba(167,139,250,0.03) 4px)',
              pointerEvents: 'none',
            }}></div>
            <!-- 辉光球 -->
            <div style=${{
              position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
              width: '300px', height: '300px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)',
              filter: 'blur(40px)', pointerEvents: 'none',
            }}></div>

            <div class="relative z-10 px-10 py-12 flex flex-col h-full justify-center">
              <div class="brand-eyebrow mb-4">Account Access</div>
              <h1 class="brand-page-title mb-3" style=${{ color: C.text }}>
                这知识不进脑子啊
              </h1>
              <p class="brand-page-subtitle mb-8" style=${{ color: C.textMuted }}>
                先体验，再决定是否注册。需要保存项目、同步进度与管理账户时，再高效地进入登录与注册流程。
              </p>

              <!-- CRT 终端框 -->
              <div class="rounded-xl p-4 font-mono text-xs space-y-1.5"
                   style=${{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${C.border}` }}>
                <div style=${{ color: C.primary }}>&gt; 初始化 AI 智能体团队...</div>
                <div style=${{ color: C.textMuted }}>&gt; [OK] 学神本神 已就位</div>
                <div style=${{ color: C.textMuted }}>&gt; [OK] 游戏架构师 已就位</div>
                <div style=${{ color: C.textMuted }}>&gt; [OK] 关卡设计师 已就位</div>
                <div style=${{ color: C.accent }}>&gt; 系统就绪，等待登录<span class="animate-pulse">_</span></div>
              </div>

              <!-- AI 生成图像 (复古未来主义海报) -->
              <div class="mt-8 rounded-xl overflow-hidden border" style=${{ borderColor: C.border }}>
                <img src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20retro-futuristic%20cyberpunk%20poster%20for%20an%20AI%20game%20design%20platform%2C%20featuring%20a%20glowing%20brain%20connected%20to%20neon%20wires%20and%20arcade%20machines%2C%20dark%20synthwave%20aesthetic%2C%208k%20resolution&image_size=landscape_16_9" 
                     alt="Retro Futuristic Brain Arcade" 
                     class="w-full h-32 object-cover opacity-80 mix-blend-screen" />
              </div>

              <!-- 底部统计 -->
              <div class="flex gap-6 mt-8">
                <div>
                  <div class="text-2xl font-black" style=${{ color: C.accent }}>12,847</div>
                  <div class="text-xs" style=${{ color: C.textDim }}>已生成游戏</div>
                </div>
                <div>
                  <div class="text-2xl font-black" style=${{ color: C.accent }}>8</div>
                  <div class="text-xs" style=${{ color: C.textDim }}>AI 角色</div>
                </div>
                <div>
                  <div class="text-2xl font-black" style=${{ color: C.accent }}>5,632</div>
                  <div class="text-xs" style=${{ color: C.textDim }}>活跃用户</div>
                </div>
              </div>
            </div>
          </div>

          <!-- ═══ 右侧：表单区 ═══ -->
          <div class="flex flex-col justify-center">
            <div class="brand-auth-panel rounded-3xl p-6 sm:p-8 lg:p-10"
                 style=${{ background: C.surface, border: `1px solid ${C.border}`, backdropFilter: 'blur(12px)' }}>

              <!-- 模式切换 -->
              <div class="flex gap-1 p-1 rounded-2xl mb-6"
                   style=${{ background: 'rgba(255,255,255,0.03)' }}>
                <button class="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                        style=${mode === 'login'
                          ? { background: C.primary, color: '#fff' }
                          : { color: C.textMuted }}
                        onClick=${() => switchMode('login')}>
                  登录
                </button>
                <button class="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                        style=${mode === 'register'
                          ? { background: C.primary, color: '#fff' }
                          : { color: C.textMuted }}
                        onClick=${() => switchMode('register')}>
                  注册
                </button>
              </div>

              <!-- 标题 -->
              <div class="mb-6">
                <h2 class="text-2xl font-black mb-1" style=${{ color: C.text }}>
                  ${mode === 'login' ? '欢迎回来 👋' : '加入我们 🚀'}
                </h2>
                <p class="text-sm" style=${{ color: C.textMuted }}>
                  ${mode === 'login' ? '登录后继续你的游戏创作之旅' : '注册即可免费生成 3 个游戏方案'}
                </p>
              </div>

              <!-- 表单 -->
              <form onSubmit=${submit} class="space-y-4">
                ${mode === 'register' && html`
                  <div>
                    <label class="block text-sm font-medium mb-1.5" style=${{ color: C.text }}>昵称</label>
                    <input type="text" value=${form.nickname}
                           onInput=${(e) => set('nickname', e.target.value)}
                           onFocus=${inputFocus} onBlur=${inputBlur}
                           style=${{ ...inputStyle, borderColor: errors.nickname ? '#f87171' : inputStyle.border }}
                           placeholder="给自己起个有梗的名字" maxLength="20" />
                    ${errors.nickname && html`<p class="text-xs mt-1" style=${{ color: '#f87171' }}>${errors.nickname}</p>`}
                  </div>
                `}

                <div>
                  <label class="block text-sm font-medium mb-1.5" style=${{ color: C.text }}>邮箱</label>
                  <input type="email" value=${form.email}
                         onInput=${(e) => set('email', e.target.value)}
                         onFocus=${inputFocus} onBlur=${inputBlur}
                         style=${{ ...inputStyle, borderColor: errors.email ? '#f87171' : inputStyle.border }}
                         placeholder="you@example.com" />
                  ${errors.email && html`<p class="text-xs mt-1" style=${{ color: '#f87171' }}>${errors.email}</p>`}
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1.5" style=${{ color: C.text }}>密码</label>
                  <div class="relative">
                    <input type=${showPassword ? 'text' : 'password'} value=${form.password}
                           onInput=${(e) => set('password', e.target.value)}
                           onFocus=${inputFocus} onBlur=${inputBlur}
                           style=${{ ...inputStyle, borderColor: errors.password ? '#f87171' : inputStyle.border, paddingRight: '44px' }}
                           placeholder=${mode === 'register' ? '至少8位，含字母和数字' : '输入密码'} />
                    <button type="button"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-sm transition-colors"
                            style=${{ color: C.textMuted }}
                            onClick=${() => setShowPassword(!showPassword)}>
                      ${showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  ${errors.password && html`<p class="text-xs mt-1" style=${{ color: '#f87171' }}>${errors.password}</p>`}
                </div>

                ${mode === 'register' && html`
                  <div>
                    <label class="block text-sm font-medium mb-1.5" style=${{ color: C.text }}>确认密码</label>
                    <input type=${showPassword ? 'text' : 'password'} value=${form.confirm}
                           onInput=${(e) => set('confirm', e.target.value)}
                           onFocus=${inputFocus} onBlur=${inputBlur}
                           style=${{ ...inputStyle, borderColor: errors.confirm ? '#f87171' : inputStyle.border }}
                           placeholder="再输一次" />
                    ${errors.confirm && html`<p class="text-xs mt-1" style=${{ color: '#f87171' }}>${errors.confirm}</p>`}
                  </div>
                `}

                <!-- 提交按钮 -->
                <button type="submit"
                        class="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200"
                        style=${{
                          background: C.accent, color: '#1a0f3d',
                          boxShadow: `0 4px 20px ${C.accent}30`,
                        }}
                        onMouseEnter=${(e) => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = `0 6px 24px ${C.accent}50` }}
                        onMouseLeave=${(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 4px 20px ${C.accent}30` }}>
                  ${mode === 'login' ? '🚀 登录' : '🎉 注册'}
                </button>
              </form>

              <!-- 分隔线 -->
              <div class="flex items-center gap-3 my-6">
                <div class="flex-1 h-px" style=${{ background: C.border }}></div>
                <span class="text-xs" style=${{ color: C.textDim }}>或使用第三方登录</span>
                <div class="flex-1 h-px" style=${{ background: C.border }}></div>
              </div>

              <!-- 第三方登录按钮 -->
              <div class="grid grid-cols-3 gap-3">
                ${OAUTH_PROVIDERS.map((p) => html`
                  <button key=${p.id}
                          class="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                          style=${{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.text }}
                          onMouseEnter=${(e) => { e.target.style.background = C.surfaceHover; e.target.style.borderColor = C.primary }}
                          onMouseLeave=${(e) => { e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.borderColor = C.border }}
                          onClick=${() => handleOAuth(p)}>
                    <span>${p.emoji}</span>
                    <span class="hidden sm:inline">${p.label}</span>
                  </button>
                `)}
              </div>

              <!-- 游客入口 -->
              <div class="mt-6 pt-5 text-center" style=${{ borderTop: `1px solid ${C.border}` }}>
                <button class="text-sm font-medium transition-colors"
                        style=${{ color: C.textMuted }}
                        onMouseEnter=${(e) => e.target.style.color = C.primary}
                        onMouseLeave=${(e) => e.target.style.color = C.textMuted}
                        onClick=${enterGuest}>
                  ⚡ 不想注册？先去逛逛 →
                </button>
              </div>
            </div>

            <!-- 切换模式链接 -->
            <p class="text-center text-sm mt-4" style=${{ color: C.textMuted }}>
              ${mode === 'login' ? '还没有账号？' : '已有账号？'}
              <button class="font-semibold transition-colors"
                      style=${{ color: C.accent }}
                      onMouseEnter=${(e) => e.target.style.color = C.primary}
                      onMouseLeave=${(e) => e.target.style.color = C.accent}
                      onClick=${() => switchMode(mode === 'login' ? 'register' : 'login')}>
                ${mode === 'login' ? '去注册' : '去登录'}
              </button>
            </p>
          </div>

        </div>
      </div>

      <${Footer} />
    </div>
  `
}
