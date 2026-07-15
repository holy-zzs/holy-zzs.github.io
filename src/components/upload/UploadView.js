// 教材上传与解析界面（任务6）
import { html, useState, useRef } from '../../react.js'
import { useApp, STEPS } from '../../store/appContext.js'
import { Button, EmptyState } from '../common/ui.js'
import { parseFile, parseText } from '../../lib/parser.js'

export default function UploadView() {
  const { state, dispatch, toast, goStep, goPrev, setLoading, setError } = useApp()
  const [dragOver, setDragOver] = useState(false)
  const [progress, setProgress] = useState(null) // {page, total}
  const [pasteMode, setPasteMode] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const fileInput = useRef(null)

  const material = state.material

  const handleFile = async (file) => {
    if (!file) return
    const name = file.name.toLowerCase()
    const isPdf = name.endsWith('.pdf')
    const isText = ['.txt', '.md', '.markdown', '.text'].some(ext => name.endsWith(ext))
    if (!isPdf && !isText) { toast('仅支持 PDF 和文本文件', 'warning'); return }

    setLoading(true, isPdf ? '正在解析PDF...' : '正在解析文本...')
    setProgress(null)
    try {
      const result = await parseFile(file, (page, total) => setProgress({ page, total }))
      dispatch({ type: 'SET_MATERIAL', payload: result })
      toast(`解析完成：${result.stats.sections}章节 · ${result.stats.concepts}概念 · ${result.stats.formulas}公式`, 'success')
    } catch (e) {
      setError(e.message || '解析失败，请重试')
    } finally {
      setLoading(false)
      setProgress(null)
    }
  }

  const handlePaste = () => {
    if (!pasteText.trim() || pasteText.trim().length < 20) { toast('请粘贴至少20字的内容', 'warning'); return }
    setLoading(true, '正在解析...')
    try {
      const result = parseText(pasteText, '粘贴文本.txt')
      dispatch({ type: 'SET_MATERIAL', payload: result })
      toast(`解析完成：${result.stats.sections}章节 · ${result.stats.concepts}概念`, 'success')
    } catch (e) {
      setError('解析失败：' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const useDemo = () => {
    setLoading(true, '载入演示教材...')
    const demoText = `# 二次函数

## 一、定义
一般地，形如 y=ax²+bx+c（a≠0）的函数称为二次函数。其中x是自变量，a、b、c分别是二次项系数、一次项系数和常数项。

## 二、图象与性质
二次函数的图象是一条抛物线。当a>0时，抛物线开口向上；当a<0时，抛物线开口向下。

**对称轴**：x=-b/(2a)
**顶点坐标**：(-b/(2a), (4ac-b²)/(4a))

## 三、顶点式
二次函数可以写成顶点式 y=a(x-h)²+k，其中(h,k)是顶点坐标。

## 四、判别式
判别式 Δ=b²-4ac：
- 当Δ>0时，方程有两个不等实根
- 当Δ=0时，方程有两个相等实根
- 当Δ<0时，方程无实根

## 五、应用
二次函数在物理运动学、经济学最值问题、工程优化中有广泛应用。`
    setTimeout(() => {
      const result = parseText(demoText, '二次函数（演示）.txt')
      dispatch({ type: 'SET_MATERIAL', payload: result })
      toast('演示教材已载入', 'success')
      setLoading(false)
    }, 400)
  }

  const reset = () => { dispatch({ type: 'SET_MATERIAL', payload: null }); setPasteText('') }

  const next = () => {
    if (!material) { toast('请先上传或粘贴教材', 'warning'); return }
    goStep(STEPS.WORKSPACE)
  }

  // 已解析，展示结果
  if (material) {
    return html`
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-2xl font-black text-ink">📚 教材解析结果</h2>
            <p className="text-sm text-gray-500 mt-0.5">${material.filename} · ${material.stats.chars} 字</p>
          </div>
          <div className="flex gap-2">
            <${Button} variant=${'ghost'} size=${'sm'} onClick=${reset}>重新上传</${Button}>
            <${Button} size=${'sm'} onClick=${next}>去讨论 →</${Button}>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          ${[
            { l: '章节', v: material.stats.sections, e: '📑', c: 'from-brand-500 to-purple-600' },
            { l: '概念', v: material.stats.concepts, e: '💡', c: 'from-accent-500 to-amber-500' },
            { l: '公式', v: material.stats.formulas, e: '🔢', c: 'from-blue-500 to-cyan-600' },
            { l: '术语', v: material.stats.terms, e: '📖', c: 'from-green-500 to-emerald-600' }
          ].map(s => html`
            <div key=${s.l} className="p-4 rounded-2xl bg-gradient-to-br ${s.c} text-white">
              <div className="text-2xl mb-1">${s.e}</div>
              <div className="text-3xl font-black">${s.v}</div>
              <div className="text-xs opacity-90">${s.l}</div>
            </div>
          `)}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <section className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="font-bold text-ink mb-3 flex items-center gap-2">📑 章节结构</h3>
            <div className="space-y-1 max-h-80 overflow-y-auto scrollbar-thin">
              ${material.structure.map((s, i) => html`
                <div key=${s.id} className="py-2 px-3 rounded-lg hover:bg-brand-50 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400">${'  '.repeat(s.level - 1)}L${s.level}</span>
                    <span className="text-sm font-medium text-ink">${s.title}</span>
                  </div>
                  ${s.content && html`<p className="text-xs text-gray-400 mt-1 line-clamp-2 pl-6">${s.content.slice(0, 80)}...</p>`}
                </div>
              `)}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="font-bold text-ink mb-3 flex items-center gap-2">💡 核心概念</h3>
            <div className="space-y-1.5 max-h-80 overflow-y-auto scrollbar-thin">
              ${material.concepts.slice(0, 15).map(c => html`
                <div key=${c.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-orange-50">
                  <div className="flex">${'★'.repeat(c.importance)}<span className="text-gray-200">${'★'.repeat(5 - c.importance)}</span></div>
                  <span className="text-sm font-medium text-ink">${c.name}</span>
                  <span className="text-xs text-gray-400 ml-auto truncate">${c.context}</span>
                </div>
              `)}
            </div>
          </section>

          ${material.formulas.length > 0 && html`
            <section className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="font-bold text-ink mb-3 flex items-center gap-2">🔢 识别公式</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
                ${material.formulas.map(f => html`
                  <div key=${f.id} className="p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                    <code className="text-sm text-blue-700 font-mono">$${f.latex}$</code>
                    <p className="text-xs text-gray-400 mt-1">${f.context}</p>
                  </div>
                `)}
              </div>
            </section>
          `}

          ${material.terms.length > 0 && html`
            <section className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="font-bold text-ink mb-3 flex items-center gap-2">📖 专业术语</h3>
              <div className="space-y-1.5 max-h-60 overflow-y-auto scrollbar-thin">
                ${material.terms.map(t => html`
                  <div key=${t.id} className="py-1.5 px-2 rounded-lg hover:bg-green-50">
                    <span className="text-sm font-bold text-ink">${t.term}</span>
                    <span className="text-xs text-gray-500 ml-2">${t.definition}</span>
                  </div>
                `)}
              </div>
            </section>
          `}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <${Button} variant=${'ghost'} onClick=${goPrev}>← 组队</${Button}>
          <${Button} onClick=${next} size=${'lg'}>团队就位，开始讨论 →</${Button}>
        </div>
      </div>
    `
  }

  // 上传界面
  return html`
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">📚</div>
        <h2 className="text-2xl font-black text-ink mb-1">把教材丢进来</h2>
        <p className="text-sm text-gray-500">AI团队等着分析你的教材，PDF/文本都行</p>
      </div>

      <div className="flex gap-2 p-1 bg-brand-50 rounded-2xl mb-5 max-w-xs mx-auto">
        <button onClick=${() => setPasteMode(false)} className="flex-1 py-2 rounded-xl text-sm font-bold ${!pasteMode ? 'bg-white text-brand-600 shadow' : 'text-gray-500'}">📁 上传文件</button>
        <button onClick=${() => setPasteMode(true)} className="flex-1 py-2 rounded-xl text-sm font-bold ${pasteMode ? 'bg-white text-brand-600 shadow' : 'text-gray-500'}">✍️ 粘贴文本</button>
      </div>

      ${!pasteMode ? html`
        <div onDragOver=${(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave=${() => setDragOver(false)}
          onDrop=${(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
          onClick=${() => fileInput.current?.click()}
          className="border-3 border-dashed ${dragOver ? 'border-brand-500 bg-brand-50' : 'border-gray-300 bg-white'} rounded-3xl p-12 text-center cursor-pointer transition-all hover:border-brand-400 hover:bg-brand-50/50">
          <input ref=${fileInput} type="file" accept=".pdf,.txt,.md,.markdown,.text" className="hidden"
            onChange=${(e) => handleFile(e.target.files[0])} />
          <div className="text-6xl mb-3 ${dragOver ? 'animate-bounce' : 'animate-float'}">📄</div>
          <p className="font-bold text-ink mb-1">${dragOver ? '松手就上传！' : '点击或拖拽文件到这里'}</p>
          <p className="text-xs text-gray-400">支持 PDF、TXT、Markdown · 单文件</p>
          ${progress && html`<div className="mt-4 text-sm text-brand-600">解析中... ${progress.page}/${progress.total} 页</div>`}
        </div>
      ` : html`
        <div className="space-y-3">
          <textarea value=${pasteText} onChange=${(e) => setPasteText(e.target.value)}
            placeholder="把教材内容粘贴到这里…（至少20字）"
            rows=${12}
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-brand-400 outline-none text-sm leading-relaxed resize-none"></textarea>
          <${Button} onClick=${handlePaste} className=${'w-full justify-center'} size=${'lg'} disabled=${pasteText.trim().length < 20}>解析文本</${Button}>
        </div>
      `}

      <div className="mt-6 text-center">
        <button onClick=${useDemo} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
          ⚡ 没有教材？载入演示教材（二次函数） →
        </button>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <${Button} variant=${'ghost'} onClick=${goPrev}>← 组队</${Button}>
        <${Button} variant=${'secondary'} onClick=${next} disabled=${!material}>去讨论 →</${Button}>
      </div>
    </div>
  `
}
