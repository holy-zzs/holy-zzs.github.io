// 社区创作 mock 数据
export const COMMUNITY_CREATIONS = [
  { id: 'c1', title: '二次函数大逃杀', topic: '数学·二次函数', team: ['captain', 'scholar', 'designer', 'numbers'], likes: 1280, gradient: 'from-fuchsia-500 to-orange-500', desc: '把抛物线变成弹道，用函数解谜逃生', seed: 'quad-func' },
  { id: 'c2', title: '牛顿的太空逃离', topic: '物理·牛顿运动定律', team: ['captain', 'scholar', 'designer', 'experiment'], likes: 2150, gradient: 'from-indigo-500 to-purple-500', desc: '惯性、加速度、万有引力都是逃命工具', seed: 'newton' },
  { id: 'c3', title: '细胞分裂塔防', topic: '生物·细胞周期', team: ['captain', 'designer', 'storyteller', 'experiment'], likes: 890, gradient: 'from-green-500 to-teal-500', desc: '有丝分裂 vs 减数分裂的即时战略', seed: 'cell' },
  { id: 'c4', title: '唐诗宋词密室逃脱', topic: '语文·古典诗词', team: ['captain', 'storyteller', 'designer', 'experience'], likes: 1670, gradient: 'from-amber-500 to-red-500', desc: '用诗句拼图打开千年密室', seed: 'poem' },
  { id: 'c5', title: '化学反应消消乐', topic: '化学·元素周期表', team: ['captain', 'scholar', 'designer', 'numbers'], likes: 3200, gradient: 'from-cyan-500 to-blue-500', desc: '合成目标化合物就能过关', seed: 'chem' },
  { id: 'c6', title: '丝绸之路经营模拟', topic: '历史·丝绸之路', team: ['captain', 'storyteller', 'designer', 'experience'], likes: 1100, gradient: 'from-yellow-500 to-orange-600', desc: '在古代商道上做贸易学地理', seed: 'silk' },
  { id: 'c7', title: '三角函数音乐节', topic: '数学·三角函数', team: ['captain', 'designer', 'sound', 'numbers'], likes: 540, gradient: 'from-pink-500 to-rose-500', desc: '正弦波混音，用数学作曲', seed: 'trig' },
  { id: 'c8', title: '遗传密码解谜', topic: '生物·DNA与遗传', team: ['captain', 'scholar', 'experiment', 'storyteller'], likes: 1890, gradient: 'from-violet-500 to-indigo-500', desc: 'DNA双螺旋里的逻辑推理', seed: 'dna' },
  { id: 'c9', title: '电磁感应过山车', topic: '物理·电磁感应', team: ['captain', 'experiment', 'designer', 'sound'], likes: 760, gradient: 'from-sky-500 to-cyan-500', desc: '用楞次定律设计过山车轨道', seed: 'em' },
  { id: 'c10', title: '地理板块拼图', topic: '地理·板块构造', team: ['captain', 'designer', 'storyteller', 'experience'], likes: 420, gradient: 'from-emerald-500 to-green-600', desc: '大陆漂移的即时拼图挑战', seed: 'plate' }
]

