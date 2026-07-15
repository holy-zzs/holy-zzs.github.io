// 页面12：方案详情页
// 别人做的方案长啥样？点进来抄作业，含金量拉满
import { html, useContext, useCallback, useState, useEffect } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js?v=ctx2'
import { COMMUNITY_PLANS, VISUAL_STYLES } from '../../data/platformData.js'
import { NavBar, Footer, PageContainer, EmptyState } from './PlatformCommon.js?v=nav3'

// ── Mock 评论数据 ──
const MOCK_COMMENTS = [
  { id: 'cm1', user: '函数杀手', avatar: '🎯', time: '2天前', rating: 5, content: '这不比博人传燃？学生玩得根本停不下来，含金量拉满！' },
  { id: 'cm2', user: '数学课代表', avatar: '📐', time: '5天前', rating: 5, content: '试了一节课，学生主动要求加练，有手就行啊这方案' },
  { id: 'cm3', user: '摸鱼达人', avatar: '🐟', time: '1周前', rating: 4, content: '稳住我们能赢，这方案直接抄了，爱你老己' },
]

// ── Mock 关卡数据 ──
const MOCK_LEVELS = [
  { id: 'lv1', name: '第1关：初识抛物线', difficulty: '入门', stars: 1, knowledge: '二次函数定义', desc: '认识 y=ax²+bx+c，理解抛物线的基本形状。玩家通过拖拽参数滑块观察图象变化，用弹道击中目标物。主打一个无痛入门，有手就行。' },
  { id: 'lv2', name: '第2关：开口的秘密', difficulty: '入门', stars: 1, knowledge: '开口方向（a 的正负）', desc: '调整 a 的正负值，控制抛物线开口方向。开口向上击中高空目标，开口向下击中地面目标。让 a 的符号刻进 DNA。' },
  { id: 'lv3', name: '第3关：顶点在哪', difficulty: '进阶', stars: 2, knowledge: '顶点坐标公式 (-b/2a, ...)', desc: '计算顶点坐标，利用顶点位置设计最优弹道。顶点就是抛物线的"最值"，也是你的制胜关键。' },
  { id: 'lv4', name: '第4关：对称之美', difficulty: '进阶', stars: 2, knowledge: '对称轴 x=-b/2a', desc: '利用对称轴性质，一石二鸟同时击中左右对称目标。对称轴就是你的瞄准镜，稳住我们能赢。' },
  { id: 'lv5', name: '第5关：判别式试炼', difficulty: '挑战', stars: 3, knowledge: '判别式 Δ=b²-4ac', desc: '通过判别式判断弹道是否命中目标。Δ>0 两个交点双杀，Δ=0 擦边命中，Δ<0 脱靶重来。' },
  { id: 'lv6', name: '第6关：顶点式变身', difficulty: '挑战', stars: 3, knowledge: '顶点式 y=a(x-h)²+k', desc: '将一般式化为顶点式，灵活调整弹道参数。两种形式自由切换，含金量还在上升。' },
  { id: 'lv7', name: '第7关：极限挑战', difficulty: '硬核', stars: 4, knowledge: '综合应用', desc: '综合运用所有知识，在限时内完成多目标精准打击。时间紧任务重，手速和脑速缺一不可。' },
  { id: 'lv8', name: '第8关：Boss战——函数大师', difficulty: '硬核', stars: 5, knowledge: '全部知识点', desc: '最终 BOSS 战，需要灵活切换各种函数形式。击败 BOSS 证明你已经把二次函数拿捏了，这不比博人传燃？' },
]

// ── 知识点图谱数据 ──
const KNOWLEDGE_GRAPH = [
  { node: '二次函数定义', emoji: '📐', links: ['一般式 y=ax²+bx+c', '顶点式 y=a(x-h)²+k'] },
  { node: '图象与性质', emoji: '📈', links: ['开口方向', '对称轴', '顶点坐标'] },
  { node: '顶点式', emoji: '🏔️', links: ['顶点坐标', '平移变换'] },
  { node: '判别式', emoji: '⚖️', links: ['根的个数', '图象与 x 轴交点'] },
  { node: '实际应用', emoji: '🎯', links: ['最值问题', '抛体运动'] },
]

