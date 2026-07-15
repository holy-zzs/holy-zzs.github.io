import { html, useState } from '../../deps.js'

/**
 * 星海漫游者 — 协作工作台
 * 1:1 复刻设计规范：三栏布局 + 10张AI团队卡片 + 7个右侧模块
 */

/* ── Lucide 图标（内联 SVG） ── */
const ICONS = {
  compass: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm2.5 12.5L16 8l-6.5 1.5L8 16l6.5-1.5z',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm10 2l-4.35-4.35',
  help: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-13a2 2 0 0 1 2 2c0 1-1 1.5-2 2v1m0 3v.01',
  box: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8z M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12',
  userPlus: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm13 0v6m3-3h-6',
  book: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  gitBranch: 'M6 3v12M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 9v3a3 3 0 0 0 3 3h6',
  eye: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  save: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8',
  fileUp: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M12 18v-6M9 15l3-3 3 3',
  plus: 'M12 5v14M5 12h14',
}

function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 2 }) {
  const d = ICONS[name] || ''
  return html`
    <svg width=${size} height=${size} viewBox="0 0 24 24" fill="none"
      stroke=${color} stroke-width=${strokeWidth} stroke-linecap="round" stroke-linejoin="round"
      class="lucide-icon">
      ${d.split('M').filter(Boolean).map((seg, i) => html`
        <path key=${i} d=${'M' + seg} />
      `)}
    </svg>
  `
}

/* ── 导航菜单项 ── */
const NAV_ITEMS = [
  { icon: 'box', label: '智能体库', badge: 1 },
  { icon: 'userPlus', label: '创建AI团队' },
  { icon: 'book', label: '教材解析' },
  { icon: 'settings', label: '设定偏好' },
  { icon: 'gitBranch', label: '协作生成' },
  { icon: 'eye', label: '预览与发布' },
  { icon: 'save', label: '保存草稿' },
  { icon: 'fileUp', label: '导出方案' },
]

const TOP_NAV_LINKS = ['游戏广场', '创建项目', '我的项目', '智能体市场', '社区灵感', '文档中心']

/* ── AI 团队成员数据（10张卡片） ── */
const TEAM_CARDS = [
  {
    id: 1, initial: '策', name: '游戏策划总监', status: 'online', statusText: '在线',
    progress: 68, task: '核心玩法设计', tag: '策划核心',
    avatarBg: '#DBEAFE', extra: '预计2-3小时',
  },
  {
    id: 2, initial: '教', name: '教学设计专家', status: 'online', statusText: '在线',
    progress: 72, task: '教学目标映射', tag: '教学核心',
    avatarBg: '#D1FAE5',
  },
  {
    id: 3, initial: '教', name: '教材解析专家', status: 'online', statusText: '在线',
    progress: 85, task: '知识点结构化', tag: '教学核心',
    avatarBg: '#D1FAE5', extra: '人教版五年级数学上册', hasReparse: true, hasIntervention: true,
  },
  {
    id: 4, initial: '剧', name: '剧情文案大师', status: 'online', statusText: '在线',
    progress: 45, task: '章节剧情创作', tag: '策划辅助',
    avatarBg: '#DBEAFE',
  },
  {
    id: 5, initial: '关', name: '关卡设计师', status: 'online', statusText: '在线',
    progress: 60, task: '关卡1设计', tag: '策划辅助',
    avatarBg: '#DBEAFE',
  },
  {
    id: 6, initial: 'U', name: 'UI/UX设计师', status: 'online', statusText: '在线',
    progress: 55, task: '主界面设计', tag: '策划辅助',
    avatarBg: '#DBEAFE',
  },
  {
    id: 7, initial: '角', name: '角色设计师', status: 'online', statusText: '在线',
    progress: null, task: null, tag: '美术风格',
    avatarBg: '#FCE7F3', desc: '擅长：二次元、Q版角色设计',
  },
  {
    id: 8, initial: '编', name: '编程工程师', status: 'focused', statusText: '专注中',
    progress: 75, task: '核心系统开发', tag: '音效辅助',
    avatarBg: '#FEF3C7',
  },
  {
    id: 9, initial: '音', name: '音效设计师', status: 'waiting', statusText: '等待中',
    progress: 30, task: '背景音乐创作', tag: '音效辅助',
    avatarBg: '#FEF3C7',
  },
  {
    id: 10, initial: 'Q', name: 'QA测试专家', status: 'waiting', statusText: '等待中',
    progress: 0, task: '功能实现', tag: '测试优化',
    avatarBg: '#FEE2E2',
  },
]

