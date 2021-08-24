import { assert } from 'chai';

import { checkGameSettingsConfigMainFields, checkUsedFiles } from '$utils/check';
import { createMockFilesForCheck } from './fixtures/getFiles';
import { readJSONFileSync } from '$utils/files';
import { IGameSettingsConfig, IUsedFiles } from '$types/gameSettings';
import { Encoding } from '$constants/misc';

/* eslint-disable max-len, @typescript-eslint/ban-ts-comment */
describe('#Check', () => {
  before(createMockFilesForCheck);

  // describe('#Check game settings config', () => {
  //   it('Should return correct result object', () => {
  //     let result = checkGameSettingsConfigMainFields(readJSONFileSync(`${process.cwd()}/settings.json`));

  //     assert.hasAllKeys(result, ['newUserMessages', 'newSettingsConfigObj']);

  //     delete result.newSettingsConfigObj.settingGroups;
  //     delete result.newSettingsConfigObj.baseFilesEncoding;

  //     result = checkGameSettingsConfigMainFields(result.newSettingsConfigObj);
  //     assert.doesNotHaveAnyKeys(result.newSettingsConfigObj, ['settingGroups']);
  //   });

  //   it('Should return object with default values', () => {
  //     const obj = readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`);

  //     delete obj.baseFilesEncoding;
  //     obj.settingGroups![0].name = 'new';
  //     // @ts-ignore
  //     delete obj.settingGroups[0].label;

  //     const result = checkGameSettingsConfigMainFields(obj);

  //     assert.equal(result.newSettingsConfigObj.baseFilesEncoding, Encoding.WIN1251);
  //     assert.equal(result.newSettingsConfigObj.settingGroups![0].label, 'new');
  //   });

  //   it('Should return no error messages array', () => {
  //     const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };
  //     assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 0);

  //     delete obj.baseFilesEncoding;
  //     assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 0);

  //     assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 0);

  //     // @ts-ignore
  //     delete obj.settingGroups[0].label;
  //     assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 0);

  //     delete obj.settingGroups;
  //     assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 0);

  //     // @ts-ignore
  //     obj.new = '111';
  //     assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 0);
  //   });

  //   it('Should return array with error message', () => {
  //   // Чтобы не считывать постоянно данные из реального файла, это делается один раз в before хуке, а затем клонируем объект данных из мокового файла.
  //     const obj = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`) };

  //     // @ts-ignore
  //     delete obj.usedFiles;
  //     assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 1);

  //     obj.usedFiles = {};
  //     // @ts-ignore
  //     obj.usedFiles.Some = {};

  //     // @ts-ignore
  //     obj.settingGroups = '';
  //     assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 1);

  //     obj.settingGroups = [{
  //       name: 'Some',
  //       label: 'name',
  //     }];

  //     // @ts-ignore
  //     delete obj.settingGroups[0].name;
  //     assert.equal(checkGameSettingsConfigMainFields(obj).newUserMessages.length, 1);
  //   });
  // });

  describe('#Check game used files', () => {
    // it('Should return correct result object', () => {
    //   const result = checkUsedFiles(readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`).usedFiles, Encoding.WIN1251, true);

    //   assert.hasAllKeys(result, ['newUserMessages', 'newUsedFilesObj']);
    // });

    // it('Should return correct data for used files main fields', () => {
    //   const obj = readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`);
    //   const result = checkUsedFiles(obj.usedFiles, Encoding.WIN1251, true);

    //   assert.equal(result.newUsedFilesObj.anyFile.encoding, Encoding.WIN1251);
    // });

    // it('Should return correct data in parameters', () => {
    //   const obj = readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`);
    //   const result = checkUsedFiles(obj.usedFiles, Encoding.WIN1251, true);

    //   assert.containsAllKeys(result.newUsedFilesObj.anyFile.parameters[0], ['name', 'iniGroup', 'settingGroup', 'type', 'label']);
    //   assert.equal(result.newUsedFilesObj.anyFile.parameters[1].label, 'Any new name');
    //   assert.isNumber(result.newUsedFilesObj.anyFile.parameters[0].max);
    // });

    it('Should return array witn error message', () => {
      const usedFiles = { ...readJSONFileSync<IGameSettingsConfig>(`${process.cwd()}/settings.json`).usedFiles };
      //@ts-ignore
      delete usedFiles.anyFile.parameters[0].name;
      assert.equal(checkUsedFiles(usedFiles, Encoding.WIN1251, true).newUserMessages.length, 1);

      usedFiles.anyFile.parameters[0].name = 'Any name';

      usedFiles.someFile.parameters[0].type = 'Incorrect type';
      assert.equal(checkUsedFiles(usedFiles, Encoding.WIN1251, true).newUserMessages.length, 1);

      usedFiles.someFile.parameters[0].type = 'select';

      usedFiles.someFile.parameters[0].iniGroup = 'Not needed group';
      assert.equal(checkUsedFiles(usedFiles, Encoding.WIN1251, true).newUserMessages.length, 1);

      //@ts-ignore
      delete usedFiles.someFile.parameters[0].iniGroup;
    });
  });
});
