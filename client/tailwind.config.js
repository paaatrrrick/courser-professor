/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'bucks': 'url("/static/images/bucks.png")',
      },
      backgroundColor: {
        bucksBlue: '#206ca4',
      },
      textColor: {
        bucksBlue: '#206ca4',
      },
      // add a custom border color
      borderColor: {
        bucksBlue: '#206ca4',
      },
    },
  },
  plugins: [],
}
