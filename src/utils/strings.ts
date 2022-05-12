import path from 'path';

import { CustomError } from './errors';
import {
  PathRegExp,
  PathVariableName,
  pathVariablesCheckOrderArr,
} from '$constants/misc';
import {
  GAME_DIR, IPathVariables,
} from '$constants/paths';

const HEXADECIMAL = 16;
const HEXADECIMAL_FACTOR = 1e8;
const MAX_PATH_LENGTH = 255;

/**
 * Преобразовать JSON строку в объект.
 * @param jsonString Строка для преобразования.
 * @returns Объект с параметрами из JSON. Если возникает ошибка, то возвращается null.
*/
export const parseJSON = <T>(jsonString: string): T => {
  try {
    return JSON.parse(jsonString);
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      throw new Error(`JSON parse error. ${error.message}`);
    } else {
      throw error;
    }
  }
};

/**
 * Генерирует уникальную строку, пригодную для использования в качестве id.
 * @param word Слово, которе будет добавлено в начало генерируемой строки.
 * @returns Строка с уникальным содержимым.
*/
export const getRandomId = (
  word?: string,
): string => `${word ? `${word}_` : ''}${((Math.random() * HEXADECIMAL_FACTOR)).toString(HEXADECIMAL)}-${new Date().getMilliseconds()}`; //eslint-disable-line max-len

/**
 * Генерирует уникальную строку, содержащую только буквы и цифры.
 * @returns Строка с уникальным именем.
*/
export const getRandomName = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < HEXADECIMAL; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};

/**
 *
 * @param parameterName Имя параметра.
 * @returns Регулярное выражение для поиска строки с заданным именем параметра.
 */
export const getRegExpForLineIniParameter = (
  parameterName: string,
): RegExp => new RegExp(`set\\s+${parameterName}\\s+to\\s+(.+)$`, 'i');

/**
 * Получить часть строки параметра из файла вида `line`.
 * @param lineText Строка, в которой осуществляется поиск.
 * @param parameterName Имя параметра, который ищем.
 * @returns Найденная часть строки.
*/
export const getStringPartFromLineIniParameterForReplace = (
  lineText: string,
  parameterName: string,
): string => lineText.match(new RegExp(`set\\s+${parameterName}\\s+to\\s+([^;]+)`, 'i'))![0].trim();

/**
 * Получить значение параметра из файла вида `line`.
 * @param lineText Строка, в которой осуществляется поиск.
 * @param parameterName Имя параметра, который ищем.
 * @returns Найденная значение.
*/
export const getLineIniParameterValue = (lineText: string, parameterNameRegexp: RegExp): string => {
  const paramResult = lineText.match(parameterNameRegexp);

  if (paramResult!?.length > 0) {
    // @ts-ignore
    const value = paramResult[0].match(/to\s+([^;]+);?/);

    if (value!?.length > 1) {
      // @ts-ignore
      return value[1].trim();
    }
  }

  return '';
};

/**
 * Получить число знаков после запятой.
 * @param value Число, у которого нужно определить кол-во знаков.
 * @returns Число знаков.
*/
export const getNumberOfDecimalPlaces = (value: string|number): number => {
  const valueParts = value.toString().split('.');

  if (valueParts.length > 1) {
    return valueParts[valueParts.length - 1].length;
  }

  return 0;
};

/**
 * Получить значение с учетом доступного диапазона чисел.
 * @param value Текущее значение.
 * @param min Минимально допустимое значение.
 * @param max Максимально допустимое значение.
 * @returns Число из диапазона.
*/
export const getValueFromRange = (
  value: string|number,
  min: string|number,
  max: string|number,
): number => {
  if (+value >= +min && +value <= +max) {
    return +value;
  }

  if (+value < +min) {
    return +min;
  }

  return +max;
};

/**
 * Получить путь с отсеченной переменной пути.
 * @param currPath Путь для очистки.
 * @returns Строка пути без переменной пути.
*/
export const clearPathVaribaleFromPathString = (
  currPath: string,
): string => {
  const newStr = currPath;

  return newStr.replace(/%.*%\\?/, '').trim();
};

/**
 * Получить путь с отсеченной корневой папкой.
 * @param currPath Путь для очистки.
 * @param rootPath Корневой путь, который нужно удалить.
 * @returns Строка пути без корня.
*/
export const clearRootDirFromPathString = (
  currPath: string,
  rootPath: string,
): string => currPath.replace(new RegExp(`${rootPath.replaceAll('\\', '\\\\')}\\\\?`), '').trim();

