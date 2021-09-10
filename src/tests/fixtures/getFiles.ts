import path from 'path';
import mock from 'mock-fs';

export const createMockFilesForRead = (): void => {
  mock({
    'folderName': {
      'index.md': '# Hello world!',
      'test.json': mock.load(path.resolve(__dirname, 'test.json'), { lazy: false }),
      'writeOnly.json': mock.file({
        content: '{"some": "content"}',
        mode: 0o222,
      }),
      'writeOnly.md': mock.file({
        content: 'Write only!',
        mode: 0o222,
      }),
      'readOnly.md': mock.file({
        content: 'Read only!',
        mode: 0o444,
      }),
      'writeOnly.ini': mock.file({
        content: '[Section]\r\nparam=data',
        mode: 0o222,
      }),
      'readOnly.ini': mock.file({
        content: '[Section]\r\nparam=data',
        mode: 0o444,
      }),
    },
  });
};

export const createMockFilesForWrite = (): void => {
  mock({
    'writeFolder': {
      'test.txt': '',
      'test.json': '{"some": "content"}',
      'readOnly.txt': mock.file({
        content: 'some content',
        mode: 0o444,
      }),
      'readOnly.ini': mock.file({
        content: '[Section]\r\nparam=data',
        mode: 0o444,
      }),
      'test.ini': '',
    },
    'readOnlyDir': mock.directory({
      mode: 0o444,
    }),
  });
};

export const createMockFilesForCheck = (): void => {
  mock({
    'settings.json': mock.load(path.resolve(__dirname, 'settings.json'), { lazy: false }),
  });
};
