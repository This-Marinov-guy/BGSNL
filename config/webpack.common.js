/**
 * @file webpack.common.js
 * @description Common configuration for webpack.
 */

const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const webpack = require("webpack");

// Common configuration files
const paths = require("./paths");

module.exports = {
  /**
   * Entry point(s) for the application.
   */
  entry: [paths.src + "/index.js"],

  /**
   * Plugins used by Webpack.
   */
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
    /**
     * Plugins for env
     */
    new Dotenv({
      systemvars: true,
    }),
    /**
     * Plugin to clean the output directory before each build.
     *
     * @type {CleanWebpackPlugin}
     */
    new CleanWebpackPlugin(),

    /**
     * Plugin to copy files and directories during the build process.
     *
     * @type {CopyPlugin}
     */
    new CopyPlugin({
      patterns: [
        {
          from: paths.public + "/assets",
          to: "assets",
        },
        // {
        //   from: paths.public + '/assets/js/main.js',
        //   to: paths.build + '/static/assets/js/main.js',
        // },
        {
          from: paths.public + "/manifest.json",
          to: paths.build + "/static/manifest.json",
        },
        {
          from: paths.public + "/favicon.ico",
          to: paths.build + "/static/favicon.ico",
        },
      ],
    }),

    /**
     * Plugin to generate HTML files with injected bundles.
     *
     * @type {HtmlWebpackPlugin}
     */
    new HtmlWebpackPlugin({
      favicon: path.resolve(__dirname, "../public/favicon.ico"),
      template: path.resolve(__dirname, "../public/index.html"),
      manifest: path.resolve(__dirname, "../public/manifest.json"),
      filename: "index.html",
    }),
  ],

  /**
   * Resolve options for resolving module requests.
   */
  resolve: {
    /**
     * File extensions to be resolved automatically.
     */
    extensions: [".js", ".jsx"],

    /**
     * Fallback options for resolving modules.
     */
    fallback: {
      fs: false,
      process: require.resolve("process/browser"),
      assert: require.resolve("assert"),
      buffer: require.resolve("buffer"),
      constants: require.resolve("constants-browserify"),
      crypto: require.resolve("crypto-browserify"),
      domain: false,
      events: require.resolve("events"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      os: require.resolve("os-browserify/browser"),
      path: require.resolve("path-browserify"),
      punycode: require.resolve("punycode"),
      stream: require.resolve("stream-browserify"),
      string_decoder: require.resolve("string_decoder"),
      sys: false,
      url: require.resolve("url"),
      util: require.resolve("util"),
      vm: false,
    },

    /**
     * Aliases for module resolution.
     */
    alias: {
      "@assets": path.resolve(__dirname, "../public/assets/"),
      "process/browser": require.resolve("process/browser.js"), // ← THIS LINE ADDED
    },
  },

  /**
   * Module options for transforming files.
   */
  module: {
    /**
     * Rules for transforming specific file types.
     */
    rules: [
      {
        /**
         * Rule for transforming JavaScript files.
         */
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        /**
         * Rule for transforming HTML files.
         */
        test: /\.html$/,
        use: ["html-loader"],
      },
      {
        /**
         * Rule for handling font files.
         */
        test: /\.(woff(2)|ttf|eot)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        type: "asset/resource",
      },
      // {
      //   /**
      //    * Rule for handling image files.
      //    */
      //   test: /\.(svg|png|jpg|jpeg|gif|ico|webp)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      //   use: [
      //     {
      //       loader: 'file-loader',
      //       options: {
      //         name: '[name].[ext]',
      //         outputPath: 'assets/images',
      //       },
      //     },
      //   ],
      // },
    ],
  },
};
