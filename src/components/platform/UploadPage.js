// 页面6：上传教材页 — 把教材交给你的AI团队
// 4种输入模式（PDF / 粘贴 / 网址 / 示例）+ 解析预览面板 + 团队预览条 + 5步进度
import { html, useState, useRef, useCallback, useMemo, useEffect } from '../../deps.js'
import { useApp, STEPS } from '../../store/appContext.js'
import { NavBar, Footer, PageContainer, StepProgress } from './PlatformCommon.js?v=nav3'
import { parseFile, parseText } from '../../lib/parser.js?v=pdfv4'
import { analyzeWithLLM, extractPdfText, fetchUsage } from '../../lib/aiParser.js?v=aip11'
import { collectMineruDownloads } from '../../lib/mineruResult.js?v=mr1'
import { AGENTS, AGENT_CATEGORIES } from '../../data/agents.js'

// ── 减弱动效 & 解析动画 keyframes（内联注入，避免污染全局） ──
const PARSE_CSS = `
@keyframes upload-spin { to { transform: rotate(360deg); } }
@keyframes upload-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes upload-pulse { 0%,100% { opacity: 0.45; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
@media (prefers-reduced-motion: reduce) {
  .upload-spin, .upload-float, .upload-pulse { animation: none !important; }
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
`

// ── 5步流程标签 ──
const STEP_LABELS = ['选学科', '传教材', '选玩法', 'AI工作室']

// ── 输入模式 Tab ──
const TABS = [
  { id: 'pdf', label: '上传文件', emoji: '📁' },
  { id: 'paste', label: '粘贴文本', emoji: '✍️' },
  { id: 'url', label: '网址导入', emoji: '🌐' },
  { id: 'demo', label: '示例教材', emoji: '⚡' },
]

// ── 解析进度提示步骤 ──
const PARSE_STEPS = [
  '正在提取教材文本...',
  '正在识别章节结构...',
  '正在提取核心概念...',
  '正在标注公式...',
  '正在建立知识图谱...',
]

// ── 学段 id → 中文名（用于示例教材筛选） ──
const GRADE_NAME = { primary: '小学', junior: '初中', senior: '高中', college: '大学' }

// ── 预设团队 id 别名（兼容 PRESET_TEAMS 的简写 id） ──
const AGENT_ALIAS = {
  narrator: 'narrative', balance: 'numbers',
  p01: 'scholar', p02: 'captain', p03: 'designer', p04: 'numbers', p05: 'narrative',
  m01: 'scholar', m02: 'captain', m03: 'designer', m04: 'numbers', m05: 'narrative',
  h01: 'scholar', h02: 'captain', h03: 'designer', h04: 'numbers', h05: 'narrative',
  u01: 'scholar', u02: 'captain', u03: 'designer', u04: 'numbers', u05: 'narrative',
  u06: 'art', u07: 'level', u08: 'qa', u09: 'spark', u10: 'tech', u11: 'experience',
}
const resolveAgent = (id) => AGENTS.find(a => a.id === id) || AGENTS.find(a => a.id === AGENT_ALIAS[id])

// ── 示例教材目录 ──
const DEMO_MATERIALS = [
  { id: 'demo_physics', emoji: '⚛️', title: '光学基础（简版）', grade: '大学', subject: '物理学', chapters: 5, formulas: 5, desc: '含5个核心公式，适合物理学入门' },
  { id: 'demo_mechanics', emoji: '🍎', title: '力学专题', grade: '高中', subject: '物理', chapters: 4, formulas: 8, desc: '含牛顿三定律推导，经典力学精华' },
  { id: 'demo_fraction', emoji: '🍰', title: '分数入门', grade: '小学', subject: '数学', chapters: 3, formulas: 0, desc: '含图形化讲解，适合小学数学启蒙' },
  { id: 'demo_chemistry', emoji: '🧪', title: '有机化学基础', grade: '初中', subject: '化学', chapters: 6, formulas: 3, desc: '含常见有机物结构和反应方程式' },
]

// ── 真实 PDF 教材（从服务器下载并解析） ──
const PDF_TEXTBOOKS = [
  { id: 'pdf_physics', emoji: '📘', title: '物理学基础教程', grade: '高中', subject: '物理', pdf: '/assets/textbooks/物理学基础教程.pdf', desc: '力学·热学·电磁学·光学·原子物理，含15+公式' },
  { id: 'pdf_chemistry', emoji: '🧪', title: '化学基础教程', grade: '初中', subject: '化学', pdf: '/assets/textbooks/化学基础教程.pdf', desc: '物质构成·化学反应·酸碱盐，含6个核心公式' },
  { id: 'pdf_math', emoji: '📐', title: '数学函数与导数', grade: '高中', subject: '数学', pdf: '/assets/textbooks/数学函数与导数.pdf', desc: '函数·导数·积分，含10+公式与求导法则' },
  { id: 'pdf_fraction', emoji: '🍰', title: '小学分数与小数', grade: '小学', subject: '数学', pdf: '/assets/textbooks/小学分数与小数.pdf', desc: '分数认识·小数·分数乘除法，3章节完整' },
]

// ── 示例教材真实文本（供 parseText 解析） ──
const DEMO_TEXTS = {
  demo_physics: `# 光学基础\n\n## 一、光的反射\n光在两种介质分界面上发生反射，反射角等于入射角。\n\n## 二、光的折射\n光从一种介质进入另一种介质时传播方向发生改变。折射定律：n₁sinθ₁ = n₂sinθ₂\n\n## 三、全反射\n当光从光密介质射向光疏介质，入射角大于临界角时发生全反射。sinC = 1/n\n\n## 四、光的干涉\n两束相干光叠加产生明暗相间的条纹。杨氏双缝干涉：条纹间距 Δy = λD/d\n\n## 五、光的衍射\n光绕过障碍物传播的现象。单缝衍射：asinθ = kλ`,
  demo_mechanics: `# 力学专题\n\n## 一、牛顿第一定律\n一切物体在没有受到外力作用时，总保持静止状态或匀速直线运动状态。\n\n## 二、牛顿第二定律\n物体的加速度与所受合外力成正比，与质量成反比。F = ma\n\n## 三、牛顿第三定律\n两个物体之间的作用力和反作用力总是大小相等、方向相反。F = -F'\n\n## 四、动量守恒\n系统不受外力或合外力为零时，系统总动量保持不变。m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'`,
  demo_fraction: `# 分数入门\n\n## 一、认识分数\n把一个整体平均分成若干份，表示其中一份或几份的数叫做分数。\n\n## 二、分数的比较\n同分母分数，分子大的分数大。同分子分数，分母小的分数大。\n\n## 三、分数的加减法\n同分母分数相加减，分母不变，分子相加减。异分母分数先通分再计算。`,
  demo_chemistry: `# 有机化学基础\n\n## 一、烷烃\n通式 CnH2n+2，单键饱和链烃。甲烷 CH4 是最简单的烷烃。\n\n## 二、烯烃\n通式 CnH2n，含碳碳双键。乙烯 C2H4 是最简单的烯烃。\n\n## 三、炔烃\n通式 CnH2n-2，含碳碳三键。乙炔 C2H2 是最简单的炔烃。\n\n## 四、苯\n分子式 C6H6，环状结构，具有特殊的稳定性。\n\n## 五、醇\n羟基 -OH 与烃基相连。乙醇 C2H5OH 是常见的醇。\n\n## 六、羧酸\n羧基 -COOH。乙酸 CH3COOH 是常见的羧酸。`,
}

// ── 工具：文件大小格式化 ──
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

