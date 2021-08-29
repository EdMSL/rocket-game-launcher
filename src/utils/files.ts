import fs, { promises as fsPromises } from 'fs';
import iconv from 'iconv-lite';
import { Ini } from 'ini-api';

import {
  LogMessageType,
  writeToLogFile,
  writeToLogFileSync,
} from '$utils/log';
import { parseJSON } from '$utils/strings';
import {
  ReadWriteError,
  getReadWriteError,
  CustomError,
  ErrorCode,
  ErrorName,
} from '$utils/errors';
import { Encoding } from '$constants/misc';

interface IIniLine {
  text: string,
  comment: string,
  lineType: number,
  key?: string,
  value?: string,
}

interface IIniSection {
  lines: IIniLine[],
  name: string,
  getValue: (key: string) => string,
}

export interface IIni {
  globals: {
    lines: IIniLine[],
  },
  lineBreak: string,
  sections: IIniSection[],
  stringify: () => string,
  getSection: (name: string) => IIniSection,
  addSection: (name: string) => IIniSection,
}
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
  encoding: BufferEncoding = Encoding.UTF8 as BufferEncoding,
): string => {
  try {
    if (typeof pathToFile === 'number') {
      throw new CustomError(
        'The argument in path must not be a number',
        ErrorName.ARG_TYPE,
        ErrorCode.ARG_TYPE,
      );
    }

    return fs.readFileSync(pathToFile, encoding);
  } catch (error) {
    const readWriteError = getReadWriteError(error);

    throw new ReadWriteError(`Can't read file. ${readWriteError.message}`, readWriteError);
  }
};

/**
 * Асинхронно получить данные из файла.
 * @param pathToFile Путь к файлу.
 * @returns Buffer с данными из файла.
*/
export const readFileData = (pathToFile: string): Promise<Buffer> => fsPromises.readFile(pathToFile)
  .then((data) => data)
  .catch((error) => {
    const readWriteError = getReadWriteError(error);

    throw new ReadWriteError(`Can't read file. ${readWriteError.message}`, readWriteError);
  });

export const readDirectory = (
  pathToDirectory: string,
): Promise<string[]> => fsPromises.readdir(pathToDirectory)
  .then((data) => data)
  .catch((error) => {
    const readWriteError = getReadWriteError(error);

    throw new ReadWriteError(`Can't read directory. ${readWriteError.message}`, readWriteError);
  });

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
      LogMessageType.ERROR,
    );

    throw error;
  }
};

/**
 * Асинхронно получить данные из JSON файла.
 * @param pathToFile Путь к файлу.
 * @returns Объект с данными из файла.
*/
export const readJSONFile = async <T>(pathToFile: string): Promise<T> => {
  try {
    const JSONstring = await readFileData(pathToFile)
      .then((dataBuffer) => dataBuffer.toString());

    return parseJSON<T>(JSONstring);
  } catch (error) {
    writeToLogFileSync(
      `Message: ${error.message}. Path: ${pathToFile}.`,
      LogMessageType.ERROR,
    );

    throw error;
  }
};

/**
 * Асинхронно получить данные из INI файла.
 * @param pathToFile Путь к файлу.
 * @returns Объект с данными из файла.
*/
export const readINIFile = async (
  pathToFile: string,
  encoding = Encoding.WIN1251,
): Promise<IIni> => {
  try {
    const INIData = await readFileData(pathToFile);

    return new Ini(iconv.decode(INIData, encoding));
  } catch (error) {
    writeToLogFileSync(
      `Message: ${error.message}. Path: ${pathToFile}.`,
      LogMessageType.ERROR,
    );

    throw error;
  }
};

/**
 * Асинхронно записать файл.
 * @param pathToFile Путь к файлу.
 * @param data Данные для записи в файл, строка или буфер.
*/
export const writeFileData = (
  pathToFile: string,
  data: string|Buffer,
): Promise<void> => fsPromises.writeFile(pathToFile, data)
  .catch((error) => {
    const readWriteError = getReadWriteError(error);

    throw new ReadWriteError(`Can't write file. ${readWriteError.message}`, readWriteError);
  });

/**
 * Асинхронно записать JSON файл.
 * @param pathToFile Путь к файлу.
 * @param data Данные для записи в файл, строка или буфер.
*/
export const writeJSONFile = (
  pathToFile: string,
  data: Record<string, unknown>,
): Promise<void> => writeFileData(pathToFile, JSON.stringify(data))
  .catch((error) => {
    writeToLogFile(
      `Message: ${error.message}. Path: ${pathToFile}`,
      LogMessageType.ERROR,
    );

    throw error;
  });

/**
 * Асинхронно записать INI файл.
 * @param pathToFile Путь к файлу.
 * @param iniDataObj Данные для записи в файл.
 * @param encoding Кодировка записываемого файла.
*/
export const writeINIFile = (
  pathToFile: string,
  iniDataObj: IIni,
  encoding = Encoding.WIN1251,
): Promise<void> => writeFileData(pathToFile, iconv.encode(iniDataObj.stringify(), encoding))
  .catch((error) => {
    writeToLogFile(
      `Message: ${error.message}. Path: ${pathToFile}`,
      LogMessageType.ERROR,
    );

    throw error;
  });

export const iconvDecode = (str: string, encoding = Encoding.CP866): string => iconv.decode(
  Buffer.from(str, 'binary'),
  encoding,
);

