// 多智能体协作讨论工作台 · 深空赛博 HUD 风格
// v2: 匹配游戏广场设计美学 — 深空背景 / 霓虹双色 / 等宽字体 / 棱角切割面板
import { html, useState, useRef, useEffect, useCallback } from '../../deps.js'
import { useApp, STEPS } from '../../store/appContext.js?v=ctx2'
import { Button, MarkdownView } from '../common/ui.js'
import { getAgent } from '../../data/agents.js'
import { streamAgentResponse } from '../../lib/aiAdapter.js?v=aip7'
import { parseDesignDoc } from '../../lib/prompts.js'

const ROUND_INFO = [
  { name: '开场', emoji: '🎬', desc: '队长介绍流程', code: 'BRIEF' },
  { name: '知识拆解', emoji: '📚', desc: '学神分析教材', code: 'ANALYZE' },
  { name: '玩法设计', emoji: '🎮', desc: '设计师提方案', code: 'DESIGN' },
  { name: '多维评估', emoji: '🫠', desc: '各角色发表评价', code: 'EVAL' },
  { name: '自由讨论', emoji: '💬', desc: '角色回应辩论', code: 'DEBATE' },
  { name: '汇总输出', emoji: '🎁', desc: '队长输出文档', code: 'OUTPUT' }
]

