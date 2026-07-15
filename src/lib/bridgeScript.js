// 桥接脚本辅助模块 v2.0：启动命令生成 / 配置生成 / 剪贴板
// 下载改为直接 <a href="/trae-bridge.mjs" download> 链接，不再用 fetch+Blob
// 配合 aiAdapter.js 的 localbridge 模式使用

const DEFAULT_BRIDGE_URL = 'http://localhost:19820'
const DEFAULT_API_BASE = 'https://api.deepseek.com/v1'

// 从 bridgeUrl 中解析端口号
function parsePort(bridgeUrl) {
  try {
    const port = new URL(bridgeUrl || DEFAULT_BRIDGE_URL).port
    return port ? Number(port) : 19820
  } catch {
    return 19820
  }
}

// 将引擎模式映射为桥接脚本运行模式
function resolveBridgeMode(settings) {
  if (settings?.bridgeModel === 'trae') return 'trae'
  return 'api'
}

// ════════════════════════════════════════════════
// 生成 .trae-bridge.json 配置文件内容
// ════════════════════════════════════════════════
export function generateBridgeConfig(settings) {
  const s = settings || {}
  const config = {
    mode: resolveBridgeMode(s),
    port: parsePort(s.bridgeUrl),
    cors: true,
    apiBase: s.apiBase || DEFAULT_API_BASE,
    apiKey: s.apiKey || '',
    model: s.apiModel || 'auto',
  }
  return JSON.stringify(config, null, 2)
}

// ════════════════════════════════════════════════
// 拼装终端启动命令
// ════════════════════════════════════════════════
export function getBridgeStartupCommand(settings) {
  const s = settings || {}
  const mode = resolveBridgeMode(s)
  const parts = ['node', 'trae-bridge.mjs', `--mode=${mode}`]

  if (mode === 'trae') {
    // TRAE CLI 模式不需要 API Key
    const port = parsePort(s.bridgeUrl)
    if (port !== 19820) parts.push(`--port=${port}`)
  } else {
    // API 代理模式
    if (s.apiKey) parts.push(`--key=${s.apiKey}`)

    const base = s.apiBase || DEFAULT_API_BASE
    parts.push(`--base=${base}`)

    const model = s.apiModel
    if (model && model !== 'auto') parts.push(`--model=${model}`)

    const port = parsePort(s.bridgeUrl)
    if (port !== 19820) parts.push(`--port=${port}`)
  }

  return parts.join(' ')
}

// ════════════════════════════════════════════════
// 复制文本到剪贴板
// ════════════════════════════════════════════════
export async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {}
  }

  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.top = '-9999px'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.focus()
  ta.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  document.body.removeChild(ta)
  return ok
}
