// 设置模态框 v3.1：三模式 AI 引擎 + 16+ API 预设 + TRAE 同款免费模型 + TRAE CLI 检测
import { html, useState, useEffect } from '../../react.js'
import { useApp } from '../../store/appContext.js?v=ctx2'
import { Modal, Button } from './ui.js'
import { checkBridgeHealth, testApiKey } from '../../lib/aiAdapter.js?v=aip7'
import { getBridgeStartupCommand, copyToClipboard } from '../../lib/bridgeScript.js'

// ═══ TRAE 同款免费模型映射 ═══
// TRAE IDE 内置模型 → 对应的免费 API 提供商
const TRAE_MODELS = [
  {
    traeName: 'GLM-4 (智谱)',
    traeEmoji: '🧠',
    provider: 'zhipu',
    apiBase: 'https://open.bigmodel.cn/api/paas/v4',
    apiModel: 'glm-4-flash',
    free: '永久免费',
    desc: 'TRAE 内置 GLM 系列，对应智谱 AI 免费 API',
    register: 'https://open.bigmodel.cn/',
  },
  {
    traeName: 'DeepSeek-V4 (深度求索)',
    traeEmoji: '🔍',
    provider: 'deepseek',
    apiBase: 'https://api.deepseek.com/v1',
    apiModel: 'deepseek-chat',
    free: '有免费额度',
    desc: 'TRAE 内置 DeepSeek，对应 DeepSeek 官方 API',
    register: 'https://platform.deepseek.com/',
  },
  {
    traeName: 'Doubao 豆包 (火山引擎)',
    traeEmoji: '🫘',
    provider: 'volcano',
    apiBase: 'https://ark.cn-beijing.volces.com/api/v3',
    apiModel: 'doubao-seed-1-6-flash',
    free: '每日200万 Tokens',
    desc: 'TRAE 内置豆包，对应火山引擎 API',
    register: 'https://www.volcengine.com/product/ark',
  },
  {
    traeName: 'Kimi-K2 (月之暗面)',
    traeEmoji: '🌙',
    provider: 'moonshot',
    apiBase: 'https://api.moonshot.cn/v1',
    apiModel: 'kimi-k2-0905-preview',
    free: '注册约800万 Tokens',
    desc: 'TRAE 内置 Kimi，对应月之暗面 API',
    register: 'https://platform.moonshot.cn/',
  },
  {
    traeName: 'Qwen 通义千问 (阿里)',
    traeEmoji: '🌐',
    provider: 'qwen',
    apiBase: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiModel: 'qwen-turbo',
    free: '每月100万 Tokens',
    desc: 'TRAE 内置通义千问，对应阿里云百炼 API',
    register: 'https://bailian.console.aliyun.com/',
  },
]

