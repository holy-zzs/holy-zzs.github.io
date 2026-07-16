// ═══════════════════════════════════════════════════════════
// 玩法推荐 (GameplayGacha) v4.0 — 统一紫调玻璃拟态 + 年龄段差异化
// 融合主页 #a78bfa 紫调 + 全息数据可视化 + 圆角 + 层次线条
// ═══════════════════════════════════════════════════════════
import { html, useContext, useState, useCallback } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'
import { NavBar } from './PlatformCommon.js?v=nav3'

// ── 设计令牌（融合主页紫调 + 全息精度）──
const T = {
  void: '#05010f',
  deep: '#0a0514',
  bgRadial: 'radial-gradient(ellipse at 50% 80%, #1e0f4d 0%, #0a0420 40%, #05010f 100%)',

  // 玻璃层（紫调，与主页一致）
  glass: 'rgba(255, 255, 255, 0.03)',
  glassHover: 'rgba(255, 255, 255, 0.06)',
  glassDeep: 'rgba(10, 5, 20, 0.5)',
  glassBorder: 'rgba(167, 139, 250, 0.12)',
  glassBorderBright: 'rgba(167, 139, 250, 0.3)',
  glassBorderActive: 'rgba(167, 139, 250, 0.5)',

  // 主色（主页品牌色系）
  primary: '#a78bfa',
  primaryDark: '#8b5cf6',
  cyan: '#00d4ff',
  pink: '#ec4899',
  green: '#34d399',
  gold: '#F5A623',
  amber: '#fbbf24',

  // 文字
  textBright: '#ffffff',
  textPrimary: '#f5e8ff',
  textSecondary: '#cbd5e1',
  textMuted: '#8b7da8',
  textDim: '#5d4f7a',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',
  divider: 'rgba(167, 139, 250, 0.1)',

  // 字体
  fontDisplay: "'Orbitron', 'Michroma', sans-serif",
  fontBody: "'Rajdhani', 'Inter', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', 'Consolas', monospace",
}

// ── 图片路径 ──
const IMG = (n) => `/assets/gameplay/image_${n}_yi19x4.jpg`
const SCENE = (age) => `/assets/gameplay/scene_${age}_1.jpg`

