// ═══════════════════════════════════════════════════════════
// 引导式智能团队构建器 —— 数据层 v3.0
// 6槽位（6大核心部门）+ 132个智能体 + 羁绊系统 + 协同评分
// ═══════════════════════════════════════════════════════════
import { AGENT_CATEGORIES, AGENT_COMBOS, getNewAgents } from './agents.js'

// ── 6 个固定团队槽位（对应6大核心部门）──
export const TEAM_SLOTS = [
  {
    id: 0,
    category: 'knowledge_extractor',
    role: 'knowledge_extractor',
    name: '教研专家',
    nameEn: 'Researcher',
    icon: AGENT_CATEGORIES.knowledge_extractor.icon,
    color: AGENT_CATEGORIES.knowledge_extractor.color,
    gradient: `linear-gradient(135deg, ${AGENT_CATEGORIES.knowledge_extractor.color}, ${AGENT_CATEGORIES.knowledge_extractor.color}dd)`,
    desc: AGENT_CATEGORIES.knowledge_extractor.desc,
    mission: '把课本拆成可玩的知识点',
    emptyHint: '需要一个能拆解教材、提取知识点的角色',
  },
  {
    id: 1,
    category: 'game_designer',
    role: 'game_designer',
    name: '游戏设计师',
    nameEn: 'Designer',
    icon: AGENT_CATEGORIES.game_designer.icon,
    color: AGENT_CATEGORIES.game_designer.color,
    gradient: `linear-gradient(135deg, ${AGENT_CATEGORIES.game_designer.color}, ${AGENT_CATEGORIES.game_designer.color}dd)`,
    desc: AGENT_CATEGORIES.game_designer.desc,
    mission: '把知识变成让人上头的游戏',
    emptyHint: '需要一个设计核心玩法和关卡的角色',
  },
  {
    id: 2,
    category: 'visual_designer',
    role: 'visual_designer',
    name: '艺术总监',
    nameEn: 'Art Director',
    icon: AGENT_CATEGORIES.visual_designer.icon,
    color: AGENT_CATEGORIES.visual_designer.color,
    gradient: `linear-gradient(135deg, ${AGENT_CATEGORIES.visual_designer.color}, ${AGENT_CATEGORIES.visual_designer.color}dd)`,
    desc: AGENT_CATEGORIES.visual_designer.desc,
    mission: '让游戏好看得让人想点进去',
    emptyHint: '需要一个管美术风格和UI视觉的角色',
  },
  {
    id: 3,
    category: 'learning_evaluator',
    role: 'learning_evaluator',
    name: '学习科学家',
    nameEn: 'Learning Scientist',
    icon: AGENT_CATEGORIES.learning_evaluator.icon,
    color: AGENT_CATEGORIES.learning_evaluator.color,
    gradient: `linear-gradient(135deg, ${AGENT_CATEGORIES.learning_evaluator.color}, ${AGENT_CATEGORIES.learning_evaluator.color}dd)`,
    desc: AGENT_CATEGORIES.learning_evaluator.desc,
    mission: '确保游戏真的有学习效果',
    emptyHint: '需要一个评估学习效果和调整难度的角色',
  },
  {
    id: 4,
    category: 'narrative_designer',
    role: 'narrative_designer',
    name: '叙事设计师',
    nameEn: 'Narrative',
    icon: AGENT_CATEGORIES.narrative_designer.icon,
    color: AGENT_CATEGORIES.narrative_designer.color,
    gradient: `linear-gradient(135deg, ${AGENT_CATEGORIES.narrative_designer.color}, ${AGENT_CATEGORIES.narrative_designer.color}dd)`,
    desc: AGENT_CATEGORIES.narrative_designer.desc,
    mission: '让游戏有温度和故事',
    emptyHint: '需要一个构建世界观和编写剧情的角色',
  },
  {
    id: 5,
    category: 'technical_architect',
    role: 'technical_architect',
    name: '技术架构师',
    nameEn: 'Architect',
    icon: AGENT_CATEGORIES.technical_architect.icon,
    color: AGENT_CATEGORIES.technical_architect.color,
    gradient: `linear-gradient(135deg, ${AGENT_CATEGORIES.technical_architect.color}, ${AGENT_CATEGORIES.technical_architect.color}dd)`,
    desc: AGENT_CATEGORIES.technical_architect.desc,
    mission: '确保游戏能实际做出来',
    emptyHint: '需要一个评估技术可行性的角色',
  },
]

