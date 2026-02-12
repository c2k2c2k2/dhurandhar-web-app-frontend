import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "rgb(var(--brand-navy))",
          navy2: "rgb(var(--brand-navy-2))",
          crimson: "rgb(var(--brand-crimson))",
          red: "rgb(var(--brand-red))",
          gold: "rgb(var(--brand-gold))",
          purple: "rgb(var(--brand-purple))",
        },
        background: "rgb(var(--background))",
        foreground: "rgb(var(--foreground))",
        card: "rgb(var(--card))",
        "card-foreground": "rgb(var(--card-foreground))",
        muted: "rgb(var(--muted))",
        "muted-foreground": "rgb(var(--muted-foreground))",
        border: "rgb(var(--border))",
        input: "rgb(var(--input))",
        primary: "rgb(var(--primary))",
        "primary-foreground": "rgb(var(--primary-foreground))",
        secondary: "rgb(var(--secondary))",
        "secondary-foreground": "rgb(var(--secondary-foreground))",
        accent: "rgb(var(--accent))",
        "accent-foreground": "rgb(var(--accent-foreground))",
        destructive: "rgb(var(--destructive))",
        "destructive-foreground": "rgb(var(--destructive-foreground))",
        ring: "rgb(var(--ring))",
      },
      borderRadius: {
        xl: "calc(var(--radius) - 4px)",
        "2xl": "var(--radius)",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "var(--font-devanagari)",
          "Noto Sans Devanagari",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Arial",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "var(--font-sans)",
          "var(--font-devanagari)",
          "Noto Sans Devanagari",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
