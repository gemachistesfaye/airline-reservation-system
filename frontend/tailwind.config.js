/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        neutral: {
          950: '#0a0a0a',
          900: '#111111',
          800: '#1a1a1a',
          700: '#262626',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a',
        },
        red: {
          500: '#ef4444',
        },
        blue: {
          500: '#3b82f6',
        },
      },
      borderRadius: {
        DEFAULT: '0.5rem', // rounded-lg
        lg: '0.75rem',
        xl: '1rem',
      },
    },
  },
  plugins: [],
}