// ── 4 个年龄段完整数据 ──
const AGE_DATA = {
  // ════════ 小学 6-12岁 ════════
  primary: {
    label: '小学 6-12岁', icon: '🧒', accent: '#FF8A3D',
    subject: '小学科学', grade: '五年级上册', ageLabel: '10-11岁',
    kp: 126, exp: 23, match: 98,
    objs: ['培养学习兴趣与好奇心', '建立基础科学认知', '发展动手实践能力'],
    games: [
      { num:'01', type:'Adventure', name:'探索冒险', match:98, stars:5, effect:92,
        tags:['探索','收集','剧情','养成'],
        desc:'学生扮演探险家，在虚拟生态系统中寻找物种、记录生物关系，完成知识任务解锁新区域。',
        color:'#FF8A3D', img:IMG(2), radar:[98,95,92,92,68] },
      { num:'02', type:'Pet', name:'萌宠养成', match:96, stars:5, effect:90,
        tags:['养成','互动','进化','收集'],
        desc:'答对题目获得经验值，宠物逐步进化形态并解锁新技能，在互动中巩固知识点。',
        color:'#a78bfa', img:IMG(3), radar:[96,90,85,88,72] },
      { num:'03', type:'Rhythm', name:'节奏闯关', match:94, stars:4, effect:88,
        tags:['节奏','音乐','反应','连击'],
        desc:'跟着音乐节拍点击正确答案，连击获得倍率加分，视听联动强化记忆。',
        color:'#34d399', img:IMG(4), radar:[94,88,90,85,65] },
      { num:'04', type:'Parkour', name:'跑酷冒险', match:90, stars:4, effect:82,
        tags:['跑酷','计算','反应','加速'],
        desc:'角色自动奔跑，遇到障碍需快速算出答案才能跳跃通过，算对加速获得无敌金身。',
        color:'#ec4899', img:IMG(5), radar:[90,92,88,80,60] },
    ],
    dna: [
      { label:'感官刺激', pct:45, color:'#FF8A3D' },
      { label:'即时反馈', pct:30, color:'#a78bfa' },
      { label:'收集元素', pct:15, color:'#34d399' },
      { label:'探索元素', pct:10, color:'#ec4899' },
    ],
    team: [
      { name:'游戏策划师', role:'负责整体游戏设计', img:IMG(6) },
      { name:'教育专家', role:'确保知识准确性', img:IMG(0) },
      { name:'美术设计师', role:'创建视觉世界', img:IMG(7) },
      { name:'音效设计师', role:'设计听觉反馈', img:IMG(8) },
      { name:'测试分析师', role:'评估学习效果', img:IMG(9) },
      { name:'儿童心理顾问', role:'优化适龄体验', img:IMG(10) },
    ],
    advice: '基于教材分析，推荐选择「探索冒险」方案。该方案与生态系统的探索性学习高度匹配，能有效激发学生的好奇心与探究欲，知识覆盖度与学习效果均表现优异。',
  },

  // ════════ 中学 12-18岁 ════════
  junior: {
    label: '中学 12-18岁', icon: '👦', accent: '#3b82f6',
    subject: '初中生物', grade: '八年级', ageLabel: '13-15岁',
    kp: 186, exp: 45, match: 96,
    objs: ['巩固学科知识体系', '培养逻辑推理思维', '激发竞争合作意识'],
    games: [
      { num:'01', type:'PvP', name:'知识锦标赛', match:97, stars:5, effect:93,
        tags:['竞技','对战','排名','社交'],
        desc:'1V1 实时答题拆塔游戏，答对题目释放技能攻击对方防御塔，支持排位赛与好友对战。',
        color:'#3b82f6', img:SCENE('junior'), radar:[97,92,95,90,75] },
      { num:'02', type:'Escape', name:'学科密室逃脱', match:95, stars:5, effect:91,
        tags:['解谜','限时','推理','实验'],
        desc:'被困实验室，必须正确操作化学装置才能开门逃生，每关限时 8 分钟，错误 3 次触发警报。',
        color:'#a78bfa', img:IMG(4), radar:[95,88,85,92,78] },
      { num:'03', type:'Mystery', name:'悬疑剧本杀', match:89, stars:4, effect:85,
        tags:['角色扮演','推理','证据','剧情'],
        desc:'扮演历史人物，通过学科知识推理找出幕后真相，多分支剧情，不同选择导向不同结局。',
        color:'#ec4899', img:IMG(5), radar:[89,85,82,88,82] },
      { num:'04', type:'Card', name:'知识卡牌对战', match:85, stars:4, effect:80,
        tags:['卡牌','策略','构建','对战'],
        desc:'用知识点构建卡组，策略性出牌击败对手，每张卡牌对应一个知识模块，稀有度反映掌握度。',
        color:'#34d399', img:IMG(6), radar:[85,90,88,82,70] },
    ],
    dna: [
      { label:'竞技对战', pct:35, color:'#3b82f6' },
      { label:'逻辑推理', pct:30, color:'#a78bfa' },
      { label:'社交互动', pct:20, color:'#ec4899' },
      { label:'探索元素', pct:15, color:'#34d399' },
    ],
    team: [
      { name:'游戏策划师', role:'设计竞技机制', img:IMG(0) },
      { name:'学科专家', role:'把控知识深度', img:IMG(1) },
      { name:'剧情设计师', role:'构建叙事线', img:IMG(7) },
      { name:'系统设计师', role:'设计对战系统', img:IMG(8) },
      { name:'数值平衡师', role:'调整竞技平衡', img:IMG(9) },
      { name:'社交系统设计师', role:'设计排行榜', img:IMG(10) },
    ],
    advice: '基于教材分析，推荐选择「知识锦标赛」方案。该方案充分利用初中生的胜负欲和社交需求，将知识点转化为对战技能，在竞技中自然巩固学科知识，排行榜系统提供持续学习动力。',
  },

  // ════════ 大学 18-22岁 ════════
  senior: {
    label: '大学 18-22岁', icon: '🧑', accent: '#a78bfa',
    subject: '高中物理', grade: '高一', ageLabel: '16-18岁',
    kp: 256, exp: 68, match: 94,
    objs: ['理解复杂系统运作', '培养科学探究思维', '提升问题解决能力'],
    games: [
      { num:'01', type:'Strategy', name:'文明演化', match:95, stars:5, effect:92,
        tags:['策略','科技树','资源','宏观'],
        desc:'利用地理与政治知识分配资源、建设城市，从古代文明发展到未来科技，知识是推进科技树的关键。',
        color:'#a78bfa', img:SCENE('senior'), radar:[95,88,85,92,85] },
      { num:'02', type:'Tower Defense', name:'化学反应塔防', match:92, stars:5, effect:90,
        tags:['塔防','化学','配平','防御'],
        desc:'根据化学方程式配平方案布置不同属性炮塔，防御元素怪物入侵，配平越精确火力越强。',
        color:'#00d4ff', img:IMG(7), radar:[92,85,88,90,80] },
      { num:'03', type:'Simulation', name:'硬核飞行模拟', match:88, stars:4, effect:88,
        tags:['物理','飞行','轨道','硬核'],
        desc:'F=ma 成为飞船引擎推进的核心公式，玩家需理解牛顿第二定律才能操控飞船完成轨道计算。',
        color:'#34d399', img:IMG(8), radar:[88,82,80,92,88] },
      { num:'04', type:'Lab', name:'生物进化实验室', match:82, stars:4, effect:84,
        tags:['生物','进化','基因','模拟'],
        desc:'设计生物种群，观察自然选择和基因突变的效果，通过实验理解进化论的核心机制。',
        color:'#ec4899', img:IMG(9), radar:[82,85,78,88,75] },
    ],
    dna: [
      { label:'策略深度', pct:40, color:'#a78bfa' },
      { label:'系统构建', pct:25, color:'#00d4ff' },
      { label:'知识应用', pct:20, color:'#34d399' },
      { label:'创造性', pct:15, color:'#ec4899' },
    ],
    team: [
      { name:'系统架构师', role:'设计游戏系统', img:IMG(0) },
      { name:'学科专家', role:'确保学术严谨', img:IMG(1) },
      { name:'物理引擎工程师', role:'实现科学模拟', img:IMG(2) },
      { name:'数据分析师', role:'优化学习路径', img:IMG(3) },
      { name:'UI设计师', role:'设计专业界面', img:IMG(10) },
      { name:'QA工程师', role:'验证知识准确性', img:IMG(5) },
    ],
    advice: '基于教材分析，推荐选择「文明演化」方案。高中生逻辑能力强，需要掌控感和效率感。该方案将物理公式设为游戏世界的物理常数，允许玩家通过深度利用知识逻辑实现跨级挑战，系统复杂度足以支撑多种通关策略。',
  },

  // ════════ 成人 22+岁 ════════
  adult: {
    label: '成人 22+岁', icon: '🎓', accent: '#06B6D4',
    subject: '专业进修', grade: '通用', ageLabel: '22+岁',
    kp: 312, exp: 89, match: 92,
    objs: ['专业能力实战提升', '跨学科知识融合', '创新思维与决策训练'],
    games: [
      { num:'01', type:'Business', name:'CEO经营决策', match:94, stars:5, effect:92,
        tags:['经营','决策','财报','危机'],
        desc:'接手一家公司，通过分析财报和市场趋势做出经营决策，处理突发事件，每个决策都有多维度后果。',
        color:'#F5A623', img:SCENE('college'), radar:[94,85,88,92,82] },
      { num:'02', type:'Science', name:'量子纠缠实验', match:90, stars:4, effect:88,
        tags:['量子','实验','参数','观测'],
        desc:'在虚拟实验室调节参数，观察量子纠缠现象并记录数据，真实感优先于趣味性，贴近真实科研工作站。',
        color:'#06B6D4', img:IMG(9), radar:[90,80,75,90,88] },
      { num:'03', type:'Medical', name:'急诊室模拟', match:86, stars:4, effect:86,
        tags:['临床','诊断','急诊','决策'],
        desc:'模拟急诊室夜班，接收病人、问诊、检查、诊断的全流程，错误诊断触发不良事件并生成失败分析报告。',
        color:'#ec4899', img:IMG(10), radar:[86,88,92,88,85] },
      { num:'04', type:'Urban', name:'城市规划工作站', match:84, stars:4, effect:82,
        tags:['规划','优化','系统','工程'],
        desc:'在城市规划工作站中优化交通、人口、资源分配，决策必须有多维度后果，不能只有对错二元结果。',
        color:'#34d399', img:SCENE('adult'), radar:[84,82,85,86,80] },
    ],
    dna: [
      { label:'专业实战', pct:45, color:'#F5A623' },
      { label:'决策模拟', pct:25, color:'#06B6D4' },
      { label:'分析推理', pct:20, color:'#a78bfa' },
      { label:'创新思维', pct:10, color:'#ec4899' },
    ],
    team: [
      { name:'行业专家', role:'提供领域知识', img:IMG(1) },
      { name:'模拟系统设计师', role:'构建仿真环境', img:IMG(2) },
      { name:'数据科学家', role:'分析决策模型', img:IMG(3) },
      { name:'交互设计师', role:'设计专业交互', img:IMG(4) },
      { name:'评估专家', role:'设计评价体系', img:IMG(5) },
      { name:'场景架构师', role:'搭建实战场景', img:IMG(6) },
    ],
    advice: '基于教材分析，推荐选择「CEO经营决策」方案。成人学习者需要"这玩意儿有用"的真实感，该方案贴近真实工作站界面，决策有多维度后果，包含失败分析报告，让玩家在试错中深度学习专业知识。',
  },
}

