/**
 * @file webpack.prod.js
 * @description Production configuration for webpack.
 */


const path = require('path');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

// Common configuration files
const common = require('./webpack.common.js');
const getStyleLoaders = require('./common.js');
const paths = require('./paths');

// Regex for CSS and SASS
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

/**
 * Merge the common configuration with the production-specific configuration.
 */
module.exports = merge(common, {
  /**
   * Set the mode to 'production'.
   */
  mode: 'production',
  /**
   * Disable source maps for production build.
   */
  devtool: false,
  /**
   * Set the output path, public path, and filename for the production build.
   */
  output: {
    path: path.resolve(__dirname, paths.build),
    publicPath: '/',
    filename: 'js/[name].[contenthash].bundle.js',
  },
  /**
   * Configure the plugins for the production build.
   */
  plugins: [
    new CompressionPlugin(),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash].css',
    }),
    new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false }),
  ],
  /**
   * Configure the module rules for the production build.
   */
  module: {
    rules: [
      {
        test: cssRegex,
        exclude: cssModuleRegex,
        use: getStyleLoaders(false, { importLoaders: 1, sourceMap: false }),
        sideEffects: true,
      },
      {
        test: cssModuleRegex,
        use: getStyleLoaders(false, {
          importLoaders: 1,
          sourceMap: false,
          modules: true,
        }),
        sideEffects: true,
      },
      {
        test: sassRegex,
        exclude: sassModuleRegex,
        use: getStyleLoaders(
          false,
          { importLoaders: 2, sourceMap: false },
          true
        ),
        sideEffects: true,
      },
      {
        test: sassModuleRegex,
        use: getStyleLoaders(
          false,
          {
            importLoaders: 2,
            sourceMap: false,
            modules: true,
          },
          true
        ),
        sideEffects: true,
      },
    ],
  },
  /**
   * Configure the optimization settings for the production build.
   */
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: {
      name: 'runtime',
    },
  },
});
