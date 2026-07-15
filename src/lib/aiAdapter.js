// AI 调用适配器 v2.0：三模式引擎（Demo / API Key / Local Bridge）
// - demo: 预置模拟数据，零成本体验
// - apikey: 通过同源代理（Netlify Function / Vite dev proxy）转发，API Key 从请求头传递
// - localbridge: 直连本地桥接服务（localhost:19820），桥接设置 CORS 头
import { buildAgentMessages, parseDesignDoc } from './prompts.js'
import { getAgent } from '../data/agents.js'
import { generateMockDiscussion } from '../data/mockDiscussion.js'

// ════════════════════════════════════════════════
// 统一流式接口：返回 async generator，逐块 yield 文本
// ════════════════════════════════════════════════
export async function* streamAgentResponse(params) {
  const { settings } = params
  const mode = resolveEngineMode(settings)

  try {
    switch (mode) {
      case 'localbridge':
        yield* bridgeStream(params)
        break
      case 'apikey':
        yield* apiKeyStream(params)
        break
      case 'demo':
      default:
        yield* mockStream(params)
        break
    }
  } catch (e) {
    if (e.name === 'AbortError') return
    // 非 Demo 模式出错时，降级到 Demo 模式并提示
    if (mode !== 'demo') {
      yield `\n\n⚠️ [${mode} 模式出错：${e.message}]\n`
      yield `已自动降级到 Demo 模式继续...\n\n`
      yield* mockStream(params)
    } else {
      throw e
    }
  }
}

// 解析引擎模式（兼容旧格式 useMock）
function resolveEngineMode(settings) {
  if (settings?.engineMode) return settings.engineMode
  return settings?.useMock === false ? 'apikey' : 'demo'
}

// ════════════════════════════════════════════════
// Demo 模式（不变）
// ════════════════════════════════════════════════
async function* mockStream({ agent, material, team, round, history, userInterjection }) {
  const fullText = generateMockDiscussion({ agent, material, team, round, history, userInterjection })
  const chunks = splitToChunks(fullText, 3)
  for (const chunk of chunks) {
    await delay(18 + Math.random() * 25)
    yield chunk
  }
}

