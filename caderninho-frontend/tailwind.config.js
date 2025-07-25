/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Esta linha é crucial para que o Tailwind veja seus componentes React
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}