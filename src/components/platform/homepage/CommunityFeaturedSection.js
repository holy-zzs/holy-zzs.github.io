import { html, useState, useEffect, useRef, useCallback, useMemo } from '../../../deps.js'
import { useScrollReveal } from '../../../lib/useScrollReveal.js'

/* ─────────────────────────────────────────────────────────────
   数据：5 张社区精选方案卡片
   每张卡 = 一个"知识→游戏"转化橱窗
   ───────────────────────────────────────────────────────────── */
const COMMUNITY_CARDS = [
  {
    id: 'bio-cell',
    title: '《细胞大作战》生物教材版',
    image: '/assets/community/bio-cell.jpg',
    subject: 'bio',
    subjectLabel: '生物',
    source: '人教版高中生物必修一',
    sourceIcon: '🧫',
    downloads: '1.2k',
    rating: '98%',
    ratingLabel: '好评率',
  },
  {
    id: 'chem-elements',
    title: '《元素守护者》化学教材版',
    image: '/assets/community/chem-elements.jpg',
    subject: 'chem',
    subjectLabel: '化学',
    source: '人教版高中化学必修二',
    sourceIcon: '⚗',
    downloads: '856',
    rating: '95%',
    ratingLabel: '通关率',
  },
  {
    id: 'history-qin',
    title: '《秦朝风云》历史教材版',
    image: '/assets/community/history-qin.jpg',
    subject: 'history',
    subjectLabel: '历史',
    source: '部编版七年级历史下册',
    sourceIcon: '📜',
    downloads: '2.3k',
    rating: '99%',
    ratingLabel: '好评率',
  },
  {
    id: 'physics-mechanics',
    title: '《力学大师》物理教材版',
    image: '/assets/community/physics-mechanics.jpg',
    subject: 'physics',
    subjectLabel: '物理',
    source: '人教版高中物理必修一',
    sourceIcon: '⚙',
    downloads: '1.5k',
    rating: '96%',
    ratingLabel: '通关率',
  },
  {
    id: 'econ-trade',
    title: '《星际贸易站》经济教材版',
    image: '/assets/community/econ-trade.jpg',
    subject: 'econ',
    subjectLabel: '经济',
    source: '经济学原理（曼昆版）',
    sourceIcon: '📊',
    downloads: '934',
    rating: '97%',
    ratingLabel: '好评率',
  },
]

/* ─────────────────────────────────────────────────────────────
   知识粒子流 — 公式 / 分子式 / 历史年份
   ───────────────────────────────────────────────────────────── */
const PARTICLE_TEXTS = [
  { text: 'E=mc²', color: '#A855F7' },
  { text: 'H₂O', color: '#3B82F6' },
  { text: 'C₆H₁₂O₆', color: '#22C55E' },
  { text: 'F=ma', color: '#22D3EE' },
  { text: '221 BC', color: '#F59E0B' },
  { text: 'DNA', color: '#22C55E' },
  { text: 'πr²', color: '#A855F7' },
  { text: 'NaCl', color: '#3B82F6' },
  { text: 'GDP= C+I+G+NX', color: '#F59E0B' },
  { text: '∫f(x)dx', color: '#22D3EE' },
  { text: 'ATP', color: '#22C55E' },
  { text: 'v=ds/dt', color: '#22D3EE' },
  { text: '1066', color: '#A855F7' },
  { text: 'pH=-log[H⁺]', color: '#3B82F6' },
  { text: 'CO₂', color: '#3B82F6' },
  { text: '½mv²', color: '#22D3EE' },
  { text: '1914', color: '#F59E0B' },
  { text: 'O₂', color: '#22C55E' },
]

function ParticleField() {
  const particles = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => {
      const p = PARTICLE_TEXTS[i % PARTICLE_TEXTS.length]
      return {
        id: i,
        text: p.text,
        color: p.color,
        left: `${Math.random() * 95}%`,
        top: `${Math.random() * 90}%`,
        duration: `${15 + Math.random() * 20}s`,
        delay: `${Math.random() * 15}s`,
        fontSize: `${10 + Math.random() * 4}px`,
      }
    })
  }, [])

  return html`
    <div class="community-particles">
      ${particles.map(p => html`
        <span
          key=${p.id}
          class="community-particle"
          style=${{
            left: p.left,
            top: p.top,
            color: p.color,
            animationDuration: p.duration,
            animationDelay: p.delay,
            fontSize: p.fontSize,
          }}
        >${p.text}</span>
      `)}
    </div>
  `
}

/* ─────────────────────────────────────────────────────────────
   SVG 图标
   ───────────────────────────────────────────────────────────── */
const DownloadIcon = () => html`
  <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
`

const StarIcon = () => html`
  <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
`

const ChevronLeft = () => html`
  <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
`

const ChevronRight = () => html`
  <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
`

const ArrowRight = () => html`
  <svg viewBox="0 0 24 24" style=${{ width: '14px', height: '14px', stroke: 'currentColor', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
`

const PlayIcon = () => html`
  <svg viewBox="0 0 24 24" style=${{ width: '14px', height: '14px', stroke: 'currentColor', fill: 'currentColor', strokeWidth: 0 }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
`

