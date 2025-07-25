ECHO est� ativado.
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Diga ao Tailwind para escanear todos os arquivos JS, TS, JSX e TSX dentro da pasta src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}