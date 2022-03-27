const { merge } = require('webpack-merge');
const path = require('path');

const js = require('./webpack/rules/js-ts');
const images = require('./webpack/rules/images');
const generateHtmlPlugin = require('./webpack/plugins/html-webpack-plugin');
const ignorePlugin = require('./webpack/plugins/ignore-plugin');

const PATHS = {
  src: path.join(__dirname, '../src'),
  build: path.join(__dirname, '../app/build'),
  dist: path.join(__dirname, '../app/dist'),
  conf: path.join(__dirname, '.'),
};

const plugins = [
  generateHtmlPlugin(`${PATHS.src}/public`),
  ignorePlugin(),
];

const configuration = merge([
  {
    externals: {
      paths: PATHS,
    },
    resolve: {
      alias: {
        $constants: path.resolve(__dirname, `${PATHS.src}/constants/`),
        $components: path.resolve(__dirname, `${PATHS.src}/renderer/components/`),
        $containers: path.resolve(__dirname, `${PATHS.src}/renderer/containers/`),
        $store: path.resolve(__dirname, `${PATHS.src}/redux/store/`),
        $actions: path.resolve(__dirname, `${PATHS.src}/redux/actions/`),
        $handlers: path.resolve(__dirname, `${PATHS.src}/redux/handlers/`),
        $reducers: path.resolve(__dirname, `${PATHS.src}/redux/reducers/`),
        $types: path.resolve(__dirname, `${PATHS.src}/redux/types/`),
        $sagas: path.resolve(__dirname, `${PATHS.src}/redux/sagas/`),
        $images: path.resolve(__dirname, `${PATHS.src}/images/`),
        $utils: path.resolve(__dirname, `${PATHS.src}/utils/`),
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
    experiments: { topLevelAwait: true },
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
  js(process.env),
  images(),
]);

module.exports = configuration;
