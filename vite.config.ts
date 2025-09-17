import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import * as path from "path";

const LOCAL_API_PORT = 8080;
const LOCAL_TRYGDEAVTALE_FLYT_PORT = 8088;
const LOCAL_FAKTURERINGSKOMPONENTEN_PORT = 8084;

export default defineConfig({
  base: "/melosys",
  // React JSX transform krever babel så i vite må man fortsatt importe
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  css: {
    preprocessorOptions: {
      less: {
        math: "strict",
        relativeUrls: true,
        javascriptEnabled: false,
      },
    },
  },
  build: {
    outDir: "./build",
    emptyOutDir: true,
    rollupOptions: {
      external: ["/env-config.js"],
    },
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
    react({
      include: /\.(js|jsx|ts|tsx)$/,
      jsxRuntime: "automatic",
    }),
    viteTsconfigPaths(),
    svgrPlugin(),
  ],
  server: {
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
    // Ignore node_modules and dist directories during watch (moved from vitest.config watchExclude)
    watch: {
      ignored: ["**/node_modules/**", "**/dist/**"],
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
      AppTypes: path.resolve(import.meta.url, "./src/globalmodules/AppTypes.ts"),
      Domene: path.resolve(import.meta.url, "./src/globalmodules/Domene.ts"),
      "melosys-api": path.resolve(import.meta.url, "./src/globalmodules/melosys-api.ts"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
    include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}", "src/**/__tests__/**/*.{js,jsx,ts,tsx}"],
    reporters: ["verbose"],
    testTimeout: 10000,
    sequence: {
      shuffle: false,
    },
    // Explicitly define timers to mock to avoid issues with fetch/async ops in Vitest v3+
    fakeTimers: {
      toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "setImmediate", "clearImmediate", "Date"],
    },
  },
});
