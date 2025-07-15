// tailwind.config.js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // Add paths based on your project
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',  // Replace with your actual values
        foreground: '#111827',
        primary: {
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          100: '#f3f4f6',
          200: '#e5e7eb',
          700: '#374151',
        },
        border: '#e5e7eb', // To support border-border if it's used
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
