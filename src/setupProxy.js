const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function setupProxy(app) {
  app.use(createProxyMiddleware("/api", { target: "http://localhost:3002/", pathRewrite: { "^/api/": "/api/" } }));
  app.use(
    createProxyMiddleware("/stegvelger", {
      target: "http://localhost:8080/",
      pathRewrite: { ".*/stegvelger/": "/stegvelger/" },
    })
  );
  app.use(
    createProxyMiddleware("/frontendlogger", {
      target: "http://localhost:3002/",
      pathRewrite: { "^/frontendlogger/": "frontendlogger/" },
    })
  );
};
