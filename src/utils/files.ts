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

export const isDataFromIniFile = (
  fileView: string,
  obj: IIniObj|IXmlObj,
): obj is IIniObj => fileView === GameSettingsFileView.LINE
  || fileView === GameSettingsFileView.SECTIONAL;

/**
 * Асинхронно получить содержимое папки.
 * @param directoryPath Путь к папке.
 * @returns Массив с именами файлов\папок.
*/
export const readDirectory = (
  directoryPath: string,
): Promise<string[]> => fsPromises.readdir(directoryPath)
  .then((data) => data)
  .catch((error) => {
    const readWriteError = getReadWriteError(error, true);

    throw new ReadWriteError(
      `Can't read directory. ${readWriteError.message}`,
      readWriteError,
      directoryPath,
    );
  });

/**
 * Синхронно получить содержимое папки.
 * @param directoryPath Путь к папке.
 * @returns Массив с именами файлов\папок.
*/
export const readDirectorySync = (
  directoryPath: string,
): string[] => {
  try {
    return fs.readdirSync(directoryPath);
  } catch (error: any) {
    const readWriteError = getReadWriteError(error, true);

    throw new ReadWriteError(
      `Can't read folder. ${readWriteError.message}`,
      readWriteError,
      directoryPath,
    );
  }
};

/**
 * Синхронно создать папку.
 * @param directoryPath Путь к новой папке.
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
 * @param directoryPath Путь до удаляемой папки.
*/
export const deleteFolder = (
  directoryPath: string,
): Promise<void> => fsPromises.rmdir(directoryPath)
  .catch((error) => {
    const readWriteError = getReadWriteError(error);

    throw new ReadWriteError(
      `Can't delete folder. ${readWriteError.message}`,
      readWriteError,
      directoryPath,
    );
  });

/**
 * Синхронно скопировать файл в указанную папку.
 * @param filePath Путь к файлу.
 * @param destinationPath Путь к папке, куда требуется копировать файл.
*/
export const createCopyFileSync = (filePath: string, destinationPath: string): void => {
  try {
    fs.copyFileSync(
      filePath,
      destinationPath,
    );
  } catch (error: any) {
    const readWriteError = getReadWriteError(error);

    throw new ReadWriteError(
      `Can't copy file. ${readWriteError.message}`,
      readWriteError,
      filePath,
    );
  }
};

/**
 * Асинхронно скопировать файл в указанную папку.
 * @param filePath Путь к файлу.
 * @param destinationPath Путь к папке, куда требуется копировать файл.
*/
export const createCopyFile = (
  filePath: string,
  destinationPath: string,
): Promise<void> => fsPromises.copyFile(filePath, destinationPath)
  .catch((error) => {
    const readWriteError = getReadWriteError(error);

    throw new ReadWriteError(
      `Can't copy file. ${readWriteError.message}`,
      readWriteError,
      filePath,
    );
  });

/**
 * Асинхронно удалить файл.
 * @param filePath Путь до удаляемого файла.
*/
export const deleteFile = (filePath: string): Promise<void> => fsPromises.unlink(filePath)
  .catch((error) => {
    const readWriteError = getReadWriteError(error);

    throw new ReadWriteError(
      `Can't delete file. ${readWriteError.message}`,
      readWriteError,
      filePath,
    );
  });

/**
 * Асинхронно переименовать файл/папку.
 * @param oldPath Путь до файла/папки.
 * @param newName Новое имя файла/папки
 * @param isDir Переименование папки?.
*/
export const renameFileOrFolder = (
  oldPath: string,
  newName: string,
  isDir = false,
): Promise<void> => fsPromises.rename(
  oldPath,
  path.join(path.dirname(oldPath), newName),
)
  .catch((error) => {
    const readWriteError = getReadWriteError(error, isDir);

    throw new ReadWriteError(
      `Can't rename ${isDir ? 'folder' : 'file'}. ${readWriteError.message}`,
      readWriteError,
      oldPath,
    );
  });

/**
 * Синхронно считать данные из файла.
 * @param filePath Путь к файлу.
 * @param encoding Кодировка считываемого файла. По-умолчанию `'utf8'`.
 * @returns Строка с данными из файла.
*/
///TODO: Добавить проверку на тип файла: текстовый или нет
export const readFileDataSync = (
  filePath: string,
  encoding: BufferEncoding = Encoding.UTF8 as BufferEncoding,
): string => {
  try {
    if (typeof filePath === 'number') {
      throw new CustomError(
        ErrorMessage.ARG_TYPE,
        ErrorName.ARG_TYPE,
        ErrorCode.ARG_TYPE,
      );
    }

    return fs.readFileSync(filePath, encoding);
  } catch (error: any) {
    const readWriteError = getReadWriteError(error);

    throw new ReadWriteError(
      `Can't read file. ${readWriteError.message}`,
      readWriteError,
      filePath,
    );
  }
};

