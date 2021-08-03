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
import { ERROR_MESSAGE, ReadWriteError } from '$utils/errors';
import { createMockFiles, createMockFilesForWrite } from './fixtures/getFiles';

const errorAccessRegExp = new RegExp(ERROR_MESSAGE.access);
const errorNotFoundRegExp = new RegExp(ERROR_MESSAGE.notFound);
const errorArgTypeRegExp = new RegExp(ERROR_MESSAGE.argType);
const errorDirectoryRegExp = new RegExp(ERROR_MESSAGE.directory);

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
      assert.throw(() => { readJSONFileSync('./test.json'); }, ReadWriteError);
      assert.throw(() => { readJSONFileSync(`${process.cwd()}/folderName/writeOnly.md`); }, ReadWriteError);
    });

    it('Should return file not found error message', () => {
      assert.throw(() => { readFileDataSync('./file.txt'); }, errorNotFoundRegExp);
      assert.throw(() => { readFileDataSync('someString'); }, errorNotFoundRegExp);
      assert.throw(() => { readJSONFileSync('./file.txt'); }, errorNotFoundRegExp);
      assert.throw(() => { readJSONFileSync('someString'); }, errorNotFoundRegExp);
    });

    it('Should return invalid path error message', () => {
      assert.throw(() => { readFileDataSync(1 as unknown as string); }, errorArgTypeRegExp);
      assert.throw(() => { readFileDataSync(null); }, errorArgTypeRegExp);
      assert.throw(() => { readFileDataSync(undefined); }, errorArgTypeRegExp);
      assert.throw(() => { readJSONFileSync(1 as unknown as string); }, errorArgTypeRegExp);
      assert.throw(() => { readJSONFileSync(null); }, errorArgTypeRegExp);
      assert.throw(() => { readJSONFileSync(undefined); }, errorArgTypeRegExp);
    });

    it('Should return permission error message', () => {
      assert.throw(() => { readFileDataSync(`${process.cwd()}/folderName/writeOnly.md`); }, errorAccessRegExp);
      assert.throw(() => { readJSONFileSync(`${process.cwd()}/folderName/writeOnly.md`); }, errorAccessRegExp);
    });

    it('Should return directory in path error', async() => {
      assert.throw(() => { readFileDataSync(`${process.cwd()}/folderName/`); }, errorDirectoryRegExp);
      assert.throw(() => { readJSONFileSync(`${process.cwd()}/folderName/`); }, errorDirectoryRegExp);
    });

    it('Should return parse error', async() => {
      assert.throw(() => { readJSONFileSync(`${process.cwd()}/folderName/index.md`); }, Error);
      assert.throw(() => { readJSONFileSync(`${process.cwd()}/folderName/index.md`); }, /JSON parse error/);
    });

    it('Should return correct object', () => {
      assert.deepEqual(readJSONFileSync(`${process.cwd()}/folderName/test.json`), { test: 'I\'am a test string!' });
    });

    // Используем реальный файл, поскольку в нем другая кодировка и mock загружает уже неправильный текст
    it('Should return incorrect string', () => {
      assert.notEqual(mock.bypass(() => readFileDataSync(path.resolve(__dirname, './fixtures/cirillic.txt'))), 'File in Windows 1251 encoding.\nРусский текст.');
    });
  });

  describe('Write files', function() {
    beforeEach(createMockFilesForWrite);

    it('Should write correct data', async() => {
      await writeFileData(`${process.cwd()}/writeFolder/test.txt`, 'Data for write');
      assert.equal(fs.readFileSync(`${process.cwd()}/writeFolder/test.txt`, 'utf8'), 'Data for write');

      await writeFileData(`${process.cwd()}/writeFolder/new.txt`, 'New data for file');
      assert.equal(fs.readFileSync(`${process.cwd()}/writeFolder/new.txt`, 'utf8'), 'New data for file');
    });

    it('Should return permission error message', async() => {
      let errorMsg;

      await writeFileData(`${process.cwd()}/writeFolder/readOnly.txt`, 'Data for write')
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorAccessRegExp);

      await writeFileData(`${process.cwd()}/readOnlyDir/readOnly.txt`, 'Data for write')
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorAccessRegExp);
    });

    it('Should return directory in path error', async() => {
      let errorMsg;

      await writeFileData(`${process.cwd()}/writeFolder`, 'Data for write')
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorDirectoryRegExp);
    });

    it('Should correct write to JSON file', async() => {
      await writeJSONFile(`${process.cwd()}/writeFolder/test.json`, { data: 'Some data' });
      assert.equal(fs.readFileSync(`${process.cwd()}/writeFolder/test.json`, 'utf8'), '{"data":"Some data"}');
    });
  });
});