/**
 * Заменить корневой путь на переменную пути.
 * @param currPath Изменяемый путь.
 * @param pathVariable Переменная для замены.
 * @param rootDirPathStr Корневая папка в изменяемом пути, которую нужно заменить.
 * @returns Строка пути с переменной вместо корневой папки.
*/
export const replaceRootDirByPathVariable = (
  pathStr: string,
  availablePathVariables: string[],
  pathVariables: IPathVariables,
): string => {
  const newPathStr = pathStr;

  const availablePathVariablesOrder = pathVariablesCheckOrderArr.filter((current) => availablePathVariables.includes(current));
  let variableIndex = -1;

  const pathVariableName = availablePathVariablesOrder.find((curr, index) => {
    if (pathVariables[curr] && pathStr.includes(pathVariables[curr])) {
      variableIndex = index;

      return true;
    }

    return false;
  });

  if (pathVariableName && variableIndex >= 0) {
    return newPathStr.replace(
      pathVariables[availablePathVariablesOrder[variableIndex]],
      pathVariableName,
    ).trim();
  }

  return '';
};

const createRegexp = (pathForRegEpx: string): RegExp => new RegExp(pathForRegEpx.replaceAll('\\', '\\\\'));

/**
 * Заменить корневой путь на переменную пути.
 * @param currPath Изменяемый путь.
 * @param pathVariable Переменная которую меняем.
 * @param rootDirPathStr Корневая папка для замены.
 * @returns Строка пути с корневой папкой вместо переменной.
*/
export const replacePathVariableByRootDir = (
  pathStr: string,
  pathVariable = PathVariableName.GAME_DIR,
  rootDirPathStr = GAME_DIR,
): string => {
  const newStr = pathStr;

  return newStr.replace(pathVariable, rootDirPathStr).trim();
};

/**
 * Получить путь до файла без учета корневой папки-переменной пути.
 * @param pathToFile Путь до файла.
 * @param pathVariables Переменные путей.
 * @returns Строка пути без переменной пути.
*/
export const getPathWithoutRootDir = (
  pathToFile: string,
  pathVariables: IPathVariables,
): string => {
  if (createRegexp(GAME_DIR).test(pathToFile)) {
    return pathToFile.replace(GAME_DIR, '').substr(1);
  } else if (
    pathVariables[PathVariableName.DOCUMENTS]
    && createRegexp(pathVariables[PathVariableName.DOCUMENTS]).test(pathToFile)
  ) {
    return pathToFile.replace(pathVariables[PathVariableName.DOCUMENTS], '').substr(1);
  }

  throw new CustomError(`Recieved incorrect path: ${pathToFile}`);
};

/**
 * Получить путь до файла без учета корневой папки-переменной пути.
 * @param pathForCheck Путь до файла.
 * @param pathVariables Переменные путей.
 * @param isGameDocuments Проверять путь до папки документов пользователя или
 * папки файлов игры в папке документов.
 * @returns Входит ли путь в состав допустимых.
*/
export const checkIsPathIsNotOutsideValidFolder = (
  pathForCheck: string,
  pathVariables: IPathVariables,
  isGameDocuments = true,
): void => {
  if (
    !createRegexp(GAME_DIR).test(pathForCheck)
    && !createRegexp(pathVariables[isGameDocuments
      ? PathVariableName.DOCS_GAME
      : PathVariableName.DOCUMENTS])
      .test(pathForCheck)
  ) {
    throw new CustomError(`The path is outside of a valid folder. Path: ${pathForCheck}`);
  }
};

