// 页面7：偏好设置页
// 替代 OnboardingView，设置游戏类型、难度、视觉风格、学习深度、游戏时长
// 卡片式布局，每个偏好一个区块，含金量拉满
import { html, useContext, useCallback, useState } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'
import { NavBar, Footer, PageContainer, StepProgress } from './PlatformCommon.js?v=nav3'
import { VISUAL_STYLES, LEARNING_DEPTHS, GAME_DURATIONS, MEMES } from '../../data/platformData.js'

// 游戏类型选项（多选）
const GAME_TYPES = [
  { id: 'puzzle', name: '解谜弹射', emoji: '🧩', desc: '动脑解谜，一击命中' },
  { id: 'rpg', name: 'RPG冒险', emoji: '⚔️', desc: '角色扮演，打怪升级' },
  { id: 'card', name: '卡牌策略', emoji: '🃏', desc: '收集组合，烧脑对战' },
  { id: 'simulation', name: '模拟实验', emoji: '🔬', desc: '沙盒操作，动手探索' },
  { id: 'rhythm', name: '音乐节奏', emoji: '🎵', desc: '踩点节拍，洗脑记忆' },
  { id: 'narrative', name: '叙事选择', emoji: '📖', desc: '剧情分支，你的选择' },
]

// 难度档位标签（滑块 min=0 max=4）
const DIFFICULTY_LABELS = ['入门级', '简单', '适中', '困难', '挑战级']
const DIFFICULTY_DESC = [
  '有手就行，闭眼通关',
  '轻松上手，偶尔动脑',
  '刚刚好，稳住我们能赢',
  '有点东西，需要认真',
  '人有多大胆，复习拖多晚',
]