// ── 年龄段 Tab ──
const AGE_TABS = [
  { id: 'primary', label: '小学', range: '6-12岁', icon: '🧒' },
  { id: 'junior', label: '中学', range: '12-18岁', icon: '👦' },
  { id: 'senior', label: '大学', range: '18-22岁', icon: '🧑' },
  { id: 'adult', label: '成人', range: '22+岁', icon: '🎓' },
]

// ── 雷达图 SVG ──
function RadarChart({ data, size = 220 }) {
  const labels = ['知识匹配', '趣味性', '互动性', '学习效果', '实施难度']
  const center = size / 2
  const maxRadius = size / 2 - 36
  const angles = labels.map((_, i) => (Math.PI * 2 * i) / labels.length - Math.PI / 2)
  const gridLevels = [0.25, 0.5, 0.75, 1.0]

  const points = (values) =>
    values.map((v, i) => {
      const r = (v / 100) * maxRadius
      return `${center + r * Math.cos(angles[i])},${center + r * Math.sin(angles[i])}`
    }).join(' ')

  const colors = [T.primary, T.cyan, T.green, T.gold]

  return html`
    <svg viewBox="0 0 ${size} ${size}" width="100%" height="100%" style=${{ maxHeight: '200px' }}>
      ${gridLevels.map((level, gi) => {
        const r = level * maxRadius
        const pts = angles.map(a => `${center + r * Math.cos(a)},${center + r * Math.sin(a)}`).join(' ')
        return html`<polygon key=${gi} points=${pts} fill="none" stroke=${T.borderSubtle} strokeWidth="1" />`
      })}
      ${angles.map((a, i) => html`
        <line key=${`ax-${i}`} x1=${center} y1=${center}
          x2=${center + maxRadius * Math.cos(a)} y2=${center + maxRadius * Math.sin(a)}
          stroke=${T.borderSubtle} strokeWidth="1" />
      `)}
      ${data.map((dataset, di) => {
        const color = colors[di] || T.primary
        const pts = points(dataset.radar)
        const dataPoints = dataset.radar.map((v, i) => {
          const r = (v / 100) * maxRadius
          return { x: center + r * Math.cos(angles[i]), y: center + r * Math.sin(angles[i]) }
        })
        return html`
          <polygon key=${di} points=${pts} fill=${color} fillOpacity="0.06"
            stroke=${color} strokeWidth="1.5" strokeLinejoin="round" />
          ${dataPoints.map((p, pi) => html`
            <circle key=${`pt-${di}-${pi}`} cx=${p.x} cy=${p.y} r="2.5" fill=${color}
              style=${{ filter: `drop-shadow(0 0 3px ${color}80)` }} />
          `)}
        `
      })}
      ${labels.map((label, i) => {
        const labelR = maxRadius + 18
        const x = center + labelR * Math.cos(angles[i])
        const y = center + labelR * Math.sin(angles[i])
        return html`
          <text key=${`lbl-${i}`} x=${x} y=${y}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="10" fill=${T.textMuted}
            font-family=${T.fontBody} font-weight="500">${label}</text>
        `
      })}
    </svg>
  `
}

