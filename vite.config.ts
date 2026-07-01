import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import * as path from "path";

// API port can be overridden via VITE_API_PORT env var (e.g., for E2E playback mode)
const LOCAL_API_PORT = parseInt(process.env.VITE_API_PORT || "8080", 10);
// eslint-disable-next-line no-console
if (process.env.VITE_API_PORT) console.log(`[Vite] Using API port: ${LOCAL_API_PORT}`);
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
    // Ignore directories during watch to prevent HMR reloads during E2E tests
    watch: {
      ignored: ["**/node_modules/**", "**/dist/**", "**/tests/e2e/reports/**", "**/tests/e2e/artifacts/**"],
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
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "json", "json-summary", "html"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{js,jsx,ts,tsx}"],
      exclude: [
        "src/**/*.test.{js,jsx,ts,tsx}",
        "src/**/*.spec.{js,jsx,ts,tsx}",
        "src/**/__tests__/**",
        "src/setupTests.js",
      ],
    },
  },
});
