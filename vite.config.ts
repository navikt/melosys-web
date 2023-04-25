import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({ include: /\.jsx?$/ }), viteTsconfigPaths(), svgrPlugin()],
  // esbuild: {
  //   loader: 'jsx',
  //   include: /\.jsx?$/,
  //   exclude: /node_modules/,
  // },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        math: "always",
        relativeUrls: true,
        javascriptEnabled: true,
      },
    },
  },
  resolve: {
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx"],
    alias: {
      "nav-frontend-alertstriper-style": fileURLToPath(new URL("src/nav-style/alertstriper.css", import.meta.url)),
      "nav-frontend-chevron-style": fileURLToPath(new URL("src/nav-style/chevron.css", import.meta.url)),
      "nav-frontend-ekspanderbartpanel-style": fileURLToPath(
        new URL("src/nav-style/ekspanderbartpanel.css", import.meta.url)
      ),
      "nav-frontend-etiketter-style": fileURLToPath(new URL("src/nav-style/etiketter.css", import.meta.url)),
      "nav-frontend-grid-style": fileURLToPath(new URL("src/nav-style/grid.css", import.meta.url)),
      "nav-frontend-hjelpetekst-style": fileURLToPath(new URL("src/nav-style/hjelpetekst.css", import.meta.url)),
      "nav-frontend-knapper-style": fileURLToPath(new URL("src/nav-style/knapper.css", import.meta.url)),
      "nav-frontend-lenkepanel-style": fileURLToPath(new URL("src/nav-style/lenkepanel.css", import.meta.url)),
      "nav-frontend-lenker-style": fileURLToPath(new URL("src/nav-style/lenker.css", import.meta.url)),
      "nav-frontend-lesmerpanel-style": fileURLToPath(new URL("src/nav-style/lesmerpanel.css", import.meta.url)),
      "nav-frontend-lukknapp-style": fileURLToPath(new URL("src/nav-style/lukknapp.css", import.meta.url)),
      "nav-frontend-modal-style": fileURLToPath(new URL("src/nav-style/modal.css", import.meta.url)),
      "nav-frontend-paneler-style": fileURLToPath(new URL("src/nav-style/paneler.css", import.meta.url)),
      "nav-frontend-popover-style": fileURLToPath(new URL("src/nav-style/popover.css", import.meta.url)),
      "nav-frontend-skjema-style": fileURLToPath(new URL("src/nav-style/skjema.css", import.meta.url)),
      "nav-frontend-snakkeboble-style": fileURLToPath(new URL("src/nav-style/snakkeboble.css", import.meta.url)),
      "nav-frontend-spinner-style": fileURLToPath(new URL("src/nav-style/spinner.css", import.meta.url)),
      "nav-frontend-stegindikator-style": fileURLToPath(new URL("src/nav-style/stegindikator.css", import.meta.url)),
      "nav-frontend-typografi-style": fileURLToPath(new URL("src/nav-style/typografi.css", import.meta.url)),
    },
  },
});
