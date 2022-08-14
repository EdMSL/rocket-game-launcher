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
import { checkIsPathIsNotOutsideValidFolder, parseJSON } from '$utils/strings';
import {
  ReadWriteError,
  getReadWriteError,
  CustomError,
  ErrorCode,
  ErrorName,
  ErrorMessage,
} from '$utils/errors';
import {
  Encoding, GameSettingsFileView, PathRegExp, PathVariableName, userThemeStyleFile,
} from '$constants/misc';
import { IPathVariables, USER_THEMES_DIR } from '$constants/paths';
import { IGameSettingsFile } from '$types/gameSettings';
import { IIniObj, IXmlObj } from '$types/common';

export const xmlAttributePrefix = '@_';

/**
 * Декодирует строку в указанной кодировке.
 * @param str Строка для декодирования.
 * @param encoding Применяемая кодировка.
 * @returns Декодированная строка.
 */
export const iconvDecode = (str: string, encoding = Encoding.CP866): string => iconv.decode(
  Buffer.from(str, 'binary'),
  encoding,
);

/**
 * Определяет, соответствует ли структура переданных данных структуре INI файла.
 * @param fileView Требуемая структура файла.
 * @param obj Объект с данными из файла.
 * @returns `true`, если структура данных соотвтествует INI файлу, иначе `false`.
 */
export const isDataFromIniFile = (
  fileView: string,
  obj: IIniObj|IXmlObj,
): obj is IIniObj => fileView === GameSettingsFileView.LINE
  || fileView === GameSettingsFileView.SECTIONAL;

/**
 * Асинхронно получает содержимое папки по указанному пути.
 * @param directoryPath Путь к папке.
 * @returns Массив с именами файлов\папок.
*/
export const readDirectory = (
  directoryPath: string,
): Promise<string[]> => fsPromises.readdir(directoryPath)
  .then((data) => data)
  .catch((error) => {
    throw getReadWriteError(error, directoryPath, "Can't read directory.", true);
  });

/**
 * Синхронно получает содержимое папки по указанному пути.
 * @param directoryPath Путь к папке.
 * @returns Массив с именами файлов\папок.
*/
export const readDirectorySync = (
  directoryPath: string,
): string[] => {
  try {
    return fs.readdirSync(directoryPath);
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    throw getReadWriteError(error, directoryPath, "Can't read directory.", true);
  }
};

/**
 * Синхронно создает папку по указанному пути.
 * @param directoryPath Путь к новой папке, включая имя.
*/
export const createFolderSync = (directoryPath: string): void => {
  try {
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
    }
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    throw getReadWriteError(error, directoryPath, "Can't create folder.", true);
  }
};

/**
 * Асинхронно удаляет папку по указанному пути.
 * @param directoryPath Путь до удаляемой папки.
*/
export const deleteFolder = (
  directoryPath: string,
): Promise<void> => fsPromises.rmdir(directoryPath)
  .catch((error) => {
    throw getReadWriteError(error, directoryPath, "Can't delete folder.");
  });

/**
 * Синхронно копирует файл в указанную папку.
 * @param filePath Путь к копируемому файлу.
 * @param destinationPath Путь к папке, в которую требуется скопировать файл.
*/
export const createCopyFileSync = (filePath: string, destinationPath: string): void => {
  try {
    fs.copyFileSync(
      filePath,
      destinationPath,
    );
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    throw getReadWriteError(error, filePath, "Can't copy file.");
  }
};

/**
 * Асинхронно копирует файл в указанную папку.
 * @param filePath Путь к копируемому файлу.
 * @param destinationPath Путь к папке, в которую требуется скопировать файл.
*/
export const createCopyFile = (
  filePath: string,
  destinationPath: string,
): Promise<void> => fsPromises.copyFile(filePath, destinationPath)
  .catch((error) => {
    throw getReadWriteError(error, filePath, "Can't copy file.");
  });

/**
 * Асинхронно удаляет файл по указанному пути.
 * @param filePath Путь до удаляемого файла, включая имя.
*/
export const deleteFile = (filePath: string): Promise<void> => fsPromises.unlink(filePath)
  .catch((error) => {
    throw getReadWriteError(error, filePath, "Can't delete file.");
  });

/**
 * Асинхронно переименовывает файл/папку.
 * @param oldPath Путь до файла/папки.
 * @param newName Новое имя файла/папки.
 * @param isForDirectory Если `true`, то выполняется операция для папки, иначе для файла.
 * Влияет только на текст сообщения в случае ошибки.
*/
export const renameFileOrFolder = (
  oldPath: string,
  newName: string,
  isForDirectory = false,
): Promise<void> => fsPromises.rename(
  oldPath,
  path.join(path.dirname(oldPath), newName),
)
  .catch((error) => {
    throw getReadWriteError(
      error,
      oldPath,
      `Can't rename ${isForDirectory ? 'folder' : 'file'}.`,
      isForDirectory,
    );
  });

