import fs from 'fs';

import { LOG_MESSAGE_TYPE, writeToLogFileSync } from '$utils/log';
import { parseJSON } from '$utils/strings';
import { ReadError, NotFoundError, ErrorTypes } from '$utils/errors';

/**
 * Синхронно считать данные из файла.
 * @param pathToFile Путь к файлу.
 * @param encoding Кодировка считываемого файла.
 * @returns Строка с данными из файла. Если возникает ошибка, то вернется пустая строка.
*/
export const readFileDataSync = (
  pathToFile: string,
  encoding: BufferEncoding = 'utf-8',
): string|null => {
  try {
    if (fs.existsSync(pathToFile)) {
      return fs.readFileSync(pathToFile, encoding);
    } else {
      throw new NotFoundError('File not found');
    }
  } catch (error) {
    throw new ReadError(`Can't read file. ${error.message}`, error);
  }
};

export const readJSONFileSync = <T>(pathToFile: string): T => {
  try {
    const JSONstring = readFileDataSync(pathToFile);

    return parseJSON<T>(JSONstring);
  } catch (error) {
    writeToLogFileSync(`${error.message}. File: ${pathToFile}`, LOG_MESSAGE_TYPE.ERROR);

    throw error;
  }
};
