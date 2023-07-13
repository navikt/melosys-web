import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import { fileURLToPath, URL } from "node:url";
import * as path from "path";
import reactRefresh from "@vitejs/plugin-react-refresh";

export default defineConfig({
  base: "/melosys",
  // React JSX transform krever babel så i vite må man fortsatt importe
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
  plugins: [
    {
      name: "vite-plugin-disable-import-analysis",
      enforce: "pre",
      async transform(code) {
        return {
          code,
          map: null,
          meta: {
            skipParsing: true,
          },
        };
      },
    },
    // @ts-ignore
    react({
      include: /\.(js|jsx|ts|tsx)$/,
      jsxImportSource: "react",
      jsxRuntime: "classic",
    }),
    reactRefresh(),
    viteTsconfigPaths(),
    svgrPlugin(),
  ],
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      "/api": `http://localhost:${process.env.VITE_LOCAL_API_PORT}`,
      "/graphql": `http://localhost:${process.env.VITE_LOCAL_API_PORT}`,
      "/melosys/api": {
        target: `http://localhost:${process.env.VITE_LOCAL_API_PORT}`,
        rewrite: (urlpath) => urlpath.replace(/^\/melosys/, ""),
      },
      "/trygdeavtale-flyt": {
        target: "http://localhost:8088",
        rewrite: (urlpath) => urlpath.replace(/^\/trygdeavtale-flyt/, "/flyt"),
      },
      "/faktureringskomponenten": {
        target: "http://localhost:8084",
        rewrite: (urlpath) => urlpath.replace(/^\/faktureringskomponenten/, ""),
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  resolve: {
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx"],
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
      src: fileURLToPath(new URL("./src", import.meta.url)),
      "nav-frontend-alertstriper-style": fileURLToPath(new URL("./src/nav-style/alertstriper.css", import.meta.url)),
      "nav-frontend-chevron-style": fileURLToPath(new URL("./src/nav-style/chevron.css", import.meta.url)),
      "nav-frontend-ekspanderbartpanel-style": fileURLToPath(
        new URL("./src/nav-style/ekspanderbartpanel.css", import.meta.url)
      ),
      "nav-frontend-etiketter-style": fileURLToPath(new URL("./src/nav-style/etiketter.css", import.meta.url)),
      "nav-frontend-grid-style": fileURLToPath(new URL("./src/nav-style/grid.css", import.meta.url)),
      "nav-frontend-hjelpetekst-style": fileURLToPath(new URL("./src/nav-style/hjelpetekst.css", import.meta.url)),
      "nav-frontend-knapper-style": fileURLToPath(new URL("./src/nav-style/knapper.css", import.meta.url)),
      "nav-frontend-lenkepanel-style": fileURLToPath(new URL("./src/nav-style/lenkepanel.css", import.meta.url)),
      "nav-frontend-lenker-style": fileURLToPath(new URL("./src/nav-style/lenker.css", import.meta.url)),
      "nav-frontend-lesmerpanel-style": fileURLToPath(new URL("./src/nav-style/lesmerpanel.css", import.meta.url)),
      "nav-frontend-lukknapp-style": fileURLToPath(new URL("./src/nav-style/lukknapp.css", import.meta.url)),
      "nav-frontend-modal-style": fileURLToPath(new URL("./src/nav-style/modal.css", import.meta.url)),
      "nav-frontend-paneler-style": fileURLToPath(new URL("./src/nav-style/paneler.css", import.meta.url)),
      "nav-frontend-popover-style": fileURLToPath(new URL("./src/nav-style/popover.css", import.meta.url)),
      "nav-frontend-skjema-style": fileURLToPath(new URL("./src/nav-style/skjema.css", import.meta.url)),
      "nav-frontend-snakkeboble-style": fileURLToPath(new URL("./src/nav-style/snakkeboble.css", import.meta.url)),
      "nav-frontend-spinner-style": fileURLToPath(new URL("./src/nav-style/spinner.css", import.meta.url)),
      "nav-frontend-stegindikator-style": fileURLToPath(new URL("./src/nav-style/stegindikator.css", import.meta.url)),
      "nav-frontend-typografi-style": fileURLToPath(new URL("./src/nav-style/typografi.css", import.meta.url)),
      AppTypes: path.resolve(__dirname, "./src/globalmodules/AppTypes.ts"),
      Domene: path.resolve(__dirname, "./src/globalmodules/Domene.ts"),
      "melosys-api": path.resolve(__dirname, "./src/globalmodules/melosys-api.ts"),
      // "nav-frontend-grid": path.resolve(__dirname, "src/globalmodules/nav-frontend-grid.ts"),
    },
  },
});
