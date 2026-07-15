// 通用 UI 组件库
import { html, useState, useEffect, useRef, useMemo, useCallback } from '../../react.js'
import { useApp } from '../../store/appContext.js'
import TacticalPipelineHUD from '../platform/TacticalPipelineHUD.js'

// 品牌 Logo
export function Logo({ size = 'md', showText = true }) {
  const sizes = { sm: 'text-xl', md: 'text-2xl', lg: 'text-4xl', xl: 'text-6xl' }
  const emoji = { sm: 'text-2xl', md: 'text-3xl', lg: 'text-5xl', xl: 'text-7xl' }
  return html`
    <div className="flex items-center gap-2">
      <span className="${emoji[size]} animate-float">🧠</span>
      ${showText && html`<span className="${sizes[size]} font-black gradient-text">知识不进脑子啊</span>`}
    </div>
  `
}

// 按钮
export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, loading, className = '', ...rest }) {
  const variants = {
    primary: 'bg-gradient-to-r from-brand-500 to-accent-500 text-white hover:shadow-lg hover:shadow-brand-300/50',
    secondary: 'bg-white text-brand-600 border-2 border-brand-200 hover:border-brand-400 hover:bg-brand-50',
    ghost: 'text-brand-600 hover:bg-brand-50',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-green-500 text-white hover:bg-green-600'
  }
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5 text-sm', lg: 'px-6 py-3 text-base' }
  return html`
    <button
      onClick=${onClick}
      disabled=${disabled || loading}
      className="${variants[variant]} ${sizes[size]} rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center gap-2 ${className}"
      ...${rest}
    >
      ${loading && html`<span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>`}
      ${children}
    </button>
  `
}

// 旋转加载
export function Spinner({ size = 'md', color = 'brand' }) {
  const sz = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  const cl = { brand: 'border-brand-300 border-t-brand-600', white: 'border-white/40 border-t-white', accent: 'border-orange-300 border-t-orange-500' }
  return html`<div className="${sz[size]} ${cl[color]} border-3 rounded-full animate-spin"></div>`
}

// 全屏加载遮罩
export function LoadingOverlay() {
  const { state } = useApp()
  if (!state.ui.loading) return null
  return html`
    <div class="fixed inset-0 z-50 flex flex-col items-center justify-center animate-fade-in"
         style=${{ background: 'rgba(5,1,15,0.8)', backdropFilter: 'blur(8px)' }}>
      <div class="rounded-3xl px-10 py-8 flex flex-col items-center gap-4"
           style=${{ background: 'rgba(15,8,32,0.95)', border: '1px solid rgba(167,139,250,0.15)', boxShadow: '0 8px 32px rgba(167,139,250,0.1)' }}>
        <div class="text-5xl animate-bounce">🧠</div>
        <div class="flex gap-2 typing-dots"><span></span><span></span><span></span></div>
        <p class="text-sm font-medium" style=${{ color: '#a78bfa' }}>${state.ui.loadingText || '思考中...'}</p>
      </div>
    </div>
  `
}

// Toast 消息
export function Toast() {
  const { state } = useApp()
  const toast = state.ui.toast
  if (!toast) return null
  const styles = {
    info: 'bg-brand-600',
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-orange-500'
  }
  const icons = { info: '💡', success: '✅', error: '⚠️', warning: '⚡' }
  return html`
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="${styles[toast.type] || styles.info} text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-medium text-sm">
        <span>${icons[toast.type] || '💡'}</span>
        <span>${toast.msg}</span>
      </div>
    </div>
  `
}

// 错误横幅
export function ErrorBanner() {
  const { state, dispatch } = useApp()
  if (!state.ui.error) return null
  return html`
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] animate-slide-up">
      <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-3 rounded-2xl shadow-xl flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div className="flex-1 text-sm">
          <p className="font-semibold mb-1">出错了</p>
          <p className="text-red-600">${state.ui.error}</p>
        </div>
        <button onClick=${() => dispatch({ type: 'SET_ERROR', payload: null })} className="text-red-400 hover:text-red-700 text-lg leading-none">×</button>
      </div>
    </div>
  `
}

