// 延迟注册弹窗：大厅内触发注册/登录时的传送门模态框
import { html, useEffect } from '../../react.js'
import { useApp, STEPS } from '../../store/appContext.js'
import AuthForm from './AuthForm.js'

export default function AuthModal() {
  const { state, dispatch, goStep, toast } = useApp()
  const prompt = state.hall.authPrompt

  const open = !!prompt

  const close = () => {
    dispatch({ type: 'SET_AUTH_PROMPT', payload: null })
  }

  // 成功后的路由
  const handleSuccess = (mode, user) => {
    const intent = prompt?.intent || 'default'
    dispatch({ type: 'SET_AUTH_PROMPT', payload: null })
    if (intent === 'after_upload') {
      goStep(STEPS.UPLOAD)
    } else if (intent === 'after_score') {
      toast('成绩已保存到你的档案！', 'success')
      goStep(STEPS.HALL)
    } else if (intent === 'after_clone') {
      goStep(STEPS.PRESET)
    } else {
      goStep(user.isGuest ? STEPS.SUBJECT : STEPS.ONBOARDING)
    }
  }

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  if (!open) return null

  return html`
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style=${{ background: 'rgba(5,1,15,0.85)', backdropFilter: 'blur(8px)' }} onClick=${close}>
      <div className="relative w-full max-w-md" onClick=${(e) => e.stopPropagation()}>
        {/* 传送门光环 */}
        <div className="absolute inset-0 -m-8 rounded-full opacity-30 animate-glow-pulse"
          style=${{ background: 'radial-gradient(circle, rgba(217,70,239,0.3) 0%, transparent 70%)' }}></div>

        {/* 传送门内容 */}
        <div className="relative glass-dark rounded-3xl p-8 animate-warp-in" style=${{ border: '1px solid rgba(217,70,239,0.3)' }}>
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🌀</div>
            <h2 className="text-xl font-bold text-white mb-1" style=${{ fontFamily: 'Orbitron, sans-serif' }}>
              ${prompt?.reason || '激活你的脑洞空间站'}
            </h2>
            <p className="text-xs text-purple-300">注册后可永久保存你的游戏创作</p>
          </div>

          <div className="bg-white/95 rounded-2xl p-6">
            <${AuthForm} onSuccess=${handleSuccess} showGuest=${true} />
          </div>

          <button onClick=${close} className="mt-4 w-full text-center text-xs text-purple-300 hover:text-white transition-all">
            ✕ 稍后再说（进度保留 24 小时）
          </button>
        </div>
      </div>
    </div>
  `
}
