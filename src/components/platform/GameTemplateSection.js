// ═══════════════════════════════════════════════════════════
// 世界引擎蓝图矩阵 — 游戏模板展示区
// 赛博 HUD 风格：深空底色 / 机械切角 / 扫描线 / 霓虹光晕
// ═══════════════════════════════════════════════════════════
import { html, useState, useCallback, useContext, useEffect } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'

// ── CSS 样式（注入一次）──
let _styleEl = null
const GT_STYLES = `
/* ═══ 深空底层 ═══ */
.gt-section {
  --gt-bg: #07090F;
  --gt-surface: rgba(18, 22, 35, 0.7);
  --gt-cyan: #00F0FF;
  --gt-cyan-dim: rgba(0, 240, 255, 0.2);
  --gt-purple: #B14BF4;
  --gt-text: #FFFFFF;
  --gt-muted: #8B949E;
  --gt-stroke: rgba(255, 255, 255, 0.08);
  --gt-stroke-hover: rgba(0, 240, 255, 0.4);
  --gt-font-ui: -apple-system, "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  --gt-font-mono: "Share Tech Mono", "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
  --gt-chamfer: 15px;
  --gt-chamfer-sm: 10px;
  --gt-chamfer-btn: 8px;

  position: relative;
  background: var(--gt-bg);
  font-family: var(--gt-font-ui);
  color: var(--gt-text);
  overflow: hidden;
}

/* 背景工程网格 */
.gt-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 240, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.08) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
  z-index: 0;
}

/* 背景数据光柱 */
.gt-section::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to bottom, transparent 0%, rgba(0, 240, 255, 0.015) 30%, transparent 60%),
    linear-gradient(to bottom, transparent 0%, rgba(177, 75, 244, 0.012) 50%, transparent 80%);
  background-size: 200px 100%, 300px 100%;
  background-position: 15% 0, 75% 0;
  background-repeat: no-repeat;
  pointer-events: none;
  z-index: 0;
}

.gt-inner {
  position: relative;
  z-index: 1;
  max-width: 1440px;
  margin: 0 auto;
  padding: 60px 40px;
}

/* ═══ 战术头部 ═══ */
.gt-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 48px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--gt-cyan-dim);
  position: relative;
  flex-wrap: wrap;
  gap: 20px;
}

.gt-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 20%;
  height: 2px;
  background: var(--gt-cyan);
  box-shadow: 0 0 12px var(--gt-cyan);
  animation: gt-scan 4s ease-in-out infinite alternate;
}

@keyframes gt-scan {
  0% { left: 0; width: 10%; }
  100% { left: 75%; width: 25%; }
}

.gt-title-group h2 {
  margin: 0 0 6px 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--gt-text);
  text-shadow: 0 0 20px rgba(0, 240, 255, 0.25);
}

.gt-title-group .gt-subtitle {
  margin: 0;
  font-family: var(--gt-font-mono);
  color: var(--gt-cyan);
  font-size: 12px;
  opacity: 0.75;
  letter-spacing: 1px;
}

/* ── 筛选按钮 ── */
.gt-filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.gt-filter {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--gt-muted);
  padding: 8px 22px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--gt-font-ui);
  cursor: pointer;
  transition: all 0.3s ease;
  clip-path: polygon(var(--gt-chamfer-sm) 0, 100% 0, 100% calc(100% - var(--gt-chamfer-sm)), calc(100% - var(--gt-chamfer-sm)) 100%, 0 100%, 0 var(--gt-chamfer-sm));
}

.gt-filter:hover {
  border-color: var(--gt-cyan);
  color: var(--gt-cyan);
  background: rgba(0, 240, 255, 0.08);
}

.gt-filter.gt-active {
  border-color: var(--gt-cyan);
  color: var(--gt-cyan);
  background: rgba(0, 240, 255, 0.12);
  box-shadow: inset 0 0 15px rgba(0, 240, 255, 0.08);
}

/* ═══ 蓝图卡片网格 ═══ */
.gt-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 36px;
}

/* ── 卡片容器 ── */
.gt-card {
  background: var(--gt-surface);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--gt-stroke);
  clip-path: polygon(var(--gt-chamfer) 0, 100% 0, 100% calc(100% - var(--gt-chamfer)), calc(100% - var(--gt-chamfer)) 100%, 0 100%, 0 var(--gt-chamfer));
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: default;
  overflow: hidden;
}

.gt-card:hover {
  transform: translateY(-8px);
  border-color: var(--gt-stroke-hover);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 240, 255, 0.12);
}

/* ═══ 封面图区域 ═══ */
.gt-cover {
  height: 180px;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.gt-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.5s ease, transform 0.5s ease;
  display: block;
}

/* Hover：实景退隐 → 蓝图模式 */
.gt-card:hover .gt-cover img {
  filter: grayscale(80%) brightness(0.5) contrast(1.2) hue-rotate(150deg) saturate(200%);
  transform: scale(1.06);
}

/* ── 扫描线纹理 ── */
.gt-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 240, 255, 0.08) 2px,
    rgba(0, 240, 255, 0.08) 4px
  );
  pointer-events: none;
  z-index: 1;
}

/* ── 四角定位标 ── */
.gt-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 1px solid var(--gt-cyan);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
  pointer-events: none;
}
.gt-corner-tl { top: 10px; left: 10px; border-right: none; border-bottom: none; }
.gt-corner-tr { top: 10px; right: 10px; border-left: none; border-bottom: none; }
.gt-corner-bl { bottom: 10px; left: 10px; border-right: none; border-top: none; }
.gt-corner-br { bottom: 10px; right: 10px; border-left: none; border-top: none; }

.gt-card:hover .gt-corner { opacity: 0.85; }

/* ── 状态角标 ── */
.gt-status {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid var(--gt-cyan-dim);
  padding: 4px 10px;
  font-family: var(--gt-font-mono);
  font-size: 10px;
  color: var(--gt-cyan);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  letter-spacing: 0.5px;
  z-index: 3;
}

.gt-status.gt-status-update {
  color: var(--gt-purple);
  border-color: rgba(177, 75, 244, 0.3);
}

/* ═══ 参数信息区 ═══ */
.gt-body {
  padding: 24px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* ── 标题（带紫色竖线标识）── */
.gt-card-title {
  font-size: 19px;
  font-weight: 700;
  margin: 0 0 14px 0;
  display: flex;
  align-items: center;
  line-height: 1.3;
}

.gt-card-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 18px;
  background: var(--gt-purple);
  margin-right: 12px;
  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(177, 75, 244, 0.4);
}

/* ── 学科胶囊标签 ── */
.gt-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.gt-tag {
  padding: 4px 11px;
  font-size: 12px;
  color: #aaa;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid transparent;
}

.gt-tag-primary {
  background: rgba(177, 75, 244, 0.15);
  color: #D896FF;
  border-color: rgba(177, 75, 244, 0.3);
}

/* ── 数据列表 ── */
.gt-specs {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
}

.gt-spec {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 0;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
  font-size: 13px;
  gap: 12px;
}

.gt-spec:last-child { border-bottom: none; }

.gt-spec-label {
  color: var(--gt-muted);
  flex-shrink: 1;
}

.gt-spec-value {
  font-family: var(--gt-font-mono);
  color: var(--gt-cyan);
  font-weight: 600;
  text-align: right;
  text-shadow: 0 0 6px rgba(0, 240, 255, 0.35);
  flex-shrink: 0;
}

/* ═══ 战术行动区 ═══ */
.gt-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(7, 9, 15, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 18px 24px;
  box-sizing: border-box;
  display: flex;
  gap: 14px;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border-top: 1px solid var(--gt-cyan-dim);
  z-index: 4;
}

.gt-card:hover .gt-actions {
  transform: translateY(0);
}

/* ── 按钮 ── */
.gt-btn {
  flex: 1;
  padding: 11px 0;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  clip-path: polygon(var(--gt-chamfer-btn) 0, 100% 0, 100% calc(100% - var(--gt-chamfer-btn)), calc(100% - var(--gt-chamfer-btn)) 100%, 0 100%, 0 var(--gt-chamfer-btn));
  border: none;
  font-family: var(--gt-font-ui);
}

.gt-btn-outline {
  background: transparent;
  color: var(--gt-text);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-sizing: border-box;
}

.gt-btn-outline:hover {
  border-color: var(--gt-text);
  background: rgba(255, 255, 255, 0.08);
}

.gt-btn-solid {
  background: var(--gt-cyan);
  color: #000;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.35);
}

.gt-btn-solid:hover {
  background: #fff;
  box-shadow: 0 0 22px rgba(255, 255, 255, 0.6);
}

/* ═══ 响应式 ═══ */
@media (max-width: 768px) {
  .gt-inner { padding: 40px 20px; }
  .gt-header { flex-direction: column; align-items: flex-start; }
  .gt-grid { grid-template-columns: 1fr; gap: 24px; }
  .gt-title-group h2 { font-size: 22px; }
}

@media (max-width: 480px) {
  .gt-inner { padding: 30px 16px; }
  .gt-filters { width: 100%; }
  .gt-filter { flex: 1; text-align: center; padding: 8px 12px; font-size: 12px; }
}

/* ── reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .gt-header::after { animation: none; }
  .gt-card { transition: border-color 0.2s; }
  .gt-card:hover { transform: none; }
  .gt-cover img { transition: filter 0.2s; }
}
`

