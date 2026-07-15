// 游戏广场 · 全息模组匣子 (Holo-Cartridges)
// 完全按设计稿实现：深空赛博 HUD 主题，双霓虹（青/紫）
// 含矩阵雨、英雄轮播、终端检索、Bento 模组匣子、侧边 HUD 4面板、状态栏
// 交互：搜索 / Tab 过滤 / 流派 chip / 排序 / 网格-列表切换 / 悬停解码 / 触摸滑动
import { html, useState, useEffect, useRef, useCallback, useMemo } from '../../react.js'
import { useApp, STEPS } from '../../store/appContext.js?v=ctx2'

/* ============================ 数据 ============================ */

const PLAZA_IMG = (n) => `/assets/plaza/image_${n}_yi19x4.jpg`

const CARTRIDGES = [
  { id: 'neon',    name: '霓虹反叛',         img: PLAZA_IMG(0), cyan: '动作',   purple: '赛博',   creator: '@霓虹守望者',    sync: 98, fill: 90, nodes: 14204, accent: 'cyan',   size: 'big',   hot: true,  featured: true,  isNew: false, popular: 100, rating: 4.9, picked: true },
  { id: 'exodus',  name: '远征 Prime',       img: PLAZA_IMG(1), cyan: '策略',   purple: '太空',   creator: '@舰队架构师',    sync: 96, fill: 80, nodes: 12807, accent: 'cyan',   size: 'big',   hot: false, featured: true,  isNew: true,  popular: 94,  rating: 4.8, picked: true },
  { id: 'quantum', name: '量子劫案',         img: PLAZA_IMG(3), cyan: '解谜',   purple: '霓虹',   creator: '@密码虚无',      sync: 94, fill: 70, nodes: 9712,  accent: 'purple', size: 'big',   hot: false, featured: false, isNew: true,  popular: 82,  rating: 4.7, picked: false },
  { id: 'shadow',  name: '暗影协议',         img: PLAZA_IMG(4), cyan: '潜行',   purple: '黑色',   creator: '@幽灵向量',      sync: 92, fill: 60, nodes: 8401,  accent: 'cyan',   size: 'std',   hot: false, featured: false, isNew: false, popular: 76,  rating: 4.5, picked: false },
  { id: 'mech',    name: '机甲战士',         img: PLAZA_IMG(5), cyan: '动作',   purple: '战争',   creator: '@钢铁工匠',      sync: 90, fill: 50, nodes: 7103,  accent: 'cyan',   size: 'std',   hot: false, featured: false, isNew: true,  popular: 71,  rating: 4.3, picked: false },
  { id: 'void',    name: '虚空探索者',       img: PLAZA_IMG(2), cyan: '冒险',   purple: '异星',   creator: '@深渊漂泊者',    sync: 97, fill: 85, nodes: 6701,  accent: 'cyan',   size: 'tall',  hot: true,  featured: false, isNew: false, popular: 88,  rating: 4.8, picked: true },
  { id: 'celest',  name: '星辰边境',         img: PLAZA_IMG(6), cyan: '探索',   purple: '太空',   creator: '@星辰制图师',    sync: 95, fill: 75, nodes: 6348,  accent: 'cyan',   size: 'tall',  hot: false, featured: false, isNew: false, popular: 66,  rating: 4.6, picked: true },
  { id: 'dystop',  name: '反乌托邦: 2099',   img: PLAZA_IMG(0), cyan: '角色扮演', purple: '赛博',   creator: '@铬金先知',      sync: 88, fill: 40, nodes: 5802,  accent: 'purple', size: 'std',   hot: false, featured: false, isNew: false, popular: 60,  rating: 4.2, picked: false },
  { id: 'ancient', name: '远古王朝',         img: PLAZA_IMG(7), cyan: '策略',   purple: '神话',   creator: '@王朝守护者',    sync: 91, fill: 55, nodes: 4917,  accent: 'purple', size: 'std',   hot: false, featured: false, isNew: false, popular: 54,  rating: 4.4, picked: false },
  { id: 'synth',   name: '合成噩梦',         img: PLAZA_IMG(8), cyan: '恐怖',   purple: '生物机械', creator: '@血肉熔炉',    sync: 89, fill: 45, nodes: 5204,  accent: 'purple', size: 'std',   hot: false, featured: false, isNew: true,  popular: 58,  rating: 4.1, picked: false },
]

const SLIDES = [
  { idx: '01 / 03', name: '霓虹反叛',     tag: '在霓虹浸透的废墟街道，点燃最后的反叛信号。',     nodes: 14204, sync: 98, img: PLAZA_IMG(0) },
  { idx: '02 / 03', name: '远征 Prime',   tag: '率领残存舰队穿越虚空，重启人类的星辰远征。',     nodes: 12807, sync: 96, img: PLAZA_IMG(1) },
  { idx: '03 / 03', name: '虚空探索者',   tag: '孤身踏上异星荒原，解码双月之下的远古回响。',     nodes: 6701,  sync: 97, img: PLAZA_IMG(2) },
]

const TABS = [
  { id: 'all',       label: '全部游戏 · 247' },
  { id: 'featured',  label: '精选推荐' },
  { id: 'new',       label: '最新发布' },
  { id: 'popular',   label: '热门流行' },
  { id: 'library',   label: '我的资料库' },
]

const FILTER_CHIPS = [
  { id: 'combat',  label: '战斗类型', genres: ['动作', '战争', '潜行', '恐怖'] },
  { id: 'theme',   label: '题材领域', genres: ['赛博', '太空', '异星', '黑色', '霓虹'] },
  { id: 'mode',    label: '作战模式', genres: ['策略', '解谜', '角色扮演', '探索', '冒险', '神话', '生物机械'] },
]

const SORTS = [
  { id: 'popular', label: 'POPULARITY' },
  { id: 'sync',    label: 'SYNC_RATE' },
  { id: 'name',    label: 'A_TO_Z' },
]

/* ============================ CSS（设计稿原样，作用域限定在 #gpz-root） ============================ */

