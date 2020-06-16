const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(createProxyMiddleware('/api', { target: 'http://localhost:3002/', pathRewrite: { '^/api/': '/api/' } }));
  app.use(createProxyMiddleware('/frontendlogger', { target: 'http://localhost:3002/', pathRewrite: { '^/frontendlogger/': 'frontendlogger/' } }));
};
