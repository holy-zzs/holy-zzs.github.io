// 方案预览与导出界面（任务8）
import { html, useState, useMemo } from '../../react.js'
import { useApp, STEPS } from '../../store/appContext.js'
import { Button, EmptyState, MarkdownView } from '../common/ui.js'
import { exportMarkdown, exportJSON, exportPDF, buildMarkdown } from '../../lib/exporter.js'
import { getAgent } from '../../data/agents.js'

const SECTIONS = [
  { id: 'analysis', label: '教材分析', emoji: '📚' },
  { id: 'graph', label: '知识点图谱', emoji: '🧠' },
  { id: 'design', label: '游戏设计', emoji: '🎮' },
  { id: 'eval', label: '学习效果', emoji: '🫠' },
  { id: 'flow', label: '用户流程', emoji: '🗺️' }
]

export default function PreviewView() {
  const { state, dispatch, toast, goStep, goPrev } = useApp()
  const doc = state.designDoc
  const [activeSection, setActiveSection] = useState('analysis')
  const [showRaw, setShowRaw] = useState(false)

  const teamAgents = (doc?.meta?.team || state.selectedAgents || []).map(getAgent).filter(Boolean)

  const md = useMemo(() => buildMarkdown(doc), [doc])

  if (!doc) {
    return html`
      <${EmptyState}
        emoji=${'🎁'}
        title=${'还没有生成方案'}
        desc=${'先去讨论工作台，让AI团队协作生成游戏设计文档'}
        action=${html`<${Button} onClick=${() => goStep(STEPS.WORKSPACE)}>去讨论工作台 →</${Button}>`}
      />
    `
  }

  const doExport = (type) => {
    try {
      if (type === 'md') { exportMarkdown(doc); toast('Markdown 已导出', 'success') }
      else if (type === 'json') { exportJSON(doc); toast('JSON 已导出', 'success') }
      else if (type === 'pdf') { exportPDF(doc); toast('正在打开打印窗口，选择"另存为PDF"', 'info') }
    } catch (e) {
      toast('导出失败：' + e.message, 'error')
    }
  }

  const restart = () => {
    dispatch({ type: 'SET_DOC', payload: null })
    dispatch({ type: 'RESET_DISCUSSION' })
    goStep(STEPS.WORKSPACE)
  }

  // 统计
  const stats = [
    { l: '游戏类型', v: doc.gameDesign?.type || '未指定', e: '🎮' },
    { l: '关卡数', v: (doc.gameDesign?.levels?.length || 0) || '3+', e: '🧩' },
    { l: '知识点', v: doc.knowledgeGraph?.length || 0, e: '💡' },
    { l: '团队', v: teamAgents.length, e: '🤖' }
  ]

  return html`
    <div class="space-y-4" style=${{ background: 'transparent' }}>
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 class="text-2xl font-black text-ink flex items-center gap-2">
            🎁 ${doc.title || '游戏设计文档'}
          </h2>
          <p class="text-sm text-gray-500 mt-0.5">
            由 ${teamAgents.map(a => `${a.emoji}${a.name}`).join(' · ')} 协作生成
          </p>
        </div>
        <div class="flex gap-2">
          <${Button} variant=${'secondary'} size=${'sm'} onClick=${() => doExport('md')}>📝 Markdown</${Button}>
          <${Button} variant=${'secondary'} size=${'sm'} onClick=${() => doExport('json')}>📊 JSON</${Button}>
          <${Button} variant=${'secondary'} size=${'sm'} onClick=${() => doExport('pdf')}>📄 PDF</${Button}>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        ${stats.map(s => html`
          <div key=${s.l} class="p-4 rounded-2xl bg-white border border-gray-100 text-center">
            <div class="text-2xl mb-1">${s.e}</div>
            <div class="text-lg font-black text-ink">${s.v}</div>
            <div class="text-xs text-gray-400">${s.l}</div>
          </div>
        `)}
      </div>

      <div class="grid lg:grid-cols-4 gap-4">
        <aside class="lg:col-span-1">
          <div class="bg-white rounded-2xl border border-gray-100 p-2 lg:sticky lg:top-24">
            <nav class="space-y-1">
              ${SECTIONS.map(s => html`
                <button key=${s.id} onClick=${() => { setActiveSection(s.id); setShowRaw(false) }}
                  class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${activeSection === s.id && !showRaw ? '' : 'text-gray-600 hover:bg-gray-50'}"
                  style=${activeSection === s.id && !showRaw ? { background: 'rgba(167,139,250,0.1)', color: '#a78bfa' } : {}}>
                  <span>${s.emoji}</span><span>${s.label}</span>
                </button>
              `)}
              <button onClick=${() => setShowRaw(true)} class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${showRaw ? '' : 'text-gray-600 hover:bg-gray-50'}"
                style=${showRaw ? { background: 'rgba(167,139,250,0.1)', color: '#a78bfa' } : {}}>
                <span>📃</span><span>原始Markdown</span>
              </button>
            </nav>
          </div>
        </aside>

        <div class="lg:col-span-3">
          <div class="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 min-h-[500px]">
            ${showRaw ? html`
              <pre class="text-xs font-mono text-gray-600 whitespace-pre-wrap leading-relaxed">${md}</pre>
            ` : html`
              <div class="prose prose-sm max-w-none">
                <${MarkdownView} content=${md} />
              </div>
            `}
          </div>

          <div class="mt-4 rounded-2xl p-4" style=${{ background: 'linear-gradient(135deg, rgba(167,139,250,0.08), rgba(245,166,35,0.06))' }}>
            <h3 class="text-sm font-bold text-ink mb-2">🤖 协作团队</h3>
            <div class="flex flex-wrap gap-2">
              ${teamAgents.map(a => html`
                <div key=${a.id} class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white text-xs">
                  <span>${a.emoji}</span>
                  <span class="font-medium text-ink">${a.name}</span>
                  <span class="text-gray-400">${a.title.split('·')[0].trim()}</span>
                </div>
              `)}
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center pt-3 border-t border-gray-100">
        <${Button} variant=${'ghost'} onClick=${goPrev}>← 讨论工作台</${Button}>
        <div class="flex gap-2">
          <${Button} variant=${'secondary'} onClick=${restart}>🔄 重新讨论</${Button}>
          <${Button} onClick=${() => { toast('已保存到本地，可随时回来查看', 'success'); goStep(STEPS.PROJECTS) }}>完成 ✨</${Button}>
        </div>
      </div>

      <div class="rounded-2xl p-4 text-xs" style=${{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', color: '#F5A623' }}>
        <p class="font-bold mb-1">📦 导出说明</p>
        <ul class="space-y-0.5 list-disc list-inside">
          <li><b>Markdown</b>：标准 .md 文件，可直接交给开发者或导入文档工具</li>
          <li><b>JSON</b>：结构化数据（符合 knb-game-design/v1 规范），可用于程序化处理</li>
          <li><b>PDF</b>：通过浏览器打印窗口导出，选择"另存为PDF"，完美支持中文和公式</li>
        </ul>
      </div>
    </div>
  `
}