export default function PreferencesPage() {
  const { dispatch } = useContext(AppContext)
  const [selectedTypes, setSelectedTypes] = useState([])
  const [difficulty, setDifficulty] = useState(2)
  const [visualStyle, setVisualStyle] = useState(VISUAL_STYLES[0].id)
  const [depth, setDepth] = useState(LEARNING_DEPTHS[1].id)
  const [duration, setDuration] = useState(GAME_DURATIONS[1].id)

  // 切换游戏类型选中态
  const toggleType = useCallback((id) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }, [])

  // 返回上传页
  const goBack = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: STEPS.UPLOAD })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  // 启动 AI 协作：写入偏好 + 跳转工作台
  const launch = useCallback(() => {
    dispatch({
      type: 'SET_PREFERENCES',
      payload: { types: selectedTypes, difficulty, visualStyle, depth, duration },
    })
    dispatch({ type: 'SET_STEP', payload: STEPS.WORKSPACE })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch, selectedTypes, difficulty, visualStyle, depth, duration])

  const canLaunch = selectedTypes.length > 0

  return html`
    <div class="min-h-screen" style=${{ background: '#05010f', minHeight: '100vh' }}>
      <${NavBar} />
      <${PageContainer}>

        <!-- 顶部：返回 + 标题 -->
        <div class="flex items-center justify-between gap-4 mb-2">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-primary-800">设置游戏偏好</h1>
            <p class="text-sm text-gray-400 mt-1">告诉AI团队你的口味，方案含金量还在上升 🎯</p>
          </div>
          <button class="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:border-primary-300 hover:text-primary-700 transition-colors"
                  onClick=${goBack}>
            <span>←</span><span class="hidden sm:inline">返回</span>
          </button>
        </div>

        <!-- 流程进度条：步骤4/4 -->
        <${StepProgress} current=${3} total=${4} labels=${['选学科', '选模式', '组团队', '传教材']} />

        <!-- 游戏类型偏好（多选）-->
        <section class="mt-6 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-primary-800 flex items-center gap-2">
              <span>🎮</span> 游戏类型偏好
              <span class="text-xs text-gray-400 font-normal">（多选，可全都要）</span>
            </h2>
            <span class="shrink-0 text-xs text-secondary-600 bg-secondary-50 px-2 py-0.5 rounded-full">已选 ${selectedTypes.length} 个</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            ${GAME_TYPES.map((t) => {
              const selected = selectedTypes.includes(t.id)
              return html`
                <button key=${t.id}
                  class=${`relative p-4 rounded-xl border-2 text-left transition-all duration-200
                    ${selected ? 'border-primary-600 bg-primary-50 shadow-sm' : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50/40'}`}
                  onClick=${() => toggleType(t.id)}>
                  ${selected ? html`<span class="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">✓</span>` : null}
                  <div class="text-3xl mb-1.5">${t.emoji}</div>
                  <div class="text-sm font-bold text-gray-800">${t.name}</div>
                  <div class="text-[11px] text-gray-400 mt-0.5 leading-relaxed">${t.desc}</div>
                </button>
              `
            })}
          </div>
        </section>

        <!-- 目标难度滑块 -->
        <section class="mt-5 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <h2 class="text-lg font-bold text-primary-800 flex items-center gap-2 mb-4">
            <span>🔥</span> 目标难度
          </h2>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-gray-400">入门级</span>
            <span class="text-xs text-gray-400">挑战级</span>
          </div>
          <input type="range" min="0" max="4" step="1" value=${difficulty}
            class="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200 accent-primary-700"
            onChange=${(e) => setDifficulty(parseInt(e.target.value, 10))} />
          <div class="flex items-center justify-between mt-3 gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <span class="shrink-0 inline-flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-1 text-sm font-bold text-primary-700">
                ${DIFFICULTY_LABELS[difficulty]}
              </span>
              <span class="text-xs text-gray-400 truncate hidden sm:inline">${DIFFICULTY_DESC[difficulty]}</span>
            </div>
            <div class="flex gap-1 shrink-0">
              ${DIFFICULTY_LABELS.map((_, i) => html`
                <span key=${i} class=${`w-1.5 h-1.5 rounded-full ${i <= difficulty ? 'bg-primary-600' : 'bg-gray-200'}`}></span>
              `)}
            </div>
          </div>
        </section>

        <!-- 视觉风格偏好（单选）-->
        <section class="mt-5 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <h2 class="text-lg font-bold text-primary-800 flex items-center gap-2 mb-4">
            <span>🎨</span> 视觉风格偏好
            <span class="text-xs text-gray-400 font-normal">（单选）</span>
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            ${VISUAL_STYLES.map((v) => {
              const selected = visualStyle === v.id
              return html`
                <button key=${v.id}
                  class=${`relative rounded-xl border-2 p-4 text-center transition-all duration-200 overflow-hidden
                    ${selected ? 'border-secondary-400 bg-secondary-50 shadow-sm' : 'border-gray-200 bg-white hover:border-secondary-300'}`}
                  onClick=${() => setVisualStyle(v.id)}>
                  ${selected ? html`<span class="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-secondary-400 text-white text-xs flex items-center justify-center font-bold">✓</span>` : null}
                  <div class="absolute inset-x-0 top-0 h-1" style=${{ background: `linear-gradient(to right, ${v.colors})` }}></div>
                  <div class="text-4xl mb-2 mt-1">${v.emoji}</div>
                  <div class="text-sm font-bold text-gray-800">${v.name}</div>
                  <div class="text-[11px] text-gray-400 mt-0.5">${v.desc}</div>
                </button>
              `
            })}
          </div>
        </section>

        <!-- 学习深度 + 游戏时长（两栏）-->
        <div class="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <!-- 学习深度 -->
          <section class="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
            <h2 class="text-lg font-bold text-primary-800 flex items-center gap-2 mb-4">
              <span>🧠</span> 学习深度
              <span class="text-xs text-gray-400 font-normal">（单选）</span>
            </h2>
            <div class="space-y-2.5">
              ${LEARNING_DEPTHS.map((d) => {
                const selected = depth === d.id
                return html`
                  <button key=${d.id}
                    class=${`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200
                      ${selected ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
                    onClick=${() => setDepth(d.id)}>
                    <span class="text-2xl shrink-0">${d.emoji}</span>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-bold text-gray-800">${d.name}</div>
                      <div class="text-xs text-gray-400 mt-0.5">${d.desc}</div>
                    </div>
                    ${selected
                      ? html`<span class="w-5 h-5 shrink-0 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">✓</span>`
                      : html`<span class="w-5 h-5 shrink-0 rounded-full border-2 border-gray-200"></span>`}
                  </button>
                `
              })}
            </div>
          </section>

          <!-- 游戏时长 -->
          <section class="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
            <h2 class="text-lg font-bold text-primary-800 flex items-center gap-2 mb-4">
              <span>⏱️</span> 预计游戏时长
              <span class="text-xs text-gray-400 font-normal">（单选）</span>
            </h2>
            <div class="grid grid-cols-2 gap-3">
              ${GAME_DURATIONS.map((g) => {
                const selected = duration === g.id
                return html`
                  <button key=${g.id}
                    class=${`relative rounded-xl border-2 p-5 text-center transition-all duration-200
                      ${selected ? 'border-primary-600 bg-primary-50 shadow-sm' : 'border-gray-200 hover:border-primary-300'}`}
                    onClick=${() => setDuration(g.id)}>
                    ${selected ? html`<span class="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">✓</span>` : null}
                    <div class="text-3xl mb-1.5">${g.emoji}</div>
                    <div class="text-sm font-bold text-gray-800">${g.name}</div>
                  </button>
                `
              })}
            </div>
          </section>
        </div>

        <!-- 底部启动按钮 -->
        <section class="mt-8">
          <button
            class=${`group w-full rounded-2xl bg-secondary-400 hover:bg-secondary-300 px-6 py-5 font-bold text-primary-900 text-lg shadow-lg shadow-secondary-400/30 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3
              ${canLaunch ? '' : 'opacity-60 cursor-not-allowed hover:scale-100'}`}
            onClick=${canLaunch ? launch : undefined}
            disabled=${!canLaunch}>
            <span class="text-2xl">🚀</span>
            <span>启动AI协作</span>
            <span class="text-sm font-medium text-primary-800/70">· 这不比刷题燃？</span>
          </button>
          ${canLaunch
            ? html`<p class="text-center text-xs text-gray-400 mt-2">${MEMES.encourage[0]} AI团队已就位，含金量拉满</p>`
            : html`<p class="text-center text-xs text-gray-400 mt-2">先选至少一个游戏类型，稳住我们能赢</p>`}
        </section>

      <//>
      <${Footer} />
    </div>
  `
}
