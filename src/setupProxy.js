const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function setupProxy(app) {
  app.use(createProxyMiddleware("/api", { target: "http://localhost:3002/", pathRewrite: { "^/api/": "/api/" } }));
  app.use(
    createProxyMiddleware("/graphql", { target: "http://localhost:3002/", pathRewrite: { "^/graphql/": "/graphql/" } })
  );
  app.use(
    createProxyMiddleware("/flyt", {
      target: "http://localhost:8088/",
      pathRewrite: { ".*/flyt/": "/flyt/" },
    })
  );
  app.use(
    createProxyMiddleware("/frontendlogger", {
      target: "http://localhost:3002/",
      pathRewrite: { "^/frontendlogger/": "frontendlogger/" },
    })
  );
};
