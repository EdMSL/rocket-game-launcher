const webpack = require('webpack');

module.exports = function () {
  // Исправление для https://github.com/sebhildebrandt/systeminformation/issues/230
  return new webpack.IgnorePlugin({ resourceRegExp: /osx-temperature-sensor$/ });
};
