/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        electric: {
          500: '#1E6BFF',
          600: '#1352D1'
        },
        sport: {
          500: '#FF6A00',
          600: '#E25800'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 12px 45px -18px rgba(30, 107, 255, 0.7)'
      }
    }
  },
  plugins: []
};
