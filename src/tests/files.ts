import path from 'path';
import fs from 'fs';
import mock from 'mock-fs';
import { assert } from 'chai';
import { Ini } from 'ini-api';

import {
  readFileDataSync,
  readFileData,
  readJSONFileSync,
  readINIFile,
  writeFileData,
  writeJSONFile,
  writeINIFile,
} from '$utils/files';
import { ErrorMessage, ReadWriteError } from '$utils/errors';
import { createMockFiles, createMockFilesForWrite } from './fixtures/getFiles';

const errorAccessRegExp = new RegExp(ErrorMessage.ACCESS);
const errorNotFoundRegExp = new RegExp(ErrorMessage.FILE_NOT_FOUND);
const errorArgTypeRegExp = new RegExp(ErrorMessage.ARG_TYPE);
const errorDirectoryRegExp = new RegExp(ErrorMessage.PATH_TO_DIRECTORY);

/* eslint-disable max-len, @typescript-eslint/ban-ts-comment */
describe('#Files', () => {
  describe('Read files', () => {
    before(createMockFiles);

    it('Should return correct string', async () => {
      assert.equal(readFileDataSync(`${process.cwd()}/folderName/index.md`), '# Hello world!');

      const string = await readFileData(`${process.cwd()}/folderName/index.md`)
        .then((data) => data.toString());
      assert.equal(string, '# Hello world!');
    });

    it('Should return ReadWriteError', () => {
      assert.throw(() => { readFileDataSync('./file.txt'); }, ReadWriteError);
      assert.throw(() => { readFileDataSync(`${process.cwd()}/folderName/writeOnly.md`); }, ReadWriteError);
      assert.throw(() => { readJSONFileSync('./test.json'); }, ReadWriteError);
      assert.throw(() => { readJSONFileSync(`${process.cwd()}/folderName/writeOnly.md`); }, ReadWriteError);
    });

    it('Should return file not found error message', async () => {
      assert.throw(() => { readFileDataSync('./file.txt'); }, errorNotFoundRegExp);
      assert.throw(() => { readFileDataSync('someString'); }, errorNotFoundRegExp);
      assert.throw(() => { readJSONFileSync('./file.txt'); }, errorNotFoundRegExp);
      assert.throw(() => { readJSONFileSync('someString'); }, errorNotFoundRegExp);

      let errorMsg;
      await readFileData('./file.txt')
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorNotFoundRegExp);
      await readINIFile('./file.ini')
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorNotFoundRegExp);
    });

    it('Should return invalid path error message', async () => {
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

      let errorMsg;
      // @ts-ignore
      await readFileData(1)
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorArgTypeRegExp);
      // @ts-ignore
      await readFileData(null)
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorArgTypeRegExp);
      // @ts-ignore
      await readFileData(undefined)
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorArgTypeRegExp);
      // @ts-ignore
      await readINIFile(1)
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorArgTypeRegExp);
      // @ts-ignore
      await readINIFile(null)
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorArgTypeRegExp);
      // @ts-ignore
      await readINIFile(undefined)
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorArgTypeRegExp);
    });

    it('Should return permission error message', async () => {
      assert.throw(() => { readFileDataSync(`${process.cwd()}/folderName/writeOnly.md`); }, errorAccessRegExp);
      assert.throw(() => { readJSONFileSync(`${process.cwd()}/folderName/writeOnly.md`); }, errorAccessRegExp);

      let errorMsg;
      await readFileData(`${process.cwd()}/folderName/writeOnly.ini`)
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorAccessRegExp);
      await readINIFile(`${process.cwd()}/folderName/writeOnly.ini`)
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorAccessRegExp);
    });

    it('Should return directory in path error', async () => {
      assert.throw(() => { readFileDataSync(`${process.cwd()}/folderName/`); }, errorDirectoryRegExp);
      assert.throw(() => { readJSONFileSync(`${process.cwd()}/folderName/`); }, errorDirectoryRegExp);

      let errorMsg;
      await readFileData(`${process.cwd()}/folderName/`)
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorDirectoryRegExp);
      await readINIFile(`${process.cwd()}/folderName/`)
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorDirectoryRegExp);
    });

    it('Should return parse error', async () => {
      assert.throw(() => { readJSONFileSync(`${process.cwd()}/folderName/index.md`); }, Error);
      assert.throw(() => { readJSONFileSync(`${process.cwd()}/folderName/index.md`); }, /JSON parse error/);
    });

    it('Should return correct object', async () => {
      assert.deepEqual(readJSONFileSync(`${process.cwd()}/folderName/test.json`), { test: "I'am a test string!" });

      const obj = await readINIFile(`${process.cwd()}/folderName/readOnly.ini`, 'utf-8')
        .then((data) => data);

      assert.hasAllKeys(obj, ['globals', 'lineBreak', 'sections']);
      assert.equal(obj.sections[0].name, 'Section');
      assert.equal(obj.sections[0].lines[1].text, 'param=data');
      assert.equal(obj.sections[0].lines[1].key, 'param');
      assert.equal(obj.sections[0].lines[1].value, 'data');
    });

    // Используем реальный файл, поскольку в нем другая кодировка и mock загружает уже неправильный текст
    it('Should return incorrect string', () => {
      assert.notEqual(mock.bypass(() => readFileDataSync(path.resolve(__dirname, './fixtures/cirillic.txt'))), 'File in Windows 1251 encoding.\nРусский текст.');
    });
  });

  describe('Write files', () => {
    beforeEach(createMockFilesForWrite);

    it('Should write correct data', async () => {
      await writeFileData(`${process.cwd()}/writeFolder/test.txt`, 'Data for write');
      assert.equal(fs.readFileSync(`${process.cwd()}/writeFolder/test.txt`, 'utf8'), 'Data for write');

      await writeFileData(`${process.cwd()}/writeFolder/new.txt`, 'New data for new file');
      assert.equal(fs.readFileSync(`${process.cwd()}/writeFolder/new.txt`, 'utf8'), 'New data for new file');
    });

    it('Should correct write to JSON file', async () => {
      await writeJSONFile(`${process.cwd()}/writeFolder/test.json`, { data: 'Some data' });
      assert.equal(fs.readFileSync(`${process.cwd()}/writeFolder/test.json`, 'utf8'), '{"data":"Some data"}');
    });

    it('Should correct write to INI file', async () => {
      const obj = await readINIFile(`${process.cwd()}/writeFolder/readOnly.ini`, 'utf-8')
        .then((data) => data);
      obj.addSection('New');
      await writeINIFile(`${process.cwd()}/writeFolder/test.ini`, obj);
      assert.equal(fs.readFileSync(`${process.cwd()}/writeFolder/test.ini`, 'utf8'), '[Section]\r\nparam=data\r\n[New]');
    });

    it('Should return permission error message', async () => {
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

      await writeINIFile(`${process.cwd()}/readOnlyDir/new.ini`, new Ini('[Section]\r\nparam=data\r\n[New]'))
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorAccessRegExp);
    });

    it('Should return directory in path error', async () => {
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

      await writeINIFile(`${process.cwd()}/writeFolder`, new Ini('[Section]\r\nparam=data\r\n[New]'))
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorDirectoryRegExp);
    });

    it('Should return invalid path error', async () => {
      let errorMsg = '';
      // @ts-ignore
      await writeFileData(1, 'Data for write')
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
      await writeJSONFile(1, { data: 'Some data' })
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
      // @ts-ignore
      await writeINIFile(1, new Ini('[Section]\r\nparam=data'))
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorArgTypeRegExp);
      // @ts-ignore
      await writeINIFile(undefined, new Ini('[Section]\r\nparam=data'))
        .catch((error) => {
          errorMsg = error.message;
        });
      assert.match(errorMsg, errorArgTypeRegExp);
    });
  });
});
