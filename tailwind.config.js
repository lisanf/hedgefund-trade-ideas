/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['var(--font-syne)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      colors: {
        canvas:    '#FAFAF8',
        raised:    '#FFFFFF',
        ink:       '#0C0C0A',
        secondary: '#555550',
        tertiary:  '#999994',
        rule:      '#E8E8E4',
        lime:      '#C8F53C',
        'lime-dark': '#8CB020',
        profit:    '#22C55E',
        loss:      '#EF4444',
        'br-green':'#009C3B',
        'br-blue': '#002776',
      },
    },
  },
  plugins: [],
}
