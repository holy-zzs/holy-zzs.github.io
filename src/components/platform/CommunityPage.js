// 页面：社区方案 / BLUEPRINT_VAULT
// 蓝图与节点 (Blueprints & Nodes) — 硬核开源知识武器库
import { html, useContext, useState, useEffect, useRef, useMemo } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'
import { COMMUNITY_PLANS } from '../../data/platformData.js'
import { NavBar, Footer } from './PlatformCommon.js?v=nav3'

// ═══════════════════════════════════════════════════
// 数据增强 — 为每个方案附加蓝图元数据
// ═══════════════════════════════════════════════════
const SUBJECT_META = {
  '数学': { img: '/assets/jarvis/calculus-topology.jpg', accent: '#67E8F9', domain: 'STEM' },
  '物理': { img: '/assets/jarvis/physics-gravity.jpg', accent: '#C084FC', domain: 'STEM' },
  '生物': { img: '/assets/jarvis/biotech-dna.jpg', accent: '#6EE7B7', domain: 'STEM' },
  '化学': { img: '/assets/jarvis/chemistry-molecules.jpg', accent: '#F472B6', domain: 'STEM' },
  '历史': { img: '/assets/jarvis/history-warriors.jpg', accent: '#FB923C', domain: '人文' },
  '语文': { img: '/assets/community/history-qin.jpg', accent: '#FCD34D', domain: '人文' },
}

const CODE_SNIPPETS = {
  '数学': `// 二次函数求根公式\nf(x) = ax² + bx + c\nΔ = b² - 4ac\nif (Δ > 0) {\n  roots = [(-b+√Δ)/2a, (-b-√Δ)/2a]\n} else if (Δ == 0) {\n  roots = [-b / 2a]\n} else {\n  // 无实数根，进入复数空间\n  roots = complex_solve(Δ)\n}`,
  '物理': `// 牛顿第二定律\nF = m × a\nG = 6.674e-11  // 引力常量\nv = v₀ + a×t\nE_k = ½ × m × v²\n// 自由落体\nif (apple.height > 0) {\n  apple.velocity += g × dt\n  apple.height -= apple.velocity × dt\n}`,
  '生物': `// 细胞分裂 — 有丝分裂\ncell = { phase: 'interphase', dna: 46 }\nwhile (cell.phase !== 'cytokinesis') {\n  cell = mitosis_next(cell)\n  if (cell.dna_replicated) {\n    cell.phase = 'prophase'\n  }\n}\n// 结果: 2个 identical daughter cells`,
  '化学': `// 化学反应方程式\n2H₂ + O₂ → 2H₂O\n// 活化能\nEa = 75.3 kJ/mol\nif (temperature > Ea_threshold) {\n  reaction.initiate()\n  energy.release = -285.8 kJ  // 放热\n}\n// 电子转移\ne⁻ transfer: H⁰ → H⁺`,
  '历史': `// 丝绸之路贸易模拟\nsilk_road = TradeRoute('长安', '罗马')\nsilk_road.distance = 6440  // km\nwhile (caravan.alive) {\n  goods = { silk: 100, tea: 50 }\n  profit = trade(goods, 'spices')\n  culture.exchange(east, west)\n}`,
  '语文': `// 唐诗结构解析\npoem = Poem('静夜思')\npoem.author = '李白'\npoem.verses = ['床前明月光', '疑是地上霜', '举头望明月', '低头思故乡']\npoem.mood = '思乡'\npoem.rhyme = 'ang'\nif (reader.moonlight) {\n  reader.emotion = 'nostalgia'\n}`,
}

