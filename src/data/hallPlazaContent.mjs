export const HALL_PLAZA_HERO = {
  eyebrow: '协作进行中',
  title: 'AI 正在共同制作一款游戏',
  highlight: '这不是对话，而是一支 AAA 游戏 AI 总监团队在同时开工',
  description:
    '你只需要提供一个创意，系统就会自动召集世界观、玩法、美术、系统、叙事与技术角色，共同完成从概念到完整游戏方案的全流程设计。',
  primaryCta: { key: 'start', label: '开始制作' },
  secondaryCta: { key: 'samples', label: '查看样例' },
  tertiaryCta: { key: 'team', label: '邀请 AI 团队' },
}

export const HALL_PLAZA_STATS = [
  { value: '12,438', label: '进行中的灵感项目' },
  { value: '342,031', label: 'AI 协作回合' },
  { value: '1,203 TB', label: '世界资产总量' },
  { value: '98.7%', label: '方案完成率' },
]

export const HALL_COSMIC_DISCIPLINES = [
  { id: 'worldview', label: '世界观设定', accent: '#8b5cf6' },
  { id: 'gameplay', label: '核心玩法', accent: '#22d3ee' },
  { id: 'roles', label: '角色设计', accent: '#f59e0b' },
  { id: 'combat', label: '战斗系统', accent: '#38bdf8' },
  { id: 'levels', label: '关卡结构', accent: '#a78bfa' },
  { id: 'art', label: '美术风格', accent: '#f472b6' },
  { id: 'story', label: '叙事节奏', accent: '#fb7185' },
  { id: 'economy', label: '商业化', accent: '#2dd4bf' },
]

export const HALL_LIVE_RAIL = [
  {
    id: 'producer',
    name: '游戏制作人',
    avatar: '/assets/agents/agent-producer-v3.jpg',
    task: '收束项目方向',
    progress: 72,
    status: 'Live',
  },
  {
    id: 'world',
    name: '世界观总监',
    avatar: '/assets/agents/agent-world-v3.jpg',
    task: '扩展宇宙设定',
    progress: 58,
    status: 'Live',
  },
  {
    id: 'gameplay',
    name: '玩法策划',
    avatar: '/assets/agents/agent-gameplay-v3.jpg',
    task: '校准核心循环',
    progress: 41,
    status: 'Sync',
  },
  {
    id: 'system',
    name: '系统设计师',
    avatar: '/assets/agents/agent-system-v3.jpg',
    task: '平衡成长数值',
    progress: 63,
    status: 'Sync',
  },
  {
    id: 'art',
    name: '美术总监',
    avatar: '/assets/agents/agent-art-v3.jpg',
    task: '生成关键场景',
    progress: 55,
    status: 'Render',
  },
  {
    id: 'narrative',
    name: '叙事导演',
    avatar: '/assets/agents/story-weaver.png',
    task: '编排故事节点',
    progress: 49,
    status: 'Draft',
  },
  {
    id: 'program',
    name: '程序架构师',
    avatar: '/assets/agents/system-engineer.png',
    task: '建立玩法系统',
    progress: 61,
    status: 'Build',
  },
]

export const HALL_STAGE_WORLDS = [
  {
    id: 'prime',
    title: '永恒星环',
    tag: '宇宙史诗',
    image: '/assets/forge/holo-city.jpg',
    thumb: '/assets/forge/holo-city.jpg',
    description: '一座围绕巨型星环运转的文明中枢，AI 团队正在同步生成主城、派系与主线冲突。',
  },
  {
    id: 'city',
    title: '钢铁文明',
    tag: '赛博都市',
    image: '/assets/capabilities/data-matrix.jpg',
    thumb: '/assets/capabilities/data-matrix.jpg',
    description: '以高密度垂直都市为核心的未来世界，重点推演黑客对抗、城市派系和资源循环。',
  },
  {
    id: 'east',
    title: '东方秘境',
    tag: '东方幻想',
    image: '/assets/community/history-qin.jpg',
    thumb: '/assets/community/history-qin.jpg',
    description: '结合古代王朝、灵气系统与秘境探索，适合角色成长和多线叙事交织。',
  },
  {
    id: 'waste',
    title: '末日生存',
    tag: '废土求生',
    image: '/assets/jarvis/history-warriors.jpg',
    thumb: '/assets/jarvis/history-warriors.jpg',
    description: '以荒原定居点和能源争夺为核心，突出势力博弈、求生建造与道德选择。',
  },
  {
    id: 'deep',
    title: '深海纪元',
    tag: '深海异境',
    image: '/assets/community/bio-cell.jpg',
    thumb: '/assets/community/bio-cell.jpg',
    description: '在深海基地与未知生物之间展开探索，强调压迫感氛围、调查与资源调度。',
  },
]

export const HALL_UNIVERSE_CARDS = [
  {
    id: 'future',
    title: '未来都市',
    meta: '2,435 个项目',
    action: '探索',
    image: '/assets/capabilities/data-matrix.jpg',
    badge: '赛博',
  },
  {
    id: 'myth',
    title: '剑与大陆',
    meta: '1,649 个项目',
    action: '探索',
    image: '/assets/community/history-qin.jpg',
    badge: '奇幻',
  },
  {
    id: 'mech',
    title: '钢铁文明',
    meta: '1,902 个项目',
    action: '探索',
    image: '/assets/capabilities/pixel-game.jpg',
    badge: '机甲',
  },
  {
    id: 'orient',
    title: '东方秘境',
    meta: '1,254 个项目',
    action: '探索',
    image: '/assets/jarvis/calculus-topology.jpg',
    badge: '秘境',
  },
  {
    id: 'dawn',
    title: '异星远征',
    meta: '1,349 个项目',
    action: '探索',
    image: '/assets/forge/quantum-bg.jpg',
    badge: '太空',
  },
]

export const HALL_RECOMMENDED_WORLDS = [
  {
    id: 'war',
    title: '王朝纪元',
    subtitle: '策略战争 · 多阵营权谋',
    score: 96,
    tag: '策略战争',
    image: '/assets/jarvis/history-warriors.jpg',
    players: '9.6k',
    action: '进入项目',
  },
  {
    id: 'star',
    title: '星际远征',
    subtitle: '舰队经营 · 宇宙远航',
    score: 92,
    tag: '科幻冒险',
    image: '/assets/forge/holo-city.jpg',
    players: '8.4k',
    action: '进入项目',
  },
  {
    id: 'mist',
    title: '深渊之下',
    subtitle: '惊悚生存 · 深海调查',
    score: 89,
    tag: '惊悚生存',
    image: '/assets/community/bio-cell.jpg',
    players: '7.2k',
    action: '进入项目',
  },
]

export const HALL_TEAM_STRIP = [
  { id: 'director', label: 'GAME DIRECTOR', name: '总控总监', icon: 'G' },
  { id: 'world', label: 'WORLD DESIGN', name: '世界构建', icon: 'W' },
  { id: 'gameplay', label: 'GAMEPLAY', name: '玩法设计', icon: 'P' },
  { id: 'level', label: 'LEVEL DESIGN', name: '关卡设计', icon: 'L' },
  { id: 'narrative', label: 'NARRATIVE', name: '叙事导演', icon: 'N' },
  { id: 'art', label: 'ART DIRECTOR', name: '美术总监', icon: 'A' },
  { id: 'sound', label: 'SOUND', name: '声音设计', icon: 'S' },
  { id: 'program', label: 'PROGRAM', name: '技术实现', icon: 'T' },
  { id: 'qa', label: 'QA TEST', name: '测试质检', icon: 'Q' },
]
