import { screen } from 'electron';
import si from 'systeminformation';
import path from 'path';

import {
  PathRegExp,
  PathVariableName,
  GameSettingsFileView,
  GameSettingsOptionType,
  GameSettingControllerType,
} from '$constants/misc';
import {
  LogMessageType,
  writeToLogFile,
  writeToLogFileSync,
} from './log';
import { CreateUserMessage } from './message';
import {
  checkIsPathIsNotOutsideValidFolder,
  clearPathVaribaleFromPathString,
  generateSelectOptionsString,
  getLineIniParameterValue,
  getParameterRegExp,
  getPathToFile,
  getRandomId,
  getRandomName,
  replacePathVariableByRootDir,
} from './strings';
import {
  IGameSettingsItemParameter,
  IGameSettingsParameter,
  IGameSettingsRootState,
  IGameSettingsOptions,
  IGameSettingsOptionsItem,
  IGameSettingsFile,
  IGameSettingsGroup,
  IGameSettingsParameterBase,
} from '$types/gameSettings';
import {
  DefaultPathVariable,
  GAME_DIR,
  IModOrganizerPathVariables,
  IPathVariables,
} from '$constants/paths';
import {
  ILauncherConfig,
  ILauncherCustomButton,
  IModOrganizerParams,
} from '$types/main';
import {
  defaultFullGameSettingsParameter,
  defaultGameSettingsParameterItem,
  defaultModOrganizerParams,
} from '$constants/defaultData';
import { getReadWriteError } from './errors';
import {
  IUserMessage,
  IGetDataFromFilesResult, IIniObj, IValidationErrors, IXmlObj, ISelectOption,
} from '$types/common';

const ONE_GB = 1073741824;
const SYMBOLS_TO_TYPE = 8;

export const isDataFromIniFile = (
  fileView: string,
  obj: IIniObj|IXmlObj,
): obj is IIniObj => fileView === GameSettingsFileView.LINE || fileView === GameSettingsFileView.SECTIONAL;

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
    ///TODO Неверно определяет архитектуру
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

/**
 * Сгенерировать имя игровой опции на основе параметра, который является основой для опции
 * @param parameter Параметр-основа для игровой опции.
*/
export const getOptionName = (
  parameter: IGameSettingsParameter|IGameSettingsItemParameter,
): string => {
  if (parameter.valueName) {
    return `${parameter.valuePath ? `${parameter.valuePath}/` : ''}${parameter.name}/${parameter.valueName}`; //eslint-disable-line max-len
  }

  if (parameter.iniGroup) {
    return `${parameter.iniGroup}/${parameter.name}`;
  }

  return parameter.name!;
};

/**
 *
 * @param option Имя опции.
 * @param parameterId Id параметра опции.
 * @returns Id опции.
 */
export const getOptionNameAndId = (
  option: IGameSettingsParameter|IGameSettingsItemParameter,
): { name: string, id: string, } => {
  const name = getOptionName(option);
  const id = `${option.id}:${name}`;

  return { id, name };
};

/**
 * Получить файл игровых настроек из `state` по его имени.
 * @param gameSettingsFiles Массив файлов.
 * @param fileName Имя файла, который ищем.
 * @returns Объект файла.
 */
export const getFileByFileName = (
  gameSettingsFiles: IGameSettingsFile[],
  fileName: string,
): IGameSettingsFile|undefined => gameSettingsFiles.find((currFile) => currFile.name === fileName);

/**
 * Глубокое клонирование объекта.
 * @param obj Объект для клонирования.
 * @param deleteKey Ключ объекта, который нужно удалить при клонировании.
 * @returns Клон переданного объекта.
 */
export const deepClone = (obj, deleteKey = '') => {
  const clone = { ...obj };

  Object.keys(clone).forEach(
    (key) => {
      if (typeof obj[key] === 'object') {
        clone[key] = deepClone(obj[key], deleteKey);
      } else if (key === deleteKey) {
        delete clone[deleteKey];
      } else {
        clone[key] = obj[key];
      }
    },
  );

  if (Array.isArray(obj) && obj.length) {
    clone.length = obj.length;

    return Array.from(clone);
  }

  if (Array.isArray(obj)) {
    return Array.from(obj);
  }

  return clone;
};

export const getValueFromObjectDeepKey = <T>(lib, keys): T => {
  const key = keys.shift();

  return keys.length ? getValueFromObjectDeepKey(lib[key], keys) : lib[key];
};

