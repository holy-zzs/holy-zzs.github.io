// 法律页面 — 隐私政策 / 服务条款 / Cookie政策 三标签切换 + 左侧章节导航 + 打印友好
import { html, useContext, useState, useCallback } from '../../deps.js'
import { AppContext, STEPS } from '../../store/appContext.js'
import { NavBar, Footer, PageContainer } from './PlatformCommon.js?v=nav3'

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

// ── 标签定义 ──
const TABS = [
  { id: 'privacy', label: '隐私政策', icon: '🔒', updated: '2026年7月10日' },
  { id: 'terms', label: '服务条款', icon: '📜', updated: '2026年7月10日' },
  { id: 'cookie', label: 'Cookie政策', icon: '🍪', updated: '2026年7月5日' },
]

// ── 隐私政策章节 ──
const PRIVACY_SECTIONS = [
  {
    num: '一',
    title: '信息收集',
    icon: '📥',
    body: '我们仅收集为提供服务所必需的最少信息，包括您主动提供的邮箱、昵称等注册信息，以及在您使用平台时自动生成的使用日志和设备信息。上传的教材内容仅在当前会话中处理，不会永久存储于服务器。我们承诺不会收集与服务无关的个人敏感信息，如身份证号、银行卡号等。',
  },
  {
    num: '二',
    title: '信息使用',
    icon: '🎯',
    body: '收集到的信息将严格用于账户管理、服务优化、安全防护及用户支持等目的。您的教材内容仅用于生成游戏化教学方案，不会被用于训练任何外部模型。使用日志数据将经过匿名化处理后用于分析平台性能和改进用户体验，绝不用于商业转售。',
  },
  {
    num: '三',
    title: '信息共享',
    icon: '🔗',
    body: '除法律法规要求或您明确同意外，我们不会向任何第三方共享您的个人信息。在您选择将方案发布至社区时，相关内容将公开可见，但您的个人身份信息仍受保护。我们与第三方服务提供商合作时，会签署严格的数据保护协议，确保数据仅用于约定用途。',
  },
  {
    num: '四',
    title: '数据安全',
    icon: '🛡️',
    body: '我们采用行业标准的加密传输（TLS 1.3）和存储技术保护您的数据安全，定期进行安全审计和漏洞扫描。所有服务器部署于具备物理安全防护的云端数据中心，访问权限实行最小化原则。尽管我们尽力保护数据，但互联网传输不存在绝对安全，建议您妥善保管账户密码。',
  },
  {
    num: '五',
    title: '用户权利',
    icon: '⚖️',
    body: '您有权随时访问、更正、导出或删除您的个人信息，可通过账户设置或联系客服行使上述权利。您有权随时注销账户，注销后我们将在30个工作日内删除您的可识别个人信息。如果您认为我们对信息的处理存在不当，有权向相关监管部门投诉。',
  },
  {
    num: '六',
    title: '联系方式',
    icon: '📬',
    body: '如您对本隐私政策有任何疑问、建议或投诉，可通过以下方式联系我们：邮箱 privacy@knb.ai；客服微信：知识不进脑子啊。我们将在收到您的反馈后3个工作日内予以回复。本政策可能随业务发展适时更新，更新后将在平台显著位置公告。',
  },
]

