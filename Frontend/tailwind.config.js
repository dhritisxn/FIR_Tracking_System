/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        'hindi': ['Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      },
      colors: {
        'indian': {
          'saffron': '#FF9933',
          'white': '#FFFFFF',
          'green': '#138808',
          'navy': '#000080',
          'ashoka': '#6666FF',
        }
      },
      animation: {
        'flag-wave': 'flag-wave 2s ease-in-out infinite',
        'pulse-indian': 'pulse-indian 2s ease-in-out infinite',
      },
      backgroundImage: {
        'indian-flag': 'linear-gradient(to bottom, #FF9933 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #138808 66.66%)',
        'indian-gradient': 'linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)',
      }
    },
  },
  plugins: [],
};