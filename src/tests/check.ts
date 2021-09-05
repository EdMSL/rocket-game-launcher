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

      delete result.newSettingsConfigObj.settingGroups;
      delete result.newSettingsConfigObj.baseFilesEncoding;

      result = checkGameSettingsConfigMainFields(result.newSettingsConfigObj);
      assert.hasAllKeys(result.newSettingsConfigObj, ['settingGroups', 'baseFilesEncoding', 'usedFiles']);
    });

    it('Should return object with default values', () => {
      const obj = readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`);

      delete obj.baseFilesEncoding;
      obj.settingGroups![0].name = 'new';
      // @ts-ignore
      delete obj.settingGroups[0].label;

      const result = checkGameSettingsConfigMainFields(obj);

      assert.equal(result.newSettingsConfigObj.baseFilesEncoding, Encoding.WIN1251);
      assert.equal(result.newSettingsConfigObj.settingGroups![0].label, 'new');
    });

    it('Should return no error messages array', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 0);

      delete obj.baseFilesEncoding;
      assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 0);

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

    describe('All tests should return array with error message', () => {
      // Чтобы не считывать постоянно данные из реального файла после изменения полей, это делается один раз в before хуке, а затем клонируем объект данных из мокового файла.
      it('Should return error about missed required usedFiles field', () => {
        const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };

        // @ts-ignore
        delete obj.usedFiles;
        assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 1);
      });
      it('Should return error about incorrect data in settingGroups field', () => {
        const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };

        // @ts-ignore
        obj.settingGroups = '';
        assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 1);
      });
      it('Should return error about missed required name field in settingGroups item', () => {
        const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };

        // @ts-ignore
        delete obj.settingGroups[0].name;
        assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 1);
      });
    });
  });

  describe('#Check game used files', () => {
    it('Should return correct result object', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      //@ts-ignore
      const result = checkUsedFiles(obj.usedFiles, Encoding.WIN1251, obj.settingGroups);

      assert.hasAllKeys(result, ['newUserMessages', 'newUsedFilesObj']);
    });

    it('Should return correct data for used files main fields', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      //@ts-ignore
      const result = checkUsedFiles(obj.usedFiles, Encoding.WIN1251, obj.settingGroups);
      assert.equal(result.newUsedFilesObj.anyFile.encoding, Encoding.WIN1251);
    });

    it('Should return correct data in parameters', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      //@ts-ignore
      const result = checkUsedFiles(obj.usedFiles, Encoding.WIN1251, obj.settingGroups);

      assert.containsAllKeys(result.newUsedFilesObj.anyFile.parameters[0], ['name', 'iniGroup', 'settingGroup', 'type', 'label']);
      assert.equal(result.newUsedFilesObj.anyFile.parameters[1].label, 'Any new name');
      assert.isNumber(result.newUsedFilesObj.anyFile.parameters[0].max);
    });

    describe('All tests should return array witn error message', () => {
      it('Should return error abouy unnecessary settingGroup parameter', () => {
        const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
        const usedFiles = { ...obj.usedFiles };

        delete obj.settingGroups;
        assert.equal(checkUsedFiles(usedFiles, Encoding.WIN1251, []).newUserMessages.length, 1);
      });

      it('Should return error about incorrect settingGroup parameter', () => {
        const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
        const usedFiles = { ...obj.usedFiles };
        usedFiles.anyFile.parameters[0].settingGroup = 'Group';
        //@ts-ignore
        assert.equal(checkUsedFiles(usedFiles, Encoding.WIN1251, obj.settingGroups).newUserMessages.length, 1);
      });

      it('Should return error about missed name field', () => {
        const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
        const usedFiles = { ...obj.usedFiles };
        //@ts-ignore
        delete usedFiles.anyFile.parameters[0].name;
        //@ts-ignore
        assert.equal(checkUsedFiles(usedFiles, Encoding.WIN1251, obj.settingGroups).newUserMessages.length, 1);
      });

      it('Should return error about incorrect type field', () => {
        const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
        const usedFiles = { ...obj.usedFiles };

        usedFiles.someFile.parameters[0].controllerType = 'Incorrect type';
        //@ts-ignore
        assert.equal(checkUsedFiles(usedFiles, Encoding.WIN1251, obj.settingGroups).newUserMessages.length, 1);
      });

      it('Should return error about iniGroup parameter for line view ini file', () => {
        const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
        const usedFiles = { ...obj.usedFiles };
        usedFiles.someFile.parameters[0].iniGroup = 'Not needed group';
        //@ts-ignore
        assert.equal(checkUsedFiles(usedFiles, Encoding.WIN1251, obj.settingGroups).newUserMessages.length, 1);
      });
    });
  });
});
