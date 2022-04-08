import fs, { promises as fsPromises } from 'fs';
import path from 'path';
import iconv from 'iconv-lite';
import { Ini } from 'ini-api';
import xmlParser, { j2xParser as XMLParserForWrite } from 'fast-xml-parser';
import mime from 'mime';

import {
  LogMessageType,
  writeToLogFile,
  writeToLogFileSync,
} from '$utils/log';
import { getPathToFile, parseJSON } from '$utils/strings';
import {
  ReadWriteError,
  getReadWriteError,
  CustomError,
  ErrorCode,
  ErrorName,
  ErrorMessage,
} from '$utils/errors';
import {
  Encoding, GameSettingsFileView, LauncherButtonAction, userThemeStyleFile,
} from '$constants/misc';
import { IPathVariables, USER_THEMES_DIR } from '$constants/paths';
import { IGameSettingsFile } from '$types/gameSettings';
import { IIniObj, IXmlObj } from '$types/common';

export const xmlAttributePrefix = '@_';

export const iconvDecode = (str: string, encoding = Encoding.CP866): string => iconv.decode(
  Buffer.from(str, 'binary'),
  encoding,
);

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
 * Синхронно получить содержимое папки.
 * @param pathToDirectory Путь к папке.
 * @returns Массив с именами файлов\папок.
*/
export const readDirectorySync = (
  pathToDirectory: string,
): string[] => {
  try {
    return fs.readdirSync(pathToDirectory);
  } catch (error: any) {
    const readWriteError = getReadWriteError(error, true);

    throw new ReadWriteError(
      `Can't read folder. ${readWriteError.message}`,
      readWriteError,
      pathToDirectory,
    );
  }
};

/**
 * Синхронно создать папку.
 * @param pathToDirectory Путь к папке.
*/
export const createFolderSync = (directoryPath: string): void => {
  try {
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
    }
  } catch (error: any) {
    const readWriteError = getReadWriteError(error, true);

    throw new ReadWriteError(
      `Can't create folder. ${readWriteError.message}`,
      readWriteError,
      directoryPath,
    );
  }
};

/**
 * Асинхронно удалить папку.
 * @param pathToFolder Путь до удаляемой папки.
*/
export const deleteFolder = (pathToFolder: string): Promise<void> => fsPromises.rmdir(pathToFolder)
  .catch((error) => {
    const readWriteError = getReadWriteError(error);

    throw new ReadWriteError(
      `Can't delete folder. ${readWriteError.message}`,
      readWriteError,
      pathToFolder,
    );
  });

/**
 * Синхронно скопировать файл в указанную папку.
 * @param pathToFile Путь к файлу.
 * @param destinationPath Путь к папке, куда требуется копировать файл.
*/
export const createCopyFileSync = (pathToFile: string, destinationPath: string): void => {
  try {
    fs.copyFileSync(
      pathToFile,
      destinationPath,
    );
  } catch (error: any) {
    const readWriteError = getReadWriteError(error);

    throw new ReadWriteError(
      `Can't copy file. ${readWriteError.message}`,
      readWriteError,
      pathToFile,
    );
  }
};

/**
 * Асинхронно скопировать файл в указанную папку.
 * @param pathToFile Путь к файлу.
 * @param destinationPath Путь к папке, куда требуется копировать файл.
*/
export const createCopyFile = (
  pathToFile: string,
  destinationPath: string,
): Promise<void> => fsPromises.copyFile(pathToFile, destinationPath)
  .catch((error) => {
    const readWriteError = getReadWriteError(error);

    throw new ReadWriteError(
      `Can't copy file. ${readWriteError.message}`,
      readWriteError,
      pathToFile,
    );
  });

/**
 * Асинхронно удалить файл.
 * @param pathToFile Путь до удаляемого файла.
*/
export const deleteFile = (pathToFile: string): Promise<void> => fsPromises.unlink(pathToFile)
  .catch((error) => {
    const readWriteError = getReadWriteError(error);

    throw new ReadWriteError(
      `Can't delete file. ${readWriteError.message}`,
      readWriteError,
      pathToFile,
    );
  });

/**
 * Асинхронно переименовать файл.
 * @param pathToFile Путь до файла.
 * @param newName Новое имя файла/папки
 * @param isDir Переименование для директории или нет.
*/
export const renameFileOrFolder = (
  pathToFile: string,
  newName: string,
  isDir = false,
): Promise<void> => fsPromises.rename(
  pathToFile,
  path.join(path.dirname(pathToFile), newName),
)
  .catch((error) => {
    const readWriteError = getReadWriteError(error, isDir);

    throw new ReadWriteError(
      `Can't rename ${isDir ? 'folder' : 'file'}. ${readWriteError.message}`,
      readWriteError,
      pathToFile,
    );
  });

