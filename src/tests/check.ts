import { assert } from 'chai';

import { checkGameSettingsConfigFull, checkGameSettingsOptions } from '$utils/check';
import { createMockFilesForCheck } from './fixtures/getFiles';
import { readJSONFileSync } from '$utils/files';
import { IGameSettingsConfig } from '$types/gameSettings';
import { Encoding } from '$constants/misc';
import { ErrorName } from '$utils/errors';

/* eslint-disable max-len, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-magic-numbers */
describe('#Check', () => {
  before(createMockFilesForCheck);

  describe('#Check game settings config', () => {
    it('Should return correct result object', () => {
      let result = checkGameSettingsConfigFull(readJSONFileSync(`${process.cwd()}/settings.json`));
      assert.hasAllKeys(result.data, ['baseFilesEncoding', 'gameSettingsGroups', 'gameSettingsFiles', 'gameSettingsOptions']);

      // @ts-ignore
      delete result.data.gameSettingsGroups;
      // @ts-ignore
      delete result.data.baseFilesEncoding;

      result = checkGameSettingsConfigFull(result.data);
      assert.hasAllKeys(result.data, ['gameSettingsGroups', 'baseFilesEncoding', 'gameSettingsFiles', 'gameSettingsOptions']);
    });

    it('Should return object with correct types of fields', () => {
      const result = checkGameSettingsConfigFull(readJSONFileSync(`${process.cwd()}/settings.json`));

      assert.isString(result.data.baseFilesEncoding);
      assert.isArray(result.data.gameSettingsGroups);
      assert.isArray(result.data.gameSettingsFiles);
      assert.isArray(result.data.gameSettingsOptions);
    });

    it('Should return object with default values', () => {
      const obj = readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`);

      // @ts-ignore
      delete obj.baseFilesEncoding;
      obj.gameSettingsGroups![0].name = 'new';
      // @ts-ignore
      delete obj.gameSettingsGroups[0].label;

      const result = checkGameSettingsConfigFull(obj);

      assert.equal(result.data.baseFilesEncoding, Encoding.WIN1251);
      assert.equal(result.data.gameSettingsGroups![0].label, 'Graphic');
    });

    it('Should return no errors', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };

      // @ts-ignore
      delete obj.baseFilesEncoding;
      assert.containsAllKeys(checkGameSettingsConfigFull(obj).data, ['baseFilesEncoding']);

      // @ts-ignore
      delete obj.gameSettingsGroups[0].label;
      // @ts-ignore
      assert.equal(checkGameSettingsConfigFull(obj).data.gameSettingsGroups[0].label, 'qM3joLYOXUE5qD6J');

      // @ts-ignore
      delete obj.gameSettingsGroups;
      // @ts-ignore
      assert.equal(checkGameSettingsConfigFull(obj).data.gameSettingsGroups.length, 0);

      // @ts-ignore
      obj.new = '111';
      assert.doesNotHaveAnyKeys(checkGameSettingsConfigFull(obj).data, ['new']);
    });

    it('Should return an array with just the right options', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      //@ts-ignore
      obj.gameSettingsOptions[0].controllerType = 'some';
      //@ts-ignore
      obj.gameSettingsOptions[1].controllerType = 'some';

      const result = checkGameSettingsOptions(obj.gameSettingsOptions, obj.gameSettingsGroups, obj.gameSettingsFiles);
      assert.equal(result.data.length, 4);
    });
  });

  describe('#Check game settings files', () => {
    it('Should return correct result objects for game settings files', () => {
      const result = checkGameSettingsConfigFull(readJSONFileSync(`${process.cwd()}/settings.json`));

      result.data.gameSettingsFiles.forEach((file) => {
        assert.hasAllKeys(file, ['id', 'name', 'label', 'path', 'view', 'encoding']);
        assert.match(file.name, /[A-Za-z]/);
      });
    });

    it('Should return game settings files array without first file', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      obj.gameSettingsFiles[0].path = './ini/someFileName';
      const result = checkGameSettingsConfigFull(obj);
      assert.equal(result.data.gameSettingsFiles.length, 4);
    });

    it('Should return error for game settings files', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };

      obj.gameSettingsFiles[0].path = './ini/someFileName';
      let result = checkGameSettingsConfigFull(obj);
      assert.notEqual(result.data.gameSettingsFiles[0].name, 'someFileName');
      assert.match(result.errors[0].message, /because path variable is not correct or not available/);

      obj.gameSettingsFiles[1].view = 'some';
      result = checkGameSettingsConfigFull(obj);
      assert.match(result.errors[0].message, /"gameSettingsFiles\[1\].view" must be one of \[sectional, line, tag\]/);
    });
  });

  describe('#Check game settings options', () => {
    it('Should return correct result object', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      const result = checkGameSettingsOptions(obj.gameSettingsOptions, obj.gameSettingsGroups, obj.gameSettingsFiles);

      result.data.forEach((option) => {
        assert.containsAllKeys(option, ['id', 'optionType', 'file', 'label', 'description', 'settingGroup', 'items']);
      });
    });

    it('Should return correct data from default option', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      const result = checkGameSettingsOptions(obj.gameSettingsOptions, obj.gameSettingsGroups, obj.gameSettingsFiles);

      assert.hasAllKeys(result.data[0], ['id', 'optionType', 'file', 'label', 'description', 'settingGroup', 'items', 'controllerType', 'max', 'min', 'step']);
      assert.hasAllKeys(result.data[1], ['id', 'optionType', 'file', 'label', 'description', 'settingGroup', 'items', 'controllerType', 'selectOptions', 'selectOptionsValueString']);
      assert.hasAllKeys(result.data[2], ['id', 'optionType', 'file', 'label', 'description', 'settingGroup', 'items', 'controllerType']);
      assert.equal(result.data[0].optionType, 'default');
      assert.equal(result.data[1].label, 'Any new label');
      assert.isNumber(result.data[0].max);
    });

    it('Should return correct data from default option item', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      const result = checkGameSettingsOptions(obj.gameSettingsOptions, obj.gameSettingsGroups, obj.gameSettingsFiles);

      assert.equal(result.data[0].items.length, 1);
      assert.hasAllKeys(result.data[0].items[0], ['id', 'name']);
      assert.hasAllKeys(result.data[1].items[0], ['id', 'name', 'iniGroup']);
      assert.hasAllKeys(result.data[2].items[0], ['id', 'name', 'valueAttribute', 'valuePath']);
    });

    it('Should return correct data from group option', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      const result = checkGameSettingsOptions(obj.gameSettingsOptions, obj.gameSettingsGroups, obj.gameSettingsFiles);

      assert.equal(result.data[5].optionType, 'group');
      assert.hasAllKeys(result.data[5], ['id', 'optionType', 'file', 'label', 'description', 'settingGroup', 'items', 'controllerType', 'max', 'min', 'step']);
      assert.isNumber(result.data[5].max);
    });

    it('Should return correct data from group option item', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      const result = checkGameSettingsOptions(obj.gameSettingsOptions, obj.gameSettingsGroups, obj.gameSettingsFiles);

      assert.equal(result.data[5].items.length, 2);

      result.data[5].items.forEach((item) => {
        assert.hasAllKeys(item, ['id', 'name', 'valueAttribute', 'valuePath']);
      });
    });

    it('Should return correct data from related option', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      const result = checkGameSettingsOptions(obj.gameSettingsOptions, obj.gameSettingsGroups, obj.gameSettingsFiles);

      assert.equal(result.data[4].optionType, 'related');
      assert.hasAllKeys(result.data[4], ['id', 'optionType', 'file', 'label', 'description', 'settingGroup', 'items']);
    });

    it('Should return correct data from related option item', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      const result = checkGameSettingsOptions(obj.gameSettingsOptions, obj.gameSettingsGroups, obj.gameSettingsFiles);

      assert.equal(result.data[4].items.length, 2);

      result.data[4].items.forEach((item) => {
        assert.hasAllKeys(item, ['id', 'name', 'controllerType', 'selectOptions', 'selectOptionsValueString']);
      });
    });

    it('Should return correct data from combined option', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      const result = checkGameSettingsOptions(obj.gameSettingsOptions, obj.gameSettingsGroups, obj.gameSettingsFiles);

      assert.equal(result.data[3].optionType, 'combined');
      assert.hasAllKeys(result.data[3], ['id', 'optionType', 'file', 'label', 'description', 'settingGroup', 'items', 'controllerType', 'selectOptions', 'selectOptionsValueString', 'separator']);
    });

    it('Should return correct data from combined option item', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      const result = checkGameSettingsOptions(obj.gameSettingsOptions, obj.gameSettingsGroups, obj.gameSettingsFiles);

      assert.equal(result.data[3].items.length, 2);

      result.data[3].items.forEach((item) => {
        assert.hasAllKeys(item, ['id', 'name', 'iniGroup']);
      });
    });

    it('Should return option type validation error for option', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      //@ts-ignore
      obj.gameSettingsOptions[0].optionType = 'some';

      let result = checkGameSettingsOptions(obj.gameSettingsOptions, obj.gameSettingsGroups, obj.gameSettingsFiles);
      assert.equal(result.errors[0].name, ErrorName.VALIDATION);
      assert.match(result.errors[0].details[0].message, /gameSettingsOptions\[0\]/);
      assert.match(result.errors[0].details[0].message, /\[default, group, related, combined\]/);

      //@ts-ignore
      obj.gameSettingsOptions[0].optionType = 5;
      result = checkGameSettingsOptions(obj.gameSettingsOptions, obj.gameSettingsGroups, obj.gameSettingsFiles);
      assert.match(result.errors[0].details[1].message, /must be a string/);

      //@ts-ignore
      obj.gameSettingsOptions[0].optionType = undefined;
      result = checkGameSettingsOptions(obj.gameSettingsOptions, obj.gameSettingsGroups, obj.gameSettingsFiles);
      assert.match(result.errors[0].details[0].message, /is required/);
    });

    it('Should return controller type validation error for option', () => {
      const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
      //@ts-ignore
      obj.gameSettingsOptions[0].controllerType = 'some';

      const result = checkGameSettingsOptions(obj.gameSettingsOptions, obj.gameSettingsGroups, obj.gameSettingsFiles);
      assert.equal(result.errors[0].name, ErrorName.VALIDATION);
      assert.match(result.errors[0].details[0].message, /gameSettingsOptions\[0\]/);
      assert.match(result.errors[0].details[0].message, /\[checkbox, range, select, switcher\]/);
    });
  });
});
