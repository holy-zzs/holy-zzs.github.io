// 平台组件统一依赖入口
// 重新导出 React 核心 API + htm，并适配 htm 模板里 class= / for= 写法到 React 的 className / htmlFor
// 这样 platform 目录下用 `class=` 的组件（PlatformCommon 等）也能在 React 中正确渲染
import React from 'react'
import htm from 'htm'

// 保留原始 createElement 引用
const reactCreateElement = React.createElement

// 包装 createElement：把 htm 透传的 class/for 转成 React 认识的 className/htmlFor
function createElement(type, props, ...children) {
  if (props) {
    if (props.class != null) {
      props.className = props.class
      delete props.class
    }
    if (props.for != null) {
      props.htmlFor = props.for
      delete props.for
    }
  }
  return reactCreateElement(type, props, ...children)
}

const html = htm.bind(createElement)

export default React
export { html }
export {
  useState,
  useEffect,
  useRef,
  useReducer,
  useContext,
  createContext,
  useMemo,
  useCallback,
  useLayoutEffect,
  Fragment,
  Suspense
} from 'react'

// Export React Three Fiber components
export { Canvas, useFrame, useThree } from '@react-three/fiber'
export { Environment, Float, Sparkles, OrbitControls, ContactShadows, Text } from '@react-three/drei'
