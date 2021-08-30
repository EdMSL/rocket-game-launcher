import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import mime from 'mime';

import { LogMessageType, writeToLogFile } from '$utils/log';
import { iconvDecode } from '$utils/files';
import { GAME_DIR } from '$constants/paths';
import { ErrorCode, ErrorMessage } from '$utils/errors';

/**
 * Запустить приложение (.exe).
 * @param pathToApp Путь до файла.
 * @param appName Название файла, который требуется запустить.
 * @param cb Callack функция, которая выполнится после закрытия приложения (с ошибкой или без).
*/
export const runApplication = (
  pathToApp: string,
  appName = path.basename(pathToApp),
  cb?,
): void => {
  if (fs.existsSync(pathToApp)) {
    if (fs.statSync(pathToApp).isDirectory()) {
      writeToLogFile(
        `Message: Can't run application. ${ErrorMessage.PATH_TO_DIRECTORY}. App: ${appName}, path: ${pathToApp}.`, //eslint-disable-line max-len
        LogMessageType.ERROR,
      );

      cb(false, `Не удалось запустить приложение. Указан путь к папке, не файлу. Путь: ${pathToApp}.`); //eslint-disable-line max-len

      return;
    }

    if (
      path.extname(pathToApp) !== '.exe'
      || !mime.getType(pathToApp)?.match(/application\/octet-stream/)
    ) {
      writeToLogFile(
        `Message: Can't run application. ${ErrorMessage.MIME_TYPE}, received: ${mime.getType(pathToApp)}. App: ${appName}, path: ${pathToApp}.`, //eslint-disable-line max-len
        LogMessageType.ERROR,
      );
      cb(false, `Не удалось запустить приложение. Файл не является исполняемым (.exe). Путь: ${pathToApp}.`); //eslint-disable-line max-len

      return;
    }
  } else {
    writeToLogFile(
      `Message: Can't run application. ${ErrorMessage.FILE_NOT_FOUND}. App: ${appName}, path: ${pathToApp}.`, //eslint-disable-line max-len
      LogMessageType.ERROR,
    );
    cb(false, `Не удалось запустить приложение. Файл не найден. Путь: ${pathToApp}.`);

    return;
  }

  try {
    writeToLogFile(`Try to start ${appName}.`);

    const process = execFile(
      pathToApp,
      {
        encoding: 'binary',
        cwd: GAME_DIR,
      },
      (error): void => {
        if (error) {
          writeToLogFile(
            `Message: Can't run application. ${iconvDecode(error.message)} App: ${appName}, path ${pathToApp}.`, //eslint-disable-line max-len
            LogMessageType.ERROR,
          );

          cb(false, `Не удалось запустить приложение. Подробности в файле лога. Путь: ${pathToApp}.`); //eslint-disable-line max-len
        }
      },
    );

    process.on('close', () => {
      writeToLogFile(`${appName} closed.`);

      if (cb) {
        cb(false);
      }
    });
  } catch (error) {
    if (error.code === ErrorCode.UNKNOWN) {
      writeToLogFile(
        `Message: Can't run application. Unknown file type. ${error.message} App: ${appName}, path ${pathToApp}.`, //eslint-disable-line max-len
        LogMessageType.ERROR,
      );

      cb(false, `Не удалось запустить приложение. Неизвестный тип файла. Путь: ${pathToApp}.`); //eslint-disable-line max-len
    } else if (error.code === ErrorCode.ACCESS) {
      writeToLogFile(
        `Message: Can't run application. ${ErrorMessage.ACCESS} App: ${appName}, path ${pathToApp}.`, //eslint-disable-line max-len
        LogMessageType.ERROR,
      );

      cb(false, `Не удалось запустить приложение. Нет доступа. Путь: ${pathToApp}.`); //eslint-disable-line max-len
    } else {
      writeToLogFile(
        `Message: Can't run application. Unknown error. ${error.message} App: ${appName}, path ${pathToApp}.`, //eslint-disable-line max-len
        LogMessageType.ERROR,
      );

      cb(false, `Не удалось запустить приложение. Неизвестная ошибка. Подробности в файле лога. Путь: ${pathToApp}.`); //eslint-disable-line max-len
    }
  }
};

/**
 * Открыть папку в проводнике.
 * @param pathToFolder Путь к папке.
 * @param cb callback-функция, которая будет вызвана при ошибке.
*/
export const openFolder = (pathToFolder: string, cb?): void => {
  let message: string;

  if (fs.existsSync(pathToFolder)) {
    if (!fs.statSync(pathToFolder).isDirectory()) {
      message = `Message: Can't open folder. ${ErrorMessage.PATH_TO_FILE}. Path ${pathToFolder}.`; //eslint-disable-line max-len
      writeToLogFile(
        message,
        LogMessageType.ERROR,
      );
      cb(`Не удалось открыть папку. Указан путь к файлу, не папке. Путь: ${pathToFolder}.`);

      return;
    }
  } else {
    message = `Message: Can't open folder. ${ErrorMessage.DIRECTORY_NOT_FOUND}. Path ${pathToFolder}.`; //eslint-disable-line max-len
    writeToLogFile(
      message,
      LogMessageType.ERROR,
    );
    cb(`Не удалось открыть папку. Папка не найдена. Путь: ${pathToFolder}.`);

    return;
  }

  try {
    execFile('explorer.exe', [pathToFolder]);
  } catch (error) {
    writeToLogFile(
      `Message: Can't open folder. Unknown error. ${error.message} Path ${pathToFolder}.`, //eslint-disable-line max-len
      LogMessageType.ERROR,
    );

    cb(false, `Не удалось открыть папку. Неизвестная ошибка. Подробности в лог файле. Путь: ${pathToFolder}.`); //eslint-disable-line max-len
  }
};
