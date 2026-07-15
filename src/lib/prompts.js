// 提示词构建：为每个角色的 AI 调用组装 messages
import { getAgents } from '../data/agents.js'

// 讨论轮次定义
export const ROUNDS = [
  { id: 0, name: '开场', desc: '项目管理员介绍教材与流程', speaker: 'captain' },
  { id: 1, name: '知识拆解', desc: '知识架构师分析教材', speaker: 'scholar' },
  { id: 2, name: '玩法设计', desc: '游戏设计师提出机制', speaker: 'designer' },
  { id: 3, name: '体验评估', desc: '体验师/美术/叙事等发言', speaker: 'others' },
  { id: 4, name: '自由讨论', desc: '各角色回应辩论', speaker: 'all' },
  { id: 5, name: '汇总输出', desc: '项目管理员输出设计文档', speaker: 'captain' }
]

// 构建角色发言的 messages
export function buildAgentMessages({ agent, material, team, round, history, userPrefs, userInterjection }) {
  const system = {
    role: 'system',
    content: agent.systemPrompt + '\n\n【团队配置】\n' + getAgents(team).map(a => `- ${a.name}（${a.title}）`).join('\n')
  }

  const materialSummary = material
    ? `【教材信息】\n文件名：${material.filename}\n核心主题：${material.structure?.[0]?.title || '未识别'}\n章节数：${material.structure?.length || 0}\n核心概念：${(material.concepts || []).slice(0, 8).map(c => c.name).join('、') || '暂无'}\n核心公式：${(material.formulas || []).slice(0, 5).map(f => f.latex).join('、') || '暂无'}\n\n【教材前1500字】\n${(material.rawText || '').slice(0, 1500)}`
    : '【教材信息】用户尚未提供教材，请基于通用学科知识演示。'

  const prefs = userPrefs
    ? `\n【用户偏好】\n学习风格：${userPrefs.learningStyle || '未指定'}\n游戏类型偏好：${(userPrefs.gameTypes || []).join('、') || '未指定'}\n难度偏好：${userPrefs.difficulty || '未指定'}\n节奏偏好：${userPrefs.pace || '未指定'}`
    : ''

  // 前序讨论摘要（避免上下文过长，只取最近6条）
  const recentHistory = (history || []).slice(-6)
  const historyText = recentHistory.length
    ? '\n\n【前序讨论摘要】\n' + recentHistory.map(m => `${m.agentName || '用户'}：${(m.content || '').slice(0, 200)}`).join('\n')
    : ''

  const interjection = userInterjection
    ? `\n\n【用户插入意见】${userInterjection}\n请在发言中回应用户的意见。`
    : ''

  let task = ''
  switch (round) {
    case 0:
      task = agent.id === 'captain'
        ? `这是开场。请：1)欢迎用户 2)简述你将如何主持这场讨论 3)介绍团队成员 4)请知识架构师准备分析。控制在200字内。${materialSummary}${prefs}`
        : `请等待，这一轮你只需简短打招呼（一句话）。${materialSummary}`
      break
    case 1:
      task = agent.id === 'scholar'
        ? `第一轮：请按你的发言格式分析这份教材，提取核心概念、公式、难点。${materialSummary}${historyText}${interjection}`
        : `这一轮请简短回应知识架构师的分析（1-2句话即可），如"收到，我接下来基于这个图谱设计玩法"。${historyText}`
      break
    case 2:
      task = agent.id === 'designer'
        ? `第二轮：请根据知识架构师的分析，按你的发言格式设计游戏方案（类型、机制、关卡、难度）。${historyText}${interjection}`
        : `这一轮请简短回应游戏设计师的方案（1-2句话）。${historyText}`
      break
    case 3:
      // 其他角色发言
      task = `第三轮：请按你的发言格式，从你的专业角度评价并补充前面两位的方案。${historyText}${interjection}`
      break
    case 4:
      task = `第四轮自由讨论：请针对前面各角色的发言，从你的专业角度提出回应、质疑或补充。可以与其他角色辩论。${historyText}${interjection}`
      break
    case 5:
      task = agent.id === 'captain'
        ? `第五轮汇总：请汇总所有讨论，输出完整的《游戏设计文档》，包含：一、教材分析摘要；二、知识点图谱；三、游戏设计方案(类型名称/核心玩法机制/关卡设计至少3个/难度递进)；四、学习效果评估；五、用户操作流程。${historyText}`
        : `请简短总结你的核心观点（2-3句话），交给项目经理汇总。${historyText}`
      break
    default:
      task = `请发言。${historyText}`
  }

  return [system, { role: 'user', content: task }]
}

// 解析 AI 返回的文档为结构化 GameDesignDoc
export function parseDesignDoc(text) {
  // 尝试从 markdown 文本中提取结构化字段
  const doc = {
    title: '',
    analysis: '',
    knowledgeGraph: [],
    gameDesign: { type: '', name: '', mechanics: [], levels: [], difficulty: '' },
    evaluation: '',
    userFlow: '',
    rawMarkdown: text,
    meta: { generatedAt: new Date().toISOString() }
  }

  // 简单解析
  const titleMatch = text.match(/^#\s+(.+)$/m)
  if (titleMatch) doc.title = titleMatch[1].trim()

  const analysisMatch = text.match(/##\s*一[、.]\s*教材分析摘要\s*\n([\s\S]*?)(?=\n##\s|$)/)
  if (analysisMatch) doc.analysis = analysisMatch[1].trim()

  const graphMatch = text.match(/##\s*二[、.]\s*知识点图谱\s*\n([\s\S]*?)(?=\n##\s|$)/)
  if (graphMatch) {
    // 提取表格行或列表项作为知识点
    const lines = graphMatch[1].split('\n').filter(l => l.trim() && !l.startsWith('|') || l.startsWith('|'))
    doc.knowledgeGraph = lines.filter(l => l.trim()).slice(0, 20)
  }

  const designMatch = text.match(/##\s*三[、.]\s*游戏设计方案\s*\n([\s\S]*?)(?=\n##\s|$)/)
  if (designMatch) {
    const d = designMatch[1]
    const typeMatch = d.match(/###\s*3\.1[\s\S]*?[:：]\s*(.+)/)
    if (typeMatch) doc.gameDesign.type = typeMatch[1].trim()
    const nameMatch = d.match(/(?:名称|游戏名)[:：]\s*(.+)/)
    if (nameMatch) doc.gameDesign.name = nameMatch[1].trim()
  }

  const evalMatch = text.match(/##\s*四[、.]\s*学习效果评估\s*\n([\s\S]*?)(?=\n##\s|$)/)
  if (evalMatch) doc.evaluation = evalMatch[1].trim()

  const flowMatch = text.match(/##\s*五[、.]\s*用户操作流程\s*\n([\s\S]*?)$/)
  if (flowMatch) doc.userFlow = flowMatch[1].trim()

  return doc
}
