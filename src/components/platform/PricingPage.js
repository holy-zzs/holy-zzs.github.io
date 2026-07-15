// 定价页 — 3档定价 + 月/年切换 + 功能对比表 + FAQ
import { html, useCallback, useContext, useState } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js?v=ctx2'
import { Footer, NavBar, PageContainer } from './PlatformCommon.js?v=nav3'

// ── 复古色板 ──
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

// ── 定价方案 ──
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    nameCn: '免费版',
    emoji: '🌱',
    tagline: '先试试水，有手就行',
    monthly: 0,
    annual: 0,
    popular: false,
    features: [
      '每月 3 个游戏方案',
      '基础团队配置（5人组）',
      '社区方案浏览',
      '标准导出（Markdown）',
      '社区支持',
    ],
    notIncluded: ['高级 AI 专家', 'PDF 导出', '团队协作'],
  },
  {
    id: 'pro',
    name: 'Pro',
    nameCn: '专业版',
    emoji: '⚡',
    tagline: '个人创作者的最佳选择',
    monthly: 29,
    annual: 290,
    popular: true,
    features: [
      '无限游戏方案',
      '全部 132 位 AI 专家',
      '优先客服支持',
      'PDF / Word 导出',
      '自定义 AI 专家配置',
      '方案版本历史',
      '去除水印',
    ],
    notIncluded: ['团队协作', '管理面板'],
  },
  {
    id: 'team',
    name: 'Team',
    nameCn: '团队版',
    emoji: '🚀',
    tagline: '团队/学校/机构协作利器',
    monthly: 99,
    annual: 990,
    popular: false,
    features: [
      '包含 Pro 全部功能',
      '团队协作空间',
      '管理员控制面板',
      'API 接口访问',
      '成员权限管理',
      '共享素材库',
      '专属客户经理',
      '数据统计分析',
    ],
    notIncluded: [],
  },
]

// ── 功能对比表 ──
const COMPARISON_GROUPS = [
  {
    group: '创作能力',
    items: [
      { label: '每月游戏方案数', free: '3 个', pro: '无限', team: '无限' },
      { label: 'AI 专家数量', free: '5 人基础团队', pro: '132 位全部', team: '132 位 + 自定义' },
      { label: '教材上传大小', free: '10MB', pro: '50MB', team: '200MB' },
      { label: '讨论轮次', free: '3 轮', pro: '无限', team: '无限' },
    ],
  },
  {
    group: '导出与分享',
    items: [
      { label: 'Markdown 导出', free: '✓', pro: '✓', team: '✓' },
      { label: 'PDF 导出', free: '—', pro: '✓', team: '✓' },
      { label: 'Word 导出', free: '—', pro: '✓', team: '✓' },
      { label: '社区分享', free: '✓', pro: '✓', team: '✓' },
      { label: '去除水印', free: '—', pro: '✓', team: '✓' },
    ],
  },
  {
    group: '团队与协作',
    items: [
      { label: '团队工作空间', free: '—', pro: '—', team: '✓' },
      { label: '成员权限管理', free: '—', pro: '—', team: '✓' },
      { label: '共享素材库', free: '—', pro: '—', team: '✓' },
      { label: '管理控制面板', free: '—', pro: '—', team: '✓' },
      { label: 'API 接口', free: '—', pro: '—', team: '✓' },
    ],
  },
  {
    group: '支持服务',
    items: [
      { label: '社区支持', free: '✓', pro: '✓', team: '✓' },
      { label: '优先客服', free: '—', pro: '✓', team: '✓' },
      { label: '专属客户经理', free: '—', pro: '—', team: '✓' },
      { label: 'SLA 保障', free: '—', pro: '—', team: '99.9%' },
    ],
  },
]

// ── FAQ ──
const FAQS = [
  {
    q: '免费版有什么限制？',
    a: '免费版每月可以生成 3 个游戏方案，使用 5 人基础 AI 团队，支持 Markdown 导出和社区分享。对于个人尝鲜和轻量使用完全够用，含金量够你试出花来。',
  },
  {
    q: '年付有什么优惠？',
    a: '选择年付方案直接省 2 个月费用，相当于买 10 个月送 2 个月。Pro 年付 290 元（原价 348 元），Team 年付 990 元（原价 1188 元），稳赚不亏。',
  },
  {
    q: '可以随时升级或降级吗？',
    a: '当然可以。随时升级，按比例补差价；降级在当前周期结束后生效。团队版支持随时增减席位，按实际使用量计费，想怎么切就怎么切。',
  },
  {
    q: '团队版支持多少人使用？',
    a: '团队版起价包含 5 个席位，可以随时按需增加，每个额外席位 19 元/月。支持自定义角色权限、共享素材库和 API 接口调用，学校和企业都能用。',
  },
]

