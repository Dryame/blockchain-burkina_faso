/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burkina: {
          green: "#009A00",
          red: "#EF2B2D",
          yellow: "#FCD116",
        },
        brand: {
          primary: "var(--brand-primary)",
          secondary: "var(--brand-secondary)",
          accent: "var(--brand-accent)",
        },
        ui: {
          bg: "var(--bg-main)",
          card: "var(--bg-card)",
          surface: "var(--bg-surface)",
          border: "var(--border-main)",
          text: "var(--text-main)",
          muted: "var(--text-muted)",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 4s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}
