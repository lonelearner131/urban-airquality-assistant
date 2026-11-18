import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        aqi: {
          good: "#16a34a",
          moderate: "#ca8a04",
          poor: "#ea580c",
          unhealthy: "#dc2626",
          severe: "#7f1d1d",
          hazardous: "#581c87",
        },
      },
    },
  },
  plugins: [],
};

export default config;
