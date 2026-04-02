import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        cinzel: ['Cinzel', 'serif'],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        cbdark: {
          "primary": "#fbbf24", // yellow-400 (FlameIcon, selected states)
          "primary-content": "#111827", // text on primary (dark for contrast)
          "secondary": "#3b82f6", // blue-500 (Unit focus)
          "accent": "#22c55e", // green-500 (Completed focus)
          "neutral": "#374151", // gray-700 (bgs)
          "base-100": "#111827", // gray-900 (Main background)
          "base-200": "#1f2937", // gray-800 (Card background)
          "base-300": "#374151", // gray-700 (Input background)
          "base-content": "#e5e7eb", // gray-200 (Text)
          "info": "#3b82f6",
          "success": "#22c55e",
          "warning": "#eab308", // yellow-500
          "error": "#ef4444", // red-500
        },
      },
    ],
  },
};