export const setValueForObjectDeepKey = (lib, keys, newValue): void => {
  const key = keys.shift();

  if (keys.length) {
    setValueForObjectDeepKey(lib[key], keys, newValue);
  } else {
    lib[key] = newValue; //eslint-disable-line no-param-reassign
  }
};

/**
 * Генерирует объект с полями, необходимыми для создания
 * объекта игровой опции для записи в state.
 * @param currentFileData Данные из файла, которые используются в опции.
 * @param currentGameSettingParameter Объект параметра, на основе которого создается опция.
 * @param currentGameSettingsFile Объект файла, используемого параметром.
 * @param moProfileName Профиль МО.
*/
export const getOptionData = (
  currentFileData: IIniObj|IXmlObj,
  currentGameSettingParameter: IGameSettingsParameter|IGameSettingsItemParameter,
  currentGameSettingsFile: IGameSettingsFile,
  moProfileName = '',
): IGeneratedGameSettingsParam => {
  const optionErrors: IUserMessage[] = [];
  const baseFileName = path.basename(currentGameSettingsFile.path);

  let optionName;
  let optionSettingGroup;
  let optionValue = '';

  if (currentGameSettingsFile.view === GameSettingsFileView.SECTIONAL) {
    optionSettingGroup = currentFileData.getSection(currentGameSettingParameter.iniGroup);

    if (!optionSettingGroup) {
      optionErrors.push(CreateUserMessage.warning(
        `The ${baseFileName} file${moProfileName ? ` from the "${moProfileName}" profile` : ''} does not contain the "${currentGameSettingParameter.iniGroup}" group specified in ${currentGameSettingParameter.name} from "${currentGameSettingsFile.label}"`, //eslint-disable-line max-len
      ));
    } else {
      const parameterLine = optionSettingGroup.getLine(currentGameSettingParameter.name);

      if (parameterLine) {
        optionName = `${optionSettingGroup.name}/${parameterLine.key}`;
        optionValue = parameterLine.value;
      } else {
        optionErrors.push(CreateUserMessage.warning(
          `The "${currentGameSettingParameter.iniGroup}" group from the ${baseFileName} file${moProfileName ? ` from the "${moProfileName}" profile` : ''} does not contain the "${currentGameSettingParameter.name}" parameter specified in "${currentGameSettingsFile.label}"`, //eslint-disable-line max-len
        ));
      }
    }
  } else if (currentGameSettingsFile.view === GameSettingsFileView.LINE) {
    currentFileData.globals.lines.some((line) => {
      const searchRegexp = getParameterRegExp(currentGameSettingParameter.name!.trim());

      optionValue = getLineIniParameterValue(line.text, searchRegexp);

      if (optionValue) {
        optionName = currentGameSettingParameter.name;
      }

      return Boolean(optionValue);
    });

    if (!optionName) {
      optionErrors.push(CreateUserMessage.warning(
        `The ${baseFileName} file${moProfileName ? ` from the "${moProfileName}" profile` : ''} does not contain the "${currentGameSettingParameter.name}" parameter, specified in "${currentGameSettingsFile.label}"`, //eslint-disable-line max-len
      ));
    }
  } else if (currentGameSettingsFile.view === GameSettingsFileView.TAG) {
    const valuePathArr = [...currentGameSettingParameter.valuePath!?.split('/')];
    const pathArr = [
      ...valuePathArr,
      currentGameSettingParameter.name!,
      currentGameSettingParameter.valueName!,
    ];

    let index = 0;
    const getProp = (obj, key): void => {
      index += 1;

      if (typeof obj[key] === 'object') {
        getProp(obj[key], pathArr[index]);
      } else if (key === currentGameSettingParameter.valueName) {
        optionName = pathArr.join('/');
        optionValue = obj[currentGameSettingParameter.valueName!];
      }
    };

    getProp(currentFileData, pathArr[index]);

    if (!optionName || !optionValue) {
      let errorMsg = '';
      if (index === pathArr.length) {
        errorMsg = `The ${baseFileName} file${moProfileName ? ` from the "${moProfileName}" profile` : ''} does not contain "${currentGameSettingParameter.valueName}" attribute in "${currentGameSettingParameter.name}" parameter specified in "${currentGameSettingsFile.label}".`; //eslint-disable-line max-len
      } else if (index === pathArr.length - 1) {
        errorMsg = `The ${baseFileName} file${moProfileName ? ` from the "${moProfileName}" profile` : ''} does not contain "${currentGameSettingParameter.name}" parameter specified in "${currentGameSettingsFile.label}".`; //eslint-disable-line max-len
      } else {
        errorMsg = `The ${baseFileName} file${moProfileName ? ` from the "${moProfileName}" profile` : ''} does not contain "${pathArr[index - 1]}" tag specified in "valuePath" in "${currentGameSettingsFile.label}".`; //eslint-disable-line max-len
      }
      optionErrors.push(CreateUserMessage.warning(errorMsg));
    }
  }

  return {
    optionName,
    optionValue,
    optionErrors,
  };
};

