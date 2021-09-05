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

export const getParameterRegExp = (parameterName): RegExp => new RegExp(`set\\s+${parameterName}\\s+to\\s+(.+)$`, 'i');

export const getLineIniParameterValue = (ini: string, parameterName: string): string => {
  const paramResult = ini.match(getParameterRegExp(parameterName.trim()));

  if (paramResult!?.length > 0) {
    // @ts-ignore
    const value = paramResult[0].match(/to\s+(.+)$/);

    if (value!?.length > 1) {
      // @ts-ignore
      return value[1].trim();
    }
  }

  return '';
};
