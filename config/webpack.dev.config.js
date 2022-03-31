const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

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
        : {
            [baseWebpackConfig.externals.processes.app]: path.resolve(`${baseWebpackConfig.externals.paths.src}/renderer/${baseWebpackConfig.externals.processes.app}.tsx`),
            [baseWebpackConfig.externals.processes.developer]: path.resolve(`${baseWebpackConfig.externals.paths.src}/renderer/${baseWebpackConfig.externals.processes.developer}.tsx`),
          },
      output: {
        path: baseWebpackConfig.externals.paths.build,
        filename: MAIN ? 'index.js' : '[name].js',
        publicPath: baseWebpackConfig.externals.devServerUrl,
      },
      target: MAIN ? 'electron17.0-main' : 'electron-renderer',
      devtool: 'cheap-module-source-map',
      optimization: {},
      devServer: !MAIN ? {
        publicPath: baseWebpackConfig.externals.devServerUrl,
        port: '8081',
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
        ...!MAIN ? [
          new webpack.HotModuleReplacementPlugin(),
          process.env.FAST_REFRESH && new ReactRefreshWebpackPlugin(),
        ] : [],
      ].filter(Boolean),
    },
    css('development', `${baseWebpackConfig.externals.paths.src}/renderer/styles/resources`),
  ]);
};

module.exports = devWebpackConfig;