export const generateGameSettingsOptions = (
  gameSettingsParameters: IGameSettingsParameter[],
  gameSettingsFiles: IGameSettingsFile[],
  currentFilesDataObj: IGetDataFromFilesResult,
  moProfile: string,
): { data: IGameSettingsOptions, errors: IUserMessage[], parametersWithError: string[], } => {
  let errors: IUserMessage[] = [];
  let parametersWithError: string[] = [];

  const data = gameSettingsParameters.reduce<IGameSettingsOptions>(
    (gameSettingsOptions, currentParameter, index) => {
      const incorrectIndexes: number[] = [];
      const currentGameSettingsFile: IGameSettingsFile = getFileByFileName(gameSettingsFiles, currentParameter.file)!;
      //Если опция с типом group, combined или related,
      // то генерация производится для каждого параметра в items.
      if (
        currentParameter.optionType === GameSettingsOptionType.RELATED
        || currentParameter.optionType === GameSettingsOptionType.GROUP
        || currentParameter.optionType === GameSettingsOptionType.COMBINED
      ) {
        let specParamsErrors: IUserMessage[] = [];

        const optionsFromParameter = currentParameter.items!.reduce<IGameSettingsOptions>(
          (options, currentOption) => {
            const {
              optionName, optionValue, optionErrors,
            } = getOptionData(
              currentFilesDataObj[currentParameter.file],
              currentOption,
              currentGameSettingsFile,
              moProfile,
            );

            if (optionErrors.length > 0) {
              specParamsErrors = [...optionErrors];
              incorrectIndexes.push(index);

              return { ...options };
            }

            return {
              ...options,
              [getOptionNameAndId(currentOption).id]: {
                default: optionValue,
                value: optionValue,
                name: optionName,
                parameter: currentParameter.id,
                file: currentParameter.file,
              },
            };
          },
          {},
        );

        if (specParamsErrors.length > 0) {
          errors = [...errors, ...specParamsErrors];
          parametersWithError.push(currentParameter.id);

          return { ...gameSettingsOptions };
        }

        return {
          ...gameSettingsOptions,
          ...optionsFromParameter,
        };
      }

      const {
        optionName, optionValue, optionErrors,
      } = getOptionData(
        currentFilesDataObj[currentGameSettingsFile!.name],
        currentParameter,
        currentGameSettingsFile,
        moProfile,
      );

      if (optionErrors.length > 0) {
        errors = [...errors, ...optionErrors];
        incorrectIndexes.push(index);
        parametersWithError.push(currentParameter.id);

        return { ...gameSettingsOptions };
      }

      return {
        ...gameSettingsOptions,
        [getOptionNameAndId(currentParameter).id]: {
          default: optionValue,
          name: optionName,
          value: optionValue,
          parameter: currentParameter.id,
          file: currentParameter.file,
        },
      };
    },
    {},
  );

  parametersWithError = Array.from(new Set(parametersWithError));

  return {
    data, errors, parametersWithError,
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
    label: key,
    value: obj[key],
  }));
};

/**
 *
 * @param gameSettingsFiles Игровые файлы из `state`.
 * @returns Массив имен игровых файлов.
 */
export const getGameSettingsFilesNames = (
  gameSettingsFiles: IGameSettingsFile[],
): string[] => gameSettingsFiles.map((file) => file.name);

/**
 *
 * @param gameSettingsGroups Группы игровых настроек из `state`.
 * @returns Массив имен групп.
 */
export const getGameSettingsGroupsNames = (
  gameSettingsGroups: IGameSettingsGroup[],
): string[] => gameSettingsGroups.map((group) => group.name);

