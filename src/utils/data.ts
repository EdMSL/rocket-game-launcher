import { screen } from 'electron';
import si from 'systeminformation';

import { UsedFileView } from '$constants/misc';
import { IIniObj, IXmlObj } from './files';
import {
  LogMessageType, writeToLogFile, writeToLogFileSync,
} from './log';
import { CreateUserMessage } from './message';
import { getLineIniParameterValue } from './strings';
import {
  IGameSettingsItemParameter,
  IGameSettingsParameter,
  IGameSettingsRootState,
  IUsedFile,
} from '$types/gameSettings';
import { IUserMessage } from '$types/main';
import { ISelectOption } from '$components/UI/Select';

const ONE_GB = 1073741824;
const SYMBOLS_TO_TYPE = 8;

/**
 * Получить информацию о доступных дисплеях и записать их в файл лога.
*/
export const getDisplaysInfo = (): void => {
  const mainDisplay = screen.getPrimaryDisplay();
  const displays = screen.getAllDisplays();

  let result = `Main display info. Resolution: ${mainDisplay.size.width}x${mainDisplay.size.height}, Work Area: ${mainDisplay.workArea.width}x${mainDisplay.workArea.height}, Work Area Size: ${mainDisplay.workAreaSize.width}x${mainDisplay.workAreaSize.height}, Scale: ${mainDisplay.scaleFactor}`; //eslint-disable-line max-len

  if (displays.length > 1) {
    result += '\r\n  All displays:';

    displays.forEach((display, index) => {
      result += `\r\n  ${index}: Resolution: ${display.size.width}x${display.size.height}, Work Area: ${display.workArea.width}x${display.workArea.height}, Work Area Size: ${display.workAreaSize.width}x${display.workAreaSize.height}, Scale: ${mainDisplay.scaleFactor}`; //eslint-disable-line max-len
    });
  }

  writeToLogFileSync(result);
};

/**
 * Получить ифнормацию о системе и записать в файл лога.
*/
export const getSystemInfo = async (): Promise<void> => {
  try {
    const systemData = await si.get({
      cpu: 'manufacturer, brand, speed',
      osInfo: 'distro, arch',
      graphics: 'controllers',
      mem: 'total',
    });

    let result = `System info.\r\n  OS: ${systemData.osInfo.distro}, ${systemData.osInfo.arch}.\r\n  CPU: ${systemData.cpu.manufacturer} ${systemData.cpu.brand}, ${systemData.cpu.speed}GHz.\r\n  Memory: ${(systemData.mem.total / ONE_GB).toFixed(2)}Gb.`; //eslint-disable-line max-len

    if (systemData.graphics.controllers.length > 1) {
      result += '\r\n  Graphic cards:';

      systemData.graphics.controllers.forEach((element, index) => {
        result += `\r\n  ${index}: ${element.vendor} ${element.model} ${element.vram}Mb.`; //eslint-disable-line max-len
      });
    } else {
      result += `\r\n  Graphics: ${systemData.graphics.controllers[0].vendor} ${systemData.graphics.controllers[0].model} ${systemData.graphics.controllers[0].vram}Mb.`; //eslint-disable-line max-len
    }

    writeToLogFile(result);
  } catch (error: any) {
    writeToLogFile(error.message, LogMessageType.ERROR);
  }
};

/**
 * Получить тип у элемента. В отличие от `typeof` разделяет `array` и `oject`.
 * @param element Элемент, для которого нужно определить тип.
 * @returns Строка с типом элемента.
*/
export const getTypeOfElement = (element: unknown): string => {
  const getElementType = {}.toString;
  const elementType = getElementType.call(element).slice(SYMBOLS_TO_TYPE, -1);
  return elementType;
};

export interface IGeneratedGameSettingsParam {
  optionName: string,
  optionValue: string,
  optionErrors: IUserMessage[],
}

export const isIGameSettingsItemParameter = (
  parameter: IGameSettingsParameter | IGameSettingsItemParameter,
): parameter is IGameSettingsItemParameter => parameter.attributePath !== undefined && parameter.attributeName !== undefined;

/**
 * Сгенерировать имя игровой опции на основе параметра, который является основой для опции
 * @param parameter Параметр-основа для игровой опции.
*/
export const getOptionName = (
  parameter: IGameSettingsParameter|IGameSettingsItemParameter,
): string => {
  if (isIGameSettingsItemParameter(parameter)) {
    return `${parameter.attributePath}/${parameter.name}/${parameter.attributeName}`;
  }

  if (parameter.iniGroup) {
    return `${parameter.iniGroup}/${parameter.name}`;
  }

  return parameter.name!;
};