// ── 卡牌稀有度系统 ──
export const RARITY = {
  common: { name: '普通', color: '#9ca3af', glow: 'rgba(156,163,175,0.3)', stars: 1 },
  rare: { name: '稀有', color: '#3b82f6', glow: 'rgba(59,130,246,0.4)', stars: 2 },
  epic: { name: '史诗', color: '#a855f7', glow: 'rgba(168,85,247,0.4)', stars: 3 },
  legendary: { name: '传说', color: '#f59e0b', glow: 'rgba(245,158,11,0.5)', stars: 4 },
}

// 基于三围属性总分自动分配稀有度
function _calcRarity(agent) {
  if (!agent || !agent.stats) return 'common'
  const total = (agent.stats.logic || 0) + (agent.stats.fun || 0) + (agent.stats.visual || 0)
  if (total >= 250) return 'legendary'
  if (total >= 230) return 'epic'
  if (total >= 210) return 'rare'
  return 'common'
}

// 预计算所有新智能体的稀有度
const _NEW_AGENTS = getNewAgents()
const RARITY_MAP = {}
for (const a of _NEW_AGENTS) {
  RARITY_MAP[a.id] = _calcRarity(a)
}
// AI创作伙伴稀有度（保持原样）
const _LEGACY_RARITY = {
  captain: 'legendary', scholar: 'legendary', designer: 'legendary',
  experience: 'epic', art: 'epic', numbers: 'epic', qa: 'epic', narrative: 'epic',
  level: 'rare', spark: 'rare', tech: 'rare', slacker: 'rare',
}
Object.assign(RARITY_MAP, _LEGACY_RARITY)

export function getRarity(agentId) {
  return RARITY_MAP[agentId] || 'common'
}

// ── 兼容性规则 ──

// 检查 agent 是否能放入指定槽位（基于 category 匹配）
export function canAssign(agentId, slotId, agents) {
  const slot = TEAM_SLOTS[slotId]
  if (!slot) return { ok: false, reason: '槽位不存在' }

  // 从 agents 列表中找到该 agent
  const agentList = agents || _NEW_AGENTS
  const agent = agentList.find(a => a.id === agentId)
  if (!agent) return { ok: false, reason: '角色不存在' }

  // 检查 category 是否匹配
  if (agent.category === slot.category) {
    return { ok: true }
  }

  return {
    ok: false,
    reason: `${slot.name}需要${slot.name}类角色，该角色是${_categoryName(agent.category)}`
  }
}

function _categoryName(cat) {
  return AGENT_CATEGORIES[cat]?.name || cat
}

// 检查 agent 是否与当前学段兼容
export function isGradeCompatible(agent, selectedGrade) {
  if (!agent || !selectedGrade) return true
  if (agent.grade === 'universal') return true
  return agent.grade === selectedGrade
}

// ── 协同评分算法（0-100）──
export function calculateSynergy(slots, agents, selectedGrade) {
  const filledIds = slots.filter(s => s !== null)
  if (filledIds.length === 0) return { score: 0, grade: 'F', breakdown: [], combos: [] }

  const agentList = agents || _NEW_AGENTS
  const filledAgents = filledIds.map(id => agentList.find(a => a.id === id)).filter(Boolean)

  const breakdown = []
  let score = 0

  // 1. 槽位覆盖率（每填1个+12分，满分72）
  const coverage = filledAgents.length * 12
  breakdown.push({ label: '槽位覆盖', value: coverage, max: 72 })
  score += coverage

  // 2. 学段匹配度（每个匹配+3分，满分18）
  let gradeMatch = 0
  for (const a of filledAgents) {
    if (isGradeCompatible(a, selectedGrade)) gradeMatch += 3
  }
  breakdown.push({ label: '学段匹配', value: gradeMatch, max: 18 })
  score += gradeMatch

  // 3. 三围属性加分（总分平均*0.1，满分10）
  let statsScore = 0
  for (const a of filledAgents) {
    if (a.stats) {
      statsScore += ((a.stats.logic + a.stats.fun + a.stats.visual) / 3) * 0.1
    }
  }
  statsScore = Math.round(statsScore)
  breakdown.push({ label: '属性加成', value: statsScore, max: 10 })
  score += statsScore

  // 4. Combo 加分
  const combos = detectCombos(filledIds)
  const comboScore = combos.length * 5
  breakdown.push({ label: '羁绊加成', value: comboScore, max: 30 })
  score += comboScore

  // 6槽全满额外加分
  if (filledAgents.length === 6) {
    score += 5
    breakdown.push({ label: '全员到齐', value: 5, max: 5 })
  }

  score = Math.min(score, 100)

  // 评级
  let grade = 'F'
  if (score >= 90) grade = 'S'
  else if (score >= 75) grade = 'A'
  else if (score >= 60) grade = 'B'
  else if (score >= 40) grade = 'C'
  else if (score >= 20) grade = 'D'

  return { score, grade, breakdown, combos }
}

