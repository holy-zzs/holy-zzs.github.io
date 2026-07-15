// 教材解析模块（任务6）：PDF/文本解析、章节结构、概念/术语/公式识别
import { uid } from './storage.js'

// 动态加载 pdfjs（仅在解析 PDF 时）
// 使用 v4 — 原生 ESM 支持，worker 兼容性更好
async function loadPdfjs() {
  if (window.__pdfjs) return window.__pdfjs
  try {
    const pdfjs = await import('https://esm.sh/pdfjs-dist@4.0.379')
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs'
    window.__pdfjs = pdfjs
    return pdfjs
  } catch (e) {
    console.warn('pdfjs 加载失败', e)
    throw new Error('PDF 解析组件加载失败，请检查网络或改用文本粘贴。')
  }
}

// 主入口：解析上传的文件
export async function parseFile(file, onProgress) {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf')) {
    return parsePdf(file, onProgress)
  } else {
    // 文本类文件
    const text = await file.text()
    return parseText(text, file.name)
  }
}

// 解析 PDF
export async function parsePdf(file, onProgress) {
  const pdfjs = await loadPdfjs()
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  const numPages = pdf.numPages
  let fullText = ''

  for (let i = 1; i <= numPages; i++) {
    if (onProgress) onProgress(i, numPages)
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    // 按行拼接
    let lastY = null
    let lineText = ''
    const lines = []
    for (const item of content.items) {
      if (lastY !== null && Math.abs(item.transform[5] - lastY) > 2) {
        lines.push(lineText)
        lineText = ''
      }
      lineText += item.str
      lastY = item.transform[5]
    }
    if (lineText) lines.push(lineText)
    fullText += lines.join('\n') + '\n\n'
  }

  return parseText(fullText, file.name)
}

// 解析纯文本：提取章节/概念/公式/术语
export function parseText(rawText, filename = '教材.txt') {
  const text = rawText.replace(/\r\n/g, '\n').replace(/\u00a0/g, ' ')
  const structure = extractStructure(text)
  const concepts = extractConcepts(text)
  const formulas = extractFormulas(text)
  const terms = extractTerms(text)

  return {
    id: uid('mat'),
    filename,
    type: filename.toLowerCase().endsWith('.pdf') ? 'pdf' : 'text',
    rawText: text,
    structure,
    concepts,
    formulas,
    terms,
    stats: {
      chars: text.length,
      sections: structure.length,
      concepts: concepts.length,
      formulas: formulas.length,
      terms: terms.length
    },
    parsedAt: new Date().toISOString()
  }
}

