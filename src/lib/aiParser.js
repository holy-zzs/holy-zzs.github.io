// AI 驱动的教材解析模块
// 流程：pdfjs 提取文本 → LLM API 智能分析 → 返回结构化教材数据
// 支持大教材分块处理，demo 模式自动降级到启发式解析
import { uid } from './storage.js'
import { parseText } from './parser.js'

// ════════════════════════════════════════════════
// 配置常量
// ════════════════════════════════════════════════
const CHUNK_THRESHOLD = 6000   // 超过此字数则分块
const MAX_CHUNKS = 4           // 最多分 4 块（控制 API 调用次数）
const API_TIMEOUT = 60000      // 单次 API 调用超时 60s

// ════════════════════════════════════════════════
// 主入口：用 LLM 分析教材文本
// settings: 全局 settings 对象（含 engineMode, apiKey 等）
// onProgress: 可选回调 (stage, detail) => void
// options: { numPages?, fileSize? } — PDF 元数据，用于扫描版检测
// ════════════════════════════════════════════════
export async function analyzeWithLLM(rawText, filename, settings, onProgress, options = {}) {
  const text = rawText.replace(/\r\n/g, '\n').replace(/\u00a0/g, ' ')
  const mode = resolveEngineMode(settings)
  const warnings = []

  // ── 后端 OCR 信息 ──
  if (options.ocrUsed) {
    warnings.push({
      type: 'ocr_info',
      title: '已通过后端 OCR 识别扫描版 PDF',
      detail: `共 ${options.numPages} 页，后端 PaddleOCR 已完成文字识别。`,
    })
  }

  // ── 后端错误信息（如果后端调用失败）──
  if (options.backendError) {
    const be = options.backendError
    let title = '后端 PDF 服务不可用，已降级到浏览器解析'
    let detail = be.message || '未知错误'
    if (be.type === 'mixed_content') {
      title = 'HTTPS 页面无法调用 HTTP 后端（混合内容拦截）'
      detail = '当前网站是 HTTPS，后端 API 是 HTTP，浏览器已拦截请求。请在本地 HTTP 环境（localhost）使用上传功能，或改用文本粘贴模式。'
    }
    warnings.push({ type: 'backend_error', title, detail })
  }

  // ── 扫描版 PDF 检测（仅在后端未使用 OCR 时检查）──
  if (!options.ocrUsed && options.numPages && options.numPages > 3) {
    const charsPerPage = text.length / options.numPages
    if (charsPerPage < 50) {
      warnings.push({
        type: 'scanned_pdf',
        title: '此PDF可能是扫描版/图片版',
        detail: `共 ${options.numPages} 页，仅提取到 ${text.length} 字（平均 ${charsPerPage.toFixed(0)} 字/页）。${options.backendUsed === false ? '浏览器 pdfjs 无法从图片中提取文字。' : ''}请确保后端 PDF 服务正常运行以启用 OCR，或改用文本粘贴模式。`,
      })
    } else if (charsPerPage < 200) {
      warnings.push({
        type: 'low_text',
        title: 'PDF文本提取量偏少',
        detail: `共 ${options.numPages} 页，提取到 ${text.length} 字。可能是部分扫描页或含有大量图片。`,
      })
    }
  }

  // ── 文本过短检测 ──
  if (text.trim().length < 50) {
    warnings.push({
      type: 'empty_text',
      title: '提取到的文本内容极少',
      detail: `仅提取到 ${text.trim().length} 字，无法进行有效分析。请检查文件内容或改用文本粘贴模式。`,
    })
  }

  // demo 模式：用启发式解析，但标记为 demo
  if (mode === 'demo') {
    onProgress?.('fallback', 'Demo 模式，使用本地解析')
    const result = parseText(rawText, filename)
    result.analyzedBy = 'demo'
    result.warnings = warnings
    if (warnings.length === 0) {
      warnings.push({
        type: 'demo_mode',
        title: '当前为演示模式，未启用 AI 分析',
        detail: 'AI 引擎尚未配置 API Key，使用的是本地启发式解析（效果有限）。请在右上角设置中配置 API Key 以启用 AI 智能分析。',
      })
    }
    return result
  }

  // ── 文本太短时，LLM 也无法有效分析 ──
  if (text.trim().length < 50) {
    onProgress?.('fallback', '文本内容过少，跳过 AI 分析')
    const result = parseText(rawText, filename)
    result.analyzedBy = 'heuristic'
    result.warnings = warnings
    return result
  }

  try {
    onProgress?.('preparing', '准备教材内容...')

    // 分块
    const chunks = splitIntoChunks(text, CHUNK_THRESHOLD, MAX_CHUNKS)
    const useChunking = chunks.length > 1

    if (useChunking) {
      onProgress?.('chunking', `教材较大（${text.length}字），分为 ${chunks.length} 块分析`)
    } else {
      onProgress?.('analyzing', 'AI 正在分析教材内容...')
    }

    let mergedResult

    if (useChunking) {
      // 分块调用 LLM，合并结果
      const partialResults = []
      for (let i = 0; i < chunks.length; i++) {
        onProgress?.('analyzing', `AI 正在分析第 ${i + 1}/${chunks.length} 块...`)
        const result = await callLLMForChunk(chunks[i], settings, i, chunks.length)
        partialResults.push(result)
      }
      onProgress?.('merging', '合并分析结果...')
      mergedResult = mergeResults(partialResults, text, filename)
    } else {
      // 单次调用
      const llmResponse = await callLLMForChunk(text, settings, 0, 1)
      mergedResult = buildMaterialFromLLM(llmResponse, text, filename)
    }

    onProgress?.('done', 'AI 分析完成')
    mergedResult.warnings = warnings
    return mergedResult

  } catch (e) {
    console.warn('LLM 分析失败，降级到本地解析:', e)
    onProgress?.('fallback', `AI 分析失败（${e.message}），使用本地解析`)
    const result = parseText(rawText, filename)
    result.analyzedBy = 'heuristic'
    result.warnings = warnings
    warnings.push({
      type: 'llm_failed',
      title: 'AI 分析失败，已降级到本地解析',
      detail: `错误信息：${e.message}。请检查 API Key 和网络连接。`,
    })
    return result
  }
}

