// ═══════════════════════════════════════════════════════════
// 团队分享码系统 + 增强推荐算法
// 1. 将团队配置编码为6位分享码
// 2. 基于标签的团队推荐算法（含社区热度维度）
// ═══════════════════════════════════════════════════════════

// ── 分享码编解码 ──
// 使用 Base36 编码，将团队ID + 角色列表压缩为6位码

const CODE_CHARS = '0123456789ABCDEFGHJKMNPQRSTVWXYZ' // 去除易混淆字符（I/L/O/U）
const CODE_BASE = CODE_CHARS.length // 31

// 简单哈希：将字符串转为数字
function hashStr(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & 0x7FFFFFFF // 保持正数
  }
  return hash
}

// 数字转 Base31 字符串
function toBase31(num, minLen = 6) {
  let result = ''
  do {
    result = CODE_CHARS[num % CODE_BASE] + result
    num = Math.floor(num / CODE_BASE)
  } while (num > 0 || result.length < minLen)
  return result.slice(0, minLen).padStart(minLen, '0')
}

// Base31 字符串转数字
function fromBase31(str) {
  let num = 0
  for (let i = 0; i < str.length; i++) {
    const idx = CODE_CHARS.indexOf(str[i].toUpperCase())
    if (idx === -1) return -1
    num = num * CODE_BASE + idx
  }
  return num
}

/**
 * 编码团队为6位分享码
 * @param {Object} team - { id, agents: [agentId1, agentId2, ...] }
 * @returns {string} 6位分享码
 */
export function encodeTeamCode(team) {
  const combined = (team.id || 'team') + '|' + (team.agents || []).join(',')
  const hash = hashStr(combined)
  return toBase31(hash, 6)
}

/**
 * 解码分享码 → 团队信息
 * 注意：由于哈希是单向的，解码只能验证码是否有效
 * 实际使用中需要后端映射表，这里用本地映射代替
 * @param {string} code - 6位分享码
 * @returns {Object|null} { valid, code, hash }
 */
export function decodeTeamCode(code) {
  if (!code || code.length !== 6) return null
  const upper = code.toUpperCase()
  const hash = fromBase31(upper)
  if (hash < 0) return null
  return {
    valid: true,
    code: upper,
    hash,
  }
}

/**
 * 验证分享码格式
 */
export function isValidCode(code) {
  if (!code || code.length !== 6) return false
  return /^[0-9A-HJKMNPQRSTVWXYZ]{6}$/i.test(code)
}

// ── 预生成分享码映射表（Demo用） ──
// 为20个预设团队生成固定分享码
import { PRESET_TEAMS } from './platformData.js'

export const TEAM_CODES = (() => {
  const map = {}
  PRESET_TEAMS.forEach(team => {
    const code = encodeTeamCode({ id: team.id, agents: team.agents })
    map[code] = team.id
  })
  return map
})()

/**
 * 通过分享码获取团队
 */
export function getTeamByCode(code) {
  if (!isValidCode(code)) return null
  const teamId = TEAM_CODES[code.toUpperCase()]
  if (teamId) {
    return PRESET_TEAMS.find(t => t.id === teamId) || null
  }
  // 对于自定义码，返回解码信息
  const decoded = decodeTeamCode(code)
  return decoded?.valid ? { customCode: code, valid: true } : null
}

// ── 增强推荐算法 ──
// 基于标签匹配 + 社区热度 + 学科匹配度

