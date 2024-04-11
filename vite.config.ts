import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import { fileURLToPath, URL } from "node:url";
import * as path from "path";
import reactRefresh from "@vitejs/plugin-react-refresh";

const LOCAL_API_PORT = 8080;
const LOCAL_TRYGDEAVTALE_FLYT_PORT = 8088;
const LOCAL_FAKTURERINGSKOMPONENTEN_PORT = 8084;

export default defineConfig({
  base: "/melosys",
  // React JSX transform krever babel så i vite må man fortsatt importe
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  build: {
    outDir: "./build",
    emptyOutDir: true,
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
      "/api": `http://localhost:${LOCAL_API_PORT}`,
      "/graphql": `http://localhost:${LOCAL_API_PORT}`,
      "/melosys/api": {
        target: `http://localhost:${LOCAL_API_PORT}`,
        rewrite: (urlpath) => urlpath.replace(/^\/melosys/, ""),
      },
      "/trygdeavtale-flyt": {
        target: `http://localhost:${LOCAL_TRYGDEAVTALE_FLYT_PORT}`,
        rewrite: (urlpath) => urlpath.replace(/^\/trygdeavtale-flyt/, "/flyt"),
      },
      "/faktureringskomponenten": {
        target: `http://localhost:${LOCAL_FAKTURERINGSKOMPONENTEN_PORT}`,
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
      "nav-frontend-hjelpetekst-style": fileURLToPath(new URL("./src/nav-style/hjelpetekst.css", import.meta.url)),
      "nav-frontend-knapper-style": fileURLToPath(new URL("./src/nav-style/knapper.css", import.meta.url)),
      "nav-frontend-lenkepanel-style": fileURLToPath(new URL("./src/nav-style/lenkepanel.css", import.meta.url)),
      "nav-frontend-lenker-style": fileURLToPath(new URL("./src/nav-style/lenker.css", import.meta.url)),
      "nav-frontend-lukknapp-style": fileURLToPath(new URL("./src/nav-style/lukknapp.css", import.meta.url)),
      "nav-frontend-modal-style": fileURLToPath(new URL("./src/nav-style/modal.css", import.meta.url)),
      "nav-frontend-paneler-style": fileURLToPath(new URL("./src/nav-style/paneler.css", import.meta.url)),
      "nav-frontend-popover-style": fileURLToPath(new URL("./src/nav-style/popover.css", import.meta.url)),
      "nav-frontend-skjema-style": fileURLToPath(new URL("./src/nav-style/skjema.css", import.meta.url)),
      "nav-frontend-snakkeboble-style": fileURLToPath(new URL("./src/nav-style/snakkeboble.css", import.meta.url)),
      "nav-frontend-spinner-style": fileURLToPath(new URL("./src/nav-style/spinner.css", import.meta.url)),
      "nav-frontend-typografi-style": fileURLToPath(new URL("./src/nav-style/typografi.css", import.meta.url)),
      AppTypes: path.resolve(__dirname, "./src/globalmodules/AppTypes.ts"),
      Domene: path.resolve(__dirname, "./src/globalmodules/Domene.ts"),
      "melosys-api": path.resolve(__dirname, "./src/globalmodules/melosys-api.ts"),
    },
  },
});
