// 邀请好友 / 推荐计划页 — 分享链接、双方得奖，含金量传染
import { html, useContext, useState, useCallback } from '../../deps.js'
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
  surfaceHover: 'rgba(255,255,255,0.06)',
}

// ── 个人邀请统计（mock）──
const MY_STATS = [
  { id: 'invited', label: '已邀请人数', value: '8', emoji: '📨', color: C.primary },
  { id: 'registered', label: '成功注册', value: '5', emoji: '✅', color: '#4ade80' },
  { id: 'rewardDays', label: '获得奖励天数', value: '35', emoji: '🎁', color: C.accent },
]

// ── 推荐排行榜（mock top5）──
const LEADERBOARD = [
  { rank: 1, name: '游戏化教学王', avatar: '👑', count: 86, reward: '永久Pro' },
  { rank: 2, name: '知识搬运工', avatar: '🦊', count: 54, reward: '永久Pro' },
  { rank: 3, name: '上头制造机', avatar: '🔥', count: 41, reward: '永久Pro' },
  { rank: 4, name: '课代表本表', avatar: '🐼', count: 33, reward: '30天Pro' },
  { rank: 5, name: '摸鱼 inventor', avatar: '⚡', count: 27, reward: '30天Pro' },
]

// ── 玩法步骤 ──
const HOW_STEPS = [
  { num: '01', emoji: '🔗', title: '分享链接', desc: '把你的专属邀请链接发给同学、同事、群聊，复制粘贴有手就行' },
  { num: '02', emoji: '📝', title: '好友注册', desc: '朋友通过你的链接注册并完成第一次游戏方案生成，算作邀请成功' },
  { num: '03', emoji: '🎉', title: '双方得奖', desc: '好友拿到 7 天 Pro 体验，你累计 Pro 天数奖励，上不封顶' },
]

// ── 奖励阶梯 ──
const REWARD_TIERS = [
  { count: 1, reward: '7天Pro', desc: '邀请 1 位好友注册，双方各得 7 天 Pro', emoji: '🌱', highlight: false },
  { count: 3, reward: '30天Pro', desc: '累计 3 位好友，解锁 30 天 Pro + 去水印', emoji: '⚡', highlight: true },
  { count: 10, reward: '永久Pro', desc: '累计 10 位好友，永久 Pro + 专属邀请徽章', emoji: '👑', highlight: false },
]

// ── 社交分享渠道 ──
const SHARE_CHANNELS = [
  { id: 'wechat', label: '微信', emoji: '💬', color: '#4ade80' },
  { id: 'weibo', label: '微博', emoji: '🌐', color: '#f87171' },
  { id: 'qq', label: 'QQ', emoji: '🐧', color: '#60a5fa' },
  { id: 'twitter', label: 'Twitter', emoji: '🐦', color: '#38bdf8' },
  { id: 'copy', label: '复制链接', emoji: '🔗', color: C.accent },
]

// ── FAQ ──
const FAQS = [
  {
    q: '邀请奖励的 Pro 天数怎么算？',
    a: '每成功邀请一位好友注册并完成首次方案生成，你和好友各得 7 天 Pro。邀请 3 位解锁 30 天 Pro，邀请 10 位解锁永久 Pro 及专属邀请徽章。奖励天数会在好友完成注册后 24 小时内发放到账。',
  },
  {
    q: '好友必须付费才算邀请成功吗？',
    a: '不需要。好友只要通过你的专属链接注册账号，并完成第一次游戏方案生成（用免费额度也算），就视为邀请成功。不搞套路，注册+体验即生效，含金量拉满。',
  },
  {
    q: '我最多能邀请多少人？奖励有上限吗？',
    a: '没有上限，想邀请多少都行。邀请越多累计的 Pro 天数越多，达到 10 人后直接升级永久 Pro。排行榜每周一刷新，邀请量 Top 5 的用户还能额外获得当月专属称号奖励。',
  },
]

// ── 生成假推荐码 ──
function genReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `KNOWLEDGE-${code}`
}

