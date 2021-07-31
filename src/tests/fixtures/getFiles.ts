import path from 'path';
import mock from 'mock-fs';

export const createMockFiles = (): void => {
  mock({
    'folderName': {
      'index.md': '# Hello world!',
      'test.json': mock.load(path.resolve(__dirname, 'test.json'), { lazy: false }),
    },
  });
};
