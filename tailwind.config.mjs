/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1c1410',
        tea: {
          50: '#f4ecd8',
          100: '#e8dcc4',
          200: '#d6c098',
          300: '#c9a87a',
          400: '#a87b4a',
          500: '#7a4a2a',
          600: '#5e3820',
          700: '#3b2418',
          800: '#2a1812',
          900: '#1c1410',
        },
        cream: '#f4ecd8',
        paper: '#ede2cb',
        moss: '#5a6b3e',
        amber: '#c9a87a',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"Lora"', 'Georgia', 'serif'],
        hand: ['"Caveat"', 'cursive'],
        bn: ['"Hind Siliguri"', '"Noto Serif Bengali"', 'serif'],
      },
      fontSize: {
        'display-2xl': ['clamp(3rem, 8vw, 6.5rem)', { lineHeight: '1.05', letterSpacing: '-0.015em' }],
        'display-xl': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.08', letterSpacing: '-0.01em' }],
        'display-lg': ['clamp(2rem, 4.5vw, 3rem)', { lineHeight: '1.1' }],
        'display-md': ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.2' }],
      },
      spacing: {
        gutter: 'clamp(1.5rem, 4vw, 4rem)',
        section: 'clamp(4rem, 9vw, 8rem)',
      },
      maxWidth: {
        prose: '38rem',
        column: '54rem',
        editorial: '72rem',
      },
      boxShadow: {
        polaroid: '0 8px 22px -10px rgba(28, 20, 16, 0.45), 0 2px 6px -2px rgba(28, 20, 16, 0.25)',
        soft: '0 6px 24px -12px rgba(28, 20, 16, 0.35)',
      },
      backgroundImage: {
        paper: "url('/paper-texture.svg')",
      },
      transitionTimingFunction: {
        ink: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
