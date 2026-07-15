// 平台共享数据：学段、学科、预设团队、视觉风格、热梗文案

// ── 学段定义 ──
export const GRADES = [
  {
    id: 'primary', name: '小学', emoji: '🧒', color: '#22c55e',
    gradient: 'from-green-400 to-emerald-500',
    slogan: '从小爱上学习，有手就行',
    desc: '趣味启蒙，让知识自己跑进脑子里'
  },
  {
    id: 'junior', name: '初中', emoji: '👦', color: '#3b82f6',
    gradient: 'from-blue-400 to-indigo-500',
    slogan: '中考冲刺，含金量拉满',
    desc: '把考点变成关卡，复习不再痛苦'
  },
  {
    id: 'senior', name: '高中', emoji: '🧑', color: '#8b5cf6',
    gradient: 'from-violet-400 to-purple-500',
    slogan: '高考上岸，这不比刷题燃？',
    desc: '知识硬控，一玩就停不下来'
  },
  {
    id: 'college', name: '大学', emoji: '🎓', color: '#F5A623',
    gradient: 'from-amber-400 to-orange-500',
    slogan: '期末不挂科，稳住我们能赢',
    desc: '专业课再难，也能变成游戏'
  }
]

// ── 学科定义（按学段动态变化，支持三级展开）──
// 每个一级学科包含 children（二级）和 scenes（三级场景）
// uses = mock 使用量，用于排序和热门标识

