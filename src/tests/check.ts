import path from 'path';
import fs from 'fs';
import mock from 'mock-fs';
import { assert } from 'chai';
import { Ini } from 'ini-api';

import { checkGameSettingsFileBaseFields } from '$utils/check';
import { createMockFilesForCheck } from './fixtures/getFiles';
import { readJSONFileSync } from '$utils/files';
import { IGameSettingsConfig } from '$reducers/gameSettings';

/* eslint-disable max-len, @typescript-eslint/ban-ts-comment */
describe('#Check', () => {
  before(createMockFilesForCheck);

  it('Should return array', () => {
    assert.isArray(checkGameSettingsFileBaseFields(readJSONFileSync(`${process.cwd()}/settings.json`)));
  });

  it('Should return no messages array', () => {
    assert.equal(checkGameSettingsFileBaseFields(readJSONFileSync(`${process.cwd()}/settings.json`)).length, 0);
  });

  it('Should return array with messages', () => {
    // Чтобы не считывать постоянно данные из реального файла, это делается один раз, а затем клонируем объект данных из мокового файла.
    const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
    delete obj.baseFilesEncoding;
    assert.equal(checkGameSettingsFileBaseFields(obj).length, 1);
    // @ts-ignore
    delete obj.usedFiles;
    assert.equal(checkGameSettingsFileBaseFields(obj).length, 2);
    // @ts-ignore
    obj.new = '111';
    assert.equal(checkGameSettingsFileBaseFields(obj).length, 3);
  });

  it('Should return array with error message', () => {
    const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
    // @ts-ignore
    delete obj.usedFiles;
    assert.equal(checkGameSettingsFileBaseFields(obj)[0].status, 'error');
  });
});
