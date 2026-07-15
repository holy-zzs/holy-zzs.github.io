export function getLandingPrimaryAction(state = {}) {
  if (state.designDoc) {
    return { key: 'preview', label: '继续试玩游戏', step: 'preview' }
  }

  if (state.material) {
    return { key: 'workspace', label: '继续生成游戏', step: 'workspace' }
  }

  if (state.user && Array.isArray(state.projects) && state.projects.length > 0) {
    return { key: 'projects', label: '继续我的项目', step: 'projects' }
  }

  // 已选学段 → 进入学科选择
  if (state.selectedGrade) {
    return { key: 'start', label: '快速开始生成', step: 'subject' }
  }

  // 未选学段 → 留在首页选学段
  return { key: 'start', label: '快速开始生成', step: null }
}

export function getLandingSecondaryActions(state = {}) {
  const primaryKey = getLandingPrimaryAction(state).key
  const base = [
    { key: 'upload', label: '上传教材', step: 'upload' },
    { key: 'community', label: '浏览案例', step: 'community' },
    { key: 'hall', label: '沉浸式体验', step: 'hall' },
  ]

  return base.filter((item) => item.key !== primaryKey)
}

export function isSupportedMaterialFilename(filename = '') {
  return /\.(pdf|docx?|txt|md)$/i.test(filename.trim())
}

export function getUploadDropState(filename = '') {
  if (!filename) return 'idle'
  return isSupportedMaterialFilename(filename) ? 'hover-accept' : 'hover-reject'
}
