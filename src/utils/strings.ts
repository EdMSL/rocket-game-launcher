import path from 'path';

import { IMainRootState } from '$types/main';
import { CustomError } from './errors';
import { CustomPathName, DefaultCustomPathName } from '$constants/misc';
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
  word: string,
): string => `${word}-f${((Math.random() * HEXADECIMAL_FACTOR)).toString(HEXADECIMAL)}-${new Date().getMilliseconds()}`; //eslint-disable-line max-len

export const getParameterRegExp = (
  parameterName: string,
): RegExp => new RegExp(`set\\s+${parameterName}\\s+to\\s+(.+)$`, 'i');

/**
 * Получить часть строки параметра из файла вида `line`.
 * @param lineText Строка, в которой осуществляется поиск.
 * @param parameterName Имя параметра, который ищем.
 * @returns Найденная часть строки.
*/
export const getStringPartFromIniLineParameterForReplace = (
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
): string => currPath.replace(/%.*%\\/, '').trim();

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
  pathVariable: string,
  rootDirPathStr: string,
): string => pathStr.replace(rootDirPathStr, pathVariable).trim();

/**
 * Заменить корневой путь на переменную пути.
 * @param currPath Изменяемый путь.
 * @param pathVariable Переменная которую меняем.
 * @param rootDirPathStr Корневая папка для замены.
 * @returns Строка пути с корневой папкой вместо переменной.
*/
export const replacePathVariableByRootDir = (
  pathStr: string,
  pathVariable: string,
  rootDirPathStr: string,
): string => pathStr.replace(pathVariable, rootDirPathStr).trim();

export const getPathWithoutRootDir = (
  pathToFile: string,
  pathVariables: IPathVariables,
): string => {
  if (new RegExp(GAME_DIR.replaceAll('\\', '\\\\')).test(pathToFile)) {
    return pathToFile.replace(GAME_DIR, '').substr(1);
  } else if (
    pathVariables[CustomPathName.DOCUMENTS]
    && new RegExp(pathVariables[CustomPathName.DOCUMENTS].replaceAll('\\', '\\\\')).test(pathToFile)
  ) {
    return pathToFile.replace(pathVariables[CustomPathName.DOCUMENTS], '').substr(1);
  }

  throw new CustomError(`Recieved incorrect path: ${pathToFile}`);
};

export const checkIsPathIsNotOutsideValidFolder = (
  pathForCheck: string,
  pathVariables: IPathVariables,
  isGameDocuments = true,
): string => {
  const newPath = path.normalize(pathForCheck);

  if (
    !new RegExp(GAME_DIR.replaceAll('\\', '\\\\')).test(pathForCheck)
    && !new RegExp(pathVariables[isGameDocuments ? CustomPathName.DOCS_GAME : CustomPathName.DOCUMENTS]
      .replaceAll('\\', '\\\\'))
      .test(pathForCheck)
  ) {
    throw new CustomError(`The path is outside of a valid folder. Path: ${pathForCheck}`);
  }

  return newPath;
};

/**
 * Получить путь до файла с учетом кастомных путей.
 * @param pathToFile Путь до файла из settings.json.
 * @param pathVariables Переменные пути из `state`.
 * @param profileMO Профиль Mod Organizer.
 * @returns Строка с абсолютным путем к файлу.
*/
export const getPathToFile = (
  pathToFile: string,
  pathVariables: IPathVariables,
  profileMO: string,
): string => {
  let newPath = pathToFile;

  if (CustomPathName.MO_PROFILE_REGEXP.test(pathToFile)) {
    if (profileMO) {
      newPath = path.join(pathVariables[CustomPathName.MO_PROFILE], profileMO, path.basename(pathToFile));
    } else {
      throw new CustomError('Указан путь до файла в папке профилей Mod Organizer, но МО не используется.'); //eslint-disable-line max-len
    }
  } else if (CustomPathName.MO_DIR_REGEXP.test(pathToFile)) {
    if (pathVariables[CustomPathName.MO_DIR]) {
      newPath = path.join(
        pathVariables[CustomPathName.MO_DIR],
        pathToFile.replace(CustomPathName.MO_DIR, ''),
      );
    } else {
      if (profileMO) {
        throw new CustomError('The path to a file in the Mod Organizer folder was received, but the path to the folder was not specified.'); //eslint-disable-line max-len
      }

      throw new CustomError(`Incorrect path received. Path variable ${DefaultCustomPathName.MO_DIR} is not available.`); //eslint-disable-line max-len
    }
  } else if (CustomPathName.MO_MODS_REGEXP.test(pathToFile)) {
    if (pathVariables[CustomPathName.MO_DIR]) {
      newPath = path.join(
        pathVariables[CustomPathName.MO_MODS],
        pathToFile.replace(CustomPathName.MO_MODS, ''),
      );
    } else {
      if (profileMO) {
        throw new CustomError('The path to a file in the Mod Organizer mods folder was received, but the path to the folder was not specified.'); //eslint-disable-line max-len
      }

      throw new CustomError(`Incorrect path received. Path variable ${DefaultCustomPathName.MO_MODS} is not available.`); //eslint-disable-line max-len
    }
  } else if (CustomPathName.DOCUMENTS_REGEXP.test(pathToFile)) {
    if (pathVariables[CustomPathName.DOCUMENTS]) {
      newPath = path.join(
        pathVariables[CustomPathName.DOCUMENTS],
        pathToFile.replace(CustomPathName.DOCUMENTS, ''),
      );
    } else {
      throw new CustomError('The path to a file in the Documents folder was received, but the path to the folder was not specified.'); //eslint-disable-line max-len
    }
  } else if (CustomPathName.GAME_DIR_REGEXP.test(pathToFile)) {
    newPath = path.join(
      pathVariables[CustomPathName.GAME_DIR],
      pathToFile.replace(CustomPathName.GAME_DIR, ''),
    );
  } else if (CustomPathName.CUSTOM_PATH_REGEXP.test(pathToFile)) {
    const customPathName = pathToFile.match(CustomPathName.CUSTOM_PATH_REGEXP)![0];

    if (pathVariables[customPathName]) {
      newPath = path.join(pathVariables[customPathName], pathToFile.replace(customPathName, ''));
    } else {
      throw new CustomError(`Custom path name "${customPathName}" does not exists in config.json.`);
    }
  } else {
    newPath = path.join(GAME_DIR, pathToFile);
  }

  return checkIsPathIsNotOutsideValidFolder(newPath, pathVariables);
};

/**
 * Получить строку-список с ключ\значение из объекта.
*/
export const getObjectAsList = (obj: { [key: string]: any, }): string => Object.keys(obj)
  .map((key) => `${key}: ${obj[key]}`)
  .join('\n');

/**
 * Получить путь до родительской папки файла.
 * @param pathToFile Путь до файла, для которого нужно получить путь до папки.
 * @returns Строка абсолютного пути до папки.
*/
export const getPathToParentFileFolder = (pathToFile: string): string => path.dirname(pathToFile);

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