export const SUBJECTS = {
  primary: [
    {
      id: 'low', name: '低年级', emoji: '🌱', desc: '1-3年级语文数学启蒙',
      teamCount: 8, uses: 620, tags: ['拼音识字', '加减乘除', '英语启蒙'],
      children: [
        { id: 'low_chinese', name: '语文', emoji: '📝', desc: '拼音/识字/简单阅读', uses: 280 },
        { id: 'low_math', name: '数学', emoji: '🔢', desc: '加减法/认识图形', uses: 220 },
        { id: 'low_english', name: '英语', emoji: '🔤', desc: '字母/日常单词', uses: 120 }
      ]
    },
    {
      id: 'high', name: '高年级', emoji: '🌿', desc: '4-6年级全科提升',
      teamCount: 12, uses: 890, tags: ['阅读理解', '分数小数', '语法基础'],
      children: [
        { id: 'high_chinese', name: '语文', emoji: '📖', desc: '阅读理解/作文', uses: 340 },
        { id: 'high_math', name: '数学', emoji: '📐', desc: '分数/小数/几何', uses: 300 },
        { id: 'high_english', name: '英语', emoji: '🗣️', desc: '语法/短文', uses: 150 },
        { id: 'high_science', name: '科学', emoji: '🔬', desc: '自然/科学常识', uses: 100 }
      ]
    },
    {
      id: 'math', name: '小学奥数', emoji: '🧮', desc: '思维训练拓展拔高',
      teamCount: 6, uses: 310, tags: ['逻辑推理', '数形结合', '应用题'],
      children: [
        { id: 'math_basic', name: '基础奥数', emoji: '✏️', desc: '找规律/简单逻辑', uses: 160 },
        { id: 'math_advance', name: '进阶奥数', emoji: '🧩', desc: '行程/工程/数论', uses: 100 },
        { id: 'math_competition', name: '竞赛入门', emoji: '🏆', desc: '华罗庚金杯/希望杯', uses: 50 }
      ]
    },
    {
      id: 'transition', name: '小升初衔接', emoji: '🌉', desc: '平稳过渡到初中',
      teamCount: 4, uses: 180, tags: ['查漏补缺', '预习衔接'],
      children: [
        { id: 'trans_review', name: '复习巩固', emoji: '📋', desc: '小学知识系统梳理', uses: 100 },
        { id: 'trans_preview', name: '初中预习', emoji: '👁️', desc: '初中重点科目提前学', uses: 80 }
      ]
    }
  ],

  junior: [
    {
      id: 'arts', name: '文科', emoji: '📖', desc: '语文/英语/历史/道法',
      teamCount: 10, uses: 720, tags: ['阅读写作', '语言记忆', '史实梳理'],
      children: [
        { id: 'j_chinese', name: '语文', emoji: '📚', desc: '文言文/现代文/作文', uses: 280 },
        { id: 'j_english', name: '英语', emoji: '🌐', desc: '语法/阅读/完形', uses: 240 },
        { id: 'j_history', name: '历史', emoji: '📜', desc: '中国史/世界史', uses: 120 },
        { id: 'j_daofa', name: '道法', emoji: '⚖️', desc: '道德与法治', uses: 80 }
      ]
    },
    {
      id: 'science', name: '理科', emoji: '🔬', desc: '数学/物理/化学/生物',
      teamCount: 14, uses: 1080, tags: ['公式推导', '实验操作', '逻辑证明'],
      children: [
        { id: 'j_math', name: '数学', emoji: '📐', desc: '代数/几何/函数', uses: 380 },
        { id: 'j_physics', name: '物理', emoji: '⚛️', desc: '力学/电学/光学', uses: 280 },
        { id: 'j_chem', name: '化学', emoji: '🧪', desc: '元素/方程式/实验', uses: 220 },
        { id: 'j_bio', name: '生物', emoji: '🧬', desc: '细胞/遗传/生态系统', uses: 200 }
      ]
    },
    {
      id: 'exam', name: '中考冲刺', emoji: '🔥', desc: '全科中考复习',
      teamCount: 8, uses: 560, tags: ['真题演练', '高频考点', '限时训练'],
      children: [
        { id: 'exam_science', name: '理科冲刺', emoji: '⚡', desc: '数理化高频考点', uses: 280 },
        { id: 'exam_arts', name: '文科冲刺', emoji: '📖', desc: '语英政史冲刺', uses: 180 },
        { id: 'exam_full', name: '全科模拟', emoji: '🎯', desc: '全科真题模拟', uses: 100 }
      ]
    },
    {
      id: 'new_subject', name: '新学科入门', emoji: '🆕', desc: '物理/化学新开课',
      teamCount: 6, uses: 320, tags: ['零基础', '兴趣培养', '实验入门'],
      children: [
        { id: 'new_physics', name: '物理入门', emoji: '🍎', desc: '声光力热初识', uses: 180 },
        { id: 'new_chem', name: '化学入门', emoji: '⚗️', desc: '元素周期表/基本实验', uses: 140 }
      ]
    }
  ],

  senior: [
    {
      id: 'arts', name: '文科', emoji: '📚', desc: '语数外+政史地',
      teamCount: 12, uses: 680, tags: ['论述写作', '史料分析', '地理图表'],
      children: [
        { id: 's_chinese', name: '语文', emoji: '📖', desc: '古文/现代文/作文', uses: 220 },
        { id: 's_english', name: '英语', emoji: '🗣️', desc: '阅读/完形/语法', uses: 200 },
        { id: 's_history', name: '历史', emoji: '🏛️', desc: '中国近现代史/世界史', uses: 100 },
        { id: 's_geo', name: '地理', emoji: '🌍', desc: '自然/人文地理', uses: 90 },
        { id: 's_politics', name: '政治', emoji: '📋', desc: '经济/哲学/政治', uses: 70 }
      ]
    },
    {
      id: 'science', name: '理科', emoji: '⚗️', desc: '语数外+理化生',
      teamCount: 14, uses: 1120, tags: ['解析几何', '有机化学', '遗传计算'],
      children: [
        { id: 's_math', name: '数学', emoji: '📐', desc: '函数/解析几何/导数', uses: 380 },
        { id: 's_physics', name: '物理', emoji: '⚛️', desc: '力学/电磁学/热学', uses: 300 },
        { id: 's_chem', name: '化学', emoji: '🧪', desc: '有机/无机/实验', uses: 240 },
        { id: 's_bio', name: '生物', emoji: '🧬', desc: '遗传/细胞/生态', uses: 200 }
      ]
    },
    {
      id: 'newgaokao', name: '新高考选考', emoji: '🎯', desc: '3+1+2自由组合',
      teamCount: 10, uses: 520, tags: ['选科组合', '等级赋分', '志愿规划'],
      children: [
        { id: 'ng_physics_group', name: '物理组', emoji: '⚛️', desc: '物理+化/生/地', uses: 280 },
        { id: 'ng_history_group', name: '历史组', emoji: '📜', desc: '历史+政/地/化', uses: 160 },
        { id: 'ng_strategy', name: '选科策略', emoji: '🧭', desc: '专业覆盖/赋分优势', uses: 80 }
      ]
    },
    {
      id: 'sprint', name: '高考冲刺', emoji: '🚀', desc: '最后百天冲刺',
      teamCount: 8, uses: 640, tags: ['真题难度', '高频考点', '限时模考'],
      children: [
        { id: 'sp_science', name: '理科冲刺', emoji: '⚡', desc: '数理化高频', uses: 300 },
        { id: 'sp_arts', name: '文科冲刺', emoji: '📖', desc: '语英政史地', uses: 200 },
        { id: 'sp_math', name: '数学专项', emoji: '🎯', desc: '压轴题/选填', uses: 140 }
      ]
    },
    {
      id: 'competition', name: '学科竞赛', emoji: '🏅', desc: '数理化生信奥赛',
      teamCount: 6, uses: 280, tags: ['竞赛真题', '超纲拓展', '一试二试'],
      children: [
        { id: 'comp_math', name: '数学竞赛', emoji: '🔢', desc: '一试/二试/CMO', uses: 120 },
        { id: 'comp_physics', name: '物理竞赛', emoji: '⚛️', desc: '预赛/复赛/CPhO', uses: 80 },
        { id: 'comp_chem', name: '化学竞赛', emoji: '🧪', desc: '初赛/决赛/CChO', uses: 50 },
        { id: 'comp_bio', name: '生物竞赛', emoji: '🧬', desc: '联赛/国赛/CBO', uses: 30 }
      ]
    }
  ],

  college: [
    {
      id: 'science', name: '理学', emoji: '🧪', desc: '数学/物理/化学/生物',
      teamCount: 16, uses: 1240, tags: ['公式推导', '虚拟实验', '科研思维'],
      children: [
        { id: 'c_math', name: '数学', emoji: '∫', desc: '高数/线代/概率论', uses: 380, scenes: ['期末备考', '考研复习', '科研入门'] },
        { id: 'c_physics', name: '物理学', emoji: '⚛️', desc: '力学/电磁/量子', uses: 280, scenes: ['期末备考', '考研复习', '实验设计'] },
        { id: 'c_chem', name: '化学', emoji: '🧪', desc: '无机/有机/物化', uses: 220, scenes: ['期末备考', '科研入门', '实验设计'] },
        { id: 'c_bio', name: '生物学', emoji: '🧬', desc: '生化/遗传/生态', uses: 200, scenes: ['期末备考', '科研入门', '论文写作'] },
        { id: 'c_geo', name: '地理学', emoji: '🌍', desc: '自然/人文/GIS', uses: 100, scenes: ['期末备考', '科研入门'] },
        { id: 'c_stat', name: '统计学', emoji: '📊', desc: '数理统计/应用统计', uses: 60, scenes: ['期末备考', '考研复习'] }
      ]
    },
    {
      id: 'engineering', name: '工学', emoji: '⚙️', desc: '计算机/机械/电子/土木',
      teamCount: 20, uses: 1860, tags: ['代码实战', '工程仿真', '项目设计'],
      children: [
        { id: 'c_cs', name: '计算机', emoji: '💻', desc: '数据结构/算法/操作系统', uses: 520, scenes: ['期末备考', '考研复习', '科研入门', '面试准备'] },
        { id: 'c_mech', name: '机械工程', emoji: '🔧', desc: '力学/制图/制造', uses: 280, scenes: ['期末备考', '课程设计'] },
        { id: 'c_ee', name: '电子工程', emoji: '🔌', desc: '电路/信号/电磁场', uses: 260, scenes: ['期末备考', '实验设计', '考研复习'] },
        { id: 'c_civil', name: '土木工程', emoji: '🏗️', desc: '力学/结构/材料', uses: 200, scenes: ['期末备考', '课程设计'] },
        { id: 'c_chem_eng', name: '化工', emoji: '⚗️', desc: '化工原理/反应工程', uses: 160, scenes: ['期末备考', '实验设计'] },
        { id: 'c_mat', name: '材料科学', emoji: '🔬', desc: '材料力学/热处理', uses: 140, scenes: ['期末备考', '科研入门'] },
        { id: 'c_optics', name: '光学工程', emoji: '💡', desc: '几何光学/物理光学', uses: 80, scenes: ['期末备考', '科研入门'] }
      ]
    },
    {
      id: 'humanities', name: '人文社科', emoji: '🏛️', desc: '文学/历史/哲学/法学',
      teamCount: 12, uses: 680, tags: ['文献阅读', '论文写作', '思辨训练'],
      children: [
        { id: 'c_lit', name: '文学', emoji: '📖', desc: '中外文学/文学理论', uses: 200, scenes: ['期末备考', '论文写作', '考研复习'] },
        { id: 'c_phil', name: '哲学', emoji: '🤔', desc: '中西哲学/逻辑学', uses: 120, scenes: ['期末备考', '论文写作'] },
        { id: 'c_hist', name: '历史学', emoji: '📜', desc: '中国史/世界史', uses: 160, scenes: ['期末备考', '论文写作', '考研复习'] },
        { id: 'c_ling', name: '语言学', emoji: '🗣️', desc: '应用语言学/汉语', uses: 100, scenes: ['期末备考', '论文写作'] },
        { id: 'c_journalism', name: '新闻传播', emoji: '📰', desc: '新闻学/传播学', uses: 100, scenes: ['期末备考', '论文写作'] }
      ]
    },
    {
      id: 'medicine', name: '医学', emoji: '⚕️', desc: '基础医学/临床/药学',
      teamCount: 10, uses: 540, tags: ['解剖记忆', '临床模拟', '药理推导'],
      children: [
        { id: 'c_basic_med', name: '基础医学', emoji: '🫀', desc: '解剖/生理/生化', uses: 200, scenes: ['期末备考', '执业医师'] },
        { id: 'c_clinical', name: '临床医学', emoji: '🩺', desc: '内科/外科/诊断', uses: 180, scenes: ['期末备考', '执业医师', '规培'] },
        { id: 'c_pharma', name: '药学', emoji: '💊', desc: '药理/药剂/药物化学', uses: 100, scenes: ['期末备考', '执业药师'] },
        { id: 'c_nursing', name: '护理学', emoji: '🏥', desc: '护理学/临床护理', uses: 60, scenes: ['期末备考', '资格考试'] }
      ]
    },
    {
      id: 'econ_law', name: '经管法学', emoji: '📈', desc: '经济/管理/法学/金融',
      teamCount: 14, uses: 820, tags: ['案例分析', '计算推导', '法条记忆'],
      children: [
        { id: 'c_econ', name: '经济学', emoji: '💰', desc: '微观/宏观/计量', uses: 220, scenes: ['期末备考', '考研复习', '论文写作'] },
        { id: 'c_mgmt', name: '管理学', emoji: '📊', desc: '管理原理/组织行为', uses: 180, scenes: ['期末备考', '案例分析'] },
        { id: 'c_law', name: '法学', emoji: '⚖️', desc: '民法/刑法/行政法', uses: 200, scenes: ['期末备考', '法考冲刺', '论文写作'] },
        { id: 'c_finance', name: '金融学', emoji: '🏦', desc: '公司金融/投资学', uses: 220, scenes: ['期末备考', '考研复习', 'CFA'] }
      ]
    },
    {
      id: 'agriculture', name: '农学', emoji: '🌾', desc: '植物/动物/食品科学',
      teamCount: 6, uses: 240, tags: ['实验设计', '田间统计', '案例分析'],
      children: [
        { id: 'c_agronomy', name: '植物生产', emoji: '🌱', desc: '作物学/园艺学', uses: 100, scenes: ['期末备考', '实验设计'] },
        { id: 'c_animal', name: '动物科学', emoji: '🐮', desc: '动物营养/繁殖', uses: 60, scenes: ['期末备考', '实验设计'] },
        { id: 'c_food', name: '食品科学', emoji: '🍱', desc: '食品加工/安全', uses: 80, scenes: ['期末备考', '科研入门'] }
      ]
    },
    {
      id: 'arts', name: '艺术学', emoji: '🎨', desc: '美术/音乐/设计/戏剧',
      teamCount: 8, uses: 320, tags: ['审美训练', '创作实践', '理论鉴赏'],
      children: [
        { id: 'c_fine_art', name: '美术学', emoji: '🖼️', desc: '中外美术史/绘画', uses: 100, scenes: ['期末备考', '考研复习'] },
        { id: 'c_music', name: '音乐学', emoji: '🎵', desc: '乐理/音乐史', uses: 80, scenes: ['期末备考', '考研复习'] },
        { id: 'c_design', name: '设计学', emoji: '✏️', desc: '视觉传达/工业设计', uses: 100, scenes: ['期末备考', '作品集'] },
        { id: 'c_drama', name: '戏剧影视', emoji: '🎭', desc: '戏剧学/影视学', uses: 40, scenes: ['期末备考', '论文写作'] }
      ]
    },
    {
      id: 'kaoyan', name: '考研公共课', emoji: '📝', desc: '政治/英语/数学',
      teamCount: 12, uses: 980, tags: ['真题精讲', '高频考点', '答题模板'],
      children: [
        { id: 'ky_politics', name: '政治', emoji: '📋', desc: '马原/毛中特/史纲', uses: 380, scenes: ['基础阶段', '强化阶段', '冲刺阶段'] },
        { id: 'ky_english', name: '英语', emoji: '🔤', desc: '阅读/翻译/写作', uses: 360, scenes: ['基础阶段', '强化阶段', '冲刺阶段'] },
        { id: 'ky_math', name: '数学', emoji: '📐', desc: '高数/线代/概率', uses: 240, scenes: ['基础阶段', '强化阶段', '冲刺阶段'] }
      ]
    }
  ]
}