/**
 * Получает список параметров для вывода в виде опций. Если есть `gameSettingsGroups`,
 * то фильтрует по текущей группе.
 * @param gameSettingsParameters Список параметров из `state`.
 * @param gameSettingsGroups Список доступных групп настроек из `state`.
 * @param gameSettingsFiles Список файлов из `state`.
 * @param currentGameSettingGroup текущая группа настроек.
 * @returns Массив с параметрами для генерации игровый опций.
*/
export const getParametersForOptionsGenerate = (
  gameSettingsParameters: IGameSettingsRootState['gameSettingsParameters'],
  gameSettingsGroups: IGameSettingsRootState['gameSettingsGroups'],
  gameSettingsFiles: IGameSettingsRootState['gameSettingsFiles'],
  currentGameSettingGroup: string,
): IGameSettingsParameter[] => {
  const availableFiles = getGameSettingsFilesNames(gameSettingsFiles);
  let currentParameters = [...gameSettingsParameters];

  currentParameters = currentParameters.filter((parameter) => availableFiles.includes(parameter.file));

  if (gameSettingsGroups.length > 0 && currentGameSettingGroup) {
    return currentParameters.filter(
      (currentParameter) => currentParameter.settingGroup === currentGameSettingGroup,
    );
  }

  return currentParameters;
};

/**
 * Генерирует игровую опцию для `gameSettingsOptions` из `state` с новым значением `value`.
 * @param currentOption Опция для изменения.
 * @param newValue Новое значение `value` для опции.
 * @returns Объект опции.
*/
export const generateNewGameSettingsOption = (
  currentOption: IGameSettingsOptionsItem,
  newValue: string|number,
): IGameSettingsOptionsItem => ({
  ...currentOption,
  value: String(newValue),
});

/**
 * Получить опции игровых настроек, которые были изменены пользователем.
 * @param gameSettingsOptions Игровые опции из `state`.
*/
export const getChangedGameSettingsOptions = (
  gameSettingsOptions: IGameSettingsOptions,
): IGameSettingsOptions => Object.keys(gameSettingsOptions)
  .reduce<IGameSettingsOptions>((totalOptions, optionName) => {
    const parameter = gameSettingsOptions[optionName];

    if (parameter.value !== parameter.default) {
      return {
        ...totalOptions,
        [optionName]: {
          ...gameSettingsOptions[optionName],
        },
      };
    }

    return {
      ...totalOptions,
    };
  }, {});

/**
 * Получить опции игровых настроек со стандартными значениями (последними сохраненными).
 * @param gameSettingsOptions Игровые опции из `state`.
 * @param isForDefaultValue Определяет, прописать опциям новые значения по умолчанию
 * или заменить текущие значения значениями по умолчанию.
 * @returns Объект игровых опций с новыми значениями.
*/
export const getGameSettingsOptionsWithNewValues = (
  gameSettingsOptions: IGameSettingsOptions,
  isForDefaultValue = true,
): IGameSettingsOptions => {
  const newOptionsObj = { ...gameSettingsOptions };

  const getProp = (
    obj: IGameSettingsOptions|IGameSettingsOptionsItem,
  ): void => {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'object') {
        getProp(obj[key]);
      } else if (obj.value !== obj.default && !isForDefaultValue) {
        obj.value = obj.default; //eslint-disable-line no-param-reassign
      } else if (obj.default !== obj.value && isForDefaultValue) {
        obj.default = obj.value; //eslint-disable-line no-param-reassign
      }
    });
  };

  getProp(newOptionsObj);

  return newOptionsObj;
};

