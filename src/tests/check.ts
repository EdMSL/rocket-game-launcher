import { assert } from 'chai';

import { checkGameSettingsConfigMainFields, checkGameSettingsFiles } from '$utils/check';
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

      assert.hasAllKeys(result, ['baseFilesEncoding', 'gameSettingsGroups', 'gameSettingsFiles']);

      delete result.gameSettingsGroups;
      delete result.baseFilesEncoding;

      result = checkGameSettingsConfigMainFields(result);
      assert.hasAllKeys(result, ['gameSettingsGroups', 'baseFilesEncoding', 'gameSettingsFiles']);
    });

    it('Should return object with default values', () => {
      const obj = readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`);

      delete obj.baseFilesEncoding;
      obj.gameSettingsGroups![0].name = 'new';
      // @ts-ignore
      delete obj.gameSettingsGroups[0].label;

      const result = checkGameSettingsConfigMainFields(obj);

      assert.equal(result.baseFilesEncoding, Encoding.WIN1251);
      assert.equal(result.gameSettingsGroups![0].label, 'new');
    });

    it('Should return no errors', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };

      delete obj.baseFilesEncoding;
      assert.containsAllKeys(checkGameSettingsConfigMainFields(obj), ['baseFilesEncoding']);

      // @ts-ignore
      delete obj.gameSettingsGroups[0].label;
      // @ts-ignore
      assert.equal(checkGameSettingsConfigMainFields(obj).gameSettingsGroups[0].label, 'Graphic');

      delete obj.gameSettingsGroups;
      // @ts-ignore
      assert.equal(checkGameSettingsConfigMainFields(obj).gameSettingsGroups.length, 0);

      // @ts-ignore
      obj.new = '111';
      assert.doesNotHaveAnyKeys(checkGameSettingsConfigMainFields(obj), ['new']);
    });

    describe('All tests should throw error', () => {
      // Чтобы не считывать постоянно данные из реального файла после изменения полей, это делается один раз в before хуке, а затем клонируем объект данных из мокового файла.
      it('Should return error about missed required gameSettingsFiles field', () => {
        const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };

        // @ts-ignore
        delete obj.gameSettingsFiles;
        assert.throw(() => { checkGameSettingsConfigMainFields(obj); }, /"gameSettingsFiles" is required/);
      });
      it('Should return error about incorrect data in game settings groups field', () => {
        const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };

        // @ts-ignore
        obj.gameSettingsGroups = '';
        assert.throw(() => { checkGameSettingsConfigMainFields(obj); }, /"gameSettingsGroups" must be an array/);
      });
      it('Should return error about missed required name field in game settings groups item', () => {
        const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };

        // @ts-ignore
        delete obj.gameSettingsGroups[0].name;
        assert.throw(() => { checkGameSettingsConfigMainFields(obj); }, /"gameSettingsGroups\[0\].name" is required/);
      });

      it('Should return error about not unique item in game settings groups', () => {
        const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };

        // @ts-ignore
        obj.gameSettingsGroups[0].name = 'Any';
        // @ts-ignore
        obj.gameSettingsGroups[1].name = 'Any';
        assert.throw(() => { checkGameSettingsConfigMainFields(obj); }, /"gameSettingsGroups\[1\]" contains a duplicate value/);
      });
    });
  });

  describe('#Check game settings files', () => {
    it('Should return correct result object', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      //@ts-ignore
      const result = checkGameSettingsFiles(obj.gameSettingsFiles, Encoding.WIN1251, obj.gameSettingsGroups);

      assert.hasAllKeys(result.files, ['anyFile', 'relatedFile', 'groupFile', 'newFile', 'someFile', 'tagFile']);
    });

    it('Should return correct default data for game settings files main fields', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      //@ts-ignore
      const result = checkGameSettingsFiles(obj.gameSettingsFiles, Encoding.WIN1251, obj.gameSettingsGroups);
      assert.equal(result.files.anyFile.encoding, Encoding.WIN1251);
    });

    it('Should return correct data from default parameter', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      //@ts-ignore
      const result = checkGameSettingsFiles(obj.gameSettingsFiles, Encoding.WIN1251, obj.gameSettingsGroups);

      assert.hasAllKeys(result.files.anyFile.optionsList[0], ['id', 'description', 'name', 'iniGroup', 'settingGroup', 'controllerType', 'optionType', 'label', 'max', 'min', 'step']);
      assert.hasAllKeys(result.files.anyFile.optionsList[1], ['id', 'description', 'name', 'iniGroup', 'settingGroup', 'controllerType', 'optionType', 'label']);
      assert.hasAllKeys(result.files.someFile.optionsList[0], ['id', 'description', 'name', 'settingGroup', 'controllerType', 'optionType', 'label', 'options']);
      assert.equal(result.files.anyFile.optionsList[0].optionType, 'default');
      assert.equal(result.files.anyFile.optionsList[1].label, 'Any new name');
      assert.isNumber(result.files.anyFile.optionsList[0].max);
    });

    it('Should return correct data from group parameter', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      //@ts-ignore
      const result = checkGameSettingsFiles(obj.gameSettingsFiles, Encoding.WIN1251, obj.gameSettingsGroups);

      assert.hasAllKeys(result.files.groupFile.optionsList[0], ['id', 'description', 'settingGroup', 'controllerType', 'optionType', 'label', 'options', 'items']);
      //@ts-ignore
      assert.hasAllKeys(result.files.groupFile.optionsList[0].items[0], ['id', 'name']);
    });

    it('Should return correct data from related parameter', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      //@ts-ignore
      const result = checkGameSettingsFiles(obj.gameSettingsFiles, Encoding.WIN1251, obj.gameSettingsGroups);

      assert.hasAllKeys(result.files.relatedFile.optionsList[0], ['id', 'description', 'settingGroup', 'optionType', 'label', 'items']);
      //@ts-ignore
      assert.hasAllKeys(result.relatedFile.optionsList[0].items[0], ['id', 'name', 'controllerType', 'options']);
    });

    it('Should return correct data from tag file parameter', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      //@ts-ignore
      const result = checkGameSettingsFiles(obj.gameSettingsFiles, Encoding.WIN1251, obj.gameSettingsGroups);

      assert.hasAllKeys(result.files.tagFile.optionsList[0], ['id', 'description', 'name', 'settingGroup', 'optionType', 'controllerType', 'label', 'valueName', 'valuePath']);
    });

    describe('All tests should throw error', () => {
      it('Should return error about no options to show', () => {
        const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
        const gameSettingsFiles = { ...obj.gameSettingsFiles };

        delete obj.gameSettingsGroups;
        assert.throw(() => { checkGameSettingsFiles(gameSettingsFiles, Encoding.WIN1251, []); }, /No options available after game settings validation/);
      });
    });
  });
});
