export const HOMEPAGE_HERO = {
  eyebrow: 'AI Game Design Platform',
  title: '《知识不进脑子啊》——你的赛博家教团队',
  subtitle:
    '不用学编程，不用啃引擎。上传你的课本，AI 团队自动协作，2天生成专属教学游戏。',
  emphasis:
    '一个能让你像逛淘宝一样“勾选”AI 设计师，然后自动生成知识游戏的神奇网站。',
  primaryCta: { key: 'start', label: '开始创建游戏' },
  secondaryCta: { key: 'demo', label: '浏览社区方案' },
}

export const HOMEPAGE_FEATURES = [
  {
    key: 'agents',
    title: '解决千古难题',
    pain: '书太难啃，做游戏又太累',
    desc: '拉了一群 AI 当打工仔，替我画画、写代码、做策划。你当老板，AI 当员工，不仅不要钱，还没脾气。',
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20retro-futuristic%20cyberpunk%20conference%20table%20with%20holographic%20AI%20avatars%20debating%2C%20glowing%20neon%20colors%2C%20dark%20atmosphere%2C%208k&image_size=landscape_16_9'
  },
  {
    key: 'formats',
    title: '新时代的糖衣炮弹',
    pain: '死记硬背 vs 自学编程',
    desc: '让知识以一种“卑鄙”的方式进入脑子。既然阻止不了大家玩游戏，就让大家在玩的时候不知不觉学会傅里叶变换。',
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20retro-futuristic%20arcade%20cabinet%20screen%20showing%20multiple%20game%20genres%20merging%2C%20synthwave%20grid%2C%20pixel%20art%20meets%203d%20hologram%2C%208k&image_size=landscape_16_9'
  },
  {
    key: 'systems',
    title: '教材秒变引擎数据',
    pain: '设计与开发断层',
    desc: 'AI 自动将枯燥文本解析为关卡JSON配置，底层游戏引擎直接接管渲染，零代码所见即所得。',
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Glowing%20code%20and%20JSON%20data%20streams%20transforming%20into%20a%203D%20game%20level%2C%20cyberpunk%20matrix%20style%2C%20neon%20green%20and%20purple%2C%208k&image_size=landscape_16_9'
  },
  {
    key: 'delivery',
    title: '一键发布试玩',
    pain: '传播与部署成本极高',
    desc: '生成即部署。获得一个专属短链接或跨平台二维码，扫码直接开玩，无缝嵌入任何网页。',
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20retro%20futuristic%20smartphone%20displaying%20a%20holographic%20game%20with%20a%20glowing%20share%20button%2C%20neon%20city%20background%2C%208k&image_size=landscape_16_9'
  },
]

export const HOMEPAGE_PIPELINE = [
  { key: 'input', title: '喂给它一堆资料', desc: '扔进教材、大纲或一个疯狂的点子。' },
  { key: 'roundtable', title: 'AI 帮你吵架推演', desc: '多个智能体争论最佳玩法机制。' },
  { key: 'systems', title: '引擎即刻接管', desc: '自动生成配置，Phaser/Pixi 极速渲染。' },
  { key: 'delivery', title: '拿到链接发朋友圈', desc: '纯 H5 跨端秒开，让知识像病毒一样传播。' },
]

export const HOMEPAGE_SHOWCASE = [
  {
    key: 'narrative',
    title: '剧情探索 (RPG)',
    label: '沉浸叙事',
    desc: '把历史事件变成多分支的文字冒险游戏。',
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20retro-futuristic%20visual%20novel%20interface%20with%20cyberpunk%20characters%2C%20neon%20dialogue%20box%2C%208k&image_size=landscape_4_3'
  },
  {
    key: 'simulation',
    title: '策略推演 (SLG)',
    label: '硬核数值',
    desc: '用资源管理与博弈来理解复杂的经济学模型。',
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20holographic%20strategy%20game%20board%20with%20glowing%20neon%20stats%20and%20hexagons%2C%20synthwave%20aesthetic%2C%208k&image_size=landscape_4_3'
  },
  {
    key: 'challenge',
    title: '动作闯关 (ACT)',
    label: '即时反馈',
    desc: '在躲避弹幕的间隙回答物理公式，手脑并用。',
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20retro%20arcade%20platformer%20game%20scene%20with%20neon%20lasers%20and%20cybernetic%20enemies%2C%208k&image_size=landscape_4_3'
  },
]

