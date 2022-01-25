const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function setupProxy(app) {
  app.use(
    createProxyMiddleware(["/api", "/graphql", "/frontendlogger"], {
      target: `http://localhost:${process.env.REACT_APP_API_PORT}/`,
    })
  );
  app.use(createProxyMiddleware("/flyt", { target: "http://localhost:8088/" }));
};
