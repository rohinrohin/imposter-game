/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B0E14",
          900: "#141922",
          800: "#1C2330",
          700: "#2A3342",
          600: "#384456",
        },
        snow: "#F2F5F9",
        mist: "#C4CEDA",
        fog: "#9AA7B8",
        mint: {
          DEFAULT: "#34D399",
          600: "#22B583",
          soft: "#0E2A22",
        },
        coral: {
          DEFAULT: "#FB6F6F",
          600: "#E85555",
          soft: "#2A1416",
        },
        amber: {
          DEFAULT: "#F6C560",
          soft: "#2A2413",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ['"Hanken Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        "pop-in": "pop-in 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        "soft-pulse": "soft-pulse 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