export const STAGE_DATA = [
  {
    id: 'primary',
    name: '小学',
    emoji: '🧒',
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Retro%20futuristic%20cyberpunk%20primary%20school%20classroom%20with%20holographic%20blackboards%2C%20neon%20colors%2C%208k&image_size=landscape_4_3',
    subjects: [
      { id: 'p1', name: '低年级', icon: '🖍️', desc: '基础启蒙与识字', teamSize: 3 },
      { id: 'p2', name: '高年级', icon: '📚', desc: '思维与习惯养成', teamSize: 4 },
      { id: 'p3', name: '小学奥数', icon: '🧮', desc: '逻辑推演与挑战', teamSize: 5 },
    ]
  },
  {
    id: 'junior',
    name: '初中',
    emoji: '👦',
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Retro%20futuristic%20middle%20school%20laboratory%20with%20glowing%20chemicals%20and%20floating%20formulas%2C%20synthwave%20style%2C%208k&image_size=landscape_4_3',
    subjects: [
      { id: 'm1', name: '文科', icon: '📖', desc: '历史地理与人文', teamSize: 4 },
      { id: 'm2', name: '理科', icon: '🔬', desc: '物理化学与实验', teamSize: 5 },
      { id: 'm3', name: '中考冲刺', icon: '⚡', desc: '考点突击与刷题', teamSize: 6 },
    ]
  },
  {
    id: 'senior',
    name: '高中',
    emoji: '🧑',
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Retro%20futuristic%20high%20school%20library%20with%20neon%20books%20and%20data%20streams%20connecting%20to%20students%20minds%2C%208k&image_size=landscape_4_3',
    subjects: [
      { id: 'h1', name: '文科', icon: '📜', desc: '政史地深度解析', teamSize: 4 },
      { id: 'h2', name: '理科', icon: '🧬', desc: '理化生硬核推演', teamSize: 5 },
      { id: 'h3', name: '新高考选考', icon: '🎯', desc: '个性化选科突击', teamSize: 5 },
      { id: 'h4', name: '高考冲刺', icon: '🚀', desc: '真题演练与预测', teamSize: 6 },
    ]
  },
  {
    id: 'college',
    name: '大学',
    emoji: '🎓',
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Cyberpunk%20university%20campus%20at%20night%20with%20giant%20holographic%20statues%20of%20scientists%20and%20neon%20grids%2C%20synthwave%2C%208k&image_size=landscape_4_3',
    subjects: [
      { id: 'u1', name: '理学', icon: '🪐', desc: '基础科学与原理', teamSize: 5 },
      { id: 'u2', name: '工学', icon: '⚙️', desc: '工程与技术应用', teamSize: 5 },
      { id: 'u3', name: '人文社科', icon: '🏛️', desc: '社会现象与哲学', teamSize: 4 },
      { id: 'u4', name: '医学', icon: '⚕️', desc: '生命科学与临床', teamSize: 6 },
      { id: 'u5', name: '农学', icon: '🌾', desc: '农业与生物科技', teamSize: 4 },
      { id: 'u6', name: '艺术学', icon: '🎨', desc: '审美与创作设计', teamSize: 4 },
      { id: 'u7', name: '考研公共课', icon: '📝', desc: '政治英语数学', teamSize: 6 },
      { id: 'u8', name: '考研专业课', icon: '🎓', desc: '专业课深度解析', teamSize: 6 },
    ]
  }
]

