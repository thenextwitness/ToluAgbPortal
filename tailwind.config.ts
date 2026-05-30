import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ToluAgb brand palette
        gold: {
          DEFAULT: '#C9A84C',
          light:   '#E2C97A',
          dark:    '#9E7F2E',
        },
        cream: {
          DEFAULT: '#FAF6EF',
          2:       '#F2EAD9',
        },
        ink:   '#000000',
        chalk: '#FFFFFF',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:    ['Jost', 'system-ui', 'sans-serif'],
        label:   ['Cinzel', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
