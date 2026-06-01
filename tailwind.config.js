/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream:  { DEFAULT: '#FBF8F2', soft: '#F4EFE6', deep: '#EBE3D2' },
        ink:    { DEFAULT: '#2D2620', muted: '#7A7066', faint: '#B8AFA4' },
        orange: { DEFAULT: '#D97757', soft: '#F7E8DC', deep: '#7A3318' },
        clay:   { DEFAULT: '#C49A4A', soft: '#F0E5CC', deep: '#5C4015' },
        sage:   { DEFAULT: '#5F8266', soft: '#DDE7DC', deep: '#2D4632' },
        lilac:  { DEFAULT: '#9B8AB8', soft: '#E5DDED', deep: '#3F2F5C' },
        mist:   { DEFAULT: '#6B95AB', soft: '#DDE8EF', deep: '#3D5A6B' },
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      ringColor: {
        DEFAULT: 'rgba(60, 145, 100, 0.22)',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(45, 38, 32, 0.04), 0 8px 24px -12px rgba(45, 38, 32, 0.08)',
        lift: '0 4px 12px -4px rgba(45, 38, 32, 0.12), 0 16px 40px -16px rgba(45, 38, 32, 0.20)',
        ring: 'inset 0 0 0 1px rgba(45, 38, 32, 0.06)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
