/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          950: '#09090b',
          900: '#121215',
          800: '#18181b',
          700: '#27272a',
          600: '#3f3f46',
          400: '#71717a',
          200: '#e4e4e7',
          100: '#f4f4f5',
          50: '#fafafa',
        },
        champagne: {
          50: '#fdfbf7',
          100: '#f9f4ea',
          300: '#ecd9b5',
          500: '#d4af37',
          600: '#c59b27',
          700: '#99741a',
        },
        gold: {
          DEFAULT: '#d4af37',
          light: '#f5e7a9',
          dark: '#aa820a',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