/**
 * Получить путь до файла с учетом переменных путей.
 * @param pathToFile Путь до файла.
 * @param pathVariables Переменные путей.
 * @param profileMO Профиль Mod Organizer.
 * @returns Строка с абсолютным путем к файлу.
*/
export const getPathToFile = (
  pathToFile: string,
  pathVariables: IPathVariables,
  profileMO = '',
): string => {
  let newPath = pathToFile;

  if (PathRegExp.MO_PROFILE.test(pathToFile)) {
    if (profileMO) {
      newPath = path.join(
        pathVariables['%MO_PROFILE%'],
        profileMO,
        path.basename(pathToFile),
      );
    } else {
      throw new CustomError('Указан путь до файла в папке профилей Mod Organizer, но МО не используется.'); //eslint-disable-line max-len
    }
  } else if (PathRegExp.MO_DIR.test(pathToFile)) {
    if (pathVariables['%MO_DIR%']) {
      newPath = newPath.replace(PathVariableName.MO_DIR, pathVariables['%MO_DIR%']);
    } else {
      if (profileMO) {
        throw new CustomError('The path to a file in the Mod Organizer folder was received, but the path to the folder was not specified.'); //eslint-disable-line max-len
      }

      throw new CustomError(`Incorrect path received. Path variable ${PathVariableName.MO_DIR} is not available.`); //eslint-disable-line max-len
    }
  } else if (PathRegExp.MO_MODS.test(pathToFile)) {
    if (pathVariables['%MO_DIR%']) {
      newPath = newPath.replace(PathVariableName.MO_MODS, pathVariables['%MO_MODS%']);
    } else {
      if (profileMO) {
        throw new CustomError('The path to a file in the Mod Organizer mods folder was received, but the path to the folder was not specified.'); //eslint-disable-line max-len
      }

      throw new CustomError(`Incorrect path received. Path variable ${PathVariableName.MO_MODS} is not available.`); //eslint-disable-line max-len
    }
  } else if (PathRegExp.DOCS_GAME.test(pathToFile)) {
    if (pathVariables['%DOCS_GAME%']) {
      newPath = newPath.replace(PathVariableName.DOCS_GAME, pathVariables['%DOCS_GAME%']);
    } else {
      throw new CustomError('The path to a file in the Documents folder was received, but the path to the folder was not specified.'); //eslint-disable-line max-len
    }
  } else if (PathRegExp.DOCUMENTS.test(pathToFile)) {
    throw new CustomError(`The path to a file in the Documents folder is not allow. Maybe you wanted to write "${PathVariableName.DOCS_GAME}"?.`); //eslint-disable-line max-len
  } else if (PathRegExp.GAME_DIR.test(pathToFile)) {
    newPath = newPath.replace(PathVariableName.GAME_DIR, pathVariables['%GAME_DIR%']);
  } else {
    throw new CustomError(`Incorrect path (${pathToFile}) received.`); //eslint-disable-line max-len
  }

  checkIsPathIsNotOutsideValidFolder(newPath, pathVariables);

  return newPath;
};

/**
 * Получить строку-список с ключ\значение из объекта.
*/
export const getObjectAsList = (obj: { [key: string]: any, }): string => Object.keys(obj)
  .map((key) => `${key}: ${obj[key]}`)
  .join('\n  ');

/**
 * Получить путь до родительской папки файла.
 * @param pathToFile Путь до файла, для которого нужно получить путь до папки.
 * @returns Строка абсолютного пути до папки.
*/
export const getPathToParentFileFolder = (pathToFile: string): string => path.dirname(pathToFile);

/**
 * Получить имя файла из строки пути до него.
 * @param pathToFile Путь до файла.
 * @returns Имя файла.
*/
export const getFileNameFromPathToFile = (
  pathToFile: string,
  isWithExtension = false,
): string => path.basename(pathToFile, isWithExtension ? '' : path.extname(pathToFile));

/**
 * Проверка имени папки на корректность.
 * @param name Имя для проверки.
 * @returns Является ли имя корректным.
*/
export const isValidName = (name: string): boolean => {
  if (typeof name !== 'string' || name.length > MAX_PATH_LENGTH) {
    return false;
  }

  if (/.+\.\s*$/.test(name)) {
    return false;
  }

  return !/[<>:"/\\|?*]/.test(name);
};

/**
 * Генерирует строку опций для `select` из игрового параметра. Использется в `TextArea` компоненте.
 * @param selectOptions Опции для `select` из параметра.
 * @returns Строка с опциями.
 */
export const generateSelectOptionsString = (
  selectOptions: { [key: string]: string, }|undefined,
): string => {
  if (selectOptions !== undefined) {
    return Object.keys(selectOptions).reduce(
      (totalString, option) => `${totalString}${option}=${selectOptions![option]}\n`,
      '',
    );
  }

  return '';
};

/**
 * Генерирует опции из строки опций для `select` из игрового параметра.
 * Строка используется в `TextArea` компоненте.
 * @param selectOptionsStr Строка с опциями из `select` для параметра.
 * @returns Объект опций для `select`.
 */
export const generateSelectOptionsFromString = (
  selectOptionsStr: string,
): { [key: string]: string, } => {
  const optionsArr = selectOptionsStr.split('\n');

  if (optionsArr.length > 0) {
    return optionsArr.reduce((options, currentStr) => {
      const optionArr = currentStr.split('=');

      if (optionArr.length === 2 && optionArr[0].trim() !== '' && optionArr[1].trim() !== '') {
        return {
          ...options,
          [optionArr[0]]: optionArr[1],
        };
      }

      return { ...options };
    }, {});
  }

  return {};
};