// ── 快捷场景入口（按学段动态生成）──
export const QUICK_SCENES = {
  primary: [
    { id: 'fun', name: '趣味启蒙', emoji: '🎈', desc: '快乐学习第一步' },
    { id: 'habit', name: '习惯养成', emoji: '📅', desc: '培养学习好习惯' },
    { id: 'olympiad', name: '奥数挑战', emoji: '🧮', desc: '思维拓展拔高' },
    { id: 'transition', name: '小升初衔接', emoji: '🌉', desc: '平稳过渡初中' }
  ],
  junior: [
    { id: 'zhongkao', name: '中考冲刺', emoji: '🔥', desc: '全科中考复习' },
    { id: 'new_subject', name: '新科入门', emoji: '🆕', desc: '物理化学新开课' },
    { id: 'lab', name: '实验通关', emoji: '🧪', desc: '实验操作模拟' },
    { id: 'huikao', name: '会考备考', emoji: '📋', desc: '学业水平测试' }
  ],
  senior: [
    { id: 'gaokao', name: '高考冲刺', emoji: '🚀', desc: '最后百天冲刺' },
    { id: 'competition', name: '竞赛特训', emoji: '🏅', desc: '五大学科竞赛' },
    { id: 'xuekao', name: '学考备考', emoji: '📝', desc: '学业水平考试' },
    { id: 'gap_fill', name: '查漏补缺', emoji: '🔍', desc: '薄弱知识点专项' }
  ],
  college: [
    { id: 'finals', name: '期末速通', emoji: '⚡', desc: '期末不挂科' },
    { id: 'kaoyan', name: '考研备战', emoji: '📝', desc: '考研全科目' },
    { id: 'research', name: '科研入门', emoji: '🔬', desc: '论文/实验设计' },
    { id: 'thesis', name: '论文助攻', emoji: '✍️', desc: '毕业论文/课程论文' }
  ]
}

