// vercel/api/mineru-proxy.mjs — HTTPS-safe pass-through for static deployments
// when the frontend cannot call Tencent Cloud directly.
export const config = { maxDuration: 300 }

function buildHeaders(req) {
  const headers = {}
  const contentType = req.headers['content-type']
  if (contentType) headers['Content-Type'] = contentType
  return headers
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()

  const backendUrl = process.env.TENCENT_MINERU_BACKEND_URL || 'http://101.35.114.5:8004'
  const targetPath = req.url.replace(/^\/api\/mineru-proxy/, '')
  const targetUrl = `${backendUrl}${targetPath}`

  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const body = req.method === 'GET' ? undefined : Buffer.concat(chunks)

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: buildHeaders(req),
      body,
      signal: AbortSignal.timeout(300000),
    })

    const text = await upstream.text()
    // Pass through content-type if it's JSON
    const ct = upstream.headers.get('content-type')
    if (ct) res.setHeader('Content-Type', ct)
    res.status(upstream.status).send(text)
  } catch (e) {
    res.status(502).json({ error: `代理请求失败: ${e.message}` })
  }
}
