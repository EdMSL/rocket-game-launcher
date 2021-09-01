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
  } catch (error) {
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

export const getParameterRegExp = (parameterName): RegExp => new RegExp(`set[\\s]+${parameterName}[\\s]+to[\\s]+[-0-9]+`, 'i');

export const getLineIniParameterValue = (ini: string, parameterName: string): string => {
  const value = ini.match(getParameterRegExp(parameterName));
  // @ts-ignore
  // Возвращается в любом случае массив, типы для match указаны неверно
  return value[0].match(/\s[-0-9]+/)[0].trim() ?? '';
};
