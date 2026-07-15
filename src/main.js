// React 应用挂载入口
import { createRoot } from 'react-dom/client'
import { html } from './react.js'
import App from './App.js?v=10'

const root = createRoot(document.getElementById('root'))
root.render(html`<${App} />`)
