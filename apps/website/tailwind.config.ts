import type { Config } from 'tailwindcss';

/**
 * SUKNA brand tokens — docs/UI_UX_GUIDELINES.md §2.
 * English LTR is primary; Arabic RTL (Cairo) is reserved via the
 * `font-arabic` utility and logical CSS properties throughout.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0B2540',
          'primary-hover': '#143560',
          'primary-soft': '#E6EEF3',
          teal: '#3C8F86',
          'teal-soft': '#E4F2F0',
          accent: '#E88A35',
          'accent-hover': '#D47827',
          'accent-soft': '#FDF4EC',
          canvas: '#F6F8FA',
          surface: '#FFFFFF',
          charcoal: '#252B28',
          muted: '#5A6460',
          light: '#8C9691',
          border: '#E3E8EE',
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
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        // Reserved for future Arabic RTL localization.
        arabic: ['var(--font-cairo)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      animation: { floaty: 'floaty 6s ease-in-out infinite' },
      maxWidth: {
        container: '1600px',
      },
    },
  },
  plugins: [],
};

export default config;
