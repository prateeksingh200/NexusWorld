module.exports = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // IMPORTANT: Keep the viewBox so icons can scale via CSS
          removeViewBox: false,
        },
      },
    },
    // Removes the 'fill' attribute so we can control color with CSS
    'removeDimensions',
    {
        name: 'removeAttrs',
        params: {
            attrs: '(fill|stroke)'
        }
    }
  ],
};