export default function InvitePage() {
  const { dispatch, toast } = useContext(AppContext)
  const [referralCode, setReferralCode] = useState(() => genReferralCode())
  const [copied, setCopied] = useState(false)
  const [faqOpen, setFaqOpen] = useState(-1)

  const referralLink = `https://knb.game/r/${referralCode}`

  const goLanding = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: STEPS.LANDING })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  // 复制链接
  const handleCopy = useCallback(() => {
    try {
      navigator.clipboard?.writeText(referralLink)
    } catch (e) { /* 忽略剪贴板权限问题 */ }
    setCopied(true)
    toast('链接已复制，去群里发就是了', 'success')
    setTimeout(() => setCopied(false), 2000)
  }, [referralLink, toast])

  // 重新生成推荐码
  const handleRegen = useCallback(() => {
    setReferralCode(genReferralCode())
    toast('换了个新邀请码，旧链接会失效哦', 'info')
  }, [toast])

  // 社交分享
  const handleShare = useCallback((channel) => {
    if (channel.id === 'copy') {
      handleCopy()
      return
    }
    toast(`${channel.label} 分享暂未接入，先复制链接手动发吧`, 'info')
  }, [handleCopy, toast])

  const toggleFaq = useCallback((i) => {
    setFaqOpen((prev) => (prev === i ? -1 : i))
  }, [])

  return html`
    <div style=${{ background: C.bg, minHeight: '100vh' }}>
      <${NavBar} />
      <${PageContainer}>

        <!-- ═══ Hero 区 ═══ -->
        <section class="retro-section-dark relative overflow-hidden rounded-3xl px-6 py-12 sm:px-10 sm:py-16 text-center"
                 style=${{ border: `1px solid ${C.border}` }}>
          <div style=${{
            position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
            width: '420px', height: '420px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)',
            filter: 'blur(40px)', pointerEvents: 'none',
          }}></div>
          <div class="relative">
            <div class="retro-eyebrow mb-3">// REFERRAL PROGRAM</div>
            <h1 class="text-3xl sm:text-5xl font-black mb-3" style=${{ color: C.text }}>
              邀请好友，一起上头
            </h1>
            <p class="text-base sm:text-lg max-w-2xl mx-auto" style=${{ color: C.textMuted }}>
              把"知识不进脑子啊"安利给同学同事，好友注册即送 7 天 Pro，你累计 Pro 天数奖励，上不封顶，稳赚不亏。
            </p>
          </div>
        </section>

        <!-- ═══ 个人统计卡片 ═══ -->
        <section class="grid grid-cols-3 gap-4 mt-8">
          ${MY_STATS.map((stat) => html`
            <div key=${stat.id} class="rounded-2xl p-5 transition-all duration-300"
                 style=${{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                     style=${{ background: 'rgba(167,139,250,0.08)' }}>${stat.emoji}</div>
                <div>
                  <div class="text-2xl sm:text-3xl font-black" style=${{ color: stat.color }}>${stat.value}</div>
                  <div class="text-xs mt-0.5" style=${{ color: C.textMuted }}>${stat.label}</div>
                </div>
              </div>
            </div>
          `)}
        </section>

        <!-- ═══ 推荐链接 + 分享 ═══ -->
        <section class="mt-8 rounded-2xl p-6 sm:p-8"
                 style=${{ background: C.surface, border: `1px solid ${C.border}` }}>
          <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 class="text-xl font-black" style=${{ color: C.text }}>我的专属邀请链接</h2>
              <p class="text-sm mt-1" style=${{ color: C.textMuted }}>朋友通过这个链接注册，双方都能拿奖励</p>
            </div>
            <button class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    style=${{ background: 'rgba(167,139,250,0.1)', color: C.primary, border: `1px solid ${C.border}` }}
                    onClick=${handleRegen}>
              🔄 换一个码
            </button>
          </div>

          <!-- 链接框 -->
          <div class="flex items-center gap-2 rounded-xl p-1.5 mb-5"
               style=${{ background: 'rgba(5,1,15,0.5)', border: `1px solid ${C.border}` }}>
            <div class="flex-1 px-4 py-2.5 text-sm font-mono truncate"
                 style=${{ color: C.primary }}>${referralLink}</div>
            <button class="px-5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-200"
                    style=${{ background: C.accent, color: '#1a0f3d', boxShadow: `0 4px 16px ${C.accent}30` }}
                    onMouseEnter=${(e) => { e.target.style.boxShadow = `0 6px 20px ${C.accent}50` }}
                    onMouseLeave=${(e) => { e.target.style.boxShadow = `0 4px 16px ${C.accent}30` }}
                    onClick=${handleCopy}>
              ${copied ? '✓ 已复制' : '复制链接'}
            </button>
          </div>

          <!-- 社交分享按钮 -->
          <div class="text-xs mb-3" style=${{ color: C.textDim }}>或直接分享到</div>
          <div class="flex flex-wrap gap-3">
            ${SHARE_CHANNELS.map((ch) => html`
              <button key=${ch.id}
                      class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                      style=${{ background: 'rgba(255,255,255,0.04)', color: C.text, border: `1px solid ${C.border}` }}
                      onMouseEnter=${(e) => { e.target.style.background = C.surfaceHover; e.target.style.borderColor = ch.color }}
                      onMouseLeave=${(e) => { e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.borderColor = C.border }}
                      onClick=${() => handleShare(ch)}>
                <span class="text-lg">${ch.emoji}</span>
                <span>${ch.label}</span>
              </button>
            `)}
          </div>
        </section>

        <!-- ═══ 玩法步骤 ═══ -->
        <section class="mt-16">
          <div class="text-center mb-8">
            <div class="retro-eyebrow mb-2">// HOW IT WORKS</div>
            <h2 class="text-2xl sm:text-3xl font-black" style=${{ color: C.text }}>三步搞定，有手就行</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            ${HOW_STEPS.map((step, i) => html`
              <div key=${i} class="relative rounded-2xl p-6 transition-all duration-300"
                   style=${{ background: C.surface, border: `1px solid ${C.border}` }}>
                <div class="flex items-center justify-between mb-4">
                  <span class="text-3xl">${step.emoji}</span>
                  <span class="text-3xl font-black" style=${{ color: C.textDim }}>${step.num}</span>
                </div>
                <h3 class="text-lg font-bold mb-2" style=${{ color: C.text }}>${step.title}</h3>
                <p class="text-sm leading-relaxed" style=${{ color: C.textMuted }}>${step.desc}</p>
              </div>
            `)}
          </div>
        </section>

        <!-- ═══ 奖励阶梯 ═══ -->
        <section class="mt-16">
          <div class="text-center mb-8">
            <div class="retro-eyebrow mb-2">// REWARD TIERS</div>
            <h2 class="text-2xl sm:text-3xl font-black" style=${{ color: C.text }}>邀请越多，奖励越顶</h2>
            <p class="text-sm mt-1" style=${{ color: C.textMuted }}>达到对应人数自动升级，不用手动领</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            ${REWARD_TIERS.map((tier, i) => html`
              <div key=${i} class="relative rounded-2xl p-6 transition-all duration-300"
                   style=${{
                     background: tier.highlight ? 'rgba(245,166,35,0.06)' : C.surface,
                     border: tier.highlight ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
                     boxShadow: tier.highlight ? `0 8px 32px ${C.accent}15` : 'none',
                   }}>
                ${tier.highlight && html`
                  <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                       style=${{ background: C.accent, color: '#1a0f3d' }}>⭐ 推荐</div>
                `}
                <div class="text-4xl mb-3">${tier.emoji}</div>
                <div class="flex items-baseline gap-1 mb-1">
                  <span class="text-3xl font-black" style=${{ color: tier.highlight ? C.accent : C.primary }}>${tier.count}</span>
                  <span class="text-sm" style=${{ color: C.textMuted }}>人</span>
                </div>
                <div class="text-lg font-bold mb-2" style=${{ color: C.text }}>${tier.reward}</div>
                <p class="text-sm leading-relaxed" style=${{ color: C.textMuted }}>${tier.desc}</p>
              </div>
            `)}
          </div>
        </section>

        <!-- ═══ 排行榜 ═══ -->
        <section class="mt-16">
          <div class="text-center mb-8">
            <div class="retro-eyebrow mb-2">// LEADERBOARD</div>
            <h2 class="text-2xl sm:text-3xl font-black" style=${{ color: C.text }}>邀请达人榜</h2>
            <p class="text-sm mt-1" style=${{ color: C.textMuted }}>每周一刷新，Top5 额外送当月专属称号</p>
          </div>
          <div class="rounded-2xl overflow-hidden" style=${{ border: `1px solid ${C.border}`, background: C.surface }}>
            ${LEADERBOARD.map((item, i) => html`
              <div key=${i}
                   class="flex items-center gap-4 px-5 sm:px-6 py-4 transition-colors"
                   style=${{
                     borderBottom: i < LEADERBOARD.length - 1 ? `1px solid ${C.border}` : 'none',
                     background: 'transparent',
                   }}
                   onMouseEnter=${(e) => { e.target.style.background = 'rgba(167,139,250,0.04)' }}
                   onMouseLeave=${(e) => { e.target.style.background = 'transparent' }}>
                <!-- 排名 -->
                <div class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                     style=${{
                       background: item.rank <= 3 ? 'rgba(245,166,35,0.12)' : 'rgba(255,255,255,0.04)',
                       color: item.rank <= 3 ? C.accent : C.textDim,
                     }}>
                  ${item.rank}
                </div>
                <!-- 头像 -->
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
                     style=${{ background: 'rgba(167,139,250,0.1)' }}>${item.avatar}</div>
                <!-- 名字 -->
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-bold truncate" style=${{ color: C.text }}>${item.name}</div>
                  <div class="text-xs" style=${{ color: C.textDim }}>奖励：${item.reward}</div>
                </div>
                <!-- 邀请数 -->
                <div class="text-right shrink-0">
                  <span class="text-lg font-black" style=${{ color: C.accent }}>${item.count}</span>
                  <span class="text-xs ml-1" style=${{ color: C.textMuted }}>人</span>
                </div>
              </div>
            `)}
          </div>
        </section>

        <!-- ═══ FAQ ═══ -->
        <section class="mt-16 max-w-3xl mx-auto">
          <div class="text-center mb-8">
            <div class="retro-eyebrow mb-2">// FAQ</div>
            <h2 class="text-2xl sm:text-3xl font-black" style=${{ color: C.text }}>邀请常见问题</h2>
          </div>
          <div class="space-y-3">
            ${FAQS.map((faq, i) => html`
              <div key=${i} class="rounded-xl overflow-hidden transition-all"
                   style=${{ border: `1px solid ${faqOpen === i ? C.primary : C.border}`, background: C.surface }}>
                <button class="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                        onClick=${() => toggleFaq(i)}>
                  <span class="text-sm font-semibold" style=${{ color: C.text }}>${faq.q}</span>
                  <span class="text-lg shrink-0 transition-transform duration-200"
                        style=${{ color: C.primary, transform: faqOpen === i ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
                </button>
                ${faqOpen === i && html`
                  <div class="px-5 pb-4 text-sm leading-relaxed" style=${{ color: C.textMuted }}>
                    ${faq.a}
                  </div>
                `}
              </div>
            `)}
          </div>
        </section>

        <!-- ═══ 底部 CTA ═══ -->
        <section class="mt-16 retro-section-dark rounded-3xl px-6 py-10 sm:px-10 sm:py-12 text-center"
                 style=${{ border: `1px solid ${C.border}` }}>
          <h2 class="text-2xl sm:text-3xl font-black mb-2" style=${{ color: C.text }}>别光看，快去发链接</h2>
          <p class="text-sm mb-6" style=${{ color: C.textMuted }}>分享给一个人就回本，分享越多白嫖越久，含金量传染起来</p>
          <button class="px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200"
                  style=${{ background: C.accent, color: '#1a0f3d', boxShadow: `0 4px 20px ${C.accent}30` }}
                  onMouseEnter=${(e) => { e.target.style.transform = 'translateY(-1px)' }}
                  onMouseLeave=${(e) => { e.target.style.transform = 'translateY(0)' }}
                  onClick=${handleCopy}>
            复制链接，立刻开整 🚀
          </button>
        </section>

      <//>
      <${Footer} />
    </div>
  `
}