// ════════════════════════════════════════════════════════════
//  重要性星级
// ════════════════════════════════════════════════════════════
function Stars({ n }) {
  const full = Math.max(0, Math.min(5, Math.round(n || 0)))
  return html`
    <span class="text-[10px] leading-none shrink-0">
      <span style=${{ color: 'var(--theme-accent)' }}>${'★'.repeat(full)}</span><span style=${{ color: 'var(--theme-border)' }}>${'★'.repeat(5 - full)}</span>
    </span>
  `
}

// ════════════════════════════════════════════════════════════
//  质量评分条
// ════════════════════════════════════════════════════════════
function QualityBar({ label, value }) {
  return html`
    <div class="flex items-center gap-2">
      <span class="text-xs w-20 shrink-0" style=${{ color: 'var(--theme-text-muted)' }}>${label}</span>
      <div class="flex-1 h-2 rounded-full overflow-hidden" style=${{ background: 'var(--theme-surface-alt)' }}>
        <div class="h-full rounded-full transition-all duration-500" style=${{ width: value + '%', background: 'var(--theme-primary)' }}></div>
      </div>
      <span class="text-xs font-mono w-9 text-right" style=${{ color: 'var(--theme-text)' }}>${value}分</span>
    </div>
  `
}

// ════════════════════════════════════════════════════════════
//  章节结构树（可展开/折叠）
// ════════════════════════════════════════════════════════════
function ChapterTree({ structure }) {
  const [expanded, setExpanded] = useState(() => {
    const s = new Set()
    if (structure && structure[0]) s.add(structure[0].id)
    return s
  })
  const toggle = useCallback((id) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  if (!structure || structure.length === 0) return null

  return html`
    <div class="space-y-0.5 max-h-60 overflow-y-auto pr-1">
      ${structure.map((s) => {
        const isOpen = expanded.has(s.id)
        const hasContent = s.content && s.content.length > 0
        return html`
          <div key=${s.id}>
            <div class="flex items-center gap-1.5 py-1 px-1.5 rounded-md cursor-pointer transition-opacity hover:opacity-80"
                 style=${{ paddingLeft: `${(s.level - 1) * 14 + 6}px` }}
                 onClick=${() => hasContent && toggle(s.id)}>
              <span class="text-[10px] w-3 shrink-0" style=${{ color: 'var(--theme-text-muted)' }}>${hasContent ? (isOpen ? '▾' : '▸') : '·'}</span>
              <span class="text-[10px] font-mono shrink-0" style=${{ color: 'var(--theme-text-muted)' }}>L${s.level}</span>
              <span class="text-xs font-medium truncate" style=${{ color: 'var(--theme-text)' }}>${s.title}</span>
            </div>
            ${isOpen && hasContent ? html`
              <div class="py-1 px-2 mb-1 text-[11px] leading-relaxed rounded-md"
                   style=${{ marginLeft: `${(s.level - 1) * 14 + 24}px`, background: 'var(--theme-surface-alt)', color: 'var(--theme-text-muted)' }}>
                ${s.content.slice(0, 120)}${s.content.length > 120 ? '...' : ''}
              </div>
            ` : null}
          </div>
        `
      })}
    </div>
  `
}

// ════════════════════════════════════════════════════════════
//  免费额度徽章
// ════════════════════════════════════════════════════════════
function QuotaBadge({ usage, loading }) {
  // loading 状态
  if (loading) {
    return html`
      <div class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
           style=${{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-muted)' }}>
        <span class="inline-block w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
              style=${{ borderColor: 'var(--theme-primary)', borderTopColor: 'transparent' }}></span>
        <span>正在检查解析引擎...</span>
      </div>
    `
  }

  // 未获取到使用量数据
  if (!usage) {
    return html`
      <div class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
           style=${{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-muted)' }}>
        <span class="text-base">📄</span>
        <span>本地解析模式（免费无限制）</span>
      </div>
    `
  }

  // Adobe 已配置
  if (usage.adobe_enabled) {
    const remaining = usage.adobe_remaining || 0
    const total = usage.adobe_total || 500
    const used = usage.adobe_used || 0
    const percent = Math.round((remaining / total) * 100)
    const isLow = remaining < 50
    const isCritical = remaining < 10

    // 颜色：充足绿、低黄、危险红
    const color = isCritical ? '#ef4444' : isLow ? '#f5a623' : '#22c55e'
    const bgColor = isCritical ? 'rgba(239,68,68,0.08)' : isLow ? 'rgba(245,166,35,0.08)' : 'rgba(34,197,94,0.08)'
    const borderColor = isCritical ? 'rgba(239,68,68,0.25)' : isLow ? 'rgba(245,166,35,0.25)' : 'rgba(34,197,94,0.2)'

    return html`
      <div class="rounded-xl px-3 py-2.5" style=${{ background: bgColor, border: `1px solid ${borderColor}` }}>
        <div class="flex items-center justify-between gap-3 mb-1.5">
          <div class="flex items-center gap-1.5">
            <span class="text-sm">🔮</span>
            <span class="text-xs font-bold" style=${{ color: 'var(--theme-text)' }}>Adobe PDF API</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded-full font-mono"
                  style=${{ background: color + '22', color: color }}>
              ${isCritical ? '额度不足' : isLow ? '即将用完' : '正常'}
            </span>
          </div>
          <span class="text-xs font-mono font-bold" style=${{ color }}>
            ${remaining} / ${total}
          </span>
        </div>
        <!-- 进度条 -->
        <div class="h-1.5 rounded-full overflow-hidden" style=${{ background: 'rgba(0,0,0,0.15)' }}>
          <div class="h-full rounded-full transition-all duration-500"
               style=${{ width: percent + '%', background: color }}></div>
        </div>
        <div class="flex items-center justify-between mt-1">
          <span class="text-[10px]" style=${{ color: 'var(--theme-text-muted)' }}>
            已用 ${used} 次 · 每月 ${total} 次免费
          </span>
          <span class="text-[10px]" style=${{ color: 'var(--theme-text-muted)' }}>
            ${usage.trial_end ? `试用至 ${usage.trial_end}` : ''}
          </span>
        </div>
      </div>
    `
  }

  // Adobe 未配置 → 显示本地模式
  return html`
    <div class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
         style=${{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-muted)' }}>
      <span class="text-base">📄</span>
      <div class="flex flex-col">
        <span style=${{ color: 'var(--theme-text)' }}>本地解析模式</span>
        <span class="text-[10px]">免费无限制 · 文字版PDF可用 · 扫描版需配置 Adobe API</span>
      </div>
    </div>
  `
}

// ════════════════════════════════════════════════════════════
//  团队预览条
// ════════════════════════════════════════════════════════════
function TeamPreviewBar({ teamAgents, onEdit }) {
  return html`
    <div class="flex items-center gap-3 px-4 py-3 rounded-xl flex-wrap"
         style=${{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
      <span class="text-xs font-semibold shrink-0" style=${{ color: 'var(--theme-text-muted)' }}>AI团队（自动分配）</span>
      ${teamAgents.length === 0 ? html`
        <span class="text-xs" style=${{ color: 'var(--theme-text-muted)' }}>正在分配默认团队…</span>
      ` : html`
        <div class="flex items-center gap-2 flex-wrap">
          ${teamAgents.map((a) => {
            const cat = AGENT_CATEGORIES[a.category]
            return html`
              <div key=${a.id} class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                   style=${{ background: 'var(--theme-primary-bg)' }}>
                <span class="text-base leading-none">${a.emoji}</span>
                <span class="text-xs font-medium" style=${{ color: 'var(--theme-primary)' }}>${a.name}</span>
                <span class="text-[10px]" style=${{ color: 'var(--theme-text-muted)' }}>${cat ? cat.shortName : ''}</span>
              </div>
            `
          })}
        </div>
      `}
      <button class="ml-auto text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80 shrink-0"
              style=${{ background: 'var(--theme-accent-bg)', color: 'var(--theme-accent)' }}
              onClick=${onEdit}>
        ✏️ 调整团队
      </button>
    </div>
  `
}

// ════════════════════════════════════════════════════════════
//  解析预览面板（空 / 解析中 / 解析完成）
// ════════════════════════════════════════════════════════════
function ParsePreview({ material, parsing, parseStep, parseProgress, onReset, dispatch, setInputMode }) {
  // ── 空状态 ──
  if (!material && !parsing) {
    return html`
      <div class="rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center min-h-[420px]"
           style=${{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
        <div class="text-6xl mb-3 upload-pulse" style=${{ animation: 'upload-pulse 2.2s ease-in-out infinite', display: 'inline-block' }}>📭</div>
        <h3 class="text-base font-semibold mb-1" style=${{ color: 'var(--theme-text)' }}>等待教材输入</h3>
        <p class="text-sm max-w-xs" style=${{ color: 'var(--theme-text-muted)' }}>上传教材后，这里将显示AI解析的预览结果</p>
      </div>
    `
  }

  // ── 解析中 ──
  if (parsing) {
    return html`
      <div class="rounded-2xl p-10 text-center h-full flex flex-col items-center justify-center min-h-[420px]"
           style=${{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
        <div class="text-6xl mb-4 upload-spin" style=${{ animation: 'upload-spin 1.2s linear infinite', display: 'inline-block' }}>⚙️</div>
        <h3 class="text-base font-semibold mb-2" style=${{ color: 'var(--theme-primary)' }}>AI团队正在解析教材</h3>
        <p class="text-sm mb-4 min-h-[20px]" style=${{ color: 'var(--theme-text-muted)' }}>${PARSE_STEPS[parseStep] || PARSE_STEPS[0]}</p>
        <div class="w-full max-w-xs h-2 rounded-full overflow-hidden" style=${{ background: 'var(--theme-surface-alt)' }}>
          <div class="h-full rounded-full transition-all duration-200" style=${{ width: parseProgress + '%', background: 'var(--theme-primary)' }}></div>
        </div>
        <span class="text-xs mt-2 font-mono" style=${{ color: 'var(--theme-text-muted)' }}>${Math.round(parseProgress)}%</span>
      </div>
    `
  }

  // ── 解析完成 ──
  const s = material.stats
  const estimatedLevels = Math.max(3, Math.round(s.concepts * 0.8 + s.sections * 1.5))
  const overview = [
    { label: '章节', value: s.sections, emoji: '📑' },
    { label: '概念', value: s.concepts, emoji: '💡' },
    { label: '公式', value: s.formulas, emoji: '🔢' },
    { label: '预估关卡', value: estimatedLevels, emoji: '🎮' },
  ]
  // 解析质量评分（启发式）
  const completeness = Math.min(100, Math.round(40 + s.chars / 30 + s.concepts * 2 + s.formulas))
  const accuracy = Math.min(100, Math.round(50 + s.concepts * 3 + (s.formulas > 0 ? 20 : 0)))
  const structure = Math.min(100, Math.round(45 + s.sections * 4 + (s.sections > 3 ? 15 : 0)))
  const overall = Math.round((completeness + accuracy + structure) / 3)

  return html`
    <div class="rounded-2xl p-4 sm:p-5 space-y-4" style=${{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
      <!-- 标题 -->
      <div class="flex items-center justify-between gap-2">
        <div class="min-w-0">
          <h3 class="text-base font-bold truncate" style=${{ color: 'var(--theme-text)' }}>📊 解析结果 ${material.analyzedBy === 'demo' ? '· 🎭 Demo' : material.analyzedBy === 'llm' ? '· 🤖 AI' : ''}</h3>
          <p class="text-xs truncate" style=${{ color: 'var(--theme-text-muted)' }}>${material.filename} · ${s.chars} 字</p>
        </div>
        <button class="text-xs px-2.5 py-1 rounded-md transition-opacity hover:opacity-80 shrink-0"
                style=${{ background: 'var(--theme-accent-bg)', color: 'var(--theme-accent)' }}
                onClick=${onReset}>重新上传</button>
      </div>

      <!-- MinerU 元数据 & 下载入口 -->
      ${(material.parseMeta && material.parseMeta.mineruUsed) || (material.sourceAssets && material.sourceAssets.downloads && Object.keys(material.sourceAssets.downloads).length > 0) ? html`
        <div class="flex flex-wrap items-center gap-2 p-2.5 rounded-lg" style=${{ background: 'var(--theme-accent-bg)', border: '1px solid var(--theme-border)' }}>
          <span class="text-xs font-bold px-2 py-0.5 rounded-full" style=${{ background: '#22c55e20', color: '#22c55e', border: '1px solid #22c55e40' }}>MinerU VLM</span>
          ${material.parseMeta ? html`
            ${material.parseMeta.pageCount ? html`<span class="text-xs" style=${{ color: 'var(--theme-text-muted)' }}>${material.parseMeta.pageCount} 页</span>` : null}
            ${material.parseMeta.hasTables ? html`<span class="text-xs" style=${{ color: 'var(--theme-text-muted)' }}>· 含表格</span>` : null}
            ${material.parseMeta.hasFormulas ? html`<span class="text-xs" style=${{ color: 'var(--theme-text-muted)' }}>· 含公式</span>` : null}
            ${material.parseMeta.ocrUsed ? html`<span class="text-xs" style=${{ color: 'var(--theme-text-muted)' }}>· OCR</span>` : null}
          ` : null}
          ${material.sourceAssets && material.sourceAssets.downloads ? collectMineruDownloads({ downloads: material.sourceAssets.downloads }).map((d) => html`
            <a href=${d.url} target="_blank" rel="noopener"
               class="text-xs px-2 py-0.5 rounded-md transition-opacity hover:opacity-80"
               style=${{ background: 'var(--theme-primary)', color: '#fff' }}>${d.label}</a>
          `) : null}
        </div>
      ` : null}

      <!-- 警告/提示面板 -->
      ${material.warnings && material.warnings.length > 0 ? html`
        <div class="space-y-2">
          ${material.warnings.map((w) => {
            const isScanned = w.type === 'scanned_pdf' || w.type === 'empty_text'
            const isDemo = w.type === 'demo_mode'
            const isFail = w.type === 'llm_failed'
            const icon = isScanned ? '🖼️' : isDemo ? '🎭' : isFail ? '⚠️' : 'ℹ️'
            const bg = isScanned ? 'rgba(245,166,35,0.1)' : isDemo ? 'rgba(59,130,246,0.1)' : isFail ? 'rgba(239,68,68,0.1)' : 'rgba(245,166,35,0.1)'
            const border = isScanned ? 'rgba(245,166,35,0.3)' : isDemo ? 'rgba(59,130,246,0.3)' : isFail ? 'rgba(239,68,68,0.3)' : 'rgba(245,166,35,0.3)'
            const titleColor = isScanned ? '#F5A623' : isDemo ? '#3b82f6' : isFail ? '#ef4444' : '#F5A623'
            return html`
              <div key=${w.type} class="p-3 rounded-xl" style=${{ background: bg, border: `1px solid ${border}` }}>
                <div class="flex items-start gap-2">
                  <span class="text-base shrink-0 leading-tight">${icon}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold" style=${{ color: titleColor }}>${w.title}</p>
                    <p class="text-[11px] mt-0.5 leading-relaxed" style=${{ color: 'var(--theme-text-muted)' }}>${w.detail}</p>
                  </div>
                </div>
                ${isDemo ? html`
                  <button class="mt-2 w-full py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                          style=${{ background: 'var(--theme-primary)', color: '#fff' }}
                          onClick=${() => { dispatch({ type: 'SET_SETTINGS_MODAL', payload: true }) }}>
                    ⚙️ 前往设置 API Key
                  </button>
                ` : null}
                ${isScanned ? html`
                  <div class="mt-2 flex gap-2">
                    <button class="flex-1 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                            style=${{ background: 'var(--theme-primary)', color: '#fff' }}
                            onClick=${() => { setInputMode('paste') }}>
                      📋 切换到粘贴文本
                    </button>
                    <button class="flex-1 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                            style=${{ background: 'var(--theme-surface-alt)', color: 'var(--theme-text)', border: '1px solid var(--theme-border)' }}
                            onClick=${() => { setInputMode('demo') }}>
                      ⚡ 用示例教材
                    </button>
                  </div>
                ` : null}
              </div>
            `
          })}
        </div>
      ` : null}

      <!-- 概览卡片 -->
      <div class="grid grid-cols-4 gap-2">
        ${overview.map((o) => html`
          <div key=${o.label} class="p-2.5 rounded-xl text-center" style=${{ background: 'var(--theme-primary-bg)' }}>
            <div class="text-lg leading-none">${o.emoji}</div>
            <div class="text-xl font-bold mt-1" style=${{ color: 'var(--theme-primary)' }}>${o.value}</div>
            <div class="text-[10px]" style=${{ color: 'var(--theme-text-muted)' }}>${o.label}</div>
          </div>
        `)}
      </div>

      <!-- 章节结构树 -->
      ${material.structure && material.structure.length > 0 ? html`
        <div>
          <h4 class="text-xs font-semibold mb-2" style=${{ color: 'var(--theme-text-muted)' }}>📑 章节结构（${s.sections}）</h4>
          <${ChapterTree} structure=${material.structure} />
        </div>
      ` : null}

      <!-- 核心概念 -->
      ${material.concepts && material.concepts.length > 0 ? html`
        <div>
          <h4 class="text-xs font-semibold mb-2" style=${{ color: 'var(--theme-text-muted)' }}>💡 核心概念（${s.concepts}）</h4>
          <div class="space-y-1 max-h-52 overflow-y-auto pr-1">
            ${material.concepts.slice(0, 15).map((c) => html`
              <div key=${c.id} class="flex items-center gap-2 py-1 px-1.5 rounded-md" style=${{ background: 'var(--theme-primary-bg)' }}>
                <${Stars} n=${c.importance} />
                <span class="text-xs font-medium truncate" style=${{ color: 'var(--theme-text)' }}>${c.name}</span>
                <span class="text-[10px] ml-auto truncate max-w-[40%]" style=${{ color: 'var(--theme-text-muted)' }}>${c.context}</span>
              </div>
            `)}
          </div>
        </div>
      ` : null}

      <!-- 公式列表 -->
      ${material.formulas && material.formulas.length > 0 ? html`
        <div>
          <h4 class="text-xs font-semibold mb-2" style=${{ color: 'var(--theme-text-muted)' }}>🔢 识别公式（${s.formulas}）</h4>
          <div class="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            ${material.formulas.map((f) => html`
              <div key=${f.id} class="p-2 rounded-md" style=${{ background: 'var(--theme-accent-bg)', border: '1px solid var(--theme-border)' }}>
                <code class="text-xs font-mono break-all" style=${{ color: 'var(--theme-accent)' }}>${f.latex}</code>
              </div>
            `)}
          </div>
        </div>
      ` : null}

      <!-- 解析质量评分 -->
      <div>
        <h4 class="text-xs font-semibold mb-2" style=${{ color: 'var(--theme-text-muted)' }}>📈 解析质量评分 · 综合 ${overall} 分</h4>
        <div class="space-y-1.5">
          <${QualityBar} label="完整度" value=${completeness} />
          <${QualityBar} label="准确度" value=${accuracy} />
          <${QualityBar} label="结构化程度" value=${structure} />
        </div>
      </div>
    </div>
  `
}

// ════════════════════════════════════════════════════════════
//  主组件：UploadPage
// ════════════════════════════════════════════════════════════
export default function UploadPage() {
  const { state, dispatch, toast, navigate } = useApp()
  const [inputMode, setInputMode] = useState('pdf')   // pdf | paste | url | demo
  const [dragOver, setDragOver] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [urlList, setUrlList] = useState([])
  const [uploadedFile, setUploadedFile] = useState(null) // { name, size, progress }
  const [parsing, setParsing] = useState(false)
  const [parseStep, setParseStep] = useState(0)
  const [parseProgress, setParseProgress] = useState(0)
  const [recommending, setRecommending] = useState(false)
  const [creativeInput, setCreativeInput] = useState(state.userCreativeInput || '')
  const [usage, setUsage] = useState(null)
  const [usageLoading, setUsageLoading] = useState(true)
  const fileInput = useRef(null)

  const material = state.material
  const selectedAgents = state.selectedAgents || []

  // ── 加载 API 使用量 ──
  useEffect(() => {
    let cancelled = false
    setUsageLoading(true)
    fetchUsage().then((data) => {
      if (!cancelled) {
        setUsage(data)
        setUsageLoading(false)
      }
    }).catch(() => {
      if (!cancelled) setUsageLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  // 已选团队角色信息
  const teamAgents = useMemo(() => {
    return selectedAgents.map((id) => resolveAgent(id)).filter(Boolean)
  }, [selectedAgents])

  // 按学段筛选示例教材
  const filteredDemos = useMemo(() => {
    const g = state.selectedGrade
    if (!g) return DEMO_MATERIALS
    const name = GRADE_NAME[g]
    const list = DEMO_MATERIALS.filter((d) => d.grade === name)
    return list.length ? list : DEMO_MATERIALS
  }, [state.selectedGrade])

  // navigate 来自 appContext（带导航守卫）

  // ── 解析动画 + 实际解析（支持 LLM 分析） ──
  // 1. 设置 parsing=true 2. 每500ms轮换提示 3. 调用 parseFn（可能是 LLM 分析或本地解析） 4. 完成后存入全局状态
  const runParse = useCallback(async (parseFn) => {
    dispatch({ type: 'SET_MATERIAL', payload: null })
    setParsing(true)
    setParseStep(0)
    setParseProgress(0)

    const stepTimer = setInterval(() => {
      setParseStep((prev) => (prev + 1) % PARSE_STEPS.length)
    }, 500)
    const progTimer = setInterval(() => {
      setParseProgress((p) => Math.min(p + Math.random() * 8 + 4, 85))
    }, 200)

    try {
      const [result] = await Promise.all([
        Promise.resolve(parseFn()),
        new Promise((r) => setTimeout(r, 1500)),
      ])
      clearInterval(stepTimer)
      clearInterval(progTimer)
      setParseProgress(100)
      dispatch({ type: 'SET_MATERIAL', payload: result })

      const engineLabel = result.analyzedBy === 'llm' ? '🤖 AI' : result.analyzedBy === 'demo' ? '🎭 Demo' : '本地'
      const meta = result.parseMeta || {}
      const pdfLabel = meta.mineruUsed ? ' · MinerU VLM' : meta.extractionMethod ? ` · ${meta.extractionMethod}` : ''
      const tableInfo = meta.hasTables ? ' · 含表格' : ''
      const formulaInfo = meta.hasFormulas ? ' · 含公式' : ''
      const hasWarnings = result.warnings && result.warnings.length > 0
      const warnSuffix = hasWarnings ? ` · ⚠️ ${result.warnings.length}条提示` : ''
      toast(`解析完成（${engineLabel}）${pdfLabel}${tableInfo}${formulaInfo}：${result.stats.sections}章节 · ${result.stats.concepts}概念 · ${result.stats.formulas}公式${warnSuffix}`, hasWarnings ? 'info' : 'success')
      setTimeout(() => {
        setParsing(false)
        setUploadedFile(null)
      }, 350)
    } catch (e) {
      clearInterval(stepTimer)
      clearInterval(progTimer)
      setParsing(false)
      setUploadedFile(null)
      toast('解析失败：' + (e.message || '未知错误'), 'error')
    }
  }, [dispatch, toast])

  // ── 文件上传（模拟上传进度 → 提取文本 → LLM/本地解析） ──
  const handleFile = useCallback((file) => {
    if (!file) return
    const name = file.name.toLowerCase()
    const valid = ['.pdf', '.docx', '.txt', '.md', '.markdown', '.text'].some((ext) => name.endsWith(ext))
    if (!valid) {
      toast('仅支持 PDF / DOCX / TXT 格式', 'error')
      return
    }
    dispatch({ type: 'SET_MATERIAL', payload: null })
    setUploadedFile({ name: file.name, size: file.size, progress: 0 })

    let p = 0
    const upTimer = setInterval(() => {
      p = Math.min(p + Math.random() * 22 + 14, 100)
      setUploadedFile((prev) => (prev ? { ...prev, progress: p } : prev))
      if (p >= 100) {
        clearInterval(upTimer)
        // 使用 LLM 分析或本地解析
        runParse(async () => {
          if (name.endsWith('.pdf')) {
            // PDF: 后端 API 优先（含 OCR），降级到 pdfjs
            const { text, numPages, ocrUsed, backendUsed, backendError, extractionMethod, mineruUsed, markdown, structured, downloads, parseMeta, warnings } = await extractPdfText(file)
            return analyzeWithLLM(text, file.name, state.settings, null, { numPages, fileSize: file.size, ocrUsed, backendUsed, backendError, extractionMethod, mineruUsed, markdown, structured, downloads, parseMeta, warnings })
          } else {
            // 文本类: 直接读取后用 LLM 分析
            const text = await file.text()
            return analyzeWithLLM(text, file.name, state.settings)
          }
        })
      }
    }, 180)
  }, [dispatch, toast, runParse, state.settings])

  // ── 粘贴文本解析 ──
  const handlePaste = useCallback(() => {
    const t = pasteText.trim()
    if (t.length < 20) {
      toast('请粘贴至少 20 字的教材内容', 'error')
      return
    }
    runParse(() => analyzeWithLLM(pasteText, '粘贴文本.txt', state.settings))
  }, [pasteText, runParse, state.settings])

  // ── 网址导入 ──
  const addUrl = useCallback(() => {
    const u = urlInput.trim()
    if (!u) {
      toast('请输入网址', 'error')
      return
    }
    if (!/^https?:\/\//i.test(u)) {
      toast('请输入以 http:// 或 https:// 开头的网址', 'error')
      return
    }
    if (urlList.includes(u)) {
      toast('该网址已添加', 'info')
      return
    }
    setUrlList((prev) => [...prev, u])
    setUrlInput('')
  }, [urlInput, urlList, toast])

  const removeUrl = useCallback((u) => {
    setUrlList((prev) => prev.filter((x) => x !== u))
  }, [])

  const parseUrls = useCallback(() => {
    if (urlList.length === 0) {
      toast('请先添加至少一个网址', 'error')
      return
    }
    const text = '# 网页教材合集\n\n' + urlList
      .map((u, i) => `## 来源${i + 1}：${u}\n从该网页抓取的教材内容。包含相关章节、核心概念与知识点，可用于游戏化设计。`)
      .join('\n\n')
    runParse(() => analyzeWithLLM(text, '网址导入.txt', state.settings))
  }, [urlList, runParse, state.settings])

  // ── 示例教材（文本） ──
  const useDemo = useCallback((demo) => {
    const text = DEMO_TEXTS[demo.id]
    runParse(() => analyzeWithLLM(text, demo.title + '.txt', state.settings))
  }, [runParse, state.settings])

  // ── 真实 PDF 教材：从服务器下载 PDF → 提取文本 → LLM 分析 ──
  const usePdfDemo = useCallback(async (book) => {
    dispatch({ type: 'SET_MATERIAL', payload: null })
    setUploadedFile({ name: book.title + '.pdf', size: 0, progress: 0 })
    setParsing(true)
    setParseStep(0)
    setParseProgress(0)

    const stepTimer = setInterval(() => {
      setParseStep((prev) => (prev + 1) % PARSE_STEPS.length)
    }, 500)
    const progTimer = setInterval(() => {
      setParseProgress((p) => Math.min(p + Math.random() * 8 + 5, 85))
    }, 200)

    try {
      // 1. 从服务器获取 PDF 文件
      const resp = await fetch(book.pdf)
      if (!resp.ok) throw new Error('教材下载失败 (' + resp.status + ')')
      const blob = await resp.blob()
      const file = new File([blob], book.title + '.pdf', { type: 'application/pdf' })

      setUploadedFile({ name: file.name, size: file.size, progress: 100 })
      setParseProgress(30)

      // 2. 提取 PDF 文本（MinerU主链路，PyMuPDF降级，浏览器pdfjs兜底）
      const { text, numPages, ocrUsed, backendUsed, backendError, extractionMethod, mineruUsed, markdown, structured, downloads, parseMeta, warnings } = await extractPdfText(file)
      setParseProgress(50)

      // 3. 用 LLM 分析（或降级到本地解析）
      const [result] = await Promise.all([
        analyzeWithLLM(text, file.name, state.settings, null, { numPages, fileSize: file.size, ocrUsed, backendUsed, backendError, extractionMethod, mineruUsed, markdown, structured, downloads, parseMeta, warnings }),
        new Promise((r) => setTimeout(r, 1500)),
      ])

      clearInterval(stepTimer)
      clearInterval(progTimer)
      setParseProgress(100)
      dispatch({ type: 'SET_MATERIAL', payload: result })

      const engineLabel = result.analyzedBy === 'llm' ? '🤖 AI' : result.analyzedBy === 'demo' ? '🎭 Demo' : '本地'
      const hasWarnings = result.warnings && result.warnings.length > 0
      const warnSuffix = hasWarnings ? ` · ⚠️ ${result.warnings.length}条提示` : ''
      toast(`解析完成（${engineLabel}）：${result.stats.sections}章节 · ${result.stats.concepts}概念 · ${result.stats.formulas}公式${warnSuffix}`, hasWarnings ? 'info' : 'success')
      setTimeout(() => {
        setParsing(false)
        setUploadedFile(null)
      }, 350)
    } catch (e) {
      clearInterval(stepTimer)
      clearInterval(progTimer)
      setParsing(false)
      setUploadedFile(null)
      toast('PDF解析失败：' + (e.message || '未知错误'), 'error')
    }
  }, [dispatch, toast, state.settings])

  // ── 重置教材 ──
  const resetMaterial = useCallback(() => {
    dispatch({ type: 'SET_MATERIAL', payload: null })
    setUploadedFile(null)
    setPasteText('')
  }, [dispatch])

  // ── 构建推荐 Prompt（与 CVM 服务端一致的预设 Prompt）──
  const buildRecommendPrompt = useCallback((mat, subject, grade, creative) => {
    const gradeCn = { primary: '小学', junior: '初中', senior: '高中', college: '大学' }[grade] || grade || '通用'
    const stats = mat.stats || {}

    let md = `# 教材分析报告\n\n## 基本信息\n- 学段: ${gradeCn}\n- 学科: ${subject || '通用'}\n- 教材文件: ${mat.filename || 'unknown'}\n\n## 统计信息\n- 文本字数: ${stats.chars || 0}\n- 章节数: ${stats.sections || 0}\n- 核心概念数: ${stats.concepts || 0}\n- 公式数: ${stats.formulas || 0}\n- 术语数: ${stats.terms || 0}\n`

    if (mat.structure && mat.structure.length) {
      md += '\n## 章节结构\n'
      mat.structure.slice(0, 20).forEach(s => {
        const lvl = s.level || 1
        md += `${'  '.repeat(lvl - 1)}- ${s.title || '未命名'}\n`
      })
    }
    if (mat.concepts && mat.concepts.length) {
      md += '\n## 核心概念\n'
      mat.concepts.slice(0, 30).forEach(c => {
        md += `- **${c.name || c}**: ${c.context || ''}\n`
      })
    }
    if (mat.terms && mat.terms.length) {
      md += '\n## 关键术语\n'
      mat.terms.slice(0, 30).forEach(t => {
        md += `- **${t.term || t}**: ${t.definition || t.context || ''}\n`
      })
    }
    if (creative) md += `\n## 用户创意想法\n${creative}\n`

    const systemPrompt = `你是一位专业的游戏化学习设计专家。基于以下教材分析数据，为${gradeCn}阶段的${subject || '通用'}学科推荐4个最合适的游戏化学习方案。

请严格按照以下JSON格式返回，不要包含任何其他文本：
{"gameModes":[{"id":"adventure","num":"01","type":"Adventure","name":"探索冒险","match":98,"stars":5,"effect":92,"tags":["探索","收集","剧情","养成"],"desc":"描述...","color":"#00d4ff","radar":[98,95,92,92,68]}],"dna":[{"label":"探索元素","pct":60,"color":"#00d4ff"}],"aiTeam":[{"name":"游戏策划师","role":"负责整体游戏设计"}],"objectives":["目标1","目标2","目标3"],"aiSuggestion":"建议文字","matchScore":98,"matchLabel":"知识覆盖度高","matchDesc":"非常适合游戏化学习","knowledgePoints":126,"experiments":23}

要求：1.返回4个游戏模式(id:adventure/simulation/puzzle/rpg) 2.描述必须结合教材知识点 3.radar5个值对应:知识匹配度/趣味性/互动性/学习效果/实施难度 4.dna反映教材特点 5.objectives基于实际知识点 6.颜色固定:#00d4ff/#a78bfa/#34d399/#ec4899 7.只返回JSON`

    return { systemPrompt, userPrompt: `以下是${gradeCn}${subject || '通用'}教材分析数据：\n\n${md}\n\n请推荐4个游戏化学习方案。` }
  }, [])

  // ── 确认教材，调用AI生成游戏化推荐，进入玩法推荐 ──
  const confirmAndStart = useCallback(async () => {
    if (!material) {
      toast('请先上传并解析教材', 'error')
      return
    }
    dispatch({ type: 'SET_CREATIVE_INPUT', payload: creativeInput })

    // 如果已有推荐数据，直接进入
    if (state.gameplayRecommendation) {
      navigate(STEPS.GAMEPLAY)
      return
    }

    const apiKey = state.settings?.apiKey || ''
    if (!apiKey) {
      toast('未配置 AI Key，将使用默认方案', 'info')
      navigate(STEPS.GAMEPLAY)
      return
    }

    setRecommending(true)
    dispatch({ type: 'SET_RECOMMENDATION_LOADING', payload: true })

    // 方案1: 通过 CVM API（数据上传到腾讯云）
    const isHttps = location.protocol === 'https:'
    const cvmApiUrl = isHttps
      ? 'https://101.35.114.5:9002/api/recommend'
      : 'http://101.35.114.5:8002/api/recommend'

    try {
      const resp = await fetch(cvmApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material: {
            id: material.id, filename: material.filename, type: material.type,
            structure: material.structure, concepts: material.concepts,
            formulas: material.formulas, terms: material.terms,
            stats: material.stats, analyzedBy: material.analyzedBy, parsedAt: material.parsedAt,
          },
          subject: state.selectedSubject || '',
          grade: state.selectedGrade || 'primary',
          creativeInput: creativeInput || '',
          apiKey: apiKey,
        }),
        signal: AbortSignal.timeout(120000),
      })

      if (resp.ok) {
        const data = await resp.json()
        const rec = data.recommendation || data
        dispatch({ type: 'SET_GAMEPLAY_RECOMMENDATION', payload: rec })
        toast(data.warning ? data.warning : 'AI 游戏化方案已生成!', data.warning ? 'info' : 'success')
        setRecommending(false)
        dispatch({ type: 'SET_RECOMMENDATION_LOADING', payload: false })
        navigate(STEPS.GAMEPLAY)
        return
      }
      throw new Error(`CVM API ${resp.status}`)
    } catch (cvmErr) {
      console.warn('CVM API 失败，尝试直接调用 DeepSeek:', cvmErr)
    }

    // 方案2: 直接调用 DeepSeek API（CVM 不可用时的后备方案）
    try {
      const { systemPrompt, userPrompt } = buildRecommendPrompt(material, state.selectedSubject, state.selectedGrade, creativeInput)
      const apiBase = state.settings?.apiBase || 'https://api.deepseek.com/v1'

      const llmResp = await fetch(`${apiBase}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: state.settings?.model || 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          stream: false, temperature: 0.3, max_tokens: 4000,
        }),
        signal: AbortSignal.timeout(120000),
      })

      if (!llmResp.ok) throw new Error(`DeepSeek API ${llmResp.status}`)
      const llmData = await llmResp.json()
      const content = llmData.choices?.[0]?.message?.content || ''

      // 解析 JSON
      let rec
      try {
        rec = JSON.parse(content)
      } catch {
        const m = content.match(/```(?:json)?\s*([\s\S]*?)```/)
        if (m) rec = JSON.parse(m[1].trim())
        else {
          const f = content.indexOf('{'), l = content.lastIndexOf('}')
          if (f !== -1 && l !== -1) rec = JSON.parse(content.substring(f, l + 1))
          else throw new Error('JSON 解析失败')
        }
      }

      dispatch({ type: 'SET_GAMEPLAY_RECOMMENDATION', payload: rec })
      toast('AI 游戏化方案已生成!', 'success')
    } catch (directErr) {
      console.warn('Direct DeepSeek API 也失败:', directErr)
      toast('AI推荐生成失败，将使用默认方案', 'error')
      // 不阻塞流程，GameplayGacha 有兜底数据
    } finally {
      setRecommending(false)
      dispatch({ type: 'SET_RECOMMENDATION_LOADING', payload: false })
    }

    navigate(STEPS.GAMEPLAY)
  }, [material, navigate, toast, creativeInput, dispatch, state.gameplayRecommendation, state.settings, state.selectedSubject, state.selectedGrade, buildRecommendPrompt])

  return html`
    <div class="min-h-screen flex flex-col" style=${{ background: 'var(--theme-bg)', color: 'var(--theme-text)', minHeight: '100vh' }}>
      <style>${PARSE_CSS}</style>

      ${recommending ? html`
        <div class="fixed inset-0 z-50 flex items-center justify-center" style=${{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div class="text-center px-8 py-10 rounded-2xl" style=${{ background: 'var(--theme-surface)', maxWidth: '400px' }}>
            <div class="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
            <h3 class="text-lg font-bold mb-2" style=${{ color: 'var(--theme-text)' }}>AI 正在生成游戏化方案</h3>
            <p class="text-sm" style=${{ color: 'var(--theme-text-muted)' }}>
              基于教材内容分析，AI 正在为您匹配最合适的游戏化学习方案...<br/>
              <span class="text-xs mt-2 inline-block">预计需要 30-60 秒，请耐心等待</span>
            </p>
          </div>
        </div>
      ` : null}
      <${NavBar} />

      <${PageContainer} className="pb-28 lg:pb-16">
        <!-- 团队预览条 -->
        <${TeamPreviewBar} teamAgents=${teamAgents} onEdit=${() => navigate(STEPS.AGENTS)} />

        <!-- 进度指示器 -->
        <div class="mt-4">
          <${StepProgress} current=${1} total=${4} labels=${STEP_LABELS} />
        </div>

        <!-- 页面标题 -->
        <div class="text-center mt-2 mb-4">
          <h1 class="text-2xl sm:text-3xl font-bold" style=${{ color: 'var(--theme-primary)' }}>📚 把教材交给你的AI团队</h1>
          <p class="text-sm mt-1.5 max-w-2xl mx-auto" style=${{ color: 'var(--theme-text-muted)' }}>
            上传教材内容，AI团队将自动解析章节、提取概念、标注公式，为游戏化设计做准备
          </p>
        </div>

        <!-- 免费额度徽章 -->
        <div class="mb-5 max-w-md mx-auto">
          <${QuotaBadge} usage=${usage} loading=${usageLoading} />
        </div>

        <!-- 左右分栏 -->
        <div class="grid lg:grid-cols-5 gap-5">
          <!-- ════ 左侧：输入模式（40%） ════ -->
          <div class="lg:col-span-2 space-y-4">
            <!-- Tab 切换 -->
            <div class="flex gap-1 p-1 rounded-xl" style=${{ background: 'var(--theme-surface-alt)' }}>
              ${TABS.map((t) => html`
                <button key=${t.id}
                  class="flex-1 flex items-center justify-center gap-1 px-1.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all"
                  style=${inputMode === t.id
                    ? { background: 'var(--theme-surface)', color: 'var(--theme-primary)', boxShadow: 'var(--theme-shadow)' }
                    : { color: 'var(--theme-text-muted)' }}
                  onClick=${() => setInputMode(t.id)}>
                  <span>${t.emoji}</span><span class="hidden sm:inline">${t.label}</span>
                </button>
              `)}
            </div>

            <!-- 模式1：上传文件 -->
            ${inputMode === 'pdf' ? html`
              <div class="space-y-3">
                <div
                  onDragOver=${(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave=${() => setDragOver(false)}
                  onDrop=${(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files && e.dataTransfer.files[0]) }}
                  onClick=${() => fileInput.current && fileInput.current.click()}
                  class="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all"
                  style=${dragOver
                    ? { borderColor: 'var(--theme-primary)', background: 'var(--theme-primary-bg)' }
                    : { borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}>
                  <input ref=${fileInput} type="file" accept=".pdf,.docx,.txt,.md,.markdown,.text" class="hidden"
                    onChange=${(e) => { handleFile(e.target.files && e.target.files[0]); if (e.target) e.target.value = '' }} />
                  <div class="text-5xl mb-2 upload-float" style=${{ animation: 'upload-float 2.5s ease-in-out infinite', display: 'inline-block' }}>📄</div>
                  <p class="font-semibold text-sm" style=${{ color: 'var(--theme-text)' }}>${dragOver ? '松手即可上传' : '点击或拖拽文件到这里'}</p>
                  <p class="text-xs mt-1" style=${{ color: 'var(--theme-text-muted)' }}>支持 PDF / DOCX / TXT · 单文件</p>
                </div>

                ${uploadedFile ? html`
                  <div class="p-3 rounded-xl" style=${{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
                    <div class="flex items-center gap-2">
                      <span class="text-xl">📎</span>
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium truncate" style=${{ color: 'var(--theme-text)' }}>${uploadedFile.name}</div>
                        <div class="text-xs" style=${{ color: 'var(--theme-text-muted)' }}>
                          ${formatSize(uploadedFile.size)} · ${uploadedFile.progress < 100 ? '上传中...' : (parsing ? '解析中...' : '上传完成')}
                        </div>
                      </div>
                      ${uploadedFile.progress >= 100 && !parsing ? html`
                        <span class="text-xs font-bold" style=${{ color: 'var(--theme-accent)' }}>✓</span>
                      ` : null}
                    </div>
                    <div class="mt-2 h-1.5 rounded-full overflow-hidden" style=${{ background: 'var(--theme-surface-alt)' }}>
                      <div class="h-full rounded-full transition-all duration-200" style=${{ width: uploadedFile.progress + '%', background: 'var(--theme-primary)' }}></div>
                    </div>
                  </div>
                ` : null}
              </div>
            ` : null}

            <!-- 模式2：粘贴文本 -->
            ${inputMode === 'paste' ? html`
              <div class="space-y-2">
                <textarea value=${pasteText}
                  onInput=${(e) => setPasteText(e.target.value)}
                  placeholder="把教材内容粘贴到这里…（包含章节标题解析效果更好，例如：# 一、光的反射）"
                  rows=${10}
                  class="w-full px-3 py-2.5 rounded-xl text-sm leading-relaxed outline-none resize-none"
                  style=${{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', color: 'var(--theme-text)' }}></textarea>
                <div class="flex items-center justify-between">
                  <span class="text-xs" style=${{ color: 'var(--theme-text-muted)' }}>💡 包含章节标题解析效果更好</span>
                  <span class="text-xs font-mono" style=${{ color: pasteText.trim().length >= 20 ? 'var(--theme-accent)' : 'var(--theme-text-muted)' }}>${pasteText.length} 字</span>
                </div>
                <button class="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-50"
                  style=${{ background: 'var(--theme-primary)' }}
                  disabled=${pasteText.trim().length < 20 || parsing}
                  onClick=${handlePaste}>
                  ${parsing ? '解析中...' : '解析文本'}
                </button>
              </div>
            ` : null}

            <!-- 模式3：从网址导入 -->
            ${inputMode === 'url' ? html`
              <div class="space-y-3">
                <div class="flex gap-2">
                  <input type="text" value=${urlInput}
                    onInput=${(e) => setUrlInput(e.target.value)}
                    onKeyDown=${(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl() } }}
                    placeholder="https://example.com/article"
                    class="flex-1 min-w-0 px-3 py-2 rounded-lg text-sm outline-none"
                    style=${{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', color: 'var(--theme-text)' }} />
                  <button class="px-3 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 shrink-0"
                    style=${{ background: 'var(--theme-primary)' }}
                    onClick=${addUrl}>添加网址</button>
                </div>

                ${urlList.length === 0 ? html`
                  <p class="text-xs text-center py-6" style=${{ color: 'var(--theme-text-muted)' }}>
                    还没有添加网址，输入网址后点击"添加网址"
                  </p>
                ` : html`
                  <div class="space-y-2">
                    ${urlList.map((u, i) => html`
                      <div key=${u} class="flex items-center gap-2 p-2 rounded-lg" style=${{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
                        <span class="text-xs font-mono shrink-0" style=${{ color: 'var(--theme-text-muted)' }}>${i + 1}.</span>
                        <span class="text-xs truncate flex-1 min-w-0" style=${{ color: 'var(--theme-text)' }}>${u}</span>
                        <button class="text-xs px-1 shrink-0" style=${{ color: 'var(--theme-text-muted)' }} onClick=${() => removeUrl(u)}>✕</button>
                      </div>
                    `)}
                    <button class="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-50"
                      style=${{ background: 'var(--theme-primary)' }}
                      disabled=${parsing}
                      onClick=${parseUrls}>
                      ${parsing ? '解析中...' : '解析 ' + urlList.length + ' 个网址'}
                    </button>
                  </div>
                `}
              </div>
            ` : null}

            <!-- 模式4：使用示例教材 -->
            ${inputMode === 'demo' ? html`
              <div class="space-y-3">
                ${state.selectedGrade ? html`
                  <div class="text-xs px-2 py-1 rounded-md inline-block" style=${{ background: 'var(--theme-accent-bg)', color: 'var(--theme-accent)' }}>
                    已按你的学段筛选（${GRADE_NAME[state.selectedGrade]}）
                  </div>
                ` : null}

                <!-- 真实 PDF 教材（从服务器下载解析） -->
                <div class="space-y-2">
                  <div class="text-xs font-semibold flex items-center gap-1.5" style=${{ color: 'var(--theme-accent)' }}>
                    <span>📄</span><span>真实 PDF 教材（在线解析）</span>
                  </div>
                  ${PDF_TEXTBOOKS.map((d) => html`
                    <div key=${d.id} class="p-3 rounded-xl flex items-start gap-3 transition-all"
                      style=${{ background: 'var(--theme-surface)', border: '1px solid var(--theme-accent)' + '33' }}>
                      <span class="text-2xl shrink-0">${d.emoji}</span>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="text-sm font-semibold" style=${{ color: 'var(--theme-text)' }}>${d.title}</span>
                          <span class="text-[10px] px-1.5 py-0.5 rounded" style=${{ background: 'var(--theme-accent-bg)', color: 'var(--theme-accent)' }}>${d.grade}·${d.subject}</span>
                          <span class="text-[10px] px-1.5 py-0.5 rounded font-mono" style=${{ background: 'rgba(0,229,255,0.1)', color: '#00e5ff' }}>PDF</span>
                        </div>
                        <p class="text-xs mt-1" style=${{ color: 'var(--theme-text-muted)' }}>${d.desc}</p>
                      </div>
                      <button class="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity disabled:opacity-50"
                        style=${{ background: 'var(--theme-accent)' }}
                        disabled=${parsing}
                        onClick=${() => usePdfDemo(d)}>解析PDF</button>
                    </div>
                  `)}
                </div>

                <!-- 分割线 -->
                <div class="flex items-center gap-2 py-1">
                  <div class="flex-1 h-px" style=${{ background: 'var(--theme-border)' }}></div>
                  <span class="text-[10px]" style=${{ color: 'var(--theme-text-muted)' }}>快速示例（文本解析）</span>
                  <div class="flex-1 h-px" style=${{ background: 'var(--theme-border)' }}></div>
                </div>

                <!-- 预设文本示例教材 -->
                <div class="space-y-2">
                  ${filteredDemos.map((d) => html`
                    <div key=${d.id} class="p-3 rounded-xl flex items-start gap-3 transition-all"
                      style=${{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
                      <span class="text-2xl shrink-0">${d.emoji}</span>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="text-sm font-semibold" style=${{ color: 'var(--theme-text)' }}>${d.title}</span>
                          <span class="text-[10px] px-1.5 py-0.5 rounded" style=${{ background: 'var(--theme-primary-bg)', color: 'var(--theme-primary)' }}>${d.grade}·${d.subject}</span>
                        </div>
                        <p class="text-xs mt-1" style=${{ color: 'var(--theme-text-muted)' }}>${d.desc}</p>
                        <p class="text-[10px] mt-1" style=${{ color: 'var(--theme-text-muted)' }}>${d.chapters} 章节 · ${d.formulas} 公式</p>
                      </div>
                      <button class="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity disabled:opacity-50"
                        style=${{ background: 'var(--theme-primary)' }}
                        disabled=${parsing}
                        onClick=${() => useDemo(d)}>使用</button>
                    </div>
                  `)}
                </div>
              </div>
            ` : null}
          </div>

          <!-- ════ 右侧：解析预览面板（60%） ════ -->
          <div class="lg:col-span-3">
            <${ParsePreview}
              material=${material}
              parsing=${parsing}
              parseStep=${parseStep}
              parseProgress=${parseProgress}
              onReset=${resetMaterial}
              dispatch=${dispatch}
              setInputMode=${setInputMode} />
          </div>
        </div>

        <!-- 创意想法输入区 -->
        <div class="mt-5 rounded-2xl p-4 sm:p-5" style=${{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="text-lg shrink-0">💡</span>
            <h3 class="text-sm font-bold" style=${{ color: 'var(--theme-text)' }}>
              你的创意想法
              <span class="text-xs font-normal ml-1" style=${{ color: 'var(--theme-text-muted)' }}>（选填）</span>
            </h3>
          </div>
          <p class="text-xs mb-3" style=${{ color: 'var(--theme-text-muted)' }}>
            告诉AI团队你对游戏的设想，比如玩法风格、角色设定、场景偏好等。留空则由AI全自动设计。
          </p>
          <textarea
            value=${creativeInput}
            onInput=${(e) => setCreativeInput(e.target.value)}
            placeholder="例如：希望做成探险解谜风格，主角是一个穿越时空的历史学者，在古代文明中收集知识碎片解锁剧情…"
            rows=${3}
            class="w-full px-3 py-2.5 rounded-xl text-sm leading-relaxed outline-none resize-none"
            style=${{ background: 'var(--theme-surface-alt)', border: '1px solid var(--theme-border)', color: 'var(--theme-text)' }}></textarea>
          <div class="flex items-center justify-between mt-1.5">
            <span class="text-[11px]" style=${{ color: 'var(--theme-text-muted)' }}>💡 描述越具体，AI生成的游戏越贴合你的想象</span>
            <span class="text-xs font-mono" style=${{ color: creativeInput.trim() ? 'var(--theme-accent)' : 'var(--theme-text-muted)' }}>${creativeInput.length} 字</span>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="mt-8 flex items-center justify-between gap-3 pt-5" style=${{ borderTop: '1px solid var(--theme-border)' }}>
          <button class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
            style=${{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-muted)' }}
            onClick=${() => { dispatch({ type: 'SET_STEP', payload: STEPS.SUBJECT }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            <span>←</span><span>返回选择科目</span>
          </button>
          <button class="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style=${{ background: material && !recommending ? 'var(--theme-primary)' : 'var(--theme-surface-alt)', cursor: material && !recommending ? 'pointer' : 'not-allowed', opacity: material && !recommending ? 1 : 0.5 }}
            disabled=${!material || recommending}
            onClick=${confirmAndStart}>
            ${recommending ? html`<span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span><span>AI正在生成方案...</span>` : html`<span>确认教材，选择玩法</span><span>→</span>`}
          </button>
        </div>
      </${PageContainer}>

      <${Footer} />
    </div>
  `
}