// 章节结构提取
function extractStructure(text) {
  const structure = []
  const lines = text.split('\n')

  // 多种章节标题模式
  const patterns = [
    /^第[一二三四五六七八九十百零\d]+[章节篇部讲]/,      // 第X章/节
    /^\d+[\.\s、]\s*.+/,                                  // 1. / 1、
    /^\d+\.\d+[\.\s]?\s*.+/,                             // 1.1 / 1.1.
    /^#{1,6}\s+.+/,                                       // markdown #
    /^[一二三四五六七八九十]+[、\.]\s*.+/,                // 一、
    /^第[一二三四五六七八九十\d]+[章节]/                  // 重复保险
  ]

  let current = null
  let buffer = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    let matched = null
    let level = 0
    for (let i = 0; i < patterns.length; i++) {
      if (patterns[i].test(trimmed)) {
        matched = trimmed
        // 判断层级
        if (/^#\s/.test(trimmed)) level = 1
        else if (/^##\s/.test(trimmed)) level = 2
        else if (/^###\s/.test(trimmed)) level = 3
        else if (/^\d+\.\d+\.\d+/.test(trimmed)) level = 3
        else if (/^\d+\.\d+/.test(trimmed)) level = 2
        else if (/^第.+[篇部]/.test(trimmed)) level = 1
        else if (/^第.+[章讲]/.test(trimmed)) level = 1
        else if (/^第.+节/.test(trimmed)) level = 2
        else if (/^[一二三四五六七八九十]+[、\.]/.test(trimmed)) level = 2
        else level = 1
        break
      }
    }

    if (matched) {
      if (current) {
        current.content = buffer.join('\n').trim()
        structure.push(current)
      }
      current = { id: uid('sec'), level, title: matched.replace(/^#{1,6}\s*/, ''), content: '' }
      buffer = []
    } else if (current) {
      buffer.push(line)
    }
  }
  if (current) {
    current.content = buffer.join('\n').trim()
    structure.push(current)
  }

  // 如果没识别到结构，按段落切
  if (structure.length === 0) {
    const paras = text.split(/\n\s*\n/).filter(p => p.trim().length > 20)
    paras.slice(0, 10).forEach((p, i) => {
      structure.push({ id: uid('sec'), level: 1, title: `段落 ${i + 1}`, content: p.trim() })
    })
  }

  return structure.slice(0, 50) // 限制数量
}

// 概念提取
function extractConcepts(text) {
  const concepts = []
  const seen = new Set()

  // 1. 加粗/标记的概念 **xxx** 或 【xxx】 或 《xxx》
  const marked = text.match(/(?:\*\*|【|《)([^*】【》]{2,20})(?:\*\*|】|》)/g) || []
  for (const m of marked) {
    const name = m.replace(/\*\*|【|】|《|》/g, '')
    if (!seen.has(name) && name.length >= 2) {
      seen.add(name)
      concepts.push({ id: uid('con'), name, importance: 5, context: '文中标记' })
    }
  }

  // 2. 数学术语词典
  const mathTerms = ['函数', '方程', '不等式', '导数', '积分', '极限', '向量', '矩阵',
    '概率', '统计', '几何', '代数', '三角', '数列', '复数', '集合', '命题', '定理',
    '公理', '推论', '定义', '性质', '法则', '公式', '证明', '充要条件', '充分条件',
    '必要条件', '递增', '递减', '极值', '最值', '单调', '奇偶', '周期', '对称',
    '抛物线', '椭圆', '双曲线', '直线', '圆', '切线', '法线', '斜率', '截距',
    '顶点', '焦点', '准线', '离心率', '渐近线', '参数', '系数', '常数', '变量',
    '牛顿', '莱布尼茨', '泰勒', '傅里叶', '线性', '非线性', '离散', '连续']
  for (const term of mathTerms) {
    const regex = new RegExp(term, 'g')
    const matches = text.match(regex)
    if (matches && matches.length >= 2 && !seen.has(term)) {
      seen.add(term)
      // 找上下文
      const idx = text.indexOf(term)
      const ctx = text.slice(Math.max(0, idx - 20), idx + term.length + 20).replace(/\n/g, ' ')
      concepts.push({ id: uid('con'), name: term, importance: Math.min(matches.length, 5), context: ctx })
    }
  }

  // 3. 高频名词短语（连续2-4个汉字，排除标点）
  const freq = {}
  const tokens = text.match(/[\u4e00-\u9fa5]{2,6}/g) || []
  for (const t of tokens) {
    // 过滤常见无意义词
    if (/^(的|了|和|与|或|及|在|为|是|有|可|以|对|从|到|把|被|让|使|这|那|一|个|些|等|之|其|它|他|她|我|你|们|着|过|将|已|正|将|要|会|能|应|该|需|须|并|且|而|则|故|若|如|倘|假|设|令|使|得|即|便|遂|就|还|只|仅|唯|凡|皆|俱|都|总|必|定|确|显|明|隐|暗|上|下|中|内|外|前|后|左|右|间|旁|侧|边|处|所|地|点|面|方|向|部|端|头|尾|始|终|初|末|本|原|源|流|变|化|生|成|形|状|态|势|样|式|型|类|种|个|项|条|件|素|因|果|原|理|由|缘|故|故|事|情|况|形|景|象|表|现|显|示|表|达|述|说|讲|谈|论|议|评|析|分|解|合|综|概|括|总|结|推|断|决|策|选|择|挑|拣|找|寻|搜|探|测|试|验|证|明|确|认|识|知|觉|感|触|想|思|考|虑|谋|划|计|算|数|量|度|尺|衡|平|均|比|例|率|数|值|符|号|码|字|词|句|段|章|节|篇|卷|册|书|本|页|行|列|排|序|顺|逆|正|反|相|互|交|替|更|迭|重|复|循|环|往|返|来|去|进|出|升|降|浮|沉|起|伏|动|静|行|止|息|停|续|断|绝|通|达|至|极|尽|穷|竭|满|空|虚|实|真|假|伪|善|恶|美|丑|好|坏|优|劣|高|低|长|短|大|小|多|少|厚|薄|深|浅|宽|窄|粗|细|快|慢|迟|早|先|后|始|末|初|终|本|末|主|次|重|轻|急|缓|难|易|繁|简|杂|纯|清|浊|混|同|异|似|像|差|别|区|分|合|聚|散|离|合|聚|散|离)+$/.test(t)) continue
    freq[t] = (freq[t] || 0) + 1
  }
  const topTokens = Object.entries(freq).filter(([k, v]) => v >= 3 && !seen.has(k)).sort((a, b) => b[1] - a[1]).slice(0, 15)
  for (const [name, count] of topTokens) {
    seen.add(name)
    concepts.push({ id: uid('con'), name, importance: Math.min(count, 5), context: `出现${count}次` })
  }

  return concepts.sort((a, b) => b.importance - a.importance).slice(0, 30)
}

// 公式提取
function extractFormulas(text) {
  const formulas = []
  const seen = new Set()

  // 1. $...$ 和 $$...$$ （LaTeX）
  const latexMatches = text.match(/\$\$?[^$]+\$\$?/g) || []
  for (const m of latexMatches) {
    const latex = m.replace(/\$\$/g, '').replace(/\$/g, '').trim()
    if (latex && !seen.has(latex) && latex.length < 100) {
      seen.add(latex)
      const idx = text.indexOf(m)
      const ctx = text.slice(Math.max(0, idx - 30), idx + m.length + 30).replace(/\n/g, ' ')
      formulas.push({ id: uid('fml'), latex, context: ctx })
    }
  }

  // 2. 常见数学公式模式 y=, f(x)=, 等式
  const eqPatterns = [
    /[yYfFgG]\s*=\s*[a-zA-Z0-9\+\-\*\/\^\(\)\|\[\]\{\}\s\\,\.]{2,60}/g,
    /[a-zA-Z]+\s*=\s*[a-zA-Z0-9\+\-\*\/\^\(\)\|\[\]\{\}\s\\,\.]{2,60}/g
  ]
  for (const p of eqPatterns) {
    const matches = text.match(p) || []
    for (const m of matches) {
      const clean = m.trim()
      // 必须包含 = 且两边有内容
      if (!clean.includes('=')) continue
      if (seen.has(clean)) continue
      if (clean.length < 4 || clean.length > 80) continue
      // 排除纯文字句子
      if (!/[a-zA-Z0-9^]/.test(clean)) continue
      seen.add(clean)
      formulas.push({ id: uid('fml'), latex: clean, context: '识别的等式' })
    }
    if (formulas.length >= 15) break
  }

  return formulas.slice(0, 20)
}

// 术语提取
function extractTerms(text) {
  const terms = []
  const seen = new Set()

  // 英文术语（首字母大写词组或全大写缩写）
  const enTerms = text.match(/[A-Z][a-zA-Z]{2,}/g) || []
  const enFreq = {}
  for (const t of enTerms) {
    enFreq[t] = (enFreq[t] || 0) + 1
  }
  for (const [term, count] of Object.entries(enFreq).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
    if (!seen.has(term)) {
      seen.add(term)
      terms.push({ id: uid('trm'), term, definition: `出现${count}次` })
    }
  }

  // "XXX：YYY" 或 "XXX是YYY" 形式的定义
  const defs = text.match(/[【《]?([\u4e00-\u9fa5A-Za-z]{2,12})[】》]?[：:]\s*(.{5,60})/g) || []
  for (const d of defs.slice(0, 15)) {
    const m = d.match(/[【《]?([\u4e00-\u9fa5A-Za-z]{2,12})[】》]?[：:]\s*(.{5,60})/)
    if (m && !seen.has(m[1])) {
      seen.add(m[1])
      terms.push({ id: uid('trm'), term: m[1], definition: m[2].trim() })
    }
  }

  return terms.slice(0, 20)
}

// 简化教材为 AI 输入的摘要
export function summarizeMaterial(material) {
  if (!material) return ''
  const top = (material.concepts || []).slice(0, 8).map(c => c.name).join('、')
  const fmls = (material.formulas || []).slice(0, 5).map(f => f.latex).join('、')
  return `主题：${material.structure?.[0]?.title || material.filename}\n核心概念：${top}\n核心公式：${fmls}\n前1500字：${(material.rawText || '').slice(0, 1500)}`
}
