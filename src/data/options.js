// 学习风格与游戏类型选项数据

// 5种学习风格（任务4要求至少5种 + 自定义）
export const LEARNING_STYLES = [
  {
    id: 'visual',
    name: '视觉派',
    emoji: '👁️',
    desc: '图表、动画、颜色编码让我秒懂，纯文字看着就困',
    tips: '多用可视化、思维导图、色彩区分'
  },
  {
    id: 'auditory',
    name: '听觉派',
    emoji: '👂',
    desc: '听人讲一遍比看十遍书管用，喜欢讨论和口诀',
    tips: '加入语音讲解、节奏口诀、对话式引导'
  },
  {
    id: 'kinesthetic',
    name: '动手派',
    emoji: '✋',
    desc: '别光说不练，让我自己操作、试错、折腾才有感觉',
    tips: '设计可交互实验、拖拽操作、即时反馈'
  },
  {
    id: 'logical',
    name: '逻辑派',
    emoji: '🧩',
    desc: '我要的是因果链和推导过程，跳步我会原地爆炸',
    tips: '完整推导链、分步解锁、逻辑谜题'
  },
  {
    id: 'social',
    name: '社交派',
    emoji: '👥',
    desc: '一个人学没动力，组队PK、互帮互助才带劲',
    tips: '加入排行榜、协作任务、角色对抗'
  }
]

// 10种游戏类型（任务4要求至少10种，多选）
export const GAME_TYPES = [
  { id: 'puzzle', name: '解谜闯关', emoji: '🧩', desc: '动脑解题、逐关推进' },
  { id: 'rpg', name: 'RPG冒险', emoji: '⚔️', desc: '角色扮演、剧情驱动' },
  { id: 'card', name: '卡牌策略', emoji: '🃏', desc: '收集组合、策略对战' },
  { id: 'simulation', name: '模拟实验', emoji: '🔬', desc: '沙盒操作、参数调优' },
  { id: 'rhythm', name: '音乐节奏', emoji: '🎵', desc: '节拍配合、反应训练' },
  { id: 'narrative', name: '叙事选择', emoji: '📖', desc: '分支剧情、道德抉择' },
  { id: 'towerdefense', name: '塔防经营', emoji: '🏰', desc: '资源管理、布局防守' },
  { id: 'platformer', name: '平台跳跃', emoji: '🏃', desc: '操作技巧、关卡挑战' },
  { id: 'party', name: '派对竞技', emoji: '🎉', desc: '多人对抗、欢乐整活' },
  { id: 'idle', name: '放置养成', emoji: '🌱', desc: '渐进成长、轻松挂机' },
  { id: 'escape', name: '密室逃脱', emoji: '🚪', desc: '线索推理、限时破解' },
  { id: 'coding', name: '编程逻辑', emoji: '💻', desc: '指令编排、算法通关' }
]

// 难度偏好
export const DIFFICULTY_PREFS = [
  { id: 'easy', name: '佛系休闲', emoji: '🌸', desc: '慢慢来，别逼我' },
  { id: 'normal', name: '稳步推进', emoji: '📈', desc: '有点挑战但不破防' },
  { id: 'hard', name: '硬核挑战', emoji: '🔥', desc: '越难越上头' },
  { id: 'adaptive', name: '智能自适应', emoji: '🤖', desc: '根据我的表现动态调整' }
]

// 节奏偏好
export const PACE_PREFS = [
  { id: 'bite', name: '碎片化', emoji: '⚡', desc: '3分钟一关，随时玩随时停' },
  { id: 'session', name: '集中式', emoji: '🎯', desc: '15-30分钟一段完整体验' },
  { id: 'epic', name: '沉浸式', emoji: '🌌', desc: '长篇剧情，一玩停不下来' }
]