const AI_PARAMS = {
  '数学': [
    { key: 'NPC_COUNT', val: '3', icon: '👤' },
    { key: 'GRAVITY', val: '0.8', icon: '🌐' },
    { key: 'ENGINE', val: 'Phaser', icon: '⚙️' },
    { key: 'DIFFICULTY', val: 'ADAPTIVE', icon: '📊' },
    { key: 'KNOWLEDGE_NODES', val: '12', icon: '🧠' },
  ],
  '物理': [
    { key: 'NPC_COUNT', val: '5', icon: '👤' },
    { key: 'GRAVITY', val: '9.8', icon: '🌐' },
    { key: 'ENGINE', val: 'Pixi.js', icon: '⚙️' },
    { key: 'PHYSICS_SOLVER', val: 'Verlet', icon: '📐' },
    { key: 'KNOWLEDGE_NODES', val: '18', icon: '🧠' },
  ],
  '生物': [
    { key: 'NPC_COUNT', val: '8', icon: '👤' },
    { key: 'GRAVITY', val: '0.5', icon: '🌐' },
    { key: 'ENGINE', val: 'Phaser', icon: '⚙️' },
    { key: 'TOWER_SLOTS', val: '6', icon: '🏰' },
    { key: 'KNOWLEDGE_NODES', val: '15', icon: '🧠' },
  ],
  '化学': [
    { key: 'NPC_COUNT', val: '4', icon: '👤' },
    { key: 'GRAVITY', val: '0.3', icon: '🌐' },
    { key: 'ENGINE', val: 'Pixi.js', icon: '⚙️' },
    { key: 'PARTICLE_SYS', val: 'ENABLED', icon: '✨' },
    { key: 'KNOWLEDGE_NODES', val: '20', icon: '🧠' },
  ],
  '历史': [
    { key: 'NPC_COUNT', val: '12', icon: '👤' },
    { key: 'GRAVITY', val: '0.0', icon: '🌐' },
    { key: 'ENGINE', val: 'Phaser', icon: '⚙️' },
    { key: 'BRANCHING', val: 'multi-end', icon: '🌲' },
    { key: 'KNOWLEDGE_NODES', val: '25', icon: '🧠' },
  ],
  '语文': [
    { key: 'NPC_COUNT', val: '2', icon: '👤' },
    { key: 'GRAVITY', val: '0.0', icon: '🌐' },
    { key: 'ENGINE', val: 'Phaser', icon: '⚙️' },
    { key: 'TEXT_ENGINE', val: 'INK', icon: '📖' },
    { key: 'KNOWLEDGE_NODES', val: '10', icon: '🧠' },
  ],
}

const COMPLEXITY_MAP = ['LOW', 'MED', 'HIGH', 'MAX']

function enrichPlans() {
  return COMMUNITY_PLANS.map((p, i) => {
    const meta = SUBJECT_META[p.subject] || { img: '/assets/jarvis/physics-gravity.jpg', accent: '#67E8F9', domain: 'STEM' }
    return {
      ...p,
      codeSnippet: CODE_SNIPPETS[p.subject] || '// Loading...',
      gameImg: meta.img,
      accent: meta.accent,
      domain: meta.domain,
      complexity: COMPLEXITY_MAP[i % 4],
      forks: Math.floor(p.downloads * 0.35),
      creatorId: '@' + p.author.replace(/\s/g, '_').toUpperCase(),
      creatorRank: p.rating >= 4.8 ? 'gold' : p.rating >= 4.6 ? 'silver' : 'bronze',
      aiParams: AI_PARAMS[p.subject] || AI_PARAMS['数学'],
      blueprintId: 'BP-' + p.id.toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
    }
  })
}

// ═══════════════════════════════════════════════════
// 跳动数字 Hook
// ═══════════════════════════════════════════════════
function useJumpingNumber(initial, { min, max, interval = 1200 } = {}) {
  const [val, setVal] = useState(initial)
  useEffect(() => {
    const timer = setInterval(() => {
      setVal(Math.floor(Math.random() * (max - min + 1)) + min)
    }, interval)
    return () => clearInterval(timer)
  }, [min, max, interval])
  return val
}

