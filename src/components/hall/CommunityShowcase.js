// 社区展示：海报式大色块横向滚动墙
import { html, useState, useRef, useEffect } from '../../react.js'
import { useHall } from './GameHall.js'
import { useApp, STEPS } from '../../store/appContext.js'
import { getAgents } from '../../data/agents.js'
import { COMMUNITY_CREATIONS } from '../../data/community.js'
import { audio } from '../../lib/audio.js'

export default function CommunityShowcase() {
  const { triggerAuth, goStep, STEPS } = useHall()
  const { state, dispatch, toast } = useApp()
  const [filter, setFilter] = useState('all')
  const [hovered, setHovered] = useState(null)
  const scrollRef = useRef(null)

  // 合并 mock + 用户创作
  const allCreations = [...COMMUNITY_CREATIONS, ...state.hall.creations]

  const filters = [
    { id: 'all', label: '全部' },
    { id: '数学', label: '数学' },
    { id: '物理', label: '物理' },
    { id: '化学', label: '化学' },
    { id: '生物', label: '生物' },
    { id: '语文', label: '语文' },
    { id: '历史', label: '历史' }
  ]

  const filtered = filter === 'all' ? allCreations : allCreations.filter(c => c.topic.includes(filter))

  const cloneTeam = (creation) => {
    audio.sfx('coin')
    dispatch({ type: 'SET_AGENTS', payload: creation.team })
    if (!state.user) {
      triggerAuth('注册后可引用这支团队开始创作', 'after_clone')
    } else {
      goStep(STEPS.PRESET)
    }
  }

  const tryPlay = (creation) => {
    audio.sfx('coin')
    toast('试玩功能开发中…先体验黑洞吞噬小游戏吧！', 'info')
  }

  return html`
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-3" style=${{ fontFamily: 'Orbitron, sans-serif' }}>
          奇思妙想信号站
        </h2>
        <p className="text-sm text-purple-300">看看大家把什么教材变成了游戏</p>
      </div>

      {/* 筛选栏：复古调频旋钮风格 */}
      <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
        ${filters.map(f => html`
          <button key=${f.id}
            onClick=${() => { audio.sfx('click'); setFilter(f.id) }}
            className="px-4 py-2 text-xs font-bold rounded-full transition-all"
            style=${{
              background: filter === f.id ? 'linear-gradient(135deg, #d946ef, #f97316)' : 'rgba(20,10,53,0.6)',
              color: filter === f.id ? 'white' : '#c4b5fd',
              border: filter === f.id ? 'none' : '1px solid rgba(217,70,239,0.15)'
            }}>
            ${f.label}
          </button>
        `)}
      </div>

      {/* 卡带墙 */}
      ${filtered.length === 0 ? html`
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🛠️</div>
          <p className="text-purple-300 text-sm">新的知识星系正在形成，你的作品将成为这里的超新星 ✨</p>
        </div>
      ` : html`
        <div ref=${scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 snap-x">
          ${filtered.map(c => {
            const team = getAgents(c.team)
            return html`
              <div key=${c.id}
                onMouseEnter=${() => { setHovered(c.id); audio.sfx('click') }}
                onMouseLeave=${() => setHovered(null)}
                className="flex-shrink-0 w-72 snap-center rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group"
                style=${{
                  background: 'rgba(20,10,53,0.6)',
                  border: '1px solid rgba(217,70,239,0.15)',
                  backdropFilter: 'blur(10px)',
                  transform: hovered === c.id ? 'scale(1.05) translateY(-4px)' : 'scale(1)'
                }}>

                {/* 封面：海报式大色块 */}
                <div className="relative h-40 overflow-hidden"
                  style=${{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}>
                  <div className="absolute inset-0 bg-gradient-to-br ${c.gradient}"></div>
                  <div className="absolute inset-0 flex flex-col justify-between p-4">
                    <div className="flex items-center gap-1">
                      ${team.slice(0, 4).map(a => html`
                        <span key=${a.id} className="text-lg" title=${a.name}>${a.emoji}</span>
                      `)}
                    </div>
                    <div>
                      <p className="text-xs text-white/70 mb-1">${c.topic}</p>
                      <h3 className="text-lg font-black text-white leading-tight">${c.title}</h3>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/30 text-xs text-white">
                    ❤️ ${c.likes}
                  </div>
                </div>

                {/* 底部信息 + 按钮 */}
                <div className="p-4">
                  <p className="text-xs text-purple-300 mb-3 leading-relaxed">${c.desc}</p>
                  <div className="flex gap-2">
                    <button onClick=${() => tryPlay(c)}
                      className="flex-1 py-2 text-xs font-bold rounded-full text-white transition-all hover:scale-105"
                      style=${{ background: 'rgba(69,226,154,0.2)', border: '1px solid rgba(69,226,154,0.3)' }}>
                      ▶️ 试玩
                    </button>
                    <button onClick=${() => cloneTeam(c)}
                      className="flex-1 py-2 text-xs font-bold rounded-full text-white transition-all hover:scale-105"
                      style=${{ background: 'rgba(217,70,239,0.2)', border: '1px solid rgba(217,70,239,0.3)' }}>
                      📥 引用团队
                    </button>
                  </div>
                </div>
              </div>
            `
          })}
        </div>
      `}
    </div>
  `
}
