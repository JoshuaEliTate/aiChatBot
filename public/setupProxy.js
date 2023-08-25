const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/upload',
    createProxyMiddleware({
      target: 'https://4cd5-50-210-39-233.ngrok-free.app',
      changeOrigin: true,
    })
  );
};
