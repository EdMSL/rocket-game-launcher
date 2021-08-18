module.exports = {
  extension: ['js', 'ts'],
  spec: ['src/tests/*'],
  require: ['ts-node/register', 'tsconfig-paths/register', 'iconv-lite/encodings'],
  reporter: 'spec',
  parallel: true
};
