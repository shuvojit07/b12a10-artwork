// tailwind.config.js (ESM)
import daisyui from 'daisyui';

export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        bg: 'var(--bg)',
        card: 'var(--card)',
        bodytext: 'var(--text)',
      },
    },
  },
  plugins: [daisyui],
  daisyui: { themes: ["light", "dark", "cupcake"], darkTheme: "dark" },
};
