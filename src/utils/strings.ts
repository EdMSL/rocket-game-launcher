import { writeToLogFileSync } from '$utils/log';

export const getPathNameFromLocationPath = (path: string): string => path.slice(1);

/**
 * Преобразовать JSON строку в объект.
 * @param jsonString Строка для преобразования.
 * @returns Объект с параметрами из JSON. Если возникает ошибка, то возвращается null.
*/
///TODO: Типизировать функцию так, чтобы получать нужный объект.
export const parseJSON = (jsonString: string): Record<string, unknown>|null => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    writeToLogFileSync(error, true);

    return null;
  }
};
