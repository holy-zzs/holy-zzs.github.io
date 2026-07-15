// ═══════════════════════════════════════════════════════════
// 跨学段"知识-玩法"映射协议 (The Protocol)
// 定义不同学段的智能体如何将知识点映射为游戏玩法
// ═══════════════════════════════════════════════════════════

// ── 知识类型枚举 ──
export const KNOWLEDGE_TYPES = {
  CALCULATION: 'calculation',       // 计算/运算
  CONCEPT: 'concept',               // 概念/定义
  DERIVATION: 'derivation',         // 推导/证明
  EXPERIMENT: 'experiment',         // 实验/操作
  CASE_ANALYSIS: 'case_analysis',   // 案例分析
  MEMORIZATION: 'memorization',     // 记忆/背诵
  APPLICATION: 'application',       // 应用题/实际应用
  REASONING: 'reasoning',           // 逻辑推理
}

// ── 玩法类型枚举 ──
export const GAMEPLAY_TYPES = {
  // 小学玩法
  COLLECTION: 'collection',           // 收集奖励
  ROLE_EVOLUTION: 'role_evolution',   // 角色进化
  STORY_QUEST: 'story_quest',         // 童话冒险
  MUSIC_RHYTHM: 'music_rhythm',       // 音乐节奏
  COLORING_PUZZLE: 'coloring_puzzle', // 涂色拼图

  // 初中玩法
  SIMULATION: 'simulation',           // 模拟实验
  COMPETITION: 'competition',         // 竞技对战
  LIFE_SIM: 'life_sim',               // 生活模拟
  ESCAPE_ROOM: 'escape_room',         // 逃脱解谜

  // 高中玩法
  TIMED_CHALLENGE: 'timed_challenge', // 限时挑战
  KNOWLEDGE_MAP: 'knowledge_map',     // 知识图谱探索
  LOGIC_CHAIN: 'logic_chain',         // 逻辑门锁/证明链条
  ERROR_QUEST: 'error_quest',         // 错题大冒险

  // 大学玩法
  WAVE_SIMULATOR: 'wave_simulator',   // 波函数模拟器
  CODE_CHALLENGE: 'code_challenge',   // 编程挑战
  CASE_DIAGNOSIS: 'case_diagnosis',   // 病例诊断
  RESEARCH_PROJECT: 'research_project',// 研究项目
  DEBATE_ARENA: 'debate_arena',       // 辩论竞技场
  DATA_PIPELINE: 'data_pipeline',     // 数据流水线
}