// ── 页面 CSS ──
const PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Rajdhani:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;700&display=swap');

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* 卡片入场动画 */
@keyframes gpFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.gp-card { animation: gpFadeIn 0.4s ease-out forwards; }
.gp-card:nth-child(2) { animation-delay: 0.06s; }
.gp-card:nth-child(3) { animation-delay: 0.12s; }
.gp-card:nth-child(4) { animation-delay: 0.18s; }

/* 玻璃面板 — 圆角 + 紫调边框 + 内高光 */
.gp-glass {
  background: ${T.glass};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${T.glassBorder};
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.04);
}
.gp-glass-hover {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.gp-glass-hover:hover {
  background: ${T.glassHover};
  border-color: ${T.glassBorderBright};
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transform: translateY(-2px);
}

/* 选中状态 */
.gp-selected {
  border-color: ${T.glassBorderActive} !important;
  box-shadow: 0 0 0 1px ${T.primary}40, 0 0 24px ${T.primary}25, inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
}

/* 分隔线 */
.gp-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, ${T.divider}, transparent);
}

/* HUD 角装饰 */
.gp-hud-tl, .gp-hud-tr, .gp-hud-bl, .gp-hud-br {
  position: absolute; width: 10px; height: 10px; pointer-events: none;
}
.gp-hud-tl { top: 6px; left: 6px; border-top: 1.5px solid ${T.primary}40; border-left: 1.5px solid ${T.primary}40; border-top-left-radius: 10px; }
.gp-hud-tr { top: 6px; right: 6px; border-top: 1.5px solid ${T.primary}40; border-right: 1.5px solid ${T.primary}40; border-top-right-radius: 10px; }
.gp-hud-bl { bottom: 6px; left: 6px; border-bottom: 1.5px solid ${T.primary}40; border-left: 1.5px solid ${T.primary}40; border-bottom-left-radius: 10px; }
.gp-hud-br { bottom: 6px; right: 6px; border-bottom: 1.5px solid ${T.primary}40; border-right: 1.5px solid ${T.primary}40; border-bottom-right-radius: 10px; }

