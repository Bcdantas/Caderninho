import tailwindcss from '@tailwindcss/postcss'; // Importa o plugin do Tailwind para PostCSS
import autoprefixer from 'autoprefixer'; // Importa o Autoprefixer

export default {
  plugins: [
    tailwindcss(), // Usa o plugin do Tailwind
    autoprefixer(), // Usa o plugin do Autoprefixer
  ],
};