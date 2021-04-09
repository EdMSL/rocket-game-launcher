module.exports = function () {
  return {
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|svg)$/,
          type: 'asset',
          generator: {
            filename: 'images/[name].[ext]',
            publicPath: '../',
          },
        },
      ],
    },
  };
};
