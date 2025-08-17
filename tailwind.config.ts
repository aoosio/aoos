import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#12B886',
          50: '#E7F8F1',
          100: '#D1F1E5',
          200: '#A4E3CB',
          300: '#76D5B0',
          400: '#49C896',
          500: '#12B886',
          600: '#0E996F',
          700: '#0B7A59',
          800: '#085C43',
          900: '#053D2C',
        },
        ink: '#111111',
        paper: '#FFFFFF',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,.04), 0 6px 24px rgba(0,0,0,.06)',
      },
    },
  },
  plugins: [],
}
export default config