export const HOMEPAGE_DEMO_CASES = [
  {
    id: 'history',
    icon: '📜',
    title: '高中历史·近代史',
    agentCount: 4,
    gameName: '《抉择：从虎门到武昌》',
    timeToComplete: '3分钟',
    dialogs: [
      {
        role: '知识架构师',
        agent: '高考命题研究员',
        time: '14:15:30',
        content: '✅ 教材解析完成。\n《中外历史纲要（上）》第5-6单元，涵盖鸦片战争到辛亥革命。\n• 核心事件：18个（5星重要事件6个）\n• 关键人物：林则徐、洪秀全、李鸿章、康有为、孙中山等12人\n• 命题规律：近5年高考中，该部分平均每年出题3-4道，重点考查“因果关系链”和“历史评价”',
      },
      {
        role: '知识架构师',
        agent: '历史情境重建师',
        time: '14:18:12',
        content: '📜 我来补充历史情境设计。\n\n这个时期的核心矛盾是“侵略与反抗”“变革与守旧”。\n我建议设计一个“历史十字路口”的选择系统：\n• 学生在关键历史节点扮演决策者\n• 例如：1840年，你是林则徐，面对英国舰队，你会怎么做？\n• 每个选择都会导向不同的历史分支（但最终会回到真实历史线）\n• 错误选择会触发“历史复盘”，展示真实历史是如何发展的',
      },
      {
        role: '游戏设计师',
        agent: '历史文明模拟导演',
        time: '14:21:45',
        content: '🎮 我设计一个“文明抉择”玩法：\n\n核心机制：历史事件卡牌 + 分支选择 + 因果链复盘\n\n关卡1：《虎门抉择》\n• 知识点：鸦片战争背景\n• 场景：1839年，你是林则徐，站在虎门炮台上\n• 事件卡牌：[英国商人的抗议书] [清廷的禁烟令] [沿海百姓的请愿]\n• 决策点：如何处理收缴的鸦片？A.就地销毁 B.运回京城 C.与英商谈判\n• 选择A后触发：虎门销烟事件 → 英国发动鸦片战争 → 进入下一关\n• 选择B或C：触发“历史复盘”，展示真实历史走向，并解释为什么林则徐选择了销毁',
      },
      {
        role: '叙事设计师',
        agent: '历史演义编剧',
        time: '14:25:30',
        content: '📝 我来补充叙事设计。\n\n为每个历史人物设计“人物卡牌”：\n• 林则徐：特性「刚正不阿」——外交谈判时获得额外选项\n• 李鸿章：特性「洋务先驱」——技术引进类决策成功率+20%\n• 慈禧太后：特性「垂帘听政」——内部改革类决策风险+30%\n\n学生通过收集人物卡牌，了解每个历史人物的立场和局限。\n每张卡牌背面有一段“历史评价”，帮助学生理解历史人物的多面性。',
      },
      {
        role: '学习科学家',
        agent: '认知负荷监测师',
        time: '14:28:10',
        content: '📊 评估报告：\n\n当前设计评分：A-（90分）\n优点：历史情境的沉浸感很强，分支选择能激发学生主动思考\n\n建议：\n1. 增加“时间线总览”功能，让学生随时查看自己所在的历史位置\n2. 每个决策点增加“当时的历史背景提示”（如“当时清廷国库空虚，军费不足”）\n3. 设置“历史成就”系统：正确理解因果关系链可获得成就徽章',
      },
      {
        role: '游戏设计师',
        agent: '历史文明模拟导演',
        time: '14:31:00',
        content: '最终方案已生成：\n📋 游戏名称：《抉择：从虎门到武昌》\n📋 关卡数：8关（覆盖鸦片战争、太平天国、洋务运动、甲午战争、戊戌变法、辛亥革命）\n📋 预计学习时长：90分钟\n📋 核心玩法：历史节点决策 + 人物卡牌收集 + 因果链复盘\n📋 适用对象：高中历史选考生/高考备考',
      }
    ]
  },
  {
    id: 'physics',
    icon: '🔬',
    title: '初中物理·力学',
    agentCount: 4,
    gameName: '《力学大乱斗》',
    timeToComplete: '2分钟',
    dialogs: [
      {
        role: '知识架构师',
        agent: '生活化教学研究员',
        time: '10:05:22',
        content: '✅ 教材解析完成。\n初中物理力学单元，核心是牛顿三定律。\n• 核心概念：力、质量、加速度、作用力与反作用力\n• 学生常见误区：认为“力是维持运动的原因”（亚里士多德观念残留）\n• 关键教学策略：必须通过大量生活场景的“反直觉”实验来纠正前概念',
      },
      {
        role: '游戏设计师',
        agent: '竞技对战系统策划',
        time: '10:08:15',
        content: '🎮 我设计一个“物理对战”玩法：\n\n核心机制：用弹弓发射小球，撞击目标。力度和角度=力的概念。\n\n关卡1：《推箱子大作战》\n• 知识点：牛顿第一定律（惯性）\n• 场景：冰面上有一个箱子\n• 玩家操作：给箱子一个初始推力，然后箱子会一直滑行（无摩擦力）\n• 反直觉设计：很多学生以为“不推就不动”——这里让他们看到“推一下就会一直滑”\n• 增加摩擦力开关，让学生对比有无摩擦力的情况',
      },
      {
        role: '游戏设计师',
        agent: '虚拟实验设计师',
        time: '10:12:30',
        content: '🔬 补充虚拟实验设计：\n\n关卡3：《太空中的碰撞》\n• 知识点：牛顿第三定律（作用力与反作用力）\n• 场景：太空站外，宇航员推动一个漂浮的工具箱\n• 实验1：推工具箱 → 宇航员自己向后飘（作用力=反作用力）\n• 实验2：用不同力度推 → 观察加速度变化（F=ma）\n• 实验3：两个不同质量的物体对撞 → 观察动量守恒\n\n所有实验都配有慢动作回放和力学分析面板。',
      },
      {
        role: '学习科学家',
        agent: '青春期动力激发师',
        time: '10:16:40',
        content: '📊 评估报告：\n\n评分：A（92分）\n优点：竞技对战的设计非常适合初中生的竞争心理\n\n建议：\n1. 增加“班级排行榜”功能，利用同伴竞争驱动学习\n2. 设置“物理大师”成就系统，正确使用力学概念可获得称号\n3. 加入“物理表情包”奖励——学生喜欢这些',
      },
      {
        role: '游戏设计师',
        agent: '竞技对战系统策划',
        time: '10:19:00',
        content: '最终方案：\n📋 游戏名称：《力学大乱斗》\n📋 关卡数：6关 + 自由对战模式\n📋 预计学习时长：40分钟\n📋 核心玩法：弹弓发射 + 虚拟实验 + 排行榜PK\n📋 适用对象：初中物理学生/会考备考',
      }
    ]
  },
  {
    id: 'chinese',
    icon: '📖',
    title: '小学语文·古诗',
    agentCount: 4,
    gameName: '《诗诗的唐诗冒险》',
    timeToComplete: '1分钟',
    dialogs: [
      {
        role: '知识架构师',
        agent: '趣味启蒙师',
        time: '16:20:10',
        content: '✅ 教材解析完成。\n小学语文古诗单元，包含《静夜思》《望庐山瀑布》《登鹳雀楼》等8首。\n• 学习目标：背诵、理解意境、认识生字\n• 儿童认知特点：具象思维为主，抽象意境理解困难\n• 关键策略：必须将抽象诗意转化为可视化的动画场景',
      },
      {
        role: '游戏设计师',
        agent: '儿童游戏魔法师',
        time: '16:22:45',
        content: '🎮 设计“诗境探险”玩法：\n\n关卡1：《静夜思——月光之旅》\n• 知识点：李白《静夜思》背诵和理解\n• 场景：一个古代房间，窗外明月高悬\n• 玩家操作：\n  - 点击“床前”看到明月光洒在地上（触发“床前明月光”）\n  - 点击地面看到白色霜一样的光芒（触发“疑是地上霜”）\n  - 抬头看月亮（触发“举头望明月”）\n  - 低头看到地上月光（触发“低头思故乡”）\n• 每触发一句，角色会朗读出来，同时显示文字\n• 通关后解锁“诗境画卷”——可以涂色和分享给家长',
      },
      {
        role: '视觉设计师',
        agent: '卡通动物角色设计师',
        time: '16:26:30',
        content: '🎨 美术方案：\n\n• 主角设计：一只叫“诗诗”的小白兔，穿越到每首诗的意境中\n• 每首诗一个主题场景：\n  - 《静夜思》→ 月光下的古代卧室\n  - 《望庐山瀑布》→ 彩虹瀑布仙境\n  - 《登鹳雀楼》→ 黄河边的日落楼阁\n• 所有场景用温暖的水彩风格\n• 角色和物品都是圆润可爱的造型',
      },
      {
        role: '学习科学家',
        agent: '儿童注意力守护师',
        time: '16:30:15',
        content: '📊 评估报告：\n\n评分：A+（95分）\n优点：场景化学习完美适配小学生的具象思维\n\n建议：\n1. 每首诗的学习时间控制在5分钟以内（儿童注意力黄金窗口）\n2. 增加“跟读打分”功能（鼓励开口朗读）\n3. 每学完3首诗解锁一个“诗境小剧场”（综合复习）',
      },
      {
        role: '游戏设计师',
        agent: '儿童游戏魔法师',
        time: '16:33:00',
        content: '最终方案：\n📋 游戏名称：《诗诗的唐诗冒险》\n📋 关卡数：8关（每首诗一关）+ 2个复习剧场\n📋 预计学习时长：每次10分钟（建议分3次完成）\n📋 核心玩法：场景探索 + 跟读 + 涂色收集\n📋 适用对象：小学1-3年级',
      }
    ]
  }
]

