import assert from 'node:assert/strict'
import {
  collectMineruDownloads,
  deriveAnalysisText,
  normalizeMineruExtraction,
} from './mineruResult.js'

const sample = {
  jobId: 'job_123',
  rawExtraction: {
    text: '纯文本兼容字段',
    markdown: '# 标题\n\n第一章 内容',
    numPages: 18,
    backendUsed: true,
    mineruUsed: true,
    extractionMethod: 'mineru-vlm',
    batchId: 'batch_123',
    downloads: {
      zip: 'https://backend/full.zip',
      markdown: 'https://backend/full.md',
      normalizedJson: 'https://backend/normalized.json',
    },
  },
  structured: {
    tables: [{ page: 2, title: '表1' }],
    formulas: [{ latex: 'E=mc^2' }],
    contentList: [{ type: 'text', text: '正文内容' }],
    modelJson: {},
    middleJson: {},
    assets: [],
    rawFiles: ['full.md', 'content_list.json'],
  },
  warnings: [{ type: 'ocr_info', title: 'OCR 已启用' }],
}

const normalized = normalizeMineruExtraction(sample)

assert.equal(deriveAnalysisText(normalized), '# 标题\n\n第一章 内容')
assert.deepEqual(collectMineruDownloads(normalized), [
  { key: 'zip', label: '下载结果包', url: 'https://backend/full.zip' },
  { key: 'markdown', label: '查看 Markdown', url: 'https://backend/full.md' },
  { key: 'normalizedJson', label: '查看 JSON', url: 'https://backend/normalized.json' },
])
assert.equal(normalized.parseMeta.pageCount, 18)
assert.equal(normalized.parseMeta.hasTables, true)
assert.equal(normalized.parseMeta.hasFormulas, true)
assert.equal(normalized.parseMeta.batchId, 'batch_123')

console.log('mineruResult tests passed')
