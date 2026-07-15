// 密码加密模块（任务4：密码加密存储）
// 使用 crypto-js 做 SHA-256 + 随机 salt，不明文存储密码
import CryptoJS from 'crypto-js'

// 生成随机 salt（16字节 hex）
export function generateSalt(len = 16) {
  const words = CryptoJS.lib.WordArray.random(len)
  return words.toString(CryptoJS.enc.Hex)
}

// 密码加密：SHA-256(password + salt) 返回 hex
export function hashPassword(password, salt) {
  return CryptoJS.SHA256(password + salt).toString(CryptoJS.enc.Hex)
}

// 验证密码
export function verifyPassword(password, salt, hash) {
  return hashPassword(password, salt) === hash
}

// 生成邮箱验证码（6位数字，任务4邮箱验证）
export function generateVerifyCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

// 邮箱格式校验
export function isValidEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
}

// 密码强度校验（至少8位，含字母和数字）
export function isStrongPassword(password) {
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password)
}

// 密码强度评分 0-4
export function passwordStrength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  return Math.min(score, 4)
}

export const STRENGTH_LABELS = ['太弱', '弱', '一般', '强', '很强']
