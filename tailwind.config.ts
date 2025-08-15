import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef9ff',
          100: '#d8f1ff',
          200: '#b5e6ff',
          300: '#83d7ff',
          400: '#45c0ff',
          500: '#1aa6f5',
          600: '#0a83d6',
          700: '#0a67a8',
          800: '#0e5689',
          900: '#103f61'
        }
      },
      boxShadow: {
        soft: '0 6px 24px rgba(16, 63, 97, 0.08)'
      }
    }
  },
  plugins: []
}
export default config