/* ── 标签颜色映射 ── */
const TAG_STYLES = {
  '策划核心': { bg: '#DBEAFE', color: '#1D4ED8' },
  '策划辅助': { bg: '#DBEAFE', color: '#1D4ED8' },
  '教学核心': { bg: '#D1FAE5', color: '#065F46' },
  '美术风格': { bg: '#FCE7F3', color: '#9D174D' },
  '音效辅助': { bg: '#FEF3C7', color: '#92400E' },
  '测试优化': { bg: '#FEE2E2', color: '#991B1B' },
}

const STATUS_COLORS = {
  online: '#10B981',
  focused: '#F59E0B',
  waiting: '#94A3B8',
}

/* ── 右侧面板数据 ── */
const KNOWLEDGE_POINTS = ['小数除法', '图形面积', '分数运算', '统计图表', '方程应用']
const WORK_LOGS = [
  { time: '14:23', text: '教材解析专家完成了知识点提取，共识别28个核心知识点' },
  { time: '14:22', text: '教学设计专家完成了教学目标映射，生成了15个教学目标' },
  { time: '14:21', text: '游戏策划总监更新了核心玩法设计方案' },
]
const SUB_PROGRESS = [
  { label: '教学设计', percent: 60 },
  { label: '内容创作', percent: 45 },
  { label: '开发实现', percent: 72 },
]

/* ═══ 组件 ═══ */

/* ── 顶部导航栏 ── */
function TopNav() {
  return html`
    <header class="sv-topnav">
      <div class="sv-topnav-left">
        <${Icon} name="compass" size=${28} color="#60A5FA" />
        <span class="sv-brand">星海漫游者</span>
        <span class="sv-badge-user">高级用户</span>
      </div>
      <nav class="sv-topnav-center">
        ${TOP_NAV_LINKS.map((link, i) => html`
          <a key=${i} class="sv-topnav-link" href="#">${link}</a>
        `)}
        <button class="sv-help-btn">
          <${Icon} name="help" size=${16} color="#94A3B8" />
        </button>
      </nav>
      <div class="sv-topnav-right">
        <div class="sv-search-box">
          <${Icon} name="search" size=${16} color="#64748B" />
          <input type="text" placeholder="搜索智能体" />
        </div>
        <div class="sv-user-avatar">U</div>
      </div>
    </header>
  `
}

/* ── 左侧导航栏 ── */
function Sidebar() {
  const [activeNav, setActiveNav] = useState(0)
  const [activeFilter, setActiveFilter] = useState('全部')
  const filters = ['全部', '策划', '教学', '美术', '程序']

  return html`
    <aside class="sv-sidebar">
      <div class="sv-sidebar-search">
        <${Icon} name="search" size=${16} color="#64748B" />
        <input type="text" placeholder="搜索智能体" />
      </div>

      <nav class="sv-nav-list">
        ${NAV_ITEMS.map((item, i) => html`
          <a key=${i}
            class=${`sv-nav-item ${activeNav === i ? 'sv-nav-active' : ''}`}
            onClick=${() => setActiveNav(i)}>
            <${Icon} name=${item.icon} size=${20} color=${activeNav === i ? '#4A6CF7' : '#64748B'} />
            <span class="sv-nav-label">${item.label}</span>
            ${item.badge && html`<span class="sv-nav-badge">${item.badge}</span>`}
          </a>
        `)}
      </nav>

      <button class="sv-cta-btn">开始协作生成</button>

      <div class="sv-filter-section">
        <div class="sv-filter-tags">
          ${filters.map(f => html`
            <button key=${f}
              class=${`sv-filter-tag ${activeFilter === f ? 'sv-filter-active' : ''}`}
              onClick=${() => setActiveFilter(f)}>${f}</button>
          `)}
        </div>
      </div>

      <a class="sv-create-agent" href="#">
        <${Icon} name="plus" size=${16} color="#4A6CF7" />
        <span>创建自定义智能体</span>
      </a>
    </aside>
  `
}

