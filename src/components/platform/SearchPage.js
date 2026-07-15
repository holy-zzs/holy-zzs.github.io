// 全局搜索 — 顶部搜索框 + 范围筛选 + 分类分组结果 + 空状态/无结果状态
import { html, useContext, useState, useCallback, useEffect, useRef } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'
import { NavBar, Footer, PageContainer } from './PlatformCommon.js'

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

// ── 搜索范围 ──
const SCOPE_TABS = [
  { key: 'all', label: '全部', icon: '🔎' },
  { key: 'project', label: '项目', icon: '🎮' },
  { key: 'community', label: '社区作品', icon: '🌐' },
  { key: 'help', label: '帮助文章', icon: '📚' },
  { key: 'agent', label: 'AI角色', icon: '🤖' },
]

// ── 分类配置 ──
const CATEGORY_CONFIG = {
  project: { label: '项目', icon: '🎮', color: '#a78bfa' },
  community: { label: '社区作品', icon: '🌐', color: '#4ade80' },
  help: { label: '帮助文章', icon: '📚', color: '#F5A623' },
  agent: { label: 'AI角色', icon: '🤖', color: '#f472b6' },
}

// ── 搜索结果示例数据 ──
const SAMPLE_RESULTS = [
  // 项目
  { id: 1, type: 'project', title: '物理大冒险', excerpt: '基于高中物理力学知识设计的闯关冒险游戏，包含 5 个关卡，覆盖牛顿运动定律、动能定理与圆周运动。', meta: { author: '闪电皮卡丘', date: '2 天前', category: '高中物理' } },
  { id: 2, type: 'project', title: '化学消消乐', excerpt: '把化学方程式配平做成三消游戏，消掉正确组合就能得分，化学键知识全靠玩记住。', meta: { author: '化学小天才', date: '5 天前', category: '初中化学' } },
  { id: 3, type: 'project', title: '历史时空穿越', excerpt: '从秦朝到清朝的穿越剧情游戏，每个朝代一道历史大题，答对才能解锁下一个时空。', meta: { author: '时空旅人', date: '1 周前', category: '高中历史' } },
  { id: 4, type: 'project', title: '力学弹球大作战', excerpt: '用弹球碰撞演示动量守恒，关卡难度递增，知识点和玩法结合非常自然。', meta: { author: '物理魔法师', date: '3 天前', category: '高中物理' } },

  // 社区作品
  { id: 5, type: 'community', title: '高考物理闯关方案', excerpt: '一套完整的高考物理复习游戏方案，按知识点拆分关卡，附带教师使用指南和学生反馈数据。', meta: { author: '物理老张', date: '4 天前', category: '社区精选' } },
  { id: 6, type: 'community', title: '初中数学卡牌游戏', excerpt: '把代数运算做成卡牌对战，每张卡牌是一个运算符，出牌即解题，适合课堂热身。', meta: { author: '数学不头秃', date: '6 天前', category: '社区精选' } },
  { id: 7, type: 'community', title: '英语单词大逃杀', excerpt: '百人单词拼写大逃杀，活到最后需要拼对全部单词，紧张刺激还能背单词。', meta: { author: 'English Killer', date: '昨天', category: '热门作品' } },

  // 帮助文章
  { id: 8, type: 'help', title: '如何上传教材', excerpt: '详细介绍教材上传的完整流程，支持 PDF、TXT、Markdown 格式，以及大文件分块解析的注意事项。', meta: { author: '官方文档', date: '更新于 3 天前', category: '使用教程' } },
  { id: 9, type: 'help', title: 'AI团队怎么配置', excerpt: '从预设团队到自由搭配智能体，手把手教你组建最适合自己的 AI 协作团队。', meta: { author: '官方文档', date: '更新于 1 周前', category: '使用教程' } },
  { id: 10, type: 'help', title: '方案导出与分享', excerpt: '生成完游戏方案后如何导出 PDF、Markdown，以及分享到社区广场让更多人看到。', meta: { author: '官方文档', date: '更新于 5 天前', category: '使用教程' } },

  // AI角色
  { id: 11, type: 'agent', title: '学神本神', excerpt: '全科知识拆解专家，能把任何教材嚼碎了吐成知识点结构树，逻辑严密不废话。', meta: { author: '系统内置', date: 'v2.0', category: '知识拆解' } },
  { id: 12, type: 'agent', title: '戏精编剧', excerpt: '游戏剧情与关卡设计师，脑洞大开，擅长把干巴巴的知识点包装成有剧情的闯关体验。', meta: { author: '系统内置', date: 'v2.0', category: '玩法设计' } },
  { id: 13, type: 'agent', title: '颜值正义官', excerpt: '视觉与 UI 设计师，负责把控游戏方案的整体美术风格和界面布局，让方案好看又好用。', meta: { author: '系统内置', date: 'v2.0', category: '视觉设计' } },
  { id: 14, type: 'agent', title: '毒舌测试员', excerpt: '模拟真实玩家视角的测试智能体，专门挑毛病，确保方案的知识准确性和可玩性。', meta: { author: '系统内置', date: 'v2.1', category: '质量把关' } },
]

