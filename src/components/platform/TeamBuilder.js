// ═══════════════════════════════════════════════════════════
// 引导式智能团队构建器 (TeamBuilder) v4.0 — Holo Cartridge Console
// 6槽位 × 8大部门 × 132个智能体 × 三围属性 × 羁绊系统
// 视觉语言：全息模组匣子 · 借鉴游戏广场设计
// ═══════════════════════════════════════════════════════════
import { html, useState, useCallback, useMemo, useEffect } from '../../deps.js'
import { useApp, STEPS } from '../../store/appContext.js'
import { AGENTS, AGENT_CATEGORIES, getNewAgents, getAgentAvatar, DIRECTOR_AGENTS } from '../../data/agents.js?v=dep1'
import { NavBar, Footer, PageContainer, StepProgress } from './PlatformCommon.js?v=nav3'
import {
  TEAM_SLOTS,
  RARITY,
  getRarity,
  canAssign,
  isGradeCompatible,
  calculateSynergy,
  detectCombos,
  COMBOS,
  getNextGuidance,
  getRecommendedAgents,
  MICROCOPY,
  getScoreText,
  getProgress,
} from '../../data/teamBuilder.js?v=tb1'

// 只显示新智能体（120个，不含12个AI创作伙伴）
const NEW_AGENTS = getNewAgents()

// 学段中文名
const GRADE_LABELS = {
  primary: '小学', junior: '初中', senior: '高中', college: '大学', universal: '通用',
}

// ── 背景图片路径 ──
const HERO_BG = '/assets/agents/创作者中心顶部横幅背景.jpg'

// ── 全息模组匣子色彩系统 ──
const H = {
  void: '#05010f',
  deep: '#0a0514',
  glass: 'rgba(10, 5, 20, 0.6)',
  glassHover: 'rgba(15, 10, 30, 0.75)',
  glassBorder: 'rgba(0, 212, 255, 0.15)',
  glassBorderBright: 'rgba(0, 212, 255, 0.4)',
  cyan: '#00d4ff',
  cyanBright: '#00ffff',
  purple: '#8b5cf6',
  pink: '#ff2e88',
  green: '#00ff88',
  amber: '#ffaa00',
  textBright: '#ffffff',
  textPrimary: '#e8e8ff',
  textSecondary: '#9098b8',
  textMuted: '#5a5a7a',
  textFaint: '#3a3a52',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',
  fontDisplay: "'Orbitron', 'Michroma', sans-serif",
  fontHeader: "'Orbitron', sans-serif",
  fontBody: "'Rajdhani', 'Inter', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', 'Consolas', monospace",
  // 切角路径 — 全息模组匣子标志性造型
  chamfer: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
  chamferSm: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
  chamferBtn: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
}

// ── 全息模组匣子 CSS ──
const BUILDER_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Rajdhani:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;700&display=swap');

/* ===== 全息玻璃面板 ===== */
.tb-glass {
  background: ${H.glass};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${H.glassBorder};
}
.tb-glass-hover:hover {
  background: ${H.glassHover};
  border-color: ${H.glassBorderBright};
}

/* ===== 切角容器 ===== */
.tb-chamfer {
  clip-path: ${H.chamfer};
}
.tb-chamfer-sm {
  clip-path: ${H.chamferSm};
}
.tb-chamfer-btn {
  clip-path: ${H.chamferBtn};
}

/* ===== 扫描线叠加层 ===== */
.tb-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(0deg,
    transparent, transparent 2px,
    rgba(0,255,255,0.03) 2px, rgba(0,255,255,0.03) 4px);
  pointer-events: none;
  z-index: 1;
}

/* ===== 准星标记 ===== */
.tb-crosshair {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}
.tb-crosshair::before,
.tb-crosshair::after {
  content: '';
  position: absolute;
  background: rgba(0, 212, 255, 0.12);
}
.tb-crosshair::before {
  top: 50%; left: 30%; right: 30%;
  height: 1px;
}
.tb-crosshair::after {
  left: 50%; top: 30%; bottom: 30%;
  width: 1px;
}

/* ===== 状态指示点 ===== */
@keyframes tbDotPulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px currentColor; }
  50% { opacity: 0.4; box-shadow: 0 0 3px currentColor; }
}
.tb-dot-pulse {
  animation: tbDotPulse 2s ease-in-out infinite;
}

/* ===== 槽位脉冲 ===== */
@keyframes slotPulse {
  0%, 100% { box-shadow: 0 0 0 0 var(--slot-glow, rgba(0,212,255,0.3)); }
  50% { box-shadow: 0 0 0 6px transparent; }
}
.slot-active { animation: slotPulse 2s ease-in-out infinite; }

