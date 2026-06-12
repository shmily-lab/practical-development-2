import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [
    basicSsl(),
    // ★ 自定义插件：/redirect 端点用于 302 重定向到支付 scheme
    //   前端 JS 跳转 wxp:// 会被 Chrome 拦截，但服务端 302 不会被拦
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
              res.writeHead(302, { Location: url });
              res.end();
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
