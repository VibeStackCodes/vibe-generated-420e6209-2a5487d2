import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5200ff',
          600: '#3a00d1'
        },
        accent: {
          DEFAULT: '#ffd600'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Arial', 'Helvetica', 'sans-serif'],
      },
    }
  },
  plugins: [],
};

export default config;