// ── 羁绊/Combo 系统 ──
// 使用 agents.js 中的 AGENT_COMBOS，额外加一个"全员到齐"
export const COMBOS = [
  ...AGENT_COMBOS.map(c => ({
    ...c,
    requiredAgents: c.agents,
    bonusText: c.desc,
    bonus: `+${c.bonus}`,
  })),
  {
    id: 'full_house',
    name: '全员到齐',
    desc: '6个槽位全满，完整团队就位',
    icon: '🎊',
    color: '#22c55e',
    requiredAgents: null,
    bonus: '+5 协同',
    isFullHouse: true,
  },
]

export function detectCombos(filledAgentIds) {
  const activated = []
  for (const combo of COMBOS) {
    if (combo.isFullHouse) {
      if (filledAgentIds.length >= 6) activated.push(combo)
      continue
    }
    if (combo.requiredAgents && combo.requiredAgents.every(id => filledAgentIds.includes(id))) {
      activated.push(combo)
    }
  }
  return activated
}

// ── 智能引导逻辑 ──

// 获取下一步建议
export function getNextGuidance(slots, selectedGrade) {
  const emptySlots = slots.map((s, i) => s === null ? i : null).filter(i => i !== null)

  if (emptySlots.length === 0) {
    return {
      type: 'complete',
      icon: '✅',
      title: '团队已满员',
      desc: '所有6个槽位已填满，可以确认团队了',
      action: '确认团队',
    }
  }

  const nextSlotId = emptySlots[0]
  const slot = TEAM_SLOTS[nextSlotId]

  return {
    type: 'fill_slot',
    icon: slot.icon,
    slotId: nextSlotId,
    title: `下一步：填满「${slot.name}」槽位`,
    desc: slot.emptyHint,
    action: `查看推荐角色`,
    slotColor: slot.color,
  }
}

// 获取某槽位的推荐角色（按学段+稀有度排序）
export function getRecommendedAgents(slotId, selectedGrade, agents) {
  const slot = TEAM_SLOTS[slotId]
  if (!slot) return []

  // 只显示新智能体（排除AI创作伙伴），且 category 匹配
  const agentList = agents || _NEW_AGENTS
  let candidates = agentList.filter(a =>
    a.category === slot.category && !_LEGACY_RARITY[a.id]
  )

  // 按学段匹配排序：匹配学段 > 通用 > 其他
  candidates.sort((a, b) => {
    const aMatch = a.grade === selectedGrade ? 0 : a.grade === 'universal' ? 1 : 2
    const bMatch = b.grade === selectedGrade ? 0 : b.grade === 'universal' ? 1 : 2
    if (aMatch !== bMatch) return aMatch - bMatch
    // 同匹配级别按稀有度排序
    const aRarity = RARITY_MAP[a.id] || 'common'
    const bRarity = RARITY_MAP[b.id] || 'common'
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 }
    return rarityOrder[aRarity] - rarityOrder[bRarity]
  })

  return candidates
}

// ── 微文案系统 ──
export const MICROCOPY = {
  slotEmpty: '空槽位',
  slotFilled: '已就位',
  slotLocked: '未解锁',

  guideStart: '从左到右依次填满 6 个槽位',
  guideProgress: (filled, total) => `已填 ${filled}/${total}，继续`,
  guideComplete: '6 位成员全部就位，可以出发了',
  guideLowScore: '协同评分偏低，试试调整阵容',

  scoreS: '完美配合，这个团队会产出神仙方案',
  scoreA: '配合默契，团队各司其职',
  scoreB: '基本合理，还有优化空间',
  scoreC: '勉强能跑，建议调整角色',
  scoreD: '阵容有问题，重新搭配吧',
  scoreF: '团队还没成型，继续填槽位',

  comboActivated: (name) => `羁绊激活：${name}`,
  comboHint: '凑齐特定角色组合可以激活羁绊',

  dragHint: '拖拽角色卡到槽位，或点击槽位查看推荐',
  clickHint: '点击角色卡快速放入对应槽位',
  incompatible: '这个角色不适合当前槽位',
  gradeMismatch: '学段不匹配，但仍然可以使用',

  btnConfirm: '确认团队配置',
  btnReset: '清空所有槽位',
  btnAutoFill: '一键智能填充',
  btnRandom: '随机抽取阵容',
}

// ── 工具函数 ──

export function getSlotName(slotId) {
  return TEAM_SLOTS[slotId]?.name || '未知槽位'
}

export function getScoreText(grade) {
  return MICROCOPY[`score${grade}`] || MICROCOPY.scoreF
}

export function getProgress(slots) {
  const filled = slots.filter(s => s !== null).length
  return {
    filled,
    total: 6,
    percent: Math.round((filled / 6) * 100),
  }
}
