// 认证界面：登录/注册（全屏布局壳，表单委托 AuthForm）
import { html } from '../../react.js'
import { useApp, STEPS } from '../../store/appContext.js?v=ctx2'
import { Logo } from '../common/ui.js'
import AuthForm from './AuthForm.js'

export default function AuthView() {
  const { goStep } = useApp()

  return html`
    <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[70vh]">
      <div className="hidden lg:flex flex-col justify-center pr-8">
        <div className="text-8xl mb-6 animate-float">🧠</div>
        <h1 className="text-5xl font-black gradient-text mb-4">知识不进脑子啊</h1>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">拖拽智能体组队，让AI协作把枯燥教材变成上头游戏。<br/>不是你在学，是知识自己跑进脑子的。</p>
        <div className="space-y-3">
          ${[
            { e: '🤖', t: '12个带梗智能体', d: '学神本神、脑洞工坊主、摆烂玩家代表…' },
            { e: '💬', t: '围观AI圆桌讨论', d: '看4个角色为你的知识吵出最佳方案' },
            { e: '🎁', t: '一键生成游戏方案', d: '完整设计文档，可直接交给开发者' }
          ].map(f => html`
            <div key=${f.t} className="flex items-start gap-3 p-3 rounded-2xl bg-white/60 card-hover">
              <span className="text-2xl">${f.e}</span>
              <div>
                <p className="font-bold text-ink text-sm">${f.t}</p>
                <p className="text-xs text-gray-500">${f.d}</p>
              </div>
            </div>
          `)}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-brand-100 p-6 sm:p-8 max-w-md w-full mx-auto">
        <div className="lg:hidden mb-6 text-center"><${Logo} size=${'md'} /></div>
        <${AuthForm} onSuccess=${() => goStep(STEPS.ONBOARDING)} showGuest=${true} />
      </div>
    </div>
  `
}
