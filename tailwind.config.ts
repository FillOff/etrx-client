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
        background: "var(--background)",
        foreground: "var(--foreground)",
        "main-red":  "var(--main-red)",
        "main-yellow":  "var(--main-yellow)",
        "main-beige": "var(--main-beige)",
        "main": "var(--main)",
        "main-dark": "var(--main-dark)",
        "main-light": "var(--main-light)",
      },
    },
  },
  plugins: [],
};
export default config;
