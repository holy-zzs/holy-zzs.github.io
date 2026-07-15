// Vercel Serverless Function: HTTPS 代理 → 腾讯云 PDF 服务
// 部署到 Vercel 后，GitHub Pages (HTTPS) 可以通过此代理调用 HTTP 后端
// 环境变量: PDF_BACKEND_URL=http://101.35.114.5:8000

export const config = {
  maxDuration: 300, // 5分钟超时（OCR 大文件需要时间）
};

export default async function handler(req, res) {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const backendUrl = process.env.PDF_BACKEND_URL || 'http://101.35.114.5:8000';

  // 健康检查
  if (req.url === '/api/pdf-proxy/health' || req.url === '/health') {
    try {
      const resp = await fetch(`${backendUrl}/health`, { signal: AbortSignal.timeout(5000) });
      const data = await resp.json();
      return res.status(200).json(data);
    } catch (e) {
      return res.status(502).json({ error: e.message, online: false });
    }
  }

  // PDF 解析代理
  if (req.url === '/api/pdf-proxy/parse-pdf' || req.url === '/parse-pdf') {
    try {
      // 获取上传的文件
      const contentType = req.headers['content-type'] || '';
      if (!contentType.includes('multipart/form-data')) {
        return res.status(400).json({ error: '需要 multipart/form-data 请求' });
      }

      // 转发原始请求体到后端
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const body = Buffer.concat(chunks);

      const resp = await fetch(`${backendUrl}/parse-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': contentType,
        },
        body: body,
        signal: AbortSignal.timeout(300000), // 5分钟
      });

      const data = await resp.json();
      return res.status(resp.status).json(data);
    } catch (e) {
      console.error('PDF proxy error:', e);
      return res.status(502).json({ error: e.message });
    }
  }

  return res.status(404).json({ error: 'Not found' });
}
