/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Фирменный акцент Альфа
        alfa: {
          red: '#EF3124',
          'red-600': '#D9271B',
          'red-700': '#B81F14',
          'red-50': '#FDECEA',
          'red-100': '#FBD9D5',
          ink: '#12121A',
          graphite: '#2B2C33',
        },
        // Поверхности и фон
        bg: '#F4F5F7',
        surface: '#FFFFFF',
        line: '#E7E9EE',
        muted: '#8A8F98',
        // Светофор рисков
        risk: {
          low: '#12A150',
          medium: '#F5A524',
          high: '#EF3124',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)',
        'card-hover': '0 10px 30px rgba(16,24,40,0.10)',
        pop: '0 16px 40px rgba(16,24,40,0.14)',
        focus: '0 0 0 3px rgba(239,49,36,0.18)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        'fade-up': 'fade-up 0.3s ease-out both',
      },
    },
  },
  plugins: [],
};
