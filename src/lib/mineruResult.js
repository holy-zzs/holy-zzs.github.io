// mineruResult.js — Normalize Tencent backend payloads into the shape
// the current upload and analysis flow can consume.

function toArray(value) {
  return Array.isArray(value) ? value : []
}

export function deriveAnalysisText(payload) {
  return payload?.markdown || payload?.text || ''
}

export function collectMineruDownloads(payload) {
  const downloads = payload?.downloads || {}
  return [
    downloads.zip ? { key: 'zip', label: '下载结果包', url: downloads.zip } : null,
    downloads.markdown ? { key: 'markdown', label: '查看 Markdown', url: downloads.markdown } : null,
    downloads.normalizedJson ? { key: 'normalizedJson', label: '查看 JSON', url: downloads.normalizedJson } : null,
  ].filter(Boolean)
}

export function normalizeMineruExtraction(result) {
  const raw = result?.rawExtraction || {}
  const structured = result?.structured || {}
  const tables = toArray(structured.tables)
  const formulas = toArray(structured.formulas)

  return {
    text: raw.text || '',
    markdown: raw.markdown || '',
    downloads: raw.downloads || {},
    structured,
    warnings: toArray(result?.warnings),
    parseMeta: {
      source: 'mineru',
      pageCount: raw.numPages || 0,
      backendUsed: raw.backendUsed !== false,
      mineruUsed: raw.mineruUsed !== false,
      extractionMethod: raw.extractionMethod || 'mineru-vlm',
      batchId: raw.batchId || '',
      hasTables: tables.length > 0,
      hasFormulas: formulas.length > 0,
      ocrUsed: result?.mineruTask?.ocrUsed ?? true,
    },
  }
}
