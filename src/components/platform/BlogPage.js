// 博客/资源中心 — Hero + 游戏模板蓝图 + 分类筛选 + 精选文章 + 文章网格 + 订阅
import { html, useContext, useState, useCallback } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'
import { NavBar, Footer, PageContainer } from './PlatformCommon.js?v=nav3'
import GameTemplateSection from './GameTemplateSection.js'

// ── 复古未来主义色板 ──
const C = {
  bg: '#05010f',
  text: '#f5e8ff',
  textMuted: '#8b7da8',
  textDim: '#5d4f7a',
  primary: '#a78bfa',
  accent: '#F5A623',
  border: 'rgba(167,139,250,0.12)',
  surface: 'rgba(255,255,255,0.03)',
}

// ── 分类配置 ──
// 教程=#a78bfa, 案例=#F5A623, 更新=#4ade80, 技术=#f472b6
const CATEGORIES = [
  { id: 'all', label: '全部', color: C.text },
  { id: 'tutorial', label: '使用教程', color: '#a78bfa' },
  { id: 'case', label: '案例研究', color: '#F5A623' },
  { id: 'update', label: '产品更新', color: '#4ade80' },
  { id: 'tech', label: '教育技术', color: '#f472b6' },
]

// ── 分类渐变色（封面占位）──
const GRADIENT_MAP = {
  tutorial: 'linear-gradient(135deg, #6d4aff 0%, #a78bfa 50%, #c4b5fd 100%)',
  case: 'linear-gradient(135deg, #d97706 0%, #F5A623 50%, #fbbf24 100%)',
  update: 'linear-gradient(135deg, #16a34a 0%, #4ade80 50%, #86efac 100%)',
  tech: 'linear-gradient(135deg, #db2777 0%, #f472b6 50%, #f9a8d4 100%)',
}

// ── 精选文章（顶部大卡片）──
const FEATURED_POST = {
  id: 'f1',
  category: 'tutorial',
  title: '从教材到游戏：5分钟生成你的第一个教学游戏方案',
  excerpt: '手把手教你如何把一本枯燥的物理教材，通过多智能体AI协作，变成一个让学生停不下来的游戏化教学方案。涵盖学段选择、团队组建、偏好设置到方案导出的完整流程，附3个真实案例对比。',
  author: '林知远',
  authorInitial: '林',
  date: '2026-07-09',
  readTime: '8 分钟',
  featured: true,
}

// ── 文章列表（9篇）──
const POSTS = [
  {
    id: 'p1',
    category: 'tutorial',
    title: 'AI团队组建指南：如何为不同学科选对智能体',
    excerpt: '132个AI角色怎么选？本文按学科分类，给出语文、数学、英语、物理等主流学科的最佳智能体搭配方案，附配置清单。',
    author: '陈墨白',
    authorInitial: '陈',
    date: '2026-07-08',
    readTime: '6 分钟',
  },
  {
    id: 'p2',
    category: 'case',
    title: '小学分数教学游戏化：让"切披萨"变成闯关冒险',
    excerpt: '一位三年级数学老师用平台把"分数概念"做成了闯关游戏，课堂参与率从40%飙升到95%。本文复盘完整设计思路。',
    author: '王思齐',
    authorInitial: '王',
    date: '2026-07-07',
    readTime: '5 分钟',
  },
  {
    id: 'p3',
    category: 'update',
    title: 'v2.1.0 发布：营销页面模块、FAQ折叠面板全新上线',
    excerpt: '本次更新带来6项重要功能，包括营销页面模块、核心功能卡片、FAQ折叠面板、用户评价系统、对比优势表和产品路线图。',
    author: '苏漫',
    authorInitial: '苏',
    date: '2026-07-10',
    readTime: '3 分钟',
  },
  {
    id: 'p4',
    category: 'tech',
    title: '多智能体协作的底层原理：让AI像真人一样开会',
    excerpt: '深入解析平台多智能体协作引擎的设计思路——消息总线、角色协议、共识机制，以及如何避免AI"各说各话"。',
    author: '赵研',
    authorInitial: '赵',
    date: '2026-07-06',
    readTime: '10 分钟',
  },
  {
    id: 'p5',
    category: 'tutorial',
    title: '偏好设置详解：难度、深度、时长怎么调最合适',
    excerpt: '游戏偏好决定了方案的风格走向。本文按学段和学科场景，给出难度、知识深度、游戏时长三个维度的推荐配置。',
    author: '林知远',
    authorInitial: '林',
    date: '2026-07-05',
    readTime: '4 分钟',
  },
  {
    id: 'p6',
    category: 'case',
    title: '考研政治通关游戏：把马原变成RPG剧情',
    excerpt: '考研党福音！一位大学生用平台把"马克思主义基本原理"做成了RPG剧情游戏，复习效率提升3倍，附带方案模板。',
    author: '王思齐',
    authorInitial: '王',
    date: '2026-07-04',
    readTime: '7 分钟',
  },
  {
    id: 'p7',
    category: 'update',
    title: 'v2.0.0 发布：复古未来主义主题全新上线',
    excerpt: '我们重构了整个视觉系统，带来统一的复古未来主义深色主题、CRT圆桌演示动画，以及全页面深色模式统一。',
    author: '苏漫',
    authorInitial: '苏',
    date: '2026-07-09',
    readTime: '4 分钟',
  },
  {
    id: 'p8',
    category: 'tech',
    title: '教材解析引擎：如何让AI真正"读懂"一本书',
    excerpt: '从PDF解析到知识图谱构建，揭秘平台的教材理解管线。我们如何提取知识点、识别难度层级、建立知识关联。',
    author: '赵研',
    authorInitial: '赵',
    date: '2026-07-03',
    readTime: '9 分钟',
  },
  {
    id: 'p9',
    category: 'case',
    title: '高中化学实验游戏化：让危险实验安全"炸"起来',
    excerpt: '化学实验危险又耗材？一位化学老师把"钠与水反应"等经典实验做成了模拟游戏，学生在安全环境里体验"爆炸"快感。',
    author: '王思齐',
    authorInitial: '王',
    date: '2026-07-02',
    readTime: '6 分钟',
  },
]