// 演示教材预设库（随机演示用）——包含可被 parseText() 解析的完整文本
export const DEMO_MATERIALS = [
  {
    title: '高中物理·牛顿运动定律',
    subject: '物理',
    topics: ['惯性', '加速度', '作用力与反作用力'],
    rawText: `# 牛顿运动定律

## 一、牛顿第一定律（惯性定律）
一切物体在没有受到外力作用时，总保持静止状态或匀速直线运动状态。物体的这种性质叫做惯性。

**惯性**是物体固有的属性，质量越大，惯性越大。惯性与物体的运动状态无关，只与质量有关。

## 二、牛顿第二定律
物体的加速度与所受合外力成正比，与物体的质量成反比。

公式：F = ma

其中F为合外力，m为质量，a为加速度。加速度的方向与合外力的方向相同。

**加速度**是描述物体速度变化快慢的物理量，单位为m/s²。

## 三、牛顿第三定律（作用力与反作用力）
两个物体之间的作用力和反作用力总是大小相等、方向相反，作用在同一条直线上。

公式：F = -F'

**作用力与反作用力**同时产生、同时消失，分别作用在两个物体上，不能相互抵消。

## 四、万有引力定律
任意两个质点之间存在的相互吸引力，其大小与两质点质量的乘积成正比，与它们距离的平方成反比。

公式：F = G*m1*m2/r²

## 五、应用
牛顿运动定律在工程、航天、交通等领域有广泛应用。例如汽车安全带的设计利用了惯性原理，火箭推进利用了作用力与反作用力定律。`
  },
  {
    title: '初中数学·二次函数',
    subject: '数学',
    topics: ['顶点坐标', '开口方向', '判别式'],
    rawText: `# 二次函数

## 一、定义
一般地，形如 y=ax²+bx+c（a≠0）的函数称为二次函数。其中x是自变量，a、b、c分别是二次项系数、一次项系数和常数项。

## 二、图象与性质
二次函数的图象是一条抛物线。当a>0时，抛物线开口向上；当a<0时，抛物线开口向下。

**对称轴**：x=-b/(2a)
**顶点坐标**：(-b/(2a), (4ac-b²)/(4a))

## 三、顶点式
二次函数可以写成顶点式 y=a(x-h)²+k，其中(h,k)是顶点坐标。

## 四、判别式
判别式 Δ=b²-4ac：
- 当Δ>0时，方程有两个不等实根
- 当Δ=0时，方程有两个相等实根
- 当Δ<0时，方程无实根

## 五、应用
二次函数在物理运动学、经济学最值问题、工程优化中有广泛应用。例如抛体运动的轨迹就是抛物线。`
  },
  {
    title: '高中化学·氧化还原反应',
    subject: '化学',
    topics: ['电子转移', '化合价升降', '氧化剂与还原剂'],
    rawText: `# 氧化还原反应

## 一、基本概念
**氧化还原反应**是电子从一种物质转移到另一种物质的化学反应。在反应中，某些元素的化合价发生变化。

## 二、氧化与还原
**氧化**：物质失去电子，化合价升高的过程。
**还原**：物质得到电子，化合价降低的过程。

氧化和还原总是同时发生的，有物质被氧化，就一定有物质被还原。

## 三、氧化剂与还原剂
**氧化剂**：得到电子（被还原）的物质，本身化合价降低。
**还原剂**：失去电子（被氧化）的物质，本身化合价升高。

## 四、电子转移
在氧化还原反应中，电子从还原剂转移到氧化剂。

例如：2Na + Cl₂ → 2NaCl
钠失去电子被氧化，氯得到电子被还原。

## 五、应用
氧化还原反应在冶金、电池、防腐、生物呼吸作用等领域有重要应用。`
  },
  {
    title: '初中生物·生态系统',
    subject: '生物',
    topics: ['食物链', '能量流动', '物质循环'],
    rawText: `# 生态系统

## 一、生态系统的组成
**生态系统**由生物部分和非生物部分组成。生物部分包括生产者、消费者和分解者，非生物部分包括阳光、空气、水、温度等。

## 二、食物链和食物网
**食物链**是生态系统中各种生物之间由于食物关系而形成的一种联系。

例如：草 → 兔 → 狐

**食物网**是一个生态系统中许多食物链彼此相互交错连接的复杂营养结构。

## 三、能量流动
生态系统中能量的输入、传递、转化和散失的过程称为**能量流动**。

能量流动的特点：单向流动、逐级递减。能量在相邻两个营养级间的传递效率约为10%-20%。

## 四、物质循环
**物质循环**是指组成生物体的碳、氢、氧、氮等基本元素在生态系统的生物群落与无机环境之间反复循环运动。

碳循环：通过光合作用和呼吸作用实现。

## 五、生态平衡
生态系统具有一定的自动调节能力，但当外力干扰超过一定限度时，生态平衡就会遭到破坏。`
  },
  {
    title: '高中历史·工业革命',
    subject: '历史',
    topics: ['蒸汽机', '工厂制度', '社会变革'],
    rawText: `# 工业革命

## 一、工业革命的背景
18世纪60年代，工业革命首先在英国发生。圈地运动为工业革命提供了大量劳动力，殖民贸易积累了资本，科学革命提供了技术基础。

## 二、蒸汽机的改良
**蒸汽机**是工业革命的标志性发明。詹姆斯·瓦特改良的蒸汽机大大提高了热效率，使工厂不再依赖水力，可以建在任何地方。

## 三、工厂制度
**工厂制度**取代了传统的手工工场。工厂将工人、机器和原材料集中在一个场所，实行严格的劳动分工和纪律管理。

## 四、社会变革
工业革命带来了深刻的社会变革：
- 城市化加速，大量人口涌入城市
- 社会阶级分化为工业资产阶级和工业无产阶级
- 妇女和儿童大量进入工厂

## 五、工业革命的扩展
工业革命从英国逐渐扩展到欧洲大陆和北美。到19世纪中叶，工业革命基本完成，世界市场初步形成。`
  }
]