// 模拟社区热度数据（每周更新）
export const COMMUNITY_HEAT = {
  t1: { weeklyUses: 342, trend: 'up', rating: 4.9 },
  t2: { weeklyUses: 218, trend: 'up', rating: 4.8 },
  t3: { weeklyUses: 156, trend: 'stable', rating: 4.7 },
  t4: { weeklyUses: 89, trend: 'down', rating: 4.6 },
  t5: { weeklyUses: 412, trend: 'up', rating: 4.9 },
  t6: { weeklyUses: 287, trend: 'up', rating: 4.8 },
  t7: { weeklyUses: 523, trend: 'up', rating: 4.9 },
  t8: { weeklyUses: 198, trend: 'stable', rating: 4.7 },
  t9: { weeklyUses: 467, trend: 'up', rating: 4.9 },
  t10: { weeklyUses: 334, trend: 'up', rating: 4.8 },
  t11: { weeklyUses: 678, trend: 'up', rating: 5.0 },
  t12: { weeklyUses: 145, trend: 'stable', rating: 4.7 },
  t13: { weeklyUses: 389, trend: 'up', rating: 4.8 },
  t14: { weeklyUses: 412, trend: 'up', rating: 4.9 },
  t15: { weeklyUses: 267, trend: 'stable', rating: 4.7 },
  t16: { weeklyUses: 198, trend: 'up', rating: 4.8 },
  t17: { weeklyUses: 234, trend: 'up', rating: 4.7 },
  t18: { weeklyUses: 123, trend: 'stable', rating: 4.6 },
  t19: { weeklyUses: 567, trend: 'up', rating: 4.9 },
  t20: { weeklyUses: 178, trend: 'up', rating: 4.7 },
}

/**
 * 增强版团队推荐
 * @param {Object} params - { grade, subject1Id, subject2Ids, limit }
 * @returns {Array} 排序后的团队列表，含匹配度和热度
 */
export function recommendTeamsEnhanced({ grade, subject1Id, subject2Ids = [], limit = 5 }) {
  // 导入 PRESET_TEAMS
  let teams = PRESET_TEAMS.slice()

  // 1. 学段过滤（权重 40%）
  if (grade) {
    teams = teams.map(t => ({
      ...t,
      _gradeMatch: t.grade === grade ? 40 : 0,
    }))
  } else {
    teams = teams.map(t => ({ ...t, _gradeMatch: 20 }))
  }

  // 2. 学科匹配（权重 30%）
  const subjectIds = [subject1Id, ...subject2Ids].filter(Boolean)
  teams = teams.map(t => {
    let subjectScore = 0
    if (subjectIds.length > 0) {
      const teamSubjects = (t.applicableSubjects || t.suitableFor || []).join(' ').toLowerCase()
      subjectIds.forEach(sid => {
        if (teamSubjects.includes(String(sid).toLowerCase())) subjectScore += 15
      })
    }
    return { ...t, _subjectMatch: Math.min(subjectScore, 30) }
  })

  // 3. 标签匹配（权重 15%）
  // 如果有偏好标签，匹配团队 tags
  teams = teams.map(t => {
    const tagScore = Math.min((t.tags || []).length * 3, 15)
    return { ...t, _tagMatch: tagScore }
  })

  // 4. 社区热度（权重 15%）
  teams = teams.map(t => {
    const heat = COMMUNITY_HEAT[t.id] || { weeklyUses: 0, rating: 4.5 }
    const heatScore = Math.min(Math.log10(heat.weeklyUses + 1) * 5, 15)
    return {
      ...t,
      _heatMatch: heatScore,
      _weeklyUses: heat.weeklyUses,
      _trend: heat.trend,
      _communityRating: heat.rating,
    }
  })

  // 5. 计算总分并排序
  teams = teams.map(t => ({
    ...t,
    _totalScore: t._gradeMatch + t._subjectMatch + t._tagMatch + t._heatMatch,
    matchPercent: Math.round((t._gradeMatch + t._subjectMatch + t._tagMatch + t._heatMatch)),
  }))

  teams.sort((a, b) => b._totalScore - a._totalScore)

  return teams.slice(0, limit).map(t => ({
    id: t.id,
    name: t.name,
    emoji: t.emoji,
    grade: t.grade,
    gradeName: t.gradeName,
    gameTypeName: t.gameTypeName,
    matchPercent: Math.min(t.matchPercent, 99),
    weeklyUses: t._weeklyUses,
    trend: t._trend,
    communityRating: t._communityRating,
    tags: t.tags,
    agents: t.agents,
    description: t.description,
    shareCode: encodeTeamCode({ id: t.id, agents: t.agents }),
  }))
}

/**
 * 获取本周最火团队
 */
export function getHotTeamsThisWeek(limit = 3) {
  return Object.entries(COMMUNITY_HEAT)
    .map(([teamId, data]) => ({
      teamId,
      ...data,
      team: PRESET_TEAMS.find(t => t.id === teamId),
    }))
    .filter(item => item.team)
    .sort((a, b) => b.weeklyUses - a.weeklyUses)
    .slice(0, limit)
}
