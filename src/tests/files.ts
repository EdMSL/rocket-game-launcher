import path from 'path';
import fs from 'fs';
import { assert } from 'chai';

import { readFileDataSync, readJSONFileSync } from '$utils/files';
import { ReadError } from '$utils/errors';
import { createMockFiles } from './fixtures/getFiles';


describe('#Files', function() {
  describe('Read files', function() {
    before(createMockFiles);

    it('Should return text string', function() {
      const text = readFileDataSync(`${process.cwd()}/folderName/index.md`);
      assert.equal(text, '# Hello world!');
    });

    it('Should return correct object', () => {
      const text = readJSONFileSync(`${process.cwd()}/folderName/test.json`);

      assert.deepEqual(text, { test: 'I\'am a test string!' });
    });

    it('Should return ReadError', () => {
      assert.throw(() => { readFileDataSync('./file.txt'); }, ReadError);
    });

    it('Should return \'File not found\' error message', () => {
      assert.throw(() => { readFileDataSync('./file.txt'); }, 'Can\'t read file. File not found');
    });
  });
});