// ── 热门搜索标签 ──
const HOT_TAGS = ['物理', '化学', '卡牌', '闯关', 'AI团队', '上传教材', '导出方案', '高中数学']

// ── 最近浏览 ──
const RECENT_VIEWS = [
  { id: 101, title: '物理大冒险', type: 'project' },
  { id: 102, title: '如何上传教材', type: 'help' },
  { id: 103, title: '学神本神', type: 'agent' },
]

export default function SearchPage() {
  const { dispatch } = useContext(AppContext)
  const [inputValue, setInputValue] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeScope, setActiveScope] = useState('all')
  const inputRef = useRef(null)

  const go = useCallback((step) => {
    dispatch({ type: 'SET_STEP', payload: step })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  // 自动聚焦搜索框
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // 300ms 防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue.trim())
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue])

  // 执行搜索
  const hasQuery = debouncedQuery.length > 0
  const results = hasQuery
    ? SAMPLE_RESULTS.filter((r) => {
        const matchScope = activeScope === 'all' || r.type === activeScope
        if (!matchScope) return false
        const q = debouncedQuery.toLowerCase()
        return (
          r.title.toLowerCase().includes(q) ||
          r.excerpt.toLowerCase().includes(q) ||
          r.meta.category.toLowerCase().includes(q) ||
          r.meta.author.toLowerCase().includes(q)
        )
      })
    : []

  // 按分类分组
  const groupedResults = hasQuery
    ? SCOPE_TABS.filter((t) => t.key !== 'all').map((tab) => ({
        category: tab.key,
        items: results.filter((r) => r.type === tab.key),
      })).filter((g) => g.items.length > 0)
    : []

  const totalResults = results.length

  // 点击搜索结果跳转
  const handleResultClick = useCallback((item) => {
    const stepMap = {
      project: STEPS.PROJECTS,
      community: STEPS.COMMUNITY,
      help: STEPS.HELP,
      agent: STEPS.AGENTS,
    }
    const step = stepMap[item.type]
    if (step) {
      go(step)
    }
  }, [go])

  // 点击热门标签
  const handleTagClick = useCallback((tag) => {
    setInputValue(tag)
    if (inputRef.current) inputRef.current.focus()
  }, [])

  // 清空搜索
  const handleClear = useCallback(() => {
    setInputValue('')
    setDebouncedQuery('')
    if (inputRef.current) inputRef.current.focus()
  }, [])

  const inputStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: `1px solid ${C.border}`,
    color: C.text,
    outline: 'none',
  }

  return html`
    <div style=${{ background: C.bg, minHeight: '100vh' }}>
      <${NavBar} />
      <${PageContainer}>

        <!-- ═══ 顶部搜索区 ═══ -->
        <section class="retro-section-dark relative overflow-hidden rounded-3xl px-6 py-10 sm:px-10 sm:py-12"
                 style=${{ border: `1px solid ${C.border}` }}>
          <div style=${{
            position: 'absolute', top: '-30%', right: '-5%',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)',
            filter: 'blur(40px)', pointerEvents: 'none',
          }}></div>
          <div class="relative">
            <div class="retro-eyebrow mb-2">// GLOBAL SEARCH</div>
            <h1 class="text-3xl sm:text-4xl font-black mb-5" style=${{ color: C.text }}>
              搜点什么
            </h1>

            <!-- 搜索框 -->
            <div class="flex items-center gap-3 rounded-2xl px-5 py-4 transition-all duration-200"
                 style=${{ ...inputStyle, borderColor: hasQuery ? C.primary : C.border, boxShadow: hasQuery ? `0 0 0 3px rgba(167,139,250,0.1)` : 'none' }}>
              <span class="text-xl" style=${{ color: C.textMuted }}>🔍</span>
              <input ref=${inputRef} type="text" value=${inputValue}
                onChange=${(e) => setInputValue(e.target.value)}
                placeholder="搜索项目、社区作品、帮助文章、AI角色…"
                class="flex-1 bg-transparent outline-none text-base"
                style=${{ color: C.text }} />
              ${inputValue ? html`
                <button class="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors"
                        style=${{ background: 'rgba(255,255,255,0.06)', color: C.textMuted }}
                        onMouseEnter=${(e) => { e.target.style.background = 'rgba(255,255,255,0.12)'; e.target.style.color = C.text }}
                        onMouseLeave=${(e) => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.color = C.textMuted }}
                        onClick=${handleClear}>
                  ✕
                </button>
              ` : null}
            </div>

            <!-- 范围筛选 -->
            <div class="mt-4 flex flex-wrap items-center gap-2">
              ${SCOPE_TABS.map((tab) => {
                const active = activeScope === tab.key
                const count = hasQuery
                  ? (tab.key === 'all'
                      ? totalResults
                      : results.filter((r) => r.type === tab.key).length)
                  : 0
                return html`
                  <button key=${tab.key}
                    class="px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1.5"
                    style=${active
                      ? { background: C.primary, color: '#fff', boxShadow: `0 4px 16px ${C.primary}30` }
                      : { background: C.surface, color: C.textMuted, border: `1px solid ${C.border}` }}
                    onMouseEnter=${(e) => { if (!active) { e.target.style.background = 'rgba(167,139,250,0.1)'; e.target.style.color = C.primary } }}
                    onMouseLeave=${(e) => { if (!active) { e.target.style.background = C.surface; e.target.style.color = C.textMuted } }}
                    onClick=${() => setActiveScope(tab.key)}>
                    <span>${tab.icon}</span>
                    <span>${tab.label}</span>
                    ${hasQuery && count > 0 ? html`
                      <span class="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                            style=${{ background: active ? 'rgba(255,255,255,0.25)' : 'rgba(167,139,250,0.15)', color: active ? '#fff' : C.primary }}>
                        ${count}
                      </span>
                    ` : null}
                  </button>
                `
              })}
            </div>
          </div>
        </section>

        <!-- ═══ 搜索结果 / 空状态 ═══ -->
        <section class="mt-6">
          ${!hasQuery ? html`
            <!-- ── 空状态：热门搜索 + 最近浏览 ── -->
            <div class="space-y-6">
              <!-- 热门搜索 -->
              <div class="retro-section-dark rounded-2xl px-5 py-5 sm:px-6 sm:py-6"
                   style=${{ border: `1px solid ${C.border}` }}>
                <h2 class="text-base font-bold flex items-center gap-2 mb-4" style=${{ color: C.text }}>
                  <span>🔥</span> 热门搜索
                </h2>
                <div class="flex flex-wrap gap-2">
                  ${HOT_TAGS.map((tag) => html`
                    <button key=${tag}
                      class="px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                      style=${{ background: C.surface, color: C.textMuted, border: `1px solid ${C.border}` }}
                      onMouseEnter=${(e) => { e.target.style.background = 'rgba(167,139,250,0.1)'; e.target.style.color = C.text; e.target.style.borderColor = C.primary }}
                      onMouseLeave=${(e) => { e.target.style.background = C.surface; e.target.style.color = C.textMuted; e.target.style.borderColor = C.border }}
                      onClick=${() => handleTagClick(tag)}>
                      ${tag}
                    </button>
                  `)}
                </div>
              </div>

              <!-- 最近浏览 -->
              <div class="retro-section-dark rounded-2xl px-5 py-5 sm:px-6 sm:py-6"
                   style=${{ border: `1px solid ${C.border}` }}>
                <h2 class="text-base font-bold flex items-center gap-2 mb-4" style=${{ color: C.text }}>
                  <span>🕑</span> 最近浏览
                </h2>
                <div class="space-y-2.5">
                  ${RECENT_VIEWS.map((item) => {
                    const cfg = CATEGORY_CONFIG[item.type] || CATEGORY_CONFIG.project
                    return html`
                      <div key=${item.id}
                        class="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all duration-200"
                        style=${{ background: C.surface, border: `1px solid ${C.border}` }}
                        onMouseEnter=${(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateX(4px)' }}
                        onMouseLeave=${(e) => { e.currentTarget.style.background = C.surface; e.currentTarget.style.transform = 'translateX(0)' }}
                        onClick=${() => handleTagClick(item.title)}>
                        <span class="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-base"
                              style=${{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                          ${cfg.icon}
                        </span>
                        <span class="flex-1 text-sm font-medium" style=${{ color: C.text }}>${item.title}</span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style=${{ background: `${cfg.color}15`, color: cfg.color }}>${cfg.label}</span>
                      </div>
                    `
                  })}
                </div>
              </div>
            </div>
          ` : totalResults === 0 ? html`
            <!-- ── 无结果状态 ── -->
            <div class="retro-section-dark rounded-2xl flex flex-col items-center justify-center py-20 text-center"
                 style=${{ border: `1px solid ${C.border}` }}>
              <div class="text-6xl mb-4 opacity-50">🤷</div>
              <h3 class="text-lg font-bold mb-2" style=${{ color: C.text }}>
                没搜到"${debouncedQuery}"相关的结果
              </h3>
              <p class="text-sm mb-1" style=${{ color: C.textMuted }}>
                换个关键词试试，或者换个搜索范围。
              </p>
              <p class="text-xs mb-6" style=${{ color: C.textDim }}>
                搜不到可以来社区问问，说不定有大佬知道。
              </p>
              <div class="flex gap-3">
                <button class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                        style=${{ background: C.accent, color: '#1a0f3d' }}
                        onMouseEnter=${(e) => { e.target.style.boxShadow = `0 4px 20px ${C.accent}30` }}
                        onMouseLeave=${(e) => { e.target.style.boxShadow = 'none' }}
                        onClick=${() => go(STEPS.COMMUNITY)}>
                  去社区问问 →
                </button>
                <button class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                        style=${{ background: C.surface, color: C.textMuted, border: `1px solid ${C.border}` }}
                        onMouseEnter=${(e) => { e.target.style.borderColor = C.primary; e.target.style.color = C.text }}
                        onMouseLeave=${(e) => { e.target.style.borderColor = C.border; e.target.style.color = C.textMuted }}
                        onClick=${() => go(STEPS.FEEDBACK)}>
                  提反馈
                </button>
              </div>
            </div>
          ` : html`
            <!-- ── 搜索结果 ── -->
            <div>
              <!-- 结果计数 -->
              <div class="flex items-center justify-between mb-4">
                <p class="text-sm" style=${{ color: C.textMuted }}>
                  找到 <span style=${{ color: C.accent, fontWeight: 700 }}>${totalResults}</span> 条与
                  <span style=${{ color: C.text, fontWeight: 600 }}>"${debouncedQuery}"</span> 相关的结果
                </p>
                <span class="text-xs" style=${{ color: C.textDim }}>按相关度排序</span>
              </div>

              <!-- 分组结果 -->
              <div class="space-y-6">
                ${groupedResults.map((group) => {
                  const cfg = CATEGORY_CONFIG[group.category] || CATEGORY_CONFIG.project
                  return html`
                    <div key=${group.category}>
                      <!-- 分类标题 -->
                      <div class="flex items-center gap-2 mb-3 px-1">
                        <span class="text-base">${cfg.icon}</span>
                        <h3 class="text-sm font-bold" style=${{ color: cfg.color }}>${cfg.label}</h3>
                        <span class="text-xs" style=${{ color: C.textDim }}>${group.items.length} 条</span>
                        <div class="flex-1 h-px" style=${{ background: C.border }}></div>
                      </div>
                      <!-- 结果列表 -->
                      <div class="space-y-2.5">
                        ${group.items.map((item) => html`
                          <div key=${item.id}
                            class="group flex items-start gap-3 sm:gap-4 rounded-2xl p-4 cursor-pointer transition-all duration-300"
                            style=${{ background: C.surface, border: `1px solid ${C.border}` }}
                            onMouseEnter=${(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = `${cfg.color}40` }}
                            onMouseLeave=${(e) => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = C.border }}
                            onClick=${() => handleResultClick(item)}>
                            <!-- 类型图标 -->
                            <div class="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                                 style=${{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                              ${cfg.icon}
                            </div>
                            <!-- 内容 -->
                            <div class="flex-1 min-w-0">
                              <h4 class="text-sm sm:text-base font-bold mb-1" style=${{ color: C.text }}>${item.title}</h4>
                              <p class="text-xs sm:text-sm leading-relaxed mb-2 line-clamp-2" style=${{ color: C.textMuted }}>${item.excerpt}</p>
                              <div class="flex items-center gap-2 flex-wrap text-[10px]">
                                <span style=${{ color: C.textDim }}>${item.meta.author}</span>
                                <span class="w-1 h-1 rounded-full" style=${{ background: C.textDim }}></span>
                                <span style=${{ color: C.textDim }}>${item.meta.date}</span>
                                <span class="w-1 h-1 rounded-full" style=${{ background: C.textDim }}></span>
                                <span class="px-1.5 py-0.5 rounded-full font-medium"
                                      style=${{ background: `${cfg.color}10`, color: cfg.color }}>${item.meta.category}</span>
                              </div>
                            </div>
                            <!-- 箭头 -->
                            <span class="shrink-0 self-center text-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                  style=${{ color: cfg.color }}>→</span>
                          </div>
                        `)}
                      </div>
                    </div>
                  `
                })}
              </div>
            </div>
          `}
        </section>

      <//>
      <${Footer} />
    </div>
  `
}