// ── 学段引导文案 ──
export const GRADE_GUIDE = {
  primary: '保护好好奇心，游戏是最好的老师',
  junior: '探索世界的阶段，让学习像冒险一样',
  senior: '时间紧任务重，我们帮你高效搞定',
  college: '你的知识已经很深了，我们来让它更有趣'
}

// ── 三级场景标签（通用，各二级学科可覆盖）──
export const DEFAULT_SCENES = ['期末备考', '考研复习', '科研入门', '论文写作', '实验设计', '资格考试']

// ── 搜索 placeholder（按学段变化）──
export const SEARCH_PLACEHOLDER = {
  primary: '搜索科目、年级、能力点…',
  junior: '搜索科目、实验、知识点…',
  senior: '搜索科目、考点、题型…',
  college: '搜索学科、课程名、知识点…'
}

// ── 团队推荐匹配逻辑 ──
// 接收 { grade, subject1Id, subject2Ids[] } 返回匹配的预设团队数组
export function recommendTeams({ grade, subject1Id, subject2Ids = [] }) {
  if (!grade) return PRESET_TEAMS.slice(0, 3)

  // 先按学段筛选
  let gradeTeams = PRESET_TEAMS.filter(t => t.grade === grade)
  if (gradeTeams.length === 0) gradeTeams = PRESET_TEAMS.slice(0, 3)

  // 再按学科匹配打分
  const isScience = subject1Id && ['science', 'engineering', 'math'].includes(subject1Id)
  const isArts = subject1Id && ['arts', 'humanities'].includes(subject1Id)
  const isExam = subject1Id && ['exam', 'sprint', 'competition', 'kaoyan'].includes(subject1Id)
  const isMed = subject1Id === 'medicine'
  const isMulti = subject2Ids.length > 1

  let scored = gradeTeams.map(t => {
    let score = t.uses // 基础分 = 使用量
    if (isScience && t.tags.some(tag => ['公式推导', '逻辑解谜', '理工科', '沙盒操作', '实验模拟', '代码实战', '工程仿真'].includes(tag))) score += 2000
    if (isArts && t.tags.some(tag => ['剧情驱动', '角色扮演', '文科', '文献阅读', '论文写作', '思辨训练'].includes(tag))) score += 2000
    if (isExam && t.tags.some(tag => ['限时推理', '综合复习', '收集养成', '高考真题', '高频考点', '真题精讲', '答题模板'].includes(tag))) score += 2000
    if (isMed && t.tags.some(tag => ['收集养成', '记忆强化', '病例分析', '临床模拟', '解剖记忆'].includes(tag))) score += 1500
    if (isMulti && t.tags.includes('综合复习')) score += 1500
    return { ...t, _score: score }
  })
  scored.sort((a, b) => b._score - a._score)
  return scored.slice(0, 3)
}

