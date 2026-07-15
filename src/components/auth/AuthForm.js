// 认证表单组件 — 对接后端 API
import { html, useState } from '../../react.js'
import { useApp, STEPS } from '../../store/appContext.js?v=ctx2'
import { Button } from '../common/ui.js'
import { authAPI, tokenStore } from '../../lib/api.js'
import { isValidEmail, isStrongPassword, passwordStrength, STRENGTH_LABELS } from '../../lib/crypto.js'

export default function AuthForm({ onSuccess, initialMode = 'login', showGuest = true }) {
  const { state, dispatch, toast, goStep } = useApp()
  const [mode, setMode] = useState(initialMode)
  const [form, setForm] = useState({ email: '', password: '', confirm: '', nickname: '', code: '' })
  const [devCode, setDevCode] = useState('')  // 后端开发模式返回的验证码
  const [countdown, setCountdown] = useState(0)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k, v) => { setForm({ ...form, [k]: v }); if (errors[k]) setErrors({ ...errors, [k]: '' }) }

  const startCountdown = () => {
    setCountdown(60)
    const t = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(t); return 0 }; return c - 1 })
    }, 1000)
  }

  // ── 发送验证码（调后端 API）──
  const sendCode = async () => {
    if (!isValidEmail(form.email)) { setErrors({ ...errors, email: '邮箱格式不正确' }); return }
    try {
      const data = await authAPI.sendCode(form.email, 'register')
      startCountdown()
      if (data.devCode) {
        setDevCode(data.devCode)
        toast(`验证码已发送（开发模式）：${data.devCode}`, 'info')
      } else {
        toast('验证码已发送至邮箱', 'info')
      }
    } catch (err) {
      setErrors({ ...errors, email: err.error || '发送验证码失败' })
    }
  }

  // ── 注册（调后端 API）──
  const doRegister = async () => {
    const e = {}
    if (!form.nickname.trim()) e.nickname = '请输入昵称'
    if (!isValidEmail(form.email)) e.email = '邮箱格式不正确'
    if (!isStrongPassword(form.password)) e.password = '密码至少8位，含字母和数字'
    if (form.password !== form.confirm) e.confirm = '两次密码不一致'
    if (!form.code) e.code = '请输入验证码'
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setLoading(true)
    try {
      const data = await authAPI.register(form.email, form.nickname.trim(), form.password, form.code)
      tokenStore.setTokens(data.accessToken, data.refreshToken)
      dispatch({ type: 'SET_USER', payload: data.user })
      toast(`欢迎加入，${data.user.nickname}！`, 'success')
      if (onSuccess) onSuccess('register', data.user)
      else goStep(STEPS.ONBOARDING)
    } catch (err) {
      if (err.error?.includes('验证码')) setErrors({ ...errors, code: err.error })
      else if (err.error?.includes('邮箱')) setErrors({ ...errors, email: err.error })
      else toast(err.error || '注册失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── 登录（调后端 API）──
  const doLogin = async () => {
    const e = {}
    if (!isValidEmail(form.email)) e.email = '邮箱格式不正确'
    if (!form.password) e.password = '请输入密码'
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setLoading(true)
    try {
      const data = await authAPI.login(form.email, form.password)
      tokenStore.setTokens(data.accessToken, data.refreshToken)
      dispatch({ type: 'SET_USER', payload: data.user })
      toast(`欢迎回来，${data.user.nickname}！`, 'success')
      if (onSuccess) onSuccess('login', data.user)
      else goStep(STEPS.SUBJECT)
    } catch (err) {
      if (err.error?.includes('邮箱')) setErrors({ ...errors, email: err.error })
      else if (err.error?.includes('密码')) setErrors({ ...errors, password: err.error })
      else if (err.error?.includes('封禁')) toast(err.error, 'error')
      else toast(err.error || '登录失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  const submit = (e) => { e.preventDefault(); if (loading) return; if (mode === 'login') doLogin(); else doRegister() }

  // ── 游客登录（调后端 API）──
  const enterGuest = async () => {
    setLoading(true)
    try {
      const data = await authAPI.guest()
      tokenStore.setTokens(data.accessToken, data.refreshToken)
      dispatch({ type: 'SET_USER', payload: data.user })
      toast('以体验身份进入', 'info')
      if (onSuccess) onSuccess('guest', data.user)
      else goStep(STEPS.SUBJECT)
    } catch (err) {
      toast(err.error || '游客登录失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  const strength = form.password ? passwordStrength(form.password) : 0
  const strengthColors = ['bg-gray-200', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']

  return html`
    <div>
      <div className="flex gap-2 p-1 bg-brand-50 rounded-2xl mb-6">
        <button onClick=${() => setMode('login')} className="flex-1 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'login' ? 'bg-white text-brand-600 shadow' : 'text-gray-500'}">登录</button>
        <button onClick=${() => setMode('register')} className="flex-1 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'register' ? 'bg-white text-brand-600 shadow' : 'text-gray-500'}">注册</button>
      </div>

      <form onSubmit=${submit} className="space-y-4">
        ${mode === 'register' && html`
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">昵称</label>
            <input type="text" value=${form.nickname} onChange=${(e) => set('nickname', e.target.value)} placeholder="给自己起个有梗的名字"
              className="w-full px-4 py-2.5 rounded-xl border-2 ${errors.nickname ? 'border-red-300' : 'border-gray-200'} focus:border-brand-400 outline-none text-sm" />
            ${errors.nickname && html`<p className="text-xs text-red-500 mt-1">${errors.nickname}</p>`}
          </div>
        `}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">邮箱</label>
          <input type="email" value=${form.email} onChange=${(e) => set('email', e.target.value)} placeholder="you@example.com"
            className="w-full px-4 py-2.5 rounded-xl border-2 ${errors.email ? 'border-red-300' : 'border-gray-200'} focus:border-brand-400 outline-none text-sm" />
          ${errors.email && html`<p className="text-xs text-red-500 mt-1">${errors.email}</p>`}
        </div>

        ${mode === 'register' && html`
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">邮箱验证码</label>
            <div className="flex gap-2">
              <input type="text" value=${form.code} onChange=${(e) => set('code', e.target.value)} placeholder="6位验证码" maxLength="6"
                className="flex-1 px-4 py-2.5 rounded-xl border-2 ${errors.code ? 'border-red-300' : 'border-gray-200'} focus:border-brand-400 outline-none text-sm font-mono tracking-widest" />
              <button type="button" onClick=${sendCode} disabled=${countdown > 0 || loading}
                className="px-4 py-2.5 rounded-xl bg-brand-50 text-brand-600 text-sm font-semibold disabled:opacity-50 hover:bg-brand-100 transition-all whitespace-nowrap">
                ${countdown > 0 ? `${countdown}s` : '获取验证码'}
              </button>
            </div>
            ${errors.code && html`<p className="text-xs text-red-500 mt-1">${errors.code}</p>`}
            ${devCode && html`<p className="text-xs text-blue-500 mt-1">开发模式验证码：<span className="font-mono font-bold">${devCode}</span></p>`}
          </div>
        `}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">密码</label>
          <input type="password" value=${form.password} onChange=${(e) => set('password', e.target.value)} placeholder="至少8位，含字母和数字"
            className="w-full px-4 py-2.5 rounded-xl border-2 ${errors.password ? 'border-red-300' : 'border-gray-200'} focus:border-brand-400 outline-none text-sm" />
          ${mode === 'register' && form.password && html`
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 flex gap-1">
                ${[0, 1, 2, 3].map(i => html`<div key=${i} className="h-1.5 flex-1 rounded-full ${i < strength ? strengthColors[strength] : 'bg-gray-200'}"></div>`)}
              </div>
              <span className="text-xs text-gray-500">${STRENGTH_LABELS[strength]}</span>
            </div>
          `}
          ${errors.password && html`<p className="text-xs text-red-500 mt-1">${errors.password}</p>`}
        </div>

        ${mode === 'register' && html`
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">确认密码</label>
            <input type="password" value=${form.confirm} onChange=${(e) => set('confirm', e.target.value)} placeholder="再输一次"
              className="w-full px-4 py-2.5 rounded-xl border-2 ${errors.confirm ? 'border-red-300' : 'border-gray-200'} focus:border-brand-400 outline-none text-sm" />
            ${errors.confirm && html`<p className="text-xs text-red-500 mt-1">${errors.confirm}</p>`}
          </div>
        `}

        <${Button} type="submit" className="w-full justify-center" size=${'lg'} disabled=${loading}>
          ${loading ? '⏳ 处理中...' : (mode === 'login' ? '🚀 登录' : '🎉 注册')}
        <//>
      </form>

      <div className="mt-5 text-center">
        <button onClick=${() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}) }}
          className="text-sm text-brand-600 hover:text-brand-700 font-medium">
          ${mode === 'login' ? '没有账号？去注册 →' : '已有账号？去登录 →'}
        </button>
      </div>

      ${showGuest && html`
        <div className="mt-6 pt-5 border-t border-gray-100">
          <button onClick=${enterGuest} disabled=${loading} className="w-full text-xs text-gray-400 hover:text-brand-500 transition-all disabled:opacity-50">
            ⚡ 不想注册？以体验身份直接进入 →
          </button>
        </div>
      `}
    </div>
  `
}
