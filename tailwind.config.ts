import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        leaf: { 50:'#f0faf1', 100:'#dcf3df', 200:'#b9e7c0', 500:'#16a34a', 600:'#15803d', 700:'#166534', 800:'#14532d', 900:'#0b3d1c' },
        sun: { 400:'#facc15', 500:'#eab308' },
      },
      fontFamily: { sans: ['var(--font-sans)','system-ui','sans-serif'], display: ['var(--font-display)','var(--font-sans)','sans-serif'] },
      screens: { xs: '420px' },
    },
  },
  plugins: [],
};
export default config;
