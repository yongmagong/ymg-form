/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefbf3',
          100: '#d7f4e2',
          500: '#1f9d55',
          600: '#18823f',
          700: '#146a34',
        },
      },
    },
  },
  plugins: [],
};
