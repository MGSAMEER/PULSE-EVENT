/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B5CF6',
        background: '#F8FAFC',
        secondary: '#06B6D4', // Cyan accent
        dark: '#0F172A',
        accent: '#A78BFA',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
   function({ addUtilities }) {
     addUtilities({
       '.line-clamp-2': {
         'overflow': 'hidden',
         'display': '-webkit-box',
         '-webkit-box-orient': 'vertical',
         '-webkit-line-clamp': '2',
       },
       '.line-clamp-3': {
         'overflow': 'hidden',
         'display': '-webkit-box',
         '-webkit-box-orient': 'vertical',
         '-webkit-line-clamp': '3',
       },
     });
   },
   function({ addComponents }) {
      addComponents({
        // Button Styles
        '.btn-primary': {
          '@apply bg-primary text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100': {},
        },
        '.btn-secondary': {
          '@apply bg-secondary text-dark px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed': {},
        },
        '.btn-outline': {
          '@apply border-2 border-primary text-primary px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed': {},
        },
        '.btn-ghost': {
          '@apply text-primary px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-primary hover:bg-opacity-10 disabled:opacity-50 disabled:cursor-not-allowed': {},
        },
        // Card Styles
        '.card': {
          '@apply bg-white rounded-xl shadow-lg p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl': {},
        },
        '.card-elevated': {
          '@apply bg-white rounded-2xl shadow-2xl p-8 border border-gray-100': {},
        },
        '.card-subtle': {
          '@apply bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200': {},
        },
        // Input Styles
        '.input-field': {
          '@apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 placeholder-gray-400': {},
        },
        '.input-icon-wrapper': {
          '@apply relative flex items-center': {},
        },
        '.input-icon': {
          '@apply absolute left-3 text-gray-400 pointer-events-none': {},
        },
        '.input-action': {
          '@apply absolute right-3 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors': {},
        },
        // Checkbox & Toggle
        '.checkbox-custom': {
          '@apply w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer': {},
        },
        '.toggle-switch': {
          '@apply relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2': {},
        },
        // Link Styles
        '.link-primary': {
          '@apply text-primary hover:text-opacity-80 transition-colors duration-200 font-medium': {},
        },
        '.link-secondary': {
          '@apply text-gray-600 hover:text-dark transition-colors duration-200': {},
        },
        // Text Styles
        '.text-gradient': {
          '@apply bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent': {},
        },
        // Error States
        '.input-error': {
          '@apply border-red-500 focus:ring-red-500 focus:border-transparent': {},
        },
        '.text-error': {
          '@apply text-red-600 text-sm mt-1 font-medium': {},
        },
        // Loading States
        '.spinner': {
          '@apply animate-spin h-5 w-5 text-primary': {},
        },
      });
    },
  ],
}