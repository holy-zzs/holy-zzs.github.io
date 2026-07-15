#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// 创界山 · 本地 AI 桥接服务 v2.0
// 零依赖，仅使用 Node.js 内置模块
// ═══════════════════════════════════════════════════════════════
// 用法:
//   node trae-bridge.mjs                                    # 默认 API 代理模式
//   node trae-bridge.mjs --mode=api --key=sk-xxx            # 指定 API Key
//   node trae-bridge.mjs --mode=api --base=URL --key=sk-xxx --model=deepseek-chat
//   node trae-bridge.mjs --mode=trae                        # TRAE CLI 模式
//   node trae-bridge.mjs --port=8080                        # 自定义端口
//   node trae-bridge.mjs --detect                           # 检测环境后退出
//
// 配置优先级: 命令行参数 > 环境变量 > 配置文件(.trae-bridge.json) > 默认值
// ═══════════════════════════════════════════════════════════════

import http from 'node:http'
import https from 'node:https'
import { URL } from 'node:url'
import { spawn, execSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const CONFIG_FILE = resolve(process.cwd(), '.trae-bridge.json')
const startTime = Date.now()

// ── 配置加载 ──
function loadConfig() {
  const defaults = {
    port: 19820,
    mode: 'api',           // 'api' | 'trae'
    apiKey: '',
    apiBase: 'https://api.deepseek.com/v1',
    apiModel: 'deepseek-chat',
    traeCliPath: 'traecli',
    corsOrigin: '*',
  }

  // 1. 配置文件
  if (existsSync(CONFIG_FILE)) {
    try {
      const fileConfig = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'))
      Object.assign(defaults, fileConfig)
    } catch {}
  }

  // 2. 环境变量
  if (process.env.BRIDGE_MODE) defaults.mode = process.env.BRIDGE_MODE
  if (process.env.API_KEY) defaults.apiKey = process.env.API_KEY
  if (process.env.API_BASE) defaults.apiBase = process.env.API_BASE
  if (process.env.API_MODEL) defaults.apiModel = process.env.API_MODEL
  if (process.env.PORT) defaults.port = parseInt(process.env.PORT)

  // 3. 命令行参数
  for (const arg of process.argv.slice(2)) {
    const [k, v] = arg.replace(/^--/, '').split('=')
    if (k === 'mode') defaults.mode = v
    if (k === 'port') defaults.port = parseInt(v)
    if (k === 'key') defaults.apiKey = v
    if (k === 'base') defaults.apiBase = v
    if (k === 'model') defaults.apiModel = v
    if (k === 'trae-path') defaults.traeCliPath = v
  }

  return defaults
}

const config = loadConfig()

// ── TRAE CLI 环境检测 ──
function detectTraeCli() {
  const cliName = config.traeCliPath || 'traecli'
  // 尝试常见路径
  const candidates = [
    cliName,
    'trae',
    'trae-cli',
    // Windows 常见安装路径
    ...(process.platform === 'win32' ? [
      'C:\\Users\\' + (process.env.USERNAME || '') + '\\AppData\\Local\\Programs\\Trae\\bin\\traecli.cmd',
      'C:\\Users\\' + (process.env.USERNAME || '') + '\\AppData\\Local\\Programs\\Trae\\bin\\trae.cmd',
    ] : [
      '/usr/local/bin/traecli',
      '/opt/trae/bin/traecli',
    ]),
  ]

  for (const cmd of candidates) {
    try {
      execSync(`"${cmd}" --version`, { stdio: 'pipe', timeout: 3000 })
      return { found: true, path: cmd, version: 'detected' }
    } catch {
      // 继续尝试下一个
    }
  }

  return { found: false, path: null, version: null }
}

// ── 环境检测模式: --detect ──
if (process.argv.includes('--detect')) {
  console.log(JSON.stringify({
    node: process.version,
    platform: process.platform,
    traeCli: detectTraeCli(),
    configExists: existsSync(CONFIG_FILE),
    config: config,
  }, null, 2))
  process.exit(0)
}

// ── CORS 设置 ──
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', config.corsOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, x-api-base, Authorization')
}

// ── 健康检查: GET /health ──
function handleHealth(req, res) {
  setCors(res)
  const traeInfo = config.mode === 'trae' ? detectTraeCli() : null
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    status: 'ok',
    mode: config.mode,
    model: config.apiModel,
    uptime: Math.floor((Date.now() - startTime) / 1000),
    version: '2.0.0',
    traeCli: traeInfo,
  }))
}

// ── 环境检测: GET /detect ──
function handleDetect(req, res) {
  setCors(res)
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    node: process.version,
    platform: process.platform,
    traeCli: detectTraeCli(),
    currentMode: config.mode,
    apiConfigured: !!config.apiKey,
    apiBase: config.apiBase,
    apiModel: config.apiModel,
  }))
}

// ── API 代理模式: 转发到上游 OpenAI 兼容 API ──
function handleApiProxy(req, res, body) {
  const apiKey = req.headers['x-api-key'] || config.apiKey
  const apiBase = req.headers['x-api-base'] || config.apiBase

  if (!apiKey) {
    setCors(res)
    res.writeHead(401, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: { message: '未配置 API Key。请在配置文件或请求头中提供。' } }))
    return
  }

  const upstreamUrl = apiBase.replace(/\/$/, '') + '/chat/completions'
  const upstream = new URL(upstreamUrl)
  const isHttps = upstream.protocol === 'https:'
  const transport = isHttps ? https : http

  const model = body.model === 'auto' ? config.apiModel : (body.model || config.apiModel)
  const upstreamBody = JSON.stringify({ ...body, model })

  const proxyReq = transport.request({
    hostname: upstream.hostname,
    port: upstream.port || (isHttps ? 443 : 80),
    path: upstream.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Length': Buffer.byteLength(upstreamBody),
    },
  }, (proxyResp) => {
    setCors(res)
    res.writeHead(proxyResp.statusCode, {
      'Content-Type': proxyResp.headers['content-type'] || 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })
    proxyResp.pipe(res)
  })

  proxyReq.on('error', (e) => {
    setCors(res)
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' })
    }
    res.end(JSON.stringify({ error: { message: `上游 API 错误: ${e.message}` } }))
  })

  proxyReq.write(upstreamBody)
  proxyReq.end()
}

