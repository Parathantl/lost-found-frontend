/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],      
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          100: '#dbeafe',
          800: '#1e40af'
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          100: '#d1fae5',
          700: '#047857',
          800: '#065f46'
        },
        warning: {
          50: '#fefce8',
          500: '#eab308',
          600: '#ca8a04',
          100: '#fef3c7',
          800: '#92400e'
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
          100: '#fee2e2',
          800: '#991b1b',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          700: '#b91c1c',
          900: '#7f1d1d',
        }
      }
    },
  },
  plugins: [],
}