// 获取分类对象
const getCat = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[0]

// 文章卡片组件
function PostCard({ post, onRead }) {
  const cat = getCat(post.category)
  return html`
    <article key=${post.id} class="retro-section-dark rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group"
             style=${{ border: `1px solid ${C.border}` }}
             onMouseEnter=${(e) => {
               e.currentTarget.style.transform = 'translateY(-6px)'
               e.currentTarget.style.borderColor = `${cat.color}40`
               e.currentTarget.style.boxShadow = `0 12px 40px ${cat.color}15`
             }}
             onMouseLeave=${(e) => {
               e.currentTarget.style.transform = 'translateY(0)'
               e.currentTarget.style.borderColor = C.border
               e.currentTarget.style.boxShadow = 'none'
             }}
             onClick=${() => onRead(post)}>
      <!-- 封面渐变 -->
      <div class="h-36 relative overflow-hidden" style=${{ background: GRADIENT_MAP[post.category] }}>
        <div style=${{
          position: 'absolute', inset: '0',
          background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2) 0%, transparent 60%)',
        }}></div>
        <!-- 分类标签 -->
        <div class="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-bold"
             style=${{ background: 'rgba(5,1,15,0.7)', color: cat.color, backdropFilter: 'blur(8px)', border: `1px solid ${cat.color}30` }}>
          ${cat.label}
        </div>
        <!-- 装饰图标 -->
        <div class="absolute bottom-3 right-3 text-3xl opacity-30">📖</div>
      </div>
      <!-- 内容 -->
      <div class="p-5">
        <h3 class="text-base font-black mb-2 leading-snug line-clamp-2" style=${{ color: C.text }}>${post.title}</h3>
        <p class="text-xs leading-relaxed mb-4 line-clamp-2" style=${{ color: C.textMuted }}>${post.excerpt}</p>
        <!-- 底部信息 -->
        <div class="flex items-center justify-between pt-3 border-t" style=${{ borderColor: C.border }}>
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
                 style=${{ background: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}40` }}>
              ${post.authorInitial}
            </div>
            <span class="text-xs font-semibold" style=${{ color: C.textMuted }}>${post.author}</span>
          </div>
          <span class="text-[11px]" style=${{ color: C.textDim }}>${post.date} · ${post.readTime}</span>
        </div>
      </div>
    </article>
  `
}

export default function BlogPage() {
  const { dispatch, toast } = useContext(AppContext)
  const [activeCategory, setActiveCategory] = useState('all')
  const [email, setEmail] = useState('')

  const go = useCallback((step) => {
    dispatch({ type: 'SET_STEP', payload: step })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  const handleRead = useCallback((post) => {
    toast(`即将打开：${post.title.slice(0, 16)}...`, 'info')
  }, [toast])

  const handleSubscribe = useCallback(() => {
    if (!email || !email.includes('@')) {
      toast('请输入有效的邮箱地址', 'error')
      return
    }
    toast('订阅成功！我们会定期为你推送精彩内容', 'success')
    setEmail('')
  }, [email, toast])

  // 筛选文章（排除精选文章）
  const filteredPosts = POSTS.filter(p => activeCategory === 'all' || p.category === activeCategory)

  return html`
    <div style=${{ background: C.bg, minHeight: '100vh' }}>
      <${NavBar} />
      <${PageContainer}>

        <!-- ═══ Hero 区域 ═══ -->
        <section class="retro-section-dark relative overflow-hidden rounded-3xl text-center"
                 style=${{ border: `1px solid ${C.border}` }}>
          <!-- 背景封面图 -->
          <div class="absolute inset-0" style=${{
            backgroundImage: 'url(/assets/agents/量子迷宫项目封面.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}></div>
          <!-- 渐变遮罩 -->
          <div class="absolute inset-0" style=${{
            background: 'linear-gradient(180deg, rgba(5,1,15,0.6) 0%, rgba(5,1,15,0.75) 60%, rgba(5,1,15,0.9) 100%)',
          }}></div>

          <div class="relative px-6 py-14 sm:px-12 sm:py-20">
            <div class="retro-eyebrow mb-4">// RESOURCE CENTER</div>
            <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black mb-5 leading-tight" style=${{ color: C.text }}>
              资源
              <span style=${{
                background: 'linear-gradient(135deg, #a78bfa, #F5A623)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>中心</span>
            </h1>
            <p class="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed" style=${{ color: C.textMuted }}>
              使用教程、真实案例、产品更新与教育技术深度文章。把知识变成游戏，我们是认真的。
            </p>
            <div class="flex items-center justify-center gap-4 mt-6 text-xs" style=${{ color: C.textDim }}>
              <span>${POSTS.length + 1} 篇文章</span>
              <span>·</span>
              <span>每周更新</span>
              <span>·</span>
              <span>持续进化中</span>
            </div>
          </div>
        </section>

        <!-- ═══ 游戏模板蓝图矩阵 ═══ -->
        <div class="mb-14 mt-2">
          <${GameTemplateSection} />
        </div>

        <!-- ═══ 分类筛选栏 ═══ -->
        <div class="flex items-center justify-center gap-2 my-10 flex-wrap">
          ${CATEGORIES.map(cat => {
            const active = cat.id === activeCategory
            return html`
              <button key=${cat.id}
                class="px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200"
                style=${active
                  ? { background: cat.color, color: '#1a0f3d', boxShadow: `0 4px 16px ${cat.color}30` }
                  : { background: C.surface, color: C.textMuted, border: `1px solid ${C.border}` }}
                onMouseEnter=${(e) => { if (!active) { e.target.style.color = cat.color; e.target.style.borderColor = `${cat.color}40` } }}
                onMouseLeave=${(e) => { if (!active) { e.target.style.color = C.textMuted; e.target.style.borderColor = C.border } }}
                onClick=${() => setActiveCategory(cat.id)}>
                ${cat.label}
              </button>
            `
          })}
        </div>

        <!-- ═══ 精选文章（仅"全部"时显示） ═══ -->
        ${activeCategory === 'all' ? html`
          <section class="mb-10">
            <div class="flex items-center gap-2 mb-5">
              <span class="text-lg">⭐</span>
              <span class="retro-eyebrow">FEATURED POST</span>
            </div>
            ${(() => {
              const post = FEATURED_POST
              const cat = getCat(post.category)
              return html`
                <article class="retro-section-dark rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 transition-all duration-300 cursor-pointer"
                         style=${{ border: `1px solid ${C.border}` }}
                         onMouseEnter=${(e) => {
                           e.currentTarget.style.borderColor = `${cat.color}40`
                           e.currentTarget.style.boxShadow = `0 12px 40px ${cat.color}12`
                         }}
                         onMouseLeave=${(e) => {
                           e.currentTarget.style.borderColor = C.border
                           e.currentTarget.style.boxShadow = 'none'
                         }}
                         onClick=${() => handleRead(post)}>
                  <!-- 左侧封面 -->
                  <div class="h-56 lg:h-auto relative overflow-hidden" style=${{ background: GRADIENT_MAP[post.category] }}>
                    <div style=${{
                      position: 'absolute', inset: '0',
                      background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.25) 0%, transparent 60%)',
                    }}></div>
                    <div class="absolute top-5 left-5 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                         style=${{ background: 'rgba(5,1,15,0.7)', color: cat.color, backdropFilter: 'blur(8px)', border: `1px solid ${cat.color}30` }}>
                      <span>⭐</span>
                      <span>${cat.label} · 精选</span>
                    </div>
                    <div class="absolute bottom-5 right-5 text-6xl opacity-20">🚀</div>
                  </div>
                  <!-- 右侧内容 -->
                  <div class="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                    <h2 class="text-xl sm:text-2xl font-black mb-3 leading-tight" style=${{ color: C.text }}>
                      ${post.title}
                    </h2>
                    <p class="text-sm leading-relaxed mb-5" style=${{ color: C.textMuted }}>
                      ${post.excerpt}
                    </p>
                    <div class="flex items-center gap-3 mb-4">
                      <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                           style=${{ background: `${cat.color}20`, color: cat.color, border: `2px solid ${cat.color}40` }}>
                        ${post.authorInitial}
                      </div>
                      <div>
                        <div class="text-sm font-bold" style=${{ color: C.text }}>${post.author}</div>
                        <div class="text-xs" style=${{ color: C.textDim }}>${post.date} · ${post.readTime}阅读</div>
                      </div>
                    </div>
                    <span class="inline-flex items-center gap-1 text-sm font-bold"
                          style=${{ color: cat.color }}>
                      阅读全文
                      <span class="transition-transform duration-200">→</span>
                    </span>
                  </div>
                </article>
              `
            })()}
          </section>
        ` : null}

        <!-- ═══ 文章网格 ═══ -->
        <section class="mb-14">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
              <span class="retro-eyebrow">ALL POSTS</span>
              <span class="text-xs" style=${{ color: C.textDim }}>${filteredPosts.length} 篇</span>
            </div>
          </div>

          ${filteredPosts.length > 0 ? html`
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              ${filteredPosts.map(post => html`<${PostCard} key=${post.id} post=${post} onRead=${handleRead} />`)}
            </div>
          ` : html`
            <div class="text-center py-16">
              <div class="text-5xl mb-3 opacity-50">📭</div>
              <p class="text-sm" style=${{ color: C.textMuted }}>该分类暂无文章</p>
            </div>
          `}
        </section>

        <!-- ═══ 订阅区域 ═══ -->
        <section class="retro-section-dark relative overflow-hidden rounded-3xl px-6 py-12 sm:px-10 sm:py-14 text-center"
                 style=${{ border: `1px solid ${C.border}` }}>
          <div style=${{
            position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
            width: '100%', height: '100%',
            background: 'radial-gradient(ellipse at 50% 100%, rgba(167,139,250,0.1) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}></div>
          <div class="relative">
            <div class="text-3xl mb-3">📬</div>
            <h2 class="text-2xl sm:text-3xl font-black mb-3" style=${{ color: C.text }}>订阅资源周刊</h2>
            <p class="text-sm sm:text-base max-w-xl mx-auto mb-8" style=${{ color: C.textMuted }}>
              每周精选一篇教育游戏化干货，直达你的邮箱。不灌水，不打扰，只推真正有用的内容。
            </p>
            <div class="flex items-center justify-center gap-3 max-w-md mx-auto flex-wrap">
              <input type="email" value=${email}
                     placeholder="输入你的邮箱地址"
                     class="flex-1 min-w-[200px] px-4 py-3 rounded-xl text-sm outline-none transition-all"
                     style=${{
                       background: 'rgba(5,1,15,0.6)',
                       color: C.text,
                       border: `1px solid ${C.border}`,
                     }}
                     onInput=${(e) => setEmail(e.target.value)}
                     onFocus=${(e) => { e.target.style.borderColor = `${C.primary}60` }}
                     onBlur=${(e) => { e.target.style.borderColor = C.border }} />
              <button class="px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 shrink-0"
                      style=${{ background: C.accent, color: '#1a0f3d', boxShadow: `0 4px 20px ${C.accent}30` }}
                      onMouseEnter=${(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = `0 8px 28px ${C.accent}50` }}
                      onMouseLeave=${(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 4px 20px ${C.accent}30` }}
                      onClick=${handleSubscribe}>
                立即订阅
              </button>
            </div>
            <div class="text-xs mt-4" style=${{ color: C.textDim }}>
              我们尊重你的隐私，随时可取消订阅
            </div>
          </div>
        </section>

        <!-- ═══ 底部导航 ═══ -->
        <div class="flex items-center justify-center gap-3 mt-12 flex-wrap">
          <button class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                  style=${{ background: 'rgba(167,139,250,0.1)', color: C.primary, border: `1px solid ${C.primary}` }}
                  onMouseEnter=${(e) => { e.target.style.background = 'rgba(167,139,250,0.2)' }}
                  onMouseLeave=${(e) => { e.target.style.background = 'rgba(167,139,250,0.1)' }}
                  onClick=${() => go(STEPS.LANDING)}>
            ← 返回首页
          </button>
          <button class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                  style=${{ background: 'transparent', color: C.textMuted, border: `1px solid ${C.border}` }}
                  onMouseEnter=${(e) => { e.target.style.color = C.accent; e.target.style.borderColor = `${C.accent}40` }}
                  onMouseLeave=${(e) => { e.target.style.color = C.textMuted; e.target.style.borderColor = C.border }}
                  onClick=${() => go(STEPS.CHANGELOG)}>
            查看更新日志 →
          </button>
        </div>

      <//>
      <${Footer} />
    </div>
  `
}
