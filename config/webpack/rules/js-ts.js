module.exports = function() {
  return {
    module: {
      rules: [
        {
          test: /\.(ts|js)(x?)$/,
          exclude: /node_modules/,
          use: [
            'ts-loader',
          ],
        },
      ],
    },
  };
};
