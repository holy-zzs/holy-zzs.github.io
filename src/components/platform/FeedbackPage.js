// 反馈 / 工单系统 — 双栏布局：左侧反馈表单 + 右侧快速自查/已知问题/路线图
import { html, useContext, useState, useCallback } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'
import { NavBar, Footer, PageContainer } from './PlatformCommon.js?v=nav3'

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

// ── 反馈类型 ──
const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug 报告', icon: '🐛' },
  { value: 'feature', label: '功能建议', icon: '💡' },
  { value: 'usage', label: '使用问题', icon: '❓' },
  { value: 'other', label: '其他', icon: '📝' },
]

// ── 优先级 ──
const PRIORITIES = [
  { value: 'low', label: '低', color: '#4ade80' },
  { value: 'medium', label: '中', color: '#fbbf24' },
  { value: 'high', label: '高', color: '#f87171' },
]

// ── 快速自查问题 ──
const QUICK_CHECKS = [
  { q: '上传教材支持哪些格式？', hint: 'PDF、TXT、Markdown 都行' },
  { q: 'AI 团队怎么配置？', hint: '预设团队或自由搭配' },
  { q: '生成的方案可以导出吗？', hint: '支持 PDF 与 Markdown' },
  { q: '为什么 AI 讨论没有反应？', hint: '检查 API Key 或切模拟模式' },
]

// ── 已知问题 ──
const KNOWN_ISSUES = [
  { id: 1, title: '部分 PDF 解析大文件超时', status: '修复中', color: '#fbbf24' },
  { id: 2, title: 'Safari 下方案预览排版偏移', status: '已确认', color: '#f87171' },
  { id: 3, title: '社区搜索中文分词不准', status: '规划中', color: '#a78bfa' },
]