// ── 映射规则定义 ──
// 每条规则：当输入包含某关键词 + 属于某学段 → 输出特定玩法
export const MAPPING_RULES = [

  // ═══════ 小学映射规则 ═══════
  {
    id: 'p_calc_01',
    grade: 'primary',
    knowledgeType: KNOWLEDGE_TYPES.CALCULATION,
    triggerKeywords: ['计算', '加减', '乘除', '算术', '运算'],
    gameplay: GAMEPLAY_TYPES.COLLECTION,
    gameplayName: '收集奖励',
    description: '把计算题变成"喂小兔子吃胡萝卜"的收集游戏',
    example: {
      input: '1+1=2',
      output: '喂给小兔子 1 个胡萝卜，再喂 1 个，小兔子吃了 2 个，开心地跳了一下！',
      mechanics: ['每答对一题获得食物道具', '集齐10个食物触发角色进化', '错误答案让小动物摇头提示'],
    },
  },
  {
    id: 'p_calc_02',
    grade: 'primary',
    knowledgeType: KNOWLEDGE_TYPES.CALCULATION,
    triggerKeywords: ['计算', '算', '数'],
    gameplay: GAMEPLAY_TYPES.ROLE_EVOLUTION,
    gameplayName: '角色进化',
    description: '答对题目让宠物角色升级进化',
    example: {
      input: '5×6=30',
      output: '小恐龙答对了！获得30点经验值，从幼龙进化为少年龙，翅膀变大了！',
      mechanics: ['每题答对获得经验值', '达到阈值触发进化动画', '进化后解锁新关卡区域'],
    },
  },
  {
    id: 'p_concept_01',
    grade: 'primary',
    knowledgeType: KNOWLEDGE_TYPES.CONCEPT,
    triggerKeywords: ['认识', '什么是', '概念', '形状'],
    gameplay: GAMEPLAY_TYPES.STORY_QUEST,
    gameplayName: '童话冒险',
    description: '将概念包装成童话故事中的冒险任务',
    example: {
      input: '认识三角形',
      output: '在魔法森林里，小精灵需要找到三块魔法石碑拼成三角形大门，才能进入下一关',
      mechanics: ['故事线串联知识点', 'NPC对话引导学习', '关卡Boss考察掌握情况'],
    },
  },
  {
    id: 'p_mem_01',
    grade: 'primary',
    knowledgeType: KNOWLEDGE_TYPES.MEMORIZATION,
    triggerKeywords: ['背诵', '记住', '生字', '单词'],
    gameplay: GAMEPLAY_TYPES.MUSIC_RHYTHM,
    gameplayName: '音乐节奏',
    description: '把记忆内容编成儿歌，跟着节奏点击',
    example: {
      input: '背诵乘法口诀',
      output: '跟着小熊鼓手的节拍，按节奏点击屏幕上的数字，唱对一句解锁下一段旋律',
      mechanics: ['节奏点击玩法', '连击加分机制', '全连解锁完整儿歌'],
    },
  },

  // ═══════ 初中映射规则 ═══════
  {
    id: 'j_exp_01',
    grade: 'junior',
    knowledgeType: KNOWLEDGE_TYPES.EXPERIMENT,
    triggerKeywords: ['实验', '反应', '电路', '力'],
    gameplay: GAMEPLAY_TYPES.SIMULATION,
    gameplayName: '模拟实验',
    description: '在虚拟实验室中操作实验，观察现象',
    example: {
      input: '化学反应：镁条燃烧',
      output: '在虚拟实验室里，用镊子夹住镁条，点燃酒精灯，观察镁条发出耀眼白光，生成白色固体',
      mechanics: ['拖拽操作实验器材', '实时反馈实验现象', '错误操作有安全提示'],
    },
  },
  {
    id: 'j_comp_01',
    grade: 'junior',
    knowledgeType: KNOWLEDGE_TYPES.APPLICATION,
    triggerKeywords: ['应用题', '求解', '计算'],
    gameplay: GAMEPLAY_TYPES.COMPETITION,
    gameplayName: '竞技对战',
    description: '把解题变成与AI对手的限时PK',
    example: {
      input: '一道一元二次方程应用题',
      output: '与AI同学PK：谁先正确解出方程谁得分，答错扣分，3局2胜定输赢',
      mechanics: ['限时答题PK', '连击加分机制', '段位升降系统'],
    },
  },
  {
    id: 'j_concept_01',
    grade: 'junior',
    knowledgeType: KNOWLEDGE_TYPES.CONCEPT,
    triggerKeywords: ['原理', '规律', '定理'],
    gameplay: GAMEPLAY_TYPES.LIFE_SIM,
    gameplayName: '生活模拟',
    description: '在虚拟城镇中用生活场景理解抽象概念',
    example: {
      input: '牛顿第三定律',
      output: '在虚拟溜冰场里推一下墙壁，角色反方向滑出去——作用力与反作用力',
      mechanics: ['生活场景互动', '物理引擎模拟', '概念可视化反馈'],
    },
  },

  // ═══════ 高中映射规则 ═══════
  {
    id: 's_der_01',
    grade: 'senior',
    knowledgeType: KNOWLEDGE_TYPES.DERIVATION,
    triggerKeywords: ['推导', '证明', '论证', '步骤'],
    gameplay: GAMEPLAY_TYPES.LOGIC_CHAIN,
    gameplayName: '逻辑门锁',
    description: '把推导过程变成逻辑门链，每一步正确才能解锁下一门',
    example: {
      input: '证明：sin²θ + cos²θ = 1',
      output: '从起点出发，每一步推导是一个逻辑门：选择正确公式→门开→下一步→错误公式→门锁死→需重试',
      mechanics: ['步骤选择式推进', '错误步骤立即反馈', '完整链条解锁成就'],
    },
  },
  {
    id: 's_app_01',
    grade: 'senior',
    knowledgeType: KNOWLEDGE_TYPES.APPLICATION,
    triggerKeywords: ['大题', '综合', '计算'],
    gameplay: GAMEPLAY_TYPES.TIMED_CHALLENGE,
    gameplayName: '限时挑战',
    description: '高考模拟限时答题，训练时间管理',
    example: {
      input: '一道导数综合大题',
      output: '倒计时12分钟，每步操作有时间记录，完成度+正确率双重评分，与历史最佳PK',
      mechanics: ['实时倒计时', '分步评分', '时间分配分析报告'],
    },
  },
  {
    id: 's_concept_01',
    grade: 'senior',
    knowledgeType: KNOWLEDGE_TYPES.CONCEPT,
    triggerKeywords: ['知识体系', '章节', '联系'],
    gameplay: GAMEPLAY_TYPES.KNOWLEDGE_MAP,
    gameplayName: '知识图谱探索',
    description: '在3D知识图谱中探索章节间的联系',
    example: {
      input: '函数章节知识体系',
      output: '3D星图中每个知识点是一颗星，正确连接知识点之间的引力线，点亮整片函数星域',
      mechanics: ['3D知识星图', '连线答题机制', '点亮区域成就'],
    },
  },
  {
    id: 's_reason_01',
    grade: 'senior',
    knowledgeType: KNOWLEDGE_TYPES.REASONING,
    triggerKeywords: ['推理', '逻辑', '判断'],
    gameplay: GAMEPLAY_TYPES.ERROR_QUEST,
    gameplayName: '错题大冒险',
    description: '在错误推理的迷宫中找到正确路径',
    example: {
      input: '含错误步骤的推导过程',
      output: '迷宫中每条路对应一个推理步骤，找出哪一步有逻辑错误，避开陷阱到达终点',
      mechanics: ['迷宫探索玩法', '错误识别机制', '路径最优评分'],
    },
  },

  // ═══════ 大学映射规则 ═══════
  {
    id: 'c_der_01',
    grade: 'college',
    knowledgeType: KNOWLEDGE_TYPES.DERIVATION,
    triggerKeywords: ['薛定谔', '波函数', '量子', '方程'],
    gameplay: GAMEPLAY_TYPES.WAVE_SIMULATOR,
    gameplayName: '波函数实时模拟器',
    description: '实时调整参数观察波函数变化',
    example: {
      input: '薛定谔方程',
      output: '调整势能V(x)滑块，实时观察波函数ψ(x)的概率分布变化，能级跃迁可视化',
      mechanics: ['参数实时滑块控制', '波函数3D可视化', '能级图同步更新'],
    },
  },
  {
    id: 'c_exp_01',
    grade: 'college',
    knowledgeType: KNOWLEDGE_TYPES.EXPERIMENT,
    triggerKeywords: ['编程', '算法', '代码', '实现'],
    gameplay: GAMEPLAY_TYPES.CODE_CHALLENGE,
    gameplayName: '编程挑战',
    description: '在IDE中完成算法实现，可视化运行过程',
    example: {
      input: '快速排序算法',
      output: '在代码编辑器中补全quickSort函数，运行后可视化pivot选择和分区过程，测试用例通关',
      mechanics: ['代码编辑器集成', '算法可视化', '测试用例验证'],
    },
  },
  {
    id: 'c_case_01',
    grade: 'college',
    knowledgeType: KNOWLEDGE_TYPES.CASE_ANALYSIS,
    triggerKeywords: ['病例', '诊断', '症状', '临床'],
    gameplay: GAMEPLAY_TYPES.CASE_DIAGNOSIS,
    gameplayName: '病例诊断',
    description: '模拟临床诊断全流程',
    example: {
      input: '心脏瓣膜病病例',
      output: '患者"王大爷"主诉呼吸困难，查看听诊音、超声心动图，从三个诊断选项中选择，选错有反馈',
      mechanics: ['病历阅读', '检查结果解读', '鉴别诊断选择', '3D解剖标注'],
    },
  },
  {
    id: 'c_research_01',
    grade: 'college',
    knowledgeType: KNOWLEDGE_TYPES.APPLICATION,
    triggerKeywords: ['研究', '论文', '课题'],
    gameplay: GAMEPLAY_TYPES.RESEARCH_PROJECT,
    gameplayName: '研究项目',
    description: '模拟科研全流程，从文献到实验到论文',
    example: {
      input: '毕业论文选题',
      output: '从文献综述开始，提出假设，设计实验，分析数据，撰写论文，导师NPC全程指导',
      mechanics: ['文献检索模拟', '实验设计选择', '数据分析工具', '论文撰写引导'],
    },
  },
  {
    id: 'c_debate_01',
    grade: 'college',
    knowledgeType: KNOWLEDGE_TYPES.REASONING,
    triggerKeywords: ['辩论', '论证', '思辨', '哲学'],
    gameplay: GAMEPLAY_TYPES.DEBATE_ARENA,
    gameplayName: '辩论竞技场',
    description: '与AI对手进行结构化辩论',
    example: {
      input: '功利主义 vs 义务论',
      output: '选择立场后，AI提出对立观点，你需要在限时内构建论证链，听众席投票决定胜负',
      mechanics: ['立场选择', '论证构建', '限时反驳', '观众投票评分'],
    },
  },
  {
    id: 'c_data_01',
    grade: 'college',
    knowledgeType: KNOWLEDGE_TYPES.CALCULATION,
    triggerKeywords: ['数据', '统计', '分析', '建模'],
    gameplay: GAMEPLAY_TYPES.DATA_PIPELINE,
    gameplayName: '数据流水线',
    description: '搭建数据处理流水线，可视化每一步变换',
    example: {
      input: '回归分析',
      output: '拖拽模块搭建数据流水线：数据源→清洗→特征工程→模型训练→评估，每个节点可视化中间结果',
      mechanics: ['模块化数据流', '可视化中间结果', '参数调优反馈'],
    },
  },
]

