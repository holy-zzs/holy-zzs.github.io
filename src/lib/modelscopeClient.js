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
// 上传 PDF 到 CamScanner 代理解析（异步轮询模式）
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

  onProgress?.(10, 100, '上传 PDF 到 CamScanner 代理...')

  // 异步模式：POST /parse 立即返回 job_id（几秒内）
  // CVM 后台线程处理，前端轮询 GET /jobs/{jobId} 获取结果
  // 避免 fetch 长时间等待 30+ 分钟导致浏览器超时/页面崩溃
  const sizeMB = file.size / 1024 / 1024
  const uploadTimeout = sizeMB > 50 ? 600000 : 120000  // 大文件 10 分钟，小文件 2 分钟
  const postResp = await fetch(`${base}/parse`, {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(uploadTimeout),
  })

  if (postResp.status !== 202 && !postResp.ok) {
    const errText = await postResp.text()
    let errMsg = `CamScanner 提交失败 (HTTP ${postResp.status})`
    try {
      const errJson = JSON.parse(errText)
      if (errJson.error) errMsg = errJson.error
    } catch {}
    throw new Error(errMsg)
  }

  const jobInfo = await postResp.json()
  const jobId = jobInfo.jobId
  if (!jobId) {
    throw new Error('CamScanner 代理未返回 jobId')
  }

  console.log(`[CamScanner] 任务已提交: ${jobId}`)
  onProgress?.(15, 100, 'PDF 已上传，等待解析...')

  // 轮询任务状态
  const POLL_INTERVAL = 5000  // 5 秒
  const MAX_POLL_TIME = 60 * 60 * 1000  // 60 分钟总超时
  const startedAt = Date.now()

  let lastStatus = ''
  while (Date.now() - startedAt < MAX_POLL_TIME) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL))

    let pollResp
    try {
      pollResp = await fetch(`${base}/jobs/${jobId}`, {
        signal: AbortSignal.timeout(15000),
      })
    } catch (e) {
      console.warn(`[CamScanner] 轮询失败: ${e.message}，重试...`)
      continue
    }

    if (!pollResp.ok) {
      console.warn(`[CamScanner] 轮询返回 HTTP ${pollResp.status}，重试...`)
      continue
    }

    const job = await pollResp.json()
    const jobStatus = job.status || 'unknown'

    if (jobStatus !== lastStatus) {
      console.log(`[CamScanner] 任务状态: ${jobStatus}`)
      lastStatus = jobStatus
    }

    // 从 status 提取分块进度并更新 UI
    if (jobStatus.startsWith('processing chunk')) {
      const match = jobStatus.match(/chunk\s+(\d+)\/(\d+)/)
      if (match) {
        const cur = parseInt(match[1])
        const total = parseInt(match[2])
        const pct = Math.round((cur / total) * 80) + 15  // 15-95%
        onProgress?.(pct, 100, `CamScanner 解析中 (${cur}/${total} 块)...`)
      }
    } else if (jobStatus === 'processing') {
      onProgress?.(20, 100, 'CamScanner 解析中...')
    } else if (jobStatus === 'done') {
      onProgress?.(95, 100, '解析完成，处理结果...')
      const result = job.result
      if (!result) {
        throw new Error('任务完成但未返回结果')
      }
      onProgress?.(100, 100, '完成')

      // 转换为与 MinerU 结果一致的格式
      const raw = result.rawExtraction || {}
      const structured = result.structured || {}

      return {
        text: raw.text || '',
        markdown: raw.markdown || '',
        numPages: raw.numPages || 0,
        ocrUsed: true,
        backendUsed: true,
        backendError: null,
        extractionMethod: 'camscanner-pdf2markdown',
        mineruUsed: false,
        structured,
        downloads: raw.downloads || {},
        parseMeta: {
          pageCount: raw.numPages || 0,
          hasTables: true,
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
    } else if (jobStatus === 'failed') {
      const errMsg = job.error || '未知错误'
      throw new Error(`CamScanner 解析失败: ${errMsg}`)
    }
    // queued 状态继续等待
  }

  throw new Error('CamScanner 解析超时（60 分钟）')
}
