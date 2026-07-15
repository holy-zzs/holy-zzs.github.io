// 导出模块（任务8）：Markdown / JSON / PDF 导出

// 生成完整 Markdown 文档
export function buildMarkdown(doc) {
  if (!doc) return ''
  if (doc.rawMarkdown) return doc.rawMarkdown

  let md = `# ${doc.title || '游戏设计文档'}\n\n`
  md += `> 由"知识不进脑子啊"多智能体协作平台生成\n`
  md += `> 生成时间：${new Date(doc.meta?.generatedAt || Date.now()).toLocaleString('zh-CN')}\n\n`
  md += `---\n\n`

  if (doc.analysis) md += `## 一、教材分析摘要\n\n${doc.analysis}\n\n`
  if (doc.knowledgeGraph?.length) {
    md += `## 二、知识点图谱\n\n`
    md += doc.knowledgeGraph.join('\n') + '\n\n'
  }
  if (doc.gameDesign) {
    const g = doc.gameDesign
    md += `## 三、游戏设计方案\n\n`
    if (g.type || g.name) md += `### 3.1 游戏类型与名称\n\n类型：${g.type || '未指定'} | 名称：${g.name || '未指定'}\n\n`
    if (g.mechanics?.length) {
      md += `### 3.2 核心玩法机制\n\n`
      g.mechanics.forEach((m, i) => { md += `${i + 1}. ${m}\n` })
      md += '\n'
    }
    if (g.levels?.length) {
      md += `### 3.3 关卡设计\n\n`
      g.levels.forEach((lv, i) => { md += `#### 关卡${i + 1}：${lv.name || ''}\n${lv.detail || JSON.stringify(lv)}\n\n` })
    }
    if (g.difficulty) md += `### 3.4 难度递进\n\n${g.difficulty}\n\n`
  }
  if (doc.evaluation) md += `## 四、学习效果评估\n\n${doc.evaluation}\n\n`
  if (doc.userFlow) md += `## 五、用户操作流程\n\n${doc.userFlow}\n\n`
  md += `---\n\n*— 知识不进脑子啊 · 让AI把枯燥变有趣 —*\n`
  return md
}

// 生成结构化 JSON（符合预设数据规范）
export function buildJSON(doc) {
  const schema = {
    $schema: 'knb-game-design/v1',
    title: doc?.title || '游戏设计文档',
    generatedAt: doc?.meta?.generatedAt || new Date().toISOString(),
    platform: '知识不进脑子啊',
    analysis: doc?.analysis || '',
    knowledgeGraph: doc?.knowledgeGraph || [],
    gameDesign: {
      type: doc?.gameDesign?.type || '',
      name: doc?.gameDesign?.name || '',
      mechanics: doc?.gameDesign?.mechanics || [],
      levels: doc?.gameDesign?.levels || [],
      difficulty: doc?.gameDesign?.difficulty || ''
    },
    evaluation: doc?.evaluation || '',
    userFlow: doc?.userFlow || '',
    team: doc?.meta?.team || []
  }
  return JSON.stringify(schema, null, 2)
}

// 通用下载
export function downloadFile(filename, content, mime = 'text/plain') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// 导出 Markdown
export function exportMarkdown(doc) {
  const md = buildMarkdown(doc)
  const name = (doc?.title || '游戏设计文档').replace(/[\\/:*?"<>|]/g, '_')
  downloadFile(`${name}.md`, md, 'text/markdown')
}

// 导出 JSON
export function exportJSON(doc) {
  const json = buildJSON(doc)
  const name = (doc?.title || '游戏设计文档').replace(/[\\/:*?"<>|]/g, '_')
  downloadFile(`${name}.json`, json, 'application/json')
}

// 导出 PDF（通过打印窗口，完美支持中文）
export function exportPDF(doc) {
  const md = buildMarkdown(doc)
  const html = markdownToPrintHTML(md, doc?.title || '游戏设计文档')
  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) {
    alert('请允许弹出窗口以导出 PDF')
    return
  }
  win.document.write(html)
  win.document.close()
  setTimeout(() => {
    win.focus()
    win.print()
  }, 400)
}

// 简易 markdown → 打印用 HTML（含公式支持）
function markdownToPrintHTML(md, title) {
  // 转义
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // 表格（简易）
  html = html.replace(/^(\|.+\|)\n(\|[\s\-:|]+\|)\n((?:\|.+\|\n?)+)/gm, (match, header, sep, body) => {
    const hCells = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('')
    const rows = body.trim().split('\n').map(row => {
      const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('')
      return `<tr>${cells}</tr>`
    }).join('')
    return `<table><thead><tr>${hCells}</tr></thead><tbody>${rows}</tbody></table>`
  })

  // 标题
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')

  // 粗体、斜体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // 行内代码
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // 引用
  html = html.replace(/^&gt;\s?(.+)$/gm, '<blockquote>$1</blockquote>')

  // 分割线
  html = html.replace(/^---$/gm, '<hr>')

  // 有序列表
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
  // 无序列表
  html = html.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')

  // 段落（连续非标签行）
  html = html.replace(/^(?!<[hbltuot]|<tab)(.+)$/gm, '<p>$1</p>')

  // 公式占位（打印时用文字呈现）
  html = html.replace(/\$\$([^$]+)\$\$/g, '<div class="formula">$$ $1 $$</div>')
  html = html.replace(/\$([^$]+)\$/g, '<span class="formula">$ $1 $</span>')

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" defer></script>
<style>
  @page { margin: 20mm 18mm; }
  body { font-family: "PingFang SC","Microsoft YaHei",system-ui,sans-serif; line-height: 1.7; color: #1a1625; max-width: 760px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 26px; color: #c026d3; border-bottom: 3px solid #f0abfc; padding-bottom: 8px; }
  h2 { font-size: 21px; color: #a21caf; margin-top: 28px; border-left: 5px solid #d946ef; padding-left: 10px; }
  h3 { font-size: 17px; color: #86198f; margin-top: 20px; }
  h4 { font-size: 15px; color: #444; }
  blockquote { border-left: 4px solid #fb923c; background: #fff7ed; padding: 8px 14px; color: #6b7280; margin: 10px 0; }
  hr { border: none; border-top: 2px dashed #f0abfc; margin: 20px 0; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 14px; }
  th, td { border: 1px solid #e9d5ff; padding: 8px 10px; text-align: left; }
  th { background: #fdf4ff; color: #86198f; }
  tr:nth-child(even) td { background: #fffaff; }
  code { background: #fdf4ff; padding: 2px 6px; border-radius: 4px; font-size: 0.92em; color: #a21caf; }
  .formula { color: #c026d3; font-family: "Cambria Math",serif; font-style: italic; }
  li { margin: 4px 0; }
  p { margin: 8px 0; }
  @media print { body { max-width: none; } }
</style>
</head>
<body>
${html}
<script>
  window.onload = function() {
    if (window.renderMathInElement) {
      renderMathInElement(document.body, { delimiters: [{left: "$$", right: "$$", display: true}, {left: "$", right: "$", display: false}] });
    }
  };
</script>
</body>
</html>`
}
