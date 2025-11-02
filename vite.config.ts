import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { viteSingleFile } from "vite-plugin-singlefile";
import vuetify from "vite-plugin-vuetify";

export default defineConfig({
  base: "./",
  plugins: [vue(), vuetify({ autoImport: true }), vueDevTools(), viteSingleFile()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    target: "es2015",
    // assetsInlineLimit: 100000000,
    // chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    cssMinify: true,
    minify: true,
    sourcemap: false,
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