/**
 * Синхронно считывает данные из файла.
 * @param filePath Путь до считываемого файла, включая имя.
 * @param encoding Кодировка считываемого файла.
 * @returns Строка с данными из файла.
*/
///TODO: Добавить проверку на тип файла: текстовый или нет
export const readFileDataSync = (
  filePath: string,
  encoding: BufferEncoding = Encoding.UTF8 as BufferEncoding,
): string => {
  try {
    if (typeof filePath !== 'string') {
      throw new CustomError(
        ErrorMessage.ARG_TYPE,
        ErrorName.ARG_TYPE,
        ErrorCode.ARG_TYPE,
      );
    }

    return fs.readFileSync(filePath, encoding);
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    throw getReadWriteError(error, filePath, "Can't read file.");
  }
};

/**
 * Асинхронно считывает данные из файла.
 * @param filePath Путь до считываемого файла, включая имя.
 * @returns Buffer с данными из файла.
*/
export const readFileData = (
  filePath: string,
): Promise<Buffer> => fsPromises.readFile(filePath)
  .then((data) => data)
  .catch((error) => {
    throw getReadWriteError(error, filePath, "Can't read file.");
  });

/**
 * Синхронно получает данные из JSON файла.
 * @param filePath Путь до считываемого файла, включая имя.
 * @param isWriteToLog Если `true`, то делает запись в файле лога в случае ошибки.
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
        'The file must have a ".json" extension',
        ErrorName.MIME_TYPE,
      );
    }

    const JSONstring = readFileDataSync(filePath);

    return parseJSON<T>(JSONstring);
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
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
 * Асинхронно получает данные из JSON файла.
 * @param filePath Путь до считываемого файла, включая имя.
 * @param isWriteToLog Если `true`, то делает запись в файле лога в случае ошибки.
 * @returns Объект с данными из файла.
*/
export const readJSONFile = async <T>(filePath: string, isWriteToLog = true): Promise<T> => {
  try {
    if (
      filePath !== null
      && filePath !== undefined
      && path.extname(filePath.toString())
      && !mime.getType(filePath)?.match(/application\/json/)
    ) {
      throw new CustomError(
        'The file must have a ".json" extension',
        ErrorName.MIME_TYPE,
      );
    }

    const JSONstring = await readFileData(filePath)
      .then((dataBuffer) => dataBuffer.toString());

    return parseJSON<T>(JSONstring);
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
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
 * Асинхронно получает данные из INI файла.
 * @param filePath Путь до считываемого файла, включая имя.
 * @param encoding Кодировка считываемого файла.
 * @returns Объект с данными из файла.
*/
export const readINIFile = async (
  filePath: string,
  encoding = Encoding.WIN1251,
): Promise<IIniObj> => {
  try {
    const INIData = await readFileData(filePath);

    return new Ini(iconv.decode(INIData, encoding));
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    writeToLogFileSync(
      `Message: ${error.message}. Path: '${filePath}'.`,
      LogMessageType.ERROR,
    );

    throw error;
  }
};

/**
 * Синхронно получает данные из INI файла.
 * @param filePath Путь до считываемого файла, включая имя.
 * @param encoding Кодировка считываемого файла.
 * @returns Объект с данными из файла.
*/
export const readINIFileSync = (
  filePath: string,
  encoding = Encoding.UTF8,
): IIniObj => {
  try {
    const INIData = readFileDataSync(filePath, encoding as BufferEncoding);

    return new Ini(INIData);
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    writeToLogFileSync(
      `Message: ${error.message}. Path: '${filePath}'.`,
      LogMessageType.ERROR,
    );

    throw error;
  }
};

/**
 * Асинхронно получает данные из XML файла или файла со схожей структурой.
 * @param filePath Путь до считываемого файла, включая имя.
 * @param isWithPrefix Если `true`, то к именам атрибутов будет добавлен префикс "@_".
 * Для последующей правильной записи файла ставим `true`.
 * @param encoding Кодировка считываемого файла.
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
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    writeToLogFileSync(
      `Message: ${error.message}. Path: '${filePath}'.`,
      LogMessageType.ERROR,
    );

    throw error;
  }
};

/**
 * Синхронно записывает данные в файл.
 * @param filePath Путь до записываемого файла, включая имя.
 * @param data Данные для записи в файл.
*/
export const writeFileDataSync = (filePath: string, data: string|Buffer): void => {
  try {
    fs.writeFileSync(filePath, data);
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    throw getReadWriteError(error, filePath, "Can't write file.");
  }
};

/**
 * Асинхронно записывает данные в файл.
 * @param filePath Путь до записываемого файла, включая имя.
 * @param data Данные для записи в файл.
*/
export const writeFileData = (
  filePath: string,
  data: string|Buffer,
): Promise<void> => fsPromises.writeFile(filePath, data)
  .catch((error) => {
    throw getReadWriteError(error, filePath, "Can't write file.");
  });

/**
 * Асинхронно записывает данные в JSON файл.
 * @param filePath Путь до записываемого файла, включая имя.
 * @param data Данные для записи в файл.
*/
export const writeJSONFile = (
  filePath: string,
  data: Record<string, any>, //eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<void> => writeFileData(filePath, JSON.stringify(data, null, 2))
  .catch((error) => {
    writeToLogFile(
      `Message: ${error.message}. Path: '${filePath}'`,
      LogMessageType.ERROR,
    );

    throw error;
  });

/**
 * Асинхронно записывает данные в INI файл.
 * @param filePath Путь до записываемого файла, включая имя.
 * @param data Данные для записи в файл.
 * @param encoding Кодировка записываемого файла.
*/
export const writeINIFile = (
  filePath: string,
  data: IIniObj,
  encoding: string,
): Promise<void> => writeFileData(filePath, iconv.encode(data.stringify(), encoding))
  .catch((error) => {
    writeToLogFile(
      `Message: ${error.message}. Path: '${filePath}'`,
      LogMessageType.ERROR,
    );

    throw error;
  });

/**
 * Асинхронно записывает данные в XML файл.
 * @param filePath Путь до записываемого файла, включая имя.
 * @param data Данные для записи в файл.
 * @param encoding Кодировка записываемого файла.
*/
export const writeXMLFile = (
  filePath: string,
  data: IXmlObj,
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
  }).parse(data), encoding),
)
  .catch((error) => {
    writeToLogFile(
      `Message: ${error.message}. Path: '${filePath}'`,
      LogMessageType.ERROR,
    );

    throw error;
  });

