import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1A8FA8",
          dark: "#136F84",
          light: "#E6F5F8",
        },
        bg: "#F5F5F7",
        surface: "#FFFFFF",
        text1: "#1D1D1F",
        text2: "#6E6E73",
        separator: "#E5E5EA",
        success: "#34C759",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.04)",
        "card-lg": "0 4px 12px 0 rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
