/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#111111',
        primary: {
          DEFAULT: '#a100ff', // Accenture-like purple
          hover: '#8c00de',
          light: '#eadded',
        },
        secondary: {
          DEFAULT: '#1f2937',
          hover: '#374151',
        },
        sidebar: {
          bg: '#1e293b',
          text: '#f8fafc',
          hover: '#334155',
          active: '#a100ff',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
