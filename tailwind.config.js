/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html', 
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: { 
        sans: ['Inter', 'system-ui', 'sans-serif'], 
        mono: ['JetBrains Mono', 'monospace'] 
      },
      colors: {
        ticker: {
          // Precise hex values mirroring trading panels
          up: {
            DEFAULT: '#10b981', // Emerald-500
            surface: 'rgba(16, 185, 129, 0.1)',
            border: 'rgba(16, 185, 129, 0.2)',
          },
          down: {
            DEFAULT: '#ef4444', // Red-500
            surface: 'rgba(239, 68, 68, 0.1)',
            border: 'rgba(239, 68, 68, 0.2)',
          },
          neutral: {
            DEFAULT: '#6b7280', // Gray-500
            surface: 'rgba(107, 114, 128, 0.1)',
          }
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ticker-flash-up': 'tickerFlashUp 0.6s ease-out',
        'ticker-flash-down': 'tickerFlashDown 0.6s ease-out',
      },
      keyframes: {
        // use 3d transforms to force GPU layers for high-frequency price rendering
        fadeUp: { 
          '0%': { opacity: '0', transform: 'translate3d(0, 12px, 0)' }, 
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' } 
        },
        fadeIn: { 
          '0%': { opacity: '0' }, 
          '100%': { opacity: '1' } 
        },
        slideInRight: { 
          '0%': { opacity: '0', transform: 'translate3d(20px, 0, 0)' }, 
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' } 
        },
        scaleIn: { 
          '0%': { opacity: '0', transform: 'scale3d(0.95, 0.95, 1)' }, 
          '100%': { opacity: '1', transform: 'scale3d(1, 1, 1)' } 
        },
        tickerFlashUp: {
          '0%': { backgroundColor: 'rgba(16, 185, 129, 0.25)' },
          '100%': { backgroundColor: 'transparent' }
        },
        tickerFlashDown: {
          '0%': { backgroundColor: 'rgba(239, 68, 68, 0.25)' },
          '100%': { backgroundColor: 'transparent' }
        }
      },
    },
  },
  plugins: [],
};