// ════════════════════════════════════════════════
// 引擎模式解析（与 aiAdapter.js 一致）
// ════════════════════════════════════════════════
function resolveEngineMode(settings) {
  if (settings?.engineMode) return settings.engineMode
  return settings?.useMock === false ? 'apikey' : 'demo'
}

// ════════════════════════════════════════════════
// 文本分块：在自然边界处切割
// ════════════════════════════════════════════════
function splitIntoChunks(text, threshold, maxChunks) {
  if (text.length <= threshold) return [text]

  const targetSize = Math.ceil(text.length / maxChunks)
  const chunks = []
  let start = 0

  while (start < text.length && chunks.length < maxChunks - 1) {
    let end = Math.min(start + targetSize, text.length)

    // 在 end 附近找自然断点（双换行、章节标题）
    if (end < text.length) {
      const searchRange = text.slice(end - 200, end + 200)
      // 优先在章节标题处断开
      const chapterMatch = searchRange.match(/\n(第[一二三四五六七八九十\d]+[章节篇部])/)
      if (chapterMatch) {
        end = end - 200 + chapterMatch.index + 1
      } else {
        // 其次在段落断开
        const paraMatch = searchRange.match(/\n\s*\n/)
        if (paraMatch) {
          end = end - 200 + paraMatch.index + paraMatch[0].length
        }
      }
    }

    chunks.push(text.slice(start, end).trim())
    start = end
  }

  if (start < text.length) {
    chunks.push(text.slice(start).trim())
  }

  return chunks.filter(c => c.length > 0)
}

// ════════════════════════════════════════════════
// 调用 LLM 分析一块教材文本
// 返回 LLM 解析后的 JSON 对象
// ════════════════════════════════════════════════
async function callLLMForChunk(textChunk, settings, chunkIndex, totalChunks) {
  const messages = buildAnalysisMessages(textChunk, chunkIndex, totalChunks)
  const responseText = await callLLM(messages, settings)
  return parseLLMResponse(responseText)
}