/**
 * Асинхронно получить данные из файла.
 * @param filePath Путь к файлу.
 * @returns Buffer с данными из файла.
*/
export const readFileData = (
  filePath: string,
): Promise<Buffer> => fsPromises.readFile(filePath)
  .then((data) => data)
  .catch((error) => {
    const readWriteError = getReadWriteError(error);

    throw new ReadWriteError(
      `Can't read file. ${readWriteError.message}`,
      readWriteError,
      filePath,
    );
  });

/**
 * Синхронно получить данные из JSON файла.
 * @param filePath Путь к файлу.
 * @param isWriteToLog Делать ли запись об ошибке в файле лога.
 * @returns Объект с данными из файла.
*/
export const readJSONFileSync = <T>(filePath: string, isWriteToLog = true): T => {
  try {
    if (
      filePath !== null
      && filePath !== undefined
      && path.extname(filePath.toString())
      && !mime.getType(filePath)?.match(/application\/json/)
    ) {
      throw new CustomError(
        'The file must have the extension .json',
        ErrorName.MIME_TYPE,
      );
    }

    const JSONstring = readFileDataSync(filePath);

    return parseJSON<T>(JSONstring);
  } catch (error: any) {
    if (isWriteToLog) {
      writeToLogFileSync(
        `Message: ${error.message}. Path: '${filePath}'.`,
        LogMessageType.ERROR,
      );
    }

    throw error;
  }
};

/**
 * Асинхронно получить данные из JSON файла.
 * @param filePath Путь к файлу.
 * @returns Объект с данными из файла.
*/
export const readJSONFile = async <T>(filePath: string): Promise<T> => {
  try {
    if (
      filePath !== null
      && filePath !== undefined
      && path.extname(filePath.toString())
      && !mime.getType(filePath)?.match(/application\/json/)
    ) {
      throw new CustomError(
        'The file must have the extension .json',
        ErrorName.MIME_TYPE,
      );
    }

    const JSONstring = await readFileData(filePath)
      .then((dataBuffer) => dataBuffer.toString());

    return parseJSON<T>(JSONstring);
  } catch (error: any) {
    writeToLogFileSync(
      `Message: ${error.message}. Path: '${filePath}'.`,
      LogMessageType.ERROR,
    );

    throw error;
  }
};

/**
 * Асинхронно получить данные из INI файла.
 * @param filePath Путь к файлу.
 * @param encoding Кодировка файла. По умолчанию `win1251`.
 * @returns Объект с данными из файла.
*/
export const readINIFile = async (
  filePath: string,
  encoding = Encoding.WIN1251,
): Promise<IIniObj> => {
  try {
    const INIData = await readFileData(filePath);

    return new Ini(iconv.decode(INIData, encoding));
  } catch (error: any) {
    writeToLogFileSync(
      `Message: ${error.message}. Path: '${filePath}'.`,
      LogMessageType.ERROR,
    );

    throw error;
  }
};

