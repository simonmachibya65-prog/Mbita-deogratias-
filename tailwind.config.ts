import type { Config } from "tailwindcss";

/**
 * Custom academic colour palette designed to meet WCAG 2.1 Level AA:
 * - Body text (navy-900 on white): contrast ratio ~14:1 (exceeds 4.5:1 requirement)
 * - Large text (navy-700 on white): contrast ratio ~7:1 (exceeds 3:1 requirement)
 * - Primary accent (navy-600 on white): contrast ratio ~5.5:1 (exceeds 4.5:1 requirement)
 * - Muted text (gray-600 on white): contrast ratio ~5.9:1 (exceeds 4.5:1 requirement)
 */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Deep navy/blue primary palette — professional academic scheme
        navy: {
          50:  "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#829ab1",
          500: "#627d98",
          600: "#486581",  // contrast ~5.5:1 on white — passes AA for normal text
          700: "#334e68",  // contrast ~7.1:1 on white — passes AA for normal text
          800: "#243b53",  // contrast ~10.4:1 on white
          900: "#102a43",  // contrast ~14.2:1 on white — primary body text
          950: "#0a1929",  // extra dark for dark mode footer
        },
        // Accessible grays
        gray: {
          50:  "#f7f7f7",
          100: "#ebebeb",
          200: "#d9d9d9",
          300: "#c4c4c4",
          400: "#9d9d9d",
          500: "#7b7b7b",
          600: "#555555",  // contrast ~7.0:1 on white — passes AA for normal text
          700: "#434343",  // contrast ~9.7:1 on white
          800: "#262626",  // contrast ~15.3:1 on white
          900: "#171717",  // contrast ~18.1:1 on white
        },
        // Accent colours for badges and highlights
        accent: {
          blue:   "#1a56db",  // contrast ~5.9:1 on white — passes AA
          green:  "#057a55",  // contrast ~5.1:1 on white — passes AA
          amber:  "#92400e",  // contrast ~7.2:1 on white — passes AA
          red:    "#9b1c1c",  // contrast ~8.5:1 on white — passes AA
        },
        // Semantic aliases
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted:       "#555555",  // gray-600
        border:      "#d9d9d9",  // gray-200
        primary: {
          DEFAULT: "#334e68",  // navy-700
          hover:   "#243b53",  // navy-800
          light:   "#d9e2ec",  // navy-100
        },
      },
      fontFamily: {
        sans: [
          "Inter",
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
        serif: [
          "Georgia",
          "Cambria",
          "Times New Roman",
          "Times",
          "serif",
        ],
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
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#102a43",
            a: {
              color: "#334e68",
              "&:hover": {
                color: "#243b53",
              },
            },
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
