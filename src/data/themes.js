// ═══════════════════════════════════════════════════════════
// 动态 UI 皮肤系统 —— 复古未来主义 Retro-Futuristic 统一深色系
// 所有学段共享深空美学，仅主色调随学段微调
// ═══════════════════════════════════════════════════════════

// ── 复古未来主义基础色板 ──
const RETRO_BASE = {
  bg: '#05010f',
  bgGradient: 'radial-gradient(ellipse at 50% 80%, #1e0f4d 0%, #0a0420 40%, #05010f 100%)',
  surface: 'rgba(255,255,255,0.03)',
  surfaceAlt: 'rgba(255,255,255,0.05)',
  surfaceSolid: '#0f0820',
  text: '#f5e8ff',
  textMuted: '#8b7da8',
  border: 'rgba(167,139,250,0.12)',
  borderLight: 'rgba(255,255,255,0.06)',
  accent: '#F5A623',
  font: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
  fontMono: '"JetBrains Mono", "Cascadia Code", monospace',
  transition: '480ms cubic-bezier(0.4, 0, 0.2, 1)',
}

// ── 主题定义 ──
export const THEMES = {
  // 默认主题（未选学段 / 通用）
  default: {
    id: 'default',
    name: '深空指挥中心',
    emoji: '🛰️',
    description: '复古未来主义深空美学',
    cssVars: {
      '--theme-bg': RETRO_BASE.bg,
      '--theme-surface': RETRO_BASE.surface,
      '--theme-surface-alt': RETRO_BASE.surfaceAlt,
      '--theme-text': RETRO_BASE.text,
      '--theme-text-muted': RETRO_BASE.textMuted,
      '--theme-primary': '#a78bfa',
      '--theme-primary-light': '#c4b5fd',
      '--theme-primary-bg': 'rgba(167,139,250,0.08)',
      '--theme-accent': RETRO_BASE.accent,
      '--theme-accent-bg': 'rgba(245,166,35,0.08)',
      '--theme-border': RETRO_BASE.border,
      '--theme-radius': '12px',
      '--theme-radius-sm': '8px',
      '--theme-radius-lg': '16px',
      '--theme-shadow': '0 4px 24px rgba(167,139,250,0.06)',
      '--theme-shadow-hover': '0 8px 32px rgba(167,139,250,0.12)',
      '--theme-font': RETRO_BASE.font,
      '--theme-font-mono': RETRO_BASE.fontMono,
      '--theme-transition': RETRO_BASE.transition,
    },
    fontClass: 'font-sans',
    cardClass: 'rounded-xl',
    btnClass: 'rounded-lg',
    isDark: true,
  },

  // 小学：暖橙霓虹 —— 保持深色但主色调偏暖
  primary: {
    id: 'primary',
    name: '暖橙霓虹',
    emoji: '🧒',
    description: '深空中的暖橙光芒，童趣不减',
    cssVars: {
      '--theme-bg': RETRO_BASE.bg,
      '--theme-surface': RETRO_BASE.surface,
      '--theme-surface-alt': RETRO_BASE.surfaceAlt,
      '--theme-text': '#fff5e6',
      '--theme-text-muted': '#a0886e',
      '--theme-primary': '#FF8A3D',
      '--theme-primary-light': '#FFB066',
      '--theme-primary-bg': 'rgba(255,138,61,0.08)',
      '--theme-accent': '#7CC950',
      '--theme-accent-bg': 'rgba(124,201,80,0.08)',
      '--theme-border': 'rgba(255,138,61,0.15)',
      '--theme-radius': '20px',
      '--theme-radius-sm': '14px',
      '--theme-radius-lg': '28px',
      '--theme-shadow': '0 6px 24px rgba(255,138,61,0.08)',
      '--theme-shadow-hover': '0 12px 32px rgba(255,138,61,0.14)',
      '--theme-font': RETRO_BASE.font,
      '--theme-font-mono': RETRO_BASE.fontMono,
      '--theme-transition': RETRO_BASE.transition,
    },
    fontClass: 'font-sans',
    cardClass: 'rounded-3xl',
    btnClass: 'rounded-2xl',
    isDark: true,
    decorations: {
      pattern: 'bubbles',
      bgPattern: 'radial-gradient(circle at 20% 80%, rgba(255,138,61,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(124,201,80,0.04) 0%, transparent 50%)',
    },
  },

  // 初中：青蓝霓虹 —— 深空中的冷蓝光
  junior: {
    id: 'junior',
    name: '青蓝霓虹',
    emoji: '👦',
    description: '深空中的青蓝光芒，清爽利落',
    cssVars: {
      '--theme-bg': RETRO_BASE.bg,
      '--theme-surface': RETRO_BASE.surface,
      '--theme-surface-alt': RETRO_BASE.surfaceAlt,
      '--theme-text': '#e0f2fe',
      '--theme-text-muted': '#6b7c93',
      '--theme-primary': '#38bdf8',
      '--theme-primary-light': '#7dd3fc',
      '--theme-primary-bg': 'rgba(56,189,248,0.08)',
      '--theme-accent': '#14B8A6',
      '--theme-accent-bg': 'rgba(20,184,166,0.08)',
      '--theme-border': 'rgba(56,189,248,0.15)',
      '--theme-radius': '14px',
      '--theme-radius-sm': '10px',
      '--theme-radius-lg': '20px',
      '--theme-shadow': '0 4px 24px rgba(56,189,248,0.06)',
      '--theme-shadow-hover': '0 8px 32px rgba(56,189,248,0.12)',
      '--theme-font': RETRO_BASE.font,
      '--theme-font-mono': RETRO_BASE.fontMono,
      '--theme-transition': RETRO_BASE.transition,
    },
    fontClass: 'font-sans',
    cardClass: 'rounded-2xl',
    btnClass: 'rounded-xl',
    isDark: true,
    decorations: {
      pattern: 'waves',
      bgPattern: 'linear-gradient(180deg, rgba(56,189,248,0.03) 0%, transparent 100%)',
    },
  },

  // 高中：紫金霓虹 —— 深空中的紫金光芒
  senior: {
    id: 'senior',
    name: '紫金霓虹',
    emoji: '🧑',
    description: '深空中的紫金光芒，专注高效',
    cssVars: {
      '--theme-bg': RETRO_BASE.bg,
      '--theme-surface': RETRO_BASE.surface,
      '--theme-surface-alt': RETRO_BASE.surfaceAlt,
      '--theme-text': '#f5e8ff',
      '--theme-text-muted': '#7c6fab',
      '--theme-primary': '#a78bfa',
      '--theme-primary-light': '#c4b5fd',
      '--theme-primary-bg': 'rgba(167,139,250,0.08)',
      '--theme-accent': '#F5A623',
      '--theme-accent-bg': 'rgba(245,166,35,0.08)',
      '--theme-border': 'rgba(167,139,250,0.15)',
      '--theme-radius': '10px',
      '--theme-radius-sm': '6px',
      '--theme-radius-lg': '14px',
      '--theme-shadow': '0 4px 24px rgba(167,139,250,0.06)',
      '--theme-shadow-hover': '0 8px 32px rgba(167,139,250,0.12)',
      '--theme-font': RETRO_BASE.font,
      '--theme-font-mono': RETRO_BASE.fontMono,
      '--theme-transition': RETRO_BASE.transition,
    },
    fontClass: 'font-sans',
    cardClass: 'rounded-xl',
    btnClass: 'rounded-lg',
    isDark: true,
    decorations: {
      pattern: 'grid',
      bgPattern: 'linear-gradient(rgba(167,139,250,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.03) 1px, transparent 1px)',
      bgSize: '24px 24px',
    },
  },

  // 大学：量子实验室 —— 保留原有深色但统一到复古未来主义
  college: {
    id: 'college',
    name: '量子实验室',
    emoji: '🎓',
    description: '极简主义，冷色调，学术仪表盘感',
    cssVars: {
      '--theme-bg': RETRO_BASE.bg,
      '--theme-surface': RETRO_BASE.surface,
      '--theme-surface-alt': RETRO_BASE.surfaceAlt,
      '--theme-text': '#e2e8f0',
      '--theme-text-muted': '#64748B',
      '--theme-primary': '#06B6D4',
      '--theme-primary-light': '#22D3EE',
      '--theme-primary-bg': 'rgba(6,182,212,0.08)',
      '--theme-accent': '#818CF8',
      '--theme-accent-bg': 'rgba(129,140,248,0.08)',
      '--theme-border': 'rgba(6,182,212,0.15)',
      '--theme-radius': '6px',
      '--theme-radius-sm': '4px',
      '--theme-radius-lg': '8px',
      '--theme-shadow': '0 4px 24px rgba(6,182,212,0.06)',
      '--theme-shadow-hover': '0 8px 32px rgba(6,182,212,0.12)',
      '--theme-font': RETRO_BASE.font,
      '--theme-font-mono': RETRO_BASE.fontMono,
      '--theme-transition': '520ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    fontClass: 'font-sans',
    cardClass: 'rounded-md',
    btnClass: 'rounded',
    isDark: true,
    decorations: {
      pattern: 'circuit',
      bgPattern: 'radial-gradient(circle at 50% 50%, rgba(6,182,212,0.04) 0%, transparent 70%), linear-gradient(180deg, rgba(129,140,248,0.03) 0%, transparent 50%)',
    },
  },
}

// ── 学段 → 主题映射 ──
export const GRADE_THEME_MAP = {
  null: 'default',
  undefined: 'default',
  '': 'default',
  primary: 'primary',
  junior: 'junior',
  senior: 'senior',
  college: 'college',
}

// ── 获取当前主题 ──
export function getTheme(grade) {
  const themeId = GRADE_THEME_MAP[String(grade)] || 'default'
  return THEMES[themeId] || THEMES.default
}

// ── 获取主题切换动画的 keyframes ──
export const THEME_TRANSITION_CSS = `
.theme-root {
  background: var(--theme-bg);
  color: var(--theme-text);
  font-family: var(--theme-font);
  transition: background var(--theme-transition), color var(--theme-transition);
}
.theme-surface {
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: var(--theme-radius);
  box-shadow: var(--theme-shadow);
  transition: all var(--theme-transition);
}
.theme-surface:hover {
  box-shadow: var(--theme-shadow-hover);
}
.theme-text { color: var(--theme-text); }
.theme-text-muted { color: var(--theme-text-muted); }
.theme-primary { color: var(--theme-primary); }
.theme-primary-bg { background: var(--theme-primary-bg); }
.theme-accent { color: var(--theme-accent); }
.theme-accent-bg { background: var(--theme-accent-bg); }
.theme-border { border-color: var(--theme-border); }
.theme-btn {
  border-radius: var(--theme-radius-sm);
  transition: all var(--theme-transition);
}
.theme-card {
  border-radius: var(--theme-radius);
  box-shadow: var(--theme-shadow);
  transition: all var(--theme-transition);
}
.theme-card:hover {
  box-shadow: var(--theme-shadow-hover);
}
.theme-font-mono { font-family: var(--theme-font-mono); }

/* 主题切换涟漪动画 */
@keyframes themeRipple {
  0% { transform: scale(0); opacity: 0.4; }
  100% { transform: scale(4); opacity: 0; }
}
.theme-ripple {
  position: fixed;
  pointer-events: none;
  border-radius: 50%;
  z-index: 9999;
  animation: themeRipple 700ms ease-out forwards;
}

/* 羁绊激活金光 */
@keyframes synergyGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.5); }
  50% { box-shadow: 0 0 24px 4px rgba(255, 215, 0, 0.4); }
}
.synergy-active {
  animation: synergyGlow 2s ease-in-out infinite;
}

/* 小学气泡装饰 */
@keyframes bubbleFloat {
  0% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-20px) scale(1.1); opacity: 0.5; }
  100% { transform: translateY(0) scale(1); opacity: 0.3; }
}

/* 大学数据流线条 */
@keyframes dataFlow {
  0% { transform: translateX(-100%); opacity: 0; }
  20% { opacity: 0.6; }
  80% { opacity: 0.6; }
  100% { transform: translateX(100vw); opacity: 0; }
}
.data-flow-line {
  position: fixed;
  top: 0;
  height: 1px;
  pointer-events: none;
  z-index: 1;
  animation: dataFlow 3s linear infinite;
}
`
