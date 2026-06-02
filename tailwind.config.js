/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Token màu = CSS variable → đổi theme bằng class `dark` trên <html>, không sửa từng class.
      // Dạng rgb(var(--x) / <alpha-value>) để giữ opacity modifier (bg-cream/40, ring-orange-deep/20...).
      colors: {
        cream:  { DEFAULT: 'rgb(var(--cream) / <alpha-value>)',  soft: 'rgb(var(--cream-soft) / <alpha-value>)',  deep: 'rgb(var(--cream-deep) / <alpha-value>)' },
        ink:    { DEFAULT: 'rgb(var(--ink) / <alpha-value>)',    muted: 'rgb(var(--ink-muted) / <alpha-value>)',  faint: 'rgb(var(--ink-faint) / <alpha-value>)' },
        orange: { DEFAULT: 'rgb(var(--orange) / <alpha-value>)', soft: 'rgb(var(--orange-soft) / <alpha-value>)', deep: 'rgb(var(--orange-deep) / <alpha-value>)' },
        clay:   { DEFAULT: 'rgb(var(--clay) / <alpha-value>)',   soft: 'rgb(var(--clay-soft) / <alpha-value>)',   deep: 'rgb(var(--clay-deep) / <alpha-value>)' },
        sage:   { DEFAULT: 'rgb(var(--sage) / <alpha-value>)',   soft: 'rgb(var(--sage-soft) / <alpha-value>)',   deep: 'rgb(var(--sage-deep) / <alpha-value>)' },
        lilac:  { DEFAULT: 'rgb(var(--lilac) / <alpha-value>)',  soft: 'rgb(var(--lilac-soft) / <alpha-value>)',  deep: 'rgb(var(--lilac-deep) / <alpha-value>)' },
        mist:   { DEFAULT: 'rgb(var(--mist) / <alpha-value>)',   soft: 'rgb(var(--mist-soft) / <alpha-value>)',   deep: 'rgb(var(--mist-deep) / <alpha-value>)' },
        surface:{ DEFAULT: 'rgb(var(--surface) / <alpha-value>)', soft: 'rgb(var(--surface-soft) / <alpha-value>)' },
        onaccent: 'rgb(var(--on-accent) / <alpha-value>)',
        ringcal:{ from: 'rgb(var(--ring-cal-from) / <alpha-value>)', to: 'rgb(var(--ring-cal-to) / <alpha-value>)',
                  track: 'rgb(var(--ring-track) / <alpha-value>)',
                  'over-from': 'rgb(var(--ring-over-from) / <alpha-value>)', 'over-to': 'rgb(var(--ring-over-to) / <alpha-value>)' },
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      ringColor: {
        DEFAULT: 'var(--ring)',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--shadow) / 0.04), 0 8px 24px -12px rgb(var(--shadow) / 0.08)',
        lift: '0 4px 12px -4px rgb(var(--shadow) / 0.12), 0 16px 40px -16px rgb(var(--shadow) / 0.20)',
        ring: 'inset 0 0 0 1px rgb(var(--shadow) / 0.06)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
