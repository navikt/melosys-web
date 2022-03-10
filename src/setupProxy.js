const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function setupProxy(app) {
  app.use(
    createProxyMiddleware(["/api", "/graphql", "/frontendlogger", ""], {
      target: `http://localhost:${process.env.REACT_APP_LOCAL_API_PORT}/`,
    })
  );
  app.use(
    createProxyMiddleware("/trygdeavtale-flyt", {
      target: "http://localhost:8088/",
      pathRewrite: {
        "^/trygdeavtale-flyt": "/flyt",
      },
    })
  );
};