// ── 构建方案详情 mock 数据 ──
function buildPlanDetail(plan) {
  return {
    ...plan,
    levelCount: MOCK_LEVELS.length,
    learnTime: '约 30 分钟',
    visualStyle: '赛博朋克',
    publishTime: '2026-06-15',
    authorAvatar: '🧮',
    authorBio: '初中数学老师 / 游戏化教学狂热者 / 含金量制造机',
    followers: 1280,
    analysisSummary:
      '本方案基于人教版初中数学九年级上册"二次函数"章节。二次函数是初中数学的核心内容之一，连接了代数与几何，是高中函数学习的重要基础。教材重点在于理解二次函数的概念、图象和性质，难点在于灵活运用顶点式、对称轴和判别式解决实际问题。本方案将抽象的函数性质转化为直观的弹道射击游戏，让学生在"玩"中自然内化知识，含金量还在上升。',
    gameplay:
      '核心玩法为"弹道射击"——玩家通过调整二次函数的参数（a、b、c）来控制抛物线弹道，击中屏幕上的目标。每关有不同的目标和限制条件，需要玩家真正理解函数性质才能通关。设有"函数实验室"自由模式，可随意调参观察图象变化。搭配赛博朋克风格的视觉特效和电子音乐，让数学课变成电竞赛事。这不比刷题燃？',
    assessment:
      '通过前后测对比、通关数据分析、玩家行为追踪三个维度评估学习效果。重点关注：概念理解正确率（目标 >85%）、公式运用熟练度（目标通关时间 <2 分钟/关）、知识迁移能力（综合关通关率 >70%）。系统自动生成错题本，记录玩家的薄弱知识点并推荐对应关卡重练。稳住，我们能赢。',
    visualSuggestion:
      '采用赛博朋克风格，霓虹色调搭配深色背景，营造未来科技感。函数图象用发光线条呈现，目标物使用几何造型，配合粒子特效和电子音乐，让数学课变成电竞赛事。UI 设计参考热门射击游戏，有手就行，上手零门槛。色彩以紫色和琥珀色为主，呼应平台的 primary-800 和 secondary-400 色调。',
  }
}

// ── 星星评分组件 ──
function Stars({ rating, size = 'text-base' }) {
  const full = Math.round(rating)
  return html`
    <span class=${`inline-flex items-center ${size}`}>
      ${Array.from({ length: 5 }).map((_, i) => html`
        <span key=${i} class=${i < full ? 'text-secondary-400' : 'text-gray-200'}>★</span>
      `)}
    </span>
  `
}