// 读心术主题映射表（升级二：用户输入主题 → mock AI 响应）
export const TOPIC_MAP = {
  '薛定谔方程': {
    keywords: ['薛定谔', '量子', '波函数', 'schrodinger'],
    concepts: ['波动函数', '概率诠释', '定态', '哈密顿算符'],
    gameType: '量子逃脱解谜',
    gameTitle: '量子迷踪：波函数之舞',
    posterEmoji: '🐱',
    posterGradient: 'from-violet-600 via-fuchsia-600 to-cyan-600',
    dialogue: [
      { role: 'scholar', text: '正在拆解"薛定谔方程"的核心概念… 波动函数、概率诠释、定态、哈密顿算符…' },
      { role: 'designer', text: '难度很高，适合制作量子逃脱解谜，用波函数坍缩决定关卡走向！' },
      { role: 'captain', text: '稳住，方案已生成。你的量子游戏原型准备好了。' }
    ]
  },
  '唐宋八大家': {
    keywords: ['唐宋', '古文', '韩愈', '柳宗元', '欧阳修', '苏轼'],
    concepts: ['古文运动', '散文革新', '文以载道', '辞赋'],
    gameType: '古文密室逃脱',
    gameTitle: '文脉寻踪：八大家密室',
    posterEmoji: '📜',
    posterGradient: 'from-amber-500 via-orange-600 to-red-600',
    dialogue: [
      { role: 'scholar', text: '正在拆解"唐宋八大家"… 韩愈、柳宗元、欧阳修、苏洵、苏轼、苏辙、王安石、曾巩…' },
      { role: 'storyteller', text: '太棒了！可以做成古文密室逃脱，用诗词拼接打开千年之门！' },
      { role: 'captain', text: '方案已生成。穿越唐宋的文学冒险等着你。' }
    ]
  },
  '二战起因': {
    keywords: ['二战', '第二次世界大战', '战争起因', '法西斯'],
    concepts: ['凡尔赛条约', '经济大萧条', '法西斯崛起', '绥靖政策'],
    gameType: '历史策略模拟',
    gameTitle: '乱世棋局：二战前夜',
    posterEmoji: '🌍',
    posterGradient: 'from-gray-600 via-red-700 to-yellow-600',
    dialogue: [
      { role: 'scholar', text: '正在分析"二战起因"… 凡尔赛条约的隐患、经济大萧条、法西斯崛起、绥靖政策…' },
      { role: 'designer', text: '适合做成历史策略模拟！玩家在不同阵营做决策，体验历史的必然与偶然。' },
      { role: 'captain', text: '稳住，方案已生成。历史不再枯燥，而是你手中的棋局。' }
    ]
  },
  '二次函数': {
    keywords: ['二次函数', '抛物线', '顶点', '判别式'],
    concepts: ['顶点坐标', '开口方向', '对称轴', '判别式'],
    gameType: '弹道射击',
    gameTitle: '抛物线猎手：函数战场',
    posterEmoji: '🎯',
    posterGradient: 'from-fuchsia-500 via-orange-500 to-amber-500',
    dialogue: [
      { role: 'scholar', text: '正在拆解"二次函数"… 顶点坐标、开口方向、对称轴、判别式…' },
      { role: 'designer', text: '把抛物线变成弹道！用函数参数调整射击角度和力度，太上头了！' },
      { role: 'captain', text: '方案已生成。数学不再是做题，而是精准打击。' }
    ]
  },
  '牛顿运动定律': {
    keywords: ['牛顿', '运动定律', '惯性', '加速度', '万有引力'],
    concepts: ['惯性', '加速度', '作用力与反作用力', '万有引力'],
    gameType: '太空逃生',
    gameTitle: '牛顿的太空逃离',
    posterEmoji: '🚀',
    posterGradient: 'from-indigo-500 via-purple-500 to-blue-600',
    dialogue: [
      { role: 'scholar', text: '正在拆解"牛顿运动定律"… 惯性、加速度、作用力与反作用力…' },
      { role: 'designer', text: '在太空站里利用惯性、加速度和万有引力逃生！每一关都是一个物理实验！' },
      { role: 'captain', text: '稳住，方案已生成。物理定律就是你的超能力。' }
    ]
  },
  '光合作用': {
    keywords: ['光合作用', '叶绿体', '光反应', '碳反应'],
    concepts: ['光反应', '暗反应', '叶绿素', 'ATP'],
    gameType: '工厂经营模拟',
    gameTitle: '叶绿体工厂：阳光经营记',
    posterEmoji: '🌿',
    posterGradient: 'from-green-500 via-emerald-500 to-teal-600',
    dialogue: [
      { role: 'scholar', text: '正在拆解"光合作用"… 光反应、暗反应、叶绿素、ATP…' },
      { role: 'designer', text: '把叶绿体变成工厂！管理光反应车间和暗反应车间，产出葡萄糖！' },
      { role: 'captain', text: '方案已生成。生物课变成经营游戏。' }
    ]
  },
  'DNA': {
    keywords: ['DNA', '遗传', '基因', '双螺旋', '碱基'],
    concepts: ['双螺旋结构', '碱基配对', '基因表达', '遗传密码'],
    gameType: '逻辑解谜',
    gameTitle: '遗传密码：双螺旋解谜',
    posterEmoji: '🧬',
    posterGradient: 'from-violet-500 via-indigo-500 to-blue-600',
    dialogue: [
      { role: 'scholar', text: '正在拆解"DNA"… 双螺旋结构、碱基配对、基因表达、遗传密码…' },
      { role: 'designer', text: '用碱基配对做逻辑解谜！A配T、C配G，解开基因锁链！' },
      { role: 'captain', text: '方案已生成。遗传学变成密码破译游戏。' }
    ]
  }
}

// 通用 fallback 响应（未命中映射表时）
export const FALLBACK_RESPONSE = {
  concepts: ['知识图谱', '核心概念', '学习路径'],
  gameType: '探索冒险',
  gameTitle: '知识探险家',
  posterEmoji: '🗺️',
  posterGradient: 'from-purple-600 via-fuchsia-600 to-orange-500',
  dialogue: [
    { role: 'scholar', text: '正在分析你输入的主题… 提取知识结构中…' },
    { role: 'designer', text: '这个主题很适合做成探索冒险！边学边解锁新区域！' },
    { role: 'captain', text: '该知识领域尚待开拓，注册后可召唤专属AI团队开荒！' }
  ]
}

// 匹配用户输入到主题映射
export function matchTopic(input) {
  const text = input.trim().toLowerCase()
  for (const [key, val] of Object.entries(TOPIC_MAP)) {
    if (text.includes(key.toLowerCase()) || val.keywords.some(k => text.includes(k.toLowerCase()))) {
      return { matched: true, key, ...val }
    }
  }
  return { matched: false, key: null, ...FALLBACK_RESPONSE }
}
