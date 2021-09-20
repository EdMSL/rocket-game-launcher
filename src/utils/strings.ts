import path from 'path';

import { ISystemRootState } from '$types/system';
import { CustomError } from './errors';
import { CustomPathName } from '$constants/misc';
import { DOCUMENTS_DIR, GAME_DIR } from '$constants/paths';

const HEXADECIMAL = 16;
const HEXADECIMAL_FACTOR = 1e8;

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
export const getLineIniParameterValue = (lineText: string, parameterName: string): string => {
  const paramResult = lineText.match(getParameterRegExp(parameterName.trim()));

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
 * Получить путь до файла с учетом кастомных путей.
 * @param pathToFile Путь до файла из settings.json.
 * @param customPaths Кастомные пути из `state`.
 * @param profileMO Профиль Mod Organizer.
 * @returns Строка с абсолютным путем к файлу.
*/
///TODO Добавить проверку, что путь в пределах папки игры или Documents
export const getPathToFile = (
  pathToFile: string,
  customPaths: ISystemRootState['customPaths'],
  profileMO: string,
): string => {
  let newPath = pathToFile;
  console.log(pathToFile);
  if (CustomPathName.MO_REGEXP.test(pathToFile)) {
    if (profileMO) {
      newPath = path.join(customPaths[CustomPathName.MO], profileMO, path.basename(pathToFile));
    } else {
      throw new CustomError('Указан путь до файла в папке профилей Mod Organizer, но МО не используется.'); //eslint-disable-line max-len
    }
  } else if (CustomPathName.DOCUMENTS_REGEXP.test(pathToFile)) {
    newPath = path.join(customPaths[CustomPathName.DOCUMENTS], pathToFile.replace(CustomPathName.DOCUMENTS, ''));
  } else if (CustomPathName.GAMEDIR_REGEXP.test(pathToFile)) {
    newPath = path.join(customPaths[CustomPathName.GAMEDIR], pathToFile.replace(CustomPathName.GAMEDIR, ''));
  } else if (/%.+%/.test(pathToFile)) {
    const customPathName = pathToFile.match(/%.+%/)![0];

    // console.log(customPathName);
    if (customPaths[customPathName]) {
      newPath = path.join(customPaths[customPathName], pathToFile.replace(customPathName, ''));
    }
  } else {
    newPath = path.join(GAME_DIR, pathToFile);
  }
  console.log(newPath);
  if (!new RegExp(GAME_DIR.replace('\\', '\\\\')).test(newPath)
  && !new RegExp(DOCUMENTS_DIR.replace('\\', '\\\\')).test(newPath)) {
    throw new CustomError('Путь ведет за пределы допустимой папки.');
  }

  return newPath;
};