/* ─────────────────────────────────────────────────────────────
   单张卡片
   ───────────────────────────────────────────────────────────── */
function CommunityCard({ card }) {
  return html`
    <article class="community-card">
      <!-- 封面图层 -->
      <div class="community-card-thumb">
        <img src=${card.image} alt=${card.title} loading="lazy" />
        <!-- 知识溯源角标 -->
        <div class="community-source-badge" title=${card.source}>
          ${card.sourceIcon}
        </div>
        <div class="community-source-tooltip">溯源：${card.source}</div>
        <!-- 悬浮试玩遮罩 -->
        <div class="community-play-overlay">
          <button class="community-play-btn" type="button">
            <${PlayIcon} />
            立即试玩
          </button>
        </div>
      </div>

      <!-- 信息层 -->
      <div class="community-card-info">
        <h3 class="community-card-title">${card.title}</h3>
        <div>
          <span class=${`community-tag community-tag-${card.subject}`}>
            ${card.subjectLabel}
          </span>
        </div>
        <!-- 社交指标 -->
        <div class="community-card-stats">
          <div class="community-stat">
            <${DownloadIcon} />
            <span class="community-stat-value">${card.downloads}</span>
          </div>
          <div class="community-stat">
            <${StarIcon} />
            <span class=${`community-stat-rate`}>${card.rating}</span>
            <span style=${{ fontSize: '10px', opacity: 0.6 }}>${card.ratingLabel}</span>
          </div>
        </div>
      </div>
    </article>
  `
}

/* ─────────────────────────────────────────────────────────────
   主组件
   ───────────────────────────────────────────────────────────── */
export default function CommunityFeaturedSection() {
  const revealRef = useScrollReveal({ selector: '.community-card', stagger: 0.1, y: 0 })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardsPerView, setCardsPerView] = useState(3)
  const trackRef = useRef(null)

  // 响应式：根据屏幕宽度计算每屏卡片数
  useEffect(() => {
    const updateCardsPerView = () => {
      const w = window.innerWidth
      if (w <= 640) setCardsPerView(1)
      else if (w <= 1024) setCardsPerView(2)
      else setCardsPerView(3)
    }
    updateCardsPerView()
    window.addEventListener('resize', updateCardsPerView)
    return () => window.removeEventListener('resize', updateCardsPerView)
  }, [])

  const maxIndex = Math.max(0, COMMUNITY_CARDS.length - cardsPerView)

  // 确保当前索引不越界
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex)
    }
  }, [maxIndex, currentIndex])

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }, [])

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1))
  }, [maxIndex])

  // 计算位移百分比：每张卡片占 (100/cardsPerView)% 减去 gap 比例
  // 卡片宽度 = calc((100% - gap*(cardsPerView-1)) / cardsPerView)
  // 位移 = index * (cardWidth + gap) = index * (100% / cardsPerView)
  const slidePercent = (currentIndex * 100) / cardsPerView
  // 考虑 gap: 24px，每移动一步多移 24px
  const slidePx = currentIndex * 24

  // 轮播点数
  const dotCount = maxIndex + 1

  return html`
    <section ref=${revealRef} class="community-featured">
      <${ParticleField} />

      <div class="community-shell">
        <!-- ═══ Header ═══ -->
        <div class="community-header">
          <div class="community-title-group">
            <div class="community-glow-bar"></div>
            <div class="community-title-text">
              <h2>社区精选方案</h2>
              <p>看看大家都创造了什么</p>
            </div>
          </div>
          <button class="community-browse-btn" type="button">
            浏览全部
            <span class="community-browse-arrow">
              <${ArrowRight} />
            </span>
          </button>
        </div>

        <!-- ═══ 轮播 ═══ -->
        <div class="community-carousel-wrap">
          <!-- 左箭头 -->
          ${currentIndex > 0 ? html`
            <button class="community-nav-btn community-nav-prev" type="button" onClick=${handlePrev} aria-label="上一页">
              <${ChevronLeft} />
            </button>
          ` : null}

          <!-- 视口 -->
          <div class="community-carousel-viewport">
            <div
              ref=${trackRef}
              class="community-carousel-track"
              style=${{
                transform: `translateX(calc(-${slidePercent}% - ${slidePx}px))`,
              }}
            >
              ${COMMUNITY_CARDS.map(card => html`
                <${CommunityCard} key=${card.id} card=${card} />
              `)}
            </div>
          </div>

          <!-- 右箭头 -->
          ${currentIndex < maxIndex ? html`
            <button class="community-nav-btn community-nav-next" type="button" onClick=${handleNext} aria-label="下一页">
              <${ChevronRight} />
            </button>
          ` : null}
        </div>

        <!-- ═══ 指示点 ═══ -->
        <div class="community-dots">
          ${Array.from({ length: dotCount }, (_, i) => html`
            <button
              key=${i}
              class=${`community-dot ${i === currentIndex ? 'active' : ''}`}
              type="button"
              onClick=${() => setCurrentIndex(i)}
              aria-label=${`第${i + 1}页`}
            />
          `)}
        </div>
      </div>
    </section>
  `
}
