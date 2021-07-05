const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function setupProxy(app) {
  app.use(createProxyMiddleware("/api", { target: "http://localhost:3002/" }));
  app.use(createProxyMiddleware("/graphql", { target: "http://localhost:3002/" }));
  app.use(createProxyMiddleware("/frontendlogger", { target: "http://localhost:3002/" }));
  app.use(createProxyMiddleware("/flyt", { target: "http://localhost:8088/" }));
};