/**
 * Генерирует объект с полями, необходимыми для создания
 * объекта игровой опции для записи в state.
 * @param currentFileData Данные из файла, которые используются в опции.
 * @param currentGameSettingParameter Объект параметра, на основе которого создается опция.
 * @param fileView Вид структуры файла.
 * @param gameSettingsFileName Имя, используемой в settings.json для данного файла.
 * @param baseFileName Полное базовое имя файла.
 * @param moProfileName Профиль МО.
*/
export const getOptionData = (
  currentFileData: IIniObj|IXmlObj,
  currentGameSettingParameter: IGameSettingsParameter|IGameSettingsItemParameter,
  fileView: string,
  gameSettingsFileName: string,
  baseFileName: string,
  moProfileName = '',
): IGeneratedGameSettingsParam => {
  const optionErrors: IUserMessage[] = [];
  let optionName;
  let optionSettingGroup;
  let optionValue = '';

  if (fileView === UsedFileView.SECTIONAL) {
    optionSettingGroup = currentFileData.getSection(currentGameSettingParameter.iniGroup);

    if (!optionSettingGroup) {
      optionErrors.push(CreateUserMessage.warning(
        `Файл ${baseFileName} ${moProfileName ? `из профиля ${moProfileName}` : ''} не содержит группы параметров "${currentGameSettingParameter.iniGroup}", указанной в параметре ${currentGameSettingParameter.name} из ${gameSettingsFileName}`, //eslint-disable-line max-len
      ));
    } else {
      const parameterLine = optionSettingGroup.getLine(currentGameSettingParameter.name);

      if (parameterLine) {
        optionName = `${optionSettingGroup.name}/${parameterLine.key}`;
        optionValue = parameterLine.value;
      } else {
        optionErrors.push(CreateUserMessage.warning(
          `Файл ${baseFileName} ${moProfileName ? `из профиля ${moProfileName}` : ''} из группы "${currentGameSettingParameter.iniGroup}" не содержит параметра "${currentGameSettingParameter.name}", указанного в ${gameSettingsFileName}`, //eslint-disable-line max-len
        ));
      }
    }
  } else if (fileView === UsedFileView.LINE) {
    currentFileData.globals.lines.some((line) => {
      optionValue = getLineIniParameterValue(line.text, currentGameSettingParameter.name!);

      if (optionValue) {
        optionName = currentGameSettingParameter.name;
      }

      return Boolean(optionValue);
    });

    if (!optionName) {
      optionErrors.push(CreateUserMessage.warning(
        `Файл ${baseFileName} ${moProfileName ? `из профиля ${moProfileName}` : ''} не содержит параметра "${currentGameSettingParameter.name}", указанного в ${gameSettingsFileName}`, //eslint-disable-line max-len
      ));
    }
  } else if (fileView === UsedFileView.TAG) {
    const pathArr = [
      ...currentGameSettingParameter.attributePath!?.split('/'),
      currentGameSettingParameter.name,
      currentGameSettingParameter.attributeName,
    ];

    let index = 0;
    const getProp = (obj, key): void => {
      index += 1;

      if (typeof obj[key] === 'object') {
        getProp(obj[key], pathArr[index]);
      } else if (key === currentGameSettingParameter.attributeName) {
        optionName = pathArr.join('/');
        optionValue = obj[currentGameSettingParameter.attributeName!];
      }
    };

    getProp(currentFileData, pathArr[index]);

    if (!optionName || !optionValue) {
      optionErrors.push(CreateUserMessage.warning(
        `Файл ${baseFileName} ${moProfileName ? `из профиля ${moProfileName}` : ''} не содержит параметра "${currentGameSettingParameter.name}", указанного в ${gameSettingsFileName}, либо допущена ошибка в пути к параметру.`, //eslint-disable-line max-len
      ));
    }
  }

  return {
    optionName,
    optionValue,
    optionErrors,
  };
};

/**
 * Генерирует опции (`options`) для UI компонента `Select`.
 * @param obj Объект или массив строк, на основе которых будет сгенерирован список опций.
 * @returns Массив с опциями.
*/
export const generateSelectOptions = (
  obj: { [key: string]: string, } | string[],
): ISelectOption[] => {
  if (Array.isArray(obj)) {
    return obj.map((key) => ({
      label: key,
      value: key,
    }));
  }

  return Object.keys(obj).map((key) => ({
    label: obj[key],
    value: key,
  }));
};

/**
 * Получает список параметров для вывода в виде опций. Если есть `settingGroups`,
 * то фильтрует по текущей группе.
 * @param usedFile Объект текущего обрабатываемого файла из `state`.
 * @param gameSettingGroups Список доступных групп настроек из `state`.
 * @param currentGameSettingGroup текущая группа настроек.
 * @returns Массив с параметрами для генерации игровый опций.
*/
export const getParametersForOptionsGenerate = (
  usedFile: IUsedFile,
  gameSettingGroups: IGameSettingsRootState['settingGroups'],
  currentGameSettingGroup: string,
): IGameSettingsParameter[] => {
  if (gameSettingGroups.length > 0 && currentGameSettingGroup) {
    return usedFile.parameters.filter(
      (currentParameter) => currentParameter.settingGroup === currentGameSettingGroup,
    );
  }

  return usedFile.parameters;
};
