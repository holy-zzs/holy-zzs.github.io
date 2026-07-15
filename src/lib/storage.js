// localStorage 安全封装（带 JSON 序列化、命名空间、错误处理）
const NS = 'knb_' // 命名空间前缀

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(NS + key)
      if (raw === null) return fallback
      return JSON.parse(raw)
    } catch (e) {
      console.warn(`[storage] 读取 ${key} 失败:`, e)
      return fallback
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(NS + key, JSON.stringify(value))
      return true
    } catch (e) {
      // 配额超限或隐私模式
      console.error(`[storage] 写入 ${key} 失败:`, e)
      return false
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(NS + key)
      return true
    } catch (e) {
      return false
    }
  },

  clear() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(NS))
        .forEach(k => localStorage.removeItem(k))
      return true
    } catch (e) {
      return false
    }
  },

  // 获取占用大小（KB）
  size() {
    let total = 0
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(NS))
        .forEach(k => { total += (localStorage.getItem(k) || '').length })
    } catch (e) {}
    return Math.round(total / 1024 * 10) / 10
  }
}

// 生成唯一 ID
export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}