// ════════════════════════════════════════════════
// 构建 LLM 分析 prompt
// ════════════════════════════════════════════════
function buildAnalysisMessages(textChunk, chunkIndex, totalChunks) {
  const chunkHint = totalChunks > 1
    ? `（这是教材的第 ${chunkIndex + 1}/${totalChunks} 部分，请只分析这部分内容）`
    : ''

  const systemPrompt = `你是一位专业的教材分析专家。请分析给定的教材文本，提取结构化信息。

要求：
1. 识别章节结构（章节标题、层级关系）
2. 提取核心概念（每个概念附带重要性评分 1-5 和简短上下文）
3. 识别数学/物理/化学公式（提取公式表达式和简要说明）
4. 提取关键术语

请严格按照以下 JSON 格式返回，不要包含任何其他文本：
{
  "structure": [
    {"level": 1, "title": "第一章 力学", "content": "本章讲述力学基本概念..."},
    {"level": 2, "title": "1.1 牛顿第一定律", "content": "惯性定律的表述..."}
  ],
  "concepts": [
    {"name": "牛顿第二定律", "importance": 5, "context": "F=ma，描述力与加速度的关系"}
  ],
  "formulas": [
    {"latex": "F = ma", "description": "牛顿第二定律"}
  ],
  "terms": ["惯性", "质量", "加速度"]
}

注意：
- structure 的 level：1=章/大节，2=小节，3=更细分
- concepts 的 importance：5=核心概念，3=重要，1=一般
- formulas 的 latex 用纯文本表达公式（如 "F = ma", "PV = nRT"）
- 只返回 JSON，不要有前后缀说明`

  const userPrompt = `请分析以下教材文本${chunkHint}：

${textChunk}`

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]
}

// ════════════════════════════════════════════════
// 调用 LLM API（非流式）
// 根据 engineMode 选择调用路径
// ════════════════════════════════════════════════
async function callLLM(messages, settings) {
  const mode = resolveEngineMode(settings)

  if (mode === 'demo') {
    throw new Error('Demo 模式不支持 LLM 分析')
  }

  const requestBody = {
    model: settings.apiModel || settings.bridgeModel || 'auto',
    messages,
    stream: false,
    temperature: 0.3,  // 低温度，确保结构化输出
    max_tokens: 4000,
  }

  let resp

  if (mode === 'localbridge') {
    const bridgeUrl = (settings.bridgeUrl || 'http://localhost:19820').replace(/\/$/, '')
    resp = await fetch(`${bridgeUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(settings.apiKey ? { 'x-api-key': settings.apiKey } : {}),
        ...(settings.apiBase ? { 'x-api-base': settings.apiBase } : {}),
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(API_TIMEOUT),
    })
  } else {
    // apikey 模式：优先尝试同源代理（生产环境），失败则直连 API（本地开发）
    const directUrl = `${(settings.apiBase || '').replace(/\/+$/, '')}/chat/completions`
    const directBody = JSON.stringify(requestBody)
    const directHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`,
    }

    try {
      // 先试同源代理（5秒超时）
      resp = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': settings.apiKey,
          'x-api-base': settings.apiBase,
        },
        body: directBody,
        signal: AbortSignal.timeout(5000),
      })
      // 代理返回 404/500 等错误状态码 → 本地开发环境没有此路由，直连 API
      if (!resp.ok && (resp.status === 404 || resp.status >= 500)) {
        console.log(`同源代理返回 ${resp.status}，直连 API...`)
        resp = await fetch(directUrl, {
          method: 'POST',
          headers: directHeaders,
          body: directBody,
          signal: AbortSignal.timeout(API_TIMEOUT),
        })
      }
    } catch (proxyErr) {
      // 同源代理网络不通，直接调用 API
      console.log('同源代理不可用，直连 API:', proxyErr.message)
      resp = await fetch(directUrl, {
        method: 'POST',
        headers: directHeaders,
        body: directBody,
        signal: AbortSignal.timeout(API_TIMEOUT),
      })
    }
  }

  if (!resp.ok) {
    let errMsg = `API 返回 ${resp.status}`
    try {
      const errBody = await resp.json()
      errMsg = errBody.error?.message || errBody.error || errMsg
    } catch {}
    throw new Error(errMsg)
  }

  const data = await resp.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('API 返回空内容')
  return content
}

