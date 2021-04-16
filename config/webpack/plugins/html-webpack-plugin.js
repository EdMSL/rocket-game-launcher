const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function(assetsDir) {
  return new HtmlWebpackPlugin({
    filename: 'index.html',
    template: `${assetsDir}/index.html`,
    inject: process.env.NODE_ENV === 'development',
  });
};