export const HOMEPAGE_VALUE_CARDS = [
  {
    icon: '🤖',
    title: 'AI团队',
    features: ['不用学编程', '不用学美术', '拖拽AI角色', '自动生成游戏']
  },
  {
    icon: '⚡',
    title: '极速生成',
    features: ['3分钟搞定', '从教材到游戏', '比泡面还快']
  },
  {
    icon: '🎮',
    title: '好玩有效',
    features: ['知识变成游戏', '玩着玩着就学会了', '考试提分利器']
  }
]

export const HOMEPAGE_SOCIAL_PROOF = {
  stats: [
    { value: '12,341', label: '教材已变成游戏' },
    { value: '132', label: 'AI 专家为你组队' },
    { value: '20', label: '预设团队一键用' },
    { value: '4.9', label: '用户评分 ⭐⭐⭐⭐⭐' }
  ],
  reviews: [
    {
      text: '“本来以为光学这辈子学不会了，结果AI给我做了个光线解谜游戏，玩了两天居然把菲涅耳公式搞懂了。”',
      author: '@物理系在逃学生'
    },
    {
      text: '“作为一个老师，我用这个平台给学生们生成复习游戏，课堂参与度高了一倍。最关键的是——我一行代码都没写。”',
      author: '@高中物理李老师'
    }
  ]
}