// ── 预设团队模板（20个，按学段分组）──
// 新增 grade 字段：primary/junior/senior/college
export const PRESET_TEAMS = [
  // ── 小学阶段（4个）──
  {
    id: 'team_primary_fun', name: '小学趣味启蒙队', emoji: '🎈',
    desc: '拼音识字加减法变成童话冒险，小朋友玩着玩着就学会了',
    gameType: 'narrative', gameTypeName: '童话冒险',
    agents: ['p01', 'p02', 'p04', 'scholar'],
    agentNames: ['萌新王', '小画霸', '星探长', '学神本神'],
    agentEmojis: ['👑', '🎨', '⭐', '📚'],
    suitableFor: '低年级，语文/数学/英语基础',
    rating: 4.9, uses: 5230, estTime: '3-4分钟',
    tags: ['新手友好', '寓教于乐', '亲子互动'],
    grade: 'primary', gradeName: '小学'
  },
  {
    id: 'team_primary_explore', name: '小学探索冒险队', emoji: '🧭',
    desc: '在虚拟世界探索科学奥秘，动手实验发现规律',
    gameType: 'simulation', gameTypeName: '模拟探索',
    agents: ['m01', 'm03', 'm04', 'p05'],
    agentNames: ['生活家', '试管精', 'PK王', '亲子侠'],
    agentEmojis: ['🏠', '🧪', '⚔️', '👨\u200d👩\u200d👧'],
    suitableFor: '高年级，科学/数学探索',
    rating: 4.8, uses: 3890, estTime: '4-5分钟',
    tags: ['探索发现', '实验模拟', '亲子互动'],
    grade: 'primary', gradeName: '小学'
  },
  {
    id: 'team_primary_art', name: '小学艺术创想队', emoji: '🎼',
    desc: '用节拍和色彩记住知识，边玩边培养艺术细胞',
    gameType: 'rhythm', gameTypeName: '音乐节奏',
    agents: ['p02', 'p03', 'p01', 'scholar'],
    agentNames: ['小画霸', '节奏崽', '萌新王', '学神本神'],
    agentEmojis: ['🎨', '🎵', '👑', '📚'],
    suitableFor: '音乐/美术/创意表达',
    rating: 4.7, uses: 2150, estTime: '3-4分钟',
    tags: ['创意表达', '音乐启蒙', '美术设计'],
    grade: 'primary', gradeName: '小学'
  },
  {
    id: 'team_primary_olympiad', name: '小学奥数挑战队', emoji: '🧮',
    desc: '奥数题变成闯关挑战，逻辑推理越玩越上头',
    gameType: 'puzzle', gameTypeName: '逻辑闯关',
    agents: ['h02', 'm04', 'p04', 'p05'],
    agentNames: ['推理怪', 'PK王', '星探长', '亲子侠'],
    agentEmojis: ['🔗', '⚔️', '⭐', '👨\u200d👩\u200d👧'],
    suitableFor: '奥数/竞赛训练',
    rating: 4.6, uses: 1680, estTime: '5-6分钟',
    tags: ['逻辑推理', '竞赛训练', '挑战进阶'],
    grade: 'primary', gradeName: '小学'
  },

  // ── 初中阶段（4个）──
  {
    id: 'team_junior_science', name: '初中理科实验队', emoji: '🔬',
    desc: '理化生实验搬进虚拟实验室，安全直观又好懂',
    gameType: 'simulation', gameTypeName: '模拟实验',
    agents: ['m03', 'm01', 'm05', 'experience'],
    agentNames: ['试管精', '生活家', '图表控', '破防体验官'],
    agentEmojis: ['🧪', '🏠', '📊', '🫠'],
    suitableFor: '物理/化学/生物',
    rating: 4.8, uses: 4120, estTime: '4-5分钟',
    tags: ['实验模拟', '生活化教学', '可视化'],
    grade: 'junior', gradeName: '初中'
  },
  {
    id: 'team_junior_arts', name: '初中文科思辨队', emoji: '📖',
    desc: '文科知识融入剧情选择，青春期也能爱上背诵',
    gameType: 'narrative', gameTypeName: '剧情选择',
    agents: ['m01', 'm04', 'm02', 'm05'],
    agentNames: ['生活家', 'PK王', '脑力怪', '图表控'],
    agentEmojis: ['🏠', '⚔️', '🧠', '📊'],
    suitableFor: '语文/英语/历史/地理',
    rating: 4.7, uses: 3450, estTime: '4-5分钟',
    tags: ['剧情驱动', '竞技PK', '青春期友好'],
    grade: 'junior', gradeName: '初中'
  },
  {
    id: 'team_junior_exam', name: '初中中考冲刺队', emoji: '🔥',
    desc: '中考考点变密室线索，限时逃出复习牢笼',
    gameType: 'escape', gameTypeName: '密室逃脱',
    agents: ['h03', 'h04', 'm04', 'h05'],
    agentNames: ['解网王', '速通侠', 'PK王', '应援团'],
    agentEmojis: ['🕸️', '⚡', '⚔️', '🫂'],
    suitableFor: '中考备考',
    rating: 4.9, uses: 5680, estTime: '5-6分钟',
    tags: ['综合复习', '限时训练', '考点密集'],
    grade: 'junior', gradeName: '初中'
  },
  {
    id: 'team_junior_easy', name: '初中轻松入门队', emoji: '🆕',
    desc: '新学科零基础入门，卡牌收集轻松搞定概念',
    gameType: 'card', gameTypeName: '卡牌策略',
    agents: ['m01', 'p04', 'm05', 'm02'],
    agentNames: ['生活家', '星探长', '图表控', '脑力怪'],
    agentEmojis: ['🏠', '⭐', '📊', '🧠'],
    suitableFor: '新学科入门（物理/化学）',
    rating: 4.6, uses: 2340, estTime: '3-4分钟',
    tags: ['零基础', '兴趣培养', '轻松入门'],
    grade: 'junior', gradeName: '初中'
  },

  // ── 高中阶段（4个）──
  {
    id: 'team_senior_science', name: '高中理科攻坚队', emoji: '⚗️',
    desc: '理科硬核知识变解谜关卡，公式推导也能上头',
    gameType: 'puzzle', gameTypeName: '解谜闯关',
    agents: ['h02', 'm03', 'h03', 'h04'],
    agentNames: ['推理怪', '试管精', '解网王', '速通侠'],
    agentEmojis: ['🔗', '🧪', '🕸️', '⚡'],
    suitableFor: '数学/物理/化学/生物',
    rating: 4.8, uses: 4890, estTime: '5-7分钟',
    tags: ['公式推导', '逻辑解谜', '理工科'],
    grade: 'senior', gradeName: '高中'
  },
  {
    id: 'team_senior_arts', name: '高中文科深耕队', emoji: '📚',
    desc: '文科考点融入叙事分支，论述写作不再发愁',
    gameType: 'narrative', gameTypeName: '叙事选择',
    agents: ['h03', 'h02', 'h04', 'h05'],
    agentNames: ['解网王', '推理怪', '速通侠', '应援团'],
    agentEmojis: ['🕸️', '🔗', '⚡', '🫂'],
    suitableFor: '语文/英语/历史/地理/政治',
    rating: 4.7, uses: 3670, estTime: '4-6分钟',
    tags: ['论述写作', '史料分析', '文科'],
    grade: 'senior', gradeName: '高中'
  },
  {
    id: 'team_senior_gaokao', name: '高中高考冲刺队', emoji: '🚀',
    desc: '高考真题变密室谜题，限时模考刺激又高效',
    gameType: 'escape', gameTypeName: '密室逃脱',
    agents: ['h01', 'h04', 'h03', 'h05'],
    agentNames: ['笔记狂', '速通侠', '解网王', '应援团'],
    agentEmojis: ['📝', '⚡', '🕸️', '🫂'],
    suitableFor: '高考全面备考',
    rating: 4.9, uses: 6230, estTime: '5-7分钟',
    tags: ['高考真题', '高频考点', '限时模考'],
    grade: 'senior', gradeName: '高中'
  },
  {
    id: 'team_senior_competition', name: '高中竞赛特训队', emoji: '🏅',
    desc: '竞赛真题化卡牌对战，超纲拓展挑战极限',
    gameType: 'card', gameTypeName: '卡牌策略',
    agents: ['h02', 'h01', 'm03', 'm04'],
    agentNames: ['推理怪', '笔记狂', '试管精', 'PK王'],
    agentEmojis: ['🔗', '📝', '🧪', '⚔️'],
    suitableFor: '学科竞赛训练',
    rating: 4.6, uses: 1890, estTime: '6-8分钟',
    tags: ['竞赛真题', '超纲拓展', '一试二试'],
    grade: 'senior', gradeName: '高中'
  },

  // ── 大学阶段（8个）──
  {
    id: 'team_college_science', name: '大学理学推导队', emoji: '🧪',
    desc: '理学公式推导变解谜，虚拟实验培养科研思维',
    gameType: 'puzzle', gameTypeName: '解谜闯关',
    agents: ['u01', 'u02', 'u03', 'u04'],
    agentNames: ['理论帝', '推导手', '实验狂', '研学长'],
    agentEmojis: ['🎩', '📝', '🔬', '🎓'],
    suitableFor: '数学/物理/化学/生物',
    rating: 4.8, uses: 3420, estTime: '5-7分钟',
    tags: ['公式推导', '虚拟实验', '科研思维'],
    grade: 'college', gradeName: '大学'
  },
  {
    id: 'team_college_engineering', name: '大学工学实战队', emoji: '⚙️',
    desc: '工科项目变模拟实战，代码工程一站搞定',
    gameType: 'simulation', gameTypeName: '模拟实验',
    agents: ['u05', 'u06', 'u07', 'tech'],
    agentNames: ['码农神', '工程狗', '硬件通', '能跑就行'],
    agentEmojis: ['💻', '📋', '🔌', '⚙️'],
    suitableFor: '计算机/机械/电子/土木',
    rating: 4.7, uses: 4560, estTime: '6-8分钟',
    tags: ['代码实战', '工程仿真', '项目设计'],
    grade: 'college', gradeName: '大学'
  },
  {
    id: 'team_college_humanities', name: '大学人文思辨队', emoji: '🏛️',
    desc: '人文社科变叙事思辨，文献论文不再头秃',
    gameType: 'narrative', gameTypeName: '叙事选择',
    agents: ['u08', 'u09', 'u10', 'u11'],
    agentNames: ['文豪君', '辩手王', '读书怪', '权衡官'],
    agentEmojis: ['📜', '🎤', '📖', '⚖️'],
    suitableFor: '文学/哲学/历史/法学',
    rating: 4.8, uses: 2890, estTime: '5-6分钟',
    tags: ['文献阅读', '论文写作', '思辨训练'],
    grade: 'college', gradeName: '大学'
  },
  {
    id: 'team_college_medicine', name: '大学医学临床队', emoji: '⚕️',
    desc: '病例分析变模拟诊疗，临床解剖记忆不枯燥',
    gameType: 'simulation', gameTypeName: '模拟实验',
    agents: ['u11', 'u03', 'u04', 'u02'],
    agentNames: ['权衡官', '实验狂', '研学长', '推导手'],
    agentEmojis: ['⚖️', '🔬', '🎓', '📝'],
    suitableFor: '基础医学/临床医学/药学',
    rating: 4.7, uses: 1980, estTime: '6-8分钟',
    tags: ['病例分析', '临床模拟', '解剖记忆'],
    grade: 'college', gradeName: '大学'
  },
  {
    id: 'team_college_econ', name: '大学经管案例队', emoji: '📈',
    desc: '经管案例变卡牌博弈，计算推导法条一网打尽',
    gameType: 'card', gameTypeName: '卡牌策略',
    agents: ['u11', 'u09', 'u06', 'tech'],
    agentNames: ['权衡官', '辩手王', '工程狗', '能跑就行'],
    agentEmojis: ['⚖️', '🎤', '📋', '⚙️'],
    suitableFor: '经济学/管理学/金融学',
    rating: 4.6, uses: 2340, estTime: '5-6分钟',
    tags: ['案例分析', '计算推导', '法条记忆'],
    grade: 'college', gradeName: '大学'
  },
  {
    id: 'team_college_art', name: '大学艺术创作队', emoji: '🎨',
    desc: '艺术理论变节奏创作，审美训练边玩边练',
    gameType: 'rhythm', gameTypeName: '音乐节奏',
    agents: ['art', 'narrative', 'spark', 'p02'],
    agentNames: ['颜值正义官', '戏精编剧', '脑洞点燃器', '小画霸'],
    agentEmojis: ['🎨', '🎭', '💡', '🎨'],
    suitableFor: '音乐/美术/设计/影视',
    rating: 4.5, uses: 1560, estTime: '4-5分钟',
    tags: ['审美训练', '创作实践', '理论鉴赏'],
    grade: 'college', gradeName: '大学'
  },
  {
    id: 'team_college_kaoyan', name: '大学考研公共课队', emoji: '📝',
    desc: '考研真题变密室闯关，高频考点答题模板全拿下',
    gameType: 'escape', gameTypeName: '密室逃脱',
    agents: ['h01', 'h04', 'h03', 'h05'],
    agentNames: ['笔记狂', '速通侠', '解网王', '应援团'],
    agentEmojis: ['📝', '⚡', '🕸️', '🫂'],
    suitableFor: '考研政治/英语/数学',
    rating: 4.9, uses: 5680, estTime: '5-7分钟',
    tags: ['真题精讲', '高频考点', '答题模板'],
    grade: 'college', gradeName: '大学'
  },
  {
    id: 'team_college_research', name: '大学科研入门队', emoji: '🔬',
    desc: '科研流程变模拟实验，论文写作实验设计一把梭',
    gameType: 'simulation', gameTypeName: '模拟实验',
    agents: ['u04', 'u02', 'u03', 'narrative'],
    agentNames: ['研学长', '推导手', '实验狂', '戏精编剧'],
    agentEmojis: ['🎓', '📝', '🔬', '🎭'],
    suitableFor: '毕业论文/科研项目',
    rating: 4.6, uses: 1890, estTime: '6-8分钟',
    tags: ['科研思维', '论文写作', '实验设计'],
    grade: 'college', gradeName: '大学'
  }
]