/* ── 单张卡片 ── */
function TeamCard({ card }) {
  const tagStyle = TAG_STYLES[card.tag] || {}
  const statusColor = STATUS_COLORS[card.status]

  return html`
    <div class="sv-card">
      <div class="sv-card-header">
        <div class="sv-avatar" style=${{ background: card.avatarBg }}>
          ${card.initial}
        </div>
        <div class="sv-card-info">
          <div class="sv-card-name">${card.name}</div>
          <div class="sv-card-status">
            <span class="sv-status-dot" style=${{ background: statusColor }}></span>
            <span style=${{ color: statusColor }}>${card.statusText}</span>
          </div>
          <div class="sv-card-role">${card.task ? '' : (card.desc || '')}</div>
        </div>
        <span class="sv-tag" style=${{ background: tagStyle.bg, color: tagStyle.color }}>${card.tag}</span>
      </div>

      ${card.progress !== null && html`
        <div class="sv-progress-section">
          <div class="sv-progress-bar">
            <div class="sv-progress-fill" style=${{ width: card.progress + '%' }}></div>
          </div>
          <span class="sv-progress-num">${card.progress}%</span>
        </div>
      `}

      ${card.task && html`
        <div class="sv-card-task">正在处理：${card.task}</div>
      `}

      ${card.extra && html`
        <div class="sv-card-extra">
          <span class="sv-extra-text">${card.extra}</span>
          ${card.hasReparse && html`<a class="sv-reparse-link" href="#">重新解析</a>`}
        </div>
      `}

      ${card.hasIntervention && html`
        <div class="sv-intervention">
          <label>干预级别</label>
          <select class="sv-select">
            <option selected>用户干预</option>
            <option>完全自动</option>
            <option>全程干预</option>
          </select>
        </div>
      `}
    </div>
  `
}

/* ── 中间主工作区 ── */
function MainWorkArea() {
  const [viewMode, setViewMode] = useState('auto')
  const [activeTab, setActiveTab] = useState('全部')
  const tabs = ['全部', '策划', '教学', '美术', '程序']

  return html`
    <main class="sv-main">
      <div class="sv-main-header">
        <h1 class="sv-page-title">协作工作台</h1>
        <div class="sv-view-toggle">
          <button class=${`sv-toggle-btn ${viewMode === 'auto' ? 'sv-toggle-active' : ''}`}
            onClick=${() => setViewMode('auto')}>自动布局</button>
          <button class=${`sv-toggle-btn ${viewMode === 'flow' ? 'sv-toggle-active' : ''}`}
            onClick=${() => setViewMode('flow')}>流程状态机</button>
        </div>
      </div>

      <div class="sv-filter-bar">
        ${tabs.map(tab => html`
          <button key=${tab}
            class=${`sv-tab ${activeTab === tab ? 'sv-tab-active' : ''}`}
            onClick=${() => setActiveTab(tab)}>${tab}</button>
        `)}
      </div>

      <div class="sv-card-grid">
        ${TEAM_CARDS.map(card => html`<${TeamCard} key=${card.id} card=${card} />`)}
      </div>
    </main>
  `
}

