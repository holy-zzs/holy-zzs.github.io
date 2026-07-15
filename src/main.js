// React 应用挂载入口
import { createRoot } from 'react-dom/client'
import { html } from './react.js?v=r1'
import App from './App.js?v=16'

const root = createRoot(document.getElementById('root'))
root.render(html`<${App} />`)