// ── 核心映射函数 ──
// 根据学段、知识文本和知识类型，返回匹配的玩法映射
export function mapKnowledgeToGameplay({ grade, text, knowledgeType }) {
  // 1. 按学段过滤
  const gradeRules = MAPPING_RULES.filter(r => r.grade === grade)

  // 2. 如果指定了 knowledgeType，优先匹配
  let matched = []
  if (knowledgeType) {
    matched = gradeRules.filter(r => r.knowledgeType === knowledgeType)
  }

  // 3. 关键词匹配
  if (matched.length === 0 && text) {
    const lowerText = text.toLowerCase()
    matched = gradeRules.filter(r =>
      r.triggerKeywords.some(kw => lowerText.includes(kw.toLowerCase()))
    )
  }

  // 4. 兜底：取该学段第一条规则
  if (matched.length === 0) {
    matched = gradeRules.slice(0, 1)
  }

  // 5. 没有该学段规则，用默认
  if (matched.length === 0) {
    return {
      grade: grade || 'unknown',
      gameplay: null,
      gameplayName: '暂无匹配玩法',
      description: '该学段暂无匹配的映射规则',
      example: null,
      rules: [],
    }
  }

  return {
    grade,
    matchedCount: matched.length,
    rules: matched.map(r => ({
      gameplay: r.gameplay,
      gameplayName: r.gameplayName,
      description: r.description,
      example: r.example,
      mechanics: r.example?.mechanics || [],
    })),
    // 默认推荐第一个匹配
    recommended: {
      gameplay: matched[0].gameplay,
      gameplayName: matched[0].gameplayName,
      description: matched[0].description,
      example: matched[0].example,
    },
  }
}

