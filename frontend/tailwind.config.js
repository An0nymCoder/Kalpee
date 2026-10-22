/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kalpee: {
          bg: '#F7F1E8',
          surface: '#FFFDF9',
          primary: '#6B4226',
          dark: '#3E2723',
          logo: '#2A1B12',
          secondary: '#8B6245',
          beige: '#E8D8C3',
          'beige-light': '#F1E6D6',
          text: '#332821',
          muted: '#806F62',
          success: '#718355',
          warning: '#C58B45',
          danger: '#A65D57',
        },
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(107, 66, 38, 0.06)',
        card: '0 2px 12px -1px rgba(51, 40, 33, 0.04)',
      },
    },
  },
  plugins: [],
}
