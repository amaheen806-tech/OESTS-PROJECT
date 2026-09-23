/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Navy blue palette (key name "nude" kept for existing classNames)
        nude: {
          50: "#F4F6FA",
          100: "#E4E9F2",
          200: "#C7D2E3",
          300: "#A3B4CE",
          400: "#7891B5",
          500: "#4E6C99",
          600: "#3B567F",
          700: "#2C4166",
          800: "#1E2E4D",
          900: "#131D33",
        },
        gold: {
          400: "#D9BE82",
          500: "#C9A227",
          600: "#A8841E",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(19, 29, 51, 0.06), 0 4px 12px rgba(19, 29, 51, 0.04)",
        soft: "0 8px 24px rgba(19, 29, 51, 0.08)",
      },
      borderRadius: {
        card: "0.75rem",
      },
      keyframes: {
        "slide-in-right": {
          "0%": { transform: "translateX(calc(100% + 1.5rem))", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-out-right": {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(calc(100% + 1.5rem))", opacity: "0" },
        },
        "notification-progress": {
          "0%": { transform: "scaleX(1)" },
          "100%": { transform: "scaleX(0)" },
        },
        "modal-in": {
          "0%": { transform: "scale(0.96) translateY(8px)", opacity: "0" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "hero-zoom": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.08)" },
        },
        "soft-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        "auth-slide-left": {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "slide-in-right": "slide-in-right 0.35s ease-out forwards",
        "slide-out-right": "slide-out-right 0.28s ease-in forwards",
        "modal-in": "modal-in 0.25s ease-out forwards",
        "fade-in": "fade-in 0.2s ease-out forwards",
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "hero-zoom": "hero-zoom 22s ease-out forwards",
        "soft-float": "soft-float 4.5s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2.8s ease-in-out infinite",
        "auth-slide-left": "auth-slide-left 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "shimmer": "shimmer 3s infinite linear",
      },
    },
  },
  plugins: [],
}
