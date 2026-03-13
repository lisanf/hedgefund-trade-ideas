/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body: ['var(--font-ibm-plex)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'monospace'],
      },
      colors: {
        paper: '#FAF9F6',
        ink: '#141412',
        muted: '#6B6B67',
        border: '#E2E1DC',
        brazil: {
          green: '#009C3B',
          yellow: '#FEDF00',
          blue: '#002776',
        },
        profit: '#16A34A',
        loss: '#DC2626',
        accent: '#009C3B',
      },
    },
  },
  plugins: [],
}