// ── 模板数据 ──
const TEMPLATES = [
  {
    id: 'chinese',
    image: '/assets/game-templates/chinese.png',
    title: '赛博密室逃脱文字 AVG',
    status: 'ENGINE_READY',
    statusType: 'ready',
    category: 'liberal',
    tags: [
      { label: '语文/文言文', primary: true },
      { label: '历史', primary: false },
      { label: '解谜叙事', primary: false },
    ],
    specs: [
      { label: '知识承载量 (单章)', value: '3-5 篇古文短篇' },
      { label: '核心底层机制', value: '线索搜集 / 密码破解' },
      { label: 'AI 场景生成率', value: '98.5%' },
    ],
  },
  {
    id: 'chemistry',
    image: '/assets/game-templates/chemistry.webp',
    title: '元素反应塔防 SLG',
    status: 'ENGINE_READY',
    statusType: 'ready',
    category: 'science',
    tags: [
      { label: '化学方程式', primary: true },
      { label: '生物', primary: false },
      { label: '策略数值', primary: false },
    ],
    specs: [
      { label: '知识承载量 (单局)', value: '10-20 个化学反应' },
      { label: '核心底层机制', value: '兵种克制 / 资源管理' },
      { label: 'AI 数值平衡率', value: '92.0%' },
    ],
  },
  {
    id: 'physics',
    image: '/assets/game-templates/physics.png',
    title: '星际物理轨迹沙盒',
    status: 'UPDATE_V2.1',
    statusType: 'update',
    category: 'science',
    tags: [
      { label: '高中物理', primary: true },
      { label: '地理天文', primary: false },
      { label: '自由创造', primary: false },
    ],
    specs: [
      { label: '知识承载量 (沙盒)', value: '无限制定律植入' },
      { label: '核心底层机制', value: '万有引力 / 动量守恒' },
      { label: 'AI 物理演算率', value: '99.9%' },
    ],
  },
  {
    id: 'history',
    image: '/assets/game-templates/history.png',
    title: '文明演进策略 4X',
    status: 'ENGINE_READY',
    statusType: 'ready',
    category: 'liberal',
    tags: [
      { label: '历史/中外史纲', primary: true },
      { label: '政治', primary: false },
      { label: '文明推演', primary: false },
    ],
    specs: [
      { label: '知识承载量 (单局)', value: '5-8 个历史时期' },
      { label: '核心底层机制', value: '科技树 / 文明演进' },
      { label: 'AI 历史推演率', value: '95.7%' },
    ],
  },
]

