import fs, { promises as fsPromises } from 'fs';

import { LOG_MESSAGE_TYPE, writeToLogFile, writeToLogFileSync } from '$utils/log';
import { parseJSON } from '$utils/strings';
import { ReadError, NotFoundError } from '$utils/errors';

/**
 * Синхронно считать данные из файла.
 * @param pathToFile Путь к файлу.
 * @param encoding Кодировка считываемого файла. По-умолчанию `'utf8'`.
 * @returns Строка с данными из файла.
*/
export const readFileDataSync = (
  pathToFile: string,
  encoding: BufferEncoding = 'utf-8',
): string|null => {
  try {
    if (fs.existsSync(pathToFile)) {
      console.log(pathToFile);

      return fs.readFileSync(pathToFile, encoding);
    } else {
      throw new NotFoundError('File not found');
    }
  } catch (error) {
    throw new ReadError(`Can't read file. ${error.message}`, error);
  }
};

/**
 * Синхронно получить данные из JSON файла.
 * @param pathToFile Путь к файлу.
 * @returns Объект с данными из файла.
*/
export const readJSONFileSync = <T>(pathToFile: string): T => {
  try {
    const JSONstring = readFileDataSync(pathToFile);

    return parseJSON<T>(JSONstring);
  } catch (error) {
    writeToLogFileSync(`Message: ${error.message}. File: ${pathToFile}.`, LOG_MESSAGE_TYPE.ERROR);

    throw error;
  }
};

/**
 * Асинхронно записать файл.
 * @param pathToFile Путь к файлу.
 * @param data Данные для записи в файл, строка или буфер.
 * @param encoding Кодировка записываемого файла. По-умолчанию `'utf8'`.
 * @returns Promise
*/
const writeFileData = (
  pathToFile: string,
  data: string|Buffer,
  encoding: BufferEncoding = 'utf-8',
): Promise<void> => fsPromises.writeFile(pathToFile, data, encoding)
  .then()
  .catch((error) => {
    throw new Error(`Can't write to file. ${error.message}`);
  });

/**
 * Асинхронно записать JSON файл.
 * @param pathToFile Путь к файлу.
 * @param data Данные для записи в файл, строка или буфер.
 * @returns Promise
*/
export const writeJSONFile = (
  pathToFile: string,
  data: Record<string, unknown>,
): Promise<void> => writeFileData(pathToFile, JSON.stringify(data))
  .catch((error) => {
    writeToLogFile(
      `Message: ${error.message}. File: ${pathToFile}`,
      LOG_MESSAGE_TYPE.ERROR,
    );

    throw error;
  });
