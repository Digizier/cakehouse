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
        gold: {
          50: "#FDFBF7",
          100: "#F9F3E5",
          200: "#F2E4C4",
          300: "#E7CE97",
          400: "#DCB86A",
          500: "#C58A24", // Primary Brand Gold
          600: "#A96812", // Deep Gold
          700: "#864E0E",
          800: "#693C0F",
          900: "#49290B",
          950: "#2B1604",
        },
        cream: {
          50: "#FFFDF9",
          100: "#FFF9EF",
          200: "#FDF4E3",
          300: "#F8ECD4",
          400: "#F0E0BF",
          500: "#E6D0A6",
        },
        chocolate: {
          800: "#3D2418",
          900: "#2B1B17", // Primary Deep Dark Text
          950: "#1A0E0B",
        },
        berry: {
          50: "#FDF2F4",
          100: "#FCE7EC",
          500: "#E65A88", // Reference discount badge color
          600: "#D33F71",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
        "marquee-slow": "marquee 35s linear infinite",
        "marquee-fast": "marquee 20s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