/**
 * Синхронно считать данные из файла.
 * @param pathToFile Путь к файлу.
 * @param encoding Кодировка считываемого файла. По-умолчанию `'utf8'`.
 * @returns Строка с данными из файла.
*/
///TODO: Добавить проверку на тип файла: текстовый или нет
export const readFileDataSync = (
  pathToFile: string,
  encoding: BufferEncoding = Encoding.UTF8 as BufferEncoding,
): string => {
  try {
    if (typeof pathToFile === 'number') {
      throw new CustomError(
        ErrorMessage.ARG_TYPE,
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
export const readFileData = (
  pathToFile: string,
): Promise<Buffer> => fsPromises.readFile(pathToFile)
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
 * Синхронно получить данные из JSON файла.
 * @param pathToFile Путь к файлу.
 * @param isWriteToLog Делать ли запись об ошибке в файле лога.
 * @returns Объект с данными из файла.
*/
export const readJSONFileSync = <T>(pathToFile: string, isWriteToLog = true): T => {
  try {
    if (
      pathToFile !== null
      && pathToFile !== undefined
      && path.extname(pathToFile.toString())
      && !mime.getType(pathToFile)?.match(/application\/json/)
    ) {
      throw new CustomError(
        'The file must have the extension .json',
        ErrorName.MIME_TYPE,
      );
    }

    const JSONstring = readFileDataSync(pathToFile);

    return parseJSON<T>(JSONstring);
  } catch (error: any) {
    if (isWriteToLog) {
      writeToLogFileSync(
        `Message: ${error.message}. Path: '${pathToFile}'.`,
        LogMessageType.ERROR,
      );
    }

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
    if (
      pathToFile !== null
      && pathToFile !== undefined
      && path.extname(pathToFile.toString())
      && !mime.getType(pathToFile)?.match(/application\/json/)
    ) {
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
 * @param isWithPrefix Добавлять ли префикс к именам атрибутов.
 * Для последующей правильной записи файла ставим `true`.
 * @param encoding Кодировка файла. По умолчанию `win1251`.
 * @returns Объект с данными из файла.
*/
export const readXMLFile = async (
  pathToFile: string,
  isWithPrefix: boolean,
  encoding = Encoding.WIN1251,
): Promise<IXmlObj> => {
  try {
    const XMLDataStr = await readFileData(pathToFile);

    return xmlParser.parse(iconv.decode(XMLDataStr, encoding), {
      attributeNamePrefix: isWithPrefix ? xmlAttributePrefix : '',
      ignoreAttributes: false,
      parseAttributeValue: false,
      parseTrueNumberOnly: true,
      allowBooleanAttributes: true,
      parseNodeValue: false,
      textNodeName: '#text',
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
 * @param file Объект файла.
 * @param pathVariables Переменные путей.
 * @param moProfile Профиль МО.
 * @param isWithPrefix Нужно ли добавлять префикс к именам атрибутов.
*/
export const readFileForGameSettingsOptions = async (
  file: IGameSettingsFile,
  pathVariables: IPathVariables,
  moProfile: string,
  defaultEncoding: Encoding,
  isWithPrefix: boolean,
): Promise<{ [key: string]: IIniObj|IXmlObj, }> => {
  let fileData: IIniObj|IXmlObj = {};

  if (file.view === GameSettingsFileView.LINE || file.view === GameSettingsFileView.SECTIONAL) {
    fileData = await readINIFile(getPathToFile(file.path, pathVariables, moProfile), file.encoding as Encoding || defaultEncoding);
  } else if (file.view === GameSettingsFileView.TAG) {
    fileData = await readXMLFile(getPathToFile(file.path, pathVariables, moProfile), isWithPrefix, file.encoding as Encoding || defaultEncoding);
  }

  return {
    [file.id]: fileData,
  };
};
/**
 * Асинхронно получить данные из файла для последующей генерации игровых настроек.
 * @param pathToFile Путь к файлу.
 * @param fileView Структура(вид) файла. На его основе определяется метод для чтения файла.
 * @param name Имя для определения файла при генерации опций.
 * @param encoding Кодировка файла.
 * @param isWithPrefix Нужно ли добавлять префикс к именам атрибутов.
*/
// export const readFileForGameSettingsOptions = async (
//   pathToFile: string,
//   fileView: string,
//   name: string,
//   encoding: string,
//   isWithPrefix: boolean,
// ): Promise<{ [key: string]: IIniObj|IXmlObj, }> => {
//   let fileData: IIniObj|IXmlObj = {};

//   if (fileView === GameSettingsFileView.LINE || fileView === GameSettingsFileView.SECTIONAL) {
//     fileData = await readINIFile(pathToFile, encoding);
//   } else if (fileView === GameSettingsFileView.TAG) {
//     fileData = await readXMLFile(pathToFile, isWithPrefix, encoding);
//   }

//   return {
//     [name]: fileData,
//   };
// };

/**
 * Синхронно записать файл.
 * @param pathToFile Путь к файлу.
 * @param data Данные для записи в файл, строка или буфер.
*/
export const writeFileDataSync = (pathToFile: string, data: string|Buffer): void => {
  try {
    fs.writeFileSync(pathToFile, data);
  } catch (error: any) {
    const readWriteError = getReadWriteError(error);

    throw new ReadWriteError(
      `Can't write file. ${readWriteError.message}`,
      readWriteError,
      pathToFile,
    );
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
  data: { [key: string]: any, },
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
  encoding: string,
): Promise<void> => writeFileData(pathToFile, iconv.encode(iniDataObj.stringify(), encoding))
  .catch((error) => {
    writeToLogFile(
      `Message: ${error.message}. Path: '${pathToFile}'`,
      LogMessageType.ERROR,
    );

    throw error;
  });

/**
 * Асинхронно записать XML файл.
 * @param pathToFile Путь к файлу.
 * @param xmlDataObj Данные для записи в файл.
 * @param encoding Кодировка записываемого файла.
*/
export const writeXMLFile = (
  pathToFile: string,
  xmlDataObj: IXmlObj,
  encoding: string,
): Promise<void> => writeFileData(
  pathToFile,
  iconv.encode(new XMLParserForWrite({
    format: true,
    ignoreAttributes: false,
    attributeNamePrefix: xmlAttributePrefix,
    indentBy: '\t',
    textNodeName: '#text',
    supressEmptyNode: true,
  }).parse(xmlDataObj), encoding),
)
  .catch((error) => {
    writeToLogFile(
      `Message: ${error.message}. Path: '${pathToFile}'`,
      LogMessageType.ERROR,
    );

    throw error;
  });

export const writeGameSettingsFile = async (
  pathToFile: string,
  dataObj: IIniObj|IXmlObj,
  fileView: string,
  encoding: string,
): Promise<void> => {
  if (fileView === GameSettingsFileView.LINE || fileView === GameSettingsFileView.SECTIONAL) {
    await writeINIFile(
      pathToFile,
      dataObj as IIniObj,
      encoding,
    );
  } else if (fileView === GameSettingsFileView.TAG) {
    await writeXMLFile(
      pathToFile,
      dataObj,
      encoding,
    );
  }
};

export const checkIsThemeExists = (
  themeName: string,
): boolean => fs.existsSync(path.join(USER_THEMES_DIR, themeName))
    && fs.existsSync(path.join(USER_THEMES_DIR, themeName, userThemeStyleFile));

/**
 * Получить список папок пользовательских тем.
*/
export const getUserThemesFolders = (): string[] => {
  try {
    const themesFolderContent = readDirectorySync(USER_THEMES_DIR);

    if (themesFolderContent.length > 0) {
      const themesFolders = themesFolderContent.filter((item) => !path.extname(item));

      if (themesFolders.length > 0) {
        const foldersReadResults = themesFolders.map((folder) => {
          try {
            return readDirectorySync(path.join(USER_THEMES_DIR, folder));
          } catch (error) {
            return [];
          }
        });

        return foldersReadResults.reduce<string[]>((folders, currentResult, index) => {
          if (currentResult.includes(userThemeStyleFile)) {
            return [...folders, themesFolders[index]];
          }

          return [...folders];
        }, []);
      }
    }

    return [];
  } catch (error: any) {
    let errorMsg = '';

    if (error instanceof ReadWriteError) {
      errorMsg = `${error.message}. Path: ${error.path}`;
    } else {
      errorMsg = error.message;
    }
    writeToLogFileSync(
      `Can't get list of user themes. Reason: ${errorMsg}.`,
      LogMessageType.WARNING,
    );

    return [];
  }
};

/**
 * Вызывает диалоговое окно для выбора пути и возвращает путь к файлу,
 * отсекая директорию до папки игры.
 * @param dialog Компонент `dialog` из Electron.
 * @param currentWindow Текущее окно, из которого вызывается команда выбора пути.
 * @param selectorType Тип селектора: выбира пути до файла или папки?
 * @param startPath Начальный путь, с которым открывается окно выбора пути.
 * @param extensions Доступные расширения файлов для выбора в селекторе файла.
*/
export const getPathFromFileInput = async (
  dialog: Electron.Dialog,
  currentWindow: Electron.BrowserWindow,
  selectorType: string,
  startPath = '',
  extensions = ['*'],
): Promise<string> => {
  try {
    const pathObj = await dialog.showOpenDialog(currentWindow, {
      defaultPath: startPath,
      properties: [selectorType === LauncherButtonAction.RUN ? 'openFile' : 'openDirectory'],
      filters: [{ name: 'File', extensions }],
    });

    if (pathObj.filePaths.length === 0) {
      return '';
    }

    return pathObj.filePaths[0];
  } catch (error: any) {
    return '';
  }
};