export const HOMEPAGE_AUDIENCES = [
  {
    key: 'student_exam',
    icon: '📖',
    title: '期末复习党',
    desc: '把教材变游戏\n考前突击神器',
  },
  {
    key: 'student_grad',
    icon: '🎓',
    title: '考研考公党',
    desc: '把考点变挑战\n刷题不再枯燥',
  },
  {
    key: 'teacher',
    icon: '👨‍🏫',
    title: '老师/讲师',
    desc: '把教案变互动\n课堂活跃度↑',
  },
  {
    key: 'lifelong',
    icon: '📚',
    title: '终身学习者',
    desc: '把兴趣变知识\n轻松学会新技能',
  },
]

export const HOMEPAGE_COMPARISON = [
  {
    key: 'static',
    label: '静态内容工具',
    ours: '把意图组织成游戏系统',
    theirs: '把内容组织成页面或文档',
  },
  {
    key: 'doc-ai',
    label: '文档型 AI 工具',
    ours: '多智能体协作与成果编排',
    theirs: '单轮文本生成',
  },
  {
    key: 'h5',
    label: '轻量互动搭建器',
    ours: '从目标到机制的设计链',
    theirs: '偏单次页面装配',
  },
  {
    key: 'game-dev',
    label: '传统游戏制作流程',
    ours: '降低跨角色协作门槛',
    theirs: '高度依赖专业开发资源',
  },
]

export const HOMEPAGE_FAQS = [
  {
    question: '这不就是个PPT生成器吗？',
    answer: '绝对不是。PPT 只能用来催眠，我们吐出的是带有数值结算、关卡逻辑和碰撞检测的真·HTML5游戏，可以直接发给朋友玩的那种。',
  },
  {
    question: '我完全不懂编程能用吗？',
    answer: '你懂怎么跟老板提需求吗？只要你会把教材内容复制粘贴，剩下的全靠 AI 团队自己吵架推演，你只管验收成果。',
  },
  {
    question: '生成的游戏可以商用吗？',
    answer: '当然可以！所有生成的 H5 游戏都可以独立部署或嵌入你的博客/网站。你甚至可以加上你自己的广告。',
  },
  {
    question: '为什么叫“知识不进脑子啊”？',
    answer: '因为我们团队当年被《高等数学》折磨到差点退学。既然正经看书学不进去，那就用“卑鄙”的游戏手段把知识塞进脑子里。',
  },
]