/* ── 右侧面板 ── */
function RightPanel() {
  const [artStyle, setArtStyle] = useState('卡通')
  const artStyles = ['卡通', '像素', '写实', '手绘']
  const [suggestionDismissed, setSuggestionDismissed] = useState(false)

  return html`
    <aside class="sv-right-panel">
      {/* 模块1：知识点地图 */}
      <section class="sv-panel-module">
        <h3 class="sv-panel-title">知识点地图</h3>
        <div class="sv-knowledge-tags">
          ${KNOWLEDGE_POINTS.map(kp => html`<span key=${kp} class="sv-kp-tag">${kp}</span>`)}
        </div>
      </section>

      {/* 模块2：关键确认 */}
      <section class="sv-panel-module">
        <h3 class="sv-panel-title">关键确认</h3>
        <div class="sv-confirm-list">
          <div class="sv-confirm-item">
            <span>玩法方案</span>
            <button class="sv-confirm-btn">确认</button>
          </div>
          <div class="sv-confirm-item">
            <span>关卡设计</span>
            <button class="sv-confirm-btn">确认</button>
          </div>
        </div>
      </section>

      {/* 模块3：偏好设置 */}
      <section class="sv-panel-module">
        <h3 class="sv-panel-title">偏好设置</h3>
        <div class="sv-pref-list">
          <div class="sv-pref-row">
            <span class="sv-pref-label">美术风格</span>
            <div class="sv-pref-tags">
              ${artStyles.map(s => html`
                <button key=${s}
                  class=${`sv-pref-tag ${artStyle === s ? 'sv-pref-tag-active' : ''}`}
                  onClick=${() => setArtStyle(s)}>${s}</button>
              `)}
            </div>
          </div>
          <div class="sv-pref-row">
            <span class="sv-pref-label">游戏类型</span>
            <span class="sv-pref-value">冒险解谜</span>
          </div>
          <div class="sv-pref-row">
            <span class="sv-pref-label">难度等级</span>
            <span class="sv-pref-value">中级</span>
          </div>
          <div class="sv-pref-row">
            <span class="sv-pref-label">目标学段</span>
            <span class="sv-pref-value">五年级</span>
          </div>
          <div class="sv-pref-row">
            <span class="sv-pref-label">教学目标</span>
            <span class="sv-pref-value">理解分数运算</span>
          </div>
        </div>
      </section>

      {/* 模块4：实时建议 */}
      ${!suggestionDismissed && html`
        <section class="sv-panel-module">
          <h3 class="sv-panel-title">实时建议</h3>
          <p class="sv-suggestion-text">根据教材特点，建议增加更多生活场景应用题，提高学习趣味。</p>
          <div class="sv-suggestion-actions">
            <button class="sv-adopt-btn">采纳建议</button>
            <button class="sv-dismiss-btn" onClick=${() => setSuggestionDismissed(true)}>忽略建议</button>
          </div>
        </section>
      `}

      {/* 模块5：工作日志 */}
      <section class="sv-panel-module">
        <h3 class="sv-panel-title">工作日志</h3>
        <div class="sv-log-list">
          ${WORK_LOGS.map((log, i) => html`
            <div key=${i} class="sv-log-item">
              <span class="sv-log-time">[${log.time}]</span>
              <span class="sv-log-text">${log.text}</span>
            </div>
          `)}
        </div>
        <a class="sv-view-all" href="#">查看全部日志</a>
      </section>

      {/* 模块6：项目进度 */}
      <section class="sv-panel-module">
        <h3 class="sv-panel-title">项目进度</h3>
        <div class="sv-big-progress">68%</div>
        <div class="sv-sub-progress-list">
          ${SUB_PROGRESS.map(sp => html`
            <div key=${sp.label} class="sv-sub-progress">
              <div class="sv-sub-progress-header">
                <span class="sv-sub-label">${sp.label}</span>
                <span class="sv-sub-percent">${sp.percent}%</span>
              </div>
              <div class="sv-sub-bar">
                <div class="sv-sub-fill" style=${{ width: sp.percent + '%' }}></div>
              </div>
            </div>
          `)}
        </div>
        <div class="sv-eta">预计完成时间：2天3小时</div>
      </section>

      {/* 模块7：特殊需求输入框 */}
      <textarea class="sv-special-input" placeholder="请输入特殊需求，例如：增加更多互动环节" rows="2"></textarea>
    </aside>
  `
}

/* ═══ 主组件 ═══ */
export default function StarVoyagerWorkbench() {
  return html`
    <div class="sv-page">
      <${TopNav} />
      <div class="sv-body">
        <${Sidebar} />
        <${MainWorkArea} />
        <${RightPanel} />
      </div>
    </div>
  `
}
