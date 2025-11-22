// postcss.config.js (ESM)
import tailwindPostcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    tailwindPostcss(), // adapter for Tailwind + PostCSS
    autoprefixer(),
  ],
};
