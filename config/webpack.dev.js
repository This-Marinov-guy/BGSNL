/**
 * @file webpack.dev.js
 * @description Development configuration for webpack.
 */

const path = require('path');
const InterpolateHtmlPlugin = require('interpolate-html-plugin');
const { merge } = require('webpack-merge');

// Common configuration files
const common = require('./webpack.common.js');
const paths = require('./paths.js');
const getStyleLoaders = require('./common.js');

// Regex for CSS and SASS
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

/**
 * Merge the common configuration with the development-specific configuration.
 */
module.exports = merge(common, {
  /**
   * Set the mode to 'development'.
   */
  mode: 'development',
  /**
   * Set the output path, filename, and publicPath.
   */
  output: {
    path: path.resolve(__dirname, paths.build),
    filename: '[name].bundle.js',
    publicPath: '/',
  },
  /**
   * Set the module rules for handling CSS and SASS files.
   */
  module: {
    rules: [
      {
        test: cssRegex,
        exclude: cssModuleRegex,
        use: getStyleLoaders(true, { importLoaders: 1, sourceMap: true }),
        sideEffects: true,
      },
      {
        test: cssModuleRegex,
        use: getStyleLoaders(true, {
          importLoaders: 1,
          sourceMap: true,
          modules: true,
        }),
        sideEffects: true,
      },
      {
        test: sassRegex,
        exclude: sassModuleRegex,
        use: getStyleLoaders(true, { importLoaders: 2, sourceMap: true }, true),
        sideEffects: true,
      },
      {
        test: sassModuleRegex,
        use: getStyleLoaders(
          true,
          {
            importLoaders: 2,
            sourceMap: true,
            modules: true,
          },
          true
        ),
        sideEffects: true,
      },
    ],
  },
  /**
   * Set the devtool to 'eval-source-map'.
   */
  devtool: 'eval-source-map',
  /**
   * Set the devServer options.
   */
  devServer: {
    static: {
      directory: path.join(__dirname, paths.build),
    },
    historyApiFallback: true,
    open: true,
    devMiddleware: { writeToDisk: true },
    compress: true,
    hot: true,
    port: 3000,
  },
  /**
   * Set the plugins for the development configuration.
   */
  plugins: [new InterpolateHtmlPlugin({ PUBLIC_URL: 'static' })],
});