// ═══════════════════════════════════════════════════
// 1. 顶部：全息星图雷达
// ═══════════════════════════════════════════════════
function BlueprintHeader({ onUpload }) {
  const creators = useJumpingNumber(12492, { min: 12300, max: 12600, interval: 3000 })
  const forked = useJumpingNumber(3841, { min: 3700, max: 4000, interval: 2000 })
  const online = useJumpingNumber(347, { min: 300, max: 400, interval: 1500 })

  // 生成拓扑网络节点
  const nodes = useMemo(() => {
    const arr = []
    let seed = 42
    const rng = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 }
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + rng() * 0.3
      const radius = 120 + rng() * 160
      arr.push({
        x: 300 + Math.cos(angle) * radius,
        y: 300 + Math.sin(angle) * radius,
        r: 2 + rng() * 4,
        delay: rng() * 3,
      })
    }
    return arr
  }, [])

  return html`
    <section class="bp-header">
      <div class="bp-header-bg">
        <svg class="bp-radar" viewBox="0 0 600 600" fill="none">
          <!-- 同心圆 -->
          <circle cx="300" cy="300" r="280" stroke="rgba(103,232,249,0.06)" stroke-width="1"/>
          <circle cx="300" cy="300" r="200" stroke="rgba(103,232,249,0.08)" stroke-width="1"/>
          <circle cx="300" cy="300" r="120" stroke="rgba(103,232,249,0.1)" stroke-width="1"/>
          <circle cx="300" cy="300" r="60" stroke="rgba(103,232,249,0.15)" stroke-width="1"/>
          <!-- 扫描线 -->
          <g class="bp-radar-sweep">
            <path d="M 300 300 L 300 20 A 280 280 0 0 1 520 180 Z" fill="rgba(103,232,249,0.04)"/>
            <line x1="300" y1="300" x2="300" y2="20" stroke="rgba(103,232,249,0.3)" stroke-width="1"/>
          </g>
          <!-- 拓扑节点 -->
          <g class="bp-radar-nodes">
            ${nodes.map((n, i) => html`
              <g key=${i}>
                <circle cx=${n.x} cy=${n.y} r=${n.r} fill="rgba(103,232,249,0.4)" class="bp-radar-node" style=${{ animationDelay: n.delay + 's' }}/>
                ${i < nodes.length - 1 ? html`
                  <line x1=${n.x} y1=${n.y} x2=${nodes[(i + 1) % nodes.length].x} y2=${nodes[(i + 1) % nodes.length].y} stroke="rgba(103,232,249,0.08)" stroke-width="0.5"/>
                ` : null}
              </g>
            `)}
          </g>
          <!-- 中心节点 -->
          <circle cx="300" cy="300" r="8" fill="rgba(192,132,252,0.6)" class="bp-radar-core"/>
          <circle cx="300" cy="300" r="16" fill="none" stroke="rgba(192,132,252,0.3)" stroke-width="1" class="bp-radar-pulse"/>
        </svg>
      </div>

      <div class="bp-header-content">
        <div class="bp-metrics">
          <div class="bp-metric">
            <span class="bp-metric-tag">[LIVE]</span>
            <span class="bp-metric-label">ACTIVE_CREATORS</span>
            <span class="bp-metric-val" style=${{ color: '#6EE7B7' }}>${creators.toLocaleString()}</span>
          </div>
          <div class="bp-metric">
            <span class="bp-metric-tag">[SYS]</span>
            <span class="bp-metric-label">SCHEMES_FORKED_TODAY</span>
            <span class="bp-metric-val" style=${{ color: '#67E8F9' }}>${forked.toLocaleString()}</span>
          </div>
          <div class="bp-metric">
            <span class="bp-metric-tag">[NET]</span>
            <span class="bp-metric-label">ONLINE_NOW</span>
            <span class="bp-metric-val" style=${{ color: '#C084FC' }}>${online}</span>
          </div>
        </div>

        <div class="bp-header-title">
          <span class="bp-header-eyebrow">&lt;BLUEPRINT_VAULT /&gt;</span>
          <h1 class="bp-header-h1">开源知识武器库</h1>
          <p class="bp-header-desc">每一个方案都是一份高保密级别的数字蓝图。不是浏览帖子 —— 是下载配置数据。</p>
        </div>

        <button class="bp-upload-btn" onClick=${onUpload}>
          <span class="bp-upload-scan"></span>
          <span class="bp-upload-text">[+] 上传我的蓝图</span>
        </button>
      </div>
    </section>
  `
}

