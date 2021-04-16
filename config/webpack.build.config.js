const path = require('path');
const { merge } = require('webpack-merge');
const CssExtractPlugin = require('./webpack/plugins/mini-css-extract-plugin');

const css = require('./webpack/rules/css');
const baseWebpackConfig = require('./webpack.base.config');

const plugins = [
  CssExtractPlugin(),
];

const buildWebpackConfig = (env) => {
  const MAIN = !!(env && env.main);

  return merge([
    baseWebpackConfig,
    {
      mode: 'production',
      entry: MAIN
        ? path.resolve(`${baseWebpackConfig.externals.paths.src}/main/main.ts`)
        : path.resolve(`${baseWebpackConfig.externals.paths.src}/renderer/renderer.tsx`),
      output: {
        path: `${baseWebpackConfig.externals.paths.dist}`,
        filename: MAIN ? 'index.js' : 'renderer.js',
      },
      target: MAIN ? 'electron-main' : 'electron-renderer',
      optimization: {
        minimize: true,
      },
      plugins,
    },
    css('production', `${baseWebpackConfig.externals.paths.src}/renderer/styles/resources`),
  ]);
};

module.exports = buildWebpackConfig;
