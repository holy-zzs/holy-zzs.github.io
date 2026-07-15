// ═══════════════════════════════════════════════════════════
// 主题上下文：根据学段动态切换 UI 皮肤
// ═══════════════════════════════════════════════════════════
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { html } from '../react.js'
import { getTheme, THEMES, THEME_TRANSITION_CSS } from '../data/themes.js'

const ThemeContext = createContext(null)

// 全局 CSS 注入标记
let cssInjected = false

function injectThemeCSS() {
  if (cssInjected) return
  const style = document.createElement('style')
  style.id = 'theme-system-css'
  style.textContent = THEME_TRANSITION_CSS
  document.head.appendChild(style)
  cssInjected = true
}

export function ThemeProvider({ children, grade }) {
  const [currentTheme, setCurrentTheme] = useState(() => getTheme(grade))
  const [transitioning, setTransitioning] = useState(false)

  // 注入全局 CSS
  useEffect(() => {
    injectThemeCSS()
  }, [])

  // 当 grade 变化时，切换主题
  useEffect(() => {
    const newTheme = getTheme(grade)

    if (newTheme.id === currentTheme.id) return

    // 触发涟漪动画
    setTransitioning(true)

    // 在文档根元素上设置 CSS 变量
    const root = document.documentElement
    Object.entries(newTheme.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // 设置 body 背景和字体
    document.body.style.background = newTheme.cssVars['--theme-bg']
    document.body.style.color = newTheme.cssVars['--theme-text']
    document.body.style.fontFamily = newTheme.cssVars['--theme-font']
    document.body.style.transition = `background ${newTheme.cssVars['--theme-transition']}, color ${newTheme.cssVars['--theme-transition']}`

    // 背景装饰
    if (newTheme.decorations?.bgPattern) {
      document.body.style.backgroundImage = newTheme.decorations.bgPattern
      if (newTheme.decorations.bgSize) {
        document.body.style.backgroundSize = newTheme.decorations.bgSize
      }
    } else {
      document.body.style.backgroundImage = 'none'
    }

    // 暗色模式 class
    if (newTheme.isDark) {
      document.documentElement.classList.add('theme-dark')
    } else {
      document.documentElement.classList.remove('theme-dark')
    }

    setCurrentTheme(newTheme)

    // 涟漪效果
    setTimeout(() => {
      const ripple = document.createElement('div')
      ripple.className = 'theme-ripple'
      ripple.style.cssText = `
        left: 50%; top: 50%;
        width: 100px; height: 100px;
        margin-left: -50px; margin-top: -50px;
        background: ${newTheme.cssVars['--theme-primary']};
      `
      document.body.appendChild(ripple)
      setTimeout(() => ripple.remove(), 800)
    }, 50)

    // 大学主题：添加数据流线条
    if (newTheme.id === 'college') {
      addDataFlowLines()
    } else {
      removeDataFlowLines()
    }

    // 结束过渡
    const transitionTime = parseInt(newTheme.cssVars['--theme-transition']) || 480
    setTimeout(() => setTransitioning(false), transitionTime + 100)

  }, [grade])

  // 数据流线条（大学主题专属）
  function addDataFlowLines() {
    removeDataFlowLines()
    const container = document.createElement('div')
    container.id = 'data-flow-container'
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden;'
    for (let i = 0; i < 5; i++) {
      const line = document.createElement('div')
      line.className = 'data-flow-line'
      line.style.cssText = `
        top: ${10 + i * 20}%;
        width: ${100 + Math.random() * 200}px;
        background: linear-gradient(90deg, transparent, rgba(6,182,212,0.4), transparent);
        animation-delay: ${i * 0.6}s;
        animation-duration: ${2 + Math.random() * 2}s;
      `
      container.appendChild(line)
    }
    document.body.appendChild(container)
  }

  function removeDataFlowLines() {
    const existing = document.getElementById('data-flow-container')
    if (existing) existing.remove()
  }

  // 清理
  useEffect(() => {
    return () => removeDataFlowLines()
  }, [])

  const value = useMemo(() => ({
    theme: currentTheme,
    isDark: currentTheme.isDark,
    transitioning,
    // 便捷方法
    getCardClass: (extra = '') => `${currentTheme.cardClass} ${extra}`.trim(),
    getBtnClass: (extra = '') => `${currentTheme.btnClass} ${extra}`.trim(),
    fontClass: currentTheme.fontClass,
  }), [currentTheme, transitioning])

  return html`<${ThemeContext.Provider} value=${value}>${children}<//>`
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    // 返回默认主题（防止未包裹 Provider 时崩溃）
    return {
      theme: THEMES.default,
      isDark: false,
      transitioning: false,
      getCardClass: (extra = '') => `rounded-xl ${extra}`.trim(),
      getBtnClass: (extra = '') => `rounded-lg ${extra}`.trim(),
      fontClass: 'font-sans',
    }
  }
  return ctx
}
