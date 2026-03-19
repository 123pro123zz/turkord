import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-main)",
        sidebar: "var(--bg-sidebar)",
        sidebarHover: "var(--bg-sidebar-hover)",
        textMain: "var(--text-main)",
        textMuted: "var(--text-muted)",
        accent: "var(--accent)",
        borderMain: "var(--border-main)",
      },
      borderRadius: {
        apple: "12px",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        apple: "0 4px 24px -6px rgba(0, 0, 0, 0.08)",
      }
    },
  },
  plugins: [],
};
export default config;
