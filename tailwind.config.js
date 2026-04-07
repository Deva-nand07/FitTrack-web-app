/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        barlow: ['Barlow', 'sans-serif'],
        condensed: ['Barlow Condensed', 'sans-serif'],
      },
      colors: {
        cyan: { DEFAULT: '#0ea5e9', dark: '#0284c7', light: '#38bdf8' },
        teal: { DEFAULT: '#14b8a6' },
        dark: { DEFAULT: '#0a0e1a', card: '#111827', surface: '#1a2035' },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
        'gradient-dark': 'linear-gradient(180deg, #0a0e1a 0%, #0f172a 100%)',
      },
      animation: {
        'fade-in': 'fadeSlideIn 0.3s ease forwards',
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
      },
    },
  },
  plugins: [],
}