// ── 筛选配置 ──
const FILTERS = [
  { id: 'all', label: '全部法则' },
  { id: 'liberal', label: '文科适用 (叙事)' },
  { id: 'science', label: '理科适用 (逻辑)' },
]

// ── 单卡片组件 ──
function BlueprintCard({ tpl, onInject, onPreview }) {
  return html`
    <div class="gt-card">
      <!-- 封面展示区 -->
      <div class="gt-cover">
        <img src=${tpl.image} alt=${tpl.title} loading="lazy" />
        <div class="gt-scanlines"></div>
        <div class="gt-corner gt-corner-tl"></div>
        <div class="gt-corner gt-corner-tr"></div>
        <div class="gt-corner gt-corner-bl"></div>
        <div class="gt-corner gt-corner-br"></div>
        <div class="gt-status ${tpl.statusType === 'update' ? 'gt-status-update' : ''}">
          [ ${tpl.status} ]
        </div>
      </div>

      <!-- 参数信息区 -->
      <div class="gt-body">
        <h3 class="gt-card-title">${tpl.title}</h3>

        <div class="gt-tags">
          ${tpl.tags.map((tag, i) => html`
            <span key=${i} class="gt-tag ${tag.primary ? 'gt-tag-primary' : ''}">${tag.label}</span>
          `)}
        </div>

        <ul class="gt-specs">
          ${tpl.specs.map((spec, i) => html`
            <li key=${i} class="gt-spec">
              <span class="gt-spec-label">${spec.label}</span>
              <span class="gt-spec-value">${spec.value}</span>
            </li>
          `)}
        </ul>
      </div>

      <!-- 战术行动区（hover 滑出）-->
      <div class="gt-actions">
        <button class="gt-btn gt-btn-outline" onClick=${() => onPreview(tpl)}>
          预览 Demo
        </button>
        <button class="gt-btn gt-btn-solid" onClick=${() => onInject(tpl)}>
          > 注入知识数据
        </button>
      </div>
    </div>
  `
}