// ═══ API 预设列表（国内 + 国际） ═══
const PRESETS = [
  // ── 国内服务商 ──
  { id: 'siliconflow', name: '硅基流动', region: 'china', badge: '推荐',
    base: 'https://api.siliconflow.cn/v1', model: 'deepseek-ai/DeepSeek-V3',
    desc: '注册送2000万Tokens，多家模型聚合', register: 'https://cloud.siliconflow.cn/' },
  { id: 'zhipu', name: '智谱 GLM', region: 'china', badge: '免费',
    base: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash',
    desc: 'GLM-4-Flash 永久免费，注册送2000万Tokens', register: 'https://open.bigmodel.cn/' },
  { id: 'deepseek', name: 'DeepSeek', region: 'china',
    base: 'https://api.deepseek.com/v1', model: 'deepseek-chat',
    desc: '性价比高，兼容 OpenAI + Anthropic', register: 'https://platform.deepseek.com/' },
  { id: 'volcano', name: '火山引擎', region: 'china',
    base: 'https://ark.cn-beijing.volces.com/api/v3', model: 'doubao-seed-1-6-flash',
    desc: '豆包模型，每日200万免费Tokens', register: 'https://www.volcengine.com/product/ark' },
  { id: 'qwen', name: '通义千问', region: 'china',
    base: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-turbo',
    desc: 'qwen-turbo 永久免费每月100万Tokens', register: 'https://bailian.console.aliyun.com/' },
  { id: 'moonshot', name: 'Kimi', region: 'china',
    base: 'https://api.moonshot.cn/v1', model: 'kimi-k2-0905-preview',
    desc: '超长上下文，注册约800万Tokens', register: 'https://platform.moonshot.cn/' },
  { id: 'baidu', name: '百度文心', region: 'china',
    base: 'https://qianfan.baidubce.com/v2', model: 'ernie-speed',
    desc: 'ERNIE-Speed/Lite 永久免费', register: 'https://qianfan.cloud.baidu.com/' },
  { id: 'iflytek', name: '讯飞星火', region: 'china',
    base: 'https://spark-api-open.xf-yun.com/v1', model: 'generalv3.5',
    desc: 'lite 版永久免费，中文语音强', register: 'https://www.xfyun.cn/' },
  { id: 'minimax', name: 'MiniMax', region: 'china',
    base: 'https://api.minimaxi.com/v1', model: 'abab6.5s',
    desc: 'Agent 原生模型，注册送额度', register: 'https://platform.minimaxi.com/' },
  { id: 'baichuan', name: '百川智能', region: 'china',
    base: 'https://api.baichuan-ai.com/v1', model: 'Baichuan4-Turbo',
    desc: '中文理解强，有试用额度', register: 'https://platform.baichuan-ai.com/' },
  { id: 'stepfun', name: '阶跃星辰', region: 'china',
    base: 'https://api.stepfun.com/v1', model: 'step-2-16k',
    desc: '多模态能力强，有试用额度', register: 'https://platform.stepfun.com/' },
  { id: 'hunyuan', name: '腾讯混元', region: 'china',
    base: 'https://api.hunyuan.cloud.tencent.com/v1', model: 'hunyuan-turbos-latest',
    desc: '100万Tokens/年免费', register: 'https://cloud.tencent.com/product/hunyuan' },

  // ── 国际服务商 ──
  { id: 'gemini', name: 'Google Gemini', region: 'global', badge: '免费',
    base: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.5-flash',
    desc: '免费层每日1000次请求，1M超长上下文', register: 'https://aistudio.google.com/' },
  { id: 'groq', name: 'Groq', region: 'global', badge: '极速',
    base: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile',
    desc: 'LPU 芯片加速，免费层可用', register: 'https://console.groq.com/' },
  { id: 'together', name: 'Together AI', region: 'global',
    base: 'https://api.together.xyz/v1', model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    desc: '聚合开源模型，新用户 $5 额度', register: 'https://api.together.xyz/' },
  { id: 'openai', name: 'OpenAI', region: 'global',
    base: 'https://api.openai.com/v1', model: 'gpt-4o-mini',
    desc: '需海外网络和信用卡', register: 'https://platform.openai.com/' },
]

const MODES = [
  { id: 'apikey', emoji: '🔑', name: 'API Key', desc: '自己的密钥\n线上代理转发' },
  { id: 'localbridge', emoji: '🌉', name: '本地桥接', desc: '运行本地脚本\n数据不出本机' },
]

