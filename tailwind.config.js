/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lens: {
          navy: '#0b2545',
          deep: '#06152b',
          blue: '#134074',
          teal: '#00b4d8',
          cyan: '#0096c7',
          aqua: '#48cae4',
          ice: '#f0fbfd',
          mint: '#00c49f'
        },
        luxury: {
          950: '#06152b',
          900: '#0b2545',
          800: '#133863',
          700: '#1c497d',
          600: '#2b5d95',
          500: '#4b77aa',
          400: '#7da2ce',
          300: '#b3cce8',
          200: '#e1ebf6',
          100: '#f0f5fa',
          50: '#f7faff',
        },
        champagne: {
          50: '#f0fbfd',
          100: '#e0f7fa',
          200: '#b2ebf2',
          300: '#80deea',
          400: '#26c6da',
          500: '#00b4d8',
          600: '#0096c7',
          700: '#0077b6',
          800: '#023e8a',
          900: '#0b2545',
        },
        gold: {
          DEFAULT: '#00b4d8',
          light: '#48cae4',
          dark: '#0077b6',
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