const CSS = `
#gpz-root{
  --gph-background:#05070d; --gph-background-2:#080c16;
  --gph-surface:#0b1120; --gph-surface-2:#0e1528; --gph-surface-3:#111a30;
  --gph-foreground:#e8f6ff; --gph-foreground-muted:#8aa6c2; --gph-foreground-dim:#5d7a99;
  --gph-card:#0a1120; --gph-card-foreground:#d6ecff;
  --gph-popover:#0a1424; --gph-popover-foreground:#e2f1ff;
  --gph-primary:#00e5ff; --gph-primary-foreground:#021018;
  --gph-primary-50:#e6fcff; --gph-primary-100:#b3f5ff; --gph-primary-200:#80efff;
  --gph-primary-300:#4de9ff; --gph-primary-400:#1ae3ff; --gph-primary-500:#00e5ff;
  --gph-primary-600:#00b8cc; --gph-primary-700:#008a99; --gph-primary-800:#005c66; --gph-primary-900:#003e44;
  --gph-muted:#0d1626; --gph-muted-foreground:#5d7a99;
  --gph-border:#14283f; --gph-border-soft:#0f2034; --gph-input:#0d1828; --gph-ring:#00e5ff;
  --gph-neon-cyan:#00e5ff; --gph-neon-cyan-soft:#6cf2ff;
  --gph-neon-purple:#b026ff; --gph-neon-purple-soft:#c96bff;
  --gph-neon-magenta:#ff2bd0; --gph-neon-amber:#ffb020; --gph-neon-green:#22ff9c; --gph-neon-red:#ff3b5e;
  --gph-radius-sm:2px; --gph-radius-md:6px; --gph-radius-lg:12px;
  --gph-font-display:'Michroma','Orbitron','Noto Sans SC',sans-serif;
  --gph-font-mono:'Share Tech Mono','JetBrains Mono','Consolas',monospace;
  --gph-font-body:'Inter','Noto Sans SC',system-ui,sans-serif;
  --gph-glow-cyan:0 0 14px rgba(0,229,255,.55),0 0 38px rgba(0,229,255,.28);
  --gph-glow-purple:0 0 14px rgba(176,38,255,.55),0 0 38px rgba(176,38,255,.28);
  --gph-glow-soft:0 0 0 1px rgba(0,229,255,.18);
  position:relative; z-index:10; min-height:100vh; overflow-x:hidden;
  background:var(--gph-background); color:var(--gph-foreground);
  font-family:var(--gph-font-body); -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility;
}
#gpz-root *{box-sizing:border-box;}
#gpz-root .gph-scanlines{background-image:repeating-linear-gradient(0deg,rgba(0,229,255,.06) 0,rgba(0,229,255,.06) 1px,transparent 1px,transparent 3px);}
#gpz-root .gph-grid-bg{background-image:linear-gradient(rgba(0,229,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,.05) 1px,transparent 1px);background-size:44px 44px;}
#gpz-root ::selection{background:rgba(0,229,255,.3);color:var(--gph-foreground);}

/* background layers (fixed, z-0) */
#gpz-root .gpz-matrix{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.92;will-change:transform;}
#gpz-root .gpz-bg-grid{position:fixed;inset:-2px;z-index:0;pointer-events:none;opacity:.4;will-change:transform;}
#gpz-root .gpz-bg-vignette{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 120% 90% at 50% 40%,transparent 35%,rgba(5,7,13,.55) 72%,rgba(5,7,13,.92) 100%);}
#gpz-root .gpz-bg-glow{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(circle at 12% 8%,rgba(0,229,255,.10),transparent 38%),radial-gradient(circle at 88% 14%,rgba(176,38,255,.10),transparent 40%);}
#gpz-root .gpz-main{position:relative;z-index:10;padding-bottom:64px;}
#gpz-root html,#gpz-root body{overflow-x:hidden;}

/* ---------- 3. TOP CONSOLE BAR ---------- */
#gpz-root .topbar{
  position:sticky; top:0; z-index:40; height:58px;
  display:flex; align-items:center; gap:16px; padding:0 20px;
  background:rgba(5,7,13,0.82); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
}
#gpz-root .topbar::after{
  content:""; position:absolute; left:0; right:0; bottom:-1px; height:1px;
  background:linear-gradient(90deg,var(--gph-neon-cyan) 0%,rgba(0,229,255,0.4) 30%,transparent 75%);
  opacity:0.7;
}
#gpz-root .brand{display:flex;align-items:center;gap:10px;cursor:pointer;}
#gpz-root .brand .hex-logo{width:26px;height:26px;flex:none;filter:drop-shadow(0 0 5px rgba(0,229,255,0.6));}
#gpz-root .brand-name{font-family:var(--gph-font-display);font-size:13px;letter-spacing:0.12em;color:var(--gph-foreground);}
#gpz-root .brand-ver{font-family:var(--gph-font-mono);font-size:11px;color:var(--gph-foreground-dim);}
#gpz-root .status-pills{display:flex;align-items:center;gap:14px;margin-left:6px;}
#gpz-root .pill-status{display:inline-flex;align-items:center;gap:7px;font-family:var(--gph-font-mono);font-size:11px;letter-spacing:0.06em;color:var(--gph-foreground-muted);white-space:nowrap;}
#gpz-root .pill-status .dot{width:7px;height:7px;border-radius:50%;flex:none;}
#gpz-root .dot-green{background:var(--gph-neon-green);box-shadow:0 0 7px rgba(34,255,156,0.8);}
#gpz-root .dot-cyan{background:var(--gph-neon-cyan);box-shadow:0 0 7px rgba(0,229,255,0.8);animation:gpz-pulse-soft 2.2s infinite;}
#gpz-root .dot-red{background:var(--gph-neon-red);}
#gpz-root .topbar-spacer{flex:1 1 auto;}
#gpz-root .topbar-right{display:flex;align-items:center;gap:14px;}
#gpz-root .bell{position:relative;width:22px;height:22px;color:var(--gph-foreground-muted);display:grid;place-items:center;background:none;border:none;cursor:pointer;}
#gpz-root .bell svg{width:20px;height:20px;}
#gpz-root .bell .badge{position:absolute;top:-4px;right:-6px;min-width:15px;height:15px;padding:0 3px;display:grid;place-items:center;font-family:var(--gph-font-mono);font-size:9px;color:var(--gph-foreground);background:var(--gph-neon-magenta);clip-path:polygon(0 0,100% 0,100% 70%,70% 100%,0 100%);}
#gpz-root .credits{display:inline-flex;align-items:center;gap:6px;font-family:var(--gph-font-mono);font-size:12px;color:var(--gph-neon-amber);white-space:nowrap;}
#gpz-root .credits .diamond{color:var(--gph-neon-amber);filter:drop-shadow(0 0 4px rgba(255,176,32,0.7));}
#gpz-root .cmdr{display:flex;align-items:center;gap:9px;}
#gpz-root .hex-avatar{width:30px;height:30px;flex:none;display:grid;place-items:center;font-family:var(--gph-font-mono);font-size:10px;color:var(--gph-primary-foreground);font-weight:700;clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%);background:linear-gradient(135deg,var(--gph-neon-cyan),var(--gph-neon-purple-soft));filter:drop-shadow(0 0 5px rgba(0,229,255,0.5));}
#gpz-root .cmdr-name{font-family:var(--gph-font-mono);font-size:12px;color:var(--gph-foreground);white-space:nowrap;}
#gpz-root .lv-chip{font-family:var(--gph-font-mono);font-size:10px;color:var(--gph-neon-cyan);padding:2px 6px;border:1px solid rgba(0,229,255,0.45);clip-path:polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,5px 100%,0 calc(100% - 5px));white-space:nowrap;}

/* ---------- 4. HERO CAROUSEL ---------- */
#gpz-root .hero{max-width:1600px;margin:0 auto;padding:24px 20px 28px;}
#gpz-root .hero-head{display:flex;align-items:center;gap:14px;margin-bottom:14px;flex-wrap:wrap;}
#gpz-root .hero-eyebrow{font-family:var(--gph-font-mono);text-transform:uppercase;letter-spacing:0.24em;font-size:12px;color:var(--gph-neon-cyan);}
#gpz-root .hero-zh{font-family:var(--gph-font-display);font-size:13px;color:var(--gph-foreground-muted);letter-spacing:0.1em;}
#gpz-root .hero-swipe{margin-left:auto;font-family:var(--gph-font-mono);font-size:11px;color:var(--gph-foreground-dim);letter-spacing:0.18em;}
#gpz-root .slides{position:relative;min-height:540px;}
#gpz-root .slide{position:absolute;inset:0;display:flex;gap:18px;opacity:0;pointer-events:none;transition:opacity 0.6s ease;}
#gpz-root .slide.active{opacity:1;pointer-events:auto;}
#gpz-root .slide-text{flex:0 0 42%;display:flex;flex-direction:column;justify-content:center;gap:14px;padding:28px 26px;background:rgba(8,12,22,0.66);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(0,229,255,0.16);clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px));}
#gpz-root .slide-index{font-family:var(--gph-font-mono);font-size:12px;color:var(--gph-foreground-dim);letter-spacing:0.2em;}
#gpz-root .slide-name{font-family:var(--gph-font-display);font-size:clamp(2.1rem,4.4vw,3.6rem);line-height:1.04;color:var(--gph-foreground);margin:0;text-shadow:0 0 18px rgba(0,229,255,0.45);text-wrap:balance;}
#gpz-root .slide-tag{font-family:var(--gph-font-body);font-size:14px;color:var(--gph-foreground-muted);line-height:1.6;max-width:46ch;}
#gpz-root .slide-stats{display:flex;gap:16px;flex-wrap:wrap;}
#gpz-root .slide-stats span{font-family:var(--gph-font-mono);font-size:11px;color:var(--gph-neon-cyan-soft);letter-spacing:0.08em;}
#gpz-root .slide-cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:4px;}
#gpz-root .slide-media{flex:1 1 auto;position:relative;overflow:hidden;border:1px solid rgba(0,229,255,0.14);clip-path:polygon(0 0,100% 0,100% 100%,0 100%,0 16px);min-height:280px;touch-action:pan-y;}
#gpz-root .slide-media img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;-webkit-mask-image:linear-gradient(to right,transparent,var(--gph-foreground) 14%,var(--gph-foreground) 92%,transparent);mask-image:linear-gradient(to right,transparent,var(--gph-foreground) 14%,var(--gph-foreground) 92%,transparent);}
#gpz-root .hero-scan{position:absolute;inset:0;pointer-events:none;opacity:0.5;}
#gpz-root .slide-media .crosshair{position:absolute;inset:14px;pointer-events:none;}
#gpz-root .timecode{position:absolute;top:12px;left:12px;font-family:var(--gph-font-mono);font-size:10px;color:var(--gph-neon-cyan-soft);background:rgba(5,7,13,0.6);padding:3px 7px;border:1px solid rgba(0,229,255,0.3);letter-spacing:0.1em;}
#gpz-root .live-feed{position:absolute;top:12px;right:12px;display:inline-flex;align-items:center;gap:6px;font-family:var(--gph-font-mono);font-size:10px;color:var(--gph-neon-red);background:rgba(5,7,13,0.6);padding:3px 7px;border:1px solid rgba(255,59,94,0.4);letter-spacing:0.1em;}
#gpz-root .live-feed .dot-red{width:6px;height:6px;border-radius:50%;background:var(--gph-neon-red);animation:gpz-pulse-dot 1.4s infinite;}
#gpz-root .carousel-nav{display:flex;align-items:center;justify-content:center;gap:18px;margin-top:16px;}
#gpz-root .chev{width:34px;height:34px;display:grid;place-items:center;color:var(--gph-neon-cyan-soft);background:rgba(8,12,22,0.6);border:1px solid rgba(0,229,255,0.25);clip-path:polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px));cursor:pointer;transition:all 0.25s;}
#gpz-root .chev:hover{color:var(--gph-foreground);border-color:var(--gph-neon-cyan);box-shadow:var(--gph-glow-cyan);}
#gpz-root .chev svg{width:16px;height:16px;}
#gpz-root .indicators{display:flex;gap:10px;align-items:center;}
#gpz-root .ind{width:28px;height:4px;background:rgba(0,229,255,0.18);cursor:pointer;transition:all 0.3s;clip-path:polygon(0 0,calc(100% - 3px) 0,100% 100%,3px 100%);border:none;padding:0;}
#gpz-root .ind.active{width:52px;background:var(--gph-neon-cyan);box-shadow:0 0 8px rgba(0,229,255,0.7);}

/* ---------- 5. COMMAND CONSOLE BAR ---------- */
#gpz-root .console-bar{max-width:1600px;margin:0 auto;padding:6px 20px 18px;}
#gpz-root .terminal-search{display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid rgba(0,229,255,0.35);box-shadow:0 1px 8px -2px rgba(0,229,255,0.3);flex-wrap:wrap;}
#gpz-root .prompt{font-family:var(--gph-font-mono);font-size:16px;color:var(--gph-neon-cyan);}
#gpz-root .term-input{flex:1 1 220px;min-width:0;background:transparent;border:none;outline:none;font-family:var(--gph-font-mono);font-size:14px;color:var(--gph-foreground);letter-spacing:0.04em;}
#gpz-root .term-input::placeholder{color:var(--gph-foreground-dim);}
#gpz-root .cursor-blink{font-family:var(--gph-font-mono);color:var(--gph-neon-cyan);animation:gpz-blink 1s steps(1) infinite;}
#gpz-root .filter-row{display:flex;align-items:center;gap:10px;margin-top:14px;flex-wrap:wrap;}
#gpz-root .chip{display:inline-flex;align-items:center;gap:7px;padding:7px 12px;background:rgba(8,12,22,0.6);border:1px solid rgba(0,229,255,0.22);color:var(--gph-foreground-muted);font-family:var(--gph-font-mono);font-size:11px;letter-spacing:0.06em;cursor:pointer;transition:all 0.2s;clip-path:polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px));white-space:nowrap;}
#gpz-root .chip:hover{border-color:var(--gph-neon-cyan);color:var(--gph-neon-cyan-soft);}
#gpz-root .chip svg{width:11px;height:11px;opacity:0.7;}
#gpz-root .chip.active{border-color:var(--gph-neon-cyan);color:var(--gph-neon-cyan-soft);box-shadow:0 0 12px rgba(0,229,255,0.22),inset 0 0 12px rgba(0,229,255,0.08);}
#gpz-root .chip--locked{border-color:var(--gph-neon-cyan);color:var(--gph-neon-cyan-soft);box-shadow:0 0 12px rgba(0,229,255,0.22),inset 0 0 12px rgba(0,229,255,0.08);}
#gpz-root .chip--locked .lock{color:var(--gph-neon-green);}
#gpz-root .filter-spacer{flex:1 1 auto;}
#gpz-root .result-count{font-family:var(--gph-font-mono);font-size:11px;color:var(--gph-foreground-muted);letter-spacing:0.1em;white-space:nowrap;}
#gpz-root .view-toggle{display:inline-flex;border:1px solid rgba(0,229,255,0.22);clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));}
#gpz-root .view-toggle button{width:30px;height:28px;display:grid;place-items:center;color:var(--gph-foreground-dim);background:transparent;border:none;cursor:pointer;}
#gpz-root .view-toggle button.on{color:var(--gph-neon-cyan);background:rgba(0,229,255,0.1);}
#gpz-root .view-toggle svg{width:15px;height:15px;}

/* buttons */
#gpz-root .btn-primary{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;font-family:var(--gph-font-mono);font-size:12px;letter-spacing:0.1em;color:var(--gph-primary-foreground);background:var(--gph-neon-cyan);border:none;cursor:pointer;transition:filter 0.25s,transform 0.2s;clip-path:polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,9px 100%,0 calc(100% - 9px));text-transform:uppercase;}
#gpz-root .btn-primary:hover{filter:drop-shadow(0 0 10px rgba(0,229,255,0.8));transform:translateY(-1px);}
#gpz-root .btn-ghost{display:inline-flex;align-items:center;gap:7px;padding:10px 16px;font-family:var(--gph-font-mono);font-size:12px;letter-spacing:0.1em;color:var(--gph-neon-cyan-soft);background:rgba(0,229,255,0.04);border:1px solid rgba(0,229,255,0.35);cursor:pointer;transition:all 0.25s;clip-path:polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,9px 100%,0 calc(100% - 9px));text-transform:uppercase;}
#gpz-root .btn-ghost:hover{border-color:var(--gph-neon-cyan);box-shadow:var(--gph-glow-soft);color:var(--gph-foreground);}
#gpz-root .btn-sm{padding:7px 13px;font-size:11px;}

/* ---------- 6. LAYOUT + BENTO ---------- */
#gpz-root .console-wrap{max-width:1600px;margin:0 auto;padding:10px 20px 30px;}
#gpz-root .console-layout{display:grid;grid-template-columns:1fr;gap:20px;}
#gpz-root .tab-bar{display:flex;align-items:center;gap:6px;border-bottom:1px solid var(--gph-border-soft);margin-bottom:16px;overflow-x:auto;scrollbar-width:none;}
#gpz-root .tab-bar::-webkit-scrollbar{display:none;}
#gpz-root .tab{position:relative;padding:10px 14px;font-family:var(--gph-font-mono);font-size:11px;letter-spacing:0.1em;color:var(--gph-foreground-dim);text-transform:uppercase;white-space:nowrap;cursor:pointer;background:none;border:none;transition:color 0.2s;}
#gpz-root .tab:hover{color:var(--gph-foreground-muted);}
#gpz-root .tab.active{color:var(--gph-neon-cyan);}
#gpz-root .tab.active::after{content:"";position:absolute;left:10px;right:10px;bottom:-1px;height:2px;background:var(--gph-neon-cyan);box-shadow:0 0 8px rgba(0,229,255,0.8);}
#gpz-root .section-head{display:flex;align-items:center;gap:14px;margin:16px 0 14px;flex-wrap:wrap;}
#gpz-root .section-eyebrow{font-family:var(--gph-font-mono);text-transform:uppercase;letter-spacing:0.22em;font-size:11px;color:var(--gph-neon-cyan);}
#gpz-root .section-zh{font-family:var(--gph-font-display);font-size:12px;color:var(--gph-foreground-muted);letter-spacing:0.08em;}
#gpz-root .sort-chip{margin-left:auto;display:inline-flex;align-items:center;gap:7px;font-family:var(--gph-font-mono);font-size:11px;color:var(--gph-foreground-muted);padding:6px 11px;border:1px solid var(--gph-border-soft);cursor:pointer;clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));background:transparent;}
#gpz-root .sort-chip:hover{border-color:var(--gph-neon-cyan);color:var(--gph-neon-cyan-soft);}
#gpz-root .sort-chip svg{width:11px;height:11px;}

#gpz-root .bento{display:grid;grid-template-columns:1fr;gap:14px;grid-auto-rows:auto;perspective:1400px;}
#gpz-root .bento.view-list{grid-template-columns:1fr !important;grid-auto-rows:auto !important;}
#gpz-root .bento.view-list .cartridge{flex-direction:row !important;min-height:140px !important;grid-column:auto !important;grid-row:auto !important;}
#gpz-root .bento.view-list .cartridge .cartridge-cover{flex:0 0 200px;}
#gpz-root .bento.view-list .cartridge .cartridge-info{flex:1 1 auto;}

/* ---------- 7. HOLO-CARTRIDGE COMPONENT ---------- */
#gpz-root .cartridge{
  --ch:14px;
  position:relative;display:flex;flex-direction:column;
  min-height:380px;
  background:rgba(8,12,22,0.72);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  border:1px solid rgba(0,229,255,0.18);
  box-shadow:inset 0 1px 0 rgba(0,229,255,0.05),inset 0 0 22px rgba(0,0,0,0.45);
  clip-path:polygon(0 0,calc(100% - var(--ch)) 0,100% var(--ch),100% 100%,var(--ch) 100%,0 calc(100% - var(--ch)));
  transform-style:preserve-3d;transition:transform 0.35s cubic-bezier(0.2,0.7,0.2,1),filter 0.35s,border-color 0.35s;
  cursor:pointer;overflow:hidden;
}
#gpz-root .cartridge:hover{transform:perspective(1000px) rotateX(2deg) translateY(-10px) scale(1.025);border-color:rgba(0,229,255,0.6);filter:drop-shadow(0 0 14px rgba(0,229,255,0.5));z-index:5;}
#gpz-root .cartridge[data-accent="purple"]:hover{border-color:rgba(176,38,255,0.6);filter:drop-shadow(0 0 14px rgba(176,38,255,0.5));}
#gpz-root .cartridge-cover{flex:1 1 58%;position:relative;padding:7px;}
#gpz-root .cover-frame{position:absolute;inset:7px;overflow:hidden;}
#gpz-root .cover-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:filter 0.35s,transform 0.5s;}
#gpz-root .cartridge:hover .cover-img{filter:brightness(1.12) saturate(1.08);transform:scale(1.03);}
#gpz-root .cover-grad{position:absolute;inset:0;pointer-events:none;background:linear-gradient(to top,rgba(5,7,13,0.96) 6%,rgba(5,7,13,0.45) 34%,transparent 70%);}
#gpz-root .cover-scan{position:absolute;inset:0;pointer-events:none;opacity:0.35;}

/* crosshair L-marks (4 corners via 8 gradient layers) */
#gpz-root .crosshair{
  --cc:rgba(108,242,255,0.8);
  position:absolute;inset:0;pointer-events:none;
  background:
    linear-gradient(var(--cc),var(--cc)) 0 0 / 15px 1px no-repeat,
    linear-gradient(var(--cc),var(--cc)) 0 0 / 1px 15px no-repeat,
    linear-gradient(var(--cc),var(--cc)) 100% 0 / 15px 1px no-repeat,
    linear-gradient(var(--cc),var(--cc)) 100% 0 / 1px 15px no-repeat,
    linear-gradient(var(--cc),var(--cc)) 0 100% / 15px 1px no-repeat,
    linear-gradient(var(--cc),var(--cc)) 0 100% / 1px 15px no-repeat,
    linear-gradient(var(--cc),var(--cc)) 100% 100% / 15px 1px no-repeat,
    linear-gradient(var(--cc),var(--cc)) 100% 100% / 1px 15px no-repeat;
}
#gpz-root .genre-pills{position:absolute;top:9px;right:9px;display:flex;gap:5px;z-index:3;}
#gpz-root .pill{font-family:var(--gph-font-mono);font-size:9px;letter-spacing:0.08em;padding:3px 7px;clip-path:polygon(0 0,calc(100% - 4px) 0,100% 4px,100% 100%,4px 100%,0 calc(100% - 4px));white-space:nowrap;cursor:pointer;border:none;}
#gpz-root .pill--cyan{background:rgba(0,229,255,0.2);color:var(--gph-neon-cyan-soft);border:1px solid rgba(0,229,255,0.5);}
#gpz-root .pill--purple{background:rgba(176,38,255,0.22);color:var(--gph-neon-purple-soft);border:1px solid rgba(176,38,255,0.55);}
#gpz-root .pill:hover{filter:brightness(1.3);}
#gpz-root .hot-tag{position:absolute;top:9px;left:9px;display:inline-flex;align-items:center;gap:5px;font-family:var(--gph-font-mono);font-size:9px;letter-spacing:0.08em;color:var(--gph-neon-magenta);background:rgba(5,7,13,0.6);padding:3px 6px;border:1px solid rgba(255,43,208,0.4);clip-path:polygon(0 0,calc(100% - 4px) 0,100% 4px,100% 100%,4px 100%,0 calc(100% - 4px));z-index:3;}
#gpz-root .hot-tag .dot{width:6px;height:6px;border-radius:50%;background:var(--gph-neon-red);animation:gpz-pulse-dot 1.4s infinite;}
#gpz-root .play-affordance{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;opacity:0;transition:opacity 0.35s;pointer-events:none;z-index:3;}
#gpz-root .cartridge:hover .play-affordance{opacity:1;}
#gpz-root .play-ring{width:56px;height:56px;display:grid;place-items:center;color:var(--gph-neon-cyan);background:rgba(0,229,255,0.12);border:1px solid var(--gph-neon-cyan);clip-path:polygon(0 0,calc(100% - 11px) 0,100% 11px,100% 100%,11px 100%,0 calc(100% - 11px));filter:drop-shadow(0 0 9px rgba(0,229,255,0.8));}
#gpz-root .play-ring svg{width:20px;height:20px;}
#gpz-root .play-cap{font-family:var(--gph-font-mono);font-size:10px;color:var(--gph-neon-cyan);letter-spacing:0.16em;}
#gpz-root .sweep{position:absolute;inset:0;pointer-events:none;opacity:0;background:linear-gradient(to bottom,transparent,rgba(0,229,255,0.22),transparent);transform:translateY(-100%);}
#gpz-root .cartridge:hover .sweep{animation:gpz-sweep 0.85s ease;}
#gpz-root .cartridge-info{position:relative;z-index:2;padding:11px 14px 13px;display:flex;flex-direction:column;gap:8px;}
#gpz-root .cartridge-title{font-family:var(--gph-font-display);font-size:clamp(1rem,1.3vw,1.3rem);line-height:1.1;color:var(--gph-foreground);margin:0;text-shadow:0 0 12px rgba(0,229,255,0.4);letter-spacing:0.04em;}
#gpz-root .cartridge-title.decoding{color:var(--gph-neon-cyan-soft);}
#gpz-root .creator-badge{display:inline-flex;align-items:center;gap:6px;}
#gpz-root .creator{font-family:var(--gph-font-mono);font-size:11px;color:var(--gph-neon-purple-soft);text-shadow:0 0 8px rgba(176,38,255,0.55);}
#gpz-root .crown{width:13px;height:13px;color:var(--gph-neon-amber);filter:drop-shadow(0 0 4px rgba(255,176,32,0.7));}
#gpz-root .sync-row{display:flex;align-items:center;gap:9px;}
#gpz-root .sync-label{font-family:var(--gph-font-mono);font-size:10px;color:var(--gph-foreground-muted);letter-spacing:0.06em;white-space:nowrap;}
#gpz-root .nodes{font-family:var(--gph-font-mono);font-size:10px;color:var(--gph-foreground-dim);letter-spacing:0.06em;}

/* ---------- 8. SYNC BAR ---------- */
#gpz-root .sync-bar{display:inline-grid;grid-template-columns:repeat(5,1fr);gap:3px;width:100%;max-width:92px;}
#gpz-root .cell{height:7px;position:relative;background:rgba(0,229,255,0.07);border:1px solid rgba(0,229,255,0.2);clip-path:polygon(0 0,calc(100% - 2px) 0,100% 2px,100% 100%,2px 100%,0 calc(100% - 2px));}
#gpz-root .cell.filled{background:var(--gph-neon-cyan);border-color:transparent;box-shadow:0 0 6px rgba(0,229,255,0.65);}
#gpz-root .cell.partial .cell-fill{position:absolute;left:0;top:0;bottom:0;background:var(--gph-neon-cyan);box-shadow:0 0 6px rgba(0,229,255,0.55);}
#gpz-root .sync-green .cell.filled{background:var(--gph-neon-green);box-shadow:0 0 6px rgba(34,255,156,0.65);}
#gpz-root .sync-green .cell.partial .cell-fill{background:var(--gph-neon-green);box-shadow:0 0 6px rgba(34,255,156,0.55);}

/* big cartridge = horizontal */
#gpz-root .cartridge--big{--ch:18px;flex-direction:row;min-height:300px;}
#gpz-root .cartridge--big .cartridge-cover{flex:0 0 55%;}
#gpz-root .cartridge--big .cartridge-info{flex:1 1 45%;justify-content:center;padding:18px 22px;gap:12px;}
#gpz-root .cartridge--big .cartridge-title{font-size:clamp(1.4rem,2vw,2rem);}
#gpz-root .cartridge--tall{min-height:560px;}

/* empty state */
#gpz-root .gpz-empty{grid-column:1/-1;padding:48px 24px;text-align:center;background:rgba(8,12,22,0.5);border:1px dashed rgba(0,229,255,0.25);clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px));}
#gpz-root .gpz-empty .gpz-empty-glyph{font-family:var(--gph-font-display);font-size:14px;color:var(--gph-neon-cyan);letter-spacing:0.2em;margin-bottom:10px;}
#gpz-root .gpz-empty .gpz-empty-text{font-family:var(--gph-font-mono);font-size:12px;color:var(--gph-foreground-muted);letter-spacing:0.06em;margin-bottom:18px;}

/* ---------- 9. SIDEBAR PANELS ---------- */
#gpz-root .sidebar{display:flex;flex-direction:column;gap:14px;}
#gpz-root .hud-panel{position:relative;background:rgba(8,12,22,0.62);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid var(--gph-border-soft);padding:14px 16px;clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%,0 12px);}
#gpz-root .hud-panel::before{content:"";position:absolute;top:0;left:0;width:40%;height:1px;background:linear-gradient(90deg,var(--gph-neon-cyan),transparent);}
#gpz-root .panel-head{display:flex;align-items:center;gap:8px;margin-bottom:11px;}
#gpz-root .panel-head .pdot{width:6px;height:6px;border-radius:50%;flex:none;}
#gpz-root .panel-head .label{font-family:var(--gph-font-mono);text-transform:uppercase;letter-spacing:0.18em;font-size:10px;color:var(--gph-foreground-muted);}
#gpz-root .big-num{font-family:var(--gph-font-display);font-size:30px;color:var(--gph-neon-cyan);line-height:1;text-shadow:0 0 14px rgba(0,229,255,0.5);}
#gpz-root .big-sub{font-family:var(--gph-font-mono);font-size:10px;color:var(--gph-foreground-dim);letter-spacing:0.14em;margin-top:5px;}
#gpz-root .panel-row{display:flex;align-items:center;gap:12px;margin-top:11px;font-family:var(--gph-font-mono);font-size:11px;}
#gpz-root .panel-row .g{color:var(--gph-neon-green);}
#gpz-root .panel-row .a{color:var(--gph-neon-amber);}
#gpz-root .panel-row .muted{color:var(--gph-foreground-muted);}
#gpz-root .thin-bar{height:5px;background:rgba(0,229,255,0.1);margin-top:9px;position:relative;clip-path:polygon(0 0,calc(100% - 4px) 0,100% 4px,100% 100%,4px 100%,0 calc(100% - 4px));}
#gpz-root .thin-bar .fill{position:absolute;inset:0;width:var(--w,64%);background:var(--gph-neon-cyan);box-shadow:0 0 6px rgba(0,229,255,0.6);}
#gpz-root .thin-bar.green .fill{background:var(--gph-neon-green);box-shadow:0 0 6px rgba(34,255,156,0.6);}
#gpz-root .spark{width:100%;height:30px;margin-top:10px;display:block;}
#gpz-root .top-list{display:flex;flex-direction:column;gap:9px;margin-top:4px;}
#gpz-root .top-item{display:grid;grid-template-columns:18px 1fr auto;align-items:center;gap:9px;}
#gpz-root .top-item .rank{font-family:var(--gph-font-mono);font-size:12px;color:var(--gph-foreground-dim);}
#gpz-root .top-item .nm{font-family:var(--gph-font-mono);font-size:11px;color:var(--gph-foreground);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-flex;align-items:center;gap:6px;}
#gpz-root .top-item .mini-sync{display:inline-grid;grid-template-columns:repeat(5,1fr);gap:2px;width:44px;}
#gpz-root .top-item .mini-sync .mc{height:5px;background:rgba(0,229,255,0.1);border:1px solid rgba(0,229,255,0.2);}
#gpz-root .top-item .mini-sync .mc.on{background:var(--gph-neon-cyan);box-shadow:0 0 4px rgba(0,229,255,0.6);border-color:transparent;}
#gpz-root .live-tag{display:inline-flex;align-items:center;gap:4px;font-family:var(--gph-font-mono);font-size:9px;color:var(--gph-neon-red);}
#gpz-root .live-tag .ld{width:5px;height:5px;border-radius:50%;background:var(--gph-neon-red);animation:gpz-pulse-dot 1.4s infinite;}
#gpz-root .qa-btn{width:100%;display:flex;align-items:center;gap:8px;padding:10px 14px;margin-bottom:8px;font-family:var(--gph-font-mono);font-size:12px;letter-spacing:0.08em;color:var(--gph-neon-cyan-soft);background:rgba(0,229,255,0.04);border:1px solid rgba(0,229,255,0.3);cursor:pointer;transition:all 0.25s;clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));text-transform:uppercase;}
#gpz-root .qa-btn:last-child{margin-bottom:0;}
#gpz-root .qa-btn:hover{border-color:var(--gph-neon-cyan);box-shadow:var(--gph-glow-soft);color:var(--gph-foreground);}

/* ---------- 10. FOOTER STATUS BAR ---------- */
#gpz-root .statusbar{position:fixed;left:0;right:0;bottom:0;z-index:50;display:flex;align-items:center;gap:18px;padding:0 20px;height:46px;background:rgba(5,7,13,0.88);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-top:1px solid rgba(0,229,255,0.2);flex-wrap:wrap;}
#gpz-root .statusbar::before{content:"";position:absolute;top:-1px;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--gph-neon-cyan) 50%,transparent);opacity:0.5;}
#gpz-root .sb-block{display:inline-flex;align-items:center;gap:8px;font-family:var(--gph-font-mono);font-size:11px;letter-spacing:0.06em;white-space:nowrap;}
#gpz-root .sb-clock{color:var(--gph-neon-cyan);}
#gpz-root .sb-ok{color:var(--gph-neon-green);}
#gpz-root .sb-amber{color:var(--gph-neon-amber);}
#gpz-root .sb-green{color:var(--gph-neon-green);}
#gpz-root .sb-dim{color:var(--gph-foreground-dim);}
#gpz-root .sb-spacer{flex:1 1 auto;}
#gpz-root .sb-progress{width:90px;height:5px;background:rgba(255,176,32,0.15);position:relative;clip-path:polygon(0 0,calc(100% - 4px) 0,100% 4px,100% 100%,4px 100%,0 calc(100% - 4px));}
#gpz-root .sb-progress .fill{position:absolute;inset:0;width:64%;background:var(--gph-neon-amber);box-shadow:0 0 5px rgba(255,176,32,0.6);}

/* ---------- toast ---------- */
#gpz-root .gpz-toast{position:fixed;top:74px;left:50%;transform:translateX(-50%);z-index:60;display:flex;align-items:center;gap:8px;padding:10px 16px;font-family:var(--gph-font-mono);font-size:12px;letter-spacing:0.06em;color:var(--gph-neon-cyan-soft);background:rgba(8,12,22,0.92);border:1px solid rgba(0,229,255,0.45);box-shadow:var(--gph-glow-cyan);clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));animation:gpz-toast-in 0.25s ease;}
@keyframes gpz-toast-in{from{opacity:0;transform:translateX(-50%) translateY(-8px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}

/* ---------- 11. KEYFRAMES ---------- */
@keyframes gpz-pulse-dot{0%,100%{opacity:1;transform:scale(1);box-shadow:0 0 0 0 rgba(255,59,94,0.6);}50%{opacity:0.55;transform:scale(1.18);box-shadow:0 0 0 6px rgba(255,59,94,0);}}
@keyframes gpz-pulse-soft{0%,100%{opacity:1;}50%{opacity:0.45;}}
@keyframes gpz-blink{0%,50%{opacity:1;}50.01%,100%{opacity:0;}}
@keyframes gpz-sweep{0%{transform:translateY(-100%);opacity:0;}12%{opacity:0.9;}100%{transform:translateY(100%);opacity:0;}}

/* ---------- 12. RESPONSIVE ---------- */
@media (min-width:640px){
  #gpz-root .bento{grid-template-columns:repeat(2,1fr);grid-auto-rows:300px;}
  #gpz-root .cartridge{min-height:0;}
  #gpz-root .cartridge--big{grid-column:span 2;}
  #gpz-root .cartridge--tall{min-height:0;}
}
@media (min-width:1024px){
  #gpz-root .console-layout{grid-template-columns:1fr 320px;gap:24px;}
  #gpz-root .sidebar{position:sticky;top:80px;align-self:start;}
  #gpz-root .bento{grid-template-columns:repeat(4,1fr);grid-auto-rows:320px;gap:18px;}
  #gpz-root .cartridge--big{grid-column:span 2;}
  #gpz-root .cartridge--tall{grid-row:span 2;}
}
@media (max-width:1023px){ #gpz-root .cartridge--big{flex-direction:row;} }
@media (max-width:768px){
  #gpz-root .slides{min-height:0;}
  #gpz-root .slide{flex-direction:column;position:relative;opacity:1;pointer-events:auto;}
  #gpz-root .slide:not(.active){display:none;}
  #gpz-root .slide-text{flex:1 1 auto;}
  #gpz-root .slide-media{min-height:220px;flex:1 1 auto;}
  #gpz-root .slides{min-height:560px;}
}
@media (max-width:639px){
  #gpz-root .cartridge--big{flex-direction:column;}
  #gpz-root .status-pills{display:none;}
  #gpz-root .topbar{gap:10px;padding:0 14px;height:56px;}
  #gpz-root .hero,#gpz-root .console-bar,#gpz-root .console-wrap{padding-left:14px;padding-right:14px;}
}
@media (max-width:380px){ #gpz-root .brand-ver{display:none;} }
@media (prefers-reduced-motion:reduce){ #gpz-root *{animation-duration:0.001ms !important;animation-iteration-count:1 !important;transition-duration:0.001ms !important;} }
`

