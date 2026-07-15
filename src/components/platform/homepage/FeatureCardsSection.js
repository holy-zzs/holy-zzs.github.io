import { html } from '../../../deps.js'
import { useScrollReveal } from '../../../lib/useScrollReveal.js'

/**
 * FeatureCardsSection v5 — CORE CAPABILITIES
 *
 * 1+3 混合栅格布局：
 *   左侧 1 个大垂直卡片（占两行）
 *   右侧 1 个长卡 + 2 个方卡（倒品字）
 *
 * 图片铺满整张卡片 · 文字叠加在上方 · 游戏故障渐变效果
 * 层级：背景图(z0) → 渐变遮罩(z1) → 故障扫描线(z2) → 边框(z3) → 文字(z4)
 */

const CAPABILITY_CARDS = [
  {
    key: 'hero',
    type: 'hero',
    image: '/assets/capabilities/hero-command-center.jpg',
    tag: '书太难啃，做游戏又太累',
    title: '解决千古难题',
    desc: '拉了一群 AI 当打工仔，替我画画、写代码、做策划。你当老板，AI 当员工，不仅不要钱，还没脾气。',
  },
  {
    key: 'horizontal',
    type: 'horizontal',
    image: '/assets/capabilities/pixel-game.jpg',
    tag: '死记硬背 VS 自学编程',
    title: '新时代的糖衣炮弹',
    desc: '让知识以一种"卑鄙"的方式进入脑子。既然阻止不了大家玩游戏，就让大家在玩的时候不知不觉学会傅里叶变换。',
  },
  {
    key: 'square-a',
    type: 'square',
    image: '/assets/capabilities/data-matrix.jpg',
    tag: '设计与开发断层',
    title: '教材秒变引擎数据',
    desc: 'AI 自动将枯燥文本解析为关卡 JSON 配置，底层游戏引擎直接接管渲染，零代码所见即所得。',
  },
  {
    key: 'square-b',
    type: 'square',
    image: '/assets/capabilities/smartphone-game.jpg',
    tag: '传播与部署成本极高',
    title: '一键发布试玩',
    desc: '生成即部署。获得一个专属短链接或跨平台二维码，扫码直接开玩，无缝嵌入任何网页。',
  },
]

function CapabilityCard({ card }) {
  const typeClass = card.type === 'hero'
    ? 'cap-card-hero'
    : card.type === 'horizontal'
    ? 'cap-card-horizontal'
    : 'cap-card-square'

  return html`
    <article class=${`cap-card reveal-card ${typeClass}`}>
      <div class="cap-card-bg">
        <img src=${card.image} alt=${card.title} loading="lazy" />
      </div>
      <div class="cap-card-overlay"></div>
      <div class="cap-card-glitch"></div>
      <div class="cap-card-body">
        <span class="cap-card-tag" data-text=${card.tag}>${card.tag}</span>
        <h3 class="cap-card-title">${card.title}</h3>
        <p class="cap-card-desc">${card.desc}</p>
      </div>
    </article>
  `
}

export default function FeatureCardsSection() {
  const revealRef = useScrollReveal({ selector: '.reveal-card', stagger: 0.12 })

  const heroCard = CAPABILITY_CARDS[0]
  const horizontalCard = CAPABILITY_CARDS[1]
  const squareCards = CAPABILITY_CARDS.slice(2)

  return html`
    <section ref=${revealRef} class="capabilities-section"
             data-connect data-connect-anchor=".cap-card-hero"
             data-totem-target=".canvas-wm-3" data-connect-color="#6EE7B7">
      <div class="capabilities-shell">
        <div class="capabilities-header">
          <div class="capabilities-eyebrow">CORE CAPABILITIES</div>
          <h2>这个平台到底能做什么？</h2>
          <p>把复杂的游戏设计生产链压缩成更清晰、更可扩展、更利于传播的产品能力。</p>
        </div>

        <div class="capabilities-grid">
          <${CapabilityCard} card=${heroCard} />

          <div class="cap-right-stack">
            <${CapabilityCard} card=${horizontalCard} />
            <div class="cap-right-bottom">
              ${squareCards.map(card => html`
                <${CapabilityCard} key=${card.key} card=${card} />
              `)}
            </div>
          </div>
        </div>
      </div>
    </section>
  `
}
