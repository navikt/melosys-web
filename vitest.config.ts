import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import * as path from "path";
import svgrPlugin from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic",
    }),
    tsconfigPaths(),
    svgrPlugin(),
  ],
  esbuild: {
    jsxInject: `import React from 'react'`,
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
  resolve: {
    alias: {
      AppTypes: path.resolve(import.meta.url, "./src/globalmodules/AppTypes.ts"),
      Domene: path.resolve(import.meta.url, "./src/globalmodules/Domene.ts"),
      "melosys-api": path.resolve(import.meta.url, "./src/globalmodules/melosys-api.ts"),
    },
  },
});