// ── 获取学段所有可用玩法 ──
export function getGameplaysByGrade(grade) {
  const rules = MAPPING_RULES.filter(r => r.grade === grade)
  const gameplays = []
  const seen = new Set()
  rules.forEach(r => {
    if (!seen.has(r.gameplay)) {
      seen.add(r.gameplay)
      gameplays.push({
        type: r.gameplay,
        name: r.gameplayName,
        description: r.description,
      })
    }
  })
  return gameplays
}

// ── 获取学段映射规则的思维模式描述 ──
// 展示AI如何根据 applicableLevel 字段改变思维方式
export function getGradeThinkingMode(grade) {
  const modes = {
    primary: {
      title: '童话包装思维',
      description: '一切知识点都可以变成故事和游戏，用"可爱""有趣""奖励"三个关键词驱动设计',
      principles: [
        '每个知识点都有一个"角色"代言',
        '正确答案带来"视觉奖励"（动画、音效、星星）',
        '错误不是惩罚，是"再试一次"的温柔引导',
        '复杂概念拆解为3步以内的简单操作',
      ],
    },
    junior: {
      title: '生活关联思维',
      description: '抽象知识必须锚定到生活经验，用"我见过""我做过"建立理解桥梁',
      principles: [
        '每个公式都有一个"生活原型"',
        '竞争机制激发青春期好胜心',
        '实验操作让抽象变具体',
        '允许犯错，但要从错误中学习',
      ],
    },
    senior: {
      title: '系统应试思维',
      description: '知识不是孤岛，是考点网络。高效得分和深度理解并行',
      principles: [
        '每个知识点映射到高考考点权重',
        '推导过程是"逻辑链"不是"背诵段"',
        '时间管理是核心技能',
        '错题是最有价值的学习资源',
      ],
    },
    college: {
      title: '科研探索思维',
      description: '从"学知识"到"做研究"，开放性问题比标准答案更重要',
      principles: [
        '知识点是研究的起点不是终点',
        '参数化模拟比静态记忆更有效',
        '案例驱动，真实数据胜过教科书例题',
        '鼓励提出"为什么"而非只回答"是什么"',
      ],
    },
  }
  return modes[grade] || modes.primary
}