/* ===== 卡牌落入动画 ===== */
@keyframes cardDrop {
  0% { transform: scale(0.7) translateY(-20px); opacity: 0; }
  60% { transform: scale(1.08) translateY(2px); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
.card-drop { animation: cardDrop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

/* ===== 协同评分填充 ===== */
@keyframes synergyFill {
  from { width: 0%; }
  to { width: var(--target-width); }
}
.synergy-fill { animation: synergyFill 0.6s ease-out forwards; }

/* ===== 羁绊闪光 ===== */
@keyframes comboFlash {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.combo-flash { animation: comboFlash 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

/* ===== 评分计数器 ===== */
@keyframes scoreCounter {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.score-counter { animation: scoreCounter 0.3s ease-out forwards; }

/* ===== 稀有度发光 ===== */
@keyframes rarityGlow {
  0%, 100% { box-shadow: 0 0 8px var(--rarity-glow); }
  50% { box-shadow: 0 0 16px var(--rarity-glow); }
}
.rarity-legendary { animation: rarityGlow 2.5s ease-in-out infinite; }

/* ===== 引导弹跳 ===== */
@keyframes guideBounce {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(4px); }
}
.guide-bounce { animation: guideBounce 1s ease-in-out infinite; }

/* ===== Hero 入场 ===== */
@keyframes tbHeroFade {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.tb-hero-fade { animation: tbHeroFade 0.8s ease-out forwards; }

/* ===== 扫描线扫过效果 ===== */
@keyframes tbScanSweep {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(300%); }
}

/* ===== 卡牌库悬停扫描 ===== */
.tb-card-cover-sweep {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 40px;
  background: linear-gradient(180deg,
    rgba(0,255,255,0.12) 0%,
    rgba(0,255,255,0.04) 50%,
    transparent 100%);
  transform: translateY(-100%);
  transition: transform 0.6s ease;
  pointer-events: none;
  z-index: 3;
}
.tb-card-wrap:hover .tb-card-cover-sweep {
  transform: translateY(300%);
}

/* ===== 网格背景 ===== */
.tb-grid-bg {
  background-image:
    linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* ===== 角标装饰 ===== */
.tb-corner-deco {
  position: absolute;
  width: 12px;
  height: 12px;
  border-color: ${H.cyan};
  pointer-events: none;
  z-index: 5;
}
.tb-corner-tl { top: 0; left: 0; border-top: 1px solid; border-left: 1px solid; }
.tb-corner-tr { top: 0; right: 0; border-top: 1px solid; border-right: 1px solid; }
.tb-corner-bl { bottom: 0; left: 0; border-bottom: 1px solid; border-left: 1px solid; }
.tb-corner-br { bottom: 0; right: 0; border-bottom: 1px solid; border-right: 1px solid; }

/* ===== 自定义滚动条 ===== */
.tb-scroll::-webkit-scrollbar { width: 4px; }
.tb-scroll::-webkit-scrollbar-track { background: transparent; }
.tb-scroll::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.3); border-radius: 2px; }

@media (prefers-reduced-motion: reduce) {
  .slot-active, .card-drop, .synergy-fill, .combo-flash,
  .rarity-legendary, .guide-bounce, .score-counter,
  .tb-dot-pulse, .tb-hero-fade {
    animation: none !important;
  }
}

/* ═══ v5 角色卡牌库 · 部门分组 + 悬停详情覆盖层 ═══ */

/* ── 部门折叠区 ── */
.tb-dept-section {
  margin-bottom: 6px;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255,255,255,0.015);
}
.tb-dept-header {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: 14px 16px;
  background: transparent; border: none; cursor: pointer;
  border-left: 3px solid var(--dept-color, ${H.cyan});
  transition: background 0.2s;
}
.tb-dept-header:hover {
  background: linear-gradient(90deg, color-mix(in srgb, var(--dept-color, ${H.cyan}) 12%, transparent), transparent 70%);
}
.tb-dept-icon {
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; border-radius: 10px;
  background: color-mix(in srgb, var(--dept-color, ${H.cyan}) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--dept-color, ${H.cyan}) 30%, transparent);
  flex-shrink: 0;
  overflow: hidden;
}
.tb-dept-name {
  font-family: ${H.fontBody}; font-size: 20px; font-weight: 700;
  letter-spacing: 0.01em; line-height: 1.2;
  color: ${H.textBright};
}
.tb-dept-en {
  font-family: ${H.fontMono}; font-size: 12px; font-weight: 500;
  letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.2;
  opacity: 0.7; margin-top: 2px;
  color: var(--dept-color, ${H.cyan});
}
.tb-dept-chevron {
  font-size: 16px; transition: transform 0.25s ease;
  display: inline-block;
}

/* ── 角色卡片 ── */
.tb-agent-card {
  position: relative;
  background: linear-gradient(180deg, rgba(10,5,20,0.7) 0%, rgba(5,1,15,0.5) 100%);
  border: 1px solid color-mix(in srgb, var(--card-color, ${H.cyan}) 20%, transparent);
  border-radius: 12px;
  overflow: hidden;
  cursor: grab;
  transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, border-color 0.2s;
  animation: cardDrop 0.3s ease forwards;
}
.tb-agent-card:active { cursor: grabbing; }
.tb-agent-card:hover {
  transform: translateY(-6px) scale(1.08);
  z-index: 50;
  border-color: var(--card-color, ${H.cyan});
  box-shadow: 0 12px 32px rgba(0,0,0,0.5), 0 0 24px color-mix(in srgb, var(--card-color, ${H.cyan}) 35%, transparent);
}
.tb-agent-card-used {
  opacity: 0.45;
  cursor: not-allowed;
}
.tb-agent-card-used:hover {
  transform: none;
  box-shadow: none;
  border-color: color-mix(in srgb, var(--card-color, ${H.cyan}) 20%, transparent);
}

/* 传说品质光晕 */
.tb-agent-card-glow {
  position: absolute; inset: 0;
  border-radius: 12px;
  pointer-events: none;
  animation: rarityGlow 2.5s ease-in-out infinite;
}

/* 头像区 */
.tb-agent-card-avatar-wrap {
  position: relative;
  height: 140px;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.tb-agent-card-avatar {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.tb-agent-card:hover .tb-agent-card-avatar {
  transform: scale(1.12);
}
.tb-agent-card-emoji {
  font-size: 48px;
}
.tb-agent-card-badge {
  position: absolute; top: 8px; right: 8px;
  font-family: ${H.fontMono}; font-size: 10px; font-weight: 700;
  padding: 3px 8px; border-radius: 4px;
  background: ${H.cyan}; color: #05010f;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 8px rgba(0,212,255,0.3);
}
.tb-agent-card-rec {
  position: absolute; top: 8px; left: 8px;
  font-family: ${H.fontMono}; font-size: 10px; font-weight: 700;
  padding: 3px 8px; border-radius: 4px;
  background: linear-gradient(135deg, #fbbf24, #f97316); color: #05010f;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 8px rgba(251,191,36,0.4);
  animation: recPulse 1.8s ease-in-out infinite;
}
@keyframes recPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.08); opacity: 0.85; }
}
.tb-agent-card-rarity {
  position: absolute; bottom: 6px; right: 8px;
  font-size: 12px; letter-spacing: 1px;
  text-shadow: 0 0 6px currentColor;
}

/* 信息区 */
.tb-agent-card-info {
  padding: 10px 12px 12px;
}
.tb-agent-card-name {
  font-family: ${H.fontBody}; font-size: 16px; font-weight: 700;
  color: ${H.textBright}; line-height: 1.3;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.tb-agent-card-title {
  font-family: ${H.fontMono}; font-size: 12px; font-weight: 500;
  color: ${H.textSecondary}; letter-spacing: 0.02em;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-top: 3px;
}

/* 属性条 */
.tb-agent-card-stats {
  display: flex; flex-direction: column; gap: 4px;
  margin-top: 8px;
}
.tb-stat-mini {
  display: flex; align-items: center; gap: 6px;
}
.tb-stat-label {
  font-family: ${H.fontMono}; font-size: 11px; font-weight: 600;
  width: 28px; flex-shrink: 0;
}
.tb-stat-bar {
  flex: 1; height: 5px; border-radius: 3px; overflow: hidden;
  background: rgba(255,255,255,0.05);
}
.tb-stat-bar > div {
  height: 100%; border-radius: 3px;
  transition: width 0.3s ease;
}

/* 技能标签 */
.tb-agent-card-skills {
  display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px;
}
.tb-skill-tag {
  font-family: ${H.fontMono}; font-size: 11px; font-weight: 500;
  padding: 2px 7px; border-radius: 4px;
  background: rgba(0,212,255,0.08);
  color: ${H.textSecondary};
  border: 1px solid rgba(0,212,255,0.1);
  white-space: nowrap;
}

/* ── 悬停详情覆盖层 ── */
.tb-agent-card-detail {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(5,1,15,0.75) 0%, rgba(5,1,15,0.97) 35%);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  padding: 14px 12px 12px;
  display: flex; flex-direction: column;
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
  z-index: 10;
  border-radius: 12px;
}
.tb-agent-card:hover .tb-agent-card-detail {
  opacity: 1;
}
.tb-detail-tagline {
  font-family: ${H.fontBody}; font-size: 15px; font-weight: 600;
  font-style: italic; line-height: 1.4;
  margin-bottom: 8px;
}
.tb-detail-ability-label {
  font-family: ${H.fontMono}; font-size: 10px; font-weight: 700;
  color: ${H.amber}; letter-spacing: 0.1em;
  margin-bottom: 3px;
}
.tb-detail-ability-text {
  font-family: ${H.fontBody}; font-size: 13px; font-weight: 400;
  color: ${H.textPrimary}; line-height: 1.45;
  margin-bottom: 8px;
}
.tb-detail-stats {
  display: flex; flex-direction: column; gap: 5px;
  margin-bottom: 8px;
}
.tb-detail-meta {
  display: flex; flex-wrap: wrap; gap: 5px;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.tb-detail-badge {
  font-family: ${H.fontMono}; font-size: 11px; font-weight: 500;
  padding: 2px 7px; border-radius: 4px;
  background: rgba(255,255,255,0.06);
  color: ${H.textSecondary};
}
.tb-detail-warn {
  font-family: ${H.fontMono}; font-size: 11px; font-weight: 700;
  padding: 2px 7px; border-radius: 4px;
  background: rgba(255,59,94,0.12); color: #ff3b5e;
}
`

// ── 三围属性条 ──
function StatBar({ label, value, color }) {
  return html`
    <div class="flex items-center gap-1">
      <span class="text-[8px] w-6 shrink-0" style=${{ fontFamily: H.fontMono, color: H.textMuted }}>${label}</span>
      <div class="flex-1 h-1 rounded-full overflow-hidden" style=${{ background: 'rgba(255,255,255,0.05)' }}>
        <div class="h-full rounded-full" style=${{ width: `${value}%`, background: color, boxShadow: `0 0 4px ${color}80` }}></div>
      </div>
      <span class="text-[8px] w-5 text-right tabular-nums" style=${{ fontFamily: H.fontMono, color }}>${value}</span>
    </div>
  `
}

export default function TeamBuilder() {
  const { state, dispatch, navigate } = useApp()

  const grade = state.selectedGrade || 'primary'
  const selectedGameplay = state.selectedGameplay

  // ── 6 个槽位状态 ──
  const [slots, setSlots] = useState([null, null, null, null, null, null])
  const [activeSlot, setActiveSlot] = useState(0)
  const [draggedAgent, setDraggedAgent] = useState(null)
  const [showDetail, setShowDetail] = useState(null)
  const [showCombos, setShowCombos] = useState(false)
  const [resetCounter, setResetCounter] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState(null)

  // ── 计算协同评分 ──
  const synergy = useMemo(() => {
    return calculateSynergy(slots, AGENTS, grade)
  }, [slots, grade])

  // ── 进度 ──
  const progress = useMemo(() => getProgress(slots), [slots])

  // ── 引导 ──
  const guidance = useMemo(() => getNextGuidance(slots, grade), [slots, grade])

  // ── 当前活跃槽位的推荐角色 ──
  const recommendedAgents = useMemo(() => {
    const emptySlots = slots.map((s, i) => s === null ? i : null).filter(i => i !== null)
    if (emptySlots.length === 0) return []
    return getRecommendedAgents(emptySlots[0], grade, AGENTS)
  }, [slots, grade])

  // ── 已使用的 agent ids ──
  const usedAgentIds = useMemo(() => slots.filter(s => s !== null), [slots])

  // ── 卡牌库显示的角色 ──
  const displayAgents = useMemo(() => {
    if (activeSlot !== null && slots[activeSlot] === null) {
      return recommendedAgents
    }
    if (categoryFilter) {
      return NEW_AGENTS.filter(a => a.category === categoryFilter)
    }
    return NEW_AGENTS
  }, [activeSlot, slots, recommendedAgents, categoryFilter])

  // ── 放入角色到槽位 ──
  const assignAgent = useCallback((agentId, slotId) => {
    const check = canAssign(agentId, slotId, AGENTS)
    if (!check.ok) return false

    setSlots(prev => {
      const next = [...prev]
      const existingIdx = next.indexOf(agentId)
      if (existingIdx !== -1) next[existingIdx] = null
      next[slotId] = agentId
      return next
    })

    const nextEmpty = slots.findIndex((s, i) => s === null && i !== slotId)
    if (nextEmpty !== -1) setActiveSlot(nextEmpty)

    const filledIds = slots.filter(s => s !== null)
    dispatch({ type: 'SET_AGENTS', payload: [...filledIds, agentId].filter(id => id !== null) })
    return true
  }, [slots, dispatch])

  // ── 移除角色 ──
  const removeAgent = useCallback((slotId) => {
    setSlots(prev => {
      const next = [...prev]
      next[slotId] = null
      return next
    })
    setActiveSlot(slotId)
  }, [])

  // ── 清空所有 ──
  const resetAll = useCallback(() => {
    setSlots([null, null, null, null, null, null])
    setActiveSlot(0)
    setResetCounter(c => c + 1)
    dispatch({ type: 'SET_AGENTS', payload: [] })
  }, [dispatch])

  // ── 一键智能填充 ──
  const autoFill = useCallback(() => {
    const newSlots = [...slots]
    for (let i = 0; i < 6; i++) {
      if (newSlots[i] !== null) continue
      const recs = getRecommendedAgents(i, grade, AGENTS)
      const available = recs.find(a => !newSlots.includes(a.id))
      if (available) newSlots[i] = available.id
    }
    setSlots(newSlots)
    dispatch({ type: 'SET_AGENTS', payload: newSlots.filter(id => id !== null) })
  }, [slots, grade, dispatch])

  // ── 拖拽处理 ──
  const handleDragStart = useCallback((e, agentId) => {
    setDraggedAgent(agentId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', agentId)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback((e, slotId) => {
    e.preventDefault()
    const agentId = e.dataTransfer.getData('text/plain') || draggedAgent
    if (!agentId) return
    assignAgent(agentId, slotId)
    setDraggedAgent(null)
  }, [draggedAgent, assignAgent])

  // ── 确认团队 ──
  const confirmTeam = useCallback(() => {
    if (progress.filled < 3) return
    dispatch({ type: 'SET_AGENTS', payload: slots.filter(s => s !== null) })
    navigate(STEPS.UPLOAD)
  }, [slots, progress, dispatch, navigate])

  // ── 返回（独立页面，返回首页）──
  const goBack = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: STEPS.LANDING })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch])

  // ══════════════════════════════════════════
  // 渲染：全息 Hero 横幅
  // ══════════════════════════════════════════
  const renderHeroBanner = () => html`
    <div class="relative w-full overflow-hidden" style=${{ marginTop: '64px' }}>
      <!-- 扫描线叠加 -->
      <div class="tb-scanlines"></div>

      <!-- 内容 -->
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 tb-hero-fade">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <!-- 状态行 -->
            <div class="flex items-center gap-3 mb-3">
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full tb-dot-pulse" style=${{ background: H.green, color: H.green }}></span>
                <span class="text-[10px] font-bold tracking-widest" style=${{ fontFamily: H.fontMono, color: H.green }}>
                  SYSTEM ONLINE
                </span>
              </div>
              <span class="text-[10px]" style=${{ fontFamily: H.fontMono, color: H.textMuted }}>|</span>
              <span class="text-[10px] tracking-wider" style=${{ fontFamily: H.fontMono, color: H.cyan, textShadow: `0 0 6px ${H.cyan}80` }}>
                TEAM ASSEMBLY CONSOLE
              </span>
            </div>

            <!-- 主标题 -->
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black leading-none mb-3"
                style=${{
                  fontFamily: H.fontDisplay,
                  color: H.textBright,
                  textShadow: `0 0 20px ${H.cyan}60, 0 0 40px ${H.purple}40`,
                  letterSpacing: '2px',
                }}>
              AI智能体市场
            </h1>

            <!-- 副标题 -->
            <p class="text-sm sm:text-base max-w-2xl leading-relaxed" style=${{ fontFamily: H.fontBody, color: H.textSecondary, fontWeight: 400 }}>
              120+ 智能体 × 7 大部门 — 像组装游戏卡带一样，搭配你的专属 AI 开发团队
            </p>

            <!-- 数据指标行 -->
            <div class="flex items-center gap-4 mt-4 flex-wrap">
              <div class="flex items-center gap-1.5">
                <span class="text-[9px] tracking-wider" style=${{ fontFamily: H.fontMono, color: H.textMuted }}>SLOTS</span>
                <span class="text-sm font-bold tabular-nums" style=${{ fontFamily: H.fontMono, color: H.cyan }}>${progress.filled}/6</span>
              </div>
              <div class="w-px h-4" style=${{ background: H.borderSubtle }}></div>
              <div class="flex items-center gap-1.5">
                <span class="text-[9px] tracking-wider" style=${{ fontFamily: H.fontMono, color: H.textMuted }}>SYNERGY</span>
                <span class="text-sm font-bold tabular-nums" style=${{ fontFamily: H.fontMono, color: synergy.score >= 75 ? H.green : synergy.score >= 60 ? H.amber : H.pink }}>
                  ${synergy.score}
                </span>
              </div>
              <div class="w-px h-4" style=${{ background: H.borderSubtle }}></div>
              <div class="flex items-center gap-1.5">
                <span class="text-[9px] tracking-wider" style=${{ fontFamily: H.fontMono, color: H.textMuted }}>GRADE</span>
                <span class="text-xs font-bold px-1.5 py-0.5" style=${{
                  fontFamily: H.fontMono,
                  color: H.cyan,
                  background: 'rgba(0,212,255,0.1)',
                  border: `1px solid ${H.glassBorder}`,
                }}>${GRADE_LABELS[grade] || '通用'}</span>
              </div>
            </div>
          </div>

          <!-- 返回按钮 -->
          <button class="shrink-0 flex items-center gap-2 px-4 py-2.5 tb-chamfer-btn font-bold tracking-wider transition-all hover:scale-105"
                  style=${{
                    fontFamily: H.fontHeader,
                    fontSize: '10px',
                    letterSpacing: '2px',
                    color: H.cyan,
                    background: 'rgba(0, 212, 255, 0.08)',
                    border: `1px solid ${H.glassBorder}`,
                    textShadow: `0 0 6px ${H.cyan}60`,
                  }}
                  onClick=${goBack}>
            <span>←</span><span class="hidden sm:inline">BACK</span>
          </button>
        </div>
      </div>
    </div>
  `

  // ══════════════════════════════════════════
  // 渲染：协同评分面板（HUD 诊断读数）
  // ══════════════════════════════════════════
  const renderSynergyPanel = () => {
    const scoreColor = synergy.score >= 75 ? H.green : synergy.score >= 60 ? H.amber : synergy.score >= 40 ? '#f97316' : H.pink
    return html`
      <div class="relative tb-glass tb-chamfer p-4 overflow-hidden">
        <div class="tb-scanlines"></div>
        <div class="tb-corner-deco tb-corner-tl"></div>
        <div class="tb-corner-deco tb-corner-tr"></div>

        <div class="relative flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-[9px] font-bold tracking-widest" style=${{ fontFamily: H.fontMono, color: H.cyan, textShadow: `0 0 4px ${H.cyan}60` }}>
              SYNERGY
            </span>
            <span class="text-[10px] px-1.5 py-0.5 font-bold tabular-nums"
                  style=${{ fontFamily: H.fontMono, background: scoreColor + '20', color: scoreColor, border: `1px solid ${scoreColor}40` }}>
              ${synergy.grade}
            </span>
          </div>
          <div class="flex items-baseline gap-0.5 score-counter" key=${synergy.score}>
            <span class="text-3xl font-black tabular-nums" style=${{ fontFamily: H.fontMono, color: scoreColor, textShadow: `0 0 12px ${scoreColor}60` }}>${synergy.score}</span>
            <span class="text-xs" style=${{ fontFamily: H.fontMono, color: H.textMuted }}>/100</span>
          </div>
        </div>

        <div class="relative h-2 rounded-full overflow-hidden mb-3" style=${{ background: 'rgba(255,255,255,0.05)' }}>
          <div class="h-full rounded-full synergy-fill"
               style=${{
                 '--target-width': `${synergy.score}%`,
                 background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}dd)`,
                 width: `${synergy.score}%`,
                 boxShadow: `0 0 8px ${scoreColor}80`,
               }}>
          </div>
        </div>

        <p class="relative text-xs mb-3" style=${{ fontFamily: H.fontBody, color: H.textSecondary }}>
          ${getScoreText(synergy.grade)}
        </p>

        <div class="relative space-y-1.5">
          ${synergy.breakdown.map((b, i) => html`
            <div key=${i} class="flex items-center justify-between text-xs">
              <span style=${{ fontFamily: H.fontBody, color: H.textMuted }}>${b.label}</span>
              <span class="tabular-nums font-medium" style=${{ fontFamily: H.fontMono, color: H.textPrimary }}>
                ${b.value}/${b.max}
              </span>
            </div>
          `)}
        </div>

        ${synergy.combos && synergy.combos.length > 0 ? html`
          <div class="relative mt-3 pt-3" style=${{ borderTop: `1px solid ${H.borderSubtle}` }}>
            <div class="text-[9px] font-bold tracking-widest mb-2" style=${{ fontFamily: H.fontMono, color: H.cyan }}>BONDS ACTIVATED</div>
            ${synergy.combos.map((c, i) => html`
              <div key=${c.id} class="combo-flash flex items-center gap-2 px-2.5 py-1.5 mb-1 tb-chamfer-sm"
                   style=${{
                     background: c.color + '12',
                     border: `1px solid ${c.color}30`,
                     animationDelay: `${i * 0.1}s`,
                   }}>
                <span class="text-base">${c.icon}</span>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold" style=${{ fontFamily: H.fontBody, color: c.color }}>${c.name}</div>
                  <div class="text-[10px] truncate" style=${{ fontFamily: H.fontBody, color: H.textMuted }}>${c.desc}</div>
                </div>
                <span class="text-[10px] font-bold shrink-0" style=${{ fontFamily: H.fontMono, color: c.color }}>${c.bonus}</span>
              </div>
            `)}
          </div>
        ` : html`
          <div class="relative mt-3 pt-3" style=${{ borderTop: `1px solid ${H.borderSubtle}` }}>
            <div class="text-xs" style=${{ fontFamily: H.fontBody, color: H.textMuted }}>
              ${MICROCOPY.comboHint}
            </div>
          </div>
        `}
      </div>
    `
  }

  // ══════════════════════════════════════════
  // 渲染：部门总监展示区（8位核心角色头像）
  // ══════════════════════════════════════════
  const renderDirectorsShowcase = () => {
    return html`
      <div class="relative tb-glass tb-chamfer p-4 mb-4 overflow-hidden">
        <div class="tb-scanlines"></div>
        <div class="tb-corner-deco tb-corner-tl"></div>
        <div class="tb-corner-deco tb-corner-tr"></div>
        <div class="tb-corner-deco tb-corner-bl"></div>
        <div class="tb-corner-deco tb-corner-br"></div>

        <div class="relative flex items-center gap-2 mb-3">
          <span class="text-[9px] font-bold tracking-widest" style=${{ fontFamily: H.fontMono, color: H.cyan, textShadow: `0 0 4px ${H.cyan}60` }}>
            DEPARTMENT DIRECTORS
          </span>
          <div class="flex-1 h-px" style=${{ background: H.glassBorder }}></div>
          <span class="text-[9px]" style=${{ fontFamily: H.fontMono, color: H.textMuted }}>8 CORE ROLES</span>
        </div>

        <div class="relative grid grid-cols-4 sm:grid-cols-8 gap-2">
          ${DIRECTOR_AGENTS.map((dir, i) => {
            const agent = AGENTS.find(a => a.id === dir.id)
            if (!agent) return null
            const isUsed = usedAgentIds.includes(dir.id)
            return html`
              <div key=${dir.id}
                   class=${`tb-card-wrap relative tb-chamfer-sm cursor-pointer transition-all ${isUsed ? 'opacity-40' : 'hover:scale-105'}`}
                   style=${{
                     background: agent.color + '0a',
                     border: `1px solid ${agent.color}30`,
                   }}
                   onClick=${() => {
                     if (isUsed) return
                     // 找到匹配的空槽位放入
                     for (let s = 0; s < 6; s++) {
                       if (slots[s] === null && canAssign(dir.id, s, AGENTS).ok) {
                         assignAgent(dir.id, s)
                         return
                       }
                     }
                     setShowDetail(agent)
                   }}>
                <div class="tb-card-cover-sweep"></div>

                <!-- 头像 -->
                <div class="relative aspect-square overflow-hidden tb-chamfer-sm">
                  <img src=${dir.avatar}
                       alt=${agent.name}
                       class="w-full h-full object-cover"
                       style=${{ filter: isUsed ? 'grayscale(1)' : 'none' }}
                       loading="lazy" />
                  <!-- 渐变叠层 -->
                  <div class="absolute inset-0" style=${{
                    background: `linear-gradient(180deg, transparent 50%, ${agent.color}40 100%)`,
                  }}></div>
                  <!-- 角色标签 -->
                  <div class="absolute bottom-1 left-1 right-1">
                    <div class="text-[9px] font-bold truncate text-center" style=${{ fontFamily: H.fontBody, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                      ${dir.role}
                    </div>
                  </div>
                  <!-- 稀有度星标 -->
                  <div class="absolute top-1 right-1 text-[7px] font-bold" style=${{ fontFamily: H.fontMono, color: '#fbbf24', textShadow: '0 0 3px rgba(0,0,0,0.8)' }}>
                    ${'★'.repeat(getRarity(agent.id) === 'legendary' ? 4 : getRarity(agent.id) === 'epic' ? 3 : 2)}
                  </div>
                  ${isUsed ? html`
                    <div class="absolute top-1 left-1 text-[7px] font-bold px-1 py-0.5 tb-chamfer-sm"
                         style=${{ fontFamily: H.fontMono, background: H.cyan, color: '#05010f' }}>
                      IN TEAM
                    </div>
                  ` : null}
                </div>

                <!-- 名称 -->
                <div class="px-1 pt-1 pb-0.5">
                  <div class="text-[9px] font-bold truncate text-center" style=${{ fontFamily: H.fontBody, color: H.textPrimary }}>
                    ${agent.name}
                  </div>
                  <div class="text-[8px] truncate text-center" style=${{ fontFamily: H.fontMono, color: H.textMuted }}>
                    ${dir.dept}
                  </div>
                </div>
              </div>
            `
          })}
        </div>
      </div>
    `
  }

  // ══════════════════════════════════════════
  // 渲染：引导面板（HUD 通知栏）
  // ══════════════════════════════════════════
  const renderGuidePanel = () => {
    const guideColor = guidance.slotColor || H.cyan
    return html`
      <div class="relative tb-glass tb-chamfer-sm p-4 mb-4 overflow-hidden"
           style=${{ borderLeft: `3px solid ${guideColor}` }}>
        <div class="tb-scanlines"></div>
        <div class="relative flex items-center gap-3">
          <div class="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl guide-bounce tb-chamfer-sm"
               style=${{ background: guideColor + '15' }}>
            ${guidance.icon}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-[9px] font-bold tracking-widest mb-0.5" style=${{ fontFamily: H.fontMono, color: guideColor, textShadow: `0 0 4px ${guideColor}60` }}>
              NEXT OBJECTIVE
            </div>
            <div class="text-sm font-bold" style=${{ fontFamily: H.fontBody, color: H.textBright }}>${guidance.title}</div>
            <div class="text-xs mt-0.5" style=${{ fontFamily: H.fontBody, color: H.textSecondary }}>${guidance.desc}</div>
          </div>
          <div class="shrink-0 text-xs tabular-nums font-bold px-2.5 py-1 tb-chamfer-sm"
               style=${{
                 fontFamily: H.fontMono,
                 background: 'rgba(0,212,255,0.08)',
                 color: H.cyan,
                 border: `1px solid ${H.glassBorder}`,
               }}>
            ${progress.filled}/6
          </div>
        </div>
      </div>
    `
  }

  // ══════════════════════════════════════════
  // 渲染：单个槽位（全息卡带坞）
  // ════════════════════════════════════════════
  const renderSlot = (slotDef, index) => {
    const agentId = slots[index]
    const agent = agentId ? AGENTS.find(a => a.id === agentId) : null
    const isEmpty = !agent
    const isActive = activeSlot === index && isEmpty
    const rarity = agent ? getRarity(agent.id) : null
    const rarityInfo = rarity ? RARITY[rarity] : null
    const gradeOk = agent ? isGradeCompatible(agent, grade) : true

    return html`
      <div key=${slotDef.id}
           class=${`relative tb-glass tb-chamfer transition-all overflow-hidden ${isActive ? 'slot-active' : ''}`}
           style=${{
             '--slot-glow': slotDef.color + '40',
             background: agent
               ? `linear-gradient(135deg, ${slotDef.color}0a, ${H.glass})`
               : H.glass,
             border: isActive
               ? `1px dashed ${slotDef.color}`
               : `1px solid ${isEmpty ? H.glassBorder : slotDef.color + '40'}`,
             minHeight: '150px',
           }}
           onDragOver=${handleDragOver}
           onDrop=${(e) => handleDrop(e, index)}
           onClick=${() => setActiveSlot(index)}>

        <!-- 扫描线 -->
        ${isEmpty ? html`<div class="tb-scanlines"></div>` : null}
        <!-- 空槽位准星 -->
        ${isEmpty ? html`<div class="tb-crosshair"></div>` : null}
        <!-- 角标 -->
        <div class="tb-corner-deco tb-corner-tl"></div>
        <div class="tb-corner-deco tb-corner-tr"></div>

        <!-- 槽位标签 -->
        <div class="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          ${slotDef.iconImg
            ? html`<img src=${slotDef.iconImg} alt=${slotDef.name} class="w-5 h-5 rounded object-cover" />`
            : html`<span class="text-base">${slotDef.icon}</span>`}
          <span class="text-[9px] font-bold uppercase tracking-wider"
                style=${{ fontFamily: H.fontMono, color: isEmpty ? H.textMuted : slotDef.color, textShadow: isEmpty ? 'none' : `0 0 4px ${slotDef.color}60` }}>
            ${slotDef.nameEn}
          </span>
        </div>

        ${isEmpty ? html`
          <div class="relative flex flex-col items-center justify-center h-full pt-8 pb-4 px-3 text-center z-10">
            <div class="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 overflow-hidden"
                 style=${{ background: slotDef.color + '10' }}>
              ${slotDef.iconImg
                ? html`<img src=${slotDef.iconImg} alt=${slotDef.name} class="w-full h-full object-cover opacity-50" />`
                : html`<span class="opacity-30">${slotDef.icon}</span>`}
            </div>
            <div class="text-xs font-bold mb-0.5" style=${{ fontFamily: H.fontBody, color: H.textPrimary }}>${slotDef.name}</div>
            <div class="text-[10px] leading-relaxed" style=${{ fontFamily: H.fontBody, color: H.textMuted }}>
              ${slotDef.emptyHint}
            </div>
            ${isActive ? html`
              <div class="mt-2 text-[9px] font-bold px-2 py-0.5 tb-chamfer-sm tracking-wider"
                   style=${{ fontFamily: H.fontMono, background: slotDef.color, color: '#05010f' }}>
                ← RECOMMENDED BELOW
              </div>
            ` : null}
          </div>
        ` : html`
          <div class="card-drop relative pt-8 pb-3 px-3 z-10" key=${agentId + resetCounter}>
            <div class=${`flex items-start gap-2.5 ${rarity === 'legendary' ? 'rarity-legendary' : ''}`}
                 style=${{ '--rarity-glow': rarityInfo?.glow }}>

              <div class="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl tb-chamfer-sm overflow-hidden"
                   style=${{
                     background: `linear-gradient(135deg, ${agent.color}, ${agent.color}dd)`,
                     color: '#fff',
                     boxShadow: `0 0 8px ${agent.color}40`,
                   }}>
                ${getAgentAvatar(agent.id)
                  ? html`<img src=${getAgentAvatar(agent.id)} alt=${agent.name} class="w-full h-full object-cover" />`
                  : agent.emoji}
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-sm font-bold truncate" style=${{ fontFamily: H.fontBody, color: H.textBright }}>${agent.name}</span>
                  ${rarityInfo ? html`
                    <span class="text-[8px] shrink-0" style=${{ fontFamily: H.fontMono, color: rarityInfo.color }}>
                      ${'★'.repeat(rarityInfo.stars)}
                    </span>
                  ` : null}
                </div>
                <div class="text-[10px] truncate" style=${{ fontFamily: H.fontBody, color: H.textMuted }}>${agent.title}</div>
                ${!gradeOk ? html`
                  <div class="text-[9px] mt-0.5 px-1.5 py-0.5 inline-block tb-chamfer-sm"
                       style=${{ fontFamily: H.fontMono, background: H.amber + '20', color: H.amber, border: `1px solid ${H.amber}30` }}>
                    ${MICROCOPY.gradeMismatch}
                  </div>
                ` : null}
              </div>

              <button class="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-all hover:scale-110"
                      style=${{ background: 'rgba(255,255,255,0.05)', color: H.textMuted }}
                      onClick=${(e) => { e.stopPropagation(); removeAgent(index) }}
                      title="移除角色">
                ×
              </button>
            </div>

            <!-- 三围属性 -->
            ${agent.stats ? html`
              <div class="mt-2 space-y-0.5">
                <${StatBar} label="逻辑" value=${agent.stats.logic} color="#3b82f6" />
                <${StatBar} label="趣味" value=${agent.stats.fun} color="#f97316" />
                <${StatBar} label="视觉" value=${agent.stats.visual} color="#ec4899" />
              </div>
            ` : html`
              <div class="mt-2 flex flex-wrap gap-1">
                ${(agent.skills || []).slice(0, 2).map((s, i) => html`
                  <span key=${i} class="text-[9px] px-1.5 py-0.5 rounded tb-chamfer-sm"
                        style=${{ fontFamily: H.fontMono, background: slotDef.color + '12', color: slotDef.color, border: `1px solid ${slotDef.color}25` }}>
                    ${s}
                  </span>
                `)}
              </div>
            `}
          </div>
        `}
      </div>
    `
  }

  // ══════════════════════════════════════════
  // 渲染：角色卡牌库（部门分组 + CSS悬停详情覆盖层）
  // ══════════════════════════════════════════
  const [expandedDepts, setExpandedDepts] = useState({})

  const renderCardLibrary = () => {
    const showingRecommended = activeSlot !== null && slots[activeSlot] === null

    // 始终显示全部智能体（按部门分组），推荐的高亮显示
    const list = categoryFilter ? NEW_AGENTS.filter(a => a.category === categoryFilter) : NEW_AGENTS
    const recommendedIds = showingRecommended ? new Set(recommendedAgents.map(a => a.id)) : new Set()
    const agentsByDept = {}
    for (const a of list) {
      if (!agentsByDept[a.category]) agentsByDept[a.category] = []
      agentsByDept[a.category].push(a)
    }

    return html`
      <div class="relative tb-glass tb-chamfer p-5 overflow-hidden">
        <div class="tb-scanlines"></div>
        <div class="tb-corner-deco tb-corner-tl"></div>
        <div class="tb-corner-deco tb-corner-tr"></div>
        <div class="tb-corner-deco tb-corner-bl"></div>
        <div class="tb-corner-deco tb-corner-br"></div>

        <div class="relative flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="text-[12px] font-bold tracking-widest" style=${{ fontFamily: H.fontMono, color: H.cyan, textShadow: `0 0 4px ${H.cyan}60` }}>
              AGENT ROSTER
            </span>
            <span class="text-base font-bold" style=${{ fontFamily: H.fontBody, color: H.textPrimary }}>
              ${showingRecommended ? `· 当前推荐: ${TEAM_SLOTS[activeSlot]?.name}` : ''}
            </span>
          </div>
          <span class="text-sm tabular-nums" style=${{ fontFamily: H.fontMono, color: H.textMuted }}>
            ${list.length} UNITS · ${Object.keys(agentsByDept).length} DEPTS
          </span>
        </div>

        <!-- 分类筛选条 -->
        ${!showingRecommended ? html`
          <div class="relative flex flex-wrap gap-2 mb-4">
            <button class="text-[13px] px-3 py-2 tb-chamfer-sm font-bold tracking-wider transition-all"
                    style=${{
                      fontFamily: H.fontMono,
                      background: !categoryFilter ? H.cyan + '15' : 'transparent',
                      color: !categoryFilter ? H.cyan : H.textSecondary,
                      border: `1px solid ${!categoryFilter ? H.glassBorder : H.borderSubtle}`,
                    }}
                    onClick=${() => setCategoryFilter(null)}>
              全部
            </button>
            ${Object.entries(AGENT_CATEGORIES).map(([key, cat]) => {
              const count = NEW_AGENTS.filter(a => a.category === key).length
              return html`
              <button key=${key}
                      class="text-[13px] px-3 py-2 tb-chamfer-sm font-medium tracking-wider transition-all flex items-center gap-1.5"
                      style=${{
                        fontFamily: H.fontMono,
                        background: categoryFilter === key ? cat.color + '15' : 'transparent',
                        color: categoryFilter === key ? cat.color : H.textSecondary,
                        border: `1px solid ${categoryFilter === key ? cat.color + '40' : H.borderSubtle}`,
                      }}
                      onClick=${() => setCategoryFilter(key)}>
                ${cat.iconImg
                  ? html`<img src=${cat.iconImg} alt=${cat.name} class="w-4 h-4 rounded-sm object-cover" />`
                  : html`<span>${cat.icon}</span>`}<span>${cat.shortName}</span><span style=${{ opacity: 0.5, fontSize: '11px' }}>${count}</span>
              </button>
            `})}
          </div>
        ` : null}

        <!-- 部门分组展示 -->
        <div class="relative max-h-[600px] overflow-y-auto tb-scroll pr-1" style=${{ overscrollBehavior: 'contain' }}>
          ${Object.entries(agentsByDept).map(([deptKey, deptAgents]) => {
            const catInfo = AGENT_CATEGORIES[deptKey] || {}
            const isExpanded = expandedDepts[deptKey] !== false
            const deptColor = catInfo.color || H.cyan

            return html`
              <div key=${deptKey} class="tb-dept-section" style=${{ '--dept-color': deptColor }}>
                <button class="tb-dept-header"
                        onClick=${() => setExpandedDepts(prev => ({ ...prev, [deptKey]: !isExpanded }))}>
                  <div class="flex items-center gap-3">
                    <span class="tb-dept-icon">
                      ${catInfo.iconImg
                        ? html`<img src=${catInfo.iconImg} alt=${catInfo.name || deptKey} style=${{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />`
                        : (catInfo.icon || '◇')}
                    </span>
                    <div class="flex flex-col text-left">
                      <span class="tb-dept-name">${catInfo.name || deptKey}</span>
                      <span class="tb-dept-en">${catInfo.shortName || deptKey} · ${deptAgents.length} 人</span>
                    </div>
                  </div>
                  <span class="tb-dept-chevron" style=${{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)' }}>▸</span>
                </button>

                ${isExpanded ? html`
                  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4 pt-3">
                    ${deptAgents.map(agent => {
                      const rarity = getRarity(agent.id)
                      const rarityInfo = RARITY[rarity]
                      const isUsed = usedAgentIds.includes(agent.id)
                      const gradeOk = isGradeCompatible(agent, grade)
                      const avatar = getAgentAvatar(agent.id)

                      return html`
                        <div key=${agent.id}
                             class=${`tb-agent-card ${isUsed ? 'tb-agent-card-used' : ''}`}
                             style=${{
                               '--card-color': agent.color,
                               '--rarity-glow': rarityInfo.glow,
                             }}
                             draggable=${!isUsed}
                             onDragStart=${(e) => handleDragStart(e, agent.id)}
                             onClick=${() => {
                               if (isUsed) return
                               for (let i = 0; i < 6; i++) {
                                 if (slots[i] === null && canAssign(agent.id, i, AGENTS).ok) {
                                   assignAgent(agent.id, i)
                                   return
                                 }
                               }
                               setShowDetail(agent)
                             }}>

                          ${rarity === 'legendary' ? html`<div class="tb-agent-card-glow"></div>` : null}

                          <!-- 头像区 -->
                          <div class="tb-agent-card-avatar-wrap" style=${{ background: `linear-gradient(135deg, ${agent.color}30, ${agent.color}10)` }}>
                            ${avatar
                              ? html`<img src=${avatar} alt=${agent.name} class="tb-agent-card-avatar" style=${{ filter: isUsed ? 'grayscale(1) opacity(0.4)' : 'none' }} loading="lazy" />`
                              : html`<span class="tb-agent-card-emoji">${agent.emoji}</span>`
                            }
                            ${isUsed ? html`<div class="tb-agent-card-badge">在队</div>` : null}
                            ${recommendedIds.has(agent.id) && !isUsed ? html`<div class="tb-agent-card-rec">推荐</div>` : null}
                            <div class="tb-agent-card-rarity" style=${{ color: rarityInfo.color }}>
                              ${'★'.repeat(rarityInfo.stars)}
                            </div>
                          </div>

                          <!-- 信息区 -->
                          <div class="tb-agent-card-info">
                            <div class="tb-agent-card-name">${agent.name}</div>
                            <div class="tb-agent-card-title">${agent.title}</div>

                            ${agent.stats ? html`
                              <div class="tb-agent-card-stats">
                                <div class="tb-stat-mini">
                                  <span class="tb-stat-label" style=${{ color: '#3b82f6' }}>逻辑</span>
                                  <div class="tb-stat-bar"><div style=${{ width: `${agent.stats.logic}%`, background: '#3b82f6' }}></div></div>
                                </div>
                                <div class="tb-stat-mini">
                                  <span class="tb-stat-label" style=${{ color: '#f97316' }}>趣味</span>
                                  <div class="tb-stat-bar"><div style=${{ width: `${agent.stats.fun}%`, background: '#f97316' }}></div></div>
                                </div>
                                <div class="tb-stat-mini">
                                  <span class="tb-stat-label" style=${{ color: '#ec4899' }}>视觉</span>
                                  <div class="tb-stat-bar"><div style=${{ width: `${agent.stats.visual}%`, background: '#ec4899' }}></div></div>
                                </div>
                              </div>
                            ` : html`
                              <div class="tb-agent-card-skills">
                                ${(agent.skills || []).slice(0, 2).map((s, i) => html`<span key=${i} class="tb-skill-tag">${s}</span>`)}
                              </div>
                            `}
                          </div>

                          <!-- 悬停详情覆盖层 (CSS :hover 触发) -->
                          <div class="tb-agent-card-detail" onClick=${(e) => e.stopPropagation()}>
                            <div class="tb-detail-tagline" style=${{ color: agent.color }}>"${agent.tagline}"</div>
                            ${agent.ability ? html`
                              <div class="tb-detail-ability-label">异能</div>
                              <div class="tb-detail-ability-text">${agent.ability}</div>
                            ` : null}
                            ${agent.stats ? html`
                              <div class="tb-detail-stats">
                                <div class="tb-stat-mini">
                                  <span class="tb-stat-label" style=${{ color: '#3b82f6' }}>逻辑</span>
                                  <div class="tb-stat-bar"><div style=${{ width: `${agent.stats.logic}%`, background: '#3b82f6' }}></div></div>
                                </div>
                                <div class="tb-stat-mini">
                                  <span class="tb-stat-label" style=${{ color: '#f97316' }}>趣味</span>
                                  <div class="tb-stat-bar"><div style=${{ width: `${agent.stats.fun}%`, background: '#f97316' }}></div></div>
                                </div>
                                <div class="tb-stat-mini">
                                  <span class="tb-stat-label" style=${{ color: '#ec4899' }}>视觉</span>
                                  <div class="tb-stat-bar"><div style=${{ width: `${agent.stats.visual}%`, background: '#ec4899' }}></div></div>
                                </div>
                              </div>
                            ` : null}
                            <div class="tb-detail-meta">
                              <span class="tb-detail-badge">${GRADE_LABELS[agent.grade] || agent.grade}</span>
                              <span class="tb-detail-badge">${catInfo.name}</span>
                              ${!gradeOk ? html`<span class="tb-detail-warn">学段不匹配</span>` : null}
                            </div>
                          </div>
                        </div>
                      `
                    })}
                  </div>
                ` : null}
              </div>
            `
          })}
        </div>

        <div class="relative mt-3 flex items-center gap-2 text-sm" style=${{ fontFamily: H.fontBody, color: H.textMuted }}>
          <span class="w-1.5 h-1.5 rounded-full" style=${{ background: H.cyan }}></span>
          <span>悬停查看详情 · 点击放入槽位 · 拖拽到指定位置${showingRecommended ? ' · 推荐角色已标记' : ''}</span>
        </div>
      </div>
    `
  }

  // ══════════════════════════════════════════
  // 渲染：羁绊列表（成就系统）
  // ══════════════════════════════════════════
  const renderComboList = () => {
    const activatedIds = synergy.combos?.map(c => c.id) || []
    return html`
      <div class="relative tb-glass tb-chamfer p-4 overflow-hidden">
        <div class="tb-scanlines"></div>
        <div class="tb-corner-deco tb-corner-tl"></div>
        <div class="tb-corner-deco tb-corner-br"></div>

        <button class="relative flex items-center justify-between w-full"
                onClick=${() => setShowCombos(!showCombos)}>
          <span class="text-[9px] font-bold tracking-widest" style=${{ fontFamily: H.fontMono, color: H.cyan, textShadow: `0 0 4px ${H.cyan}60` }}>
            BOND CODEX
          </span>
          <span class="text-xs tabular-nums" style=${{ fontFamily: H.fontMono, color: H.textMuted }}>
            ${activatedIds.length}/${COMBOS.length}
          </span>
        </button>

        ${showCombos ? html`
          <div class="relative mt-3 space-y-2">
            ${COMBOS.map(c => {
              const activated = activatedIds.includes(c.id)
              return html`
                <div key=${c.id}
                     class="flex items-center gap-2 px-2.5 py-2 tb-chamfer-sm transition-all"
                     style=${{
                       background: activated ? c.color + '12' : 'rgba(255,255,255,0.02)',
                       border: `1px solid ${activated ? c.color + '30' : H.borderSubtle}`,
                       opacity: activated ? 1 : 0.5,
                     }}>
                  <span class="text-base ${activated ? 'combo-flash' : ''}">${activated ? c.icon : '🔒'}</span>
                  <div class="flex-1 min-w-0">
                    <div class="text-xs font-bold" style=${{ fontFamily: H.fontBody, color: activated ? c.color : H.textMuted }}>
                      ${c.name}
                    </div>
                    <div class="text-[10px] truncate" style=${{ fontFamily: H.fontBody, color: H.textMuted }}>${c.desc}</div>
                  </div>
                  <span class="text-[10px] font-bold shrink-0" style=${{ fontFamily: H.fontMono, color: activated ? c.color : H.textFaint }}>
                    ${c.bonus}
                  </span>
                </div>
              `
            })}
          </div>
        ` : null}
      </div>
    `
  }

  // ══════════════════════════════════════════
  // 渲染：操作栏（命令控制台）
  // ══════════════════════════════════════════
  const renderActionBar = () => html`
    <div class="relative flex items-center justify-between gap-3 pt-4 mt-2"
         style=${{ borderTop: `1px solid ${H.borderSubtle}` }}>
      <div class="flex items-center gap-2">
        <button class="px-3 py-2 tb-chamfer-sm text-[10px] font-bold tracking-wider transition-all"
                style=${{
                  fontFamily: H.fontMono,
                  background: 'transparent',
                  color: H.textMuted,
                  border: `1px solid ${H.borderSubtle}`,
                }}
                onClick=${resetAll}
                title="清空所有槽位">
          ${MICROCOPY.btnReset}
        </button>
        <button class="px-3 py-2 tb-chamfer-sm text-[10px] font-bold tracking-wider transition-all"
                style=${{
                  fontFamily: H.fontMono,
                  background: H.purple + '12',
                  color: H.purple,
                  border: `1px solid ${H.purple}30`,
                }}
                onClick=${autoFill}
                title="自动填充推荐角色">
          ${MICROCOPY.btnAutoFill}
        </button>
      </div>
      <button class="px-6 py-2.5 tb-chamfer-btn text-sm font-bold tracking-wider transition-all"
              style=${{
                fontFamily: H.fontHeader,
                background: progress.filled >= 3
                  ? `linear-gradient(135deg, ${H.cyan}, ${H.cyanBright})`
                  : 'rgba(255,255,255,0.05)',
                color: progress.filled >= 3 ? '#05010f' : H.textMuted,
                cursor: progress.filled >= 3 ? 'pointer' : 'not-allowed',
                boxShadow: progress.filled >= 3 ? `0 0 16px ${H.cyan}60` : 'none',
                textShadow: progress.filled >= 3 ? 'none' : 'none',
              }}
              disabled=${progress.filled < 3}
              onClick=${confirmTeam}>
        ${progress.filled < 3
          ? `NEED ${3 - progress.filled} MORE`
          : progress.filled === 6
            ? 'TEAM READY →'
            : `${MICROCOPY.btnConfirm} →`}
      </button>
    </div>
  `

  // ══════════════════════════════════════════
  // 渲染：详情弹窗（全息玻璃模态）
  // ══════════════════════════════════════════
  const renderDetailModal = () => {
    if (!showDetail) return null
    const agent = showDetail
    const rarity = getRarity(agent.id)
    const rarityInfo = RARITY[rarity]
    const catInfo = AGENT_CATEGORIES[agent.category] || {}
    const compatibleSlots = TEAM_SLOTS.filter(s => s.category === agent.category)

    return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
           style=${{ background: 'rgba(5,1,15,0.8)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
           onClick=${() => setShowDetail(null)}>
        <div class="relative tb-glass tb-chamfer max-w-md w-full p-5 max-h-[80vh] overflow-y-auto tb-scroll"
             style=${{ border: `1px solid ${rarityInfo.color}40` }}
             onClick=${(e) => e.stopPropagation()}>
          <div class="tb-scanlines"></div>
          <div class="tb-corner-deco tb-corner-tl"></div>
          <div class="tb-corner-deco tb-corner-tr"></div>
          <div class="tb-corner-deco tb-corner-bl"></div>
          <div class="tb-corner-deco tb-corner-br"></div>

          <!-- 头部 -->
          <div class="relative flex items-center gap-3 mb-4">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 tb-chamfer-sm overflow-hidden"
                 style=${{
                   background: `linear-gradient(135deg, ${agent.color}, ${agent.color}dd)`,
                   color: '#fff',
                   boxShadow: `0 0 12px ${agent.color}40`,
                 }}>
              ${getAgentAvatar(agent.id)
                ? html`<img src=${getAgentAvatar(agent.id)} alt=${agent.name} class="w-full h-full object-cover" />`
                : agent.emoji}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold" style=${{ fontFamily: H.fontBody, color: H.textBright }}>${agent.name}</h3>
                <span class="text-xs" style=${{ fontFamily: H.fontMono, color: rarityInfo.color }}>
                  ${'★'.repeat(rarityInfo.stars)} ${rarityInfo.name}
                </span>
              </div>
              <div class="text-xs" style=${{ fontFamily: H.fontBody, color: H.textMuted }}>
                ${catInfo.icon || ''} ${catInfo.name || agent.category} · ${GRADE_LABELS[agent.grade] || agent.grade}
              </div>
              <div class="text-[10px] mt-0.5" style=${{ fontFamily: H.fontBody, color: agent.color }}>"${agent.tagline}"</div>
            </div>
          </div>

          <!-- 三围属性 -->
          ${agent.stats ? html`
            <div class="relative mb-3 p-3 tb-chamfer-sm" style=${{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${H.borderSubtle}` }}>
              <div class="text-[9px] font-bold tracking-widest mb-2" style=${{ fontFamily: H.fontMono, color: H.cyan }}>STATS</div>
              <div class="space-y-1.5">
                <${StatBar} label="逻辑" value=${agent.stats.logic} color="#3b82f6" />
                <${StatBar} label="趣味" value=${agent.stats.fun} color="#f97316" />
                <${StatBar} label="视觉" value=${agent.stats.visual} color="#ec4899" />
              </div>
            </div>
          ` : null}

          <!-- 异能 -->
          ${agent.ability ? html`
            <div class="relative mb-3 p-3 tb-chamfer-sm" style=${{
              background: (catInfo.color || H.purple) + '0a',
              border: `1px solid ${(catInfo.color || H.purple) + '25'}`,
            }}>
              <div class="text-[9px] font-bold tracking-widest mb-1" style=${{ fontFamily: H.fontMono, color: catInfo.color || H.purple }}>ABILITY</div>
              <p class="text-xs leading-relaxed" style=${{ fontFamily: H.fontBody, color: H.textPrimary }}>${agent.ability}</p>
            </div>
          ` : null}

          <!-- 可担任的槽位 -->
          <div class="relative mb-3">
            <div class="text-[9px] font-bold tracking-widest mb-1.5" style=${{ fontFamily: H.fontMono, color: H.cyan }}>COMPATIBLE SLOTS</div>
            <div class="flex flex-wrap gap-1.5">
              ${compatibleSlots.map(s => html`
                <span key=${s.id} class="text-xs px-2 py-1 tb-chamfer-sm flex items-center gap-1"
                      style=${{ fontFamily: H.fontBody, background: s.color + '12', color: s.color, border: `1px solid ${s.color}25` }}>
                  ${s.icon} ${s.name}
                </span>
              `)}
            </div>
          </div>

          <!-- 适用学科 -->
          ${agent.subject ? html`
            <div class="relative mb-3">
              <div class="text-[9px] font-bold tracking-widest mb-1.5" style=${{ fontFamily: H.fontMono, color: H.cyan }}>SCOPE</div>
              <div class="text-xs" style=${{ fontFamily: H.fontBody, color: H.textPrimary }}>${agent.subject}</div>
            </div>
          ` : null}

          <!-- 专长 -->
          ${agent.expertise && agent.expertise.length > 0 ? html`
            <div class="relative mb-3">
              <div class="text-[9px] font-bold tracking-widest mb-1.5" style=${{ fontFamily: H.fontMono, color: H.cyan }}>EXPERTISE</div>
              <div class="flex flex-wrap gap-1.5">
                ${agent.expertise.map((e, i) => html`
                  <span key=${i} class="text-xs px-2 py-1 tb-chamfer-sm"
                        style=${{ fontFamily: H.fontBody, background: 'rgba(255,255,255,0.04)', color: H.textPrimary, border: `1px solid ${H.borderSubtle}` }}>
                    ${e}
                  </span>
                `)}
              </div>
            </div>
          ` : null}

          <!-- 背景 -->
          ${agent.background ? html`
            <div class="relative mb-3">
              <div class="text-[9px] font-bold tracking-widest mb-1" style=${{ fontFamily: H.fontMono, color: H.cyan }}>BACKGROUND</div>
              <p class="text-xs leading-relaxed" style=${{ fontFamily: H.fontBody, color: H.textSecondary }}>${agent.background}</p>
            </div>
          ` : null}

          <!-- 操作 -->
          <div class="relative flex gap-2 mt-4">
            ${compatibleSlots.length > 0 && !usedAgentIds.includes(agent.id) ? html`
              <button class="flex-1 py-2.5 tb-chamfer-btn text-sm font-bold tracking-wider transition-all"
                      style=${{
                        fontFamily: H.fontHeader,
                        background: `linear-gradient(135deg, ${H.cyan}, ${H.cyanBright})`,
                        color: '#05010f',
                        boxShadow: `0 0 12px ${H.cyan}50`,
                      }}
                      onClick=${() => {
                        for (const s of compatibleSlots) {
                          if (slots[s.id] === null) {
                            assignAgent(agent.id, s.id)
                            break
                          }
                        }
                        setShowDetail(null)
                      }}>
                DEPLOY →
              </button>
            ` : null}
            <button class="px-4 py-2.5 tb-chamfer-btn text-sm font-bold tracking-wider transition-all"
                    style=${{
                      fontFamily: H.fontHeader,
                      background: 'rgba(255,255,255,0.05)',
                      color: H.textMuted,
                      border: `1px solid ${H.borderSubtle}`,
                    }}
                    onClick=${() => setShowDetail(null)}>
              CLOSE
            </button>
          </div>
        </div>
      </div>
    `
  }

  // ══════════════════════════════════════════
  // 主渲染
  // ══════════════════════════════════════════
  return html`
    <div class="min-h-screen relative" style=${{ background: H.void, color: H.textPrimary, minHeight: '100vh', fontFamily: H.fontBody }}>
      <style>${BUILDER_CSS}</style>

      <!-- 全页固定背景图 -->
      <div class="fixed inset-0 pointer-events-none" style=${{
        backgroundImage: `url(${HERO_BG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        zIndex: 0,
      }}></div>

      <!-- 背景遮罩层 -->
      <div class="fixed inset-0 pointer-events-none" style=${{
        background: 'linear-gradient(180deg, rgba(5,1,15,0.75) 0%, rgba(5,1,15,0.85) 50%, rgba(5,1,15,0.92) 100%)',
        zIndex: 0,
      }}></div>

      <!-- 网格背景 -->
      <div class="fixed inset-0 tb-grid-bg pointer-events-none" style=${{ opacity: 0.3, zIndex: 0 }}></div>

      <${NavBar} />

      <!-- 全息 Hero 横幅 -->
      ${renderHeroBanner()}

      <!-- 内容区 -->
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16" style=${{ zIndex: 1 }}>

        <${StepProgress} current=${3} total=${5} labels=${['选学科', '选模式', '抽玩法', '组团队', '传教材']} />

        <!-- 部门总监展示区 -->
        ${renderDirectorsShowcase()}

        <!-- 引导面板 -->
        ${renderGuidePanel()}

        <!-- 主体：左侧槽位 + 右侧评分 -->
        <div class="grid lg:grid-cols-[1fr_280px] gap-4 mb-4">

          <!-- 左侧：6 个槽位 + 卡牌库 -->
          <div>
            <!-- 槽位标题 -->
            <div class="flex items-center gap-2 mb-2.5">
              <span class="text-[9px] font-bold tracking-widest" style=${{ fontFamily: H.fontMono, color: H.cyan, textShadow: `0 0 4px ${H.cyan}60` }}>
                TEAM SLOTS
              </span>
              <div class="flex-1 h-px" style=${{ background: H.glassBorder }}></div>
              <span class="text-[9px] tabular-nums" style=${{ fontFamily: H.fontMono, color: H.textMuted }}>
                ${progress.filled}/6 FILLED
              </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              ${TEAM_SLOTS.map((slot, i) => renderSlot(slot, i))}
            </div>

            <!-- 角色卡牌库 -->
            <div class="mt-4">
              ${renderCardLibrary()}
            </div>
          </div>

          <!-- 右侧：评分 + 羁绊 -->
          <div class="space-y-4">
            ${renderSynergyPanel()}
            ${renderComboList()}
          </div>
        </div>

        <!-- 底部操作栏 -->
        ${renderActionBar()}
      </div>

      <${Footer} />

      <!-- 详情弹窗 -->
      ${renderDetailModal()}
    </div>
  `
}