// ── 主组件 ──
export default function GameTemplateSection() {
  const { dispatch, toast } = useContext(AppContext)
  const [activeFilter, setActiveFilter] = useState('all')

  // 注入知识数据 → 跳转到上传教材
  const handleInject = useCallback((tpl) => {
    dispatch({ type: 'SET_MODE', payload: 'quick' })
    dispatch({ type: 'SET_STEP', payload: STEPS.UPLOAD })
    toast(`已选择引擎: ${tpl.title}，请上传教材`, 'info')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch, toast])

  // 预览 Demo
  const handlePreview = useCallback((tpl) => {
    toast(`${tpl.title} — Demo 即将上线`, 'info')
  }, [toast])

  // 筛选
  const filtered = activeFilter === 'all'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === activeFilter)

  // 注入样式（HMR 时更新内容）
  useEffect(() => {
    if (!_styleEl) {
      _styleEl = document.createElement('style')
      document.head.appendChild(_styleEl)
    }
    _styleEl.textContent = GT_STYLES
  }, [])

  return html`
    <section class="gt-section">
      <div class="gt-inner">

        <!-- ═══ 战术头部 ═══ -->
        <div class="gt-header">
          <div class="gt-title-group">
            <h2>世界引擎蓝图矩阵</h2>
            <p class="gt-subtitle">${'> SELECT_TEMPLATE // INITIALIZE_AI_FORGE_PROTOCOL'}</p>
          </div>
          <div class="gt-filters">
            ${FILTERS.map(f => html`
              <button
                key=${f.id}
                class="gt-filter ${activeFilter === f.id ? 'gt-active' : ''}"
                onClick=${() => setActiveFilter(f.id)}
              >${f.label}</button>
            `)}
          </div>
        </div>

        <!-- ═══ 蓝图卡片网格 ═══ -->
        <div class="gt-grid">
          ${filtered.map(tpl => html`
            <${BlueprintCard}
              key=${tpl.id}
              tpl=${tpl}
              onInject=${handleInject}
              onPreview=${handlePreview}
            />
          `)}
        </div>

      </div>
    </section>
  `
}
