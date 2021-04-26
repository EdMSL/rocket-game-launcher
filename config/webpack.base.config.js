const path = require('path');
const { merge } = require('webpack-merge');

const js = require('./webpack/rules/js-ts');
const images = require('./webpack/rules/images');
const generateHtmlPlugin = require('./webpack/plugins/html-webpack-plugin');

const PATHS = {
  src: path.join(__dirname, '../src'),
  dist: path.join(__dirname, '../app/build'),
  conf: path.join(__dirname, '.'),
};

const plugins = [
  generateHtmlPlugin(`${PATHS.src}/public`),
];

const configuration = merge([
  {
    externals: {
      paths: PATHS,
    },
    resolve: {
      alias: {
        $constants: path.resolve(__dirname, `${PATHS.src}/constants/`),
        $containers: path.resolve(__dirname, `${PATHS.src}/renderer/containers/`),
        $store: path.resolve(__dirname, `${PATHS.src}/redux/store/`),
        $actions: path.resolve(__dirname, `${PATHS.src}/redux/actions/`),
        $reducers: path.resolve(__dirname, `${PATHS.src}/redux/reducers/`),
        $types: path.resolve(__dirname, `${PATHS.src}/redux/types/`),
      },
      fallback: {
        'assert': false,
        'fs': false,
        'path': false,
      },
      extensions: ['.ts', '.tsx', '.js'],
      descriptionFiles: ['package.json'],
    },
    module: {
      strictExportPresence: true,
    },
    stats: {
      all: false,
      modules: true,
      errors: true,
      warnings: false,
      moduleTrace: true,
      errorDetails: false,
    },
    plugins,
  },
  js(),
  images(),
]);

module.exports = configuration;
