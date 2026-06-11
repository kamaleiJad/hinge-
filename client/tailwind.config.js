/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // A muted, academic palette — parchment grounds, ink text, faded accents.
      colors: {
        parchment: {
          DEFAULT: "#f4f1ea",
          dark: "#e9e4d8",
        },
        ink: {
          DEFAULT: "#2b2722",
          soft: "#4a443c",
          faint: "#8a8275",
        },
        accent: {
          DEFAULT: "#7c5e3c", // muted umber
          soft: "#a98a5f",
        },
      },
      fontFamily: {
        // Serif for headlines/structure, sans for dense body/labels.
        serif: ["'Iowan Old Style'", "'Palatino Linotype'", "Palatino", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
