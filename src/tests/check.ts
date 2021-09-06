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

      assert.hasAllKeys(result, ['baseFilesEncoding', 'settingGroups', 'usedFiles']);

      delete result.settingGroups;
      delete result.baseFilesEncoding;

      result = checkGameSettingsConfigMainFields(result);
      assert.hasAllKeys(result, ['settingGroups', 'baseFilesEncoding', 'usedFiles']);
    });

    it('Should return object with default values', () => {
      const obj = readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`);

      delete obj.baseFilesEncoding;
      obj.settingGroups![0].name = 'new';
      // @ts-ignore
      delete obj.settingGroups[0].label;

      const result = checkGameSettingsConfigMainFields(obj);

      assert.equal(result.baseFilesEncoding, Encoding.WIN1251);
      assert.equal(result.settingGroups![0].label, 'new');
    });

    it('Should return no errors', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };

      delete obj.baseFilesEncoding;
      assert.containsAllKeys(checkGameSettingsConfigMainFields(obj), ['baseFilesEncoding']);

      // @ts-ignore
      delete obj.settingGroups[0].label;
      // @ts-ignore
      assert.equal(checkGameSettingsConfigMainFields(obj).settingGroups[0].label, 'Graphic');

      delete obj.settingGroups;
      // @ts-ignore
      assert.equal(checkGameSettingsConfigMainFields(obj).settingGroups.length, 0);

      // @ts-ignore
      obj.new = '111';
      assert.doesNotHaveAnyKeys(checkGameSettingsConfigMainFields(obj), ['new']);
    });

    describe('All tests should throw error', () => {
      // Чтобы не считывать постоянно данные из реального файла после изменения полей, это делается один раз в before хуке, а затем клонируем объект данных из мокового файла.
      it('Should return error about missed required usedFiles field', () => {
        const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };

        // @ts-ignore
        delete obj.usedFiles;
        assert.throw(() => { checkGameSettingsConfigMainFields(obj); }, /"usedFiles" is required/);
      });
      it('Should return error about incorrect data in settingGroups field', () => {
        const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };

        // @ts-ignore
        obj.settingGroups = '';
        assert.throw(() => { checkGameSettingsConfigMainFields(obj); }, /"settingGroups" must be an array/);
      });
      it('Should return error about missed required name field in settingGroups item', () => {
        const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };

        // @ts-ignore
        delete obj.settingGroups[0].name;
        assert.throw(() => { checkGameSettingsConfigMainFields(obj); }, /"settingGroups\[0\].name" is required/);
      });
    });
  });

  describe('#Check game used files', () => {
    it('Should return correct result object', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      //@ts-ignore
      const result = checkUsedFiles(obj.usedFiles, Encoding.WIN1251, obj.settingGroups);

      assert.hasAllKeys(result, ['anyFile', 'composedFile', 'groupFile', 'newFile', 'someFile', 'tagFile']);
    });

    it('Should return correct default data for used files main fields', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      //@ts-ignore
      const result = checkUsedFiles(obj.usedFiles, Encoding.WIN1251, obj.settingGroups);
      assert.equal(result.anyFile.encoding, Encoding.WIN1251);
    });

    it('Should return correct data from default parameter', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      //@ts-ignore
      const result = checkUsedFiles(obj.usedFiles, Encoding.WIN1251, obj.settingGroups);

      assert.hasAllKeys(result.anyFile.parameters[0], ['name', 'iniGroup', 'settingGroup', 'controllerType', 'parameterType', 'label', 'max', 'min', 'step']);
      assert.hasAllKeys(result.anyFile.parameters[1], ['name', 'iniGroup', 'settingGroup', 'controllerType', 'parameterType', 'label']);
      assert.hasAllKeys(result.someFile.parameters[0], ['name', 'settingGroup', 'controllerType', 'parameterType', 'label', 'options']);
      assert.equal(result.anyFile.parameters[0].parameterType, 'default');
      assert.equal(result.anyFile.parameters[1].label, 'Any new name');
      assert.isNumber(result.anyFile.parameters[0].max);
    });

    it('Should return correct data from group parameter', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      //@ts-ignore
      const result = checkUsedFiles(obj.usedFiles, Encoding.WIN1251, obj.settingGroups);

      assert.hasAllKeys(result.groupFile.parameters[0], ['settingGroup', 'controllerType', 'parameterType', 'label', 'options', 'items']);
      //@ts-ignore
      assert.hasAllKeys(result.groupFile.parameters[0].items[0], ['name']);
    });

    it('Should return correct data from composed parameter', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      //@ts-ignore
      const result = checkUsedFiles(obj.usedFiles, Encoding.WIN1251, obj.settingGroups);

      assert.hasAllKeys(result.composedFile.parameters[0], ['settingGroup', 'parameterType', 'label', 'items']);
      //@ts-ignore
      assert.hasAllKeys(result.composedFile.parameters[0].items[0], ['name', 'controllerType', 'options']);
    });

    it('Should return correct data from tag file parameter', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      //@ts-ignore
      const result = checkUsedFiles(obj.usedFiles, Encoding.WIN1251, obj.settingGroups);

      assert.hasAllKeys(result.tagFile.parameters[0], ['name', 'settingGroup', 'parameterType', 'controllerType', 'label', 'attributeName', 'attributePath']);
    });

    describe('All tests should throw error', () => {
      it('Should return error about no options to show', () => {
        const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
        const usedFiles = { ...obj.usedFiles };

        delete obj.settingGroups;
        assert.throw(() => { checkUsedFiles(usedFiles, Encoding.WIN1251, []); }, /No options available after game settings validation/);
      });
    });
  });
});