export default function SettingsModal({ open, onClose }) {
  const { state, dispatch, toast, setConnectionStatus } = useApp()
  const [form, setForm] = useState(state.settings)
  const [bridgeStatus, setBridgeStatus] = useState(null)
  const [apiTestResult, setApiTestResult] = useState(null)
  const [testing, setTesting] = useState(false)
  const [showAllPresets, setShowAllPresets] = useState(false)

  useEffect(() => { setForm(state.settings); setBridgeStatus(null); setApiTestResult(null) }, [state.settings, open])

  // 切换到 Local Bridge 模式时自动检测
  useEffect(() => {
    if (form.engineMode === 'localbridge' && open) doCheckBridge(form.bridgeUrl)
  }, [form.engineMode, form.bridgeUrl, open])

  const doCheckBridge = async (url) => {
    setTesting(true)
    const result = await checkBridgeHealth(url)
    setBridgeStatus(result)
    setTesting(false)
  }

  const doTestApi = async () => {
    setTesting(true)
    setApiTestResult(null)
    const result = await testApiKey(form)
    setApiTestResult(result)
    setTesting(false)
    if (result.ok) toast('API 连接成功', 'success')
    else toast(`连接失败: ${result.error}`, 'error')
  }

  const doCopyCommand = () => {
    const cmd = getBridgeStartupCommand(form)
    if (copyToClipboard(cmd)) toast('启动命令已复制到剪贴板', 'success')
    else toast('复制失败，请手动选择', 'error')
  }

  const save = async () => {
    const payload = { ...form, useMock: form.engineMode === 'demo' }
    dispatch({ type: 'SET_SETTINGS', payload })
    toast('设置已保存', 'success')
    onClose()

    // 保存后自动检测连接状态
    if (form.engineMode === 'demo') {
      setConnectionStatus('demo', '演示模式')
    } else if (form.engineMode === 'apikey') {
      if (!form.apiKey) {
        setConnectionStatus('unconfigured', '未配置 API Key')
      } else {
        setConnectionStatus('checking', form.apiModel || '')
        const result = await testApiKey(form)
        if (result.ok) {
          setConnectionStatus('connected', form.apiModel || 'API 已连接')
          toast(`已连接到 ${form.apiModel}`, 'success')
        } else {
          setConnectionStatus('disconnected', result.error || '连接失败')
          toast(`连接失败: ${result.error}`, 'error')
        }
      }
    } else if (form.engineMode === 'localbridge') {
      setConnectionStatus('checking', '检测桥接...')
      const result = await checkBridgeHealth(form.bridgeUrl)
      if (result.online) {
        setConnectionStatus('connected', `桥接在线 · ${result.model || 'auto'}`)
        toast('桥接已连接', 'success')
      } else {
        setConnectionStatus('disconnected', result.error || '桥接离线')
        toast(`桥接未连接: ${result.error}`, 'error')
      }
    }
  }

  // 显示的预设：默认显示推荐的前6个，展开后显示全部
  const visiblePresets = showAllPresets ? PRESETS : PRESETS.filter(p => p.badge || ['siliconflow', 'zhipu', 'deepseek', 'gemini', 'groq', 'openai'].includes(p.id))
  const chinaPresets = visiblePresets.filter(p => p.region === 'china')
  const globalPresets = visiblePresets.filter(p => p.region === 'global')

  return html`
    <${Modal} open=${open} onClose=${onClose} title=${'⚙️ AI 引擎设置'} size=${'md'}
      footer=${html`<${Button} variant=${'ghost'} onClick=${onClose}>取消</${Button}><${Button} onClick=${save} disabled=${testing}>保存</${Button}>`}>
      <div className="space-y-5">
        <!-- ═══ 三模式选择 ═══ -->
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">AI 引擎模式</label>
          <div className="grid grid-cols-2 gap-3">
            ${MODES.map(m => html`
              <button key=${m.id}
                onClick=${() => setForm({ ...form, engineMode: m.id })}
                className=${`p-4 rounded-2xl border-2 text-left transition-all ${form.engineMode === m.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'}`}>
                <div className="text-2xl mb-1">${m.emoji}</div>
                <div className="font-bold text-sm">${m.name}</div>
                <div className="text-xs text-gray-500 mt-1 whitespace-pre-line">${m.desc}</div>
              </button>
            `)}
          </div>
        </div>

        <!-- ═══ Demo 模式 ═══ -->
        ${form.engineMode === 'demo' && html`
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            <p className="font-bold mb-1">🎭 Demo 模式</p>
            <p>使用预置的模拟讨论数据，无需任何配置。适合新用户体验完整的多智能体协作流程。</p>
            <p className="text-xs mt-2 text-blue-500">提示：体验完毕后可切换到 API Key 模式或本地桥接模式，处理真实教材。</p>
          </div>
        `}

        <!-- ═══ API Key 模式 ═══ -->
        ${form.engineMode === 'apikey' && html`
          <div className="space-y-4 animate-fade-in">
            <!-- TRAE 同款免费模型 -->
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">🚀 TRAE 同款免费模型</label>
                <span className="text-xs text-gray-400">与 TRAE IDE 内置模型相同</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                ${TRAE_MODELS.map(m => html`
                  <button key=${m.provider}
                    onClick=${() => setForm({ ...form, apiProvider: m.provider, apiBase: m.apiBase, apiModel: m.apiModel, engineMode: 'apikey' })}
                    className=${`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${form.apiProvider === m.provider ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'}`}>
                    <span className="text-2xl shrink-0">${m.traeEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-800">${m.traeName}</span>
                        <span className="px-1.5 py-0.5 text-[9px] rounded-full font-bold shrink-0"
                          style=${{ background: m.free === '永久免费' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)', color: m.free === '永久免费' ? '#22c55e' : '#3b82f6' }}>${m.free}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate">${m.desc}</div>
                    </div>
                    <a href=${m.register} target="_blank" rel="noopener" onClick=${(e) => e.stopPropagation()}
                       className="shrink-0 px-2 py-1 text-[10px] text-brand-500 border border-brand-200 rounded-md hover:bg-brand-50 transition-colors">注册 →</a>
                  </button>
                `)}
              </div>
            </div>

            <!-- 国内服务商 -->
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">🇨🇳 国内服务商</label>
                <a href="https://cloud.siliconflow.cn/" target="_blank" rel="noopener"
                   className="text-xs text-brand-500 hover:text-brand-600 underline">还没注册？去申请 →</a>
              </div>
              <div className="flex flex-wrap gap-2">
                ${chinaPresets.map(p => html`
                  <button key=${p.id}
                    onClick=${() => setForm({ ...form, apiProvider: p.id, apiBase: p.base, apiModel: p.model })}
                    className=${`px-3 py-1.5 text-xs rounded-lg border transition-all flex items-center gap-1 ${form.apiProvider === p.id ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-gray-200 hover:border-brand-300'}`}>
                    ${p.name}
                    ${p.badge && html`<span className="px-1 py-0.5 text-[9px] rounded-full font-bold"
                      style=${{ background: p.badge === '推荐' ? 'rgba(34,197,94,0.15)' : 'rgba(245,166,35,0.15)', color: p.badge === '推荐' ? '#22c55e' : '#F5A623' }}>${p.badge}</span>`}
                  </button>
                `)}
              </div>
              ${form.apiProvider && PRESETS.find(p => p.id === form.apiProvider) && html`
                <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">${PRESETS.find(p => p.id === form.apiProvider).desc}</p>
                  <a href=${PRESETS.find(p => p.id === form.apiProvider).register} target="_blank" rel="noopener"
                     className="text-xs text-brand-500 hover:underline mt-0.5 inline-block">注册地址 →</a>
                </div>
              `}
            </div>

            <!-- 国际服务商 -->
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">🌍 国际服务商</label>
              <div className="flex flex-wrap gap-2">
                ${globalPresets.map(p => html`
                  <button key=${p.id}
                    onClick=${() => setForm({ ...form, apiProvider: p.id, apiBase: p.base, apiModel: p.model })}
                    className=${`px-3 py-1.5 text-xs rounded-lg border transition-all flex items-center gap-1 ${form.apiProvider === p.id ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-gray-200 hover:border-brand-300'}`}>
                    ${p.name}
                    ${p.badge && html`<span className="px-1 py-0.5 text-[9px] rounded-full font-bold"
                      style=${{ background: p.badge === '免费' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)', color: p.badge === '免费' ? '#22c55e' : '#3b82f6' }}>${p.badge}</span>`}
                  </button>
                `)}
              </div>
            </div>

            <!-- 展开/收起 -->
            <button onClick=${() => setShowAllPresets(!showAllPresets)}
              className="text-xs text-gray-400 hover:text-gray-600 underline">
              ${showAllPresets ? '收起' : '查看全部 ' + PRESETS.length + ' 个服务商'}
            </button>

            <!-- API Key 输入 -->
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">API Key</label>
              <input type="password" value=${form.apiKey}
                onChange=${(e) => setForm({ ...form, apiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-brand-400 outline-none text-sm font-mono" />
              <p className="text-xs text-gray-400 mt-1">🔒 Key 仅存在浏览器本地，通过加密代理转发，服务端不存储</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">API 地址</label>
              <input type="text" value=${form.apiBase}
                onChange=${(e) => setForm({ ...form, apiBase: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-brand-400 outline-none text-sm font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">模型名称</label>
              <input type="text" value=${form.apiModel}
                onChange=${(e) => setForm({ ...form, apiModel: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-brand-400 outline-none text-sm font-mono" />
            </div>
            <div className="flex items-center gap-3">
              <${Button} size=${'sm'} variant=${'secondary'} onClick=${doTestApi} disabled=${!form.apiKey || testing}>
                ${testing ? '⏳ 测试中...' : '🧪 测试连接'}
              <//>
              ${apiTestResult && html`
                <span className=${`text-xs ${apiTestResult.ok ? 'text-green-600' : 'text-red-500'}`}>
                  ${apiTestResult.ok ? '✅ 连接成功' : '❌ ' + apiTestResult.error}
                </span>
              `}
            </div>
          </div>
        `}

        <!-- ═══ Local Bridge 模式 ═══ -->
        ${form.engineMode === 'localbridge' && html`
          <div className="space-y-4 animate-fade-in">
            <!-- 模式选择：API代理 vs TRAE CLI -->
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">桥接模式</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick=${() => setForm({ ...form, bridgeModel: 'auto' })}
                  className=${`p-3 rounded-xl border-2 text-left transition-all ${(!form.bridgeModel || form.bridgeModel === 'auto') ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'}`}>
                  <div className="text-sm font-bold">🔑 API 代理</div>
                  <div className="text-xs text-gray-500">转发到任意 API</div>
                </button>
                <button onClick=${() => setForm({ ...form, bridgeModel: 'trae' })}
                  className=${`p-3 rounded-xl border-2 text-left transition-all ${form.bridgeModel === 'trae' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'}`}>
                  <div className="text-sm font-bold">🤖 TRAE CLI</div>
                  <div className="text-xs text-gray-500">使用本地 TRAE</div>
                </button>
              </div>
            </div>

            <!-- TRAE CLI 模式说明 -->
            ${form.bridgeModel === 'trae' && html`
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 space-y-2">
                <p className="text-sm font-bold text-purple-800">🤖 TRAE CLI 模式</p>
                <p className="text-xs text-purple-700">桥接脚本会自动检测本机的 TRAE CLI（traecli）。检测到后将使用 TRAE 的 AI 能力处理请求，无需 API Key。</p>
                <p className="text-xs text-purple-500">📌 TRAE CLI 目前需要企业旗舰版订阅。普通用户建议使用 API 代理模式。</p>
                <a href="https://docs.trae.cn/cli" target="_blank" rel="noopener"
                   className="text-xs text-purple-600 hover:underline">TRAE CLI 文档 →</a>
              </div>
            `}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">桥接地址</label>
              <input type="text" value=${form.bridgeUrl}
                onChange=${(e) => setForm({ ...form, bridgeUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-brand-400 outline-none text-sm font-mono" />
            </div>
            <div className="flex items-center gap-3">
              <${Button} size=${'sm'} variant=${'secondary'} onClick=${() => doCheckBridge(form.bridgeUrl)} disabled=${testing}>
                ${testing ? '⏳ 检测中...' : '🔌 检测连接'}
              <//>
              ${bridgeStatus && html`
                <span className="text-xs flex items-center gap-1.5">
                  <span className=${`inline-block w-2 h-2 rounded-full ${bridgeStatus.online ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  ${bridgeStatus.online
                    ? `已连接 · ${bridgeStatus.mode === 'trae' ? 'TRAE CLI' : 'API 代理'} · ${bridgeStatus.model || ''}`
                    : '未连接'}
                </span>
              `}
            </div>

            ${!bridgeStatus?.online && html`
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <p className="text-sm font-bold text-amber-800">📦 快速开始（3 步）</p>
                <div className="space-y-1.5">
                  <p className="text-xs text-amber-700"><b>第 1 步</b>：下载桥接脚本到本地</p>
                  <div className="flex gap-2 flex-wrap">
                    <a href="/trae-bridge.mjs" download="trae-bridge.mjs"
                       className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors">
                      📥 下载脚本
                    </a>
                    <a href="/trae-bridge.mjs" target="_blank" rel="noopener"
                       className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-100 transition-colors">
                      👁️ 查看源码
                    </a>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-amber-700"><b>第 2 步</b>：在终端运行（需 Node.js 18+）</p>
                  <div className="bg-gray-900 rounded-lg p-3 flex items-center justify-between gap-2">
                    <code className="text-green-400 text-xs font-mono break-all">${getBridgeStartupCommand(form)}</code>
                    <button onClick=${doCopyCommand}
                      className="shrink-0 px-2 py-1 text-xs text-gray-300 hover:text-white border border-gray-600 rounded hover:border-gray-400 transition-colors">
                      复制
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-amber-700"><b>第 3 步</b>：回到此处点击"检测连接"</p>
                </div>
              </div>
            `}

            ${bridgeStatus?.online && html`
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
                ✅ 桥接服务已连接！模式：${bridgeStatus.mode === 'trae' ? 'TRAE CLI' : 'API 代理'}，模型：${bridgeStatus.model || '默认'}
                <p className="text-xs text-green-500 mt-1">运行时长：${Math.floor(bridgeStatus.uptime / 60)}分${bridgeStatus.uptime % 60}秒</p>
              </div>
            `}

            <!-- 桥接已连接 + API代理模式：选择 TRAE 同款免费模型 -->
            ${bridgeStatus?.online && form.bridgeModel !== 'trae' && html`
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">🚀 选择 TRAE 同款免费模型</label>
                  <span className="text-xs text-gray-400">桥接将转发到此模型</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  ${TRAE_MODELS.map(m => html`
                    <button key=${'bridge-' + m.provider}
                      onClick=${() => setForm({ ...form, apiProvider: m.provider, apiBase: m.apiBase, apiModel: m.apiModel })}
                      className=${`flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all text-left ${form.apiProvider === m.provider ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'}`}>
                      <span className="text-xl shrink-0">${m.traeEmoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800">${m.traeName}</span>
                          <span className="px-1.5 py-0.5 text-[9px] rounded-full font-bold shrink-0"
                            style=${{ background: m.free === '永久免费' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)', color: m.free === '永久免费' ? '#22c55e' : '#3b82f6' }}>${m.free}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate">模型: ${m.apiModel}</div>
                      </div>
                      <a href=${m.register} target="_blank" rel="noopener" onClick=${(e) => e.stopPropagation()}
                         className="shrink-0 px-2 py-1 text-[10px] text-brand-500 border border-brand-200 rounded-md hover:bg-brand-50 transition-colors">注册 →</a>
                    </button>
                  `)}
                </div>
                ${form.apiProvider && html`
                  <div className="mt-2 p-2 bg-amber-50 rounded-lg text-xs text-amber-700">
                    <p>💡 已选择模型 <b>${form.apiModel}</b>，桥接脚本会自动转发到此 API。</p>
                    <p className="mt-1">请在下方填入对应的 API Key，然后保存设置。</p>
                  </div>
                `}
              </div>

              <!-- API Key 输入（桥接模式也需要） -->
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">API Key <span className="text-xs font-normal text-gray-400">(用于桥接转发)</span></label>
                <input type="password" value=${form.apiKey}
                  onChange=${(e) => setForm({ ...form, apiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-brand-400 outline-none text-sm font-mono" />
                <p className="text-xs text-gray-400 mt-1">🔒 Key 通过桥接本地转发，不经过外部服务器</p>
              </div>
            `}
          </div>
        `}

        <!-- ═══ 底部说明 ═══ -->
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-600">
          💡 <b>Demo</b> = 零配置演示 | <b>API Key</b> = 生产推荐，可选 TRAE 同款免费模型 | <b>本地桥接</b> = 数据不出本机，桥接后可选 TRAE 同款模型
        </div>
      </div>
    </${Modal}>
  `
}
