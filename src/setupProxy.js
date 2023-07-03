const { createProxyMiddleware } = import("http-proxy-middleware");

module.exports = function setupProxy(app) {
  app.use(
    createProxyMiddleware(["/api", "/graphql"], {
      target: `http://localhost:${process.env.VITE_LOCAL_API_PORT}/`,
    })
  );
  app.use(
    createProxyMiddleware("/melosys/api", {
      target: `http://localhost:${process.env.VITE_LOCAL_API_PORT}`,
      pathRewrite: {
        "^/melosys": "",
      },
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
  app.use(
    createProxyMiddleware("/faktureringskomponenten", {
      target: "http://localhost:8084/",
      pathRewrite: {
        "^/faktureringskomponenten": "",
      },
    })
  );
};
