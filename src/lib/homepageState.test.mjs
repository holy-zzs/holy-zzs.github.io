import assert from 'node:assert/strict'
import {
  getLandingPrimaryAction,
  getLandingSecondaryActions,
  isSupportedMaterialFilename,
  getUploadDropState,
} from './homepageState.mjs'

assert.deepEqual(
  getLandingPrimaryAction({ designDoc: { id: 'doc-1' } }),
  { key: 'preview', label: '继续试玩游戏', step: 'preview' }
)

assert.deepEqual(
  getLandingPrimaryAction({ material: { id: 'mat-1' } }),
  { key: 'workspace', label: '继续生成游戏', step: 'workspace' }
)

assert.deepEqual(
  getLandingPrimaryAction({ user: { id: 'u1' }, projects: [{ id: 'p1' }] }),
  { key: 'projects', label: '继续我的项目', step: 'projects' }
)

assert.deepEqual(
  getLandingPrimaryAction({ user: { id: 'u1' } }),
  { key: 'upload', label: '上传教材开始', step: 'upload' }
)

assert.deepEqual(
  getLandingPrimaryAction({}),
  { key: 'demo', label: '先用示例体验', step: null }
)

assert.equal(
  getLandingSecondaryActions({ user: { id: 'u1' } }).some((item) => item.key === 'upload'),
  false
)

assert.equal(isSupportedMaterialFilename('教材.pdf'), true)
assert.equal(isSupportedMaterialFilename('lecture.docx'), true)
assert.equal(isSupportedMaterialFilename('notes.md'), true)
assert.equal(isSupportedMaterialFilename('image.png'), false)

assert.equal(getUploadDropState(''), 'idle')
assert.equal(getUploadDropState('教材.pdf'), 'hover-accept')
assert.equal(getUploadDropState('素材.zip'), 'hover-reject')

console.log('homepageState tests passed')