const getPathToFileFromMOProfileFolder = (
  pathToProfiles: string,
  fileName: string,
  moProfile?: string,
): string => {
  if (moProfile) {
    return path.join(pathToProfiles, moProfile, fileName);
  }

  const profiles = readDirectorySync(pathToProfiles);

  return path.join(pathToProfiles, profiles[0], fileName);
};

/**
 * Получить путь до файла с учетом переменных путей.
 * @param pathToFile Путь до файла.
 * @param pathVariables Переменные путей.
 * @param profileMO Профиль Mod Organizer.
 * @param isWithCheck Если `true`, то будет производиться проверка на вхождение пути в
 * корневую папку игры, а так же проверки корректности. По умолчанию `true`.
 * @returns Строка с абсолютным путем к файлу.
*/
export const getPathToFile = (
  pathToFile: string,
  pathVariables: IPathVariables,
  profileMO = '',
  isWithCheck = true,
  isAllowDocuments = false,
): string => {
  let newPath = pathToFile;

  if (PathRegExp.MO_PROFILE.test(pathToFile)) {
    // Получение пути до МО разделено ввиду необходимости получения профилей при использовании
    // функции в PathSelector.
    if (isWithCheck) {
      if (profileMO) {
        newPath = getPathToFileFromMOProfileFolder(
          pathVariables['%MO_PROFILE%'],
          path.basename(pathToFile),
          profileMO,
        );
      } else {
        throw new CustomError('Указан путь до файла в папке профилей Mod Organizer, но МО не используется.'); //eslint-disable-line max-len
      }
    } else {
      newPath = getPathToFileFromMOProfileFolder(
        pathVariables['%MO_PROFILE%'],
        path.basename(pathToFile),
        undefined,
      );
    }
  } else if (PathRegExp.MO_DIR.test(pathToFile)) {
    if (pathVariables['%MO_DIR%']) {
      newPath = newPath.replace(PathVariableName.MO_DIR, pathVariables['%MO_DIR%']);
    } else {
      if (profileMO) {
        throw new CustomError('The path to a file in the Mod Organizer folder was received, but the path to the folder was not specified.'); //eslint-disable-line max-len
      }

      throw new CustomError(`Incorrect path received. Path variable ${PathVariableName.MO_DIR} is not available.`); //eslint-disable-line max-len
    }
  } else if (PathRegExp.MO_MODS.test(pathToFile)) {
    if (pathVariables['%MO_DIR%']) {
      newPath = newPath.replace(PathVariableName.MO_MODS, pathVariables['%MO_MODS%']);
    } else {
      if (profileMO) {
        throw new CustomError('The path to a file in the Mod Organizer mods folder was received, but the path to the folder was not specified.'); //eslint-disable-line max-len
      }

      throw new CustomError(`Incorrect path received. Path variable ${PathVariableName.MO_MODS} is not available.`); //eslint-disable-line max-len
    }
  } else if (PathRegExp.DOCS_GAME.test(pathToFile)) {
    if (pathVariables['%DOCS_GAME%']) {
      newPath = newPath.replace(PathVariableName.DOCS_GAME, pathVariables['%DOCS_GAME%']);
    } else {
      throw new CustomError('The path to a file in the Documents folder was received, but the path to the folder was not specified.'); //eslint-disable-line max-len
    }
  } else if (PathRegExp.DOCUMENTS.test(pathToFile)) {
    if (isAllowDocuments) {
      newPath = newPath.replace(PathVariableName.DOCUMENTS, pathVariables['%DOCUMENTS%']);
    } else {
      throw new CustomError(`The path to a file in the Documents folder is not allow. Maybe you wanted to write "${PathVariableName.DOCS_GAME}"?.`); //eslint-disable-line max-len
    }
  } else if (PathRegExp.GAME_DIR.test(pathToFile)) {
    newPath = newPath.replace(PathVariableName.GAME_DIR, pathVariables['%GAME_DIR%']);
  } else {
    throw new CustomError(`Incorrect path (${pathToFile}) received.`); //eslint-disable-line max-len
  }

  if (isWithCheck) {
    checkIsPathIsNotOutsideValidFolder(newPath, pathVariables);
  }

  return newPath;
};

