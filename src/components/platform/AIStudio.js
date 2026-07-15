import { html, useState, useEffect, useRef } from '../../deps.js'
import { NavBar, Footer } from './PlatformCommon.js'
import { useApp, STEPS } from '../../store/appContext.js'

// ═══════════════════════════════════════════════════════════
// AI 工作台 v6 — AI 总监控制台
// 左侧展开卡牌 · 画布自动定位+牵引线 · 右侧5模块控制台
// ═══════════════════════════════════════════════════════════

const C = {
  void:'#050208', cat_input:'#00d4ff', cat_creative:'#8b5cf6',
  cat_tech:'#64748b', cat_audio:'#ffaa00', cat_quality:'#ff2e88', cat_ops:'#00ff88',
  text:'#e8e8ff', dim:'#9098b8', faint:'#5a5a7a', accent:'#00d4ff',
}

const CAT_INFO = {
  input:   { label:'输入分析', color:C.cat_input },
  creative:{ label:'创意设计', color:C.cat_creative },
  tech:    { label:'技术实现', color:C.cat_tech },
  audio:   { label:'音频沉浸', color:C.cat_audio },
  quality: { label:'质量保障', color:C.cat_quality },
  ops:     { label:'运营分析', color:C.cat_ops },
}

const AGENTS = [
  { id:'data_oracle', name:'数据先知', cat:'input', img:'09_data_oracle.jpg', x:10, y:200, status:'done', progress:100, compute:'0T', outputs:['126 知识点','48 概念'], desc:'解析教材PDF，提取知识点' },
  { id:'knowledge_eng', name:'知识工程师', cat:'input', img:'10_knowledge_engineer.jpg', x:200, y:200, status:'done', progress:100, compute:'120T', outputs:['知识图谱','难度曲线'], desc:'构建知识关联网络' },
  { id:'difficulty', name:'难度分析师', cat:'input', img:'30_difficulty.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'评估知识点难度分布' },
  { id:'cognitive', name:'认知顾问', cat:'input', img:'31_cognitive.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'匹配认知发展水平' },
  { id:'director', name:'游戏总监', cat:'creative', img:'01_game_director.jpg', x:390, y:100, status:'thinking', progress:72, compute:'340T', outputs:['核心玩法循环','节奏控制'], desc:'统筹全局设计方向' },
  { id:'worldbuild', name:'世界观架构', cat:'creative', img:'07_world_builder.jpg', x:390, y:300, status:'generating', progress:45, compute:'280T', outputs:['23个文明','星际地图'], desc:'构建游戏世界观' },
  { id:'level', name:'关卡设计师', cat:'creative', img:'02_level_architect.jpg', x:570, y:60, status:'generating', progress:68, compute:'190T', outputs:['12个关卡','战斗规则'], desc:'设计关卡空间布局' },
  { id:'art', name:'美术总监', cat:'creative', img:'03_visual_alchemist.jpg', x:570, y:200, status:'thinking', progress:61, compute:'520T', outputs:['18个概念图','角色设定'], desc:'统管视觉风格方向' },
  { id:'narrative', name:'叙事设计师', cat:'creative', img:'08_narrative_weaver.jpg', x:570, y:340, status:'generating', progress:38, compute:'150T', outputs:['12段对话','3条支线'], desc:'编织故事与对话' },
  { id:'character', name:'角色设计师', cat:'creative', img:'11_character_sculptor.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'创建角色外形设定' },
  { id:'concept', name:'概念艺术家', cat:'creative', img:'12_concept_visionary.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'绘制概念插画' },
  { id:'environ', name:'场景建模师', cat:'creative', img:'13_environment_modeler.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'搭建3D场景' },
  { id:'animator', name:'动画师', cat:'creative', img:'14_motion_puppeteer.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'制作角色动画' },
  { id:'vfx', name:'特效设计师', cat:'creative', img:'15_vfx_pyromancer.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'制作粒子特效' },
  { id:'combat', name:'战斗设计师', cat:'creative', img:'32_combat_designer.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'设计战斗系统' },
  { id:'tech', name:'程序引擎', cat:'tech', img:'04_code_forger.jpg', x:750, y:130, status:'idle', progress:15, compute:'80T', outputs:['系统架构'], desc:'编写核心程序代码' },
  { id:'shader', name:'着色器专家', cat:'tech', img:'16_shader_wizard.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'编写GPU着色器' },
  { id:'physics', name:'物理引擎师', cat:'tech', img:'17_physics_calc.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'模拟物理效果' },
  { id:'behavior', name:'AI行为师', cat:'tech', img:'18_ai_behavior.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'设计NPC行为' },
  { id:'network', name:'网络工程师', cat:'tech', img:'19_network_architect.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'搭建网络架构' },
  { id:'techart', name:'技术美术', cat:'tech', img:'20_tech_artist.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'优化渲染管线' },
  { id:'sound', name:'音效设计师', cat:'audio', img:'05_sonic_sculptor.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'制作游戏音效' },
  { id:'composer', name:'音乐作曲家', cat:'audio', img:'21_composer.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'创作游戏配乐' },
  { id:'voice', name:'语音合成师', cat:'audio', img:'22_voice_synth.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'合成角色语音' },
  { id:'light', name:'灯光师', cat:'audio', img:'23_light_master.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'设计场景灯光' },
  { id:'evaluator', name:'质量评估', cat:'quality', img:'06_quality_enforcer.jpg', x:750, y:300, status:'idle', progress:0, compute:'0T', outputs:[], desc:'检测游戏质量' },
  { id:'perf', name:'性能优化师', cat:'quality', img:'24_perf_tuner.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'优化运行性能' },
  { id:'analyst', name:'数据分析师', cat:'ops', img:'25_data_analyst.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'分析玩家数据' },
  { id:'psych', name:'心理分析师', cat:'ops', img:'26_psych_profiler.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'分析玩家心理' },
  { id:'anticheat', name:'反作弊专家', cat:'quality', img:'27_anti_cheat.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'防止游戏作弊' },
  { id:'community', name:'社区经理', cat:'ops', img:'28_community.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'管理玩家社区' },
  { id:'ops', name:'运营策略师', cat:'ops', img:'29_ops_strategist.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'制定运营策略' },
  { id:'economy', name:'经济设计师', cat:'ops', img:'33_economy.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'设计游戏经济' },
  { id:'l10n', name:'本地化专家', cat:'ops', img:'34_localization.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'翻译适配多语言' },
  { id:'cinematic', name:'过场导演', cat:'creative', img:'35_cinematic.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'制作过场动画' },
  { id:'rigger', name:'绑定工程师', cat:'tech', img:'36_rigging.jpg', status:'idle', progress:0, compute:'0T', outputs:[], desc:'绑定角色骨骼' },
]

const PIPES = [
  { from:'data_oracle', to:'knowledge_eng', label:'原始数据' },
  { from:'knowledge_eng', to:'director', label:'知识图谱' },
  { from:'knowledge_eng', to:'worldbuild', label:'背景设定' },
  { from:'director', to:'level', label:'设计规范' },
  { from:'director', to:'art', label:'美术指导' },
  { from:'worldbuild', to:'narrative', label:'故事圣经' },
  { from:'worldbuild', to:'art', label:'视觉参考' },
  { from:'level', to:'tech', label:'关卡数据' },
  { from:'art', to:'tech', label:'美术资源' },
  { from:'narrative', to:'evaluator', label:'内容质检' },
  { from:'tech', to:'evaluator', label:'构建测试' },
]

const STATUS_TEXT = { done:'已完成', thinking:'思考中', generating:'生成中', idle:'待命中', error:'异常' }
const STATUS_COLOR = { done:C.cat_ops, thinking:C.cat_creative, generating:C.cat_input, idle:C.faint, error:C.cat_quality }

// ── 流程状态机 ──
const FLOW_STAGES = [
  { id:'req', name:'需求分析', status:'done' },
  { id:'parse', name:'教材解析', status:'done' },
  { id:'design', name:'方案设计', status:'active' },
  { id:'content', name:'内容生成', status:'pending' },
  { id:'asset', name:'资源制作', status:'pending' },
  { id:'dev', name:'开发实现', status:'pending' },
  { id:'test', name:'测试优化', status:'pending' },
]

// ── 教材数据 ──
const TEXTBOOK = {
  name:'人教版五年级数学上册', progress:85, cover:'📘',
  chapters:6, points:128,
  tags:['小数算法','图形面积','分数运算','统计图表','方程应用'],
}

// ── 知识图谱节点 ──
const KG_NODES = [
  { id:'frac', label:'分数', x:40, y:80, type:'base' },
  { id:'ratio', label:'比例', x:120, y:40, type:'core' },
  { id:'app', label:'应用题', x:200, y:80, type:'core' },
  { id:'game', label:'游戏任务', x:280, y:40, type:'apply' },
  { id:'area', label:'图形面积', x:40, y:150, type:'base' },
  { id:'stat', label:'统计', x:160, y:150, type:'core' },
]
const KG_LINKS = [
  { from:'frac', to:'ratio' }, { from:'ratio', to:'app' },
  { from:'app', to:'game' }, { from:'area', to:'stat' },
]

// ── 干预模式 ──
const CONTROL_MODES = [
  { id:'auto', name:'全自动', desc:'AI自主完成全部设计' },
  { id:'suggest', name:'建议确认', desc:'AI生成方案后等待用户确认' },
  { id:'key', name:'关键确认', desc:'AI自主执行普通任务，重要决策请求人工批准' },
  { id:'manual', name:'全程干预', desc:'用户参与每个步骤' },
]
const APPROVAL_ITEMS = [
  { label:'玩法方案', checked:true }, { label:'关卡设计', checked:true },
  { label:'美术风格', checked:true }, { label:'剧情内容', checked:false },
  { label:'教学目标', checked:true },
]

// ── 偏好设置 ──
const ART_STYLES = [
  { id:'cartoon', name:'卡通', emoji:'🎨' },
  { id:'pixel', name:'像素', emoji:'👾' },
  { id:'realistic', name:'写实', emoji:'📷' },
  { id:'handdrawn', name:'手绘', emoji:'✏️' },
]
const INTERACTION_TYPES = ['点击','拖拽','探索','战斗','建造']

// ── AI建议 ──
const AI_SUGGESTIONS = [
  { title:'增加实践场景', text:'根据教材分析，当前游戏缺少实践场景。建议增加「城市建设模拟任务」，预计提升学习效果 23%', color:C.cat_creative },
  { title:'调整难度曲线', text:'第5关难度骤升，建议在3-4关之间增加过渡关卡，平滑难度曲线', color:C.cat_audio },
]

// ── AI会议室 ──
const WAR_LOG = [
  { agent:'游戏总监', text:'建议降低战斗复杂度', time:'10:32' },
  { agent:'教育专家', text:'目标年龄8-12岁，认知负荷需控制', time:'10:33' },
  { agent:'关卡设计', text:'单关控制在5分钟以内', time:'10:34' },
  { agent:'美术总监', text:'视觉风格改为低多边形', time:'10:35' },
  { agent:'系统', text:'最终决策：方案B 采用', time:'10:36', isDecision:true },
]
const VOTES = [
  { opt:'方案A：复杂战斗', n:3, voters:'🎯 ⚙ 🔧' },
  { opt:'方案B：简化探索', n:7, voters:'📚 🌍 🎨 📖 🎵 📊 🧠', adopted:true },
]

// ── 开发阶段 ──
const PHASES = [
  { p:'概念', pct:100, st:'done', icon:'💡' },
  { p:'预制作', pct:85, st:'active', icon:'📋' },
  { p:'原型', pct:45, st:'active', icon:'🔧' },
  { p:'垂直切片', pct:0, st:'pending', icon:'🎯' },
  { p:'Alpha', pct:0, st:'pending', icon:'α' },
  { p:'Beta', pct:0, st:'pending', icon:'β' },
  { p:'发布', pct:0, st:'pending', icon:'🚀' },
]

// ═══════════════════════════════════════════════════════════
// 基础组件
// ═══════════════════════════════════════════════════════════

function StatusOrb({ status }) {
  const c = STATUS_COLOR[status] || C.faint
  return html`<span class="as6-orb" style=${{ background:c, boxShadow:`0 0 8px ${c}` }}></span>`
}

function ProgressRing({ progress, color, size }) {
  const s = size || 48, r = (s-8)/2, circ = 2*Math.PI*r
  const offset = circ - (progress/100)*circ
  return html`
    <svg width=${s} height=${s} viewBox=${`0 0 ${s} ${s}`} class="as6-ring">
      <circle cx=${s/2} cy=${s/2} r=${r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
      <circle cx=${s/2} cy=${s/2} r=${r} fill="none" stroke=${color} strokeWidth="3"
        strokeDasharray=${circ} strokeDashoffset=${offset} strokeLinecap="round"
        transform=${`rotate(-90 ${s/2} ${s/2})`}
        style=${{ filter:`drop-shadow(0 0 3px ${color})`, transition:'stroke-dashoffset 0.6s ease' }} />
    </svg>`
}

function Avatar({ agent, size }) {
  const sz = size || 40, cat = CAT_INFO[agent.cat]
  return html`
    <div class="as6-avatar" style=${{ width:sz+'px', height:sz+'px', borderColor:cat.color, boxShadow:`0 0 8px ${cat.color}30` }}>
      <img src=${`assets/agents/${agent.img}`} alt=${agent.name} class="as6-avatar-img" />
    </div>`
}

// ── 自动定位算法 ──
function findFreePosition(agents, px, py) {
  const W = 170, H = 110, gap = 25
  const collide = (x, y) => agents.some(a => {
    const dx = Math.abs((a.x||0) - x), dy = Math.abs((a.y||0) - y)
    return dx < W + gap && dy < H + gap
  })
  if (!collide(px, py)) return { x: Math.max(0, Math.round(px)), y: Math.max(0, Math.round(py)) }
  for (let r = 1; r < 12; r++) {
    for (let a = 0; a < 360; a += 30) {
      const rad = a * Math.PI / 180
      const tx = px + r * (W + gap) * Math.cos(rad)
      const ty = py + r * (H + gap) * Math.sin(rad) * 0.7
      if (tx < 0 || ty < 0 || tx > 720 || ty > 380) continue
      if (!collide(tx, ty)) return { x: Math.round(tx), y: Math.round(ty) }
    }
  }
  return { x: Math.round(px), y: Math.round(py) }
}

// ═══════════════════════════════════════════════════════════
// ① 指挥中心
// ═══════════════════════════════════════════════════════════

function CommandBar() {
  return html`
    <div class="as6-cmd-bar">
      <div class="as6-cmd-left">
        <div class="as6-cmd-icon">◆</div>
        <div>
          <div class="as6-cmd-name">山海经：洪荒纪元</div>
          <div class="as6-cmd-genre">神话RPG · 教育游戏</div>
        </div>
      </div>
      <div class="as6-cmd-center">
        ${[{label:'世界观',val:92},{label:'战斗',val:74},{label:'美术',val:61},{label:'音频',val:32},{label:'测试',val:12}].map(w => html`
          <div key=${w.label} class="as6-wstat">
            <span class="as6-wstat-label">${w.label}</span>
            <div class="as6-wstat-bar"><div class="as6-wstat-fill" style=${{width:w.val+'%'}}></div></div>
            <span class="as6-wstat-val">${w.val}%</span>
          </div>
        `)}
      </div>
      <div class="as6-cmd-right">
        <div class="as6-team-info"><span class="as6-pulse"></span><span class="as6-team-count">12 在线</span></div>
      </div>
    </div>`
}

// ═══════════════════════════════════════════════════════════
// ② 武器库（左侧 — 搜索 + 分类 + 展开）
// ═══════════════════════════════════════════════════════════

function Armory({ selectedAgent, onSelectAgent, canvasAgents }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const onCanvasIds = new Set(canvasAgents.map(a => a.id))

  const filtered = AGENTS.filter(a => {
    if (filter !== 'all' && a.cat !== filter) return false
    if (search && !a.name.includes(search) && !a.desc.includes(search)) return false
    return true
  })

  return html`
    <div class="as6-armory">
      <div class="as6-armory-header">
        <span class="as6-armory-title">牛马中心</span>
        <span class="as6-armory-sub">${filtered.length} / ${AGENTS.length}</span>
      </div>
      <div class="as6-search-wrap">
        <input class="as6-search-input" type="text" placeholder="搜索智能体..." value=${search}
          onInput=${(e) => setSearch(e.target.value)} />
      </div>
      <div class="as6-filter-row">
        <span class=${`as6-filter-chip ${filter==='all'?'as6-filter-active':''}`} onClick=${()=>setFilter('all')}>全部 ${AGENTS.length}</span>
        ${Object.entries(CAT_INFO).map(([k, info]) => {
          const cnt = AGENTS.filter(a => a.cat === k).length
          return html`<span key=${k} class=${`as6-filter-chip ${filter===k?'as6-filter-active':''}`}
            style=${{ '--cat': info.color }} onClick=${()=>setFilter(k)}>${info.label} ${cnt}</span>`
        })}
      </div>
      <div class="as6-armory-list">
        ${filtered.map(agent => {
          const cat = CAT_INFO[agent.cat]
          const isOn = onCanvasIds.has(agent.id)
          const isSel = selectedAgent === agent.id
          const isExp = expanded === agent.id
          return html`
            <div key=${agent.id} class=${`as6-card ${isSel?'as6-card-sel':''} ${isExp?'as6-card-exp':''}`}
              style=${{ '--cat-color': cat.color }}
              onClick=${() => { onSelectAgent(agent.id); setExpanded(isExp ? null : agent.id) }}>
              <div class="as6-card-glow"></div>
              <div class="as6-card-top">
                <${Avatar} agent=${agent} size=${48} />
                <div class="as6-card-info">
                  <div class="as6-card-name">${agent.name}</div>
                  <div class="as6-card-cat" style=${{color:cat.color}}>${cat.label} · ${STATUS_TEXT[agent.status]}</div>
                </div>
                <${StatusOrb} status=${agent.status} />
                <span class="as6-card-toggle">${isExp ? '▾' : '▸'}</span>
                <span class="as6-card-drag" draggable=${true} title="拖拽到画布"
                  onDragStart=${(e) => { e.dataTransfer.setData('text/plain', agent.id); e.dataTransfer.effectAllowed = 'copy' }}>⠿</span>
              </div>
              ${isExp ? html`
                <div class="as6-card-detail">
                  <div class="as6-card-desc">${agent.desc}</div>
                  <div class="as6-card-meta">
                    <span class="as6-card-meta-item">算力 ${agent.compute}</span>
                    <span class="as6-card-meta-item">进度 ${agent.progress}%</span>
                  </div>
                  ${agent.outputs.length > 0 ? html`
                    <div class="as6-card-outs">
                      ${agent.outputs.map(o => html`<span key=${o} class="as6-card-out">▸ ${o}</span>`)}
                    </div>` : null}
                  <div class="as6-card-hint">${isOn ? '✓ 已部署到画布' : '⬇ 拖拽到画布部署'}</div>
                </div>` : null}
            </div>`
        })}
      </div>
    </div>`
}

// ═══════════════════════════════════════════════════════════
// ③ 蓝图画布（中央 — 自动定位 + 牵引线）
// ═══════════════════════════════════════════════════════════

function BlueprintCanvas({ selectedAgent, onSelectAgent, canvasAgents, onDropAgent, connections, onAddConnection }) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({x:0, y:0})
  const [isDragging, setIsDragging] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [dragConn, setDragConn] = useState(null)
  const dragStart = useRef({x:0, y:0, panX:0, panY:0})
  const canvasRef = useRef(null)
  const isLockedRef = useRef(false)
  useEffect(() => { isLockedRef.current = isLocked }, [isLocked])

  // Native wheel listener with passive:false so preventDefault works
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const handler = (e) => {
      if (isLockedRef.current) return
      if (!e.ctrlKey) return
      e.preventDefault()
      e.stopPropagation()
      setZoom(z => Math.max(0.4, Math.min(2.5, z * (e.deltaY > 0 ? 0.9 : 1.1))))
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  const onMouseDown = (e) => {
    if (isLocked) return
    if (e.target.classList.contains('as6-canvas') || e.target.classList.contains('as6-canvas-grid') || e.target.classList.contains('as6-canvas-content')) {
      setIsDragging(true); dragStart.current = {x:e.clientX, y:e.clientY, panX:pan.x, panY:pan.y}
    }
  }
  const onMouseMove = (e) => {
    if (isDragging && !isLocked) {
      setPan({x:dragStart.current.panX + e.clientX - dragStart.current.x, y:dragStart.current.panY + e.clientY - dragStart.current.y})
    }
    if (dragConn) {
      const rect = e.currentTarget.getBoundingClientRect()
      setDragConn(dc => ({...dc, mx:(e.clientX - rect.left - pan.x)/zoom, my:(e.clientY - rect.top - pan.y)/zoom}))
    }
  }
  const onMouseUp = (e) => {
    setIsDragging(false)
    if (dragConn) {
      const target = e.target.closest('.as6-node')
      if (target) {
        const targetId = target.dataset.agentId
        if (targetId && targetId !== dragConn.from) { onAddConnection(dragConn.from, targetId) }
      }
      setDragConn(null)
    }
  }
  const zoomIn = () => setZoom(z => Math.min(2.5, z*1.2))
  const zoomOut = () => setZoom(z => Math.max(0.4, z*0.83))
  const resetView = () => { setZoom(1); setPan({x:0, y:0}) }

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    if (isLocked) return
    const agentId = e.dataTransfer.getData('text/plain')
    if (agentId) {
      const rect = e.currentTarget.getBoundingClientRect()
      const rawX = (e.clientX - rect.left - pan.x) / zoom - 80
      const rawY = (e.clientY - rect.top - pan.y) / zoom - 50
      const pos = findFreePosition(canvasAgents, rawX, rawY)
      onDropAgent(agentId, pos.x, pos.y)
    }
  }

  const startConn = (e, agentId) => {
    e.stopPropagation(); e.preventDefault()
    if (isLocked) return
    const rect = e.currentTarget.closest('.as6-canvas').getBoundingClientRect()
    const node = e.currentTarget.closest('.as6-node')
    const nodeRect = node.getBoundingClientRect()
    setDragConn({from: agentId, mx:(nodeRect.left + nodeRect.width/2 - rect.left - pan.x)/zoom, my:(nodeRect.top - rect.top - pan.y)/zoom})
  }

  const allConns = [...PIPES, ...connections]

  return html`
    <div class="as6-canvas-wrap">
      <div class="as6-canvas-header">
        <span class="as6-canvas-title">蓝图画布</span>
        <div class="as6-canvas-tools">
          <button class="as6-tool-btn" onClick=${zoomIn} disabled=${isLocked}>⊕</button>
          <button class="as6-tool-btn" onClick=${zoomOut} disabled=${isLocked}>⊖</button>
          <button class="as6-tool-btn" onClick=${resetView} disabled=${isLocked}>⊞</button>
          <span class="as6-zoom-label">${Math.round(zoom*100)}%</span>
          <div class="as6-tool-div"></div>
          <button class=${`as6-tool-btn ${isLocked?'as6-locked':''}`} onClick=${() => setIsLocked(!isLocked)}
            title=${isLocked?'解锁':'锁定'}>${isLocked?'🔒':'🔓'}</button>
        </div>
      </div>
      ${dragConn ? html`<div class="as6-conn-hint">拖拽牵引线到目标智能体 · 松开完成连接</div>` : null}
      <div ref=${canvasRef} class=${`as6-canvas ${isDragging?'as6-grabbing':''} ${isLocked?'as6-locked-c':''} ${dragOver?'as6-dragover':''}`}
        onMouseDown=${onMouseDown} onMouseMove=${onMouseMove} onMouseUp=${onMouseUp} onMouseLeave=${onMouseUp}
        onDrop=${onDrop} onDragOver=${(e)=>{e.preventDefault();setDragOver(true)}} onDragLeave=${()=>setDragOver(false)}
        onClick=${(e) => { if(!dragConn && (e.target.classList.contains('as6-canvas')||e.target.classList.contains('as6-canvas-grid')||e.target.classList.contains('as6-canvas-content'))) onSelectAgent(null) }}>
        <div class="as6-canvas-grid"></div>
        ${isLocked ? html`<div class="as6-lock-ovl"></div>` : null}
        ${dragOver ? html`<div class="as6-drop-hint">⬇ 放置智能体（自动定位）</div>` : null}
        <div class="as6-canvas-content" style=${{transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`, transformOrigin:'0 0'}}>
          <svg class="as6-pipes" viewBox="0 0 880 460">
            <defs><filter id="as6-glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
            ${allConns.map((p, i) => {
              const from = canvasAgents.find(a => a.id === p.from), to = canvasAgents.find(a => a.id === p.to)
              if (!from || !to) return null
              const x1 = (from.x||0)+80, y1 = (from.y||0)+35, x2 = to.x||0, y2 = (to.y||0)+35
              const mx = (x1+x2)/2, path = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`
              const fc = CAT_INFO[from.cat].color
              return html`<g key=${'c'+i}>
                <path d=${path} fill="none" stroke=${fc} strokeOpacity="0.15" strokeWidth="1.5" />
                <path d=${path} fill="none" stroke=${fc} strokeOpacity="0.5" strokeWidth="1.5" filter="url(#as6-glow)" strokeDasharray="4 6" style=${{animation:'as6-flow 2s linear infinite', animationDelay:`${i*0.2}s`}} />
                <circle r="3" fill=${fc} filter="url(#as6-glow)"><animateMotion dur=${`${2+i*0.3}s`} repeatCount="indefinite" path=${path} /></circle>
              </g>`
            })}
            ${dragConn ? (() => {
              const from = canvasAgents.find(a => a.id === dragConn.from)
              if (!from) return null
              const x1 = (from.x||0)+160, y1 = (from.y||0)+35
              const mx = (x1+dragConn.mx)/2, path = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${dragConn.my}, ${dragConn.mx} ${dragConn.my}`
              return html`<path d=${path} fill="none" stroke=${C.accent} strokeWidth="2" strokeDasharray="5 5" opacity="0.7" />`
            })() : null}
          </svg>
          ${canvasAgents.map(agent => {
            const cat = CAT_INFO[agent.cat], isSel = selectedAgent === agent.id
            return html`
              <div key=${agent.id} class=${`as6-node ${isSel?'as6-node-sel':''} ${dragConn&&dragConn.from===agent.id?'as6-node-conn':''}`}
                data-agent-id=${agent.id}
                style=${{left:(agent.x||0)+'px', top:(agent.y||0)+'px', '--cat-color':cat.color}}
                onClick=${(e) => { if(!dragConn) { e.stopPropagation(); onSelectAgent(agent.id) } }}>
                <div class="as6-node-glow" style=${{background:`radial-gradient(circle, ${cat.color}18, transparent 70%)`}}></div>
                <div class="as6-node-hdr"><${Avatar} agent=${agent} size=${32} /><span class="as6-node-name" style=${{color:cat.color}}>${agent.name}</span><${StatusOrb} status=${agent.status} /></div>
                <div class="as6-node-ring"><${ProgressRing} progress=${agent.progress} color=${cat.color} size=${40} /><span class="as6-node-pct" style=${{color:cat.color}}>${agent.progress}%</span></div>
                ${agent.outputs.length > 0 ? html`<div class="as6-node-outs">${agent.outputs.slice(0,2).map(o => html`<span key=${o} class="as6-node-out">▸ ${o}</span>`)}</div>` : null}
                <div class=${`as6-conn-dot ${dragConn&&dragConn.from===agent.id?'as6-conn-dot-active':''}`} onMouseDown=${(e)=>startConn(e, agent.id)} title="拖拽连接"></div>
              </div>`
          })}
        </div>
      </div>
    </div>`
}

// ═══════════════════════════════════════════════════════════
// ④ AI 总监控制台（右侧 — 5个模块）
// ═══════════════════════════════════════════════════════════

function DirectorPanel({ controlMode, onControlModeChange }) {
  const [expandedStage, setExpandedStage] = useState(null)
  const [approvals, setApprovals] = useState(APPROVAL_ITEMS)

  const toggleApproval = (i) => {
    const next = [...approvals]
    next[i] = { ...next[i], checked: !next[i].checked }
    setApprovals(next)
  }

  return html`
    <div class="as6-director">
      <div class="as6-dir-header">
        <span class="as6-dir-title">AI 总监控制台</span>
        <span class="as6-dir-sub">Director Control Panel</span>
      </div>
      <div class="as6-dir-scroll">

        <!-- 模块1：流程状态机 -->
        <div class="as6-dir-mod">
          <div class="as6-dir-mod-hdr"><span class="as6-dir-mod-title">流程状态机</span><span class="as6-dir-mod-sub">当前：核心玩法设计</span></div>
          <div class="as6-flow">
            ${FLOW_STAGES.map((s, i) => html`
              <div key=${s.id} class="as6-flow-item">
                <div class=${`as6-flow-node as6-flow-${s.status}`} onClick=${() => setExpandedStage(expandedStage === s.id ? null : s.id)}>
                  <span class="as6-flow-icon">${s.status==='done'?'✓':s.status==='active'?'●':s.status==='error'?'!':'○'}</span>
                  <span class="as6-flow-name">${s.name}</span>
                </div>
                ${i < FLOW_STAGES.length - 1 ? html`<div class="as6-flow-line"><span class="as6-flow-particle"></span></div>` : null}
              </div>
            `)}
          </div>
          ${expandedStage ? html`
            <div class="as6-flow-detail">
              ${(() => { const s = FLOW_STAGES.find(f => f.id === expandedStage); return html`
                <div class="as6-flow-detail-title">${s.name} · ${s.status==='done'?'已完成':s.status==='active'?'执行中':'待执行'}</div>
                <div class="as6-flow-tasks">
                  <div class="as6-flow-task">▸ 输入文件：八年级物理.pdf</div>
                  <div class="as6-flow-task">▸ AI分析结果：126个知识点已识别</div>
                  <div class="as6-flow-task">▸ 生成内容：知识图谱 + 难度曲线</div>
                  <div class="as6-flow-task">▸ 下一步：方案设计阶段</div>
                </div>`})()}
            </div>` : null}
        </div>

        <!-- 模块2：教材解析 -->
        <div class="as6-dir-mod">
          <div class="as6-dir-mod-hdr"><span class="as6-dir-mod-title">教材解析</span><span class="as6-dir-mod-sub">知识引擎</span></div>
          <div class="as6-tb-card">
            <div class="as6-tb-cover">${TEXTBOOK.cover}</div>
            <div class="as6-tb-info">
              <div class="as6-tb-name">${TEXTBOOK.name}</div>
              <div class="as6-tb-stats">${TEXTBOOK.chapters} 章节 · ${TEXTBOOK.points} 知识点</div>
              <div class="as6-tb-progress"><div class="as6-tb-bar"><div class="as6-tb-fill" style=${{width:TEXTBOOK.progress+'%'}}></div></div><span class="as6-tb-pct">${TEXTBOOK.progress}%</span></div>
            </div>
          </div>
          <div class="as6-tb-tags">${TEXTBOOK.tags.map(t => html`<span key=${t} class="as6-tb-tag">${t}</span>`)}</div>
          <div class="as6-kg">
            <div class="as6-kg-label">知识图谱</div>
            <svg class="as6-kg-svg" viewBox="0 0 340 200">
              <defs><filter id="kg-glow"><feGaussianBlur stdDeviation="2"/></filter></defs>
              ${KG_LINKS.map((l, i) => {
                const from = KG_NODES.find(n => n.id === l.from), to = KG_NODES.find(n => n.id === l.to)
                return html`<line key=${'l'+i} x1=${from.x} y1=${from.y} x2=${to.x} y2=${to.y} stroke="rgba(168,85,247,0.2)" strokeWidth="1" />`
              })}
              ${KG_NODES.map(n => {
                const c = n.type==='base'?'#06b6d4':n.type==='core'?'#a855f7':'#22c55e'
                return html`
                  <g key=${n.id}>
                    <circle cx=${n.x} cy=${n.y} r="14" fill=${c+'20'} stroke=${c} strokeWidth="1.5" style=${{filter:`drop-shadow(0 0 3px ${c}40)`}} />
                    <text x=${n.x} y=${n.y+3} fill=${c} fontSize="9" textAnchor="middle" font-weight="700">${n.label}</text>
                  </g>`
              })}
            </svg>
          </div>
        </div>

        <!-- 模块3：用户干预 -->
        <div class="as6-dir-mod">
          <div class="as6-dir-mod-hdr"><span class="as6-dir-mod-title">用户干预</span><span class="as6-dir-mod-sub">AI权限管理</span></div>
          <div class="as6-modes">
            ${CONTROL_MODES.map(m => html`
              <label key=${m.id} class=${`as6-mode ${controlMode===m.id?'as6-mode-sel':''}`} onClick=${() => onControlModeChange(m.id)}>
                <span class="as6-radio ${controlMode===m.id?'as6-radio-on':''}"></span>
                <div><div class="as6-mode-name">${m.name}</div><div class="as6-mode-desc">${m.desc}</div></div>
              </label>
            `)}
          </div>
          <div class="as6-approve">
            <div class="as6-approve-label">需要确认的节点</div>
            ${approvals.map((item, i) => html`
              <label key=${i} class="as6-approve-item" onClick=${() => toggleApproval(i)}>
                <span class=${`as6-check ${item.checked?'as6-check-on':''}`}>${item.checked?'✓':''}</span>
                <span class="as6-approve-text">${item.label}</span>
              </label>
            `)}
          </div>
        </div>

      </div>
    </div>`
}

// ═══════════════════════════════════════════════════════════
// ③b 项目偏好面板（独立模块）
// ═══════════════════════════════════════════════════════════

function PreferencePanel() {
  const [artStyle, setArtStyle] = useState('cartoon')
  const [difficulty, setDifficulty] = useState(50)
  const [ageGroup, setAgeGroup] = useState('小学高年级')
  const [duration, setDuration] = useState(30)
  const [interactions, setInteractions] = useState(new Set(['点击','探索']))
  const [specialReq, setSpecialReq] = useState('')
  const [suggestionState, setSuggestionState] = useState({})

  const toggleInteraction = (t) => {
    const next = new Set(interactions)
    next.has(t) ? next.delete(t) : next.add(t)
    setInteractions(next)
  }

  const adoptSuggestion = (i) => setSuggestionState(s => ({ ...s, [i]: 'adopted' }))

  return html`
    <div class="as6-pref-panel">
      <div class="as6-pref-panel-header">
        <span class="as6-dir-title">项目偏好设置</span>
        <span class="as6-dir-sub">AI创作方向控制</span>
      </div>
      <div class="as6-pref-panel-body">
        <div class="as6-pref-cols">
          <div class="as6-pref-col">
            <div class="as6-pref-row">
              <span class="as6-pref-label">游戏类型</span>
              <select class="as6-pref-select"><option>RPG冒险</option><option>模拟经营</option><option>解谜探索</option><option>沙盒创造</option></select>
            </div>
            <div class="as6-pref-row">
              <span class="as6-pref-label">难度等级</span>
              <div class="as6-slider-wrap"><input type="range" min="0" max="100" value=${difficulty} onInput=${(e)=>setDifficulty(parseInt(e.target.value))} class="as6-slider" /><span class="as6-slider-val">${difficulty<33?'简单':difficulty<66?'中等':'困难'}</span></div>
            </div>
            <div class="as6-pref-row">
              <span class="as6-pref-label">目标年龄</span>
              <div class="as6-age-opts">${['小学低年级','小学高年级','初中','高中'].map(a => html`<span key=${a} class=${`as6-age-opt ${ageGroup===a?'as6-age-sel':''}`} onClick=${()=>setAgeGroup(a)}>${a}</span>`)}</div>
            </div>
            <div class="as6-pref-row">
              <span class="as6-pref-label">游戏时长</span>
              <div class="as6-slider-wrap"><input type="range" min="10" max="60" step="5" value=${duration} onInput=${(e)=>setDuration(parseInt(e.target.value))} class="as6-slider" /><span class="as6-slider-val">${duration}分钟</span></div>
            </div>
          </div>
          <div class="as6-pref-col">
            <div class="as6-pref-row">
              <span class="as6-pref-label">美术风格</span>
              <div class="as6-art-opts">${ART_STYLES.map(s => html`<div key=${s.id} class=${`as6-art-card ${artStyle===s.id?'as6-art-sel':''}`} onClick=${()=>setArtStyle(s.id)}><span class="as6-art-emoji">${s.emoji}</span><span class="as6-art-name">${s.name}</span></div>`)}</div>
            </div>
            <div class="as6-pref-row">
              <span class="as6-pref-label">互动方式</span>
              <div class="as6-int-opts">${INTERACTION_TYPES.map(t => html`<span key=${t} class=${`as6-int-tag ${interactions.has(t)?'as6-int-on':''}`} onClick=${()=>toggleInteraction(t)}>${t}</span>`)}</div>
            </div>
            <div class="as6-pref-row as6-pref-row-textarea">
              <span class="as6-pref-label">特殊需求</span>
              <textarea class="as6-pref-textarea" placeholder="例如：增加多人合作模式..." value=${specialReq} onInput=${(e)=>setSpecialReq(e.target.value)} rows="2"></textarea>
            </div>
          </div>
        </div>
        <div class="as6-sug-section">
          <div class="as6-dir-mod-hdr"><span class="as6-dir-mod-title">AI 建议</span><span class="as6-dir-mod-sub">导演提醒</span></div>
          <div class="as6-sug-list">
            ${AI_SUGGESTIONS.map((sug, i) => {
              const state = suggestionState[i]
              return html`
                <div key=${i} class=${`as6-sug-card ${state==='adopted'?'as6-sug-adopted':''}`} style=${{borderColor: sug.color+'30'}}>
                  <div class="as6-sug-head"><span class="as6-sug-badge" style=${{background:sug.color+'15', color:sug.color}}>AI建议</span><span class="as6-sug-title">${sug.title}</span></div>
                  <div class="as6-sug-text">${sug.text}</div>
                  ${state !== 'adopted' ? html`
                    <div class="as6-sug-actions">
                      <button class="as6-sug-adopt" style=${{background:sug.color+'15', borderColor:sug.color+'40', color:sug.color}} onClick=${()=>adoptSuggestion(i)}>采纳建议</button>
                      <button class="as6-sug-ignore">忽略</button>
                    </div>` : html`<div class="as6-sug-done">✓ 已采纳</div>`}
                </div>`
            })}
          </div>
        </div>
      </div>
    </div>`
}

// ═══════════════════════════════════════════════════════════
// ⑤ AI会议室（左下）
// ═══════════════════════════════════════════════════════════

function WarRoom() {
  return html`
    <div class="as6-module">
      <div class="as6-mod-hdr"><span class="as6-mod-title">AI 会议室</span><span class="as6-mod-sub">团队决策</span></div>
      <div class="as6-war-log">
        ${WAR_LOG.map((msg, i) => html`
          <div key=${i} class=${`as6-war-msg ${msg.isDecision?'as6-war-dec':''}`}>
            <div class="as6-war-head"><span class="as6-war-agent">${msg.agent}</span><span class="as6-war-time">${msg.time}</span></div>
            <div class="as6-war-text">${msg.text}</div>
          </div>`)}
      </div>
      <div class="as6-voting">
        <div class="as6-vote-label">团队投票</div>
        ${VOTES.map(v => html`
          <div key=${v.opt} class=${`as6-vote-opt ${v.adopted?'as6-vote-adopted':''}`}>
            <div class="as6-vote-head"><span class="as6-vote-name">${v.opt}</span>${v.adopted?html`<span class="as6-vote-badge">已采用</span>`:null}</div>
            <div class="as6-vote-bar-w"><div class="as6-vote-bar" style=${{width:(v.n/10*100)+'%'}}></div></div>
            <div class="as6-vote-foot"><span class="as6-vote-count">▲ ${v.n} 票</span><span class="as6-vote-voters">${v.voters}</span></div>
          </div>`)}
      </div>
    </div>`
}

// ═══════════════════════════════════════════════════════════
// ⑥ 开发时间线
// ═══════════════════════════════════════════════════════════

function ProdTimeline() {
  return html`
    <div class="as6-module">
      <div class="as6-mod-hdr"><span class="as6-mod-title">开发时间线</span><span class="as6-mod-sub">开发流程</span></div>
      <div class="as6-tl-phases">
        ${PHASES.map((p, i) => html`
          <div key=${p.p} class=${`as6-tl-phase as6-tl-${p.st}`}>
            <div class="as6-tl-icon">${p.icon}</div>
            <div class="as6-tl-name">${p.p}</div>
            ${p.pct > 0 ? html`<div class="as6-tl-pct">${p.pct}%</div><div class="as6-tl-bar"><div class="as6-tl-fill" style=${{width:p.pct+'%'}}></div></div>` : null}
            ${i < PHASES.length - 1 ? html`<div class="as6-tl-conn"></div>` : null}
          </div>`)}
      </div>
    </div>`
}

// ═══════════════════════════════════════════════════════════
// ⑦ 游戏预览
// ═══════════════════════════════════════════════════════════

function PlayablePreview() {
  return html`
    <div class="as6-module">
      <div class="as6-mod-hdr"><span class="as6-mod-title">游戏预览</span><span class="as6-mod-sub">实时试玩</span></div>
      <div class="as6-prev">
        <div class="as6-prev-vp">
          <div class="as6-prev-bg"></div>
          <div class="as6-prev-char">🧙</div>
          <div class="as6-prev-enemy">🐉</div>
          <div class="as6-prev-hud">
            <span class="as6-prev-hp">生命 ████████░░ 80</span>
            <span class="as6-prev-mp">灵力 ██████░░░░ 60</span>
            <span class="as6-prev-quest">▸ 收集五行碎片 (2/5)</span>
          </div>
          <button class="as6-prev-play">▶ 开始试玩</button>
        </div>
        <div class="as6-prev-info">
          <div class="as6-prev-stat"><span class="as6-prev-sk">场景</span><span class="as6-prev-sv">不周山巅</span></div>
          <div class="as6-prev-stat"><span class="as6-prev-sk">敌人</span><span class="as6-prev-sv">混沌巨兽 Lv.5</span></div>
          <div class="as6-prev-stat"><span class="as6-prev-sk">知识点</span><span class="as6-prev-sv">重力势能转换</span></div>
        </div>
      </div>
    </div>`
}

// ═══════════════════════════════════════════════════════════
// 主组件
// ═══════════════════════════════════════════════════════════

export default function AIStudio() {
  const { state, navigate, goStep, toast } = useApp()
  const [selectedAgent, setSelectedAgent] = useState('director')
  const [controlMode, setControlMode] = useState('key')
  const [canvasAgents, setCanvasAgents] = useState(AGENTS.filter(a => a.x !== undefined))
  const [connections, setConnections] = useState([])

  const material = state.material
  const gameplay = state.selectedGameplay
  const agentCount = (state.selectedAgents || []).length

  const handleDropAgent = (id, x, y) => {
    const agent = AGENTS.find(a => a.id === id)
    if (!agent) return
    setCanvasAgents(prev => {
      const ex = prev.find(a => a.id === id)
      if (ex) return prev.map(a => a.id === id ? {...a, x, y} : a)
      return [...prev, {...agent, x, y}]
    })
  }

  const handleAddConnection = (from, to) => {
    setConnections(prev => {
      if (prev.some(c => c.from === from && c.to === to)) return prev
      return [...prev, { from, to, label: '自定义' }]
    })
  }

  const startDevelop = () => {
    if (!material) {
      toast('请先上传教材', 'error')
      return
    }
    navigate(STEPS.WORKSPACE)
  }

  const adjustTeam = () => {
    goStep(STEPS.AGENTS)
  }

  return html`
    <div class="as6-page">
      <${NavBar} />
      <div class="as6-container">
        <div class="as6-title-bar">
          <div>
            <span class="as6-title-eyebrow">DIRECTOR CONTROL SYSTEM</span>
            <h1 class="as6-title">AI 总监控制台</h1>
            <p class="as6-subtitle">指挥 AI 游戏研发团队 · 从教材到游戏全流程自动化</p>
          </div>
          <div class="as6-version">v6.0 · HOLO OS</div>
        </div>

        <!-- 流程状态条：教材 + 玩法 + 团队 + 开发按钮 -->
        <div style=${{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          padding: '14px 20px', marginBottom: '16px',
          background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)',
          borderRadius: '12px', flexWrap: 'wrap',
        }}>
          <div style=${{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', flex: 1 }}>
            <!-- 教材状态 -->
            <div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style=${{ fontSize: '20px' }}>📚</span>
              <div>
                <div style=${{ fontSize: '10px', color: C.dim, textTransform: 'uppercase', letterSpacing: '0.05em' }}>教材</div>
                <div style=${{ fontSize: '13px', color: material ? C.text : C.faint, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  ${material ? (material.filename || material.structure?.[0]?.title || '已解析') : '未上传'}
                </div>
              </div>
            </div>
            <!-- 玩法状态 -->
            <div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style=${{ fontSize: '20px' }}>🎮</span>
              <div>
                <div style=${{ fontSize: '10px', color: C.dim, textTransform: 'uppercase', letterSpacing: '0.05em' }}>玩法</div>
                <div style=${{ fontSize: '13px', color: gameplay ? C.text : C.faint }}>
                  ${gameplay ? (gameplay.name || gameplay.type || '已选') : '未选择'}
                </div>
              </div>
            </div>
            <!-- 团队状态 -->
            <div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style=${{ fontSize: '20px' }}>👥</span>
              <div>
                <div style=${{ fontSize: '10px', color: C.dim, textTransform: 'uppercase', letterSpacing: '0.05em' }}>团队</div>
                <div style=${{ fontSize: '13px', color: agentCount > 0 ? C.text : C.faint }}>
                  ${agentCount > 0 ? `${agentCount} 位智能体` : '未组建'}
                </div>
              </div>
            </div>
          </div>
          <!-- 操作按钮 -->
          <div style=${{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick=${adjustTeam}
              style=${{
                padding: '8px 16px', fontSize: '13px', fontWeight: 600,
                background: 'transparent', border: '1px solid rgba(0,212,255,0.3)',
                color: C.accent, borderRadius: '8px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter=${(e) => { e.target.style.background = 'rgba(0,212,255,0.08)' }}
              onMouseLeave=${(e) => { e.target.style.background = 'transparent' }}>
              调整团队
            </button>
            <button onClick=${startDevelop}
              style=${{
                padding: '10px 24px', fontSize: '14px', fontWeight: 700,
                background: 'linear-gradient(135deg, #00d4ff, #00ff88)',
                border: 'none', color: '#050208', borderRadius: '8px',
                cursor: material ? 'pointer' : 'not-allowed',
                opacity: material ? 1 : 0.4,
                boxShadow: material ? '0 0 20px rgba(0,212,255,0.3)' : 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter=${(e) => { if (material) e.target.style.transform = 'scale(1.03)' }}
              onMouseLeave=${(e) => { e.target.style.transform = 'scale(1)' }}>
              开始开发 →
            </button>
          </div>
        </div>

        <${CommandBar} />
        <div class="as6-workspace">
          <${Armory} selectedAgent=${selectedAgent} onSelectAgent=${setSelectedAgent} canvasAgents=${canvasAgents} />
          <${BlueprintCanvas} selectedAgent=${selectedAgent} onSelectAgent=${setSelectedAgent} canvasAgents=${canvasAgents}
            onDropAgent=${handleDropAgent} connections=${connections} onAddConnection=${handleAddConnection} />
          <${DirectorPanel} controlMode=${controlMode} onControlModeChange=${setControlMode} />
        </div>
        <${PreferencePanel} />
        <div class="as6-bottom">
          <div class="as6-bottom-left"><${WarRoom} /></div>
          <div class="as6-bottom-right"><${ProdTimeline} /><${PlayablePreview} /></div>
        </div>
      </div>
      <${Footer} />
    </div>`
}
