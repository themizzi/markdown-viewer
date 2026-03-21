import { resolve } from "node:path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

const rootDir = process.cwd();

export default defineConfig({
  main: {
    build: {
      externalizeDeps: {
        exclude: ["highlight.js"]
      },
      outDir: "out/main",
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(rootDir, "src/main.ts")
        },
        output: {
          entryFileNames: "[name].js"
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: "out/preload",
      emptyOutDir: true,
      rollupOptions: {
        input: {
          preload: resolve(rootDir, "src/preload.ts")
        },
        output: {
          entryFileNames: "[name].js"
        }
      }
    }
  },
  renderer: {
    root: resolve(rootDir, "src"),
    base: "./",
    build: {
      outDir: resolve(rootDir, "out/renderer"),
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(rootDir, "src/index.html")
      }
    }
  }
});