// ── T16 医学临床队专属演示数据 ──
export const T16_DEMO = {
  teamId: 't16',
  teamName: '大学医学临床队',
  input: {
    text: '心脏瓣膜病：二尖瓣狭窄是风湿性心脏病的常见表现。主要症状包括劳力性呼吸困难、夜间阵发性呼吸困难、咳嗽咯血。体征：心尖区舒张期隆隆样杂音，第一心音亢进。超声心动图可见二尖瓣叶增厚、开放受限，瓣口面积减小（正常4-6cm²，轻度狭窄>1.5cm²，重度<1.0cm²）。',
    knowledgeType: KNOWLEDGE_TYPES.CASE_ANALYSIS,
    grade: 'college',
  },
  agentWorkFlow: [
    {
      agentId: 'u12',
      agentName: '临床模拟师',
      role: '病例生成',
      output: {
        patientName: '王大爷',
        age: 68,
        complaint: '近3个月爬2层楼就喘，夜里有时被憋醒，需要坐起来才好转',
        history: '30年前风湿热病史，未规律治疗',
        vitals: { BP: '110/70mmHg', HR: '92次/分', RR: '22次/分' },
      },
    },
    {
      agentId: 'u13',
      agentName: '解剖可视化专家',
      role: '3D标注',
      output: {
        target: '二尖瓣',
        position: '左心房与左心室之间',
        markers: [
          { label: '二尖瓣前叶', status: '增厚', color: '#FF6B6B' },
          { label: '二尖瓣后叶', status: '粘连', color: '#FFA94D' },
          { label: '瓣口面积', value: '0.8cm²', severity: '重度狭窄' },
        ],
        prompt3D: '生成二尖瓣狭窄的3D模型，展示瓣叶增厚、交界处粘连、舒张期开放受限，血流从左心房通过狭窄瓣口进入左心房时呈湍流',
      },
    },
    {
      agentId: 'u11',
      agentName: '案例分析专家',
      role: '诊断选项设计',
      output: {
        question: '根据病史和体征，最可能的诊断是？',
        options: [
          { id: 'A', text: '二尖瓣狭窄（正确）', correct: true, explanation: '风湿热病史+劳力性呼吸困难+心尖区舒张期隆隆样杂音，典型二尖瓣狭窄表现' },
          { id: 'B', text: '主动脉瓣关闭不全', correct: false, explanation: '主动脉瓣关闭不全表现为舒张期叹气样杂音，非隆隆样杂音' },
          { id: 'C', text: '扩张型心肌病', correct: false, explanation: '心肌病通常无心尖区舒张期隆隆样杂音，超声心动图可见心腔扩大' },
        ],
      },
    },
  ],
  finalOutput: {
    gameType: 'case_diagnosis',
    gameName: '心脏诊室：王大爷的呼吸困难',
    description: '玩家扮演心内科医生，通过问诊、听诊、超声检查逐步锁定诊断，体验真实临床思维过程',
    mechanics: [
      '病历阅读 + 关键信息提取',
      '听诊器互动：辨别舒张期隆隆样杂音',
      '超声心动图3D标注挑战',
      '三选一鉴别诊断 + 病理机制解释',
    ],
  },
}