/* ============================ 子组件 ============================ */

// 矩阵数据雨
function MatrixRain({ reduce }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    if (reduce) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ0123456789ABCDEF<>/*+='
    let W, H, cols, drops, dpr, fs, rafId
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = canvas.width = Math.floor(window.innerWidth * dpr)
      H = canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      fs = 14 * dpr
      cols = Math.floor(W / fs)
      drops = new Array(cols)
      for (let i = 0; i < cols; i++) drops[i] = Math.random() * -H / fs
    }
    function draw() {
      ctx.fillStyle = 'rgba(5,7,13,0.10)'
      ctx.fillRect(0, 0, W, H)
      ctx.font = fs + 'px "Share Tech Mono", monospace'
      for (let i = 0; i < cols; i++) {
        const ch = chars.charAt(Math.floor(Math.random() * chars.length))
        const x = i * fs, y = drops[i] * fs
        ctx.fillStyle = (i % 4 === 0) ? 'rgba(34,255,156,0.10)' : 'rgba(0,229,255,0.12)'
        ctx.fillText(ch, x, y)
        if (y > H && Math.random() > 0.975) drops[i] = 0
        drops[i] += 0.45
      }
      rafId = requestAnimationFrame(draw)
    }
    resize()
    draw()
    let rt
    const onResize = () => { clearTimeout(rt); rt = setTimeout(resize, 200) }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', onResize) }
  }, [reduce])
  return html`<canvas ref=${canvasRef} class="gpz-matrix" aria-hidden="true"></canvas>`
}

// 同步条
function SyncBar({ c }) {
  const green = c.sync >= 95
  return html`
    <div class="sync-row">
      <span class="sync-label">[同步 ${c.sync}%]</span>
      <div class=${'sync-bar' + (green ? ' sync-green' : '')}>
        <span class="cell filled"></span><span class="cell filled"></span>
        <span class="cell filled"></span><span class="cell filled"></span>
        <span class="cell partial"><span class="cell-fill" style=${{ width: c.fill + '%' }}></span></span>
      </div>
      <span class="nodes">[${c.nodes.toLocaleString()} 节点]</span>
    </div>
  `
}

// 模组匣子卡 — 完全按设计稿 cover-frame / crosshair / genre-pills / play-affordance / sweep
function Cartridge({ c, onPlay, onGenre, decodeRef }) {
  const sizeClass = c.size === 'big' ? ' cartridge--big' : c.size === 'tall' ? ' cartridge--tall' : ''
  return html`
    <article class=${'cartridge' + sizeClass} data-accent=${c.accent} data-name=${c.name} role="button" tabindex="0"
      onClick=${() => onPlay(c)}
      onKeyPress=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPlay(c) } }}
      onMouseEnter=${() => decodeRef.current && decodeRef.current(c)}>
      <div class="cartridge-cover">
        <div class="cover-frame">
          <img class="cover-img" src=${c.img} alt=${c.name} loading="lazy" />
          <div class="cover-grad"></div>
          <div class="cover-scan gph-scanlines"></div>
          <div class="crosshair"></div>
          <div class="genre-pills">
            <button class="pill pill--cyan" onClick=${(e) => { e.stopPropagation(); onGenre(c.cyan) }}>${c.cyan}</button>
            <button class="pill pill--purple" onClick=${(e) => { e.stopPropagation(); onGenre(c.purple) }}>${c.purple}</button>
          </div>
          ${c.hot ? html`<span class="hot-tag"><span class="dot"></span>热门直播区_</span>` : null}
          <div class="play-affordance">
            <span class="play-ring"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span>
            <span class="play-cap">启动模拟</span>
          </div>
          <div class="sweep"></div>
        </div>
      </div>
      <div class="cartridge-info">
        <h3 class="cartridge-title" data-real=${c.name}>${c.name}</h3>
        <div class="creator-badge">
          <span class="creator">${c.creator}</span>
          <svg class="crown" viewBox="0 0 24 24" fill="currentColor"><path d="M3 7l4.5 4L12 4l4.5 7L21 7l-2 12H5L3 7z"/></svg>
        </div>
        <${SyncBar} c=${c} />
      </div>
    </article>
  `
}

/* ============================ 主组件 ============================ */

export default function GamePlaza() {
  const { state, dispatch, goStep, toast } = useApp()
  const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const [slideCur, setSlideCur] = useState(0)
  const [tab, setTab] = useState('all')
  const [view, setView] = useState('grid')
  const [sort, setSort] = useState('popular')
  const [query, setQuery] = useState('')
  const [activeChips, setActiveChips] = useState([])
  const [genreFilter, setGenreFilter] = useState(null)
  const [clock, setClock] = useState('')
  const [toastMsg, setToastMsg] = useState(null)
  const slideTimer = useRef(null)
  const decodeRef = useRef(null)

  // 注入 CSS（一次性）
  useEffect(() => {
    const old = document.querySelector('style[data-gpz]')
    if (old) return
    const style = document.createElement('style')
    style.setAttribute('data-gpz', '')
    style.textContent = CSS
    document.head.appendChild(style)
  }, [])

  // 触发延迟注册
  const triggerAuth = useCallback((reason, intent) => {
    dispatch({ type: 'SET_AUTH_PROMPT', payload: { reason, intent } })
  }, [dispatch])

  const showToast = useCallback((msg) => {
    if (toast) toast(msg, 'info')
    setToastMsg(msg)
    window.clearTimeout(showToast._t)
    showToast._t = window.setTimeout(() => setToastMsg(null), 2200)
  }, [toast])

  // 英雄轮播自动播放
  const startAuto = useCallback(() => {
    if (reduce) return
    if (slideTimer.current) clearInterval(slideTimer.current)
    slideTimer.current = setInterval(() => setSlideCur((c) => (c + 1) % SLIDES.length), 6000)
  }, [reduce])
  const stopAuto = useCallback(() => { if (slideTimer.current) { clearInterval(slideTimer.current); slideTimer.current = null } }, [])
  useEffect(() => { startAuto(); return stopAuto }, [startAuto, stopAuto])
  const goSlide = (n) => { setSlideCur((n + SLIDES.length) % SLIDES.length); stopAuto(); startAuto() }

  // 触摸滑动
  const touchX = useRef(null)
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchX.current == null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 40) goSlide(dx < 0 ? slideCur + 1 : slideCur - 1)
    touchX.current = null
  }

  // UTC 时钟
  useEffect(() => {
    const pad = (n) => String(n).padStart(2, '0')
    const tick = () => {
      const d = new Date()
      setClock(pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + ' UTC')
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // 滚动视差（rAF 节流）
  useEffect(() => {
    if (reduce) return
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY || 0
        const off = Math.min(y * 0.05, 40)
        const canvas = document.querySelector('#gpz-root .gpz-matrix')
        const grid = document.querySelector('#gpz-root .gpz-bg-grid')
        if (canvas) canvas.style.transform = 'translateY(' + off + 'px)'
        if (grid) grid.style.transform = 'translateY(' + (off * 0.6) + 'px)'
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [reduce])

  // 标题解码效果
  const decode = useCallback((c) => {
    if (reduce) return
    const el = document.querySelector('#gpz-root .cartridge[data-name="' + c.name + '"] .cartridge-title')
    if (!el || el.classList.contains('decoding')) return
    const real = c.name
    const scramble = 'ｱｲｳｴｵｶｷｸｹｺ01ABCDEF#%@&*<>/+='
    const start = performance.now()
    el.classList.add('decoding')
    const step = (t) => {
      const p = Math.min((t - start) / 280, 1)
      let out = ''
      for (let k = 0; k < real.length; k++) {
        if (real[k] === ' ') out += ' '
        else if (k / real.length < p) out += real[k]
        else out += scramble.charAt(Math.floor(Math.random() * scramble.length))
      }
      el.textContent = out
      if (p < 1) requestAnimationFrame(step)
      else { el.textContent = real; el.classList.remove('decoding') }
    }
    requestAnimationFrame(step)
  }, [reduce])
  decodeRef.current = decode

  // 过滤 + 排序
  const visible = useMemo(() => {
    let list = CARTRIDGES.slice()
    if (tab === 'featured') list = list.filter((c) => c.featured)
    else if (tab === 'new') list = list.filter((c) => c.isNew)
    else if (tab === 'popular') list = list.slice().sort((a, b) => b.popular - a.popular)
    else if (tab === 'library') list = list.filter((c) => c.picked)
    if (genreFilter) {
      list = list.filter((c) => c.cyan === genreFilter || c.purple === genreFilter)
    }
    if (activeChips.length) {
      const genres = new Set()
      activeChips.forEach((id) => {
        const chip = FILTER_CHIPS.find((x) => x.id === id)
        if (chip) chip.genres.forEach((g) => genres.add(g))
      })
      if (genres.size) list = list.filter((c) => genres.has(c.cyan) || genres.has(c.purple))
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.creator.toLowerCase().includes(q))
    }
    if (sort === 'sync') list.sort((a, b) => b.sync - a.sync)
    else if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    else list.sort((a, b) => b.popular - a.popular)
    return list
  }, [tab, genreFilter, activeChips, query, sort])

  // 交互动作
  const onPlay = useCallback((c) => {
    if (!state.user) triggerAuth('启动模拟需要先登录指挥官账号', 'plaza_play_' + c.id)
    else { showToast('正在加载 ' + c.name + ' 模拟环境…'); goStep(STEPS.UPLOAD) }
  }, [state.user, triggerAuth, showToast, goStep])
  const onAddLib = (c) => { if (!state.user) triggerAuth('加入资料库需要登录', 'plaza_add'); else showToast(c.name + ' 已加入资料库') }
  const onGenre = (g) => { setGenreFilter((cur) => (cur === g ? null : g)); showToast('流派筛选: ' + g) }
  const toggleChip = (id) => {
    setActiveChips((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
    setGenreFilter(null)
  }
  const resetFilters = () => { setActiveChips([]); setGenreFilter(null); setQuery(''); setTab('all'); setSort('popular'); showToast('筛选已重置') }
  const applyFilters = () => showToast('已应用当前筛选 · ' + visible.length + ' 个模组')
  const cycleSort = () => {
    const idx = SORTS.findIndex((s) => s.id === sort)
    const next = SORTS[(idx + 1) % SORTS.length]
    setSort(next.id); showToast('排序: ' + next.label)
  }

  const user = state.user
  const cmdrName = user ? (user.nickname || (user.email || '').split('@')[0] || '指挥官') : '访客节点'
  const cmdrInit = (cmdrName.slice(0, 2) || 'C7').toUpperCase()

  const totalModules = 247
  const sortLabel = SORTS.find((s) => s.id === sort)?.label || 'POPULARITY'

  // ── 模板分片构建 ──

  const bgLayers = html`
    <div class="gpz-bg-grid gph-grid-bg" aria-hidden="true"></div>
    <div class="gpz-bg-glow" aria-hidden="true"></div>
    <div class="gpz-bg-vignette" aria-hidden="true"></div>
  `

  const topbar = html`
    <header class="topbar">
      <div class="brand" onClick=${() => { goStep(STEPS.LANDING); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
        <svg class="hex-logo" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z" fill="rgba(0,229,255,0.08)" stroke="var(--gph-neon-cyan)" stroke-width="1.4"/>
          <path d="M12 7 L17 10 L17 14 L12 17 L7 14 L7 10 Z" fill="none" stroke="var(--gph-neon-cyan-soft)" stroke-width="1" opacity="0.6"/>
        </svg>
        <span class="brand-name">贾维斯系统</span>
        <span class="brand-ver">v.37.2</span>
      </div>
      <div class="status-pills">
        <span class="pill-status"><span class="dot dot-green"></span>所有系统正常</span>
        <span class="pill-status"><span class="dot dot-cyan"></span>同步中</span>
      </div>
      <div class="topbar-spacer"></div>
      <div class="topbar-right">
        <span class="credits"><span class="diamond">◆</span>¥84,250</span>
        <button class="bell" aria-label="通知" onClick=${() => showToast('3 条新通知')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>
          <span class="badge">3</span>
        </button>
        <div class="cmdr">
          <div class="hex-avatar">${cmdrInit}</div>
          <span class="cmdr-name">${cmdrName}</span>
          <span class="lv-chip">LV.42</span>
        </div>
      </div>
    </header>
  `

  const heroSection = html`
    <section class="hero">
      <div class="hero-head">
        <span class="hero-eyebrow">// FEATURED_UNIVERSES</span>
        <span class="hero-zh">本周顶级宇宙</span>
        <span class="hero-swipe">SWIPE ◂ ▸</span>
      </div>
      <div class="slides" onMouseEnter=${stopAuto} onMouseLeave=${startAuto} onTouchStart=${onTouchStart} onTouchEnd=${onTouchEnd}>
        ${SLIDES.map((s, i) => html`
          <div key=${i} class=${'slide' + (i === slideCur ? ' active' : '')}>
            <div class="slide-text">
              <span class="slide-index">${s.idx}</span>
              <h2 class="slide-name">${s.name}</h2>
              <p class="slide-tag">${s.tag}</p>
              <div class="slide-stats">
                <span>[ONLINE: ${s.nodes.toLocaleString()} NODES]</span>
                <span>[SYNC ${s.sync}%]</span>
              </div>
              <div class="slide-cta">
                <button class="btn-primary" onClick=${() => onPlay(CARTRIDGES[0])}>▶ INITIATE_SIMULATION</button>
                <button class="btn-ghost" onClick=${() => onAddLib(CARTRIDGES[0])}>ADD TO LIBRARY</button>
              </div>
            </div>
            <div class="slide-media">
              <img src=${s.img} alt=${s.name} />
              <div class="hero-scan gph-scanlines"></div>
              <div class="crosshair"></div>
              <span class="timecode">T+04:21:09</span>
              <span class="live-feed"><span class="dot-red"></span>[LIVE_FEED]</span>
            </div>
          </div>
        `)}
      </div>
      <div class="carousel-nav">
        <button class="chev" aria-label="上一张" onClick=${() => goSlide(slideCur - 1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
        </button>
        <div class="indicators">
          ${SLIDES.map((_, i) => html`<button key=${i} class=${'ind' + (i === slideCur ? ' active' : '')} onClick=${() => goSlide(i)} aria-label="跳转到 ${i + 1}"></button>`)}
        </div>
        <button class="chev" aria-label="下一张" onClick=${() => goSlide(slideCur + 1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
        </button>
      </div>
    </section>
  `

  const consoleBar = html`
    <section class="console-bar">
      <div class="terminal-search">
        <span class="prompt">&gt;</span>
        <input type="text" class="term-input" placeholder="建立连接_请输入你想探索的宇宙参数..."
          value=${query} onInput=${(e) => setQuery(e.target.value)} />
        <span class="cursor-blink">█</span>
        <button class="btn-primary btn-sm" onClick=${applyFilters}>SEARCH ▸</button>
      </div>
      <div class="filter-row">
        ${FILTER_CHIPS.map((chip) => html`
          <button key=${chip.id} class=${'chip' + (activeChips.includes(chip.id) ? ' active' : '')} onClick=${() => toggleChip(chip.id)}>
            ${chip.label}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        `)}
        ${genreFilter ? html`<button class="chip chip--locked"><span class="lock">[+]</span>流派: ${genreFilter}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></button>` : null}
        <div class="filter-spacer"></div>
        <button class="btn-ghost btn-sm" onClick=${resetFilters}>RESET</button>
        <button class="btn-primary btn-sm" onClick=${applyFilters}>APPLY ▸</button>
        <span class="result-count">${totalModules} MODULES</span>
        <span class="view-toggle">
          <button class=${view === 'grid' ? 'on' : ''} aria-label="网格视图" onClick=${() => setView('grid')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
          <button class=${view === 'list' ? 'on' : ''} aria-label="列表视图" onClick=${() => setView('list')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </span>
      </div>
    </section>
  `

  const mainCol = html`
    <div class="main-col">
      <div class="tab-bar">
        ${TABS.map((t) => html`<button key=${t.id} class=${'tab' + (tab === t.id ? ' active' : '')} onClick=${() => setTab(t.id)}>${t.label}</button>`)}
      </div>
      <div class="section-head">
        <span class="section-eyebrow">// CARTRIDGE_LIBRARY</span>
        <span class="section-zh">模组匣子库</span>
        <span class="sort-chip" onClick=${cycleSort}>SORT: ${sortLabel}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </span>
      </div>
      <div class=${'bento' + (view === 'list' ? ' view-list' : '')}>
        ${visible.length === 0 ? html`
          <div class="gpz-empty">
            <div class="gpz-empty-glyph">▮ NO_MATCH</div>
            <div class="gpz-empty-text">未找到匹配的模组匣子 · 请调整检索参数</div>
          </div>
        ` : visible.map((c) => html`<${Cartridge} key=${c.id} c=${c} onPlay=${onPlay} onGenre=${onGenre} decodeRef=${decodeRef} />`)}
      </div>
    </div>
  `

  // 侧边栏 4 个 HUD 面板 — 完全按设计稿
  const sidebar = html`
    <aside class="sidebar">
      <!-- Panel A: LIBRARY_STATUS -->
      <div class="hud-panel">
        <div class="panel-head"><span class="pdot dot-green"></span><span class="label">// LIBRARY_STATUS</span></div>
        <div class="big-num">1,248</div>
        <div class="big-sub">TOTAL CARTRIDGES</div>
        <div class="panel-row"><span class="g">47 ACTIVE</span><span class="muted">/</span><span class="a">12 DOWNLOADING</span></div>
        <div class="thin-bar green" style=${{ '--w': '97%' }}><span class="fill"></span></div>
        <div class="panel-row"><span class="muted">97% SYNCED</span></div>
      </div>

      <!-- Panel B: COMMUNITY_GRID -->
      <div class="hud-panel">
        <div class="panel-head"><span class="pdot dot-cyan"></span><span class="label">// COMMUNITY_GRID</span></div>
        <div class="big-num">128,547</div>
        <div class="big-sub">ONLINE NODES</div>
        <div class="panel-row"><span class="muted">2,341 ACTIVE SESSIONS</span></div>
        <svg class="spark" viewBox="0 0 200 30" preserveAspectRatio="none" aria-hidden="true">
          <polyline points="0,22 20,18 40,20 60,12 80,15 100,7 120,11 140,4 160,9 180,3 200,6" fill="none" stroke="var(--gph-neon-cyan)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
          <polyline points="0,22 20,18 40,20 60,12 80,15 100,7 120,11 140,4 160,9 180,3 200,6 200,30 0,30" fill="rgba(0,229,255,0.12)" stroke="none"/>
        </svg>
      </div>

      <!-- Panel C: TOP_PLAYED -->
      <div class="hud-panel">
        <div class="panel-head"><span class="pdot dot-green"></span><span class="label">// TOP_PLAYED</span></div>
        <div class="top-list">
          ${CARTRIDGES.slice(0, 5).map((c, i) => html`
            <div key=${c.id} class="top-item">
              <span class="rank">${String(i + 1).padStart(2, '0')}</span>
              <span class="nm">
                ${c.hot ? html`<span class="live-tag"><span class="ld"></span>LIVE</span>` : null}
                ${c.name}
              </span>
              <span class="mini-sync">
                ${[0, 1, 2, 3, 4].map((k) => html`<span key=${k} class=${'mc' + (k < 4 ? ' on' : '')}></span>`)}
              </span>
            </div>
          `)}
        </div>
        <div class="panel-row"><span class="muted">${CARTRIDGES.slice(0, 5).map((c) => c.nodes.toLocaleString()).join(' / ')} NODES</span></div>
      </div>

      <!-- Panel D: QUICK_ACTIONS -->
      <div class="hud-panel">
        <div class="panel-head"><span class="pdot dot-cyan"></span><span class="label">// QUICK_ACTIONS</span></div>
        <button class="qa-btn" onClick=${() => showToast('启动上次会话…')}>▸ LAUNCH LAST</button>
        <button class="qa-btn" onClick=${() => showToast('扫描资料库中…')}>▸ SCAN LIBRARY</button>
        <button class="qa-btn" onClick=${() => showToast('云端同步中…')}>▸ SYNC CLOUD</button>
      </div>
    </aside>
  `

  const statusBar = html`
    <footer class="statusbar">
      <span class="sb-block"><span class="sb-clock" id="clock">${clock}</span></span>
      <span class="sb-block"><span class="dot dot-green"></span><span class="sb-ok">● OPERATIONAL</span></span>
      <span class="sb-spacer"></span>
      <span class="sb-block sb-amber hide-sm">ACTIVE TASKS [3 RUNNING]</span>
      <span class="sb-block sb-amber hide-sm">DOWNLOAD QUEUE [12 ITEMS · 2.4GB]</span>
      <span class="sb-progress hide-sm"><span class="fill"></span></span>
      <span class="sb-block sb-green hide-sm">NETWORK [OPTIMAL · 847MB/s]</span>
      <span class="sb-block sb-dim hide-sm">BUILD 37.2.108</span>
    </footer>
  `

  return html`
    <div id="gpz-root">
      <${MatrixRain} reduce=${reduce} />
      ${bgLayers}
      <main class="gpz-main">
        ${topbar}
        ${heroSection}
        ${consoleBar}
        <section class="console-wrap">
          <div class="console-layout">
            ${mainCol}
            ${sidebar}
          </div>
        </section>
      </main>
      ${statusBar}
      ${toastMsg && html`<div class="gpz-toast">▸ ${toastMsg}</div>`}
    </div>
  `
}