function splitToChunks(text, size) {
  const chunks = []
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size))
  }
  return chunks
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ════════════════════════════════════════════════
// API Key 模式：通过同源代理转发
// 生产环境 → Netlify Function (/api/chat)
// 开发环境 → Vite dev proxy (/api/chat)
// ════════════════════════════════════════════════
async function* apiKeyStream({ agent, material, team, round, history, userPrefs, userInterjection, settings, signal }) {
  const messages = buildAgentMessages({ agent, material, team, round, history, userPrefs, userInterjection })
  const reqBody = JSON.stringify({ model: settings.apiModel, messages, stream: true, temperature: 0.8, max_tokens: 1500 })
  const directUrl = `${(settings.apiBase || '').replace(/\/+$/, '')}/chat/completions`
  const directHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.apiKey}` }

  // 优先尝试同源代理（生产环境），404/500 或网络错误则直连 API（本地开发）
  let resp
  try {
    resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': settings.apiKey, 'x-api-base': settings.apiBase },
      body: reqBody,
      signal: signal || AbortSignal.timeout(5000),
    })
    if (!resp.ok && (resp.status === 404 || resp.status >= 500)) {
      console.log(`同源代理返回 ${resp.status}，直连 API...`)
      resp = await fetch(directUrl, { method: 'POST', headers: directHeaders, body: reqBody, signal })
    }
  } catch (proxyErr) {
    if (proxyErr.name === 'AbortError' && signal?.aborted) return
    console.log('同源代理不可用，直连 API:', proxyErr.message)
    resp = await fetch(directUrl, { method: 'POST', headers: directHeaders, body: reqBody, signal })
  }

  if (!resp.ok) {
    let errMsg = `代理返回 ${resp.status}`
    try {
      const errBody = await resp.json()
      errMsg = errBody.error?.message || errBody.error || errMsg
    } catch {}
    throw new Error(errMsg)
  }

  yield* parseSSEStream(resp, signal)
}

// ════════════════════════════════════════════════
// Local Bridge 模式：直连本地桥接服务
// 桥接脚本设置 CORS 头，浏览器可跨域请求 localhost
// ════════════════════════════════════════════════
async function* bridgeStream({ agent, material, team, round, history, userPrefs, userInterjection, settings, signal }) {
  const messages = buildAgentMessages({ agent, material, team, round, history, userPrefs, userInterjection })
  const bridgeUrl = (settings.bridgeUrl || 'http://localhost:19820').replace(/\/$/, '')
  const url = `${bridgeUrl}/chat/completions`

  let resp
  try {
    resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(settings.apiKey ? { 'x-api-key': settings.apiKey } : {}),
        ...(settings.apiBase ? { 'x-api-base': settings.apiBase } : {}),
      },
      body: JSON.stringify({
        model: settings.bridgeModel || settings.apiModel || 'auto',
        messages,
        stream: true,
        temperature: 0.8,
        max_tokens: 1500,
      }),
      signal,
    })
  } catch (e) {
    if (e.name === 'AbortError') return
    throw new Error(
      `无法连接本地桥接服务（${bridgeUrl}）。请确认 trae-bridge.mjs 已在运行。` +
      `可在设置中点击"下载桥接脚本"获取。`
    )
  }

  if (!resp.ok) {
    let errMsg = `桥接返回 ${resp.status}`
    try {
      const errBody = await resp.json()
      errMsg = errBody.error?.message || errMsg
    } catch {}
    throw new Error(errMsg)
  }

  yield* parseSSEStream(resp, signal)
}

// ════════════════════════════════════════════════
// 通用 SSE 流解析（从 realStream 提取，供两种模式复用）
// ════════════════════════════════════════════════
async function* parseSSEStream(resp, signal) {
  const reader = resp.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      if (signal?.aborted) { reader.cancel(); return }
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data:')) continue
        const data = trimmed.slice(5).trim()
        if (data === '[DONE]') return
        try {
          const json = JSON.parse(data)
          const delta = json.choices?.[0]?.delta?.content
          if (delta) yield delta
        } catch {}
      }
    }
  } finally {
    reader.releaseLock?.()
  }
}

// ════════════════════════════════════════════════
// 一次性调用（非流式，用于简单场景）
// ════════════════════════════════════════════════
export async function callAgent(params) {
  let full = ''
  for await (const chunk of streamAgentResponse(params)) {
    full += chunk
  }
  return full
}

// 生成完整设计文档（最后一轮项目经理用）
export async function generateDesignDoc(params) {
  const text = await callAgent({ ...params, round: 5 })
  return parseDesignDoc(text)
}

// ════════════════════════════════════════════════
// 工具函数：健康检查 / API 测试
// ════════════════════════════════════════════════

// 检查本地桥接是否在线，同时获取环境信息
export async function checkBridgeHealth(bridgeUrl) {
  try {
    const base = (bridgeUrl || 'http://localhost:19820').replace(/\/$/, '')
    // 先检测 /health
    const resp = await fetch(base + '/health', { signal: AbortSignal.timeout(3000) })
    if (!resp.ok) return { online: false, error: `HTTP ${resp.status}` }
    const data = await resp.json()
    // 尝试获取 /detect 信息（v2.0 桥接脚本支持）
    try {
      const detectResp = await fetch(base + '/detect', { signal: AbortSignal.timeout(2000) })
      if (detectResp.ok) {
        const detectData = await detectResp.json()
        data.traeCli = detectData.traeCli
        data.node = detectData.node
        data.platform = detectData.platform
      }
    } catch {}
    return { online: true, ...data }
  } catch (e) {
    return { online: false, error: e.message }
  }
}

// 测试 API Key 连通性（优先同源代理，404/500或失败则直连）
export async function testApiKey(settings) {
  const body = JSON.stringify({ model: settings.apiModel, messages: [{ role: 'user', content: '你好' }], max_tokens: 10, stream: false })
  const directUrl = `${(settings.apiBase || '').replace(/\/+$/, '')}/chat/completions`
  const directHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.apiKey}` }

  // 尝试同源代理
  try {
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': settings.apiKey, 'x-api-base': settings.apiBase },
      body,
      signal: AbortSignal.timeout(5000),
    })
    if (resp.ok) return { ok: true }
    // 404/500 → 本地开发环境，直连
    if (resp.status === 404 || resp.status >= 500) {
      const resp2 = await fetch(directUrl, { method: 'POST', headers: directHeaders, body, signal: AbortSignal.timeout(15000) })
      if (resp2.ok) return { ok: true }
      const errBody2 = await resp2.json().catch(() => ({}))
      return { ok: false, error: errBody2.error?.message || `HTTP ${resp2.status}` }
    }
    const errBody = await resp.json().catch(() => ({}))
    return { ok: false, error: errBody.error?.message || `HTTP ${resp.status}` }
  } catch (proxyErr) {
    // 同源代理不可用，直连 API
    try {
      const resp = await fetch(directUrl, { method: 'POST', headers: directHeaders, body, signal: AbortSignal.timeout(15000) })
      if (resp.ok) return { ok: true }
      const errBody = await resp.json().catch(() => ({}))
      return { ok: false, error: errBody.error?.message || `HTTP ${resp.status}` }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  }
}
