import { assert } from 'chai';

import { checkGameSettingsConfigMainFields, checkUsedFiles } from '$utils/check';
import { createMockFilesForCheck } from './fixtures/getFiles';
import { readJSONFileSync } from '$utils/files';
import { IGameSettingsConfig } from '$types/gameSettings';
import { Encoding } from '$constants/misc';

/* eslint-disable max-len, @typescript-eslint/ban-ts-comment */
describe('#Check', () => {
  before(createMockFilesForCheck);

  describe('#Check game settings config', () => {
    it('Should return correct result object', () => {
      let result = checkGameSettingsConfigMainFields(readJSONFileSync(`${process.cwd()}/settings.json`));

      assert.hasAllKeys(result, ['newUserMessages', 'newSettingsConfigObj']);
      assert.hasAllKeys(result.newSettingsConfigObj, ['baseFilesEncoding', 'basePathToFiles', 'settingGroups', 'usedFiles']);

      delete result.newSettingsConfigObj.settingGroups;
      delete result.newSettingsConfigObj.baseFilesEncoding;
      delete result.newSettingsConfigObj.basePathToFiles;

      result = checkGameSettingsConfigMainFields(result.newSettingsConfigObj);
      assert.hasAllKeys(result.newSettingsConfigObj, ['baseFilesEncoding', 'basePathToFiles', 'usedFiles']);
      assert.doesNotHaveAnyKeys(result.newSettingsConfigObj, ['settingGroups']);
    });

    it('Should return object with default values', () => {
      const obj = readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`);

      delete obj.baseFilesEncoding;
      delete obj.basePathToFiles;
      obj.settingGroups![0].name = 'new';
      // @ts-ignore
      delete obj.settingGroups[0].label;

      const result = checkGameSettingsConfigMainFields(obj);

      assert.equal(result.newSettingsConfigObj.baseFilesEncoding, Encoding.WIN1251);
      assert.equal(result.newSettingsConfigObj.basePathToFiles, './');
      assert.equal(result.newSettingsConfigObj.settingGroups![0].label, 'new');
    });

    it('Should return no messages array', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 0);

      delete obj.baseFilesEncoding;
      assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 0);

      delete obj.basePathToFiles;
      assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 0);

      // @ts-ignore
      delete obj.settingGroups[0].label;
      assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 0);

      delete obj.settingGroups;
      assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 0);

      // @ts-ignore
      obj.new = '111';
      assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 0);
    });

    it('Should return array with message', () => {
    // Чтобы не считывать постоянно данные из реального файла, это делается один раз в before хуке, а затем клонируем объект данных из мокового файла.
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };

      // @ts-ignore
      delete obj.usedFiles;
      assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 1);

      obj.usedFiles = {};
      // @ts-ignore
      obj.usedFiles.Some = {};

      // @ts-ignore
      obj.settingGroups = '';
      assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 1);

      obj.settingGroups = [{
        name: 'Some',
        label: 'name',
      }];

      // @ts-ignore
      delete obj.settingGroups[0].name;
      assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 1);
    });
  });

  describe('#Check game settings config', () => {
    // before(createMockFilesForCheck);

    // it('Should return correct result object', () => {
    //   assert.hasAllKeys(checkGameSettingsConfigMainFields(readJSONFileSync(`${process.cwd()}/settings.json`)), ['newUserMessages', 'newSettingsConfigObj']);
    // });
  });
});
