import { assert } from 'chai';

import { checkGameSettingsFile } from '$utils/check';
import { createMockFilesForCheck } from './fixtures/getFiles';
import { readJSONFileSync } from '$utils/files';
import { IGameSettingsConfig } from '$reducers/gameSettings';

/* eslint-disable max-len, @typescript-eslint/ban-ts-comment */
describe('#Check', () => {
  before(createMockFilesForCheck);

  it('Should return correct result object', () => {
    assert.hasAllKeys(checkGameSettingsFile(readJSONFileSync(`${process.cwd()}/settings.json`)), ['newUserMessages', 'newSettingsConfigObj']);
  });

  it('Should return no messages array', () => {
    assert.equal(checkGameSettingsFile(readJSONFileSync(`${process.cwd()}/settings.json`)).newUserMessages.length, 0);
  });

  it('Should return array with messages', () => {
    // Чтобы не считывать постоянно данные из реального файла, это делается один раз, а затем клонируем объект данных из мокового файла.
    const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
    delete obj.baseFilesEncoding;
    assert.equal(checkGameSettingsFile(obj).newUserMessages.length, 1);
    // @ts-ignore
    delete obj.usedFiles;
    assert.equal(checkGameSettingsFile(obj).newUserMessages.length, 1);
    // @ts-ignore
    obj.new = '111';
    assert.equal(checkGameSettingsFile(obj).newUserMessages.length, 1);
  });

  it('Should return array with error message', () => {
    const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
    // @ts-ignore
    delete obj.usedFiles;
    assert.equal(checkGameSettingsFile(obj).newUserMessages[0].type, 'error');
  });

  it('Should return array with warning message', () => {
    const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
    // @ts-ignore
    obj.newField = 'new';
    assert.equal(checkGameSettingsFile(obj).newUserMessages[0].type, 'warning');
  });

  it('Should return array with info message', () => {
    const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
    // @ts-ignore
    delete obj.settingGroups[0].label;
    assert.equal(checkGameSettingsFile(obj).newUserMessages[0].type, 'info');
  });
});
