import path from 'path';
import fs from 'fs';
import mock from 'mock-fs';
import { assert } from 'chai';

import {
  readFileDataSync,
  readJSONFileSync,
  writeFileData,
  writeJSONFile,
} from '$utils/files';
import { ReadWriteError } from '$utils/errors';
import { createMockFiles, createMockFilesForWrite } from './fixtures/getFiles';

/* eslint-disable max-len */
describe('#Files', function() {
  describe('Read files', function() {
    before(createMockFiles);

    it('Should return correct string', function() {
      assert.equal(readFileDataSync(`${process.cwd()}/folderName/index.md`), '# Hello world!');
    });

    it('Should return ReadWriteError', () => {
      assert.throw(() => { readFileDataSync('./file.txt'); }, ReadWriteError);
      assert.throw(() => { readFileDataSync(`${process.cwd()}/folderName/writeOnly.md`); }, ReadWriteError);
    });

    it('Should return file not found error message', () => {
      assert.throw(() => { readFileDataSync('./file.txt'); }, /File not found/);
      assert.throw(() => { readFileDataSync('someString'); }, /File not found/);
    });

    it('Should return invalid path error message', () => {
      assert.throw(() => { readFileDataSync(null); }, /Invalid path received/);
      assert.throw(() => { readFileDataSync(undefined); }, /Invalid path received/);
    });

    it('Should return permission error message', () => {
      assert.throw(() => { readFileDataSync(`${process.cwd()}/folderName/writeOnly.md`); }, /Permission denied/);
    });

    // Используем реальный файл, поскольку в нем другая кодировка и mock загружает уже неправильный текст
    it('Should return incorrect string', () => {
      assert.notEqual(mock.bypass(() => readFileDataSync(path.resolve(__dirname, './fixtures/cirillic.txt'))), 'File in Windows 1251 encoding.\nРусский текст.');
    });

    it('Should return correct object', () => {
      assert.deepEqual(readJSONFileSync(`${process.cwd()}/folderName/test.json`), { test: 'I\'am a test string!' });
    });
  });

  describe('Write files', function() {
    beforeEach(createMockFilesForWrite);

    it('Should write correct data', async() => {
      await writeFileData(`${process.cwd()}/writeFolder/test.txt`, 'Data for write');
      assert.equal(fs.readFileSync(`${process.cwd()}/writeFolder/test.txt`, 'utf8'), 'Data for write');
    });

    it('Should return permission error message', async() => {
      let errorMsg;

      await writeFileData(`${process.cwd()}/writeFolder/readOnly.txt`, 'Data for write')
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, /Permission denied/);
    });

    it('Should correct write to JSON file', async() => {
      await writeJSONFile(`${process.cwd()}/writeFolder/test.json`, { data: 'Some data' });
      assert.equal(fs.readFileSync(`${process.cwd()}/writeFolder/test.json`, 'utf8'), '{"data":"Some data"}');
    });
  });
});
