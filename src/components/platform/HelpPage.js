// 页面15：帮助中心 / 新手引导
// 使用流程教程 + FAQ手风琴 + 视频教程 + 联系客服 + 新手引导入口
import { FAQS, MEMES } from '../../data/platformData.js'
import { html, useCallback, useContext, useState } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'
import { EmptyState, Footer, NavBar, PageContainer } from './PlatformCommon.js'

// 使用流程5步
const FLOW_STEPS = [
  { num: '①', emoji: '🎚️', title: '选学段学科', desc: '从小学到大学，挑个对口的学段和学科方向' },
  { num: '②', emoji: '🤝', title: '组建AI团队', desc: '选预设团队或自己搭配智能体，各司其职' },
  { num: '③', emoji: '📚', title: '上传教材', desc: '把PDF或文本丢进来，AI自动拆解知识点' },
  { num: '④', emoji: '👀', title: '观看AI协作', desc: '智能体们开会讨论，实时吐出游戏方案' },
  { num: '⑤', emoji: '🎁', title: '下载方案', desc: '拿到完整设计文档，试玩、分享、迭代' },
]

export default function HelpPage() {
  const { dispatch } = useContext(AppContext)
  const [keyword, setKeyword] = useState('')
  const [expandedIndex, setExpandedIndex] = useState(-1)

  const go = useCallback((step) => {
    dispatch({ type: 'SET_STEP', payload: step })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  const toggleFaq = useCallback((i) => {
    setExpandedIndex((prev) => (prev === i ? -1 : i))
  }, [])

  // 搜索过滤 FAQ
  const kw = keyword.trim()
  const filteredFaqs = kw
    ? FAQS.filter((f) => f.q.includes(kw) || f.a.includes(kw))
    : FAQS

  return html`
    <div class="brand-page-root min-h-screen bg-[#FAFAFA]" style=${{ background: '#05010f', minHeight: '100vh' }}>
      <${NavBar} />
      <${PageContainer}>

        <!-- 顶部标题 + 搜索框 -->
        <section class="brand-surface-card relative overflow-hidden rounded-2xl px-6 py-8 sm:px-10 sm:py-10 text-white" style=${{ border: '1px solid rgba(167,139,250,0.12)' }}>
          <div style=${{
            position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
            backgroundImage: 'url("https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20retro-futuristic%20cyberpunk%20library%20or%20archive%2C%20glowing%20holographic%20data%20streams%2C%20neon%20violet%20and%20cyan%20colors%2C%20dark%20atmosphere%2C%208k&image_size=landscape_16_9")',
            backgroundSize: 'cover', backgroundPosition: 'center', opacity: '0.2', pointerEvents: 'none'
          }}></div>
          <div class="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-secondary-400/20 blur-3xl"></div>
          <div class="relative z-10">
            <div class="brand-eyebrow">Knowledge Center</div>
            <h1 class="brand-page-title">帮助中心</h1>
            <p class="brand-page-subtitle mt-2">保持首页同源的品牌表达，但优先服务查找、理解与上手效率。</p>
            <div class="mt-5 max-w-xl">
              <div class="flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2.5 shadow-lg"
                   style=${{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(167,139,250,0.12)' }}>
                <span class="text-gray-400 text-lg">🔍</span>
                <input type="text" value=${keyword}
                  onChange=${(e) => { setKeyword(e.target.value); setExpandedIndex(-1) }}
                  placeholder="搜一下问题关键词，比如 上传 / 团队 / 付费…"
                  class="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400" />
                ${keyword ? html`
                  <button class="text-gray-400 hover:text-gray-600 text-sm" onClick=${() => setKeyword('')}>✕</button>
                ` : null}
              </div>
            </div>
          </div>
        </section>

        <!-- 新手引导提示卡片 -->
        <section class="mt-6 rounded-2xl border-2 border-dashed border-secondary-300 bg-secondary-50/60 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                 style=${{ background: 'rgba(245,166,35,0.04)', borderColor: 'rgba(245,166,35,0.2)' }}>
          <div class="text-4xl shrink-0">🐣</div>
          <div class="flex-1">
            <h3 class="font-bold text-primary-800">第一次用？跟着引导走一遍</h3>
            <p class="text-sm text-gray-500 mt-0.5">5步搞定你的第一个游戏方案，有手就行，班味都能洗掉</p>
          </div>
          <button class="shrink-0 rounded-lg bg-secondary-400 hover:bg-secondary-300 px-5 py-2.5 text-sm font-bold text-primary-900 shadow-sm transition-colors"
                  onClick=${() => go(STEPS.LANDING)}>
            开始引导 →
          </button>
        </section>

        <!-- 使用流程图文教程 -->
        <section class="mt-6 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <h2 class="text-lg font-bold text-primary-800 flex items-center gap-2 mb-5">
            <span>🗺️</span> 怎么用？5步出方案
          </h2>
          <div class="flex flex-col gap-3 lg:flex-row lg:items-stretch">
            ${FLOW_STEPS.map((s, i) => html`
              <div key=${s.title} class="flex flex-1 flex-col lg:flex-row lg:items-center">
                <div class="flex-1 rounded-xl border border-gray-100 bg-gradient-to-br from-primary-50/60 to-white p-4 text-center">
                  <div class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 text-2xl">${s.emoji}</div>
                  <div class="text-sm font-bold text-primary-800">
                    <span class="text-secondary-500 mr-1">${s.num}</span>${s.title}
                  </div>
                  <div class="text-xs text-gray-400 mt-1 leading-relaxed">${s.desc}</div>
                </div>
                ${i < FLOW_STEPS.length - 1 ? html`<div class="flex items-center justify-center text-2xl text-secondary-400 rotate-90 lg:rotate-0 px-1 py-1">→</div>` : null}
              </div>
            `)}
          </div>
        </section>

        <!-- 常见问题 FAQ（手风琴）-->
        <section class="mt-6 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-primary-800 flex items-center gap-2">
              <span>💬</span> 常见问题
            </h2>
            <span class="text-xs text-gray-400">${filteredFaqs.length} 个问题</span>
          </div>
          ${filteredFaqs.length === 0 ? html`
            <${EmptyState}
              emoji="🤷"
              title="没搜到相关问题"
              desc="换个关键词试试，或者直接联系客服"
              actionLabel="联系客服"
              onAction=${() => go(STEPS.HELP)} />
          ` : html`
            <div class="divide-y divide-gray-100">
              ${filteredFaqs.map((f, i) => {
                const open = expandedIndex === i
                return html`
                  <div key=${i} class="py-1">
                    <button class="w-full flex items-center justify-between gap-3 py-3.5 text-left"
                            onClick=${() => toggleFaq(i)}>
                      <span class=${`text-sm font-semibold ${open ? 'text-primary-700' : 'text-gray-700'}`}>${f.q}</span>
                      <span class=${`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                        ${open ? 'bg-primary-600 text-white rotate-45' : 'bg-primary-900 text-gray-400'}`}>+</span>
                    </button>
                    <div class=${`overflow-hidden transition-all duration-300 ease-out ${open ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <p class="pb-3.5 pr-8 text-sm text-gray-500 leading-relaxed">${f.a}</p>
                    </div>
                  </div>
                `
              })}
            </div>
          `}
        </section>

        <!-- 视频教程 + 联系客服 -->
        <section class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <!-- 视频教程 -->
          <div class="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div class="flex items-start gap-4">
              <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 text-3xl">🎬</div>
              <div class="flex-1">
                <h3 class="font-bold text-primary-800">视频教程</h3>
                <p class="text-sm text-gray-400 mt-1">手把手演示完整流程，看完直接起飞</p>
                <span class="inline-block mt-3 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500"
                      style=${{ background: 'rgba(255,255,255,0.04)' }}>🚧 敬请期待</span>
              </div>
            </div>
          </div>

          <!-- 联系客服 -->
          <div class="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div class="flex items-start gap-4">
              <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary-100 to-secondary-200 text-3xl"
                   style=${{ background: 'rgba(245,166,35,0.1)' }}>📞</div>
              <div class="flex-1">
                <h3 class="font-bold text-primary-800">联系客服</h3>
                <p class="text-sm text-gray-400 mt-1">还有问题？加群或发邮件，秒回（大概）</p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <span class="inline-block rounded-lg bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-600">📧 help@knb.ai</span>
                  <span class="inline-block rounded-lg bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-600">💬 用户交流群</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 底部打气 -->
        <section class="mt-8 text-center">
          <p class="text-sm text-gray-400">${MEMES.idle[0]}</p>
          <button class="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary-800 hover:bg-primary-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors"
                  onClick=${() => go(STEPS.LANDING)}>
            <span>🏠</span> 回首页开整
          </button>
        </section>

      <//>
      <${Footer} />
    </div>
  `
}