// ═══════════════════════════════════════════════════
// 1.5 游戏广场入口横幅（社区 → 游戏广场 跳转）
// ═══════════════════════════════════════════════════
function PlazaEntryBanner({ onEnter }) {
  return html`
    <section class="bp-plaza-entry" onClick=${onEnter} role="button" tabindex="0"
      onKeyPress=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEnter() } }}>
      <div class="bp-plaza-entry-bg" aria-hidden="true">
        <div class="bp-plaza-grid"></div>
        <div class="bp-plaza-glow"></div>
      </div>
      <div class="bp-plaza-entry-content">
        <div class="bp-plaza-entry-left">
          <span class="bp-plaza-entry-eyebrow">// GAME_PLAZA_ACCESS</span>
          <h2 class="bp-plaza-entry-title">进入游戏广场</h2>
          <p class="bp-plaza-entry-desc">全息模组匣子库 · 启动沉浸式模拟，探索更多游戏宇宙</p>
        </div>
        <div class="bp-plaza-entry-right">
          <span class="bp-plaza-entry-cta">
            <span class="bp-plaza-entry-cta-text">▶ INITIATE</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
          </span>
        </div>
      </div>
      <style>
        .bp-plaza-entry{position:relative;cursor:pointer;overflow:hidden;margin:24px 0;padding:28px 32px;border:1px solid rgba(103,232,249,0.28);background:linear-gradient(135deg,rgba(8,12,22,0.92),rgba(14,21,40,0.92));clip-path:polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,18px 100%,0 calc(100% - 18px));transition:all .3s;outline:none;}
        .bp-plaza-entry:hover,.bp-plaza-entry:focus-visible{border-color:rgba(103,232,249,0.65);box-shadow:0 0 24px rgba(103,232,249,0.25),0 0 60px rgba(103,232,249,0.08);transform:translateY(-1px);}
        .bp-plaza-entry-bg{position:absolute;inset:0;z-index:0;pointer-events:none;}
        .bp-plaza-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(103,232,249,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(103,232,249,0.05) 1px,transparent 1px);background-size:36px 36px;opacity:.6;}
        .bp-plaza-glow{position:absolute;inset:0;background:radial-gradient(circle at 12% 50%,rgba(103,232,249,0.18),transparent 42%),radial-gradient(circle at 88% 50%,rgba(192,132,252,0.14),transparent 45%);}
        .bp-plaza-entry-content{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;}
        .bp-plaza-entry-left{display:flex;flex-direction:column;gap:6px;min-width:0;flex:1 1 320px;}
        .bp-plaza-entry-eyebrow{font-family:'Share Tech Mono','JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.22em;font-size:11px;color:#67E8F9;}
        .bp-plaza-entry-title{font-family:'Michroma','Orbitron','Noto Sans SC',sans-serif;font-size:clamp(1.4rem,2.4vw,2rem);color:#E2F1FF;margin:0;text-shadow:0 0 14px rgba(103,232,249,0.4);}
        .bp-plaza-entry-desc{font-family:'Inter','Noto Sans SC',sans-serif;font-size:13px;color:#8aa6c2;line-height:1.6;margin:0;}
        .bp-plaza-entry-right{flex:none;}
        .bp-plaza-entry-cta{display:inline-flex;align-items:center;gap:10px;padding:12px 22px;font-family:'Share Tech Mono','JetBrains Mono',monospace;font-size:13px;letter-spacing:.14em;color:#021018;background:linear-gradient(135deg,#00e5ff,#6cf2ff);clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));transition:filter .25s,transform .2s;}
        .bp-plaza-entry:hover .bp-plaza-entry-cta{filter:drop-shadow(0 0 12px rgba(0,229,255,0.7));transform:translateX(3px);}
        .bp-plaza-entry-cta-text{font-weight:700;}
        @media (max-width:639px){
          .bp-plaza-entry{padding:22px 20px;}
          .bp-plaza-entry-content{flex-direction:column;align-items:flex-start;}
          .bp-plaza-entry-right{align-self:stretch;}
          .bp-plaza-entry-cta{justify-content:center;width:100%;}
        }
        @media (prefers-reduced-motion:reduce){.bp-plaza-entry,.bp-plaza-entry:hover,.bp-plaza-entry-cta{transition:none;transform:none;}}
      </style>
    </section>
  `
}

