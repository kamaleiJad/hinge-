import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));

// Builds a single self-contained index.html (JS + CSS inlined) that runs the
// whole app in the browser with no server — it talks to Anthropic directly.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: {
      // Reuse the server's staged-generation core in the browser bundle.
      "@core": path.resolve(dir, "../server/src/timeline"),
    },
  },
  build: {
    outDir: "dist-standalone",
    rollupOptions: {
      input: path.resolve(dir, "standalone.html"),
    },
  },
});
