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
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        // Reserved for future Arabic RTL localization.
        arabic: ['var(--font-cairo)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        container: '1600px',
      },
    },
  },
  plugins: [],
};

export default config;
