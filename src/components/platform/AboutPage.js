// 关于我们 — 平台使命 / 创始故事 / 团队介绍 / 核心价值观 / 数据统计 / 联系方式
import { html, useContext, useCallback } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'
import { NavBar, Footer, PageContainer } from './PlatformCommon.js'

// ── 复古未来主义色板 ──
const C = {
  bg: '#05010f',
  text: '#f5e8ff',
  textMuted: '#8b7da8',
  textDim: '#5d4f7a',
  primary: '#a78bfa',
  accent: '#F5A623',
  border: 'rgba(167,139,250,0.12)',
  surface: 'rgba(255,255,255,0.03)',
}

// ── 团队成员 ──
const TEAM = [
  {
    initial: '林',
    name: '林知远',
    role: '创始人 & CEO',
    tagline: '教育游戏化狂热者',
    bio: '坚信学习不该是苦差事。做了 8 年教育产品，把游戏化教学从论文搬进真实课堂，亲手服务过 50 万学生。口头禅是「知识不进脑子，那就让游戏把它塞进去」。',
    color: '#a78bfa',
  },
  {
    initial: '陈',
    name: '陈墨白',
    role: 'CTO',
    tagline: '多智能体系统架构师',
    bio: '前大厂 AI 架构师，沉迷于让多个 AI 像真人团队一样开会吵架再达成共识。设计了这个平台的多智能体协作引擎，确保每个智能体都有自己的脾气和专长。',
    color: '#F5A623',
  },
  {
    initial: '王',
    name: '王思齐',
    role: '教育总监',
    tagline: '10年一线教学经验',
    bio: '曾在重点中学教了 10 年物理，深知学生的痛点在哪里。负责把关每个游戏方案的知识覆盖度和教学有效性，确保方案真的能上课用，而不是花架子。',
    color: '#4ade80',
  },
  {
    initial: '苏',
    name: '苏漫',
    role: '设计总监',
    tagline: '游戏UI/UX专家',
    bio: '做过 3 款 DAU 百万的手游，对「好玩」这件事有近乎偏执的追求。带领设计团队打造了平台的复古未来主义视觉语言，让每一次创作都像在玩赛博朋克。',
    color: '#f472b6',
  },
  {
    initial: '赵',
    name: '赵研',
    role: 'AI研究员',
    tagline: '大语言模型方向',
    bio: '博士方向是 LLM 的推理能力增强，发了 5 篇顶会论文。负责智能体的 prompt 工程和知识图谱构建，让 AI 团队不仅会聊天，还能真正理解教材内容。',
    color: '#60a5fa',
  },
]

// ── 核心价值观 ──
const VALUES = [
  {
    icon: '📚',
    title: '知识至上',
    desc: '一切玩法都服务于知识传递。不是为了游戏而游戏，而是让知识在游戏中自然流淌。每个关卡、每个机制背后都有明确的学习目标。',
    color: '#a78bfa',
  },
  {
    icon: '🎮',
    title: '游戏精神',
    desc: '好玩是第一生产力。我们相信「上头」的力量——当学生停不下来的时候，学习就真正发生了。拒绝无聊，拒绝说教，拒绝为了教育而牺牲趣味。',
    color: '#F5A623',
  },
  {
    icon: '🌐',
    title: '开放共创',
    desc: '最好的方案来自碰撞。AI 团队的协作、社区用户的改编、教师的反馈，都是进化的养分。我们开放方案源码，鼓励二次创作，让好点子自由流动。',
    color: '#4ade80',
  },
]

// ── 数据统计 ──
const STATS = [
  { value: '12,856', label: '已生成游戏', suffix: '个' },
  { value: '132', label: 'AI 专家', suffix: '位' },
  { value: '8,930', label: '注册用户', suffix: '人' },
  { value: '120+', label: '覆盖学科', suffix: '方向' },
]

// ── 社交链接 ──
const SOCIALS = [
  { icon: '📧', label: '邮箱', value: 'hello@knb.ai', color: '#a78bfa' },
  { icon: '💬', label: '微信', value: '知识不进脑子啊', color: '#4ade80' },
  { icon: '🐙', label: 'GitHub', value: 'github.com/knb-edu', color: '#60a5fa' },
  { icon: '🐦', label: '微博', value: '@知识不进脑子啊', color: '#f472b6' },
]

