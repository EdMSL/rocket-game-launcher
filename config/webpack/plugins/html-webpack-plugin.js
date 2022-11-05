const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function (assetsDir, scriptSrc, name = 'index') {
  return new HtmlWebpackPlugin({
    filename: `${name}.html`,
    template: `${assetsDir}/${name}.html`,
    inject: false,
    scriptSrc,
    isDev: process.env.NODE_ENV === 'development',
  });
};
