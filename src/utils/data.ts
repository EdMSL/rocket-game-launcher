import path from 'path';

import {
  PathRegExp,
  PathVariableName,
  GameSettingsFileView,
  GameSettingsOptionType,
  UIControllerType,
} from '$constants/misc';
import {
  LogMessageType,
  writeToLogFile,
  writeToLogFileSync,
} from './log';
import {
  checkIsPathIsNotOutsideValidFolder,
  clearPathVaribaleFromPathString,
  generateSelectOptionsString,
  getLineIniParameterValue,
  getPathToFile,
  getRandomId,
  getRandomName,
  replacePathVariableByRootDir,
  getSpacesFromParameterString,
  getStringPartFromLineIniParameterForReplace,
} from './strings';
import {
  IGameSettingsOptionItem,
  IGameSettingsOption,
  IGameSettingsRootState,
  IGameSettingsParameters,
  IGameSettingsParameterElem,
  IGameSettingsFile,
  IGameSettingsGroup,
  IGameSettingsOptionBase,
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
  defaultFullGameSettingsOption,
  defaultGameSettingsOptionItem,
  defaultModOrganizerParams,
} from '$constants/defaultData';
import { getReadWriteError } from './errors';
import {
  IGetDataFromFilesResult, IIniObj, IXmlObj, ISelectOption,
} from '$types/common';

const SYMBOLS_TO_TYPE = 8;

interface IParameterErrorData { text: string, field: string, }

interface IParameterGeneratedData {
  parameterName: string,
  parameterValue: string,
  parameterErrors: IParameterErrorData[],
}

interface IParametersGeneratedData {
  data: IGameSettingsParameters,
  errors: IParameterErrorData[],
  optionsWithError: string[],
}

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

/**
 * Сгенерировать имя игрового параметра на основе опции, к которой привязан данный параметр.
 * @param option Опция, к которой привязан параметр.
*/
export const getParameterName = (
  option: IGameSettingsOption|IGameSettingsOptionItem,
): string => {
  if (option.valueName) {
    return `${option.valuePath ? `${option.valuePath}/` : ''}${option.name}/${option.valueName}`;
  }

  if (option.iniGroup) {
    return `${option.iniGroup}/${option.name}`;
  }

  return option.name!;
};

/**
 *
 * @param option Имя опции.
 * @returns Id опции.
 */
