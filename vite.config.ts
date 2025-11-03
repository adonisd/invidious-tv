import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { viteSingleFile } from "vite-plugin-singlefile";
import vuetify from "vite-plugin-vuetify";

export default defineConfig({
  base: "./",
  plugins: [
    vue({
      template: {
        compilerOptions: {
          whitespace: "condense",
        },
      },
    }),
    vuetify({ autoImport: true }),
    vueDevTools(),
    viteSingleFile({
      removeViteModuleLoader: true,
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    target: "es2015",
    cssCodeSplit: false,
    cssMinify: true,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info"],
      },
    },
    sourcemap: false,
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined,
      },
    },
  },
  optimizeDeps: {
    include: ["vue", "vuetify"],
  },
});