/**
 * Асинхронно получить данные из XML файла или файла со схожей структурой.
 * @param filePath Путь к файлу.
 * @param isWithPrefix Добавлять ли префикс к именам атрибутов.
 * Для последующей правильной записи файла ставим `true`.
 * @param encoding Кодировка файла. По умолчанию `win1251`.
 * @returns Объект с данными из файла.
*/
export const readXMLFile = async (
  filePath: string,
  isWithPrefix: boolean,
  encoding = Encoding.WIN1251,
): Promise<IXmlObj> => {
  try {
    const XMLDataStr = await readFileData(filePath);

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
      `Message: ${error.message}. Path: '${filePath}'.`,
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
export const readGameSettingsFile = async (
  file: IGameSettingsFile,
  pathVariables: IPathVariables,
  moProfile: string,
  defaultEncoding: Encoding,
  isWithPrefix: boolean,
): Promise<{ [key: string]: IIniObj|IXmlObj, }> => {
  let fileData: IIniObj|IXmlObj = {};

  if (file.view === GameSettingsFileView.LINE || file.view === GameSettingsFileView.SECTIONAL) {
    fileData = await readINIFile(
      getPathToFile(file.path, pathVariables, moProfile),
       file.encoding as Encoding || defaultEncoding,
    );
  } else if (file.view === GameSettingsFileView.TAG) {
    fileData = await readXMLFile(
      getPathToFile(file.path, pathVariables, moProfile),
      isWithPrefix,
      file.encoding as Encoding || defaultEncoding,
    );
  }

  return {
    [file.name]: fileData,
  };
};

/**
 * Синхронно записать файл.
 * @param filePath Путь к файлу.
 * @param data Данные для записи в файл, строка или буфер.
*/
export const writeFileDataSync = (filePath: string, data: string|Buffer): void => {
  try {
    fs.writeFileSync(filePath, data);
  } catch (error: any) {
    const readWriteError = getReadWriteError(error);

    throw new ReadWriteError(
      `Can't write file. ${readWriteError.message}`,
      readWriteError,
      filePath,
    );
  }
};

/**
 * Асинхронно записать файл.
 * @param filePath Путь к файлу.
 * @param data Данные для записи в файл, строка или буфер.
*/
export const writeFileData = (
  filePath: string,
  data: string|Buffer,
): Promise<void> => fsPromises.writeFile(filePath, data)
  .catch((error) => {
    const readWriteError = getReadWriteError(error);

    throw new ReadWriteError(
      `Can't write file. ${readWriteError.message}`,
      readWriteError,
      filePath,
    );
  });

/**
 * Асинхронно записать JSON файл.
 * @param filePath Путь к файлу.
 * @param data Данные для записи в файл, строка или буфер.
*/
export const writeJSONFile = (
  filePath: string,
  data: { [key: string]: any, },
): Promise<void> => writeFileData(filePath, JSON.stringify(data, null, 2))
  .catch((error) => {
    writeToLogFile(
      `Message: ${error.message}. Path: '${filePath}'`,
      LogMessageType.ERROR,
    );

    throw error;
  });

/**
 * Асинхронно записать INI файл.
 * @param filePath Путь к файлу.
 * @param iniDataObj Данные для записи в файл.
 * @param encoding Кодировка записываемого файла.
*/
export const writeINIFile = (
  filePath: string,
  iniDataObj: IIniObj,
  encoding: string,
): Promise<void> => writeFileData(filePath, iconv.encode(iniDataObj.stringify(), encoding))
  .catch((error) => {
    writeToLogFile(
      `Message: ${error.message}. Path: '${filePath}'`,
      LogMessageType.ERROR,
    );

    throw error;
  });

/**
 * Асинхронно записать XML файл.
 * @param filePath Путь к файлу.
 * @param xmlDataObj Данные для записи в файл.
 * @param encoding Кодировка записываемого файла.
*/
export const writeXMLFile = (
  filePath: string,
  xmlDataObj: IXmlObj,
  encoding: string,
): Promise<void> => writeFileData(
  filePath,
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
      `Message: ${error.message}. Path: '${filePath}'`,
      LogMessageType.ERROR,
    );

    throw error;
  });

/**
 * Получить путь до родительской папки файла.
 * @param filePath Путь до файла, для которого нужно получить путь до папки.
 * @returns Строка абсолютного пути до папки.
*/
export const getPathToParentFileFolder = (filePath: string): string => path.dirname(filePath);

/**
 * Записать данные в файл игровых настроек.
 * @param filePath Путь до файла.
 * @param dataObj Данные для записи.
 * @param fileView Структура файла.
 * @param encoding Кодировка файла.
*/
export const writeGameSettingsFile = async (
  filePath: string,
  dataObj: IIniObj|IXmlObj,
  fileView: string,
  encoding: string,
): Promise<void> => {
  if (fileView === GameSettingsFileView.LINE || fileView === GameSettingsFileView.SECTIONAL) {
    await writeINIFile(
      filePath,
      dataObj as IIniObj,
      encoding,
    );
  } else if (fileView === GameSettingsFileView.TAG) {
    await writeXMLFile(
      filePath,
      dataObj,
      encoding,
    );
  }
};

/**
 * Проверить, существует ли тема оформления с заданным именем и имеется ли файл стилей для нее.
 * @param themeName Имя темы.
 * @returns `true`, если тема доступна, иначе `false`.
 */
export const checkIsThemeExists = (
  themeName: string,
): boolean => fs.existsSync(path.join(USER_THEMES_DIR, themeName))
    && fs.existsSync(path.join(USER_THEMES_DIR, themeName, userThemeStyleFile));

/**
 * Получить имена папок пользовательских тем, которые имеют корректное содержимое.
 * @returns Массив с именами папок тем.
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
 * отсекая путь до папки игры.
 * @param dialog Компонент `dialog` из Electron.
 * @param currentWindow Текущее окно, из которого вызывается команда выбора пути.
 * @param selectorType Тип селектора: выбира пути до файла или папки?
 * @param startPath Начальный путь, с которым открывается окно выбора пути.
 * @param extensions Доступные расширения файлов для выбора в селекторе файла.
 * @returns Строка пути для выбранного файла.
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
