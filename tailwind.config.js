/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    typography: require('./typography'),
    extend: {
      colors: {
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          700: '#374151',
          800: '#1F2A37',
          900: '#111928',
        },
        primary: {
          50: '#E6F6FD',
          100: '#CCECFA',
          200: '#99D9F5',
          300: '#66C5F0',
          400: '#33B2EB',
          500: '#00A0E9', // GS Blue
          600: '#0080BA',
          700: '#00608C',
          800: '#00405D',
          900: '#00202F',
        },
        'gs-blue': '#00A0E9',
        'gs-green': '#A3D112',
        'gs-orange': '#FF700F',
        blue: {
          500: '#00A0E9',
        },
        green: {
          50: '#F5FBED',
          100: '#EBF6DB',
          500: '#A3D112', // GS Green
          800: '#415407',
        },
        yellow: {
          100: '#FDF6B2',
          800: '#723B13',
        },
        purple: {
          50: '#F6F5FF',
        },
        indigo: {
          25: '#F5F8FF',
          100: '#E0EAFF',
          600: '#444CE7',
        },
      },
      screens: {
        mobile: '100px',
        // => @media (min-width: 100px) { ... }
        tablet: '640px', // 391
        // => @media (min-width: 600px) { ... }
        pc: '769px',
        // => @media (min-width: 769px) { ... }
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
