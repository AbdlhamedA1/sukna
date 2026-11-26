/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // SUKNA brand tokens — docs/UI_UX_GUIDELINES.md §2
        brand: {
          primary: '#123B35',
          'primary-hover': '#1B4E47',
          'primary-soft': '#E8EFE9',
          accent: '#E88A35',
          'accent-hover': '#D47827',
          'accent-soft': '#FDF4EC',
          canvas: '#F7F5F0',
          surface: '#FFFFFF',
          charcoal: '#252B28',
          muted: '#5A6460',
          light: '#8C9691',
          border: '#E5E2DA',
        },
        success: '#226E43',
        'success-soft': '#EBF5EE',
        warning: '#C77700',
        'warning-soft': '#FEF8EC',
        danger: '#B92525',
        'danger-soft': '#FDF0F0',
        info: '#205A87',
        'info-soft': '#EDF5FB',
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        // Reserved for future Arabic RTL localization (Item: Cairo).
        arabic: ['Cairo', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        container: '1600px',
      },
    },
  },
  plugins: [],
};
