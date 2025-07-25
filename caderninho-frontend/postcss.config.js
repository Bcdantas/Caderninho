// postcss.config.js
import tailwindcss from '@tailwindcss/postcss'; // Importa o plugin oficial do Tailwind para PostCSS
import autoprefixer from 'autoprefixer'; // Importa o Autoprefixer

export default {
  plugins: [
    tailwindcss(), // Chama o plugin corretamente
    autoprefixer(),
  ],
};