export default function AboutPage() {
  const { dispatch } = useContext(AppContext)

  const go = useCallback((step) => {
    dispatch({ type: 'SET_STEP', payload: step })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  return html`
    <div style=${{ background: C.bg, minHeight: '100vh' }}>
      <${NavBar} />
      <${PageContainer}>

        <!-- ═══ Hero 使命宣言 ═══ -->
        <section class="retro-section-dark relative overflow-hidden rounded-3xl px-6 py-16 sm:px-12 sm:py-24 text-center"
                 style=${{ border: `1px solid ${C.border}` }}>
          <!-- 背景光晕 -->
          <div style=${{
            position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
            width: '500px', height: '500px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)',
            filter: 'blur(50px)', pointerEvents: 'none',
          }}></div>
          <div style=${{
            position: 'absolute', bottom: '-20%', right: '-5%',
            width: '300px', height: '300px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)', pointerEvents: 'none',
          }}></div>

          <div class="relative">
            <div class="retro-eyebrow mb-4">// OUR MISSION</div>
            <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight" style=${{ color: C.text }}>
              让学习像追剧一样
              <br />
              <span style=${{
                background: 'linear-gradient(135deg, #a78bfa, #F5A623)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>停不下来</span>
            </h1>
            <p class="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed" style=${{ color: C.textMuted }}>
              我们用多智能体 AI 把枯燥的教材变成上头的游戏方案。书扔进去，游戏吐出来。
              知识不进脑子？那就让 AI 帮你换个打开方式。
            </p>
            <div class="flex items-center justify-center gap-3 mt-8 flex-wrap">
              <button class="px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200"
                      style=${{ background: C.accent, color: '#1a0f3d', boxShadow: `0 4px 20px ${C.accent}30` }}
                      onMouseEnter=${(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = `0 8px 28px ${C.accent}50` }}
                      onMouseLeave=${(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 4px 20px ${C.accent}30` }}
                      onClick=${() => go(STEPS.LANDING)}>
                立即体验 🚀
              </button>
              <button class="px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200"
                      style=${{ background: 'rgba(167,139,250,0.1)', color: C.primary, border: `1px solid ${C.primary}` }}
                      onMouseEnter=${(e) => { e.target.style.background = 'rgba(167,139,250,0.2)' }}
                      onMouseLeave=${(e) => { e.target.style.background = 'rgba(167,139,250,0.1)' }}
                      onClick=${() => go(STEPS.COMMUNITY)}>
                看看社区方案
              </button>
            </div>
          </div>
        </section>

        <!-- ═══ 创始故事 ═══ -->
        <section class="mt-16">
          <div class="text-center mb-10">
            <div class="retro-eyebrow mb-2">// OUR STORY</div>
            <h2 class="text-2xl sm:text-3xl font-black" style=${{ color: C.text }}>平台是怎么诞生的</h2>
          </div>

          <div class="max-w-3xl mx-auto space-y-6">
            <div class="retro-section-dark rounded-2xl p-6 sm:p-8" style=${{ border: `1px solid ${C.border}` }}>
              <div class="flex items-center gap-2 mb-3">
                <span class="text-2xl">💡</span>
                <span class="text-sm font-bold" style=${{ color: C.accent }}>缘起：一堂失败的物理课</span>
              </div>
              <p class="text-sm leading-relaxed" style=${{ color: C.textMuted }}>
                2024 年冬天，我们的创始人在一所中学旁听物理课。老师讲得卖力，学生睡得安详。课后他问一个学生「抛体运动好玩吗」，学生说「好玩个锤子，但王者荣耀的抛物线弹道我倒研究得挺透」。那一刻他意识到：不是知识无聊，是打开方式不对。如果能把物理课变成一局游戏呢？
              </p>
            </div>

            <div class="retro-section-dark rounded-2xl p-6 sm:p-8" style=${{ border: `1px solid ${C.border}` }}>
              <div class="flex items-center gap-2 mb-3">
                <span class="text-2xl">🤖</span>
                <span class="text-sm font-bold" style=${{ color: C.accent }}>破局：让 AI 组队干活</span>
              </div>
              <p class="text-sm leading-relaxed" style=${{ color: C.textMuted }}>
                一个人设计游戏方案太慢了，但一群 AI 呢？我们搭建了多智能体协作系统——教育专家负责拆解知识点，游戏设计师负责构思玩法，剧情编剧负责编织叙事，测试员负责挑刺。它们像真人团队一样开会、争论、妥协、达成共识，最终吐出一份完整的游戏化教学方案。整个过程，用户只需要把书扔进去。
              </p>
            </div>

            <div class="retro-section-dark rounded-2xl p-6 sm:p-8" style=${{ border: `1px solid ${C.border}` }}>
              <div class="flex items-center gap-2 mb-3">
                <span class="text-2xl">🚀</span>
                <span class="text-sm font-bold" style=${{ color: C.accent }}>生长：从一个实验到一个平台</span>
              </div>
              <p class="text-sm leading-relaxed" style=${{ color: C.textMuted }}>
                原型上线第一个月，8000 多位老师和学生涌入，生成了上千个方案。有人用它教小学生认识分数，有人把它变成考研政治的通关游戏。我们看到了「书扔进去，游戏吐出来」的无限可能。于是我们决定把它做成一个开放的平台——让每个人都能把任何知识变成一场停不下来的冒险。
              </p>
            </div>
          </div>
        </section>

        <!-- ═══ 数据统计横幅 ═══ -->
        <section class="mt-16 retro-section-dark rounded-3xl px-6 py-8 sm:px-10 sm:py-10"
                 style=${{ border: `1px solid ${C.border}` }}>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
            ${STATS.map((s, i) => html`
              <div key=${i} class="text-center">
                <div class="text-3xl sm:text-4xl font-black mb-1"
                     style=${{ color: i % 2 === 0 ? C.accent : C.primary }}>
                  ${s.value}
                </div>
                <div class="text-xs sm:text-sm" style=${{ color: C.textMuted }}>
                  ${s.label}<span style=${{ color: C.textDim }}> · ${s.suffix}</span>
                </div>
              </div>
            `)}
          </div>
        </section>

        <!-- ═══ 核心价值观 ═══ -->
        <section class="mt-16">
          <div class="text-center mb-10">
            <div class="retro-eyebrow mb-2">// CORE VALUES</div>
            <h2 class="text-2xl sm:text-3xl font-black" style=${{ color: C.text }}>我们信奉的三件事</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            ${VALUES.map((v, i) => html`
              <div key=${i} class="retro-section-dark rounded-2xl p-6 sm:p-7 transition-all duration-300"
                   style=${{ border: `1px solid ${C.border}` }}
                   onMouseEnter=${(e) => {
                     e.currentTarget.style.transform = 'translateY(-4px)'
                     e.currentTarget.style.border = `1px solid ${v.color}40`
                   }}
                   onMouseLeave=${(e) => {
                     e.currentTarget.style.transform = 'translateY(0)'
                     e.currentTarget.style.border = `1px solid ${C.border}`
                   }}>
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4"
                     style=${{ background: `${v.color}15`, border: `1px solid ${v.color}30` }}>
                  ${v.icon}
                </div>
                <h3 class="text-lg font-black mb-2" style=${{ color: C.text }}>${v.title}</h3>
                <p class="text-sm leading-relaxed" style=${{ color: C.textMuted }}>${v.desc}</p>
              </div>
            `)}
          </div>
        </section>

        <!-- ═══ 团队介绍 ═══ -->
        <section class="mt-16">
          <div class="text-center mb-10">
            <div class="retro-eyebrow mb-2">// THE TEAM</div>
            <h2 class="text-2xl sm:text-3xl font-black" style=${{ color: C.text }}>把这事儿干成的人</h2>
            <p class="text-sm mt-2" style=${{ color: C.textMuted }}>一群对教育和游戏都上头的疯子</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            ${TEAM.map((member, i) => html`
              <div key=${i} class="retro-section-dark rounded-2xl p-6 transition-all duration-300"
                   style=${{ border: `1px solid ${C.border}` }}
                   onMouseEnter=${(e) => {
                     e.currentTarget.style.background = 'rgba(167,139,250,0.06)'
                     e.currentTarget.style.border = `1px solid ${member.color}30`
                   }}
                   onMouseLeave=${(e) => {
                     e.currentTarget.style.background = ''
                     e.currentTarget.style.border = `1px solid ${C.border}`
                   }}>
                <div class="flex items-center gap-3 mb-4">
                  <!-- 头像首字母 -->
                  <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0"
                       style=${{
                         background: `${member.color}20`,
                         color: member.color,
                         border: `2px solid ${member.color}40`,
                         boxShadow: `0 0 16px ${member.color}20`,
                       }}>
                    ${member.initial}
                  </div>
                  <div class="min-w-0">
                    <h3 class="text-base font-black truncate" style=${{ color: C.text }}>${member.name}</h3>
                    <div class="text-xs font-bold" style=${{ color: member.color }}>${member.role}</div>
                    <div class="text-[11px]" style=${{ color: C.textDim }}>${member.tagline}</div>
                  </div>
                </div>
                <p class="text-sm leading-relaxed" style=${{ color: C.textMuted }}>${member.bio}</p>
              </div>
            `)}
          </div>
        </section>

        <!-- ═══ 联系方式 ═══ -->
        <section class="mt-16">
          <div class="text-center mb-8">
            <div class="retro-eyebrow mb-2">// GET IN TOUCH</div>
            <h2 class="text-2xl sm:text-3xl font-black" style=${{ color: C.text }}>找我们聊聊</h2>
            <p class="text-sm mt-2" style=${{ color: C.textMuted }}>有问题、有想法、有吐槽，随时来敲门</p>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            ${SOCIALS.map((s, i) => html`
              <div key=${i} class="rounded-2xl p-5 text-center transition-all duration-300 cursor-pointer"
                   style=${{ background: C.surface, border: `1px solid ${C.border}` }}
                   onMouseEnter=${(e) => {
                     e.currentTarget.style.background = `${s.color}08`
                     e.currentTarget.style.border = `1px solid ${s.color}30`
                     e.currentTarget.style.transform = 'translateY(-2px)'
                   }}
                   onMouseLeave=${(e) => {
                     e.currentTarget.style.background = C.surface
                     e.currentTarget.style.border = `1px solid ${C.border}`
                     e.currentTarget.style.transform = 'translateY(0)'
                   }}
                   onClick=${() => go(STEPS.FEEDBACK)}>
                <div class="text-2xl mb-2">${s.icon}</div>
                <div class="text-xs font-bold mb-0.5" style=${{ color: C.textMuted }}>${s.label}</div>
                <div class="text-sm font-semibold" style=${{ color: s.color }}>${s.value}</div>
              </div>
            `)}
          </div>
        </section>

        <!-- ═══ 底部 CTA ═══ -->
        <section class="mt-16 retro-section-dark relative overflow-hidden rounded-3xl px-6 py-12 sm:px-10 sm:py-14 text-center"
                 style=${{ border: `1px solid ${C.border}` }}>
          <div style=${{
            position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
            width: '100%', height: '100%',
            background: 'radial-gradient(ellipse at 50% 100%, rgba(245,166,35,0.1) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}></div>
          <div class="relative">
            <h2 class="text-2xl sm:text-4xl font-black mb-3" style=${{ color: C.text }}>
              准备好让知识进脑子了吗？
            </h2>
            <p class="text-sm sm:text-base max-w-xl mx-auto mb-8" style=${{ color: C.textMuted }}>
              加入我们，把任何一本教材变成一场停不下来的游戏冒险。含金量还在上升。
            </p>
            <button class="px-8 py-3.5 rounded-xl text-base font-bold transition-all duration-200"
                    style=${{ background: C.accent, color: '#1a0f3d', boxShadow: `0 6px 28px ${C.accent}40` }}
                    onMouseEnter=${(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = `0 10px 36px ${C.accent}60` }}
                    onMouseLeave=${(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 6px 28px ${C.accent}40` }}
                    onClick=${() => go(STEPS.LANDING)}>
              免费开始创作 →
            </button>
          </div>
        </section>

      <//>
      <${Footer} />
    </div>
  `
}
