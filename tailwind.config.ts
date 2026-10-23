import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "375px",
      sm: "431px",
      md: "600px",
      lg: "1024px",
      xl: "1440px",
    },
    extend: {
      colors: {
        bg: {
          base: "#14110F",
        },
        surface: {
          DEFAULT: "#1C1714",
          elevated: "#261E19",
          card: "#1E1815",
        },
        accent: {
          gold: "#D39A5B",
          "gold-hover": "#B87F42",
          cream: "#E7C9A5",
          terracotta: "#8C5A2B",
        },
        ink: {
          primary: "#F2E8DC",
          secondary: "#9D8C7C",
          muted: "#6E5F52",
        },
        border: {
          subtle: "#2C241E",
          accent: "#453324",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        reading: [
          "var(--font-reading)",
          "Literata",
          "ui-serif",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
        display: ["var(--font-display)", "serif"],
      },
      spacing: {
        15: "3.75rem",
        22: "5.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
