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
          brown: '#8B5E3C', // Deeper, more professional brown
          tan: '#F5E6D3',   // Cleaner, warmer tan
          green: '#2D6A4F', // Forest green for high contrast
          gold: '#D4A373',  // Muted metallic gold
          bg: '#FFFFFF',    // Pure white background
          dark: '#1A1A1A',  // Near black for sharp text
          accent: '#E9EDC9', // Soft moss accent
        },
      },
      borderRadius: {
        '3xl': '1.25rem', // Reduced from 2rem+
        '2xl': '1rem',
        'xl': '0.75rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
