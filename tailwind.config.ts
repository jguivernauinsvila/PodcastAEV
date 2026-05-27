import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171414",
        paper: "#fffaf2",
        coral: "#ed6958",
        mint: "#4f9b8f",
        honey: "#f2b84b"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(23, 20, 20, 0.11)"
      }
    }
  },
  plugins: []
};

export default config;