/**
 * Сгенерировать имя папки для бэкапа файлов.
 * @returns Строка с именем для папки.
*/
export const getBackupFolderName = (): string => {
  const date = new Date();

  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}_${date.toTimeString().split(' ')[0].split(':').join('.')}`; // eslint-disable-line max-len
};

/**
 * Изменить строку с указанным параметром на строку с новым значением параметра.
 * Изменяет(мутирует) входные данные `iniData`.
 * @param iniData Входные данные файла, в котором находится изменяемый параметр.
 * @param sectionName Секция файла, в которой лежит изменяемый параметр.
 * @param parameterName Изменяемый параметр.
 * @param newValue Новое значение для параметра.
*/
export const changeSectionalIniParameter = (
  iniData: IIniObj,
  sectionName: string,
  parameterName: string,
  newValue: string,
): void => {
  const defaultLineText: string = iniData
    .getSection(sectionName)
    .getLine(parameterName).text;
  const spacesBefore = defaultLineText.match(/(\s*)=/gm)![0];
  const spacesAfter = defaultLineText.match(/(?<==)\s*(?<!\S)/);

  iniData
    .getSection(sectionName)
    .setValue(
      parameterName,
      newValue,
    );

  const currLineText = iniData
    .getSection(sectionName)
    .getLine(parameterName)
    .text
    .split('=')
    .join(`${spacesBefore}${spacesAfter ? spacesAfter.join('') : []}`);

  iniData //eslint-disable-line no-param-reassign
    .getSection(sectionName)
    .getLine(parameterName).text = currLineText;
};

export const getApplicationArgs = (args: string[]): string[] => args.map((arg) => {
  let newArg = arg;

  if (PathRegExp.GAME_DIR.test(arg)) {
    newArg = getPathToFile(arg, DefaultPathVariable, '');
  }

  if (/^-.+$/.test(newArg)) {
    return newArg;
  }

  return `"${newArg}"`;
});

/**
 * Получить список пользовательских тем для записи в `state`.
*/
export const getUserThemes = (themesFolders: string[]): { [key: string]: string, } => {
  const themesObjects = themesFolders.reduce((themes, theme) => {
    if (theme.toLowerCase() === 'default') {
      writeToLogFile('A theme with the name "default" was found. This theme will be unavailable.');

      return { ...themes };
    }

    return {
      ...themes,
      [theme]: theme,
    };
  }, {});

  return {
    default: '',
    ...themesObjects,
  };
};

/**
 * Получить новый объект конфигурации с изменным значением заданного поля.
 * @param currentConfig Конфиг, на основе которого создаем новый.
 * @param value Новое значение поля объекта.
 * @param fieldName Имя изменяемого поля объекта.
 * @param parent Имя родительского поля объекта, в котором располагается `fieldName`.
 * @returns Новый объект конфигурации.
*/
export const getNewConfig = <U, T>(
  currentConfig: U,
  value: T,
  fieldName: string,
  parent?: string,
): U => {
  if (parent) {
    return {
      ...currentConfig,
      [parent]: {
        ...currentConfig[parent],
        [fieldName]: value,
      },
    };
  }
  return {
    ...currentConfig,
    [fieldName]: value,
  };
};

/**
 * Получить параметры Mod Organizer c учетом данных из config.json.
 * @param data Данные из секции modOrganizer файла config.json.
 * @returns Объект с данными Mod Organizer.
*/
export const getNewModOrganizerParams = (data: IModOrganizerParams): IModOrganizerParams => {
  if (data.pathToMOFolder) {
    return {
      ...defaultModOrganizerParams,
      ...data,
      pathToMOFolder: data.pathToMOFolder,
      pathToINI:
        data.pathToINI
        || defaultModOrganizerParams.pathToINI.replace(defaultModOrganizerParams.pathToMOFolder, data.pathToMOFolder),
      pathToProfiles:
        data.pathToProfiles
        || defaultModOrganizerParams.pathToProfiles.replace(defaultModOrganizerParams.pathToMOFolder, data.pathToMOFolder),
      pathToMods:
        data.pathToMods
        || defaultModOrganizerParams.pathToMods.replace(defaultModOrganizerParams.pathToMOFolder, data.pathToMOFolder),
    };
  }

  return {
    ...defaultModOrganizerParams,
    ...data,
  };
};

const updateModOrganizerPathVariables = (
  configData: ILauncherConfig,
): IModOrganizerPathVariables => {
  const MO_DIR_BASE = configData.modOrganizer.pathToMOFolder.replace(
    PathVariableName.GAME_DIR,
    GAME_DIR,
  );

  return {
    '%MO_DIR%': MO_DIR_BASE,
    '%MO_INI%': configData.modOrganizer.pathToINI.replace(
      PathVariableName.MO_DIR,
      MO_DIR_BASE,
    ),
    '%MO_MODS%': configData.modOrganizer.pathToMods.replace(
      PathVariableName.MO_DIR,
      MO_DIR_BASE,
    ),
    '%MO_PROFILE%': configData.modOrganizer.pathToProfiles.replace(
      PathVariableName.MO_DIR,
      MO_DIR_BASE,
    ),
  };
};

/**
 * Генерация переменных путей.
 * @param configData Данные из файла config.json.
 * @param app Объект Electron.app.
 * @returns Объект с переменными путей.
*/
export const createPathVariables = (
  configData: ILauncherConfig,
  app: Electron.App,
): IPathVariables => {
  let pathVariables: IPathVariables = {
    ...DefaultPathVariable,
    '%DOCUMENTS%': app.getPath('documents'),
  };

  if (configData.documentsPath) {
    pathVariables = {
      ...pathVariables,
      '%DOCS_GAME%': configData.documentsPath.replace(
        PathVariableName.DOCUMENTS,
        pathVariables['%DOCUMENTS%'],
      ),
    };
  }

  if (configData.modOrganizer.isUsed) {
    pathVariables = {
      ...pathVariables,
      ...updateModOrganizerPathVariables(configData),
    };
  }

  return pathVariables;
};

/**
 * Обновить переменные путей.
 * @param pathVariables Текущие переменные путей.
 * @param launcherConfig Данные о конфигурации из state.
 * @returns Объект с переменными путей.
*/
export const updatePathVariables = (
  pathVariables: IPathVariables,
  launcherConfig: ILauncherConfig,
): IPathVariables => ({
  ...pathVariables,
  '%DOCS_GAME%': launcherConfig.documentsPath.replace(
    PathVariableName.DOCUMENTS,
    pathVariables['%DOCUMENTS%'],
  ),
  ...launcherConfig.modOrganizer.isUsed ? updateModOrganizerPathVariables(launcherConfig) : {},
});

/**
 * Получить данные для генерации пользовательских кнопок.
 * @param buttonsData Данные о кнопках из config.json.
 * @param pathVariables Объект с переменными путей.
 * @returns Массив объектов пользовательских кнопок.
*/
export const getCustomButtons = (
  buttonsData: ILauncherCustomButton[],
  pathVariables: IPathVariables,
  // Типы определяются неверно, после filter отсекутся все undefined,
  // но ts все равно считает, что они там есть.
  //@ts-ignore
): ILauncherCustomButton[] => buttonsData.map<ILauncherCustomButton|undefined>((btn) => {
  try {
    const pathTo = replacePathVariableByRootDir(
      btn.path,
    );

    checkIsPathIsNotOutsideValidFolder(pathTo, pathVariables);

    return btn;
  } catch (error: any) {
    const err = getReadWriteError(error);

    writeToLogFileSync(
      `Can't create custom button. "${btn.label}". ${err.message}. Path: ${btn.path}`,
      LogMessageType.WARNING,
    );

    return undefined;
  }
}).filter(Boolean);

