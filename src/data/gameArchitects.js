// ═══════════════════════════════════════════════════════════
// 学段游戏架构师 —— 玩法灵魂智能体系统
// 每个学段一个架构师，定义"在这个年纪，怎么玩才叫爽"
// 含 Prompt DNA、游戏模组、扭蛋池、协作链示例
// ═══════════════════════════════════════════════════════════

// ── 4 个学段游戏架构师 ──
export const GAME_ARCHITECTS = {
  // ════════ 小学 ════════
  primary: {
    id: 'arch_primary',
    name: '即时反馈与感官大师',
    title: '小学游戏架构师',
    emoji: '🎪',
    color: '#FF8A3D',
    gradient: 'linear-gradient(135deg, #FF8A3D, #FFB066)',
    coreTask: '解决小学生注意力时间短、需要高频正向激励的问题',
    promptDNA: {
      mechanism: '简单动作 + 夸张特效 + 实体奖励',
      principles: [
        '严禁复杂的菜单操作',
        '知识点必须转化为：躲避、撞击、收集、连线',
        '每 20 秒必须有一次正向反馈',
      ],
      feedbackConstraint: '反馈延迟不得超过 0.5 秒，必须有音效和粒子效果',
      forbidden: ['多级菜单', '文字量超过 50 字的对话', '需要等待的被动环节'],
    },
    templates: [
      { id: 'parkour', name: '跑酷模式', desc: '算对一道题，角色加速并获得无敌金身', icon: '🏃', mechanics: ['躲避障碍', '收集金币', '即时计算'] },
      { id: 'pet', name: '宠物养成', desc: '掌握一个单词，宠物进化并跳舞', icon: '🐾', mechanics: ['答题进化', '互动抚摸', '技能解锁'] },
      { id: 'rhythm', name: '节奏闯关', desc: '跟着音乐节拍点击正确答案', icon: '🎵', mechanics: ['节拍判定', '连击加成', '视听联动'] },
    ],
    gachaPool: [
      { id: 'gp1', name: '知识果园大丰收', type: '收集类', typeIcon: '🍎', core: '分类收集', desc: '在果园里收集对应类别的知识果实，装满篮子过关', difficulty: '★☆☆', recommendedAgents: ['p01', 'p03', 'p05'], tag: '高互动' },
      { id: 'gp2', name: '数学冒险跑酷', type: '跑酷类', typeIcon: '🏃', core: '即时计算加速', desc: '角色自动奔跑，遇到障碍需快速算出答案才能跳跃通过', difficulty: '★☆☆', recommendedAgents: ['p01', 'p02', 'p04'], tag: '高频反馈' },
      { id: 'gp3', name: '萌宠知识学院', type: '养成类', typeIcon: '🐾', core: '答题进化', desc: '答对题目获得经验值，宠物逐步进化形态并解锁新技能', difficulty: '★☆☆', recommendedAgents: ['p02', 'p03', 'p05'], tag: '长期激励' },
      { id: 'gp4', name: '拼音消消乐', type: '消除类', typeIcon: '💥', core: '连线消除', desc: '将拼音和对应汉字连线消除，连击获得倍率加分', difficulty: '★☆☆', recommendedAgents: ['p01', 'p02', 'p04'], tag: '即时反馈' },
      { id: 'gp5', name: '英语单词大冒险', type: '冒险类', typeIcon: '🗺️', core: '闯关收集', desc: '在地图上冒险，用英语单词打开宝箱和击败怪物', difficulty: '★★☆', recommendedAgents: ['p01', 'p03', 'p05'], tag: '故事驱动' },
      { id: 'gp6', name: '科学小实验工坊', type: '操作类', typeIcon: '🔬', core: '动手实验', desc: '拖拽实验器材完成科学小实验，观察现象学知识', difficulty: '★★☆', recommendedAgents: ['p02', 'p04', 'p05'], tag: '动手实践' },
    ],
  },

  // ════════ 初中 ════════
  junior: {
    id: 'arch_junior',
    name: '社交竞技与好奇心驱动者',
    title: '初中游戏架构师',
    emoji: '⚔️',
    color: '#2563EB',
    gradient: 'linear-gradient(135deg, #2563EB, #60A5FA)',
    coreTask: '利用初中生强烈的胜负欲、社交需求和对"神秘感"的向往',
    promptDNA: {
      mechanism: '多人对战 + 隐藏剧情 + 排名系统',
      principles: [
        '知识点转化为"技能卡牌"或"解谜线索"',
        '必须设计"由于对方失误而反败为胜"的可能性',
        '每局游戏时间控制在 5-10 分钟',
      ],
      feedbackConstraint: '必须有排行榜和成就系统，社交分享功能不可省略',
      forbidden: ['单人闯关超过 15 分钟无社交', '无排名的纯练习模式', '答案唯一且无策略选择'],
    },
    templates: [
      { id: 'tournament', name: '知识锦标赛', desc: '1V1 实时答题拆塔游戏', icon: '⚔️', mechanics: ['实时对战', '技能释放', '塔防策略'] },
      { id: 'escape', name: '密室逃脱', desc: '必须解开物理实验装置才能打开下一道门', icon: '🔐', mechanics: ['线索收集', '装置操作', '限时压力'] },
      { id: 'mystery', name: '悬疑剧本杀', desc: '用学科知识推理找出真相', icon: '🕵️', mechanics: ['角色扮演', '证据分析', '逻辑推理'] },
    ],
    gachaPool: [
      { id: 'gj1', name: '知识锦标赛', type: '竞技类', typeIcon: '⚔️', core: '1V1 答题拆塔', desc: '实时对战，答对题目释放技能攻击对方防御塔', difficulty: '★★☆', recommendedAgents: ['j01', 'j03', 'j05'], tag: 'PVP 竞技' },
      { id: 'gj2', name: '学科密室逃脱', type: '解谜类', typeIcon: '🔐', core: '实验装置解谜', desc: '被困实验室，必须正确操作化学装置才能开门逃生', difficulty: '★★☆', recommendedAgents: ['j02', 'j04', 'j05'], tag: '限时解谜' },
      { id: 'gj3', name: '历史悬疑剧本杀', type: '推理类', typeIcon: '🕵️', core: '线索推理', desc: '扮演历史人物，通过历史知识推理找出幕后真相', difficulty: '★★★', recommendedAgents: ['j01', 'j02', 'j03'], tag: '角色扮演' },
      { id: 'gj4', name: '知识卡牌对战', type: '卡牌类', typeIcon: '🃏', core: '卡组构建', desc: '用知识点构建卡组，策略性出牌击败对手', difficulty: '★★☆', recommendedAgents: ['j01', 'j04', 'j05'], tag: '策略深度' },
      { id: 'gj5', name: '生存冒险岛', type: '生存类', typeIcon: '🏝️', core: '资源管理', desc: '在荒岛上用生物和地理知识生存并找到回家方法', difficulty: '★★☆', recommendedAgents: ['j02', 'j03', 'j04'], tag: '开放世界' },
      { id: 'gj6', name: '密室侦探社', type: '探案类', typeIcon: '🔍', core: '证据分析', desc: '调查案件现场，用物理化学知识分析线索破案', difficulty: '★★★', recommendedAgents: ['j01', 'j02', 'j05'], tag: '逻辑推理' },
    ],
  },

  // ════════ 高中 ════════
  senior: {
    id: 'arch_senior',
    name: '策略深度与系统构建师',
    title: '高中游戏架构师',
    emoji: '🏗️',
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
    coreTask: '高中生逻辑能力强，他们讨厌低幼化。他们需要"掌控感"和"效率感"',
    promptDNA: {
      mechanism: '资源管理 + 科技树 + 逻辑链条',
      principles: [
        '知识点不是题，而是"系统规则"。物理公式是游戏世界的物理常数',
        '必须允许玩家通过"骚操作"（深度利用知识逻辑）实现跨级挑战',
        '系统复杂度要足以支撑多种通关策略',
      ],
      feedbackConstraint: '必须有数据面板显示系统状态，允许玩家暂停分析',
      forbidden: ['简单选择题', '无策略深度的纯反应游戏', '线性无分支的关卡设计'],
    },
    templates: [
      { id: 'civ', name: '文明演化', desc: '利用地理/政治知识分配资源，建设城市', icon: '🌆', mechanics: ['资源分配', '科技树', '城市建设'] },
      { id: 'towerdef', name: '塔防战略', desc: '根据化学反应配平方案，布置不同属性的炮塔', icon: '🛡️', mechanics: ['炮塔布置', '反应配平', '波次防御'] },
      { id: 'flight', name: '硬核飞行模拟', desc: 'F=ma 成为飞船引擎推进的核心公式', icon: '🚀', mechanics: ['物理常数', '飞行操控', '轨道计算'] },
    ],
    gachaPool: [
      { id: 'gs1', name: '月球基地建设', type: '资源管理', typeIcon: '📦', core: '能耗平衡', desc: '在月球建立自给基地，管理能源、氧气、食物的平衡', difficulty: '★★★', recommendedAgents: ['s01', 's03', 's05'], tag: '系统构建' },
      { id: 'gs2', name: '轨道炮角力', type: '策略对战', typeIcon: '⚔️', core: '动量守恒', desc: '利用动量守恒原理计算弹道，在太空战场击败对手', difficulty: '★★★', recommendedAgents: ['s01', 's02', 's04'], tag: '物理实战' },
      { id: 'gs3', name: '自动过山车设计师', type: '沙盒构造', typeIcon: '🧩', core: '机械能转化', desc: '设计过山车轨道，利用机械能守恒创造刺激体验', difficulty: '★★☆', recommendedAgents: ['s02', 's03', 's05'], tag: '创意工程' },
      { id: 'gs4', name: '化学反应塔防', type: '塔防策略', typeIcon: '🛡️', core: '反应配平', desc: '根据化学方程式配平方案布置炮塔，防御元素怪物入侵', difficulty: '★★★', recommendedAgents: ['s01', 's04', 's05'], tag: '知识即武器' },
      { id: 'gs5', name: '历史文明推演', type: '策略模拟', typeIcon: '🌆', core: '因果推演', desc: '从古代开始，用历史和政治知识引导文明发展走向', difficulty: '★★★', recommendedAgents: ['s02', 's03', 's04'], tag: '宏观策略' },
      { id: 'gs6', name: '生物进化实验室', type: '实验模拟', typeIcon: '🧬', core: '自然选择', desc: '设计生物种群，观察自然选择和基因突变的效果', difficulty: '★★☆', recommendedAgents: ['s01', 's03', 's05'], tag: '科学模拟' },
    ],
  },

  // ════════ 大学 ════════
  college: {
    id: 'arch_college',
    name: '沉浸模拟与专业实战专家',
    title: '大学游戏架构师',
    emoji: '🔬',
    color: '#06B6D4',
    gradient: 'linear-gradient(135deg, #06B6D4, #22D3EE)',
    coreTask: '大学生需要的是"这玩意儿有用"和"真实世界的模拟"',
    promptDNA: {
      mechanism: '职业模拟 + 高自由度沙盒 + 复杂决策',
      principles: [
        '游戏界面要尽可能贴近真实的"工作站"',
        '真实感优先于趣味性',
        '必须包含"失败分析报告"，让玩家知道哪步选错了',
      ],
      feedbackConstraint: '决策必须有多维度后果，不能只有对/错二元结果',
      forbidden: ['卡通化 UI', '简化到失去专业性的系统', '无后果的试错'],
    },
    templates: [
      { id: 'ceo', name: '职业经理人模拟器', desc: '处理真实的财报和市场突发事件', icon: '💼', mechanics: ['财报分析', '市场预测', '危机管理'] },
      { id: 'quantum', name: '数字孪生实验室', desc: '在无重力或微观环境下观察量子纠缠', icon: '🔬', mechanics: ['参数调节', '现象观察', '数据记录'] },
      { id: 'clinical', name: '临床模拟器', desc: '模拟真实问诊、检查、诊断全流程', icon: '🏥', mechanics: ['病例分析', '检查选择', '诊断决策'] },
    ],
    gachaPool: [
      { id: 'gc1', name: 'CEO 经营决策模拟', type: '职业模拟', typeIcon: '💼', core: '财报分析', desc: '接手一家公司，通过分析财报和市场趋势做出经营决策', difficulty: '★★★', recommendedAgents: ['u03', 'u05', 'u08'], tag: '商证实战' },
      { id: 'gc2', name: '量子纠缠实验室', type: '数字孪生', typeIcon: '🔬', core: '波函数模拟', desc: '在虚拟实验室调节参数，观察量子纠缠现象并记录数据', difficulty: '★★★', recommendedAgents: ['u06', 'u07', 'u10'], tag: '科研模拟' },
      { id: 'gc3', name: '急诊室值班医生', type: '临床模拟', typeIcon: '🏥', core: '诊断决策', desc: '模拟急诊室夜班，接收病人、问诊、检查、诊断的全流程', difficulty: '★★★', recommendedAgents: ['u11', 'u12', 'u13'], tag: '专业实战' },
      { id: 'gc4', name: '法庭辩论模拟器', type: '角色扮演', typeIcon: '⚖️', core: '法理推理', desc: '扮演律师，用法学知识进行法庭辩论，影响判决结果', difficulty: '★★★', recommendedAgents: ['u01', 'u02', 'u04'], tag: '法务实战' },
      { id: 'gc5', name: '城市规划工作站', type: '沙盒模拟', typeIcon: '🏗️', core: '系统优化', desc: '在城市规划工作站中优化交通、人口、资源分配', difficulty: '★★★', recommendedAgents: ['u05', 'u09', 'u10'], tag: '工程实战' },
      { id: 'gc6', name: '心理诊疗室', type: '职业模拟', typeIcon: '🛋️', core: '个案分析', desc: '模拟心理咨询师，通过对话分析来访者问题并制定方案', difficulty: '★★☆', recommendedAgents: ['u01', 'u03', 'u04'], tag: '人文实战' },
    ],
  },
}

