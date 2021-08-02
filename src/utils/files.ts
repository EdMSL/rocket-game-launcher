import fs, { promises as fsPromises } from 'fs';

import { LOG_MESSAGE_TYPE, writeToLogFile, writeToLogFileSync } from '$utils/log';
import { parseJSON } from '$utils/strings';
import {
  ReadWriteError, getReadWriteError, InvalidArgumentError,
} from '$utils/errors';

/**
 * Синхронно считать данные из файла.
 * @param pathToFile Путь к файлу.
 * @param encoding Кодировка считываемого файла. По-умолчанию `'utf8'`.
 * @returns Строка с данными из файла.
*/
///TODO: Добавить проверку на тип файла: текстовый или нет
///TODO: Добавить пакет для работы с файлами в другой кодировке
export const readFileDataSync = (
  pathToFile: string,
  encoding: BufferEncoding = 'utf-8',
): string => {
  try {
    if (typeof pathToFile === 'number') {
      throw new InvalidArgumentError(
        'The argument in path must not be a number',
      );
    }

    return fs.readFileSync(pathToFile, encoding);
  } catch (error) {
    const readWriteError = getReadWriteError(error);

    throw new ReadWriteError(`Can't read file. ${readWriteError.message}`, readWriteError);
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
    writeToLogFileSync(
      `Message: ${error.message}. Path: ${pathToFile}.`,
      LOG_MESSAGE_TYPE.ERROR,
    );

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
export const writeFileData = (
  pathToFile: string,
  data: string|Buffer,
  encoding: BufferEncoding = 'utf-8',
): Promise<void> => fsPromises.writeFile(pathToFile, data, encoding)
  .catch((error) => {
    const readWriteError = getReadWriteError(error);

    throw new ReadWriteError(`Can't write file. ${readWriteError.message}`, readWriteError);
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
      `Message: ${error.message}. Path: ${pathToFile}`,
      LOG_MESSAGE_TYPE.ERROR,
    );

    throw error;
  });