// ═══════════════════════════════════════════════════
// 2. 中部：战术检索终端
// ═══════════════════════════════════════════════════
function TacticalSearch({ search, setSearch, filters, toggleFilter }) {
  const filterDefs = [
    { id: 'stem', label: 'STEM', desc: '理工科' },
    { id: 'humanities', label: '人文', desc: '文史哲' },
    { id: 'trending', label: 'TRENDING', desc: '高复用' },
    { id: 'topRated', label: '★★★★★', desc: '高评分' },
  ]

  return html`
    <section class="bp-search-section">
      <div class="bp-search-console">
        <div class="bp-search-input-wrap">
          <span class="bp-search-prompt">&gt; Search_Blueprint_Params</span>
          <input
            type="text"
            class="bp-search-input"
            placeholder="输入关键词、学科、游戏类型..."
            value=${search}
            onInput=${(e) => setSearch(e.target.value)}
          />
          <span class="bp-search-cursor">█</span>
        </div>

        <div class="bp-filters">
          ${filterDefs.map(f => html`
            <button
              key=${f.id}
              class=${`bp-toggle ${filters[f.id] ? 'bp-toggle-on' : ''}`}
              onClick=${() => toggleFilter(f.id)}
            >
              <span class="bp-toggle-label">${f.label}</span>
              <span class="bp-toggle-desc">${f.desc}</span>
              <span class="bp-toggle-switch">
                <span class="bp-toggle-knob"></span>
              </span>
            </button>
          `)}
        </div>
      </div>
    </section>
  `
}

// ═══════════════════════════════════════════════════
// 3. 核心区：蓝图数据匣子卡片
// ═══════════════════════════════════════════════════
function BlueprintCard({ plan, onTeardown }) {
  const rankColors = {
    gold: '#FCD34D',
    silver: '#CBD5E1',
    bronze: '#D97706',
  }
  const rankLabel = { gold: 'MASTER', silver: 'EXPERT', bronze: 'ADEPT' }

  return html`
    <article class="bp-card" onClick=${() => onTeardown(plan)}>
      <!-- 机械切角边框 -->
      <div class="bp-card-corners">
        <span class="bp-corner tl"></span>
        <span class="bp-corner tr"></span>
        <span class="bp-corner bl"></span>
        <span class="bp-corner br"></span>
      </div>

      <!-- 蓝图ID -->
      <div class="bp-card-id">${plan.blueprintId}</div>

      <!-- 创作者标签 -->
      <div class="bp-card-creator">
        <div class=${`bp-avatar bp-avatar-${plan.creatorRank}`} style=${{ '--rank-color': rankColors[plan.creatorRank] }}>
          <span>${plan.emoji}</span>
        </div>
        <div class="bp-creator-info">
          <span class="bp-creator-id">${plan.creatorId}</span>
          <span class=${`bp-creator-rank bp-rank-${plan.creatorRank}`}>[${rankLabel[plan.creatorRank]}]</span>
        </div>
      </div>

      <!-- 分屏封面：左代码 / 右游戏 -->
      <div class="bp-card-split">
        <div class="bp-split-left">
          <pre class="bp-split-code"><code>${plan.codeSnippet}</code></pre>
          <span class="bp-split-label">[RAW_DATA]</span>
        </div>
        <div class="bp-split-beam" style=${{ '--beam-color': plan.accent }}></div>
        <div class="bp-split-right">
          <img src=${plan.gameImg} alt=${plan.title} loading="lazy" />
          <div class="bp-split-overlay"></div>
          <span class="bp-split-label bp-split-label-r">[GAME_RENDER]</span>
        </div>
      </div>

      <!-- 元数据 -->
      <div class="bp-card-meta">
        <div class="bp-meta-row">
          <h3 class="bp-card-title">${plan.title}</h3>
          <span class="bp-complexity" style=${{ color: plan.accent }}>[${plan.complexity}]</span>
        </div>
        <div class="bp-meta-tags">
          <span class="bp-tag">${plan.subject}</span>
          <span class="bp-tag">${plan.grade}</span>
          <span class="bp-tag">${plan.gameType}</span>
        </div>
        <div class="bp-meta-stats">
          <span class="bp-stat">⬇ ${plan.downloads.toLocaleString()}</span>
          <span class="bp-stat">⑂ ${plan.forks.toLocaleString()}</span>
          <span class="bp-stat">★ ${plan.rating}</span>
        </div>
      </div>

      <!-- 克隆按钮 -->
      <button class="bp-clone-btn" onClick=${(e) => { e.stopPropagation(); onTeardown(plan) }}>
        <span class="bp-clone-text">克隆此配置 / Clone Scheme</span>
        <span class="bp-clone-arrow">→</span>
      </button>
    </article>
  `
}

