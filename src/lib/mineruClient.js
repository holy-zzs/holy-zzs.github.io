// mineruClient.js — Wrap create-status-result backend calls and hide
// endpoint details from UI code.

const CVM_HTTP = 'http://101.35.114.5:8004'
const CVM_HTTPS = 'https://101.35.114.5:9004'

export function buildMineruApiBase(protocol, origin) {
  if (typeof protocol === 'undefined') protocol = typeof location !== 'undefined' ? location.protocol : 'http:'
  if (typeof origin === 'undefined') origin = typeof location !== 'undefined' ? location.origin : ''
  // HTTPS pages use the self-signed cert proxy
  if (protocol === 'https:') return CVM_HTTPS
  // HTTP pages (including localhost dev) call CVM directly
  return CVM_HTTP
}

export function buildMineruStatusUrl(base, jobId) {
  return `${base}/jobs/${jobId}`
}

export function buildMineruResultUrl(base, jobId) {
  return `${base}/jobs/${jobId}/result`
}

export async function createMineruJob(file, options = {}) {
  const base = buildMineruApiBase()
  const form = new FormData()
  form.append('file', file)
  form.append('language', options.language || 'ch')
  form.append('enableFormula', String(options.enableFormula !== false))
  form.append('enableTable', String(options.enableTable !== false))
  form.append('useOcr', String(options.useOcr !== false))
  if (options.modelVersion) form.append('modelVersion', options.modelVersion)

  // 大文件上传需要更长超时（MinerU 限制 200MB / 200 页）
  // 5 分钟覆盖 50MB 文件在 3Mbps 带宽下的上传时间
  const resp = await fetch(`${base}/jobs`, {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(300000),
  })

  if (!resp.ok) throw new Error(`创建 MinerU 任务失败 (${resp.status})`)
  return resp.json()
}

export async function getMineruJob(jobId) {
  const base = buildMineruApiBase()
  const resp = await fetch(buildMineruStatusUrl(base, jobId), {
    signal: AbortSignal.timeout(15000),
  })
  if (!resp.ok) throw new Error(`获取任务状态失败 (${resp.status})`)
  return resp.json()
}

export async function getMineruJobResult(jobId) {
  const base = buildMineruApiBase()
  const resp = await fetch(buildMineruResultUrl(base, jobId), {
    signal: AbortSignal.timeout(30000),
  })
  if (!resp.ok) throw new Error(`获取任务结果失败 (${resp.status})`)
  return resp.json()
}
