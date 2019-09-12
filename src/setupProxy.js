const proxy = require('http-proxy-middleware');

module.exports = (appExpress) => {
  console.dir(appExpress);
  appExpress.use(['/api','/frontendlogger'], proxy({
    target: 'http://localhost:3002',
    changeOrigin: true,
  }));
};
