const esbuild = require("esbuild");

function vitePluginJsx(options = {}) {
  return {
    name: "vite-plugin-jsx",
    enforce: "pre",
    // eslint-disable-next-line consistent-return
    async transform(code, id) {
      if (id.endsWith(".js") && /\bReact\./.test(code)) {
        const result = await esbuild.transform(code, {
          loader: "jsx",
          target: "es2020",
          jsxFactory: options.jsxFactory || "React.createElement",
          jsxFragment: options.jsxFragment || "React.Fragment",
        });
        return {
          code: result.code,
          map: result.map,
        };
      }
    },
  };
}

module.exports = vitePluginJsx;
