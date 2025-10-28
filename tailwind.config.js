/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Cyber Amber theme colors
        'cyber-amber': {
          bg: {
            primary: '#0f0f10',
            surface: '#1a1b1e',
          },
          primary: '#F0A500',
          secondary: '#FFD369',
          accent: '#00ADB5',
          text: '#EEEEEE',
          'text-muted': '#A0A0A0',
        },
        // Zen Paper theme colors
        'zen-paper': {
          bg: {
            primary: '#F9FAFB',
            surface: '#FFFFFF',
          },
          primary: '#2563EB',
          secondary: '#1E40AF',
          accent: '#38BDF8',
          text: '#111827',
          'text-muted': '#6B7280',
        },
        // CSS custom properties for dynamic theming
        'bg-primary': 'var(--bg-primary)',
        'bg-surface': 'var(--bg-surface)',
        'color-primary': 'var(--color-primary)',
        'color-secondary': 'var(--color-secondary)',
        'color-accent': 'var(--color-accent)',
        'color-text': 'var(--color-text)',
        'color-text-muted': 'var(--color-text-muted)',
      },
      fontFamily: {
        'sans': ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'h1': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'small': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      spacing: {
        '18': '4.5rem',
        '70': '17.5rem', // 280px for metadata panel
        '88': '22rem',
        '112': '28rem',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
      },
      borderRadius: {
        'xl': '12px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.1)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': 'var(--color-text-muted) var(--bg-primary)',
        },
        '.scrollbar-thin::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '.scrollbar-thin::-webkit-scrollbar-track': {
          background: 'var(--bg-primary)',
          'border-radius': '4px',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb': {
          background: 'var(--color-text-muted)',
          'border-radius': '4px',
          opacity: '0.3',
          transition: 'opacity var(--theme-transition-duration, 200ms) ease, background var(--theme-transition-duration, 200ms) ease',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb:hover': {
          opacity: '0.6',
          background: 'var(--color-primary)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}