// ── 协作链定义 ──
// 架构师在 step 2 注入玩法指令，是整个链路的"灵魂节点"
export const COLLABORATION_CHAIN = [
  {
    step: 1,
    role: '知识萃取官',
    roleEn: 'Scholar',
    icon: '📚',
    action: 'extract',
    desc: '从教材中提取核心知识点',
  },
  {
    step: 2,
    role: '学段游戏架构师',
    roleEn: 'Architect',
    icon: '🏗️',
    action: 'inject',
    desc: '判定学段 → 决策玩法 → 注入指令',
    isKeyStep: true,
  },
  {
    step: 3,
    role: '数值平衡师',
    roleEn: 'Balancer',
    icon: '⚖️',
    action: 'balance',
    desc: '根据玩法手感调整数值范围',
  },
  {
    step: 4,
    role: '视觉指挥官',
    roleEn: 'Art Director',
    icon: '🎨',
    action: 'visualize',
    desc: '生成匹配玩法的视觉风格',
  },
  {
    step: 5,
    role: '质检员',
    roleEn: 'QA',
    icon: '🧪',
    action: 'test',
    desc: '测试边界情况和系统稳定性',
  },
]

// ── 协作链示例：每个学段一条完整链路 ──
// 展示架构师如何"注入"玩法指令到团队协作中
export const CHAIN_EXAMPLES = {
  primary: {
    knowledge: '加法运算：1 + 1 = 2',
    gameplay: '萌宠知识学院（宠物养成）',
    steps: [
      { agent: 'Scholar', icon: '📚', output: '提取知识点：加法运算（1+1=2），适用于小学低年级' },
      { agent: 'Architect', icon: '🏗️', output: '决策：宠物养成玩法 → 将"1+1"转化为"给小兔子喂 1 个胡萝卜再喂 1 个，数数共有几个"', isKey: true },
      { agent: 'Balancer', icon: '⚖️', output: '调整：胡萝卜出现频率 2 秒/个，宠物进化需 10 次正确喂食，反馈延迟设为 0.3 秒' },
      { agent: 'Art Director', icon: '🎨', output: '生成：Q 版卡通兔子，喂食时有爱心粒子效果 + 咀嚼音效 + 经验值弹跳数字' },
      { agent: 'QA', icon: '🧪', output: '测试：连续快速点击是否导致计数错误 → 已加防抖；胡萝卜超出屏幕 → 已加边界回收' },
    ],
  },
  junior: {
    knowledge: '镁条燃烧的化学反应：2Mg + O₂ → 2MgO',
    gameplay: '学科密室逃脱',
    steps: [
      { agent: 'Scholar', icon: '📚', output: '提取知识点：镁条燃烧反应，反应物/产物/条件，适用于初中化学' },
      { agent: 'Architect', icon: '🏗️', output: '决策：密室逃脱玩法 → 将化学方程式转化为"点燃镁条照亮暗室获取密码"的解谜装置', isKey: true },
      { agent: 'Balancer', icon: '⚖️', output: '调整：密室限时 8 分钟，错误操作 3 次触发警报，正确配平方程式可额外获得 2 分钟' },
      { agent: 'Art Director', icon: '🎨', output: '生成：写实实验室风格，镁条燃烧有真实火焰效果和强光过曝，暗室氛围用粒子灰尘' },
      { agent: 'QA', icon: '🧪', output: '测试：如果玩家不点燃镁条直接摸索 → 设计备用光源但扣分；方程式配平错误 → 显示"反应失败"烟雾效果' },
    ],
  },
  senior: {
    knowledge: '牛顿第二定律：F = ma',
    gameplay: '硬核飞行模拟',
    steps: [
      { agent: 'Scholar', icon: '📚', output: '提取知识点：牛顿第二定律 F=ma，力、质量、加速度的关系，适用于高中物理' },
      { agent: 'Architect', icon: '🏗️', output: '决策：硬核飞行模拟玩法 → 将 F=ma 设置为飞船引擎推进的核心公式，玩家需理解公式才能操控飞船', isKey: true },
      { agent: 'Balancer', icon: '⚖️', output: '调整：质量 m 范围 1000-5000kg，推力 F 范围 0-20000N，加速度实时显示在仪表盘上，操控手感偏硬核' },
      { agent: 'Art Director', icon: '🎨', output: '生成：写实宇宙飞船舱内 UI，仪表盘显示 F/m/a 实时数值，窗外星空使用真实星图' },
      { agent: 'QA', icon: '🧪', output: '测试：如果 m 为 0 → 飞船因无限加速度导致系统崩溃 → 已加质量下限保护；F 为负 → 启用反向推进器' },
    ],
  },
  college: {
    knowledge: '心脏瓣膜病：二尖瓣狭窄的诊断与治疗',
    gameplay: '急诊室值班医生（临床模拟）',
    steps: [
      { agent: 'Scholar', icon: '📚', output: '提取知识点：二尖瓣狭窄的病因、症状、体征、超声心动图表现，适用于大学医学' },
      { agent: 'Architect', icon: '🏗️', output: '决策：临床模拟玩法 → 将诊断知识转化为"急诊室接收呼吸困难患者"的完整诊疗流程', isKey: true },
      { agent: 'Balancer', icon: '⚖️', output: '调整：每轮病人 3-5 个诊断选项，错误诊断触发"不良事件"，正确诊断进入治疗方案选择（保守/手术）' },
      { agent: 'Art Director', icon: '🎨', output: '生成：医疗工作站风格 UI，电子病历、超声图像、生命体征监护仪，配色偏冷青色' },
      { agent: 'QA', icon: '🧪', output: '测试：如果玩家跳过听诊直接开检查 → 扣除"临床基本功"分；误诊为心衰 → 生成"失败分析报告"指出漏掉舒张期杂音' },
    ],
  },
}

// ── 工具函数 ──

// 获取架构师
export function getArchitect(grade) {
  return GAME_ARCHITECTS[grade] || GAME_ARCHITECTS.primary
}

// 从扭蛋池随机抽取 3 个玩法（不重复）
export function pullGacha(grade, count = 3) {
  const pool = (GAME_ARCHITECTS[grade]?.gachaPool) || []
  if (pool.length <= count) return [...pool]
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// 获取协作链示例
export function getChainExample(grade) {
  return CHAIN_EXAMPLES[grade] || CHAIN_EXAMPLES.primary
}

// 获取学段列表（用于 UI 渲染）
export const ARCHITECT_GRADES = [
  { id: 'primary', label: '小学', emoji: '🌲' },
  { id: 'junior', label: '初中', emoji: '🏫' },
  { id: 'senior', label: '高中', emoji: '⚡' },
  { id: 'college', label: '大学', emoji: '🔬' },
]
