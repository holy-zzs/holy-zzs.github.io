// 统一 React + htm 导出，供所有组件使用
// 用法: import { html, useState } from '/src/react.js'
import React from 'react'
import htm from 'htm'

const html = htm.bind(React.createElement)

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
  Fragment
} from 'react'