// ════════════════════════════════════════════════
// 解析 LLM 返回的 JSON
// 容错处理：提取 JSON 部分，处理格式不规范的情况
// ════════════════════════════════════════════════
function parseLLMResponse(text) {
  // 尝试直接解析
  try {
    return JSON.parse(text)
  } catch {}

  // 尝试提取 JSON 块（可能被 ```json ... ``` 包裹）
  const jsonBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonBlock) {
    try {
      return JSON.parse(jsonBlock[1].trim())
    } catch {}
  }

  // 尝试提取第一个 { 到最后一个 } 的内容
  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1))
    } catch {}
  }

  throw new Error('无法解析 LLM 返回的 JSON')
}

// ════════════════════════════════════════════════
// 从 LLM 分析结果构建 material 对象
// ════════════════════════════════════════════════
function buildMaterialFromLLM(llmData, rawText, filename) {
  const structure = (llmData.structure || []).map(s => ({
    id: uid('sec'),
    level: s.level || 1,
    title: s.title || '未命名',
    content: s.content || '',
  }))

  const concepts = (llmData.concepts || []).map(c => ({
    id: uid('con'),
    name: c.name || '',
    importance: Math.max(1, Math.min(5, c.importance || 3)),
    context: c.context || '',
  }))

  const formulas = (llmData.formulas || []).map(f => ({
    id: uid('fml'),
    latex: f.latex || f.formula || '',
    context: f.description || f.context || '',
  }))

  const terms = (llmData.terms || []).map((t, i) => ({
    id: uid('trm'),
    term: typeof t === 'string' ? t : (t.term || t.name || ''),
    definition: typeof t === 'string' ? '' : (t.definition || t.context || ''),
  })).filter(t => t.term)

  return {
    id: uid('mat'),
    filename,
    type: filename.toLowerCase().endsWith('.pdf') ? 'pdf' : 'text',
    rawText,
    structure,
    concepts,
    formulas,
    terms,
    stats: {
      chars: rawText.length,
      sections: structure.length,
      concepts: concepts.length,
      formulas: formulas.length,
      terms: terms.length,
    },
    parsedAt: new Date().toISOString(),
    analyzedBy: 'llm',
  }
}

// ════════════════════════════════════════════════
// 合并多个分块的分析结果
// ════════════════════════════════════════════════
function mergeResults(partialResults, rawText, filename) {
  const allStructure = []
  const allConcepts = []
  const allFormulas = []
  const allTerms = []
  const seenConcepts = new Set()
  const seenFormulas = new Set()
  const seenTerms = new Set()

  for (const result of partialResults) {
    // 合并结构
    if (result.structure) {
      allStructure.push(...result.structure.map(s => ({
        id: uid('sec'),
        level: s.level || 1,
        title: s.title || '未命名',
        content: s.content || '',
      })))
    }

    // 合并概念（去重）
    if (result.concepts) {
      for (const c of result.concepts) {
        const name = c.name || ''
        if (name && !seenConcepts.has(name)) {
          seenConcepts.add(name)
          allConcepts.push({
            id: uid('con'),
            name,
            importance: Math.max(1, Math.min(5, c.importance || 3)),
            context: c.context || '',
          })
        }
      }
    }

    // 合并公式（去重）
    if (result.formulas) {
      for (const f of result.formulas) {
        const latex = f.latex || f.formula || ''
        if (latex && !seenFormulas.has(latex)) {
          seenFormulas.add(latex)
          allFormulas.push({
            id: uid('fml'),
            latex,
            context: f.description || f.context || '',
          })
        }
      }
    }

    // 合并术语（去重）
    if (result.terms) {
      for (const t of result.terms) {
        const term = typeof t === 'string' ? t : (t.term || t.name || '')
        if (term && !seenTerms.has(term)) {
          seenTerms.add(term)
          allTerms.push({
            id: uid('trm'),
            term,
            definition: typeof t === 'string' ? '' : (t.definition || t.context || ''),
          })
        }
      }
    }
  }

  return {
    id: uid('mat'),
    filename,
    type: filename.toLowerCase().endsWith('.pdf') ? 'pdf' : 'text',
    rawText,
    structure: allStructure,
    concepts: allConcepts.sort((a, b) => b.importance - a.importance),
    formulas: allFormulas,
    terms: allTerms,
    stats: {
      chars: rawText.length,
      sections: allStructure.length,
      concepts: allConcepts.length,
      formulas: allFormulas.length,
      terms: allTerms.length,
    },
    parsedAt: new Date().toISOString(),
    analyzedBy: 'llm',
  }
}