// ── 服务条款章节 ──
const TERMS_SECTIONS = [
  {
    num: '一',
    title: '服务描述',
    icon: '🎮',
    body: '「知识不进脑子啊」是一个基于多智能体AI协作的教育游戏化方案生成平台。用户可上传教材内容，由AI团队协作生成游戏化教学方案，并支持方案的浏览、分享与迭代。平台同时提供社区交流、方案存储等辅助功能。我们保留随时新增、调整或终止部分服务的权利。',
  },
  {
    num: '二',
    title: '用户注册',
    icon: '🔑',
    body: '用户须提供真实有效的邮箱地址完成注册，并对账户密码的保密性负全部责任。注册用户须年满13周岁，未成年人应在监护人指导下使用。禁止冒用他人身份注册，禁止转让、出借账户。如发现账户存在异常使用，我们有权临时冻结账户并要求身份验证。',
  },
  {
    num: '三',
    title: '使用规范',
    icon: '📏',
    body: '用户不得利用平台从事违法违规活动，不得上传含有暴力、色情、歧视等不良内容，不得侵犯他人知识产权。生成的方案内容由用户自行负责，平台仅提供工具服务。禁止使用自动化脚本批量调用平台接口，禁止尝试反向工程、破解平台安全机制。违规者将被限制或终止服务。',
  },
  {
    num: '四',
    title: '知识产权',
    icon: '©️',
    body: '平台的整体架构、视觉设计、AI智能体角色设定等知识产权归平台所有。用户上传的教材内容知识产权归原权利人所有。用户使用平台生成的游戏化方案，用户享有使用权并可自由分享，但不得声称为平台原创。社区公开方案遵循相应的开源许可协议，具体以方案标注为准。',
  },
  {
    num: '五',
    title: '免责声明',
    icon: '⚠️',
    body: '平台提供的AI生成内容仅供参考，不构成专业教育或法律建议。AI生成的方案可能存在知识性错误或不适用情况，用户应自行审核后再用于实际教学。平台不对因服务中断、数据丢失等造成的间接损失承担责任。因不可抗力导致的服务异常，平台不承担责任。',
  },
  {
    num: '六',
    title: '争议解决',
    icon: '🤝',
    body: '本条款的解释与适用均以中华人民共和国法律为准。如因使用本平台产生争议，双方应首先通过友好协商解决。协商不成的，任何一方均可向平台运营方所在地有管辖权的人民法院提起诉讼。我们保留在法律允许范围内更新本条款的权利，更新后继续使用即视为接受。',
  },
]

// ── Cookie政策章节 ──
const COOKIE_SECTIONS = [
  {
    num: '一',
    title: 'Cookie类型',
    icon: '🍪',
    body: '我们使用以下几类Cookie：必要Cookie用于维持登录状态和核心功能运行，不可或缺；偏好Cookie记录您的界面设置和语言选择；分析Cookie帮助我们了解平台使用情况以优化体验；营销Cookie用于展示相关内容，您可选择禁用。除必要Cookie外，其余均可在获得您同意后启用。',
  },
  {
    num: '二',
    title: 'Cookie用途',
    icon: '🎯',
    body: 'Cookie主要用于：保持您的登录会话，避免反复输入账号密码；记住您的界面偏好设置，如深色模式、字体大小等；收集匿名使用统计数据，帮助我们改进产品功能；识别和防范安全风险，如异常登录和恶意访问。我们不会通过Cookie收集您的个人敏感信息。',
  },
  {
    num: '三',
    title: '第三方Cookie',
    icon: '🔗',
    body: '平台可能嵌入第三方服务（如数据分析、字体服务），这些服务可能设置自己的Cookie。我们对第三方Cookie不直接控制，但仅选择通过隐私认证的可靠服务商。建议您查阅相关第三方的隐私政策了解详情。您可在浏览器设置中管理或屏蔽第三方Cookie，但可能影响部分功能。',
  },
  {
    num: '四',
    title: '管理Cookie',
    icon: '⚙️',
    body: '您可通过浏览器设置随时管理、删除或屏蔽Cookie。在Chrome中依次点击「设置-隐私和安全-Cookie」，在Firefox中点击「设置-隐私与安全-Cookie」即可管理。禁用Cookie后，您可能无法使用登录、偏好保存等功能，但核心的方案浏览功能不受影响。如需重新启用，调整浏览器设置后刷新页面即可。',
  },
]

// 标签 -> 章节映射
const SECTIONS_MAP = {
  privacy: PRIVACY_SECTIONS,
  terms: TERMS_SECTIONS,
  cookie: COOKIE_SECTIONS,
}