/* DNA 条 */
@keyframes gpDnaFill {
  from { width: 0; }
}
.gp-dna-bar { animation: gpDnaFill 0.8s ease-out forwards; }
`

export default function GameplayGacha() {
  const { state, dispatch, goStep } = useContext(AppContext)

  const grade = state.selectedGrade || 'primary'
  const gradeMap = { primary: 'primary', junior: 'junior', senior: 'senior', college: 'adult' }
  const [activeTab, setActiveTab] = useState(gradeMap[grade] || 'primary')
  const [selectedMode, setSelectedMode] = useState(null)

  const data = AGE_DATA[activeTab] || AGE_DATA.primary

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId)
    setSelectedMode(null)
  }, [])

  const handleSelect = useCallback((mode) => {
    setSelectedMode(prev => prev?.num === mode.num ? null : mode)
  }, [])

  const confirmGameplay = useCallback(() => {
    if (!selectedMode) return
    dispatch({ type: 'SET_GAMEPLAY', payload: {
      id: selectedMode.num, name: selectedMode.name,
      type: selectedMode.type, desc: selectedMode.desc, match: selectedMode.match,
    }})
    goStep(STEPS.AISTUDIO)
  }, [selectedMode, dispatch, goStep])

  const goBack = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: STEPS.UPLOAD })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  // 4 步进度
  const steps = [
    { num: '✓', label: '教材分析', done: true },
    { num: '02', label: '玩法推荐', active: true },
    { num: '03', label: '团队组建', done: false },
    { num: '04', label: '开始创作', done: false },
  ]

  return html`
    <div class="min-h-screen flex flex-col" style=${{
      background: T.bgRadial,
      fontFamily: T.fontBody,
      color: T.textPrimary,
    }}>
      <style>${PAGE_CSS}</style>

      <!-- ═══ 顶部导航栏 ═══ -->
      <${NavBar} />

      <!-- ═══ 步骤进度条 ═══ -->
      <div class="pt-20 px-6 pb-2 flex items-center justify-center gap-2">
        ${steps.map((s, i) => html`
          <div key=${i} class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                 style=${s.done
                   ? { background: T.primary, color: T.void, boxShadow: '0 0 8px rgba(167,139,250,0.4)' }
                   : s.active
                     ? { background: T.primary, color: T.void, boxShadow: '0 0 0 3px rgba(167,139,250,0.2), 0 0 12px rgba(167,139,250,0.3)' }
                     : { border: `1px solid ${T.borderSubtle}`, color: T.textDim }
                 }>
              ${s.num}
            </div>
            <span class="text-[13px] whitespace-nowrap ${s.active ? 'font-semibold' : 'font-medium'}"
                  style=${{ color: s.active ? T.primary : s.done ? T.textPrimary : T.textDim, fontFamily: T.fontBody }}>
              ${s.label}
            </span>
          </div>
          ${i < steps.length - 1 ? html`
            <div class="w-6 h-px shrink-0"
                 style=${{ background: s.done ? T.primary : T.borderSubtle, opacity: s.done ? 0.5 : 0.3 }}></div>
          ` : null}
        `)}
      </div>

      <!-- ═══ 主体：侧栏 + 内容 ═══ -->
      <div class="flex-1 flex min-h-0 gap-4 px-5 pb-4 pt-2">
        <!-- ── 左侧栏 ── -->
        <aside class="w-60 shrink-0 gp-glass p-5 overflow-y-auto no-scrollbar hidden lg:block relative">
          <div class="gp-hud-tl"></div><div class="gp-hud-tr"></div>
          <div class="gp-hud-bl"></div><div class="gp-hud-br"></div>

          <!-- 当前教材 -->
          <div class="flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 style=${{ color: T.primary }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span class="text-[10px] uppercase tracking-wider font-mono" style=${{ color: T.primary }}>当前教材</span>
          </div>
          <h2 class="mt-2 text-sm font-semibold truncate" style=${{ color: T.textBright, fontFamily: T.fontDisplay }}>
            ${data.subject} ${data.grade}
          </h2>
          <p class="text-xs mt-1 truncate" style=${{ color: T.textSecondary }}>
            ${state.material?.name || '教材.pdf'}
          </p>
          <div class="flex items-center gap-1.5 mt-2 text-[11px]" style=${{ color: T.textMuted }}>
            <span>${data.kp}个知识点</span>
            <span style=${{ color: T.primary }}>·</span>
            <span>${data.exp}个实验</span>
          </div>

          <div class="my-4 gp-divider"></div>

          <!-- 学习目标 -->
          <div class="flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 style=${{ color: T.primary }}>
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
            </svg>
            <span class="text-[10px] uppercase tracking-wider font-mono" style=${{ color: T.primary }}>学习目标</span>
          </div>
          <ul class="mt-3 space-y-2">
            ${data.objs.map((obj, i) => html`
              <li key=${i} class="flex items-start gap-2">
                <span class="w-3.5 h-3.5 mt-0.5 rounded-full flex items-center justify-center shrink-0"
                      style=${{ background: T.primary }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke=${T.void} stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                <span class="text-[13px] leading-snug" style=${{ color: T.textPrimary }}>${obj}</span>
              </li>
            `)}
          </ul>

          <div class="my-4 gp-divider"></div>

          <!-- AI 分析结果 -->
          <div class="flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 style=${{ color: T.primary }}>
              <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"/>
            </svg>
            <span class="text-[10px] uppercase tracking-wider font-mono" style=${{ color: T.primary }}>AI 分析</span>
          </div>
          <div class="mt-3 flex flex-col items-center">
            <div class="relative w-20 h-20 rounded-full"
                 style=${{ background: `conic-gradient(${T.primary} 0% ${data.match}%, ${T.borderSubtle} ${data.match}% 100%)` }}>
              <div class="absolute inset-[5px] rounded-full flex flex-col items-center justify-center"
                   style=${{ background: T.deep }}>
                <span class="text-xl font-bold leading-none" style=${{ color: T.textBright, fontFamily: T.fontDisplay }}>${data.match}</span>
                <span class="text-[9px] mt-0.5" style=${{ color: T.textMuted }}>匹配度</span>
              </div>
            </div>
          </div>

          <div class="my-4 gp-divider"></div>

          <!-- 适龄区间 -->
          <div class="flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 style=${{ color: T.primary }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span class="text-[10px] uppercase tracking-wider font-mono" style=${{ color: T.primary }}>目标年龄</span>
          </div>
          <div class="mt-2 px-3 py-2 rounded-lg text-center text-sm font-semibold"
               style=${{ background: data.accent + '15', color: data.accent, border: `1px solid ${data.accent}30` }}>
            ${data.icon} ${data.ageLabel}
          </div>
        </aside>

        <!-- ── 主内容区 ── -->
        <main class="flex-1 flex flex-col min-h-0 gap-3 overflow-y-auto no-scrollbar">

          <!-- 标题 + 年龄 Tab -->
          <div class="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 class="text-lg font-bold" style=${{ color: T.textBright, fontFamily: T.fontDisplay }}>
                AI 推荐的游戏化学习方案
              </h1>
              <p class="text-xs mt-1" style=${{ color: T.textMuted }}>
                基于教材内容分析，为目标年龄段推荐最合适的游戏化学习方案
              </p>
            </div>
            <div class="flex items-center gap-1.5 p-1 rounded-xl gp-glass">
              ${AGE_TABS.map(tab => html`
                <button key=${tab.id}
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap"
                  style=${activeTab === tab.id
                    ? { background: T.primary, color: T.void, boxShadow: '0 0 10px rgba(167,139,250,0.3)' }
                    : { color: T.textMuted, background: 'transparent' }
                  }
                  onClick=${() => handleTabChange(tab.id)}>
                  <span>${tab.icon}</span>
                  <span>${tab.label}</span>
                  <span class="text-[10px] opacity-70">${tab.range}</span>
                </button>
              `)}
            </div>
          </div>

          <!-- 4 个游戏模式卡片 (2×2) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${data.games.map((mode, i) => html`
              <div key=${i}
                class="gp-card gp-glass gp-glass-hover relative overflow-hidden cursor-pointer ${selectedMode?.num === mode.num ? 'gp-selected' : ''}"
                onClick=${() => handleSelect(mode)}>
                <!-- 图片区 -->
                <div class="relative h-28 overflow-hidden" style=${{ borderRadius: '15px 15px 0 0' }}>
                  <img src=${mode.img} alt=${mode.name} class="w-full h-full object-cover" loading="lazy"
                    style=${{ filter: 'brightness(0.85)' }} />
                  <div class="absolute inset-0" style=${{
                    background: `linear-gradient(180deg, transparent 30%, ${T.deep}f0 100%), linear-gradient(135deg, ${mode.color}20, transparent)`,
                  }}></div>
                  <!-- 编号 -->
                  <div class="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold"
                       style=${{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: mode.color }}>
                    ${mode.num} · ${mode.type}
                  </div>
                  <!-- 匹配度 -->
                  <div class="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[11px] font-bold"
                       style=${{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: T.gold }}>
                    ${mode.match}% 匹配
                  </div>
                  <!-- 名称 -->
                  <h3 class="absolute bottom-2 left-3 text-base font-bold" style=${{ color: T.textBright, fontFamily: T.fontDisplay, textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
                    ${mode.name}
                  </h3>
                  <!-- 星级 -->
                  <div class="absolute bottom-2 right-3 text-[11px]" style=${{ color: T.amber, textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                    ${'★'.repeat(mode.stars)}${'☆'.repeat(5 - mode.stars)}
                  </div>
                </div>
                <!-- 内容区 -->
                <div class="p-3">
                  <p class="text-[12px] leading-relaxed line-clamp-2" style=${{ color: T.textSecondary }}>
                    ${mode.desc}
                  </p>
                  <div class="flex flex-wrap gap-1.5 mt-2">
                    ${mode.tags.map((tag, ti) => html`
                      <span key=${ti} class="px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style=${{ background: mode.color + '12', color: mode.color, border: `1px solid ${mode.color}25` }}>
                        ${tag}
                      </span>
                    `)}
                  </div>
                </div>
                <!-- 选中指示 -->
                ${selectedMode?.num === mode.num ? html`
                  <div class="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold z-10"
                       style=${{ background: T.primary, color: T.void, boxShadow: '0 0 12px rgba(167,139,250,0.5)' }}>
                    ✓ 已选择
                  </div>
                ` : null}
              </div>
            `)}
          </div>

          <!-- 分隔线 -->
          <div class="gp-divider my-1"></div>

          <!-- 底部：分析 + AI 团队 -->
          <div class="flex gap-3 flex-1 min-h-0">
            <!-- 左：雷达图 + DNA + AI 建议 -->
            <div class="w-5/12 flex flex-col gap-3">
              <!-- 雷达图 -->
              <div class="gp-glass p-3 relative">
                <div class="gp-hud-tl"></div><div class="gp-hud-tr"></div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[10px] uppercase tracking-wider font-mono" style=${{ color: T.primary }}>方案对比</span>
                  <span class="text-[10px]" style=${{ color: T.textDim }}>五维雷达</span>
                </div>
                <div class="flex justify-center">
                  <${RadarChart} data=${data.games} />
                </div>
                <!-- 图例 -->
                <div class="flex flex-wrap justify-center gap-2 mt-1">
                  ${data.games.map((g, gi) => {
                    const colors = [T.primary, T.cyan, T.green, T.gold]
                    return html`
                      <div key=${gi} class="flex items-center gap-1">
                        <span class="w-2 h-2 rounded-full" style=${{ background: colors[gi] }}></span>
                        <span class="text-[10px]" style=${{ color: T.textMuted }}>${g.name}</span>
                      </div>
                    `
                  })}
                </div>
              </div>

              <!-- DNA + AI 建议 -->
              <div class="gp-glass p-3 flex-1 relative">
                <div class="gp-hud-bl"></div><div class="gp-hud-br"></div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-[10px] uppercase tracking-wider font-mono" style=${{ color: T.primary }}>游戏 DNA</span>
                </div>
                <div class="space-y-1.5">
                  ${data.dna.map((d, i) => html`
                    <div key=${i} class="flex items-center gap-2">
                      <span class="text-[11px] w-16 shrink-0" style=${{ color: T.textSecondary }}>${d.label}</span>
                      <div class="flex-1 h-2 rounded-full overflow-hidden" style=${{ background: T.borderSubtle }}>
                        <div class="gp-dna-bar h-full rounded-full"
                             style=${{ width: `${d.pct}%`, background: `linear-gradient(90deg, ${d.color}, ${d.color}aa)`, boxShadow: `0 0 6px ${d.color}60`, animationDelay: `${i * 0.1}s` }}></div>
                      </div>
                      <span class="text-[11px] font-mono w-7 text-right" style=${{ color: d.color }}>${d.pct}%</span>
                    </div>
                  `)}
                </div>

                <div class="my-3 gp-divider"></div>

                <div class="flex items-center gap-2 mb-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                       style=${{ color: T.gold }}>
                    <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/>
                  </svg>
                  <span class="text-[10px] uppercase tracking-wider font-mono" style=${{ color: T.gold }}>AI 建议</span>
                </div>
                <p class="text-[12px] leading-relaxed" style=${{ color: T.textSecondary }}>
                  ${data.advice}
                </p>
              </div>
            </div>

            <!-- 右：AI 团队（大头像） -->
            <div class="w-7/12 gp-glass p-4 relative">
              <div class="gp-hud-tl"></div><div class="gp-hud-tr"></div>
              <div class="gp-hud-bl"></div><div class="gp-hud-br"></div>
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                       style=${{ color: T.primary }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span class="text-[10px] uppercase tracking-wider font-mono" style=${{ color: T.primary }}>所需 AI 团队</span>
                </div>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-mono"
                      style=${{ background: T.primary + '15', color: T.primary, border: `1px solid ${T.glassBorder}` }}>
                  ${data.team.length} 位专家
                </span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                ${data.team.map((member, i) => html`
                  <div key=${i} class="gp-glass gp-glass-hover p-2.5 flex flex-col items-center text-center">
                    <div class="w-14 h-14 rounded-2xl overflow-hidden mb-2 relative"
                         style=${{ border: `1.5px solid ${T.glassBorder}`, boxShadow: `0 0 10px ${T.primary}15` }}>
                      <img src=${member.img} alt=${member.name} class="w-full h-full object-cover" loading="lazy" />
                      <div class="absolute inset-0" style=${{
                        background: `linear-gradient(180deg, transparent 50%, ${T.deep}60 100%)`,
                      }}></div>
                    </div>
                    <div class="text-[12px] font-semibold truncate w-full" style=${{ color: T.textBright }}>
                      ${member.name}
                    </div>
                    <div class="text-[10px] mt-0.5 leading-tight" style=${{ color: T.textMuted }}>
                      ${member.role}
                    </div>
                  </div>
                `)}
              </div>
            </div>
          </div>
        </main>
      </div>

      <!-- ═══ 底部操作栏 ═══ -->
      <div class="px-5 pb-4 pt-1">
        <div class="gp-glass px-5 py-3 flex items-center justify-between gap-4 relative">
          <div class="gp-hud-tl"></div><div class="gp-hud-tr"></div>
          <div class="gp-hud-bl"></div><div class="gp-hud-br"></div>

          <button class="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                  style=${{ color: T.textMuted, border: `1px solid ${T.borderSubtle}` }}
                  onClick=${goBack}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            重新上传教材
          </button>

          <div class="text-xs flex items-center gap-2" style=${{ color: T.textMuted }}>
            ${selectedMode ? html`
              <span style=${{ color: T.primary }}>●</span>
              已选择「${selectedMode.name}」· 匹配度 ${selectedMode.match}%
            ` : html`
              <span style=${{ color: T.textDim }}>○</span>
              请选择一个玩法方案
            `}
          </div>

          <button class="px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                  style=${selectedMode
                    ? { background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, color: T.textBright, boxShadow: '0 0 16px rgba(167,139,250,0.35)', border: 'none' }
                    : { background: T.borderSubtle, color: T.textDim, cursor: 'not-allowed', border: 'none' }
                  }
                  disabled=${!selectedMode}
                  onClick=${confirmGameplay}>
            确认玩法，组建团队
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `
}