// ════════════════════════════════════════════════
// PDF 后端服务配置
// 优先调用后端 API（PyMuPDF + PaddleOCR），降级到浏览器 pdfjs
// ════════════════════════════════════════════════
const PDF_SERVER_URL = 'http://101.35.114.5:8000'
// 动态超时：基础120s + 每MB加3s，最高600s（10分钟，覆盖大文件上传+OCR）
function getPdfServerTimeout(fileSize) {
  const sizeMB = (fileSize || 0) / 1024 / 1024
  return Math.min(120000 + sizeMB * 3000, 600000)
}

// 检测后端服务是否在线
export async function checkPdfServer() {
  try {
    const resp = await fetch(`${PDF_SERVER_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    })
    if (resp.ok) {
      const data = await resp.json()
      return { online: true, ...data }
    }
    return { online: false }
  } catch {
    return { online: false }
  }
}

// ════════════════════════════════════════════════
// 导出文本提取函数（供 UploadPage 直接使用）
// 优先调用后端 API（支持 OCR），降级到浏览器 pdfjs
// 返回 { text, numPages, ocrUsed?, backendUsed }
// ════════════════════════════════════════════════
export async function extractPdfText(file, onProgress) {
  // ── 优先尝试后端 API（PyMuPDF + PaddleOCR）──
  const timeout = getPdfServerTimeout(file.size)

  // 检查混合内容问题（HTTPS 页面调用 HTTP API）
  if (location.protocol === 'https:' && PDF_SERVER_URL.startsWith('http://')) {
    console.warn('混合内容拦截: HTTPS 页面无法调用 HTTP 后端 API')
    return extractPdfTextLocal(file, onProgress, {
      type: 'mixed_content',
      message: '当前页面是 HTTPS，后端 API 是 HTTP，浏览器已拦截。请在本地 HTTP 环境使用，或用文本粘贴模式。',
    })
  }

  try {
    onProgress?.(0, 1)
    const formData = new FormData()
    formData.append('file', file)

    const resp = await fetch(`${PDF_SERVER_URL}/parse-pdf`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(timeout),
    })

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}))
      throw new Error(err.detail || `后端返回 ${resp.status}`)
    }

    const data = await resp.json()
    onProgress?.(data.numPages, data.numPages)

    return {
      text: data.text,
      numPages: data.numPages,
      ocrUsed: data.ocrUsed,
      backendUsed: true,
      avgCharsPerPage: data.avgCharsPerPage,
    }
  } catch (backendErr) {
    // ── 降级到浏览器 pdfjs ──
    console.warn('后端 PDF 服务不可用，降级到浏览器 pdfjs:', backendErr.message)
    return extractPdfTextLocal(file, onProgress, {
      type: 'backend_error',
      message: backendErr.message,
    })
  }
}

// 浏览器端 pdfjs 提取（降级方案，不支持 OCR）
async function extractPdfTextLocal(file, onProgress, backendError = null) {
  if (!window.__pdfjs) {
    try {
      const pdfjs = await import('https://esm.sh/pdfjs-dist@4.0.379')
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs'
      window.__pdfjs = pdfjs
    } catch (e) {
      throw new Error('PDF 解析组件加载失败：' + e.message + '。后端服务也不可用。')
    }
  }

  const pdfjs = window.__pdfjs
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  const numPages = pdf.numPages
  let fullText = ''

  for (let i = 1; i <= numPages; i++) {
    if (onProgress) onProgress(i, numPages)
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
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

  return { text: fullText, numPages, backendUsed: false, backendError }
}