// ── 工单状态 ──
const TICKET_STATUS = {
  pending: { label: '待处理', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  inprogress: { label: '处理中', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  resolved: { label: '已解决', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
}

// ── 示例已提交工单 ──
const SAMPLE_TICKETS = [
  { id: 'TK-2401', type: '功能建议', title: '希望增加团队模板保存功能', priority: 'medium', status: 'inprogress', time: '2 天前' },
]

export default function FeedbackPage() {
  const { dispatch, toast } = useContext(AppContext)
  const [type, setType] = useState('bug')
  const [priority, setPriority] = useState('medium')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [contact, setContact] = useState('')
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(null)
  const [tickets, setTickets] = useState(SAMPLE_TICKETS)

  const go = useCallback((step) => {
    dispatch({ type: 'SET_STEP', payload: step })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  // 表单校验
  const validate = useCallback(() => {
    const errs = {}
    if (!title.trim()) errs.title = '请填写标题'
    else if (title.trim().length < 5) errs.title = '标题至少 5 个字'
    if (!description.trim()) errs.description = '请填写详细描述'
    else if (description.trim().length < 10) errs.description = '描述至少 10 个字，说清楚点我们才好修'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }, [title, description])

  // 提交工单
  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (!validate()) {
      toast('请补全必填项再提交', 'error')
      return
    }
    const ticketId = `TK-${Math.floor(2400 + Math.random() * 600)}`
    const newTicket = {
      id: ticketId,
      type: FEEDBACK_TYPES.find((t) => t.value === type)?.label || '其他',
      title: title.trim(),
      priority,
      status: 'pending',
      time: '刚刚',
    }
    setTickets((prev) => [newTicket, ...prev])
    setSubmitted({
      id: ticketId,
      type: newTicket.type,
      priority,
      title: title.trim(),
    })
    // 清空表单
    setTitle('')
    setDescription('')
    setContact('')
    setErrors({})
    toast('工单已提交，感谢反馈！', 'success')
  }, [validate, type, priority, title, toast])

  // 重置表单再次提交
  const handleReset = useCallback(() => {
    setSubmitted(null)
  }, [])

  // 输入框通用样式
  const inputBase = {
    background: C.surface,
    border: `1px solid ${C.border}`,
    color: C.text,
    outline: 'none',
  }
  const inputFocus = (e) => { e.target.style.borderColor = C.primary }
  const inputBlur = (e) => { e.target.style.borderColor = C.border }

  return html`
    <div style=${{ background: C.bg, minHeight: '100vh' }}>
      <${NavBar} />
      <${PageContainer}>

        <!-- ═══ 顶部标题区 ═══ -->
        <section class="retro-section-dark relative overflow-hidden rounded-3xl px-6 py-10 sm:px-10 sm:py-12"
                 style=${{ border: `1px solid ${C.border}` }}>
          <div style=${{
            position: 'absolute', top: '-30%', left: '-5%',
            width: '360px', height: '360px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)',
            filter: 'blur(40px)', pointerEvents: 'none',
          }}></div>
          <div class="relative">
            <div class="retro-eyebrow mb-2">// FEEDBACK & SUPPORT</div>
            <h1 class="text-3xl sm:text-4xl font-black mb-2" style=${{ color: C.text }}>
              反馈与工单
            </h1>
            <p class="text-sm sm:text-base" style=${{ color: C.textMuted }}>
              碰到 bug、有想法、不会用？尽管说，我们看得见。每个反馈都会生成工单，可追踪处理进度。
            </p>
          </div>
        </section>

        <!-- ═══ 双栏布局 ═══ -->
        <div class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">

          <!-- ── 左栏：反馈表单 ── -->
          <div class="lg:col-span-2">
            ${submitted ? html`
              <!-- 提交成功状态 -->
              <div class="retro-section-dark rounded-2xl px-6 py-12 text-center"
                   style=${{ border: `1px solid ${C.border}` }}>
                <div class="text-5xl mb-4">✅</div>
                <h3 class="text-xl font-bold mb-2" style=${{ color: C.text }}>工单提交成功</h3>
                <p class="text-sm mb-4" style=${{ color: C.textMuted }}>
                  感谢你的反馈，我们会尽快处理并通过邮件回复你。
                </p>
                <div class="inline-flex items-center gap-3 px-5 py-3 rounded-xl mb-6"
                     style=${{ background: C.surface, border: `1px solid ${C.border}` }}>
                  <span class="text-xs" style=${{ color: C.textDim }}>工单编号</span>
                  <span class="text-lg font-black" style=${{ color: C.accent }}>${submitted.id}</span>
                </div>
                <div class="text-left max-w-md mx-auto rounded-xl p-4 mb-6"
                     style=${{ background: C.surface, border: `1px solid ${C.border}` }}>
                  <div class="flex items-center gap-2 mb-2 text-xs">
                    <span class="px-2 py-0.5 rounded-full" style=${{ background: 'rgba(167,139,250,0.1)', color: C.primary }}>${submitted.type}</span>
                    <span class="px-2 py-0.5 rounded-full" style=${{ background: `${PRIORITIES.find((p) => p.value === submitted.priority)?.color}15`, color: PRIORITIES.find((p) => p.value === submitted.priority)?.color }}>
                      ${PRIORITIES.find((p) => p.value === submitted.priority)?.label}优先级
                    </span>
                  </div>
                  <div class="text-sm font-bold" style=${{ color: C.text }}>${submitted.title}</div>
                </div>
                <button class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                        style=${{ background: C.accent, color: '#1a0f3d' }}
                        onMouseEnter=${(e) => { e.target.style.boxShadow = `0 4px 20px ${C.accent}30` }}
                        onMouseLeave=${(e) => { e.target.style.boxShadow = 'none' }}
                        onClick=${handleReset}>
                  再提一个工单
                </button>
              </div>
            ` : html`
              <!-- 反馈表单 -->
              <form class="retro-section-dark rounded-2xl px-5 py-5 sm:px-6 sm:py-6 space-y-5"
                    style=${{ border: `1px solid ${C.border}` }}
                    onSubmit=${handleSubmit}>

                <!-- 反馈类型 -->
                <div>
                  <label class="block text-xs font-bold mb-2 uppercase tracking-wider" style=${{ color: C.textMuted }}>
                    反馈类型 <span style=${{ color: C.accent }}>*</span>
                  </label>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    ${FEEDBACK_TYPES.map((t) => {
                      const active = type === t.value
                      return html`
                        <button key=${t.value} type="button"
                          class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                          style=${active
                            ? { background: 'rgba(167,139,250,0.12)', color: C.text, border: `1px solid ${C.primary}` }
                            : { background: C.surface, color: C.textMuted, border: `1px solid ${C.border}` }}
                          onMouseEnter=${(e) => { if (!active) { e.target.style.borderColor = C.primary; e.target.style.color = C.text } }}
                          onMouseLeave=${(e) => { if (!active) { e.target.style.borderColor = C.border; e.target.style.color = C.textMuted } }}
                          onClick=${() => setType(t.value)}>
                          <span>${t.icon}</span>
                          <span class="text-xs sm:text-sm">${t.label}</span>
                        </button>
                      `
                    })}
                  </div>
                </div>

                <!-- 优先级 -->
                <div>
                  <label class="block text-xs font-bold mb-2 uppercase tracking-wider" style=${{ color: C.textMuted }}>
                    优先级 <span style=${{ color: C.accent }}>*</span>
                  </label>
                  <div class="flex gap-2">
                    ${PRIORITIES.map((p) => {
                      const active = priority === p.value
                      return html`
                        <button key=${p.value} type="button"
                          class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                          style=${active
                            ? { background: `${p.color}20`, color: p.color, border: `1px solid ${p.color}` }
                            : { background: C.surface, color: C.textMuted, border: `1px solid ${C.border}` }}
                          onMouseEnter=${(e) => { if (!active) e.target.style.borderColor = p.color }}
                          onMouseLeave=${(e) => { if (!active) e.target.style.borderColor = C.border }}
                          onClick=${() => setPriority(p.value)}>
                          <span class="w-2 h-2 rounded-full" style=${{ background: p.color }}></span>
                          ${p.label}
                        </button>
                      `
                    })}
                  </div>
                </div>

                <!-- 标题 -->
                <div>
                  <label class="block text-xs font-bold mb-2 uppercase tracking-wider" style=${{ color: C.textMuted }}>
                    标题 <span style=${{ color: C.accent }}>*</span>
                  </label>
                  <input type="text" value=${title}
                    onChange=${(e) => { setTitle(e.target.value); if (errors.title) setErrors((p) => ({ ...p, title: null })) }}
                    onFocus=${inputFocus} onBlur=${inputBlur}
                    placeholder="一句话说清楚问题，比如：上传 PDF 时进度条卡住"
                    class="w-full px-4 py-3 rounded-xl text-sm transition-colors"
                    style=${{ ...inputBase, borderColor: errors.title ? '#f87171' : C.border }} />
                  ${errors.title ? html`<p class="mt-1.5 text-xs" style=${{ color: '#f87171' }}>⚠ ${errors.title}</p>` : null}
                </div>

                <!-- 详细描述 -->
                <div>
                  <label class="block text-xs font-bold mb-2 uppercase tracking-wider" style=${{ color: C.textMuted }}>
                    详细描述 <span style=${{ color: C.accent }}>*</span>
                  </label>
                  <textarea value=${description} rows=${5}
                    onChange=${(e) => { setDescription(e.target.value); if (errors.description) setErrors((p) => ({ ...p, description: null })) }}
                    onFocus=${inputFocus} onBlur=${inputBlur}
                    placeholder="发生了什么？复现步骤是什么？你期望的结果是什么？描述越详细我们修得越快。"
                    class="w-full px-4 py-3 rounded-xl text-sm resize-none transition-colors"
                    style=${{ ...inputBase, borderColor: errors.description ? '#f87171' : C.border }}></textarea>
                  <div class="flex items-center justify-between mt-1.5">
                    ${errors.description ? html`<p class="text-xs" style=${{ color: '#f87171' }}>⚠ ${errors.description}</p>` : html`<span></span>`}
                    <span class="text-[10px]" style=${{ color: C.textDim }}>${description.length} 字</span>
                  </div>
                </div>

                <!-- 附件 -->
                <div>
                  <label class="block text-xs font-bold mb-2 uppercase tracking-wider" style=${{ color: C.textMuted }}>
                    附件 <span class="font-normal normal-case" style=${{ color: C.textDim }}>（可选，截图或日志）</span>
                  </label>
                  <div class="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors"
                       style=${{ ...inputBase }}
                       onMouseEnter=${(e) => { e.currentTarget.style.borderColor = C.primary }}
                       onMouseLeave=${(e) => { e.currentTarget.style.borderColor = C.border }}
                       onClick=${() => toast('附件上传功能即将上线，请先在描述中贴截图链接', 'info')}>
                    <span class="text-lg">📎</span>
                    <span class="text-sm flex-1" style=${{ color: C.textDim }}>点击上传截图或日志文件（支持 PNG / JPG / TXT）</span>
                    <span class="text-xs px-2.5 py-1 rounded-lg" style=${{ background: 'rgba(167,139,250,0.1)', color: C.primary }}>选择文件</span>
                  </div>
                </div>

                <!-- 联系方式 -->
                <div>
                  <label class="block text-xs font-bold mb-2 uppercase tracking-wider" style=${{ color: C.textMuted }}>
                    联系方式 <span class="font-normal normal-case" style=${{ color: C.textDim }}>（可选，邮箱）</span>
                  </label>
                  <input type="email" value=${contact}
                    onChange=${(e) => setContact(e.target.value)}
                    onFocus=${inputFocus} onBlur=${inputBlur}
                    placeholder="留下邮箱，处理结果第一时间通知你"
                    class="w-full px-4 py-3 rounded-xl text-sm transition-colors"
                    style=${inputBase} />
                </div>

                <!-- 提交按钮 -->
                <div class="flex items-center justify-between pt-1">
                  <p class="text-xs" style=${{ color: C.textDim }}>带 <span style=${{ color: C.accent }}>*</span> 为必填项</p>
                  <button type="submit"
                    class="px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2"
                    style=${{ background: C.accent, color: '#1a0f3d' }}
                    onMouseEnter=${(e) => { e.target.style.boxShadow = `0 4px 20px ${C.accent}30`; e.target.style.transform = 'translateY(-1px)' }}
                    onMouseLeave=${(e) => { e.target.style.boxShadow = 'none'; e.target.style.transform = 'translateY(0)' }}>
                    提交工单 <span>→</span>
                  </button>
                </div>
              </form>
            `}

            <!-- ── 最近提交的工单 ── -->
            ${tickets.length > 0 ? html`
              <div class="mt-5 retro-section-dark rounded-2xl px-5 py-5 sm:px-6 sm:py-6"
                   style=${{ border: `1px solid ${C.border}` }}>
                <h3 class="text-base font-bold flex items-center gap-2 mb-4" style=${{ color: C.text }}>
                  <span>🗂️</span> 我的工单
                  <span class="text-xs font-normal" style=${{ color: C.textDim }}>${tickets.length} 个</span>
                </h3>
                <div class="space-y-2.5">
                  ${tickets.map((t) => {
                    const st = TICKET_STATUS[t.status] || TICKET_STATUS.pending
                    const prio = PRIORITIES.find((p) => p.value === t.priority) || PRIORITIES[1]
                    return html`
                      <div key=${t.id}
                        class="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200"
                        style=${{ background: C.surface, border: `1px solid ${C.border}` }}
                        onMouseEnter=${(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                        onMouseLeave=${(e) => { e.currentTarget.style.background = C.surface }}>
                        <span class="shrink-0 text-xs font-black px-2 py-1 rounded-lg"
                              style=${{ background: 'rgba(245,166,35,0.1)', color: C.accent }}>${t.id}</span>
                        <div class="flex-1 min-w-0">
                          <div class="text-sm font-medium truncate" style=${{ color: C.text }}>${t.title}</div>
                          <div class="flex items-center gap-2 mt-0.5">
                            <span class="text-[10px]" style=${{ color: C.textDim }}>${t.type}</span>
                            <span class="w-1 h-1 rounded-full" style=${{ background: C.textDim }}></span>
                            <span class="text-[10px]" style=${{ color: C.textDim }}>${t.time}</span>
                          </div>
                        </div>
                        <span class="shrink-0 w-1.5 h-1.5 rounded-full" style=${{ background: prio.color }}></span>
                        <span class="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style=${{ background: st.bg, color: st.color }}>${st.label}</span>
                      </div>
                    `
                  })}
                </div>
              </div>
            ` : null}
          </div>

          <!-- ── 右栏：快速自查 / 已知问题 / 路线图 ── -->
          <div class="space-y-5">

            <!-- 快速自查 -->
            <div class="retro-section-dark rounded-2xl px-5 py-5"
                 style=${{ border: `1px solid ${C.border}` }}>
              <h3 class="text-base font-bold flex items-center gap-2 mb-4" style=${{ color: C.text }}>
                <span>🔍</span> 快速自查
              </h3>
              <p class="text-xs mb-4" style=${{ color: C.textMuted }}>提交前先看看，说不定已经有答案了</p>
              <div class="space-y-2">
                ${QUICK_CHECKS.map((qc, i) => html`
                  <button key=${i}
                    class="w-full text-left flex items-start gap-2.5 rounded-xl px-3.5 py-3 transition-all duration-200"
                    style=${{ background: C.surface, border: `1px solid ${C.border}` }}
                    onMouseEnter=${(e) => { e.currentTarget.style.background = 'rgba(167,139,250,0.08)'; e.currentTarget.style.borderColor = C.primary }}
                    onMouseLeave=${(e) => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = C.border }}
                    onClick=${() => go(STEPS.HELP)}>
                    <span class="shrink-0 text-sm" style=${{ color: C.accent }}>›</span>
                    <span class="flex-1">
                      <span class="block text-sm font-medium" style=${{ color: C.text }}>${qc.q}</span>
                      <span class="block text-[10px] mt-0.5" style=${{ color: C.textDim }}>${qc.hint}</span>
                    </span>
                  </button>
                `)}
              </div>
              <button class="w-full mt-3 text-xs font-bold py-2 rounded-lg transition-colors"
                      style=${{ color: C.primary, background: 'rgba(167,139,250,0.06)' }}
                      onMouseEnter=${(e) => { e.target.style.background = 'rgba(167,139,250,0.12)' }}
                      onMouseLeave=${(e) => { e.target.style.background = 'rgba(167,139,250,0.06)' }}
                      onClick=${() => go(STEPS.HELP)}>
                查看全部帮助文章 →
              </button>
            </div>

            <!-- 已知问题 -->
            <div class="retro-section-dark rounded-2xl px-5 py-5"
                 style=${{ border: `1px solid ${C.border}` }}>
              <h3 class="text-base font-bold flex items-center gap-2 mb-4" style=${{ color: C.text }}>
                <span>📌</span> 已知问题
              </h3>
              <div class="space-y-2.5">
                ${KNOWN_ISSUES.map((issue) => html`
                  <div key=${issue.id}
                       class="rounded-xl px-3.5 py-3"
                       style=${{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div class="flex items-start justify-between gap-2">
                      <span class="text-sm flex-1" style=${{ color: C.textMuted }}>${issue.title}</span>
                      <span class="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style=${{ background: `${issue.color}15`, color: issue.color }}>
                        ${issue.status}
                      </span>
                    </div>
                  </div>
                `)}
              </div>
            </div>

            <!-- 功能路线图 -->
            <div class="retro-section-dark rounded-2xl px-5 py-5"
                 style=${{ border: `1px solid ${C.border}` }}>
              <div class="flex items-start gap-3">
                <div class="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                     style=${{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.25)' }}>
                  🗺️
                </div>
                <div class="flex-1">
                  <h3 class="text-sm font-bold mb-1" style=${{ color: C.text }}>功能路线图</h3>
                  <p class="text-xs mb-3" style=${{ color: C.textMuted }}>
                    想知道我们接下来做什么？来看看路线图和更新日志。
                  </p>
                  <button class="w-full text-xs font-bold py-2.5 rounded-lg transition-all duration-200"
                          style=${{ background: C.accent, color: '#1a0f3d' }}
                          onMouseEnter=${(e) => { e.target.style.boxShadow = `0 4px 16px ${C.accent}30` }}
                          onMouseLeave=${(e) => { e.target.style.boxShadow = 'none' }}
                          onClick=${() => go(STEPS.CHANGELOG)}>
                    查看更新日志 →
                  </button>
                </div>
              </div>
            </div>

            <!-- 其他联系方式 -->
            <div class="rounded-2xl px-5 py-5 text-center"
                 style=${{ border: `1px solid ${C.border}` }}>
              <p class="text-xs mb-2" style=${{ color: C.textMuted }}>还有其他渠道找到我们</p>
              <div class="flex justify-center gap-2 flex-wrap">
                <span class="text-[10px] px-2.5 py-1 rounded-lg" style=${{ background: C.surface, color: C.textDim }}>📧 help@knb.ai</span>
                <span class="text-[10px] px-2.5 py-1 rounded-lg" style=${{ background: C.surface, color: C.textDim }}>💬 用户交流群</span>
              </div>
            </div>

          </div>
        </div>

      <//>
      <${Footer} />
    </div>
  `
}