/**
 * Получить переменную пути и остаточный путь из строки пути.
 * @param pathStr Путь для обработки.
 * @returns Массив из строк переменной и остатка пути.
*/
export const getVariableAndValueFromPath = (pathStr: string): [string, string] => {
  const pathVariable = pathStr.match(PathRegExp.PATH_VARIABLE)![0];
  const pathValue = clearPathVaribaleFromPathString(pathStr);

  return [pathVariable, pathValue];
};

/**
 * Получить ошибки валидации полей с уникальными значениями.
 * @param currentErrors Текущие ошибки валидации.
 * @param newErrorsOrForClear Ошибки валидации для добавления или для очистки.
 * @param isForAdd Очищать ошибки из списка или добавлять новые ошибки в список.
 * @returns Объект с ошибками валидации.
*/
export const getUniqueValidationErrors = (
  currentErrors: IValidationErrors,
  newErrorsOrForClear: IValidationErrors,
  isForAdd,
): IValidationErrors => {
  const newErrors = Object.keys(newErrorsOrForClear).reduce<IValidationErrors>((acc, id) => {
    if (isForAdd) {
      return {
        ...currentErrors,
        ...acc,
        [id]: Array.from(new Set([...currentErrors[id] ? currentErrors[id] : [], ...newErrorsOrForClear[id]])),
      };
    }

    if (currentErrors[id]) {
      return {
        ...currentErrors,
        ...acc,
        [id]: [...currentErrors[id].filter((currError) => !newErrorsOrForClear[id].includes(currError))],
      };
    }

    return {
      ...currentErrors,
      ...acc,
      [id]: [],
    };
  }, {});

  return Object.keys(newErrors).reduce((acc, id) => {
    if (newErrors[id].length > 0) {
      return {
        ...acc,
        [id]: newErrors[id],
      };
    }

    return {
      ...acc,
    };
  }, {});
};

