/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primaryNavy: '#1e293b',
        successGreen: '#10b981',
        warningAmber: '#f59e0b',
        errorRed: '#ef4444',
        neutralWhite: '#ffffff',
        neutralSlate: '#f8fafc',
        accentBlue: '#3b82f6',
        navy: {
          950: '#0a0f1d',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
        },
        gov: {
          green: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
          blue: '#3b82f6',
          slate: '#f8fafc',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'gov': '0 4px 14px 0 rgba(15, 23, 42, 0.08)',
        'gov-lg': '0 10px 25px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.05)',
      }
    },
  },
  plugins: [],
}
