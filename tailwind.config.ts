import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        base: {
          950: "#0a0c10",
          900: "#0d0f14",
          850: "#11141b",
          800: "#161a22",
          750: "#1b1f29",
          700: "#212633",
          600: "#2a3040",
          500: "#3a4155",
        },
        accent: {
          DEFAULT: "#f2a03d",
          light: "#f5b464",
          dark: "#c97f28",
          muted: "#f2a03d1a",
        },
        ok: {
          DEFAULT: "#34c281",
          muted: "#34c2811a",
        },
        warn: {
          DEFAULT: "#e8637a",
          muted: "#e8637a1a",
        },
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset",
      },
    },
  },
  plugins: [],
};

export default config;
