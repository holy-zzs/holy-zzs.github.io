// modelscopeClient.js — CamScanner PDF→Markdown 旁路客户端
// 仅在 PDF 超过 200 页（MinerU 上限）时使用
// CVM 8006 代理直接调用 CamScanner 云端 API (https://ai-tools.camscanner.com)
// 无页数限制、支持 OCR 扫描版、7×24 在线

const CVM_HTTP = 'http://101.35.114.5:8006'
const CVM_HTTPS = 'https://101.35.114.5:9006'  // HTTPS 代理（待部署）

export function buildModelscopeApiBase() {
  if (typeof location !== 'undefined' && location.protocol === 'https:') {
    // HTTPS 页面：优先用 HTTPS 代理，若未部署则降级到 Vercel serverless 代理
    return CVM_HTTPS
  }
  // HTTP 页面（含 localhost dev）直连 CVM
  return CVM_HTTP
}

// ────────────────────────────────────────────────
// 检查 CamScanner 代理是否在线
// ────────────────────────────────────────────────
export async function checkModelscopeOnline() {
  try {
    const base = buildModelscopeApiBase()
    const resp = await fetch(`${base}/health`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!resp.ok) return { online: false, reason: `HTTP ${resp.status}` }
    const data = await resp.json()
    if (data.service && data.service.includes('CamScanner')) {
      return { online: true, capabilities: data.capabilities || {} }
    }
    return { online: false, reason: '服务标识不匹配' }
  } catch (e) {
    return { online: false, reason: e.message }
  }
}

// ────────────────────────────────────────────────
// 上传 PDF 到 CamScanner 代理解析
// ────────────────────────────────────────────────
export async function parseWithModelscope(file, onProgress) {
  const base = buildModelscopeApiBase()

  // 先检查在线状态
  const status = await checkModelscopeOnline()
  if (!status.online) {
    throw new Error(
      `CamScanner 代理服务不可用（${status.reason || '连接失败'}）。\n` +
      `请稍后重试，或改用 ≤200 页的 PDF 走 MinerU 主链路。`
    )
  }

  // 构造 multipart form
  const form = new FormData()
  form.append('file', file)

  onProgress?.(15, 100, '上传 PDF 到 CamScanner 代理...')

  // 同步请求：CamScanner 上传+转换+下载
  // 大文件（>50MB）CVM 会自动按 12MB 拆分多次调用 CamScanner，需较长超时
  // 131MB / 12MB ≈ 11 块 × (上传+转换) ≈ 10-15 分钟
  const resp = await fetch(`${base}/parse`, {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(1800000),  // 30 分钟
  })

  onProgress?.(90, 100, '解析完成，处理结果...')

  if (!resp.ok) {
    const errText = await resp.text()
    let errMsg = `CamScanner 解析失败 (HTTP ${resp.status})`
    try {
      const errJson = JSON.parse(errText)
      if (errJson.error) errMsg = errJson.error
    } catch {}
    throw new Error(errMsg)
  }

  const result = await resp.json()
  onProgress?.(100, 100, '完成')

  // 转换为与 MinerU 结果一致的格式（让 aiParser/UploadPage 复用展示逻辑）
  const raw = result.rawExtraction || {}
  const structured = result.structured || {}

  return {
    text: raw.text || '',
    markdown: raw.markdown || '',
    numPages: raw.numPages || 0,
    ocrUsed: true,  // CamScanner 支持 OCR
    backendUsed: true,
    backendError: null,
    extractionMethod: 'camscanner-pdf2markdown',
    mineruUsed: false,
    structured,
    downloads: raw.downloads || {},
    parseMeta: {
      pageCount: raw.numPages || 0,
      hasTables: true,  // CamScanner 智能识别表格
      hasFormulas: false,
      ocrUsed: true,
      backendUsed: true,
      mineruUsed: false,
      extractionMethod: 'camscanner-pdf2markdown',
      batchId: '',
      filename: raw.filename || '',
    },
    warnings: result.warnings || [],
  }
}
