/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary-black': '#0F0F0F',
        'secondary-brown': '#3B2F2F',
        'accent-gold': '#C9A227',
        'background-cream': '#F8F4EC',
        'text-black': '#1A1A1A',
        black: '#0F0F0F',
        gold: '#C9A227',
      },
    },
  },
  plugins: [],
};
