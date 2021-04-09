const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const css = require('./webpack/rules/css');
const baseWebpackConfig = require('./webpack.base.config');

const plugins = [
  new webpack.HotModuleReplacementPlugin(),
];

const devWebpackConfig = merge([
  baseWebpackConfig,
  {
    mode: 'development',
    entry: path.resolve(`${baseWebpackConfig.externals.paths.src}/main.ts`),
    output: {
      path: `${baseWebpackConfig.externals.paths.dist}`,
      filename: 'index.js',
      publicPath: 'http://localhost:8080/build/',
    },
    target: 'electron-main',
    devtool: 'eval',
    devServer: {
      publicPath: 'http://localhost:8080/build/',
      port: '8080',
      host: '0.0.0.0',
      historyApiFallback: true,
      hot: true,
      inline: true,
      progress: false,
      index: 'index.html',
    },
    watchOptions: {
      ignored: /node_modules/,
    },
    plugins,
  },
  css('development', `${baseWebpackConfig.externals.paths.src}/styles/resources`),
]);

module.exports = devWebpackConfig;