/**
 *Очищает при удалении компонента все ошибки валидации, связанные этим компонентом.
 * @param validationErrors Текущие ошибки валидации.
 * @param id id удаляемого компонента.
 * @returns Ошибки валидации без ошибок, привязанных к текущему компоненту.
 */
export const clearValidationErrors = (
  validationErrors: IValidationErrors,
  id: string,
): IValidationErrors => Object.keys(validationErrors).filter((error) => !error.includes(id)).reduce((acc, current) => ({
  ...acc,
  [current]: validationErrors[current],
}), {});

/**
 * Сгенерировать новый объект файла игровых настроек.
 * @param label Загловок файла.
 * @param pathToFile Путь к файлу.
 * @returns Объект файла из `state`.
 */
export const getDefaultGameSettingsFile = (
  label: string,
  pathToFile: string,
): IGameSettingsFile => ({
  id: getRandomId('game-settings-file'),
  name: getRandomName(),
  label: label.trim().replaceAll(/\s/g, ''),
  path: pathToFile,
  view: GameSettingsFileView.SECTIONAL,
  encoding: '',
});

/**
 * Получить полный игровой параметр со всеми полями, измененными текущим параметром.
 * @param currentFullParam Текущий полный параметр.
 * @param currentParam Текущий параметр.
 * @returns Новый полный параметр с обновленными полями.
 */
export const getFullParameter = (
  currentFullParam: IGameSettingsParameter,
  currentParam: IGameSettingsParameter,
): IGameSettingsParameter => ({
  ...currentFullParam,
  ...currentParam,
  items: currentParam.items
    ? currentParam.items.map((item) => ({
      ...currentFullParam.items![0],
      ...item,
    }))
    : currentFullParam.items!.map((item) => ({
      ...item,
      id: getRandomId(),
      name: currentParam.name || item.name,
    })),
});

/**
 * Сгенерировать новый объект параметра игровых настроек типа `default`.
 * @param file Объект с данными игрового файла.
 * @param parameterBase Объект с базовыми полями любого типа параметра.
 * @returns Объект с основными полями игрового параметра.
**/
const getParameterBase = (
  file: IGameSettingsFile,
  parameterBase?: IGameSettingsParameterBase,
): IGameSettingsParameterBase => ({
  id: parameterBase?.id! || getRandomId(),
  optionType: parameterBase?.optionType || GameSettingsOptionType.DEFAULT,
  file: parameterBase?.file || file.name,
  label: parameterBase?.label || '',
  description: parameterBase?.description || '',
  ...parameterBase?.settingGroup ? { settingGroup: parameterBase.settingGroup } : {},
});

const getFieldsByFileView = (
  fullParameter: IGameSettingsParameter|IGameSettingsItemParameter,
  file: IGameSettingsFile,
) => ({
  ...file.view === GameSettingsFileView.SECTIONAL ? {
    iniGroup: fullParameter.iniGroup || defaultGameSettingsParameterItem.iniGroup,
  } : {},
  ...file.view === GameSettingsFileView.TAG ? {
    valueName: fullParameter.valueName || defaultGameSettingsParameterItem.valueName,
    valuePath: fullParameter.valuePath || defaultGameSettingsParameterItem.valuePath,
  } : {},
});
const getFieldsByControllerType = (
  fullParameter: IGameSettingsParameter|IGameSettingsItemParameter,
) => ({
  ...fullParameter.controllerType === GameSettingControllerType.SELECT ? {
    options: fullParameter.options,
  } : {},
  ...fullParameter.controllerType === GameSettingControllerType.RANGE ? {
    min: fullParameter.min,
    max: fullParameter.max,
    step: fullParameter.step,
  } : {},
});

/**
 * Сгенерировать новый объект параметра игровых настроек типа `default`.
 * @param file Объект с данными игрового файла.
 * @returns Объект параметра из `state`.
 */
export const getDefaultGameSettingsParameter = (
  file: IGameSettingsFile,
  settingGroup?: string,
): IGameSettingsParameter => ({
  ...getParameterBase(file),
  label: 'Заголовок',
  ...settingGroup ? { settingGroup } : {},
  name: '',
  ...getFieldsByFileView({} as IGameSettingsParameter, file),
  controllerType: GameSettingControllerType.CHECKBOX,
});

/**
 * Сгенерировать новый объект параметра игровых настроек типа `default`.
 * @param currentParameter Объект изменяемого параметра.
 * @param fullParameter Объект со всеми доступными полями параметра.
 * @param file Объект с данными игрового файла.
 * @returns Объект параметра из `state`.
 */