export const getOptionNameAndId = (
  option: IGameSettingsOption|IGameSettingsOptionItem,
): { name: string, id: string, } => {
  const name = getParameterName(option);
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
export const deepClone = (obj: any, deleteKey = ''): object => {
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

export const getValueFromObjectDeepKey = <T>(lib: Record<string, any>, keys: string[]): T => {
  const key = keys.shift();

  if (key) {
    return keys.length > 0 ? getValueFromObjectDeepKey(lib[key], keys) : lib[key];
  }

  throw new Error('"keys" array is empty.');
};

export const setValueForObjectDeepKey = <T>(
  lib: Record<string, any>,
  keys: string[],
  newValue: T,
): void => {
  const key = keys.shift();

  if (key) {
    if (keys.length > 0) {
      setValueForObjectDeepKey(lib[key], keys, newValue);
    } else {
      lib[key] = newValue; //eslint-disable-line no-param-reassign
    }
  } else {
    throw new Error('"keys" array is empty.');
  }
};

/**
 * Генерирует объект с полями, необходимыми для создания
 * игрового параметра для записи в state.
 * @param currentFileData Данные из файла, которые используются в опции.
 * @param currentGameSettingOption Объект опции, на основе которой создается параметр.
 * @param currentGameSettingsFile Объект файла, используемого параметром.
 * @param moProfileName Профиль МО.
 * @returns Объект с полями имени и значения параметра, а так же ошибок генерации.
*/
export const getParameterData = (
  currentFileData: IIniObj|IXmlObj,
  currentGameSettingOption: IGameSettingsOption|IGameSettingsOptionItem,
  currentGameSettingsFile: IGameSettingsFile,
  moProfileName = '',
): IParameterGeneratedData => {
  const parameterErrors: IParameterErrorData[] = [];
  const baseFileName = path.basename(currentGameSettingsFile.path);

  let parameterName;
  let parameterSection;
  let parameterValue = '';

  if (currentGameSettingsFile.view === GameSettingsFileView.SECTIONAL) {
    parameterSection = currentFileData.getSection(currentGameSettingOption.iniGroup);

    if (!parameterSection) {
      parameterErrors.push({
        text: `The ${baseFileName} file${moProfileName ? ` from the "${moProfileName}" profile` : ''} does not contain the "${currentGameSettingOption.iniGroup}" group specified in ${currentGameSettingOption.name} from "${currentGameSettingsFile.label}"`, //eslint-disable-line max-len
        field: 'iniGroup',
      });
    } else {
      const parameterLine = parameterSection.getLine(currentGameSettingOption.name);

      if (parameterLine) {
        parameterName = `${parameterSection.name}/${parameterLine.key}`;
        parameterValue = parameterLine.value;
      } else {
        parameterErrors.push({
          text: `The "${currentGameSettingOption.iniGroup}" group from the ${baseFileName} file${moProfileName ? ` from the "${moProfileName}" profile` : ''} does not contain the "${currentGameSettingOption.name}" parameter specified in "${currentGameSettingsFile.label}"`, //eslint-disable-line max-len
          field: 'name',
        });
      }
    }
  } else if (currentGameSettingsFile.view === GameSettingsFileView.LINE) {
    (currentFileData as IIniObj).globals.lines.some((line) => {
      // const searchRegExp = getRegExpForLineIniParameter(currentGameSettingOption.name!.trim());

      // parameterValue = getLineIniParameterValue(line.text, searchRegExp);
      parameterValue = getLineIniParameterValue(line.text, currentGameSettingOption.name!.trim());

      if (parameterValue) {
        parameterName = currentGameSettingOption.name;
      }

      return Boolean(parameterValue);
    });

    if (!parameterName) {
      parameterErrors.push({
        text: `The ${baseFileName} file${moProfileName ? ` from the "${moProfileName}" profile` : ''} does not contain the "${currentGameSettingOption.name}" parameter, specified in "${currentGameSettingsFile.label}"`, //eslint-disable-line max-len
        field: 'name',
      });
    }
  } else if (currentGameSettingsFile.view === GameSettingsFileView.TAG) {
    let valuePathArr: string[] = [];

    if (currentGameSettingOption.valuePath) {
      valuePathArr = [...currentGameSettingOption.valuePath!?.split('/')];
    }

    const pathArr = [
      ...valuePathArr,
      currentGameSettingOption.name!,
      currentGameSettingOption.valueName!,
    ];

    let index = 0;

    const getProp = (obj, key: string): void => {
      index += 1;

      if (typeof obj[key] === 'object') {
        getProp(obj[key], pathArr[index]);
      } else if (key === currentGameSettingOption.valueName) {
        parameterName = pathArr.join('/');
        parameterValue = obj[currentGameSettingOption.valueName!];
      }
    };

    getProp(currentFileData, pathArr[index]);

    if (!parameterName || !parameterValue) {
      let errorMsg = '';
      let errorField = '';

      if (index === pathArr.length) {
        errorMsg = `The ${baseFileName} file${moProfileName ? ` from the "${moProfileName}" profile` : ''} does not contain "${currentGameSettingOption.valueName}" attribute in "${currentGameSettingOption.name}" parameter specified in "${currentGameSettingsFile.label}".`; //eslint-disable-line max-len
        errorField = 'valueName';
      } else if (index === pathArr.length - 1) {
        errorMsg = `The ${baseFileName} file${moProfileName ? ` from the "${moProfileName}" profile` : ''} does not contain "${currentGameSettingOption.name}" parameter${currentGameSettingOption.valuePath ? ` on the path "${currentGameSettingOption.valuePath}"` : ''} specified in "${currentGameSettingsFile.label}".`; //eslint-disable-line max-len
        errorField = 'name';
      } else {
        errorMsg = `The ${baseFileName} file${moProfileName ? ` from the "${moProfileName}" profile` : ''} does not contain "${pathArr[index - 1]}" tag specified in "valuePath" in "${currentGameSettingsFile.label}".`; //eslint-disable-line max-len
        errorField = 'valuePath';
      }

      parameterErrors.push({ text: errorMsg, field: errorField });
    }
  }

  return {
    parameterName,
    parameterValue,
    parameterErrors,
  };
};

export const generateGameSettingsParameters = (
  gameSettingsOptions: IGameSettingsOption[],
  gameSettingsFiles: IGameSettingsFile[],
  currentFilesDataObj: IGetDataFromFilesResult,
  moProfile: string,
): IParametersGeneratedData => {
  let errors: IParameterErrorData[] = [];
  let optionsWithError: string[] = [];

  const data = gameSettingsOptions.reduce<IGameSettingsParameters>(
    (gameSettingsParameters, currentOption) => {
      const currentGameSettingsFile: IGameSettingsFile|undefined = getFileByFileName(
        gameSettingsFiles,
        currentOption.file,
      );

      if (currentGameSettingsFile !== undefined) {
        if (
          currentOption.optionType === GameSettingsOptionType.RELATED
          || currentOption.optionType === GameSettingsOptionType.GROUP
          || currentOption.optionType === GameSettingsOptionType.COMBINED
        ) {
          let specParamsErrors: IParameterErrorData[] = [];

          const parametersFromOption = currentOption.items!.reduce<IGameSettingsParameters>(
            (parameters, currentItem) => {
              const {
                parameterName, parameterValue, parameterErrors,
              } = getParameterData(
                currentFilesDataObj[currentOption.file],
                currentItem,
                currentGameSettingsFile,
                moProfile,
              );

              if (parameterErrors.length > 0) {
                specParamsErrors = [...parameterErrors];

                return { ...parameters };
              }

              return {
                ...parameters,
                [getOptionNameAndId(currentItem).id]: {
                  default: parameterValue,
                  value: parameterValue,
                  name: parameterName,
                  option: currentOption.id,
                  file: currentOption.file,
                },
              };
            },
            {},
          );

          if (specParamsErrors.length > 0) {
            errors = [...errors, ...specParamsErrors];
            optionsWithError.push(currentOption.id);

            return { ...gameSettingsParameters };
          }

          return {
            ...gameSettingsParameters,
            ...parametersFromOption,
          };
        }

        const {
          parameterName, parameterValue, parameterErrors,
        } = getParameterData(
          currentFilesDataObj[currentGameSettingsFile!.name],
          currentOption,
          currentGameSettingsFile,
          moProfile,
        );

        if (parameterErrors.length > 0) {
          errors = [...errors, ...parameterErrors];
          optionsWithError.push(currentOption.id);

          return { ...gameSettingsParameters };
        }

        return {
          ...gameSettingsParameters,
          [getOptionNameAndId(currentOption).id]: {
            default: parameterValue,
            name: parameterName,
            value: parameterValue,
            option: currentOption.id,
            file: currentOption.file,
          },
        };
      }

      errors = [
        ...errors,
        {
          text: `file ${currentOption.file} does not exists on [${gameSettingsFiles.join()}]`,
          field: 'file',
        },
      ];
      optionsWithError.push(currentOption.id);

      return { ...gameSettingsParameters };
    },
    {},
  );

  optionsWithError = Array.from(new Set(optionsWithError));

  return {
    data, errors, optionsWithError,
  };
};

/**
 * Генерирует опции для UI компонента `Select`.
 * @param obj Объект или массив строк, на основе которых будет сгенерирован список опций.
 * @returns Массив с опциями.
*/
export const generateSelectOptions = (
  obj: Record<string, string> | string[],
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
 * @param gameSettingsFiles Игровые файлы из `state`.
 * @returns Массив имен игровых файлов.
 */
export const getGameSettingsFilesNames = (
  gameSettingsFiles: IGameSettingsFile[],
): string[] => gameSettingsFiles.map((file) => file.name);

/**
 * @param gameSettingsGroups Группы игровых настроек из `state`.
 * @returns Массив имен групп.
 */
export const getGameSettingsGroupsNames = (
  gameSettingsGroups: IGameSettingsGroup[],
): string[] => gameSettingsGroups.map((group) => group.name);

/**
 * Получить список игровых опций для вывода.
 * Если есть `gameSettingsGroups`, то дополнительно фильтрует по текущей группе.
 * @param gameSettingsOptions Список опций из `state`.
 * @param gameSettingsGroups Список доступных групп настроек из `state`.
 * @param gameSettingsFiles Список файлов из `state`.
 * @param currentGameSettingGroup текущая группа настроек.
 * @returns Массив с опциями для вывода.
*/
export const getOptionsForOutput = (
  gameSettingsOptions: IGameSettingsRootState['gameSettingsOptions'],
  gameSettingsGroups: IGameSettingsRootState['gameSettingsGroups'],
  gameSettingsFiles: IGameSettingsRootState['gameSettingsFiles'],
  currentGameSettingGroup: string,
): IGameSettingsOption[] => {
  const availableFiles = getGameSettingsFilesNames(gameSettingsFiles);
  let currentOptions = [...gameSettingsOptions];

  currentOptions = currentOptions.filter((currentOption) => availableFiles.includes(currentOption.file));

  if (gameSettingsGroups.length > 0 && currentGameSettingGroup) {
    return currentOptions.filter(
      (currentOption) => currentOption.settingGroup === currentGameSettingGroup,
    );
  }

  return currentOptions;
};

/**
 * Изменить текущее значение игрового параметра.
 * @param currentParameter Параметр для изменения.
 * @param newValue Новое значение.
 * @returns Объект параметра с новым значением.
*/
export const changeParameterValue = (
  currentParameter: IGameSettingsParameterElem,
  newValue: string|number,
): IGameSettingsParameterElem => {
  const a = {
    ...currentParameter,
    value: String(newValue),
  };
  console.log(newValue);
  return a;
};

/**
 * Получить игровые параметры, которые были изменены.
 * @param gameSettingsParameters Игровые параметры из `state`.
*/
export const getChangedGameSettingsParameters = (
  gameSettingsParameters: IGameSettingsParameters,
): IGameSettingsParameters => Object.keys(gameSettingsParameters)
  .reduce<IGameSettingsParameters>((totalParameters, parameterName) => {
    const parameter = gameSettingsParameters[parameterName];

    if (parameter.value !== parameter.default) {
      return {
        ...totalParameters,
        [parameterName]: {
          ...gameSettingsParameters[parameterName],
        },
      };
    }

    return {
      ...totalParameters,
    };
  }, {});

/**
 * Получить игровые параметры с новыми значениями для стандартного или текущего значения.
 * @param gameSettingsParameters Игровые параметры из `state`.
 * @param isForDefaultValue Определяет, прописать опциям новые значения по умолчанию
 * или заменить текущие значения значениями по умолчанию.
 * @returns Объект игровых опций с новыми значениями.
*/
export const getGameSettingsParametersWithNewValues = (
  gameSettingsParameters: IGameSettingsParameters,
  isForDefaultValue = true,
): IGameSettingsParameters => {
  const newParametersObj = { ...gameSettingsParameters };

  const getProp = (
    obj: IGameSettingsParameters|IGameSettingsParameterElem,
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

  getProp(newParametersObj);

  return newParametersObj;
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
export const changeSectionalIniParameterStr = (
  iniData: IIniObj,
  sectionName: string,
  parameterName: string,
  newValue: string,
): void => {
  const defaultLineText: string = iniData
    .getSection(sectionName)
    .getLine(parameterName).text;

  const [spacesBefore, spacesAfter] = getSpacesFromParameterString(defaultLineText);

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
    .join(`${spacesBefore}=${spacesAfter}`);

  iniData //eslint-disable-line no-param-reassign
    .getSection(sectionName)
    .getLine(parameterName).text = currLineText;
};

export const changeLineIniParameterStr = (
  parameterStr: string,
  parameterName: string,
  newValue: string,
): string => {
  const [spacesBefore, spacesAfter] = getSpacesFromParameterString(parameterStr);

  return parameterStr.replace(//eslint-disable-line no-param-reassign
    getStringPartFromLineIniParameterForReplace(parameterStr, parameterName),
    `set ${parameterName}${spacesBefore}to${spacesAfter}${newValue}`,
  );
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
export const getFullOption = (
  currentFullParam: IGameSettingsOption,
  currentParam: IGameSettingsOption,
): IGameSettingsOption => ({
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
 * @param optionBase Объект с базовыми полями любого типа опций.
 * @returns Объект с основными полями игрового параметра.
**/
const getOptionBase = (
  file: IGameSettingsFile,
  optionBase?: IGameSettingsOptionBase,
): IGameSettingsOptionBase => ({
  id: optionBase?.id! || getRandomId(),
  optionType: optionBase?.optionType || GameSettingsOptionType.DEFAULT,
  file: optionBase?.file || file.name,
  label: optionBase?.label || '',
  description: optionBase?.description || '',
  ...optionBase?.settingGroup ? { settingGroup: optionBase.settingGroup } : {},
});

const getFieldsByFileView = (
  fullOption: IGameSettingsOption|IGameSettingsOptionItem,
  file: IGameSettingsFile,
) => ({
  ...file.view === GameSettingsFileView.SECTIONAL ? {
    iniGroup: fullOption.iniGroup || defaultGameSettingsOptionItem.iniGroup,
  } : {},
  ...file.view === GameSettingsFileView.TAG ? {
    valueName: fullOption.valueName || defaultGameSettingsOptionItem.valueName,
    valuePath: fullOption.valuePath || defaultGameSettingsOptionItem.valuePath,
  } : {},
});
const getFieldsByControllerType = (
  fullOption: IGameSettingsOption|IGameSettingsOptionItem,
) => ({
  ...fullOption.controllerType === UIControllerType.SELECT ? {
    selectOptions: fullOption.selectOptions,
  } : {},
  ...fullOption.controllerType === UIControllerType.RANGE ? {
    min: fullOption.min,
    max: fullOption.max,
    step: fullOption.step,
  } : {},
});

/**
 * Сгенерировать новый объект параметра игровых настроек типа `default`.
 * @param file Объект с данными игрового файла.
 * @returns Объект параметра из `state`.
 */
export const getDefaultGameSettingsOption = (
  file: IGameSettingsFile,
  settingGroup?: string,
): IGameSettingsOption => ({
  ...getOptionBase(file),
  label: 'Заголовок',
  ...settingGroup ? { settingGroup } : {},
  name: '',
  ...getFieldsByFileView({} as IGameSettingsOption, file),
  controllerType: UIControllerType.CHECKBOX,
});

/**
 * Сгенерировать новый объект параметра игровых настроек типа `default`.
 * @param currentOption Объект изменяемого параметра.
 * @param fullOption Объект со всеми доступными полями параметра.
 * @param file Объект с данными игрового файла.
 * @returns Объект параметра из `state`.
 */
export const generateGameSettingsOption = (
  currentOption: IGameSettingsOption,
  fullOption: IGameSettingsOption,
  file: IGameSettingsFile,
): { newOption: IGameSettingsOption, newFullOption: IGameSettingsOption, } => {
  const newFullOption: IGameSettingsOption = getFullOption(
    fullOption,
    currentOption,
  );

  let newOption: IGameSettingsOption = getOptionBase(file, newFullOption);

  switch (currentOption.optionType) {
    case GameSettingsOptionType.DEFAULT:
      newOption = {
        ...newOption,
        name: newFullOption.name,
        ...getFieldsByFileView(newFullOption, file),
        controllerType: newFullOption.controllerType,
        ...getFieldsByControllerType(newFullOption),
      };
      break;
    case GameSettingsOptionType.COMBINED:
      newOption = {
        ...newOption,
        controllerType: UIControllerType.SELECT,
        separator: newFullOption.separator,
        selectOptions: newFullOption.selectOptions,
        items: newFullOption.items?.map((item, index): IGameSettingsOptionItem => ({
          id: item.id,
          name: item.name,
          ...getFieldsByFileView(newFullOption.items![index], file),
        })),
      };
      break;
    case GameSettingsOptionType.RELATED:
      newOption = {
        ...newOption,
        items: newFullOption.items?.map((item, index): IGameSettingsOptionItem => ({
          id: item.id,
          name: item.name,
          ...getFieldsByFileView(newFullOption.items![index], file),
          controllerType: newFullOption.items![index].controllerType,
          ...getFieldsByControllerType(newFullOption.items![index]),
        })),
      };
      break;
    case GameSettingsOptionType.GROUP:
      newOption = {
        ...newOption,
        controllerType: newFullOption.controllerType,
        ...getFieldsByControllerType(newFullOption),
        items: newFullOption.items?.map((item, index): IGameSettingsOptionItem => ({
          id: item.id,
          name: item.name,
          ...getFieldsByFileView(newFullOption.items![index], file),
        })),
      };
      break;
    default:
      break;
  }

  return {
    newOption,
    newFullOption,
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
 * Получить измененные игровые опции после удаления игрового файла.
 * @param options Массив игровых опций.
 * @param files Массив игровых файлов.
 * @returns Массив измененных игровых опций.
 */
export const getChangedOptionsAfterFileDelete = (
  options: IGameSettingsOption[],
  files: IGameSettingsFile[],
): IGameSettingsOption[] => options.map((param) => {
  if (!getGameSettingsFilesNames(files).includes(param.file)) {
    return generateGameSettingsOption(
      {
        ...param,
        file: files[0].name,
      },
      getFullOption(defaultFullGameSettingsOption, param),
      files[0],
    ).newOption;
  }

  return param;
});

/**
 * Получить объект строк для всех `select` игровой опции.
 * @param option Объект игровой опции.
 * @returns Объект, содержащий строковое представление опций всех `select`.
 */
export const getSelectsOptionStringObj = (
  option: IGameSettingsOption,
): { [key: string]: string, } => {
  let obj = {};

  if (option.selectOptions) {
    obj = {
      [option.id]: generateSelectOptionsString(option.selectOptions),
    };
  }

  if (option.items) {
    option.items.forEach((item) => {
      if (item.selectOptions) {
        obj[item.id] = generateSelectOptionsString(item.selectOptions);
      }
    });
  }

  return obj;
};
