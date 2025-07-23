/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0', visibility: 'hidden' },
        },
      },
      animation: {
        'fade-out': 'fade-out 2.5s forwards',
        'fade-out-slow': 'fade-out 0.5s forwards',
      },
    }
  },
  plugins: []
}; 