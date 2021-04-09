const path = require('path');
const { merge } = require('webpack-merge');
const CssExtractPlugin = require('./webpack/plugins/mini-css-extract-plugin');

const css = require('./webpack/rules/css');
const baseWebpackConfig = require('./webpack.base.config');

const plugins = [
  CssExtractPlugin(),
];

const buildWebpackConfig = merge([
  baseWebpackConfig,
  {
    mode: 'production',
    entry: path.resolve(`${baseWebpackConfig.externals.paths.src}/main.ts`),
    output: {
      path: `${baseWebpackConfig.externals.paths.dist}`,
      filename:'index.js',
    },
    target: 'electron-main',
    optimization: {
      minimize: true,
    },
    plugins,
  },
  css('production', `${baseWebpackConfig.externals.paths.src}/styles/resources`),
]);

module.exports = buildWebpackConfig;
