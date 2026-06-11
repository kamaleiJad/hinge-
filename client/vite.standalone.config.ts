import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(dir, "dist-standalone/standalone.html");

/**
 * Browsers refuse to run `<script type="module">` from a file:// URL (so the
 * single file is blank when opened straight from Files/Finder). We build the
 * bundle as a classic IIFE and strip the module attributes so it runs anywhere.
 */
function classicInlineScript(): Plugin {
  return {
    name: "hinge-classic-inline-script",
    closeBundle() {
      let html = fs.readFileSync(OUT, "utf8");
      html = html.replace(/<script\b[^>]*\btype="module"[^>]*>/g, "<script>");
      fs.writeFileSync(html ? OUT : OUT, html);
    },
  };
}

// Builds a single self-contained index.html (JS + CSS inlined) that runs the
// whole app in the browser with no server — it talks to Anthropic directly.
export default defineConfig({
  plugins: [react(), viteSingleFile(), classicInlineScript()],
  resolve: {
    alias: {
      // Reuse the server's staged-generation core in the browser bundle.
      "@core": path.resolve(dir, "../server/src/timeline"),
    },
  },
  build: {
    outDir: "dist-standalone",
    // Broad compatibility for older mobile Safari.
    target: "es2019",
    cssCodeSplit: false,
    rollupOptions: {
      input: path.resolve(dir, "standalone.html"),
      output: {
        // No ES module / no code-splitting → a classic script that runs on file://.
        format: "iife",
        inlineDynamicImports: true,
      },
    },
  },
});
