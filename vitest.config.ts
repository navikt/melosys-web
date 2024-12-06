import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import * as path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    tsconfigPaths(),
  ],
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      // Also include __tests__ directories
      'src/**/__tests__/**/*.{js,jsx,ts,tsx}'
    ],
    // Adding these for better debugging
    reporters: ['verbose'],
    testTimeout: 10000,
    watchExclude: ['**/node_modules/**', '**/dist/**'],
    // Add this to see more details about test discovery
    sequence: {
      shuffle: false
    },
  },
  resolve: {
    alias: {
      AppTypes: path.resolve(__dirname, './src/globalmodules/AppTypes.ts'),
      Domene: path.resolve(__dirname, './src/globalmodules/Domene.ts'),
      'melosys-api': path.resolve(__dirname, './src/globalmodules/melosys-api.ts'),
    }
  }
});
