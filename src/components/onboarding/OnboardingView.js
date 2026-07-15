// 偏好设置界面：学习风格 + 游戏类型 + 难度 + 节奏（任务4）
import { html, useState } from '../../react.js'
import { useApp, STEPS } from '../../store/appContext.js?v=ctx2'
import { Button } from '../common/ui.js'
import { LEARNING_STYLES, GAME_TYPES, DIFFICULTY_PREFS, PACE_PREFS } from '../../data/options.js'

export default function OnboardingView() {
  const { state, dispatch, toast, goStep } = useApp()
  const user = state.user || {}
  const [prefs, setPrefs] = useState(user.preferences || { learningStyle: '', gameTypes: [], difficulty: '', pace: '' })
  const [customStyle, setCustomStyle] = useState('')

  const toggleGameType = (id) => {
    const arr = prefs.gameTypes || []
    setPrefs({ ...prefs, gameTypes: arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id] })
  }

  const save = () => {
    const finalPrefs = { ...prefs }
    if (prefs.learningStyle === 'custom') finalPrefs.customStyle = customStyle
    const updated = { ...user, preferences: finalPrefs, isNew: false }
    dispatch({ type: 'SET_USER', payload: updated })
    // 同步到 users 列表
    dispatch({ type: 'SET_USERS', payload: state.users.map(u => u.id === user.id ? updated : u) })
    toast('偏好已保存，开始创建游戏吧！', 'success')
    goStep(STEPS.UPLOAD)
  }

  const canSave = prefs.learningStyle && (prefs.gameTypes || []).length > 0

  return html`
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">⚙️</div>
        <h2 className="text-2xl font-black text-ink mb-1">聊聊你的口味</h2>
        <p className="text-sm text-gray-500">AI团队会根据你的偏好定制游戏方案，选错了也不怕，随时能改</p>
      </div>

      <section className="mb-8">
        <h3 className="text-lg font-bold text-ink mb-3 flex items-center gap-2">
          <span>🧠</span> 你的学习风格是？
          <span className="text-xs text-gray-400 font-normal">（选一个最像你的）</span>
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          ${LEARNING_STYLES.map(s => html`
            <button key=${s.id} onClick=${() => setPrefs({ ...prefs, learningStyle: s.id })}
              className="p-4 rounded-2xl border-2 text-left transition-all ${prefs.learningStyle === s.id ? 'border-brand-500 bg-brand-50 shadow-md' : 'border-gray-200 hover:border-brand-300'}">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">${s.emoji}</span>
                <span className="font-bold text-ink">${s.name}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">${s.desc}</p>
            </button>
          `)}
          <button onClick=${() => setPrefs({ ...prefs, learningStyle: 'custom' })}
            className="p-4 rounded-2xl border-2 border-dashed text-left transition-all ${prefs.learningStyle === 'custom' ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-400'}">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">✨</span>
              <span className="font-bold text-ink">自定义</span>
            </div>
            <p className="text-xs text-gray-500">以上都不像我，我有自己的路子</p>
          </button>
        </div>
        ${prefs.learningStyle === 'custom' && html`
          <input type="text" value=${customStyle} onChange=${(e) => setCustomStyle(e.target.value)} placeholder="描述你的学习风格…"
            className="mt-3 w-full px-4 py-2.5 rounded-xl border-2 border-brand-300 focus:border-brand-500 outline-none text-sm animate-fade-in" />
        `}
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-bold text-ink mb-3 flex items-center gap-2">
          <span>🎮</span> 喜欢什么游戏？
          <span className="text-xs text-gray-400 font-normal">（多选，至少1个）</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          ${GAME_TYPES.map(g => {
            const selected = (prefs.gameTypes || []).includes(g.id)
            return html`
              <button key=${g.id} onClick=${() => toggleGameType(g.id)}
                className="p-3 rounded-xl border-2 text-center transition-all ${selected ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-gray-200 hover:border-brand-300'}">
                <div className="text-2xl mb-1">${g.emoji}</div>
                <div className="text-xs font-bold text-ink">${g.name}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">${g.desc}</div>
              </button>
            `
          })}
        </div>
      </section>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <section>
          <h3 className="text-base font-bold text-ink mb-3 flex items-center gap-2"><span>🔥</span> 难度口味</h3>
          <div className="space-y-2">
            ${DIFFICULTY_PREFS.map(d => html`
              <button key=${d.id} onClick=${() => setPrefs({ ...prefs, difficulty: d.id })}
                className="w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${prefs.difficulty === d.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'}">
                <span className="text-xl">${d.emoji}</span>
                <div>
                  <div className="text-sm font-bold text-ink">${d.name}</div>
                  <div className="text-xs text-gray-500">${d.desc}</div>
                </div>
              </button>
            `)}
          </div>
        </section>
        <section>
          <h3 className="text-base font-bold text-ink mb-3 flex items-center gap-2"><span>⏱️</span> 节奏偏好</h3>
          <div className="space-y-2">
            ${PACE_PREFS.map(p => html`
              <button key=${p.id} onClick=${() => setPrefs({ ...prefs, pace: p.id })}
                className="w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${prefs.pace === p.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'}">
                <span className="text-xl">${p.emoji}</span>
                <div>
                  <div className="text-sm font-bold text-ink">${p.name}</div>
                  <div className="text-xs text-gray-500">${p.desc}</div>
                </div>
              </button>
            `)}
          </div>
        </section>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <button onClick=${() => goStep(STEPS.AUTH)} className="text-sm text-gray-400 hover:text-gray-600">← 返回</button>
        <${Button} onClick=${save} disabled=${!canSave} size=${'lg'}>
          选好了，去组队 →
        <//>
      </div>
      ${!canSave && html`<p className="text-right text-xs text-gray-400 mt-2">请至少选择学习风格和1个游戏类型</p>`}
    </div>
  `
}