export const generateGameSettingsParameter = (
  currentParameter: IGameSettingsParameter,
  fullParameter: IGameSettingsParameter,
  file: IGameSettingsFile,
): { newParameter: IGameSettingsParameter, newFullParameter: IGameSettingsParameter, } => {
  const newFullParameter: IGameSettingsParameter = getFullParameter(
    fullParameter,
    currentParameter,
  );

  let newParameter: IGameSettingsParameter = getParameterBase(file, newFullParameter);

  switch (currentParameter.optionType) {
    case GameSettingsOptionType.DEFAULT:
      newParameter = {
        ...newParameter,
        name: newFullParameter.name,
        ...getFieldsByFileView(newFullParameter, file),
        controllerType: newFullParameter.controllerType,
        ...getFieldsByControllerType(newFullParameter),
      };
      break;
    case GameSettingsOptionType.COMBINED:
      newParameter = {
        ...newParameter,
        controllerType: GameSettingControllerType.SELECT,
        separator: newFullParameter.separator,
        options: newFullParameter.options,
        items: newFullParameter.items?.map((item, index): IGameSettingsItemParameter => ({
          id: item.id,
          name: item.name,
          ...getFieldsByFileView(newFullParameter.items![index], file),
        })),
      };
      break;
    case GameSettingsOptionType.RELATED:
      newParameter = {
        ...newParameter,
        items: newFullParameter.items?.map((item, index): IGameSettingsItemParameter => ({
          id: item.id,
          name: item.name,
          ...getFieldsByFileView(newFullParameter.items![index], file),
          controllerType: newFullParameter.items![index].controllerType,
          ...getFieldsByControllerType(newFullParameter.items![index]),
        })),
      };
      break;
    case GameSettingsOptionType.GROUP:
      newParameter = {
        ...newParameter,
        controllerType: newFullParameter.controllerType,
        ...getFieldsByControllerType(newFullParameter),
        items: newFullParameter.items?.map((item, index): IGameSettingsItemParameter => ({
          id: item.id,
          name: item.name,
          ...getFieldsByFileView(newFullParameter.items![index], file),
        })),
      };
      break;
    default:
      break;
  }

  return {
    newParameter,
    newFullParameter,
  };
};

/**
 * Заменяет данные элемента (объект) массива на новые.
 * @param id Идентификатор элемента массива.
 * @param data Объект с данными для замены.
 * @param items Элементы массива, данные элемента которого меняем.
 * @param isFullData Задает, полные или частичные данные переданы в параметре `data`.
 * @returns Массив элементов с измененным элементом.
 */
export const changeConfigArrayItem = <P extends { id: string, }>(
  id: string,
  data: P,
  items: P[],
  isFullData = true,
): P[] => {
  const index = items.findIndex((item) => item.id === id);
  const newParams = [...items];

  newParams[index] = { ...isFullData ? {} : newParams[index], ...data };

  return newParams;
};

/**
 * Получить измененные игровые параметры после удаления игрового файла.
 * @param parameters Массив игровых параметров.
 * @param files Массив игровых файлов.
 * @returns Массив измененных игровых параметров.
 */
export const getChangedParametersAfterFileDelete = (
  parameters: IGameSettingsParameter[],
  files: IGameSettingsFile[],
): IGameSettingsParameter[] => parameters.map((param) => {
  if (!getGameSettingsFilesNames(files).includes(param.file)) {
    return generateGameSettingsParameter(
      {
        ...param,
        file: files[0].name,
      },
      getFullParameter(defaultFullGameSettingsParameter, param),
      files[0],
    ).newParameter;
  }

  return param;
});

/**
 * Получить объект строк для всех `select` игрового параметра.
 * @param parameter Объект игрового параметра.
 * @returns Объект, содержащий строковое представление опций всех `select`.
 */
export const getSelectsOptionStringObj = (
  parameter: IGameSettingsParameter,
): { [key: string]: string, } => {
  let obj = {};

  if (parameter.options) {
    obj = {
      [parameter.id]: generateSelectOptionsString(parameter.options),
    };
  }

  if (parameter.items) {
    parameter.items.forEach((item) => {
      if (item.options) {
        obj[item.id] = generateSelectOptionsString(item.options);
      }
    });
  }

  return obj;
};
