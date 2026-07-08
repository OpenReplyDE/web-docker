import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag: string) =>
            ["observed-fragment", "page-fragment"].includes(tag),
        },
      },
    }),
  ],
  build: {
    outDir: "dist/test-host",
    rollupOptions: {
      input: "test-host.html",
    },
  },
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
