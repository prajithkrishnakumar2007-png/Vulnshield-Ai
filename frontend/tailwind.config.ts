import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#05070D",
        surface: "#0B0F19",
        "surface-border": "rgba(255, 255, 255, 0.08)",
        cyan: {
          DEFAULT: "#00E5FF",
          glow: "rgba(0, 229, 255, 0.25)"
        },
        violet: {
          DEFAULT: "#7C5CFF",
          glow: "rgba(124, 92, 255, 0.25)"
        },
        alert: {
          DEFAULT: "#FF3B5C",
          glow: "rgba(255, 59, 92, 0.3)"
        },
        success: {
          DEFAULT: "#00FFA3",
          glow: "rgba(0, 255, 163, 0.25)"
        },
        warning: "#FFB800"
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        sans: ["Space Grotesk", "Inter", "sans-serif"]
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        }
      }
    },
  },
  plugins: [],
};
export default config;