// ── 视觉风格选项 ──
export const VISUAL_STYLES = [
  { id: 'academy', name: '奇幻学院', emoji: '🏰', desc: '神秘学院氛围', colors: '#6B46C1,#9F7AEA' },
  { id: 'scifi', name: '科幻实验室', emoji: '🛸', desc: '未来科技感', colors: '#0891B2,#22D3EE' },
  { id: 'minimal', name: '简约学术', emoji: '📐', desc: '干净极简风', colors: '#52525B,#A1A1AA' },
  { id: 'cartoon', name: '卡通可爱', emoji: '🎈', desc: '萌系手绘风', colors: '#F472B6,#FBBF24' },
  { id: 'cyberpunk', name: '赛博朋克', emoji: '🌃', desc: '霓虹废土风', colors: '#7C3AED,#F59E0B' }
]

// ── 学习深度 ──
export const LEARNING_DEPTHS = [
  { id: 'quick', name: '快速浏览', emoji: '⚡', desc: '3分钟一关，随时玩随时停' },
  { id: 'core', name: '掌握核心', emoji: '🎯', desc: '抓住重点概念，稳扎稳打' },
  { id: 'deep', name: '深度理解', emoji: '🧠', desc: '知其然更知其所以然' },
  { id: 'exam', name: '应试冲刺', emoji: '🔥', desc: '人有多大胆，复习拖多晚' }
]

