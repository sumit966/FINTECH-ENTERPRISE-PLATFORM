/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef4ff',
          100: '#dbe6ff',
          200: '#bdd0ff',
          300: '#90b0ff',
          400: '#5a84ff',
          500: '#3358ff',
          600: '#1e3bf0',
          700: '#172dd4',
          800: '#1829ab',
          900: '#1a2a87',
        },
        aurora: {
          indigo: '#6366f1',
          violet: '#8b5cf6',
          teal:   '#14b8a6',
          rose:   '#f43f5e',
        },
        accent: {
          violet: '#8b5cf6',
          teal:   '#14b8a6',
          amber:  '#f59e0b',
          rose:   '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #3358ff 0%, #8b5cf6 100%)',
        'gradient-mesh':    'radial-gradient(at 20% 0%, rgba(51,88,255,0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(139,92,246,0.12) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(20,184,166,0.10) 0px, transparent 50%)',
        'gradient-glass':   'linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))',
        'gradient-aurora':  'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(139,92,246,0.30), rgba(20,184,166,0.25))',
      },
      boxShadow: {
        'soft':    '0 1px 2px 0 rgba(15,23,42,0.04), 0 1px 3px 0 rgba(15,23,42,0.06)',
        'elev':    '0 4px 12px -2px rgba(15,23,42,0.08), 0 2px 6px -2px rgba(15,23,42,0.06)',
        'premium': '0 12px 32px -8px rgba(15,23,42,0.16), 0 4px 12px -4px rgba(15,23,42,0.08)',
        'glass':   '0 8px 32px -8px rgba(15,23,42,0.20), 0 2px 8px -4px rgba(15,23,42,0.08), inset 0 1px 0 0 rgba(255,255,255,0.06)',
        'glow':    '0 0 0 1px rgba(51,88,255,0.20), 0 8px 32px -8px rgba(51,88,255,0.35)',
        'glow-soft':'0 0 0 1px rgba(139,92,246,0.15), 0 12px 40px -12px rgba(139,92,246,0.30)',
      },
      keyframes: {
        'fade-in':      { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-up':     { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'pulse-subtle': { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        'aurora-drift-1': {
          '0%,100%': { transform: 'translate3d(-10%, -5%, 0) scale(1)' },
          '50%':     { transform: 'translate3d(15%, 10%, 0) scale(1.15)' },
        },
        'aurora-drift-2': {
          '0%,100%': { transform: 'translate3d(20%, 15%, 0) scale(1.1)' },
          '50%':     { transform: 'translate3d(-15%, -10%, 0) scale(0.95)' },
        },
        'aurora-drift-3': {
          '0%,100%': { transform: 'translate3d(0%, 0%, 0) scale(1)' },
          '33%':     { transform: 'translate3d(25%, -15%, 0) scale(1.2)' },
          '66%':     { transform: 'translate3d(-20%, 20%, 0) scale(0.9)' },
        },
      },
      animation: {
        'fade-in':       'fade-in 200ms ease-out',
        'slide-up':      'slide-up 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle':  'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'aurora-drift-1':'aurora-drift-1 120s ease-in-out infinite',
        'aurora-drift-2':'aurora-drift-2 140s ease-in-out infinite',
        'aurora-drift-3':'aurora-drift-3 160s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
