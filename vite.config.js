import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [
    basicSsl(),
    // ★ 自定义插件：/redirect 端点——返回 HTML 页面用 meta refresh 跳转
    //   302 重定向会被 Chrome 拦截，但 meta refresh 是浏览器渲染层面的跳转
    {
      name: 'payment-redirect',
      configureServer(server) {
        server.middlewares.use('/redirect', (req, res) => {
          try {
            const reqUrl = new URL(req.url, 'https://localhost');
            const url = reqUrl.searchParams.get('url');
            if (url && (url.startsWith('wxp://') || url.startsWith('weixin://') ||
                url.startsWith('alipays://') || url.startsWith('https://') ||
                url.startsWith('http://') || url.startsWith('intent://'))) {
              res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
              res.end(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="0;url=${url.replace(/"/g, '&quot;')}">
  <script>window.location.href="${url.replace(/"/g, '\\"')}";</script>
</head>
<body style="text-align:center;padding-top:50px;font-size:16px;">
  <p>正在跳转到支付平台...</p>
  <p style="margin-top:20px;">若未自动跳转，请<a href="${url.replace(/"/g, '&quot;')}" style="color:#07C160;font-size:18px;">点击此处</a></p>
</body>
</html>`);
            } else {
              res.writeHead(400);
              res.end('Missing or invalid url parameter');
            }
          } catch (e) {
            res.writeHead(400);
            res.end('Bad request');
          }
        });
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