// ── 可折叠章节组件 ──
function Section({ icon, title, subtitle, open, onToggle, children }) {
  return html`
    <div class="bg-white rounded-xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-sm">
      <button class="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50/50 transition-colors"
              onClick=${onToggle}>
        <div class="flex items-center gap-3 min-w-0">
          <span class="text-xl shrink-0">${icon}</span>
          <div class="min-w-0">
            <h3 class="font-bold text-primary-800 text-sm">${title}</h3>
            ${subtitle ? html`<p class="text-xs text-gray-400 mt-0.5 truncate">${subtitle}</p>` : null}
          </div>
        </div>
        <span class=${`shrink-0 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      ${open ? html`
        <div class="px-5 pb-5 pt-1 border-t border-gray-50 text-sm text-gray-600 leading-relaxed">
          ${children}
        </div>
      ` : null}
    </div>
  `
}

export default function PlanDetailPage() {
  const { state, dispatch, toast } = useContext(AppContext)

  const plan = buildPlanDetail(state.selectedPlan || COMMUNITY_PLANS[0])
  const vs = VISUAL_STYLES.find((v) => v.name === plan.visualStyle) || VISUAL_STYLES[4]

  const [openSections, setOpenSections] = useState({
    analysis: true,
    graph: false,
    gameplay: true,
    levels: false,
    assessment: false,
    visual: false,
  })
  const [expandLevel, setExpandLevel] = useState('lv1')
  const [followed, setFollowed] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentRating, setCommentRating] = useState(5)
  const [comments, setComments] = useState(MOCK_COMMENTS)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  const goBack = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: STEPS.COMMUNITY })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  const toggleSection = useCallback((key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const toggleLevel = useCallback((id) => {
    setExpandLevel((prev) => (prev === id ? null : id))
  }, [])

  const submitComment = useCallback(() => {
    if (!commentText.trim()) {
      toast('说点什么再发吧，别只发空气', 'error')
      return
    }
    setComments((prev) => [
      {
        id: `cm${Date.now()}`,
        user: '我',
        avatar: '😎',
        time: '刚刚',
        rating: commentRating,
        content: commentText.trim(),
      },
      ...prev,
    ])
    setCommentText('')
    setCommentRating(5)
    toast('评论发出去了，含金量+1', 'success')
  }, [commentText, commentRating, toast])

  const handleDownload = useCallback(() => {
    toast('方案文档下载中…稳住我们能赢', 'info')
    setTimeout(() => toast('下载完成！这不比博人传燃？', 'success'), 1500)
  }, [toast])

  const handleCopy = useCallback(() => {
    toast('已复制到我的项目，去开工吧！', 'success')
    setTimeout(() => {
      dispatch({ type: 'SET_STEP', payload: STEPS.PROJECTS })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 1200)
  }, [dispatch, toast])

  const handleFavorite = useCallback(() => {
    setFavorited((prev) => !prev)
    toast(favorited ? '取消收藏了，它会在角落哭的' : '收藏成功！爱你老己', 'success')
  }, [favorited, toast])

  const handleShare = useCallback(() => {
    toast('链接已复制，快去发给搭子一起抄作业', 'success')
  }, [toast])

  const scrollToComments = useCallback(() => {
    document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const sections = [
    { key: 'analysis', icon: '📚', title: '教材分析摘要', subtitle: '看看这教材怎么拆的' },
    { key: 'graph', icon: '🕸️', title: '知识点图谱', subtitle: '知识点之间的关系一目了然' },
    { key: 'gameplay', icon: '🎮', title: '游戏玩法机制', subtitle: '这游戏到底怎么玩' },
    { key: 'levels', icon: '🗺️', title: '关卡设计详情', subtitle: `${plan.levelCount} 个关卡，循序渐进` },
    { key: 'assessment', icon: '🫠', title: '学习效果评估', subtitle: '怎么知道学没学会' },
    { key: 'visual', icon: '🎨', title: '视觉风格建议', subtitle: '好不好看很重要' },
  ]

  return html`
    <div class="min-h-screen" style=${{ background: '#05010f', minHeight: '100vh' }}>
      <${NavBar} />
      <${PageContainer}>

        <!-- 返回按钮 -->
        <button class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-primary-50 hover:text-primary-700 mb-4"
                onClick=${goBack}>
          ← 返回社区
        </button>

        <!-- 主体：双栏布局 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- 左侧：主内容 -->
          <div class="lg:col-span-2 space-y-5">

            <!-- 方案概览卡片 -->
            <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-800 to-primary-900 p-6 sm:p-8 text-white">
              <div class="pointer-events-none absolute right-0 top-0 text-[10rem] leading-none opacity-10">${plan.emoji}</div>
              <div class="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-secondary-400/10 blur-3xl"></div>
              <div class="relative">
                <div class="flex items-center gap-2 mb-3">
                  <span class="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">${plan.emoji} ${plan.gameType}</span>
                  <span class="inline-flex items-center gap-1 rounded-full bg-secondary-400/20 px-2.5 py-1 text-xs font-semibold text-secondary-300">${plan.grade} · ${plan.subject}</span>
                </div>
                <h1 class="text-3xl font-black sm:text-4xl">${plan.title}</h1>
                <p class="mt-2 text-sm text-white/70">把${plan.subject}知识变成上头游戏，含金量还在上升</p>

                <!-- 概览数据 -->
                <div class="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div class="rounded-lg bg-white/10 px-3 py-2.5">
                    <div class="text-xs text-white/60">关卡数</div>
                    <div class="text-lg font-bold mt-0.5">🗺️ ${plan.levelCount} 关</div>
                  </div>
                  <div class="rounded-lg bg-white/10 px-3 py-2.5">
                    <div class="text-xs text-white/60">学习时长</div>
                    <div class="text-lg font-bold mt-0.5">⏱️ ${plan.learnTime}</div>
                  </div>
                  <div class="rounded-lg bg-white/10 px-3 py-2.5">
                    <div class="text-xs text-white/60">视觉风格</div>
                    <div class="text-lg font-bold mt-0.5">${vs.emoji} ${plan.visualStyle}</div>
                  </div>
                  <div class="rounded-lg bg-white/10 px-3 py-2.5">
                    <div class="text-xs text-white/60">评分</div>
                    <div class="text-lg font-bold mt-0.5">⭐ ${plan.rating}</div>
                  </div>
                </div>
              </div>
            </section>

            <!-- 作者信息卡片 -->
            <section class="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5">
              <div class="w-14 h-14 rounded-full bg-gradient-to-br from-secondary-300 to-secondary-500 flex items-center justify-center text-3xl shrink-0">
                ${plan.authorAvatar}
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-primary-800">${plan.author}</h3>
                  <span class="text-xs text-secondary-600 bg-secondary-50 px-1.5 py-0.5 rounded">认证创作者</span>
                </div>
                <p class="text-xs text-gray-400 mt-0.5 truncate">${plan.authorBio}</p>
                <p class="text-xs text-gray-300 mt-0.5">📅 发布于 ${plan.publishTime} · ${plan.followers} 人关注</p>
              </div>
              <button class=${`shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all
                ${followed ? 'bg-gray-100 text-gray-500' : 'bg-primary-800 text-white hover:bg-primary-900'}`}
                      onClick=${() => { setFollowed(!followed); toast(followed ? '取关了，再见' : '关注成功！一起含金量拉满', 'success') }}>
                ${followed ? '✓ 已关注' : '+ 关注'}
              </button>
            </section>

            <!-- 可折叠章节 -->
            <div class="space-y-3">
              ${sections.map((sec) => html`
                <${Section}
                  key=${sec.key}
                  icon=${sec.icon}
                  title=${sec.title}
                  subtitle=${sec.subtitle}
                  open=${openSections[sec.key]}
                  onToggle=${() => toggleSection(sec.key)}>

                  ${sec.key === 'analysis' && html`<p>${plan.analysisSummary}</p>`}

                  ${sec.key === 'graph' && html`
                    <div class="space-y-3">
                      ${KNOWLEDGE_GRAPH.map((node, i) => html`
                        <div key=${i}>
                          <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-xl shrink-0">${node.emoji}</div>
                            <div class="flex-1 min-w-0">
                              <div class="font-semibold text-sm text-gray-700">${node.node}</div>
                              <div class="flex flex-wrap gap-1.5 mt-1">
                                ${node.links.map((link, j) => html`
                                  <span key=${j} class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">${link}</span>
                                `)}
                              </div>
                            </div>
                          </div>
                          ${i < KNOWLEDGE_GRAPH.length - 1 ? html`<div class="ml-5 border-l-2 border-dashed border-gray-200 h-4"></div>` : null}
                        </div>
                      `)}
                    </div>
                  `}

                  ${sec.key === 'gameplay' && html`<p>${plan.gameplay}</p>`}

                  ${sec.key === 'levels' && html`
                    <div class="space-y-2">
                      ${MOCK_LEVELS.map((lv) => {
                        const expanded = expandLevel === lv.id
                        return html`
                          <div key=${lv.id} class=${`rounded-lg border transition-all ${expanded ? 'border-primary-200 bg-primary-50/30' : 'border-gray-100'}`}>
                            <button class="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
                                    onClick=${() => toggleLevel(lv.id)}>
                              <div class="flex items-center gap-3 min-w-0">
                                <span class="text-xs font-mono text-gray-400 shrink-0">${lv.id.toUpperCase()}</span>
                                <span class="font-semibold text-sm text-gray-700 truncate">${lv.name}</span>
                              </div>
                              <div class="flex items-center gap-2 shrink-0">
                                <span class="text-xs text-secondary-500">${'⭐'.repeat(lv.stars)}</span>
                                <span class=${`text-xs px-2 py-0.5 rounded-full ${lv.stars <= 1 ? 'bg-green-50 text-green-600' : lv.stars <= 2 ? 'bg-blue-50 text-blue-600' : lv.stars <= 3 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>${lv.difficulty}</span>
                                <span class=${`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>▾</span>
                              </div>
                            </button>
                            ${expanded ? html`
                              <div class="px-4 pb-3 pt-1 border-t border-primary-100/50">
                                <div class="text-xs text-primary-600 font-medium mb-1">📌 知识点：${lv.knowledge}</div>
                                <p class="text-xs text-gray-500 leading-relaxed">${lv.desc}</p>
                              </div>
                            ` : null}
                          </div>
                        `
                      })}
                    </div>
                  `}

                  ${sec.key === 'assessment' && html`<p>${plan.assessment}</p>`}

                  ${sec.key === 'visual' && html`
                    <div>
                      <p class="mb-3">${plan.visualSuggestion}</p>
                      <div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                        <div class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0"
                             style=${{ background: `linear-gradient(135deg, ${vs.colors.split(',')[0]}, ${vs.colors.split(',')[1]})` }}>
                          ${vs.emoji}
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-gray-700">${vs.name}</div>
                          <div class="text-xs text-gray-400">${vs.desc}</div>
                          <div class="flex gap-1 mt-1">
                            ${vs.colors.split(',').map((c, i) => html`<span key=${i} class="w-4 h-4 rounded" style=${{ background: c }}></span>`)}
                          </div>
                        </div>
                      </div>
                    </div>
                  `}

                <//>
              `)}
            </div>

            <!-- 评分和评论区域 -->
            <section id="comments-section" class="rounded-xl border border-gray-100 bg-white p-5 sm:p-6">
              <h3 class="text-lg font-bold text-primary-800 mb-4">💬 评分与评论</h3>

              <!-- 评分概览 -->
              <div class="flex items-center gap-6 pb-5 border-b border-gray-50">
                <div class="text-center">
                  <div class="text-4xl font-black text-secondary-400">${plan.rating}</div>
                  <div class="mt-1"><${Stars} rating=${plan.rating} /></div>
                  <div class="text-xs text-gray-400 mt-1">${comments.length} 条评论</div>
                </div>
                <div class="flex-1 space-y-1.5">
                  ${[5, 4, 3, 2, 1].map((star) => {
                    const pct = star === 5 ? 78 : star === 4 ? 15 : star === 3 ? 5 : star === 2 ? 1 : 1
                    return html`
                      <div key=${star} class="flex items-center gap-2 text-xs">
                        <span class="w-3 text-gray-400">${star}</span>
                        <span class="text-secondary-400">★</span>
                        <div class="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div class="h-full bg-secondary-400 rounded-full" style=${{ width: `${pct}%` }}></div>
                        </div>
                        <span class="w-8 text-right text-gray-400">${pct}%</span>
                      </div>
                    `
                  })}
                </div>
              </div>

              <!-- 评论输入框 -->
              <div class="py-5 border-b border-gray-50">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm font-medium text-gray-600">我的评分：</span>
                  ${Array.from({ length: 5 }).map((_, i) => html`
                    <button key=${i}
                            class=${`text-2xl transition-transform hover:scale-110 ${i < commentRating ? 'text-secondary-400' : 'text-gray-200'}`}
                            onClick=${() => setCommentRating(i + 1)}>
                      ★
                    </button>
                  `)}
                </div>
                <textarea value=${commentText}
                          onInput=${(e) => setCommentText(e.target.value)}
                          placeholder="说点啥…夸也行骂也行，别只发表情包"
                          rows="3"
                          class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none"></textarea>
                <div class="flex justify-end mt-2">
                  <button class="px-5 py-2 rounded-lg bg-primary-800 text-white text-sm font-semibold hover:bg-primary-900 transition-colors"
                          onClick=${submitComment}>
                    发表评论
                  </button>
                </div>
              </div>

              <!-- 评论列表 -->
              <div class="pt-5 space-y-4">
                ${comments.map((cm) => html`
                  <div key=${cm.id} class="flex gap-3">
                    <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl shrink-0">${cm.avatar}</div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="font-semibold text-sm text-gray-700">${cm.user}</span>
                        <span class="text-xs text-gray-300">${cm.time}</span>
                      </div>
                      <div class="mt-0.5"><${Stars} rating=${cm.rating} size="text-xs" /></div>
                      <p class="mt-1 text-sm text-gray-500 leading-relaxed">${cm.content}</p>
                    </div>
                  </div>
                `)}
              </div>
            </section>

          </div>

          <!-- 右侧：固定操作栏（sticky） -->
          <div class="lg:col-span-1">
            <div class="lg:sticky lg:top-24 space-y-4">

              <!-- 操作按钮组 -->
              <div class="rounded-xl border border-gray-100 bg-white p-4 space-y-3">
                <button class="w-full py-3 rounded-xl bg-primary-800 text-white text-sm font-bold hover:bg-primary-900 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 shadow-sm"
                        onClick=${handleDownload}>
                  <span>📥</span><span>下载方案</span>
                </button>
                <button class="w-full py-3 rounded-xl border-2 border-secondary-400 text-secondary-600 text-sm font-bold hover:bg-secondary-50 transition-all flex items-center justify-center gap-2"
                        onClick=${handleCopy}>
                  <span>📋</span><span>复制到我的项目</span>
                </button>

                <!-- 图标按钮行 -->
                <div class="grid grid-cols-3 gap-2 pt-1">
                  <button class=${`flex flex-col items-center gap-1 py-2.5 rounded-lg text-xs font-medium transition-all
                    ${favorited ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500 hover:bg-primary-50 hover:text-primary-600'}`}
                          onClick=${handleFavorite}>
                    <span class="text-lg">${favorited ? '❤️' : '🤍'}</span>
                    <span>${favorited ? '已收藏' : '收藏'}</span>
                  </button>
                  <button class="flex flex-col items-center gap-1 py-2.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-primary-50 hover:text-primary-600 text-xs font-medium transition-all"
                          onClick=${handleShare}>
                    <span class="text-lg">🔗</span><span>分享</span>
                  </button>
                  <button class="flex flex-col items-center gap-1 py-2.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-primary-50 hover:text-primary-600 text-xs font-medium transition-all"
                          onClick=${scrollToComments}>
                    <span class="text-lg">💬</span><span>评论</span>
                  </button>
                </div>
              </div>

              <!-- 方案统计 -->
              <div class="rounded-xl border border-gray-100 bg-white p-4">
                <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">方案数据</h4>
                <div class="space-y-2.5">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-400">📥 下载量</span>
                    <span class="font-bold text-gray-700">${plan.downloads.toLocaleString()}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-400">⭐ 评分</span>
                    <span class="font-bold text-secondary-500">${plan.rating}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-400">🗺️ 关卡数</span>
                    <span class="font-bold text-gray-700">${plan.levelCount} 关</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-400">⏱️ 预计时长</span>
                    <span class="font-bold text-gray-700">${plan.learnTime}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-400">📅 发布时间</span>
                    <span class="font-bold text-gray-700">${plan.publishTime}</span>
                  </div>
                </div>
              </div>

              <!-- 提示卡片 -->
              <div class="rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 p-4 text-center">
                <div class="text-2xl mb-1">💡</div>
                <p class="text-xs text-gray-500 leading-relaxed">复制方案到项目后可以自由修改，加上自己的创意，含金量还能再涨一波</p>
              </div>

            </div>
          </div>

        </div>

      <//>
      <${Footer} />
    </div>
  `
}