export default function LegalPage() {
  const { dispatch } = useContext(AppContext)
  const [activeTab, setActiveTab] = useState('privacy')
  const [activeSection, setActiveSection] = useState(0)

  const go = useCallback((step) => {
    dispatch({ type: 'SET_STEP', payload: step })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  const handleTabSwitch = useCallback((tabId) => {
    setActiveTab(tabId)
    setActiveSection(0)
    document.getElementById('legal-content-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleSectionClick = useCallback((idx) => {
    setActiveSection(idx)
    document.getElementById(`legal-section-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const currentTab = TABS.find(t => t.id === activeTab)
  const currentSections = SECTIONS_MAP[activeTab]

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  return html`
    <div style=${{ background: C.bg, minHeight: '100vh' }}>
      <${NavBar} />
      <${PageContainer}>

        <!-- ═══ 页面头部 ═══ -->
        <section class="text-center mb-10">
          <div class="retro-eyebrow mb-3">// LEGAL DOCUMENTS</div>
          <h1 class="text-3xl sm:text-4xl font-black mb-3" style=${{ color: C.text }}>法律信息</h1>
          <p class="text-sm sm:text-base max-w-2xl mx-auto leading-relaxed" style=${{ color: C.textMuted }}>
            我们重视您的隐私与权益。请仔细阅读以下法律文档，了解我们如何收集、使用和保护您的信息。
          </p>
        </section>

        <!-- ═══ 标签栏 ═══ -->
        <div class="flex items-center justify-center gap-2 mb-10 flex-wrap">
          ${TABS.map(tab => {
            const active = tab.id === activeTab
            return html`
              <button key=${tab.id}
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                style=${active
                  ? { background: C.accent, color: '#1a0f3d', boxShadow: `0 4px 20px ${C.accent}30` }
                  : { background: C.surface, color: C.textMuted, border: `1px solid ${C.border}` }}
                onMouseEnter=${(e) => { if (!active) { e.target.style.color = C.primary; e.target.style.borderColor = `${C.primary}40` } }}
                onMouseLeave=${(e) => { if (!active) { e.target.style.color = C.textMuted; e.target.style.borderColor = C.border } }}
                onClick=${() => handleTabSwitch(tab.id)}>
                <span>${tab.icon}</span>
                <span>${tab.label}</span>
              </button>
            `
          })}
        </div>

        <!-- ═══ 内容区域：左侧导航 + 右侧正文 ═══ -->
        <div id="legal-content-top" class="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 lg:gap-8">

          <!-- ── 左侧章节导航（sticky）── -->
          <aside class="lg:sticky lg:top-24 lg:self-start">
            <div class="retro-section-dark rounded-2xl p-5" style=${{ border: `1px solid ${C.border}` }}>
              <!-- 最后更新 -->
              <div class="mb-4 pb-4 border-b" style=${{ borderColor: C.border }}>
                <div class="text-[11px] font-bold uppercase tracking-wider mb-1" style=${{ color: C.textDim }}>最后更新</div>
                <div class="text-sm font-semibold" style=${{ color: C.accent }}>${currentTab.updated}</div>
              </div>

              <!-- 当前标签标题 -->
              <div class="text-xs font-bold mb-3" style=${{ color: C.textMuted }}>
                ${currentTab.icon} ${currentTab.label} · 目录
              </div>

              <!-- 章节列表 -->
              <nav class="space-y-1">
                ${currentSections.map((sec, idx) => {
                  const active = idx === activeSection
                  return html`
                    <button key=${idx}
                      class="w-full text-left flex items-start gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-200"
                      style=${active
                        ? { background: `${C.primary}12`, color: C.primary, fontWeight: 600 }
                        : { color: C.textMuted }}
                      onMouseEnter=${(e) => { if (!active) e.target.style.color = C.text }}
                      onMouseLeave=${(e) => { if (!active) e.target.style.color = C.textMuted }}
                      onClick=${() => handleSectionClick(idx)}>
                      <span class="font-bold shrink-0" style=${{ color: active ? C.accent : C.textDim }}>第${sec.num}条</span>
                      <span>${sec.title}</span>
                    </button>
                  `
                })}
              </nav>

              <!-- 打印按钮 -->
              <button class="w-full mt-5 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all duration-200"
                      style=${{ background: 'transparent', color: C.textMuted, border: `1px solid ${C.border}` }}
                      onMouseEnter=${(e) => { e.target.style.color = C.accent; e.target.style.borderColor = `${C.accent}40` }}
                      onMouseLeave=${(e) => { e.target.style.color = C.textMuted; e.target.style.borderColor = C.border }}
                      onClick=${handlePrint}>
                <span>🖨️</span>
                <span>打印本文档</span>
              </button>
            </div>
          </aside>

          <!-- ── 右侧正文 ── -->
          <div class="min-w-0">
            <!-- 文档标题 -->
            <div class="retro-section-dark rounded-2xl px-6 py-6 sm:px-8 sm:py-7 mb-6"
                 style=${{ border: `1px solid ${C.border}` }}>
              <div class="flex items-center gap-3 mb-2">
                <span class="text-3xl">${currentTab.icon}</span>
                <div>
                  <h2 class="text-2xl font-black" style=${{ color: C.text }}>${currentTab.label}</h2>
                  <div class="text-xs mt-0.5" style=${{ color: C.textDim }}>版本 2.0 · 生效日期 ${currentTab.updated}</div>
                </div>
              </div>
              <p class="text-sm leading-relaxed mt-3" style=${{ color: C.textMuted }}>
                欢迎使用「知识不进脑子啊」平台。请在使用服务前仔细阅读本${currentTab.label}的全部内容。继续使用即表示您已阅读并同意本政策条款。
              </p>
            </div>

            <!-- 章节正文列表 -->
            <div class="space-y-4">
              ${currentSections.map((sec, idx) => html`
                <article key=${idx} id="legal-section-${idx}"
                  class="retro-section-dark rounded-2xl px-6 py-6 sm:px-8 sm:py-7 transition-all duration-300"
                  style=${idx === activeSection
                    ? { border: `1px solid ${C.primary}40`, boxShadow: `0 0 20px ${C.primary}08` }
                    : { border: `1px solid ${C.border}` }}>
                  <!-- 章节标题 -->
                  <div class="flex items-center gap-3 mb-3">
                    <span class="text-2xl shrink-0">${sec.icon}</span>
                    <h3 class="text-base sm:text-lg font-black" style=${{ color: C.text }}>
                      <span style=${{ color: C.accent }}>第${sec.num}条</span>
                      <span class="ml-2">${sec.title}</span>
                    </h3>
                  </div>
                  <!-- 章节正文 -->
                  <p class="text-sm leading-7" style=${{ color: C.textMuted }}>
                    ${sec.body}
                  </p>
                </article>
              `)}
            </div>

            <!-- 文档结尾 -->
            <div class="mt-6 text-center py-6">
              <div class="text-xs" style=${{ color: C.textDim }}>
                — 本文档到此结束 —
              </div>
              <div class="text-xs mt-2" style=${{ color: C.textDim }}>
                如有疑问请联系：legal@knb.ai
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ 底部导航 ═══ -->
        <section class="mt-12 retro-section-dark rounded-2xl px-6 py-8 text-center"
                 style=${{ border: `1px solid ${C.border}` }}>
          <h3 class="text-lg font-black mb-2" style=${{ color: C.text }}>还有其他问题？</h3>
          <p class="text-sm mb-6" style=${{ color: C.textMuted }}>我们的帮助中心也许能解答你的疑惑</p>
          <div class="flex items-center justify-center gap-3 flex-wrap">
            <button class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                    style=${{ background: C.accent, color: '#1a0f3d' }}
                    onMouseEnter=${(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = `0 8px 24px ${C.accent}40` }}
                    onMouseLeave=${(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none' }}
                    onClick=${() => go(STEPS.HELP)}>
              前往帮助中心
            </button>
            <button class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                    style=${{ background: 'rgba(167,139,250,0.1)', color: C.primary, border: `1px solid ${C.primary}` }}
                    onMouseEnter=${(e) => { e.target.style.background = 'rgba(167,139,250,0.2)' }}
                    onMouseLeave=${(e) => { e.target.style.background = 'rgba(167,139,250,0.1)' }}
                    onClick=${() => go(STEPS.LANDING)}>
              返回首页
            </button>
          </div>
        </section>

      <//>
      <${Footer} />
    </div>
  `
}
