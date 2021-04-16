const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const css = require('./webpack/rules/css');
const baseWebpackConfig = require('./webpack.base.config');

const devWebpackConfig = (env) => {
  const MAIN = !!(env && env.main);

  return merge([
    baseWebpackConfig,
    {
      mode: 'development',
      entry: MAIN
        ? path.resolve(`${baseWebpackConfig.externals.paths.src}/main/main.ts`)
        : path.resolve(`${baseWebpackConfig.externals.paths.src}/renderer/renderer.tsx`),
      output: {
        path: `${baseWebpackConfig.externals.paths.dist}`,
        filename: MAIN ? 'index.js' : 'renderer.js',
        publicPath: 'http://localhost:8085/build/',
      },
      target: MAIN ? 'electron12.0-main' : 'web',
      devtool: 'cheap-module-source-map',
      optimization: {},
      devServer: (!MAIN) ? {
        publicPath: 'http://localhost:8085/build/',
        port: '8085',
        host: '0.0.0.0',
        historyApiFallback: true,
        hot: true,
        inline: true,
        progress: false,
        index: 'index.html',
      } : {},
      watchOptions: {
        ignored: /node_modules/,
      },
      plugins: [
        ...(!MAIN ? [
          new webpack.HotModuleReplacementPlugin(),
        ] : []),
      ],
    },
    css('development', `${baseWebpackConfig.externals.paths.src}/renderer/styles/resources`),
  ]);
};

module.exports = devWebpackConfig;
