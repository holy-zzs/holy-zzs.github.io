// 智能体组队界面：角色市场 + 拖拽组队 + 团队管理（任务5）
import { html, useState, useRef } from '../../react.js'
import { useApp, STEPS } from '../../store/appContext.js'
import { Button, Modal, EmptyState } from '../common/ui.js'
import { AGENTS, getAgent, DEFAULT_TEAM, ROLE_TYPES, AGENT_ROLE_MAP } from '../../data/agents.js'
import { uid } from '../../lib/storage.js'

export default function AgentsView() {
  const { state, dispatch, toast, goStep, goPrev } = useApp()
  const [detail, setDetail] = useState(null) // 查看详情的角色
  const [saveOpen, setSaveOpen] = useState(false)
  const [loadOpen, setLoadOpen] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [draggingId, setDraggingId] = useState(null)
  const [dragOverIdx, setDragOverIdx] = useState(-1)

  const selected = state.selectedAgents || []
  const selectedAgents = selected.map(getAgent).filter(Boolean)

  const addAgent = (id) => {
    if (selected.includes(id)) return
    if (selected.length >= 8) { toast('团队最多8个成员', 'warning'); return }
    dispatch({ type: 'ADD_AGENT', payload: id })
  }
  const removeAgent = (id) => dispatch({ type: 'REMOVE_AGENT', payload: id })

  // 团队内拖拽排序
  const onDragStart = (e, id) => { setDraggingId(id); e.dataTransfer.effectAllowed = 'move' }
  const onDragOver = (e, idx) => { e.preventDefault(); setDragOverIdx(idx); e.dataTransfer.dropEffect = 'move' }
  const onDrop = (e, idx) => {
    e.preventDefault()
    if (!draggingId) return
    const arr = [...selected]
    const from = arr.indexOf(draggingId)
    if (from === idx) { setDraggingId(null); setDragOverIdx(-1); return }
    arr.splice(from, 1)
    arr.splice(idx, 0, draggingId)
    dispatch({ type: 'REORDER_AGENTS', payload: arr })
    setDraggingId(null); setDragOverIdx(-1)
  }
  // 从市场拖到团队区
  const onDropToTeam = (e) => {
    e.preventDefault()
    if (draggingId && !selected.includes(draggingId)) addAgent(draggingId)
    setDraggingId(null); setDragOverIdx(-1)
  }

  const useDefault = () => {
    dispatch({ type: 'SET_AGENTS', payload: [...DEFAULT_TEAM] })
    toast('已加载推荐团队（4核心角色）', 'success')
  }
  const clearTeam = () => { dispatch({ type: 'SET_AGENTS', payload: [] }); toast('团队已清空', 'info') }

  const saveTeam = () => {
    if (!teamName.trim()) { toast('请输入团队名称', 'warning'); return }
    if (selected.length === 0) { toast('团队为空，无法保存', 'warning'); return }
    const team = { id: uid('team'), name: teamName.trim(), agents: [...selected], createdAt: new Date().toISOString() }
    dispatch({ type: 'SET_SAVED_TEAMS', payload: [...state.savedTeams, team] })
    toast(`团队"${team.name}"已保存`, 'success')
    setSaveOpen(false); setTeamName('')
  }
  const loadTeam = (team) => {
    dispatch({ type: 'SET_AGENTS', payload: [...team.agents] })
    toast(`已加载团队"${team.name}"`, 'success')
    setLoadOpen(false)
  }
  const deleteTeam = (id) => {
    dispatch({ type: 'SET_SAVED_TEAMS', payload: state.savedTeams.filter(t => t.id !== id) })
    toast('团队已删除', 'info')
  }

  const canNext = selected.length >= 2
  const next = () => {
    if (!canNext) { toast('至少选2个智能体', 'warning'); return }
    goStep(STEPS.UPLOAD)
  }

  return html`
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-ink">🤖 智能体市场</h2>
          <p className="text-sm text-gray-500 mt-0.5">点击或拖拽角色到右侧团队区，组建你的AI战队（2-8人）</p>
        </div>
        <div className="flex gap-2">
          <${Button} variant=${'secondary'} size=${'sm'} onClick=${useDefault}>⚡ 推荐团队</${Button}>
          <${Button} variant=${'ghost'} size=${'sm'} onClick=${() => setLoadOpen(true)} disabled=${state.savedTeams.length === 0}>📂 我的团队(${state.savedTeams.length})</${Button}>
          <${Button} variant=${'ghost'} size=${'sm'} onClick=${() => setSaveOpen(true)} disabled=${selected.length === 0}>💾 保存团队</${Button}>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="grid sm:grid-cols-2 gap-3">
            ${AGENTS.map(a => {
              const isSel = selected.includes(a.id)
              return html`
                <div key=${a.id}
                  draggable=${true}
                  onDragStart=${(e) => onDragStart(e, a.id)}
                  onDragEnd=${() => { setDraggingId(null); setDragOverIdx(-1) }}
                  onClick=${() => setDetail(a)}
                  className="group relative p-4 rounded-2xl bg-white border-2 ${isSel ? 'border-brand-400 ring-2 ring-brand-200' : 'border-gray-200 hover:border-brand-300'} card-hover cursor-pointer ${draggingId === a.id ? 'dragging' : ''}">
                  ${isSel && html`<div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-bold">✓</div>`}
                  <div className="flex items-start gap-3">
                    <div className="avatar-ring shrink-0">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl">${a.emoji}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-ink text-sm">${a.name}</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-1">${a.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">${a.tagline}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    ${a.expertise.slice(0, 3).map(ex => html`<span key=${ex} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-600">${ex}</span>`)}
                  </div>
                </div>
              `
            })}
          </div>
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <div onDragOver=${(e) => { e.preventDefault(); setDragOverIdx(selected.length) }}
            onDrop=${onDropToTeam}
            className="bg-gradient-to-br from-brand-50 to-orange-50 rounded-3xl border-2 border-dashed ${selected.length === 0 ? 'border-brand-300' : 'border-brand-200'} p-4 min-h-[300px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-ink flex items-center gap-1.5">👥 我的团队 <span className="text-xs font-normal text-gray-500">(${selected.length}/8)</span></h3>
              ${selected.length > 0 && html`<button onClick=${clearTeam} className="text-xs text-gray-400 hover:text-red-500">清空</button>`}
            </div>

            ${selected.length === 0 ? html`
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2 opacity-50">🎯</div>
                <p className="text-sm">把左侧角色拖到这里<br/>或直接点击添加</p>
                <button onClick=${useDefault} className="mt-3 text-xs text-brand-500 hover:text-brand-700 font-medium">⚡ 用推荐团队</button>
              </div>
            ` : html`
              <div className="space-y-2">
                ${selectedAgents.map((a, idx) => html`
                  <div key=${a.id}
                    draggable=${true}
                    onDragStart=${(e) => { e.stopPropagation(); onDragStart(e, a.id) }}
                    onDragOver=${(e) => onDragOver(e, idx)}
                    onDrop=${(e) => onDrop(e, idx)}
                    onDragEnd=${() => { setDraggingId(null); setDragOverIdx(-1) }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white shadow-sm border ${dragOverIdx === idx ? 'drag-over' : 'border-transparent'} ${draggingId === a.id ? 'dragging' : ''} cursor-grab active:cursor-grabbing transition-all">
                    <span className="text-gray-300 text-xs cursor-grab">⋮⋮</span>
                    <span className="text-xs font-mono text-gray-400 w-4">${idx + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br ${a.gradient} flex items-center justify-center text-base">${a.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-ink truncate">${a.name}</div>
                      <div className="text-[10px] text-gray-400 truncate">${a.title}</div>
                    </div>
                    <button onClick=${() => removeAgent(a.id)} className="text-gray-300 hover:text-red-500 text-lg leading-none px-1">×</button>
                  </div>
                `)}
              </div>
            `}

            ${selected.length > 0 && html`
              <div className="mt-3 pt-3 border-t border-brand-200">
                <p className="text-xs text-gray-500 mb-2">团队定位</p>
                <div className="flex flex-wrap gap-1">
                  ${[...new Set(selectedAgents.map(a => AGENT_ROLE_MAP[a.id]))].map(role => {
                    const labels = { pm: '📋管理', knowledge: '📚知识', design: '🎮设计', experience: '🫠体验', art: '🎨美术', narrative: '🎭叙事', level: '🧩关卡', numbers: '📊数值', user: '🛋️用户', qa: '🔍质检', creative: '💡创意', tech: '⚙️技术' }
                    return html`<span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-gray-600 border border-gray-200">${labels[role]}</span>`
                  })}
                </div>
              </div>
            `}
          </div>

          <div className="mt-4 flex gap-2">
            <${Button} variant=${'ghost'} onClick=${goPrev}>← 偏好</${Button}>
            <${Button} onClick=${next} disabled=${!canNext} className=${'flex-1 justify-center'}>
              团队就位，去传教材 →
            <//>
          </div>
          ${!canNext && html`<p className="text-xs text-center text-gray-400 mt-1">至少选2个智能体才能开干</p>`}
        </div>
      </div>

      <${Modal} open=${!!detail} onClose=${() => setDetail(null)} title=${detail ? `${detail.emoji} ${detail.name}` : ''} size=${'md'}>
        ${detail && html`
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="avatar-ring"><div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl">${detail.emoji}</div></div>
              <div>
                <h4 className="text-lg font-black text-ink">${detail.name}</h4>
                <p className="text-sm text-brand-600">${detail.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">"${detail.tagline}"</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1">背景故事</p>
              <p className="text-sm text-gray-600 leading-relaxed">${detail.background}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-bold text-gray-400 mb-1">专业领域</p>
                <div className="flex flex-wrap gap-1">${detail.expertise.map(e => html`<span key=${e} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-600">${e}</span>`)}</div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 mb-1">技能</p>
                <div className="flex flex-wrap gap-1">${detail.skills.map(s => html`<span key=${s} className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">${s}</span>`)}</div>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1">发言风格</p>
              <p className="text-sm text-gray-600 italic">"${detail.speakingStyle}"</p>
            </div>
            <div className="flex gap-2 pt-2">
              ${selected.includes(detail.id) ? html`
                <${Button} variant=${'secondary'} className=${'flex-1 justify-center'} onClick=${() => { removeAgent(detail.id); setDetail(null) }}>移出团队</${Button}>
              ` : html`
                <${Button} className=${'flex-1 justify-center'} onClick=${() => { addAgent(detail.id); setDetail(null) }}>加入团队</${Button}>
              `}
            </div>
          </div>
        `}
      <//>

      <${Modal} open=${saveOpen} onClose=${() => setSaveOpen(false)} title=${'💾 保存当前团队'} size=${'sm'}
        footer=${html`<${Button} variant=${'ghost'} onClick=${() => setSaveOpen(false)}>取消</${Button}><${Button} onClick=${saveTeam}>保存</${Button}>`}>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">为这个团队起个名字，方便下次直接调用</p>
          <input type="text" value=${teamName} onChange=${(e) => setTeamName(e.target.value)} placeholder="如：理科克星小队"
            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-brand-400 outline-none text-sm" />
          <div className="flex flex-wrap gap-1.5">
            ${selectedAgents.map(a => html`<span key=${a.id} className="text-xs px-2 py-1 rounded-full bg-brand-50 text-brand-600">${a.emoji} ${a.name}</span>`)}
          </div>
        </div>
      <//>

      <${Modal} open=${loadOpen} onClose=${() => setLoadOpen(false)} title=${'📂 我的团队'} size=${'md'}>
        ${state.savedTeams.length === 0 ? html`
          <${EmptyState} emoji=${'📂'} title=${'还没有保存的团队'} desc=${'组好队后点"保存团队"即可复用'} />
        ` : html`
          <div className="space-y-2">
            ${state.savedTeams.map(t => html`
              <div key=${t.id} className="p-3 rounded-2xl border-2 border-gray-200 hover:border-brand-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-bold text-ink">${t.name}</span>
                    <span className="text-xs text-gray-400 ml-2">${t.agents.length}人 · ${new Date(t.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick=${() => loadTeam(t)} className="text-xs px-3 py-1 rounded-lg bg-brand-500 text-white hover:bg-brand-600">加载</button>
                    <button onClick=${() => deleteTeam(t.id)} className="text-xs px-2 py-1 rounded-lg text-red-500 hover:bg-red-50">删</button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  ${t.agents.map(id => { const a = getAgent(id); return a ? html`<span key=${id} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">${a.emoji} ${a.name}</span>` : null })}
                </div>
              </div>
            `)}
          </div>
        `}
      <//>
    </div>
  `
}