// ── 游戏时长 ──
export const GAME_DURATIONS = [
  { id: '15min', name: '15分钟', emoji: '⏱️' },
  { id: '30min', name: '30分钟', emoji: '⏰' },
  { id: '1hour', name: '1小时', emoji: '🕐' },
  { id: 'unlimited', name: '不限', emoji: '♾️' }
]

// ── 平台统计数据（mock）──
export const PLATFORM_STATS = {
  games: 12856,
  agents: 38,
  teams: 20,
  users: 8930
}

// ── 热梗文案库 ──
export const MEMES = {
  loading: ['知识正在加工中，含金量还在上升…', 'AI团队已就位，原神启动！', '稳住，我们能赢…'],
  success: ['这不比博人传燃？', '上岸了！', '泰裤辣！', '偏偏你最争气'],
  error: ['小丑竟是我自己', '世界是个巨大的草台班子', '红温了，但问题不大'],
  idle: ['班味有点重了，要不来一局？', '偷感很重，试试点个按钮？', '从从容容游刃有余…才怪'],
  encourage: ['有手就行！', '爱你老己！', '下学期一定重新做人（这次是真的）'],
  surprise: ['尊嘟假嘟？', '被知识硬控了！', '这波含金量拉满了']
}

// ── 社区方案（mock数据）──
export const COMMUNITY_PLANS = [
  { id: 'p1', title: '二次函数大逃杀', author: '数学不会骗你', gameType: '解谜闯关', grade: '初中', subject: '数学', rating: 4.9, downloads: 3200, emoji: '📊' },
  { id: 'p2', title: '牛顿的太空逃离', author: '苹果砸头', gameType: 'RPG冒险', grade: '高中', subject: '物理', rating: 4.8, downloads: 2800, emoji: '🍎' },
  { id: 'p3', title: '细胞分裂塔防', author: '生物课代表', gameType: '塔防经营', grade: '高中', subject: '生物', rating: 4.7, downloads: 2100, emoji: '🦠' },
  { id: 'p4', title: '唐诗宋词密室逃脱', author: '语文老师哭了', gameType: '密室逃脱', grade: '初中', subject: '语文', rating: 4.9, downloads: 3500, emoji: '📜' },
  { id: 'p5', title: '化学反应消消乐', author: '试管达人', gameType: '卡牌策略', grade: '高中', subject: '化学', rating: 4.6, downloads: 1900, emoji: '⚗️' },
  { id: 'p6', title: '丝绸之路经营模拟', author: '历史大佬', gameType: '模拟实验', grade: '初中', subject: '历史', rating: 4.8, downloads: 2400, emoji: '🐫' },
  { id: 'p7', title: '三角函数音乐节', author: '正弦波动', gameType: '音乐节奏', grade: '高中', subject: '数学', rating: 4.5, downloads: 1600, emoji: '🎵' },
  { id: 'p8', title: '遗传密码解谜', author: 'DNA大师', gameType: '解谜闯关', grade: '高中', subject: '生物', rating: 4.7, downloads: 2200, emoji: '🧬' }
]

// ── FAQ ──
export const FAQS = [
  { q: '上传教材后多久能生成游戏？', a: '通常3-7分钟，AI团队会自动协作讨论并输出方案。模拟模式下更快，30秒内出结果。' },
  { q: '支持哪些教材格式？', a: '目前支持PDF、Word（docx/doc）、纯文本（txt）、Markdown（md）。直接粘贴文本也可以。' },
  { q: '需要付费吗？', a: '基础功能免费！注册后可保存项目、分享方案。高级AI模型调用可能需要配置自己的API Key。' },
  { q: 'AI团队是什么？怎么选？', a: 'AI团队由多个智能体角色组成，每个角色有不同专长（知识拆解、游戏设计、体验评估等）。可以选预设团队模板，也可以自己搭配。' },
  { q: '生成的游戏方案怎么用？', a: '方案包含完整的游戏设计文档，可下载Markdown/PDF。部分方案支持生成可试玩的HTML代码。' },
  { q: '我的数据安全吗？', a: '所有数据存储在浏览器本地（localStorage），不会上传到服务器。API Key也仅保存在本地。' }
]
