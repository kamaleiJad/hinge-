import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Browsers refuse to run `<script type="module">` from a file:// URL, and the
 * iife output below has no import/export, so strip the module attributes. We
 * rewrite the emitted HTML asset in-memory (post singlefile inlining) rather
 * than reading it back off disk — the latter is timing/CWD-fragile in CI.
 */
function classicInlineScript(): Plugin {
  return {
    name: "hinge-classic-inline-script",
    enforce: "post",
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (
          file.type === "asset" &&
          file.fileName.endsWith(".html") &&
          typeof file.source === "string"
        ) {
          file.source = file.source.replace(
            /<script\b[^>]*\btype="module"[^>]*>/g,
            "<script>"
          );
        }
      }
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
