/**
 * Plugin to extract CSS into separate files.
 * @type {import('mini-css-extract-plugin')}
 */
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

/**
 * Returns an array of loaders for CSS processing.
 * @param {boolean} isDevelopment - Indicates if the environment is development.
 * @param {object} cssOptions - Options for the css-loader.
 * @param {boolean} isSaaS - Indicates if the project is using SaaS (Sass as a Service).
 * @returns {Array} - Array of loaders for CSS processing.
 */
module.exports = (isDevelopment, cssOptions, isSaaS) => {
  return [
    // If the environment is development, use the style-loader, otherwise use MiniCssExtractPlugin.loader
    isDevelopment
      ? require.resolve('style-loader')
      : MiniCssExtractPlugin.loader,
    {
      // Use the css-loader to process CSS files
      loader: require.resolve('css-loader'),
      options: cssOptions,
    },
    {
      // Use the postcss-loader to process CSS files with PostCSS
      loader: require.resolve('postcss-loader'),
      options: {
        postcssOptions: {
          ident: 'postcss',
          plugins: () => [require('autoprefixer')()],
        },
        sourceMap: true,
      },
    },
    // If the project is using SaaS, use the sass-loader to process SaaS files
    isSaaS && {
      loader: require.resolve('sass-loader'),
      options: {
        sourceMap: true,
      },
    },
  ];
};