export default function WorkspaceView() {
  const { state, dispatch, toast, goStep, goPrev, setLoading, setError, openSettings } = useApp()
  const team = state.selectedAgents || []
  const teamAgents = team.map(getAgent).filter(Boolean)
  const material = state.material

  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('idle')
  const [round, setRound] = useState(-1)
  const [currentSpeaker, setCurrentSpeaker] = useState(null)
  const [userInput, setUserInput] = useState('')
  const [pendingInterjection, setPendingInterjection] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)

  const messagesRef = useRef([])
  const abortRef = useRef(null)
  const statusRef = useRef('idle')
  const interjectionRef = useRef('')
  const chatEndRef = useRef(null)
  const chatBoxRef = useRef(null)

  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { statusRef.current = status }, [status])
  useEffect(() => { interjectionRef.current = pendingInterjection }, [pendingInterjection])

  useEffect(() => {
    if (autoScroll && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages, autoScroll])

  const updateMessage = useCallback((id, content, done = false) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, content, streaming: !done } : m))
    messagesRef.current = messagesRef.current.map(m => m.id === id ? { ...m, content, streaming: !done } : m)
  }, [])

  const getSpeakersForRound = (r) => {
    if (r === 0) return team.includes('captain') ? ['captain'] : [team[0]]
    if (r === 1) return team
    if (r === 2) return team
    if (r === 3) return team.filter(id => !['captain'].includes(id))
    if (r === 4) return team
    if (r === 5) return team.includes('captain') ? ['captain'] : [team[0]]
    return team
  }

  const speak = async (agentId, r) => {
    const agent = getAgent(agentId)
    if (!agent) return
    setCurrentSpeaker(agentId)

    const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    const newMsg = {
      id: msgId, round: r, agentId, agentName: agent.name, agentEmoji: agent.emoji,
      agentColor: agent.color, agentGradient: agent.gradient, role: 'agent',
      content: '', timestamp: new Date().toISOString(), streaming: true
    }
    setMessages(prev => [...prev, newMsg])
    messagesRef.current = [...messagesRef.current, newMsg]

    let full = ''
    try {
      const stream = streamAgentResponse({
        agent, material, team, round: r,
        history: messagesRef.current.slice(-8),
        userPrefs: state.user?.preferences,
        userInterjection: interjectionRef.current || undefined,
        settings: state.settings,
        signal: abortRef.current?.signal
      })
      for await (const chunk of stream) {
        if (statusRef.current === 'paused') {
          await waitWhilePaused()
        }
        if (abortRef.current?.signal.aborted) break
        full += chunk
        updateMessage(msgId, full)
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        full += `\n\n⚠️ [出错：${e.message}]`
      }
    }
    updateMessage(msgId, full, true)
    if (interjectionRef.current) { interjectionRef.current = ''; setPendingInterjection('') }
    setCurrentSpeaker(null)
    return full
  }

  const waitWhilePaused = () => new Promise(resolve => {
    const check = () => {
      if (statusRef.current !== 'paused' || abortRef.current?.signal.aborted) resolve()
      else setTimeout(check, 200)
    }
    check()
  })

  const sleep = (ms) => new Promise(r => setTimeout(r, ms))

  const runDiscussion = async () => {
    if (statusRef.current === 'running') return
    if (team.length < 2) { toast('团队不足2人', 'warning'); return }

    setStatus('running'); statusRef.current = 'running'
    abortRef.current = null

    const startRound = round + 1
    for (let r = Math.max(0, startRound); r < 6; r++) {
      if (abortRef.current?.signal.aborted) break
      setRound(r)
      const speakers = getSpeakersForRound(r)
      for (const agentId of speakers) {
        if (abortRef.current?.signal.aborted) break
        if (speakers.indexOf(agentId) === 0) {
          const sysMsg = { id: `sys_${Date.now()}`, round: r, role: 'system', content: `${ROUND_INFO[r].emoji} 第${r + 1}轮 · ${ROUND_INFO[r].name}`, code: ROUND_INFO[r].code, timestamp: new Date().toISOString() }
          setMessages(prev => [...prev, sysMsg])
          messagesRef.current = [...messagesRef.current, sysMsg]
        }
        await speak(agentId, r)
        if (!abortRef.current?.signal.aborted) await sleep(300)
      }
      if (r === 5 && !abortRef.current?.signal.aborted) {
        const captainMsg = messagesRef.current.filter(m => m.round === 5 && m.role === 'agent').pop()
        if (captainMsg) {
          const doc = parseDesignDoc(captainMsg.content)
          doc.meta = { ...doc.meta, team, generatedAt: new Date().toISOString(), source: material?.filename }
          dispatch({ type: 'SET_DOC', payload: doc })
          dispatch({ type: 'SET_DISCUSSION', payload: { status: 'finished', round: 5 } })
        }
      }
    }

    setStatus('finished'); statusRef.current = 'finished'
    setCurrentSpeaker(null)
    if (!abortRef.current?.signal.aborted) toast('讨论完成！可以查看成果了 🎉', 'success')
  }

  const pause = () => { setStatus('paused'); statusRef.current = 'paused' }
  const resume = () => { setStatus('running'); statusRef.current = 'running' }
  const stop = () => {
    if (abortRef.current) { abortRef.current.abort() }
    setStatus('idle'); statusRef.current = 'idle'
    setCurrentSpeaker(null)
    toast('已停止讨论', 'info')
  }
  const restart = () => {
    stop()
    setMessages([]); messagesRef.current = []
    setRound(-1)
    setStatus('idle'); statusRef.current = 'idle'
    setTimeout(() => runDiscussion(), 100)
  }
  const skipCurrent = () => {
    if (abortRef.current) abortRef.current.abort()
    toast('跳过当前发言', 'info')
  }
  const generateDocNow = async () => {
    setLoading(true, '正在生成设计文档...')
    abortRef.current = null
    setRound(5)
    const captainId = team.includes('captain') ? 'captain' : team[0]
    await speak(captainId, 5)
    const captainMsg = messagesRef.current.filter(m => m.round === 5 && m.role === 'agent').pop()
    if (captainMsg) {
      const doc = parseDesignDoc(captainMsg.content)
      doc.meta = { ...doc.meta, team, generatedAt: new Date().toISOString(), source: material?.filename }
      dispatch({ type: 'SET_DOC', payload: doc })
    }
    setStatus('finished'); statusRef.current = 'finished'
    setLoading(false)
    toast('文档已生成 🎁', 'success')
  }

  const sendInterjection = () => {
    const text = userInput.trim()
    if (!text) return
    const msg = { id: `user_${Date.now()}`, round, role: 'user', content: text, agentName: '你', agentEmoji: '🙋', timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, msg])
    messagesRef.current = [...messagesRef.current, msg]
    setPendingInterjection(text)
    interjectionRef.current = text
    setUserInput('')
    toast('已插入意见，下一个角色会回应你', 'info')
  }

  const summary = extractSummary(messages)

  const canStart = team.length >= 2 && status === 'idle'
  const isRunning = status === 'running'
  const isPaused = status === 'paused'
  const isFinished = status === 'finished'

  const engineMode = state.settings?.engineMode || 'demo'
  const engineInfo = engineMode === 'apikey'
    ? { emoji: '🔑', label: 'API', color: '#22ff9c' }
    : engineMode === 'localbridge'
    ? { emoji: '🌉', label: 'BRIDGE', color: '#ffb020' }
    : { emoji: '🎭', label: 'DEMO', color: '#b026ff' }

  const statusLabel = isRunning ? 'LIVE' : isPaused ? 'PAUSED' : isFinished ? 'COMPLETE' : 'STANDBY'
  const statusColor = isRunning ? '#22ff9c' : isPaused ? '#ffb020' : isFinished ? '#00e5ff' : '#5d7a99'

  return html`
    <div id="ws-root">
      <div class="ws-bg-grid"></div>
      <div class="ws-bg-glow"></div>
      <div class="ws-bg-scanlines"></div>

      <div class="ws-main">
        <!-- ── 顶部状态栏 ── -->
        <div class="ws-topbar">
          <div class="ws-topbar-left">
            <span class="ws-status-dot" style=${{ background: statusColor, boxShadow: `0 0 8px ${statusColor}` }}></span>
            <span class="ws-status-label" style=${{ color: statusColor }}>${statusLabel}</span>
            <span class="ws-divider">|</span>
            <span class="ws-round-info">
              ${round >= 0 && round < 6
                ? html`<span class="ws-round-emoji">${ROUND_INFO[round].emoji}</span> <span class="ws-round-name">${ROUND_INFO[round].name}</span> <span class="ws-round-code">[${ROUND_INFO[round].code}]</span>`
                : html`<span class="ws-round-emoji">${isFinished ? '🎉' : '🚀'}</span> <span class="ws-round-name">${isFinished ? '讨论已完成' : '准备就绪'}</span>`
              }
            </span>
          </div>
          <div class="ws-topbar-right">
            <button class="ws-engine-chip" onClick=${openSettings} title="AI 引擎设置">
              <span>${engineInfo.emoji}</span>
              <span style=${{ color: engineInfo.color }}>${engineInfo.label}</span>
            </button>
          </div>
        </div>

        <!-- ── 主体布局 ── -->
        <div class="ws-layout">
          <!-- ═══ 左侧：讨论控制台 ═══ -->
          <div class="ws-console">
            <!-- 控制按钮栏 -->
            <div class="ws-controls">
              ${status === 'idle' && html`
                <button class="ws-btn ws-btn-primary" onClick=${runDiscussion} disabled=${!canStart}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  <span>开始讨论</span>
                </button>
              `}
              ${isRunning && html`
                <button class="ws-btn ws-btn-ghost" onClick=${pause}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>
                  <span>暂停</span>
                </button>
              `}
              ${isRunning && html`
                <button class="ws-btn ws-btn-ghost" onClick=${skipCurrent}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                  <span>跳过</span>
                </button>
              `}
              ${isPaused && html`
                <button class="ws-btn ws-btn-primary" onClick=${resume}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  <span>继续</span>
                </button>
              `}
              ${(isRunning || isPaused) && html`
                <button class="ws-btn ws-btn-danger" onClick=${stop}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>
                  <span>停止</span>
                </button>
              `}
              ${messages.length > 0 && html`
                <button class="ws-btn ws-btn-ghost" onClick=${restart}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
                  <span>重来</span>
                </button>
              `}
              ${!isFinished && round >= 0 && html`
                <button class="ws-btn ws-btn-ghost" onClick=${generateDocNow}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 6c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 13H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/></svg>
                  <span>直接生成</span>
                </button>
              `}
              ${isFinished && html`
                <button class="ws-btn ws-btn-primary" onClick=${() => goStep(STEPS.PREVIEW)}>
                  <span>查看成果</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5.5 5l1.5-1.5L13 9.5 6.5 16 5 14.5 10 9.5z" transform="rotate(0 12 12)"/><path d="M11 5l1.5-1.5L18.5 9.5 12.5 16 11 14.5 16 9.5z"/></svg>
                </button>
              `}
              <div class="ws-controls-spacer"></div>
              <button class="ws-btn ws-btn-ghost ws-btn-sm" onClick=${goPrev}>
                <span>← 教材</span>
              </button>
            </div>

            <!-- 消息流 -->
            <div ref=${chatBoxRef} class="ws-chat-stream scrollbar-thin" onScroll=${(e) => {
              const el = e.target
              setAutoScroll(el.scrollHeight - el.scrollTop - el.clientHeight < 100)
            }}>
              ${messages.length === 0 ? html`
                <div class="ws-empty">
                  <div class="ws-empty-glyph">AWAITING_INPUT</div>
                  <div class="ws-empty-text">讨论尚未启动</div>
                  <div class="ws-empty-desc">点击「开始讨论」，观察 ${teamAgents.length} 个 AI 角色围绕教材展开协作</div>
                  <div class="ws-empty-team">
                    ${teamAgents.map(a => html`<span key=${a.id} class="ws-team-chip"><span class="ws-team-emoji">${a.emoji}</span> ${a.name}</span>`)}
                  </div>
                  ${!material && html`<div class="ws-empty-warn">⚠ 未上传教材，将使用演示数据</div>`}
                </div>
              ` : messages.map(m => html`<${WSMessage} key=${m.id} msg=${m} />`)}

              ${currentSpeaker && html`
                <div class="ws-typing">
                  <span class="ws-typing-emoji">${getAgent(currentSpeaker)?.emoji}</span>
                  <span class="ws-typing-name">${getAgent(currentSpeaker)?.name}</span>
                  <span class="ws-typing-text">正在生成</span>
                  <span class="ws-typing-dots"><span></span><span></span><span></span></span>
                </div>
              `}
              <div ref=${chatEndRef} />
            </div>

            <!-- 用户插话输入 -->
            <div class="ws-input-bar">
              <div class="ws-input-prompt">›</div>
              <input type="text" value=${userInput} onChange=${(e) => setUserInput(e.target.value)}
                onKeyDown=${(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendInterjection() } }}
                placeholder=${isRunning ? '插入意见，影响讨论走向...' : '讨论中可随时插话'}
                class="ws-input" />
              <button class="ws-btn ws-btn-primary ws-btn-sm" onClick=${sendInterjection} disabled=${!userInput.trim()}>
                <span>发送</span>
              </button>
            </div>
            ${pendingInterjection && html`<div class="ws-interjection-note">📌 待回应意见: "${pendingInterjection}"</div>`}
          </div>

          <!-- ═══ 右侧：HUD 侧边栏 ═══ -->
          <div class="ws-sidebar">
            <!-- 在线团队 -->
            <div class="ws-hud-panel">
              <div class="ws-hud-head">
                <span class="ws-hud-dot" style=${{ background: '#22ff9c', boxShadow: '0 0 6px #22ff9c' }}></span>
                <span class="ws-hud-label">ONLINE_TEAM</span>
                <span class="ws-hud-count">${teamAgents.length}</span>
              </div>
              <div class="ws-team-list">
                ${teamAgents.map((a, i) => html`
                  <div key=${a.id} class="ws-team-item ${currentSpeaker === a.id ? 'active' : ''}">
                    <div class="ws-team-avatar" style=${{ background: `linear-gradient(135deg, ${a.color || '#a78bfa'}, ${a.color || '#a78bfa'}aa)` }}>${a.emoji}</div>
                    <div class="ws-team-info">
                      <div class="ws-team-name">${a.name}</div>
                      <div class="ws-team-role">${a.role || 'AI Agent'}</div>
                    </div>
                    ${currentSpeaker === a.id
                      ? html`<span class="ws-team-status" style=${{ color: '#22ff9c' }}>SPEAKING</span>`
                      : html`<span class="ws-team-status" style=${{ color: '#5d7a99' }}>READY</span>`
                    }
                  </div>
                `)}
              </div>
            </div>

            <!-- 讨论进度 -->
            <div class="ws-hud-panel">
              <div class="ws-hud-head">
                <span class="ws-hud-dot" style=${{ background: '#00e5ff', boxShadow: '0 0 6px #00e5ff' }}></span>
                <span class="ws-hud-label">PROGRESS</span>
                <span class="ws-hud-count">${round >= 0 ? `${round + 1}/6` : '0/6'}</span>
              </div>
              <div class="ws-progress-list">
                ${ROUND_INFO.map((r, i) => {
                  const isDone = i < round
                  const isActive = i === round
                  return html`
                    <div key=${i} class="ws-progress-item ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}">
                      <div class="ws-progress-marker">
                        ${isDone ? '✓' : isActive ? '▶' : i + 1}
                      </div>
                      <div class="ws-progress-text">
                        <span class="ws-progress-name">${r.name}</span>
                        <span class="ws-progress-code">${r.code}</span>
                      </div>
                      ${isActive && html`<span class="ws-progress-bar"><span></span></span>`}
                    </div>
                  `
                })}
              </div>
            </div>

            <!-- 实时方案汇总 -->
            ${summary.has && html`
              <div class="ws-hud-panel">
                <div class="ws-hud-head">
                  <span class="ws-hud-dot" style=${{ background: '#b026ff', boxShadow: '0 0 6px #b026ff' }}></span>
                  <span class="ws-hud-label">LIVE_SUMMARY</span>
                </div>
                <div class="ws-summary-body">
                  ${summary.gameType && html`
                    <div class="ws-summary-row" style=${{ borderColor: 'rgba(255,176,32,0.3)' }}>
                      <span class="ws-summary-key">类型</span>
                      <span class="ws-summary-val" style=${{ color: '#ffb020' }}>${summary.gameType}</span>
                    </div>
                  `}
                  ${summary.concepts.length > 0 && html`
                    <div class="ws-summary-row" style=${{ borderColor: 'rgba(0,229,255,0.2)' }}>
                      <span class="ws-summary-key">概念</span>
                      <div class="ws-summary-tags">
                        ${summary.concepts.slice(0, 8).map(c => html`<span key=${c} class="ws-tag ws-tag-cyan">${c}</span>`)}
                      </div>
                    </div>
                  `}
                  ${summary.levels.length > 0 && html`
                    <div class="ws-summary-row" style=${{ borderColor: 'rgba(34,255,156,0.2)' }}>
                      <span class="ws-summary-key">关卡</span>
                      <div class="ws-summary-levels">
                        ${summary.levels.slice(0, 4).map((l, i) => html`<div key=${i} class="ws-level-item"><span class="ws-level-num">${i + 1}</span>${l}</div>`)}
                      </div>
                    </div>
                  `}
                  ${summary.formulas.length > 0 && html`
                    <div class="ws-summary-row" style=${{ borderColor: 'rgba(176,38,255,0.2)' }}>
                      <span class="ws-summary-key">公式</span>
                      <div class="ws-summary-tags">
                        ${summary.formulas.slice(0, 5).map((f, i) => html`<code key=${i} class="ws-tag ws-tag-purple">${f}</code>`)}
                      </div>
                    </div>
                  `}
                </div>
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `
}

// ── 消息气泡 ──
function WSMessage({ msg }) {
  if (msg.role === 'system') {
    return html`
      <div class="ws-msg-system">
        <span class="ws-msg-sys-line"></span>
        <span class="ws-msg-sys-text">${msg.content}</span>
        ${msg.code && html`<span class="ws-msg-sys-code">[${msg.code}]</span>`}
        <span class="ws-msg-sys-line"></span>
      </div>
    `
  }
  const isUser = msg.role === 'user'
  return html`
    <div class="ws-msg ${isUser ? 'ws-msg-user' : 'ws-msg-agent'}">
      <div class="ws-msg-avatar" style=${isUser
        ? { background: 'linear-gradient(135deg, #00e5ff, #b026ff)' }
        : { background: `linear-gradient(135deg, ${msg.agentColor || '#a78bfa'}, ${msg.agentColor || '#a78bfa'}cc)` }
      }>
        ${msg.agentEmoji}
      </div>
      <div class="ws-msg-body">
        <div class="ws-msg-meta">
          <span class="ws-msg-name">${msg.agentName}</span>
          ${msg.streaming ? html`<span class="ws-msg-stream">· STREAMING</span>` : null}
        </div>
        <div class="ws-msg-bubble ${isUser ? 'ws-bubble-user' : 'ws-bubble-agent'}">
          ${isUser ? msg.content : html`<${MarkdownView} content=${msg.content} />`}
        </div>
      </div>
    </div>
  `
}

// 从消息流提取实时汇总
function extractSummary(messages) {
  const summary = { has: false, gameType: '', concepts: [], levels: [], formulas: [] }
  const allText = messages.filter(m => m.role === 'agent').map(m => m.content).join('\n')

  const typeMatch = allText.match(/(?:游戏类型|类型)[：:]\s*\*{0,2}([^\n*]{2,15})/)
  if (typeMatch) { summary.gameType = typeMatch[1].trim(); summary.has = true }

  const conceptMatches = allText.match(/\|[\s\S]{2,30}\|[\s\S]{0,5}★/g)
  if (conceptMatches) {
    summary.concepts = conceptMatches.map(m => m.split('|')[1]?.trim()).filter(Boolean).slice(0, 10)
    if (summary.concepts.length) summary.has = true
  }

  const levelMatches = allText.match(/关卡\s*\d+[：:][^\n]{2,30}/g)
  if (levelMatches) {
    summary.levels = levelMatches.map(m => m.replace(/关\s*\d+[：:]/, '').trim()).slice(0, 5)
    if (summary.levels.length) summary.has = true
  }

  const formulaMatches = allText.match(/\$[^$\n]{2,50}\$/g)
  if (formulaMatches) {
    const uniq = [...new Set(formulaMatches.map(f => f.replace(/\$/g, '').trim()))]
    summary.formulas = uniq.slice(0, 6)
    if (summary.formulas.length) summary.has = true
  }

  return summary
}
