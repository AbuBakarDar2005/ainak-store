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
          900: '#18181b',
          800: '#27272a',
          700: '#18181b',
          600: '#27272a',
          500: '#3f3f46',
          400: '#52525b',
          300: '#71717a',
          200: '#e4e4e7',
          100: '#f4f4f5',
          50: '#fafafa',
        },
        champagne: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#71717a',
          400: '#52525b',
          500: '#18181b',
          600: '#09090b',
          700: '#09090b',
        },
        gold: {
          DEFAULT: '#09090b',
          light: '#f4f4f5',
          dark: '#000000',
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
