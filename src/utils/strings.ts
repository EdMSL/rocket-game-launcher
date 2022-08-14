import path from 'path';

import { CustomError, ErrorName } from './errors';
import {
  GameSettingsOptionType,
  PathRegExp,
  PathVariableName,
  pathVariablesCheckOrderArr,
} from '$constants/misc';
import {
  GAME_DIR, IPathVariables,
} from '$constants/paths';

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
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
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
 * Получить число знаков после запятой.
 * @param value Число, у которого нужно определить кол-во знаков.
 * @returns Число знаков.
*/
export const getNumberOfDecimalPlaces = (value: string|number): number => {
  const valueParts = value.toString().split('.');

  return valueParts.length === 2 ? valueParts[1].length : 0;
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
 * Получить строку-список вида `ключ: значение` из объекта.
 * @param obj Объект, для которого получаем список.
 * @param isWithIndent Ставить ли отступ перед каждым элементом списка.
 * @returns Строка в виде списка.
 * ```js
 * `a: some
 * b: any
 * c: new`
 * ```
*/
export const getObjectAsList = (
  obj: Record<string, any>, //eslint-disable-line @typescript-eslint/no-explicit-any
  isWithIndent = false,
  isClearEmpty = false,
): string => Object.keys(obj)
  .reduce<string[]>((acc, currentKey) => {
    if (isClearEmpty && !obj[currentKey]) {
      return [...acc];
    }

    return [...acc, `${currentKey}: ${obj[currentKey]}`];
  }, [])
  .join(`\n${isWithIndent ? '\t' : ''}`);

const createRegexp = (
  pathForRegEpx: string,
): RegExp => new RegExp(pathForRegEpx.replaceAll('\\', '\\\\'));

/**
 *
 * @param parameterName Имя параметра.
 * @returns Регулярное выражение для поиска строки с заданным именем параметра.
 */
export const getRegExpForLineIniParameter = (
  parameterName: string,
): RegExp => new RegExp(`set\\s+${parameterName}\\s+to\\s+(.+)$`, 'i');

/**
 * Получить путь с отсеченной переменной пути.
 * @param currPath Путь для очистки.
 * @returns Строка пути без переменной пути.
*/
const clearPathVaribaleFromPathString = (
  currPath: string,
): string => {
  const newStr = currPath;

  return newStr.replace(/%.*%\\?/, '');
};

/**
 * Получить переменную пути и остаточный путь из строки пути.
 * @param pathStr Путь для обработки.
 * @returns Массив из строк переменной и остатка пути.
*/
export const getVariableAndValueFromPath = (pathStr: string): [string, string] => {
  if (pathStr) {
    const pathVariable = pathStr.match(PathRegExp.PATH_VARIABLE)![0];
    const pathValue = clearPathVaribaleFromPathString(pathStr);

    return [pathVariable, pathValue];
  }

  return ['', ''];
};

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
 * Получить строки с пробелами после параметра и перед значением.
 * Пробелы ставятся до и после разделителя в строке параметра.
 * @param parameterStr Строка параметра.
 * @returns Массив, содержащий строки с пробелами до и после разделителя.
 */
export const getSpacesFromParameterString = (parameterStr: string): [string, string] => {
  const separator = parameterStr.includes('=') ? '=' : 'to';
  const forBeforeResult = parameterStr.match(
    new RegExp(`(\\s${separator === 'to' ? '+' : '*'})${separator}`),
  );
  const forAfterResult = parameterStr.match(
    new RegExp(`(?<=${separator})\\s${separator === 'to' ? '+' : '*'}(?<!\\S)`),
  );

  return [
    forBeforeResult !== null ? forBeforeResult[0].replace(separator, '') : '',
    forAfterResult !== null ? forAfterResult[0] : '',
  ];
};

/**
 * Получить значение параметра из файла вида `line`.
 * @param lineText Строка, в которой осуществляется поиск.
 * @param parameterName Имя параметра, который ищем.
 * @returns Найденная значение.
*/
export const getLineIniParameterValue = (lineText: string, parameterName: string): string => {
  const paramResult = lineText.match(getRegExpForLineIniParameter(parameterName.trim()));

  if (paramResult) {
    const value = paramResult[0].match(/\s+to\s+([^;]+);?/);

    if (value && value.length > 1) {
      return value[1].trim();
    }
  }

  return '';
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
 * @param pathStr Изменяемый путь.
 * @param availablePathVariables Переменная для замены.
 * @param pathVariables Корневая папка в изменяемом пути, которую нужно заменить.
 * @returns Строка пути с переменной вместо корневой папки.
*/
export const replaceRootDirByPathVariable = (
  pathStr: string,
  availablePathVariables: string[],
  pathVariables: IPathVariables,
): string => {
  const newPathStr = pathStr;

  const availablePathVariablesOrder = pathVariablesCheckOrderArr.filter(
    (current) => availablePathVariables.includes(current),
  );
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

/**
 * Получает строку пути из поля `hash` у ссылки `Link` или `NavLink`.
 * @param hash Строка хэша пути.
 * @returns Строка пути.
 */
export const getPathFromLinkHash = (hash: string): string => hash.substring(1);

/**
 * Заменяет переменную пути в переданной строке на заданный путь.
 * @param pathStr Изменяемый путь.
 * @param pathVariable Переменная пути, которую меняем.
 * Необходимо указать, если отличается от GAME_DIR.
 * @param rootDirPathStr Путь для замены. Необходимо указать, если отличается от GAME_DIR.
 * @returns Строка пути с путем к корневой папкой вместо переменной.
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
 * Заменяет текущую переменную пути на другую.
 * @param pathStr Изменяемый путь.
 * @param pathVariable Переменная пути, на которую меняем. По умолчанию `%GAME_DIR%`.
 * @returns Строка пути с переменной.
*/
export const replacePathVariableByAnother = (
  pathStr: string,
  pathVariable = PathVariableName.GAME_DIR,
): string => {
  const newStr = pathStr;
  const currentPathVariable = newStr.match(PathRegExp.PATH_VARIABLE)![0];

  return newStr.replace(currentPathVariable, pathVariable).trim();
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
 * Проверяет, является ли путь допустимым. На данный момент разрешены пути,
 * которые находятся в пределах корневой папки игры и папки файлов игры в папке пользователя.
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
    throw new CustomError(
      `The path is outside of a valid folder. Path: ${pathForCheck}`,
      ErrorName.INVALID_DIRECTORY,
    );
  }
};

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

/**
 * Получает регулярное выражение для проверки корректности значения в TextArea
 * для игрового параметра из игровой опции.
 * @param optionType Тип игровой опции.
 * @param separator Разделитель между значениями параметров в подстроке значения опции.
 * @param itemsLength Количество параметров, используемых в опции.
 * @returns Регулярное выражение для проверки.
 */
export const getOptionItemSelectValueRegExp = (
  optionType: GameSettingsOptionType,
  separator?: string|undefined,
  itemsLength?: number|undefined,
): RegExp => {
  if (optionType === GameSettingsOptionType.COMBINED) {
    return new RegExp(`^[^=]+(?<=\\S)=[^${separator}=\\s]+(?<=\\S)(${separator}[^${separator}=\\s][^${separator}=]*){${itemsLength}}[^${separator}=]*$`); //eslint-disable-line max-len
  }

  return /^[^=][^=]*(?<=\S)=[^\s=][^=]*$/;
};
