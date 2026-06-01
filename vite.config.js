import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import checker from "vite-plugin-checker";
import svgLoader from "vite-svg-loader";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fileProtocolCompatPlugin = () => ({
  name: "file-protocol-compat",
  apply: "build",
  transformIndexHtml(html) {
    return html
      .replace(/\s+crossorigin(?=[\s>])/g, "")
      .replace(/<script([^>]*)\stype="module"([^>]*)>/g, "<script defer$1$2>");
  },
});

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  build: {
    modulePreload: false,
  },
  plugins: [
    vue(),
    svgLoader(),
    fileProtocolCompatPlugin(),
    checker({
      vueTsc: false,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
