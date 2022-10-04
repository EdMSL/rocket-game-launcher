const path = require('path');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');

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
        : {
            [baseWebpackConfig.externals.processes.app]: path.resolve(`${baseWebpackConfig.externals.paths.src}/renderer/${baseWebpackConfig.externals.processes.app}.tsx`), //eslint-disable-line max-len
            [baseWebpackConfig.externals.processes.developer]: path.resolve(`${baseWebpackConfig.externals.paths.src}/renderer/${baseWebpackConfig.externals.processes.developer}.tsx`), //eslint-disable-line max-len
          },
      output: {
        path: `${baseWebpackConfig.externals.paths.dist}`,
        filename: MAIN ? 'index.js' : '[name].js',
      },
      target: MAIN ? 'electron-main' : 'electron-renderer',
      optimization: {
        minimize: true,
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              compress: {
                keep_fnames: true,
                keep_infinity: true,
              },
              mangle: {
                keep_fnames: true,
              },
            },
          }),
        ],
        nodeEnv: (env && env.nodeEnv) || 'production',
      },
      plugins,
    },
    css('production', `${baseWebpackConfig.externals.paths.src}/renderer/styles/resources`),
  ]);
};

module.exports = buildWebpackConfig;