// ═══════════════════════════════════════════════════
// 4. 拆解视图 Modal — 三段式逻辑流
// ═══════════════════════════════════════════════════
function TeardownModal({ plan, onClose, onViewDetail }) {
  const fps = useJumpingNumber(60, { min: 58, max: 60, interval: 500 })
  const cpu = useJumpingNumber(23, { min: 18, max: 35, interval: 800 })
  const mem = useJumpingNumber(142, { min: 130, max: 160, interval: 1200 })

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!plan) return null

  return html`
    <div class="bp-modal-overlay" onClick=${onClose}>
      <div class="bp-modal" onClick=${(e) => e.stopPropagation()}>
        <!-- Modal Header -->
        <div class="bp-modal-header">
          <div class="bp-modal-title">
            <span class="bp-modal-id">${plan.blueprintId}</span>
            <h2>${plan.title}</h2>
          </div>
          <button class="bp-modal-close" onClick=${onClose}>✕</button>
        </div>

        <!-- 三段式面板 -->
        <div class="bp-modal-body">
          <!-- 左：Raw_Data -->
          <div class="bp-panel bp-panel-raw">
            <div class="bp-panel-head">
              <span class="bp-panel-tag">[01]</span>
              <span class="bp-panel-title">RAW_DATA</span>
              <span class="bp-panel-sub">原始输入</span>
            </div>
            <div class="bp-panel-content bp-raw-content">
              <div class="bp-raw-source">
                <span class="bp-raw-label">// SOURCE: 教材原文</span>
                <p>知识点：${plan.subject} — ${plan.grade}阶段</p>
                <p>作者输入了一段关于「${plan.title}」的教材内容，包含核心公式、概念定义和例题。</p>
              </div>
              <pre class="bp-raw-code"><code>${plan.codeSnippet}</code></pre>
              <div class="bp-raw-meta">
                <span>CHARS: ${plan.codeSnippet.length}</span>
                <span>LINES: ${plan.codeSnippet.split('\n').length}</span>
                <span>PARSED: ✓</span>
              </div>
            </div>
          </div>

          <!-- 中：AI_Forge -->
          <div class="bp-panel bp-panel-forge" style=${{ '--accent': plan.accent }}>
            <div class="bp-panel-head">
              <span class="bp-panel-tag">[02]</span>
              <span class="bp-panel-title">AI_FORGE</span>
              <span class="bp-panel-sub">核心参数</span>
            </div>
            <div class="bp-panel-content bp-forge-content">
              <div class="bp-forge-tree">
                ${plan.aiParams.map((p, i) => html`
                  <div key=${i} class=${`bp-forge-node ${i < plan.aiParams.length - 1 ? 'bp-forge-connected' : ''}`}>
                    <span class="bp-forge-icon">${p.icon}</span>
                    <div class="bp-forge-data">
                      <span class="bp-forge-key">${p.key}</span>
                      <span class="bp-forge-val" style=${{ color: plan.accent }}>${p.val}</span>
                    </div>
                  </div>
                `)}
              </div>
              <div class="bp-forge-pipeline">
                <div class="bp-pipeline-step">PARSE</div>
                <div class="bp-pipeline-arrow">→</div>
                <div class="bp-pipeline-step">DESIGN</div>
                <div class="bp-pipeline-arrow">→</div>
                <div class="bp-pipeline-step">RENDER</div>
                <div class="bp-pipeline-arrow">→</div>
                <div class="bp-pipeline-step">DEPLOY</div>
              </div>
            </div>
          </div>

          <!-- 右：Final_Output -->
          <div class="bp-panel bp-panel-output">
            <div class="bp-panel-head">
              <span class="bp-panel-tag">[03]</span>
              <span class="bp-panel-title">FINAL_OUTPUT</span>
              <span class="bp-panel-sub">实时游戏窗口</span>
            </div>
            <div class="bp-panel-content bp-output-content">
              <div class="bp-game-window">
                <img src=${plan.gameImg} alt=${plan.title} />
                <div class="bp-game-hud">
                  <div class="bp-hud-row">
                    <span class="bp-hud-label">FPS</span>
                    <span class="bp-hud-val" style=${{ color: fps >= 59 ? '#6EE7B7' : '#FCD34D' }}>${fps}</span>
                  </div>
                  <div class="bp-hud-row">
                    <span class="bp-hud-label">CPU</span>
                    <span class="bp-hud-val" style=${{ color: cpu < 30 ? '#67E8F9' : '#F59E0B' }}>${cpu}%</span>
                  </div>
                  <div class="bp-hud-row">
                    <span class="bp-hud-label">MEM</span>
                    <span class="bp-hud-val" style=${{ color: '#C084FC' }}>${mem}MB</span>
                  </div>
                </div>
                <div class="bp-game-scan"></div>
                <div class="bp-game-play">▶ 试玩</div>
              </div>
              <div class="bp-output-link">
                <span class="bp-output-label">SHORT_LINK:</span>
                <span class="bp-output-url">k.abc/${plan.id}x7K2</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="bp-modal-footer">
          <button class="bp-modal-clone" onClick=${onClose}>
            <span>⑂ 克隆完整配置</span>
          </button>
          <button class="bp-modal-share" onClick=${onViewDetail}>
            <span>📄 查看完整详情 →</span>
          </button>
        </div>
      </div>
    </div>
  `
}

