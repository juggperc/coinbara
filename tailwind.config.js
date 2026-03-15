/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        capy: {
          brown: '#C08E5C',
          tan: '#DDB892',
          green: '#81C784',
          gold: '#F7B500',
          bg: '#FFFBF5',
          dark: '#3E2723',
        },
      },
      borderRadius: {
        lg: '1rem',
        md: '0.75rem',
        sm: '0.5rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