// 模态框
export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])
  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return html`
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick=${onClose}>
      <div className="bg-white rounded-3xl shadow-2xl ${sizes[size]} w-full max-h-[90vh] flex flex-col animate-slide-up" onClick=${(e) => e.stopPropagation()}>
        ${title && html`
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-ink">${title}</h3>
            <button onClick=${onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
          </div>
        `}
        <div className="px-6 py-5 overflow-y-auto flex-1 scrollbar-thin">${children}</div>
        ${footer && html`<div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">${footer}</div>`}
      </div>
    </div>
  `
}

// 步骤导航 — 战术链路指示器
export function Stepper({ current, onStepClick }) {
  return html`<${TacticalPipelineHUD} currentStep=${current} onStepClick=${onStepClick} />`
}

// 空状态
export function EmptyState({ emoji = '📭', title, desc, action }) {
  return html`
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-6xl mb-4 opacity-60">${emoji}</div>
      <h3 className="text-lg font-bold text-gray-700 mb-1">${title}</h3>
      ${desc && html`<p className="text-sm text-gray-500 mb-4 max-w-sm">${desc}</p>`}
      ${action}
    </div>
  `
}

// 简易 Markdown 渲染（支持标题/表格/列表/粗体/公式）
export function MarkdownView({ content }) {
  const ref = useRef(null)
  const htmlContent = useMemo(() => renderMarkdown(content || ''), [content])

  useEffect(() => {
    if (ref.current) {
      renderFormulas(ref.current)
    }
  }, [htmlContent])

  return html`<div ref=${ref} className="markdown-body" dangerouslySetInnerHTML=${{ __html: htmlContent }}></div>`
}

// 极简 markdown → html
function renderMarkdown(md) {
  let h = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // 代码块
  h = h.replace(/```([\s\S]+?)```/g, (m, c) => `<pre class="code-block"><code>${c.trim()}</code></pre>`)

  // 表格
  h = h.replace(/^(\|.+\|)\n(\|[\s\-:|]+\|)\n((?:\|.+\|\n?)+)/gm, (m, header, sep, body) => {
    const hCells = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('')
    const rows = body.trim().split('\n').map(row => {
      const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('')
      return `<tr>${cells}</tr>`
    }).join('')
    return `<table><thead><tr>${hCells}</tr></thead><tbody>${rows}</tbody></table>`
  })

  // 标题
  h = h.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
  h = h.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
  h = h.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
  h = h.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
  h = h.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
  h = h.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')

  // 粗体 / 斜体
  h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  h = h.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>')

  // 行内代码
  h = h.replace(/`([^`\n]+)`/g, '<code>$1</code>')

  // 引用
  h = h.replace(/^&gt;\s?(.+)$/gm, '<blockquote>$1</blockquote>')

  // 分割线
  h = h.replace(/^---$/gm, '<hr/>')

  // 有序/无序列表
  h = h.replace(/^\d+\.\s+(.+)$/gm, '<oli>$1</oli>')
  h = h.replace(/^[-*]\s+(.+)$/gm, '<uli>$1</uli>')
  h = h.replace(/(<oli>[\s\S]+?<\/oli>)/g, '<ol>$1</ol>').replace(/<\/oli>(\s*)<oli>/g, '</oli>$1<oli>')
  h = h.replace(/(<uli>[\s\S]+?<\/uli>)/g, '<ul>$1</ul>').replace(/<\/uli>(\s*)<uli>/g, '</uli>$1<uli>')

  // 段落
  h = h.split('\n\n').map(block => {
    const t = block.trim()
    if (!t) return ''
    if (/^<(h\d|table|pre|blockquote|ul|ol|hr|div)/.test(t)) return t
    return `<p>${t.replace(/\n/g, '<br/>')}</p>`
  }).join('\n')

  return h
}

// KaTeX 公式渲染（动态加载）
let katexLoaded = false
let katexPromise = null
async function ensureKatex() {
  if (katexLoaded) return window.katex
  if (katexPromise) return katexPromise
  katexPromise = (async () => {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js'
      s.onload = resolve
      s.onerror = reject
      document.head.appendChild(s)
    }).catch(() => null)
    if (window.katex) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js'
        s.onload = resolve
        s.onerror = reject
        document.head.appendChild(s)
      }).catch(() => null)
    }
    katexLoaded = true
    return window.katex
  })()
  return katexPromise
}

async function renderFormulas(el) {
  await ensureKatex()
  if (window.renderMathInElement) {
    try {
      window.renderMathInElement(el, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      })
    } catch (e) {}
  }
}