/**
 * Асинхронно получает данные из файла для последующей генерации игровых настроек.
 * @param file Объект файла игровых настроек из `state`.
 * @param pathVariables Переменные путей из `state`.
 * @param moProfile Профиль МО из `state`.
 * @param defaultEncoding Кодировка по умолчанию для считывемых файлов.
 * @param isWithPrefix Если `true`, то к именам атрибутов будет добавлен префикс "@_"
 * для файла со структурой `TAG`.
 * @returns Объект, ключом в котором является имя файла, значением - считанные данные из файла.
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
 * Проверяет, существует ли указанный путь.
 * @param pathToCheck Путь для проверки.
 * @returns Существует ли указанный путь.
*/
export const getIsExists = (
  pathToCheck: string,
): boolean => fs.existsSync(pathToCheck);

/**
 * Получает путь до родительской папки для указанного файла.
 * @param filePath Путь до файла, для которого нужно получить путь до папки.
 * @returns Строка абсолютного пути до папки.
*/
export const getPathToParentFileFolder = (filePath: string): string => path.dirname(filePath);

/**
 * Записывае данные в файл игровых настроек.
 * @param filePath Путь до файла, включая имя.
 * @param data Данные для записи в файл.
 * @param fileView Структура записываемого файла.
 * @param encoding Кодировка записываемого файла.
*/
export const writeGameSettingsFile = async (
  filePath: string,
  data: IIniObj|IXmlObj,
  fileView: GameSettingsFileView,
  encoding: string,
): Promise<void> => {
  if (fileView === GameSettingsFileView.LINE || fileView === GameSettingsFileView.SECTIONAL) {
    await writeINIFile(
      filePath,
      data as IIniObj,
      encoding,
    );
  } else if (fileView === GameSettingsFileView.TAG) {
    await writeXMLFile(
      filePath,
      data,
      encoding,
    );
  }
};

/**
 * Проверяет, существует ли тема оформления с заданным именем и имеется ли файл стилей для нее.
 * @param themeName Имя проверяемой темы.
 * @returns `true`, если тема доступна, иначе `false`.
 */
export const checkIsThemeExists = (
  themeName: string,
): boolean => fs.existsSync(path.join(USER_THEMES_DIR, themeName))
    && fs.existsSync(path.join(USER_THEMES_DIR, themeName, userThemeStyleFile));

/**
 * Получает имена папок пользовательских тем, которые имеют корректное содержимое.
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
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
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
 * @param isSelectFile Если `true`, будет выведено окно выбора файла, иначе окно выбора папки.
 * @param startPath Начальный путь, с которым открывается окно выбора пути.
 * @param extensions Доступные расширения файлов для выбора в селекторе файла.
 * @returns Строка пути до выбранного файла.
*/
export const getPathFromFileInput = async (
  dialog: Electron.Dialog,
  currentWindow: Electron.BrowserWindow,
  isSelectFile: boolean,
  startPath = '',
  extensions = ['*'],
): Promise<string> => {
  try {
    const pathObj = await dialog.showOpenDialog(currentWindow, {
      defaultPath: startPath,
      properties: [isSelectFile ? 'openFile' : 'openDirectory'],
      filters: [{ name: 'File', extensions }],
    });

    if (pathObj.filePaths.length === 0) {
      return '';
    }

    return pathObj.filePaths[0];
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    return '';
  }
};
