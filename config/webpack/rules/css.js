const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const regExps = require('../regExps');

const { cssModules } = regExps;

module.exports = function (mode, resourcesPath) {
  function getLoaders(cssOptions) {
    return [
      {
        loader: mode === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader,
      },
      {
        loader: 'css-loader',
        options: cssOptions,
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: mode === 'development',
          sassOptions: {
            outputStyle: 'expanded',
          },
        },
      },
      {
        loader: 'sass-resources-loader',
        options: {
          sourceMap: mode === 'development',
          resources: `${resourcesPath}/**/*.scss`,
        },
      },
    ].filter(Boolean);
  }

  return {
    module: {
      rules: [
        {
          test: /\.(scss|sass|css)$/,
          use: getLoaders({
            sourceMap: mode === 'development',
            modules: {
              auto: true,
              localIdentName: '[local]',
            },
            importLoaders: 2,
          }),
        },
      ],
    },
  };
};