// ═══════════════════════════════════════════════════
// 主页面
// ═══════════════════════════════════════════════════
export default function CommunityPage({ onNavigate }) {
  const { dispatch } = useContext(AppContext)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ stem: false, humanities: false, trending: false, topRated: false })
  const [teardownPlan, setTeardownPlan] = useState(null)
  const [allPlans] = useState(() => enrichPlans())

  const toggleFilter = (id) => {
    setFilters(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleUpload = () => {
    dispatch({ type: 'SET_STEP', payload: STEPS.GENERATE })
  }

  const handleTeardown = (plan) => {
    dispatch({ type: 'SET_PLAN', payload: plan })
    setTeardownPlan(plan)
  }

  const handleViewDetail = () => {
    setTeardownPlan(null)
    dispatch({ type: 'SET_STEP', payload: STEPS.PLAN_DETAIL })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 筛选逻辑
  const filteredPlans = useMemo(() => {
    let result = allPlans
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.subject.toLowerCase().includes(q) ||
        p.gameType.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q)
      )
    }
    if (filters.stem) result = result.filter(p => p.domain === 'STEM')
    if (filters.humanities) result = result.filter(p => p.domain === '人文')
    if (filters.trending) result = result.filter(p => p.forks > 800)
    if (filters.topRated) result = result.filter(p => p.rating >= 4.8)
    return result
  }, [allPlans, search, filters])

  return html`
    <div class="bp-page">
      <${NavBar} />
      <div class="bp-grid-bg"></div>

      <div class="bp-content">
        <${BlueprintHeader} onUpload=${handleUpload} />
        <${TacticalSearch}
          search=${search}
          setSearch=${setSearch}
          filters=${filters}
          toggleFilter=${toggleFilter}
        />

        <section class="bp-vault">
          <div class="bp-vault-head">
            <span class="bp-vault-count">找到 ${filteredPlans.length} 份蓝图</span>
            <span class="bp-vault-sort">SORT: TRENDING ↓</span>
          </div>

          ${filteredPlans.length === 0 ? html`
            <div class="bp-empty">
              <span class="bp-empty-icon">🔍</span>
              <p>NO_BLUEPRINT_FOUND</p>
              <span>尝试调整检索参数或清除筛选器</span>
            </div>
          ` : html`
            <div class="bp-vault-grid">
              ${filteredPlans.map(p => html`
                <${BlueprintCard} key=${p.id} plan=${p} onTeardown=${handleTeardown} />
              `)}
            </div>
          `}
        </section>
      </div>

      ${teardownPlan ? html`
        <${TeardownModal} plan=${teardownPlan} onClose=${() => setTeardownPlan(null)} onViewDetail=${handleViewDetail} />
      ` : null}

      <${Footer} />
    </div>
  `
}
