module.exports = {
  plugins: {
    // Tailwind CSS processing
    tailwindcss: {
      // Force Tailwind to process all directives properly
      content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
    },
    // Autoprefixer for better browser compatibility
    autoprefixer: {
      // Enable flexbox support
      flexbox: 'no-2009',
      // Add vendor prefixes for better compatibility
      grid: 'autoplace',
    },
  },
};
