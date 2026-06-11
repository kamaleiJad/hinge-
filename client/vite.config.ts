import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const SERVER_PORT = process.env.PORT ?? "8787";

// The browser only ever talks to Vite (dev) / the static bundle (prod).
// All /api calls are proxied to the Express server so the API key stays
// server-side and never reaches the client.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: `http://localhost:${SERVER_PORT}`,
        changeOrigin: true,
      },
    },
  },
});