// ── 定价卡片组件 ──
function PricingCard({ plan, billing, onChoose }) {
  const price = billing === 'annual' ? plan.annual : plan.monthly
  const period = billing === 'annual' ? '年' : '月'
  const isPopular = plan.popular

  return html`
    <div class="relative rounded-2xl p-6 transition-all duration-300"
         style=${{
           background: isPopular ? 'rgba(167,139,250,0.06)' : C.surface,
           border: isPopular ? `2px solid ${C.primary}` : `1px solid ${C.border}`,
           boxShadow: isPopular ? `0 8px 40px ${C.primary}15` : 'none',
           transform: isPopular ? 'scale(1.02)' : 'scale(1)',
         }}>
      ${isPopular && html`
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
             style=${{ background: C.accent, color: '#1a0f3d' }}>
          ⭐ 最受欢迎
        </div>
      `}

      <!-- 方案头 -->
      <div class="flex items-center gap-2 mb-1">
        <span class="text-2xl">${plan.emoji}</span>
        <h3 class="text-xl font-black" style=${{ color: C.text }}>${plan.name}</h3>
      </div>
      <p class="text-sm mb-4" style=${{ color: C.textMuted }}>${plan.tagline}</p>

      <!-- 价格 -->
      <div class="mb-5">
        <div class="flex items-baseline gap-1">
          <span class="text-4xl font-black" style=${{ color: isPopular ? C.accent : C.text }}>
            ${price === 0 ? '¥0' : `¥${price}`}
          </span>
          <span class="text-sm" style=${{ color: C.textDim }}>${price === 0 ? '永久免费' : `/${period}`}</span>
        </div>
        ${billing === 'annual' && price > 0 && html`
          <p class="text-xs mt-1" style=${{ color: C.accent }}>
            省了 ¥${plan.monthly * 12 - plan.annual}，相当于省 2 个月
          </p>
        `}
      </div>

      <!-- 功能列表 -->
      <ul class="space-y-2.5 mb-6">
        ${plan.features.map((f, i) => html`
          <li key=${i} class="flex items-start gap-2 text-sm">
            <span style=${{ color: C.accent }}>✓</span>
            <span style=${{ color: C.textMuted }}>${f}</span>
          </li>
        `)}
        ${plan.notIncluded.map((f, i) => html`
          <li key=${`no-${i}`} class="flex items-start gap-2 text-sm">
            <span style=${{ color: C.textDim }}>—</span>
            <span style=${{ color: C.textDim, textDecoration: 'line-through' }}>${f}</span>
          </li>
        `)}
      </ul>

      <!-- CTA 按钮 -->
      <button class="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200"
              style=${isPopular
                ? { background: C.accent, color: '#1a0f3d', boxShadow: `0 4px 20px ${C.accent}30` }
                : { background: 'rgba(167,139,250,0.1)', color: C.primary, border: `1px solid ${C.primary}` }}
              onMouseEnter=${(e) => {
                if (isPopular) { e.target.style.boxShadow = `0 6px 24px ${C.accent}50` }
                else { e.target.style.background = 'rgba(167,139,250,0.2)' }
              }}
              onMouseLeave=${(e) => {
                if (isPopular) { e.target.style.boxShadow = `0 4px 20px ${C.accent}30` }
                else { e.target.style.background = 'rgba(167,139,250,0.1)' }
              }}
              onClick=${() => onChoose(plan)}>
        ${price === 0 ? '免费开始' : `选择 ${plan.name}`}
      </button>
    </div>
  `
}