// ── TRAE CLI 模式: 调用本地 TRAE CLI ──
function handleTraeCli(req, res, body) {
  setCors(res)

  // 先检测 CLI 是否可用
  const traeInfo = detectTraeCli()
  if (!traeInfo.found) {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' })
    const errMsg = JSON.stringify({
      choices: [{ delta: { content: '⚠️ 未检测到 TRAE CLI。\n\n请确认：\n1. 已安装 TRAE IDE 或 TRAE CLI\n2. traecli/trae 命令在系统 PATH 中\n3. 如使用企业版，确认已激活 CLI 功能\n\n你可以改用 API 代理模式，或访问 https://www.trae.cn/ide/download 下载 TRAE。\n\n' } }],
    })
    res.write(`data: ${errMsg}\n\n`)
    res.write('data: [DONE]\n\n')
    res.end()
    return
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })

  const prompt = body.messages
    .map(m => `${m.role === 'system' ? '[系统]' : '[用户]'} ${m.content}`)
    .join('\n\n')

  try {
    const child = spawn(traeInfo.path, ['-p', prompt, '--json'], {
      cwd: process.cwd(),
      env: { ...process.env },
      shell: process.platform === 'win32',
    })

    let buffer = ''

    child.stdout.on('data', (chunk) => {
      buffer += chunk.toString()
      // 将 CLI 输出包装为 SSE 格式
      while (buffer.length >= 20) {
        const piece = buffer.slice(0, 20)
        buffer = buffer.slice(20)
        const sseData = JSON.stringify({
          choices: [{ delta: { content: piece } }],
        })
        res.write(`data: ${sseData}\n\n`)
      }
    })

    child.stderr.on('data', (chunk) => {
      console.error('[TRAE CLI stderr]', chunk.toString().trim())
    })

    child.on('close', () => {
      if (buffer.length > 0) {
        const sseData = JSON.stringify({
          choices: [{ delta: { content: buffer } }],
        })
        res.write(`data: ${sseData}\n\n`)
      }
      res.write('data: [DONE]\n\n')
      res.end()
    })

    child.on('error', (e) => {
      const errData = JSON.stringify({
        choices: [{ delta: { content: `\n\n[TRAE CLI 错误: ${e.message}]\n请确认 traecli 已安装且在 PATH 中。` } }],
      })
      res.write(`data: ${errData}\n\n`)
      res.write('data: [DONE]\n\n')
      res.end()
    })

    // 客户端断开时终止子进程
    req.on('close', () => {
      child.kill()
    })
  } catch (e) {
    const errData = JSON.stringify({
      error: { message: `TRAE CLI 调用失败: ${e.message}` },
    })
    res.write(`data: ${errData}\n\n`)
    res.end()
  }
}

// ── 主请求处理 ──
const server = http.createServer((req, res) => {
  // CORS 预检
  if (req.method === 'OPTIONS') {
    setCors(res)
    res.writeHead(204)
    res.end()
    return
  }

  // 健康检查
  if (req.url === '/health' && req.method === 'GET') {
    return handleHealth(req, res)
  }

  // 环境检测
  if (req.url === '/detect' && req.method === 'GET') {
    return handleDetect(req, res)
  }

  // 聊天补全
  if (req.url === '/chat/completions' && req.method === 'POST') {
    let bodyStr = ''
    req.on('data', chunk => { bodyStr += chunk })
    req.on('end', () => {
      try {
        const body = JSON.parse(bodyStr)
        if (config.mode === 'trae') {
          handleTraeCli(req, res, body)
        } else {
          handleApiProxy(req, res, body)
        }
      } catch (e) {
        setCors(res)
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: { message: `请求解析失败: ${e.message}` } }))
      }
    })
    return
  }

  // 404
  setCors(res)
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: { message: `Not Found: ${req.url}` } }))
})

server.listen(config.port, '127.0.0.1', () => {
  console.log('════════════════════════════════════════')
  console.log('  创界山 · 本地 AI 桥接服务 v2.0')
  console.log('════════════════════════════════════════')
  console.log(`  地址:     http://localhost:${config.port}`)
  console.log(`  模式:     ${config.mode === 'trae' ? 'TRAE CLI' : 'API 代理'}`)
  if (config.mode === 'api') {
    console.log(`  上游 API: ${config.apiBase}`)
    console.log(`  模型:     ${config.apiModel}`)
    console.log(`  API Key:  ${config.apiKey ? '已配置 (' + config.apiKey.slice(0, 6) + '...)' : '未配置（需前端传入或配置文件设置）'}`)
  } else {
    const traeInfo = detectTraeCli()
    console.log(`  TRAE CLI: ${traeInfo.found ? '✅ 已检测到 (' + traeInfo.path + ')' : '❌ 未检测到'}`)
  }
  console.log(`  健康检查: http://localhost:${config.port}/health`)
  console.log(`  环境检测: http://localhost:${config.port}/detect`)
  console.log('')
  console.log('  按 Ctrl+C 停止服务')
  console.log('════════════════════════════════════════')
})