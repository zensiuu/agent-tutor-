/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0D9373',
        'primary-light': '#10b981',
        'primary-dark': '#059669',
        secondary: '#8b5cf6',
        dark: '#0f172a',
        darker: '#020617',
      },
      accent: {
        DEFAULT: '#0D9373',
        light: '#10b981',
        dark: '#059669',
      },
    },
  },
  plugins: [],
}
