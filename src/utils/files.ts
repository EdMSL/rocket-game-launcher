import fs, { promises as fsPromises } from 'fs';
import path from 'path';
import iconv from 'iconv-lite';
import { Ini } from 'ini-api';
import xmlParser from 'fast-xml-parser';
import mime from 'mime';

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
import { Encoding, UsedFileView } from '$constants/misc';
import { ISystemRootState } from '$types/system';

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

export interface IIniObj {
  globals: {
    lines: IIniLine[],
  },
  lineBreak: string,
  sections: IIniSection[],
  stringify: () => string,
  getSection: (name: string) => IIniSection,
  addSection: (name: string) => IIniSection,
}

export interface IXmlObj {
  [key: string]: any,
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
  } catch (error: any) {
    const readWriteError = getReadWriteError(error);

    throw new ReadWriteError(
      `Can't read file. ${readWriteError.message}`,
      readWriteError,
      pathToFile,
    );
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

    throw new ReadWriteError(
      `Can't read file. ${readWriteError.message}`,
      readWriteError,
      pathToFile,
    );
  });

/**
 * Асинхронно получить содержимое папки.
 * @param pathToDirectory Путь к папке.
 * @returns Массив с именами файлов\папок.
*/
export const readDirectory = (
  pathToDirectory: string,
): Promise<string[]> => fsPromises.readdir(pathToDirectory)
  .then((data) => data)
  .catch((error) => {
    const readWriteError = getReadWriteError(error, true);

    throw new ReadWriteError(
      `Can't read directory. ${readWriteError.message}`,
      readWriteError,
      pathToDirectory,
    );
  });

/**
 * Синхронно получить данные из JSON файла.
 * @param pathToFile Путь к файлу.
 * @returns Объект с данными из файла.
*/
export const readJSONFileSync = <T>(pathToFile: string): T => {
  try {
    if (!mime.getType(pathToFile)?.match(/application\/json/)) {
      throw new CustomError(
        'The file must have the extension .json',
        ErrorName.MIME_TYPE,
      );
    }

    const JSONstring = readFileDataSync(pathToFile);

    return parseJSON<T>(JSONstring);
  } catch (error: any) {
    writeToLogFileSync(
      `Message: ${error.message}. Path: '${pathToFile}'.`,
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
    if (!mime.getType(pathToFile)?.match(/application\/json/)) {
      throw new CustomError(
        'The file must have the extension .json',
        ErrorName.MIME_TYPE,
      );
    }

    const JSONstring = await readFileData(pathToFile)
      .then((dataBuffer) => dataBuffer.toString());

    return parseJSON<T>(JSONstring);
  } catch (error: any) {
    writeToLogFileSync(
      `Message: ${error.message}. Path: '${pathToFile}'.`,
      LogMessageType.ERROR,
    );

    throw error;
  }
};

/**
 * Асинхронно получить данные из INI файла.
 * @param pathToFile Путь к файлу.
 * @param encoding Кодировка файла. По умолчанию `win1251`.
 * @returns Объект с данными из файла.
*/
export const readINIFile = async (
  pathToFile: string,
  encoding = Encoding.WIN1251,
): Promise<IIniObj> => {
  try {
    const INIData = await readFileData(pathToFile);

    return new Ini(iconv.decode(INIData, encoding));
  } catch (error: any) {
    writeToLogFileSync(
      `Message: ${error.message}. Path: '${pathToFile}'.`,
      LogMessageType.ERROR,
    );

    throw error;
  }
};

/**
 * Асинхронно получить данные из XML файла или файла со схожей структурой.
 * @param pathToFile Путь к файлу.
 * @param encoding Кодировка файла. По умолчанию `win1251`.
 * @returns Объект с данными из файла.
*/
export const readXMLFile = async (
  pathToFile: string,
  encoding = Encoding.WIN1251,
): Promise<IXmlObj> => {
  try {
    const XMLDataStr = await readFileData(pathToFile);

    return xmlParser.parse(iconv.decode(XMLDataStr, encoding), {
      attributeNamePrefix: '',
      ignoreAttributes: false,
      parseAttributeValue: true,
    });
  } catch (error: any) {
    writeToLogFileSync(
      `Message: ${error.message}. Path: '${pathToFile}'.`,
      LogMessageType.ERROR,
    );

    throw error;
  }
};

/**
 * Асинхронно получить данные из файла для последующей генерации игровых настроек.
 * @param pathToFile Путь к файлу.
 * @param fileView Структура(вид) файла. На его основе определяется метод для чтения файла.
 * @param name Имя для определения файла при генерации опций.
 * @param encoding Кодировка файла.
*/
export const readFileForGameOptions = async (
  pathToFile: string,
  fileView: string,
  name: string,
  encoding: string,
): Promise<{ [key: string]: IIniObj|IXmlObj, }> => {
  let fileData: IIniObj|IXmlObj = {};

  if (fileView === UsedFileView.LINE || fileView === UsedFileView.SECTIONAL) {
    fileData = await readINIFile(pathToFile, encoding);
  } else if (fileView === UsedFileView.TAG) {
    fileData = await readXMLFile(pathToFile, encoding);
  }

  return {
    [name]: fileData,
  };
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

    throw new ReadWriteError(
      `Can't write file. ${readWriteError.message}`,
      readWriteError,
      pathToFile,
    );
  });

/**
 * Асинхронно записать JSON файл.
 * @param pathToFile Путь к файлу.
 * @param data Данные для записи в файл, строка или буфер.
*/
export const writeJSONFile = (
  pathToFile: string,
  data: Record<string, unknown>,
): Promise<void> => writeFileData(pathToFile, JSON.stringify(data, null, 2))
  .catch((error) => {
    writeToLogFile(
      `Message: ${error.message}. Path: '${pathToFile}'`,
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
  iniDataObj: IIniObj,
  encoding = Encoding.WIN1251,
): Promise<void> => writeFileData(pathToFile, iconv.encode(iniDataObj.stringify(), encoding))
  .catch((error) => {
    writeToLogFile(
      `Message: ${error.message}. Path: '${pathToFile}'`,
      LogMessageType.ERROR,
    );

    throw error;
  });

export const iconvDecode = (str: string, encoding = Encoding.CP866): string => iconv.decode(
  Buffer.from(str, 'binary'),
  encoding,
);

export const getPathToFile = (
  pathToFile: string,
  customPaths: ISystemRootState['customPaths'],
  profile: string,
): string => {
  if (/%MO%/.test(pathToFile)) {
    if (profile) {
      return path.resolve(customPaths['%MO%'], profile, pathToFile);
    }
    throw new CustomError('Указан путь до файла в папке профилей Mod Organizer, но МО не используется.'); //eslint-disable-line max-len
  } else if (/%DOCUMENTS%/.test(pathToFile)) {
    return path.resolve(customPaths['%DOCUMENTS%'], pathToFile);
  }
  return pathToFile;
};