export default function PricingPage() {
  const { dispatch } = useContext(AppContext)
  const [billing, setBilling] = useState('monthly') // monthly | annual
  const [faqOpen, setFaqOpen] = useState(-1)

  const goAuth = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: STEPS.AUTH })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  const goLanding = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: STEPS.LANDING })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  const toggleFaq = useCallback((i) => {
    setFaqOpen((prev) => (prev === i ? -1 : i))
  }, [])

  return html`
    <div class="brand-page-root" style=${{ background: C.bg, minHeight: '100vh' }}>
      <${NavBar} />
      <${PageContainer}>

        <!-- ═══ 顶部标题区 ═══ -->
        <section class="brand-surface-card relative overflow-hidden rounded-3xl px-6 py-12 sm:px-10 sm:py-16 text-center"
                 style=${{ border: `1px solid ${C.border}` }}>
          <div style=${{
            position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
            backgroundImage: 'url("https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20retro-futuristic%20synthwave%20landscape%20with%20a%20glowing%20neon%20grid%20floor%2C%20distant%20cyberpunk%20mountains%2C%20and%20a%20huge%20setting%20digital%20sun%2C%20dark%20purple%20and%20orange%20hues%2C%208k&image_size=landscape_16_9")',
            backgroundSize: 'cover', backgroundPosition: 'center', opacity: '0.15', pointerEvents: 'none'
          }}></div>
          <div style=${{
            position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)',
            filter: 'blur(40px)', pointerEvents: 'none',
          }}></div>
          <div class="relative z-10">
            <div class="brand-eyebrow mb-3">Pricing Plans</div>
            <h1 class="brand-page-title mb-3" style=${{ color: C.text }}>
              让定价页也和首页保持同一套产品级表达
            </h1>
            <p class="brand-page-subtitle max-w-2xl mx-auto" style=${{ color: C.textMuted }}>
              用更清晰的层级、方案边界和交付信号，承接从首页进入后的商业化决策。
            </p>

            <!-- 月/年切换 -->
            <div class="inline-flex items-center gap-1 p-1 rounded-2xl mt-8"
                 style=${{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}>
              <button class="px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200"
                      style=${billing === 'monthly' ? { background: C.primary, color: '#fff' } : { color: C.textMuted }}
                      onClick=${() => setBilling('monthly')}>
                按月付
              </button>
              <button class="px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2"
                      style=${billing === 'annual' ? { background: C.primary, color: '#fff' } : { color: C.textMuted }}
                      onClick=${() => setBilling('annual')}>
                按年付
                <span class="text-xs px-1.5 py-0.5 rounded-full"
                      style=${{ background: C.accent, color: '#1a0f3d' }}>省2个月</span>
              </button>
            </div>
          </div>
        </section>

        <!-- ═══ 定价卡片 ═══ -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          ${PLANS.map((plan) => html`<${PricingCard} key=${plan.id} plan=${plan} billing=${billing} onChoose=${() => goAuth()} />`)}
        </section>

        <!-- ═══ 功能对比表 ═══ -->
        <section class="mt-16">
          <div class="text-center mb-8">
            <div class="retro-eyebrow mb-2">// FEATURE COMPARISON</div>
            <h2 class="text-2xl sm:text-3xl font-black" style=${{ color: C.text }}>功能对比详情</h2>
            <p class="text-sm mt-1" style=${{ color: C.textMuted }}>掰开了揉碎了看，到底哪个适合你</p>
          </div>

          <div class="rounded-2xl overflow-hidden" style=${{ border: `1px solid ${C.border}`, background: C.surface }}>
            <!-- 表头 -->
            <div class="grid grid-cols-4 gap-2 px-4 sm:px-6 py-4"
                 style=${{ borderBottom: `1px solid ${C.border}`, background: 'rgba(167,139,250,0.04)' }}>
              <div class="text-sm font-bold" style=${{ color: C.text }}>功能</div>
              <div class="text-center text-sm font-bold" style=${{ color: C.textMuted }}>Free</div>
              <div class="text-center text-sm font-bold" style=${{ color: C.accent }}>Pro ⭐</div>
              <div class="text-center text-sm font-bold" style=${{ color: C.textMuted }}>Team</div>
            </div>

            <!-- 分组行 -->
            ${COMPARISON_GROUPS.map((group, gi) => html`
              <div key=${gi}>
                <div class="px-4 sm:px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
                     style=${{ background: 'rgba(255,255,255,0.02)', color: C.primary, borderBottom: `1px solid ${C.border}` }}>
                  ${group.group}
                </div>
                ${group.items.map((item, ii) => html`
                  <div key=${ii} class="grid grid-cols-4 gap-2 px-4 sm:px-6 py-3 items-center"
                       style=${{ borderBottom: `1px solid ${C.border}` }}>
                    <div class="text-sm" style=${{ color: C.textMuted }}>${item.label}</div>
                    <div class="text-center text-sm" style=${{ color: item.free === '✓' ? C.accent : item.free === '—' ? C.textDim : C.text }}>
                      ${item.free}
                    </div>
                    <div class="text-center text-sm font-semibold" style=${{ color: item.pro === '✓' ? C.accent : item.pro === '—' ? C.textDim : C.text, background: 'rgba(167,139,250,0.03)' }}>
                      ${item.pro}
                    </div>
                    <div class="text-center text-sm" style=${{ color: item.team === '✓' ? C.accent : item.team === '—' ? C.textDim : C.text }}>
                      ${item.team}
                    </div>
                  </div>
                `)}
              </div>
            `)}
          </div>
        </section>

        <!-- ═══ FAQ ═══ -->
        <section class="mt-16 max-w-3xl mx-auto">
          <div class="text-center mb-8">
            <div class="retro-eyebrow mb-2">// FAQ</div>
            <h2 class="text-2xl sm:text-3xl font-black" style=${{ color: C.text }}>定价常见问题</h2>
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
        <section class="mt-16 brand-surface-card rounded-3xl px-6 py-10 sm:px-10 sm:py-12 text-center"
                 style=${{ border: `1px solid ${C.border}` }}>
          <h2 class="text-2xl sm:text-3xl font-black mb-2" style=${{ color: C.text }}>还在纠结？</h2>
          <p class="text-sm mb-6" style=${{ color: C.textMuted }}>先用免费版试试，觉得好再升级，稳的不亏</p>
          <div class="flex items-center justify-center gap-3 flex-wrap">
            <button class="px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200"
                    style=${{ background: C.accent, color: '#1a0f3d', boxShadow: `0 4px 20px ${C.accent}30` }}
                    onMouseEnter=${(e) => { e.target.style.transform = 'translateY(-1px)' }}
                    onMouseLeave=${(e) => { e.target.style.transform = 'translateY(0)' }}
                    onClick=${goAuth}>
              免费开始 🚀
            </button>
            <button class="px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200"
                    style=${{ background: 'rgba(167,139,250,0.1)', color: C.primary, border: `1px solid ${C.primary}` }}
                    onClick=${goLanding}>
              回首页看看
            </button>
          </div>
        </section>

      <//>
      <${Footer} />
    </div>
  `
}
