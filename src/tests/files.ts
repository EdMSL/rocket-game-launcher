import path from 'path';
import fs from 'fs';
import mock from 'mock-fs';
import { assert } from 'chai';

import {
  readFileDataSync, readJSONFileSync, writeFileData, writeJSONFile,
} from '$utils/files';
import { ERROR_MESSAGE, ReadWriteError } from '$utils/errors';
import { createMockFiles, createMockFilesForWrite } from './fixtures/getFiles';

const errorAccessRegExp = new RegExp(ERROR_MESSAGE.access);
const errorNotFoundRegExp = new RegExp(ERROR_MESSAGE.notFound);
const errorArgTypeRegExp = new RegExp(ERROR_MESSAGE.argType);
const errorDirectoryRegExp = new RegExp(ERROR_MESSAGE.directory);

/* eslint-disable max-len, @typescript-eslint/ban-ts-comment */
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
      // @ts-ignore
      assert.throw(() => { readFileDataSync(1); }, errorArgTypeRegExp);
      // @ts-ignore
      assert.throw(() => { readFileDataSync(null); }, errorArgTypeRegExp);
      // @ts-ignore
      assert.throw(() => { readFileDataSync(undefined); }, errorArgTypeRegExp);
      // @ts-ignore
      assert.throw(() => { readJSONFileSync(1); }, errorArgTypeRegExp);
      // @ts-ignore
      assert.throw(() => { readJSONFileSync(null); }, errorArgTypeRegExp);
      // @ts-ignore
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
      assert.deepEqual(readJSONFileSync(`${process.cwd()}/folderName/test.json`), { test: "I'am a test string!" });
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

      await writeFileData(`${process.cwd()}/writeFolder/new.txt`, 'New data for new file');
      assert.equal(fs.readFileSync(`${process.cwd()}/writeFolder/new.txt`, 'utf8'), 'New data for new file');
    });

    it('Should correct write to JSON file', async() => {
      await writeJSONFile(`${process.cwd()}/writeFolder/test.json`, { data: 'Some data' });
      assert.equal(fs.readFileSync(`${process.cwd()}/writeFolder/test.json`, 'utf8'), "{'data':'Some data'}");
    });

    it('Should return permission error message', async() => {
      let errorMsg = '';

      await writeFileData(`${process.cwd()}/writeFolder/readOnly.txt`, 'Data for write')
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorAccessRegExp);

      await writeJSONFile(`${process.cwd()}/readOnlyDir/new.json`, { data: 'Some data' })
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorAccessRegExp);
    });

    it('Should return directory in path error', async() => {
      let errorMsg = '';

      await writeFileData(`${process.cwd()}/writeFolder`, 'Data for write')
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorDirectoryRegExp);

      await writeJSONFile(`${process.cwd()}/writeFolder`, { data: 'Some data' })
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorDirectoryRegExp);
    });

    it('Should return invalid path error', async() => {
      let errorMsg = '';
      // @ts-ignore
      await writeFileData(1, 'Data for write')
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorArgTypeRegExp);
      // @ts-ignore
      await writeJSONFile(1, { data: 'Some data' })
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorArgTypeRegExp);
      // @ts-ignore
      await writeFileData(undefined, 'Data for write')
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorArgTypeRegExp);
      // @ts-ignore
      await writeJSONFile(undefined, { data: 'Some data' })
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorArgTypeRegExp);
    });
  });
});
