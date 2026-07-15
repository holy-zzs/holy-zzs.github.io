import { html, useState, useEffect } from '../../../deps.js'

const AGENTS = [
  { 
    key: 'world', 
    name: '世界观策划者', 
    role: '设定与主题', 
    accent: '#a78bfa',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20retro-futuristic%20cyberpunk%20anime%20character%20portrait%20of%20a%20game%20world%20designer%2C%20wearing%20neon%20violet%20VR%20goggles%2C%20highly%20detailed%2C%208k&image_size=square',
    position: { top: '15%', left: '15%' },
    message: '我提议将其包装成“微观宇宙飞船探索”游戏，玩家扮演抗体去消灭病毒。'
  },
  { 
    key: 'systems', 
    name: '玩法架构师', 
    role: '机制与循环', 
    accent: '#f5a623',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20retro-futuristic%20anime%20character%20portrait%20of%20a%20logic%20programmer%2C%20wearing%20a%20gold%20tech%20jacket%2C%20holographic%20data%20floating%20around%2C%208k&image_size=square',
    position: { top: '15%', right: '15%' },
    message: '赞同，核心循环可以是：探索 -> 收集能量 -> 解锁新技能。'
  },
  { 
    key: 'levels', 
    name: '关卡导演', 
    role: '节奏与任务', 
    accent: '#55d8d8',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20retro-futuristic%20anime%20character%20portrait%20of%20a%20level%20director%2C%20cyan%20neon%20lighting%2C%20holding%20a%20digital%20blueprint%2C%20highly%20detailed%2C%208k&image_size=square',
    position: { top: '50%', left: '8%' },
    message: '我们可以分三关：细胞膜防线、细胞质迷宫、细胞核解码。'
  },
  { 
    key: 'visual', 
    name: '视觉导演', 
    role: '风格与界面', 
    accent: '#f472b6',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20retro-futuristic%20anime%20character%20portrait%20of%20a%20visual%20artist%2C%20pink%20hair%2C%20cyberpunk%20style%2C%20holding%20a%20glowing%20stylus%2C%20highly%20detailed%2C%208k&image_size=square',
    position: { top: '50%', right: '8%' },
    message: '我会生成霓虹风格的赛博朋克细胞图，配合微观电子乐。'
  },
  { 
    key: 'delivery', 
    name: '交付协调者', 
    role: '成果与演示', 
    accent: '#4ade80',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20retro-futuristic%20anime%20character%20portrait%20of%20a%20project%20manager%2C%20green%20neon%20accents%2C%20cybernetic%20enhancements%2C%20confident%20look%2C%208k&image_size=square',
    position: { bottom: '15%', left: '50%', transform: 'translateX(-50%)' },
    message: 'JSON 配置组装完成！正在构建 HTML5 游戏包，准备发布分享链接。'
  },
]

export default function RoundtableStage() {
  const [activeAgentIndex, setActiveAgentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAgentIndex((prev) => (prev + 1) % AGENTS.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  return html`
    <div class="crt-monitor" aria-label="AI 圆桌游戏设计演示大屏">
      <div class="crt-bezel">
        <div class="crt-screen">
          <div class="crt-stars">
            ${Array.from({ length: 30 }).map((_, i) => html`
              <div key=${i} class="crt-star" style=${{
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 3 + 's',
                width: Math.random() * 2 + 1 + 'px',
                height: Math.random() * 2 + 1 + 'px'
              }}></div>
            `)}
          </div>
          
          <div class="crt-grid-floor"></div>
          <div class="crt-scanlines"></div>

          <div class="crt-holo-table">
            <div class="crt-holo-ring crt-holo-ring-1"></div>
            <div class="crt-holo-ring crt-holo-ring-2"></div>
            <div class="crt-holo-core">
              <span class="neon-text" style=${{color: '#a78bfa', fontSize: '10px', fontWeight: 'bold'}}>AI.CORE</span>
            </div>
          </div>

          ${AGENTS.map((agent, index) => {
            const isActive = index === activeAgentIndex;
            return html`
              <div key=${agent.key} class="crt-agent" style=${agent.position}>
                <div class=${`crt-avatar-wrap ${isActive ? 'crt-avatar-active' : ''}`} style=${{borderColor: isActive ? agent.accent : 'rgba(255,255,255,0.15)'}}>
                  <img src=${agent.avatar} alt=${agent.name} class="crt-avatar-img" />
                  ${isActive ? html`<div class="crt-avatar-pulse" style=${{borderColor: agent.accent}}></div>` : null}
                </div>
                <div class="crt-nameplate" style=${{borderColor: agent.accent, color: agent.accent}}>
                  <span>${agent.name}</span>
                  <span class="crt-nameplate-role">${agent.role}</span>
                </div>
              </div>
            `
          })}

          <!-- Central Chat Display -->
          <div class="crt-central-chat">
            <div class="crt-chat-name" style=${{ color: AGENTS[activeAgentIndex].accent }}>
              > ${AGENTS[activeAgentIndex].name} 正在输入...
            </div>
            <div class="crt-chat-message" style=${{ borderColor: AGENTS[activeAgentIndex].accent }}>
              <span class="typing-text" key=${activeAgentIndex}>${AGENTS[activeAgentIndex].message}</span>
              <span class="crt-cursor">_</span>
            </div>
          </div>

          <div class="crt-statusbar">
            <div class="crt-status-left">
              <div class="crt-status-dot"></div>
              <span class="crt-status-text">PIPELINE: ACTIVE</span>
              <span class="crt-status-sep">|</span>
              <span class="crt-status-text">AGENTS: 5/5 ONLINE</span>
            </div>
            <div class="crt-status-right">
              <span class="crt-status-text" style=${{color: '#f5a623'}}>GENERATING HTML5_GAME_BUNDLE...</span>
            </div>
          </div>
        </div>
      </div>
      <div class="crt-stand">
        <div class="crt-stand-neck"></div>
        <div class="crt-stand-base"></div>
      </div>
    </div>
  `
}
