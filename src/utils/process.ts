import { execFile, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import mime from 'mime';

import { LOG_MESSAGE_TYPE, writeToLogFile } from '$utils/log';
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
  args: string[] = [],
  appName = path.basename(pathToApp),
  cb?,
): void => {
  if (!path.extname(pathToApp)) {
    writeToLogFile(
      `Message: Can't run application. ${ErrorMessage.PATH_TO_DIRECTORY}. App: ${appName}, path: ${pathToApp}.`, //eslint-disable-line max-len
      LOG_MESSAGE_TYPE.ERROR,
    );

    cb(false, `Не удалось запустить приложение. Указан путь к папке, не файлу. Путь: ${pathToApp}`);

    return;
  }

  if (fs.existsSync(pathToApp)) {
    if (
      path.extname(pathToApp) !== '.exe'
      || !mime.getType(pathToApp)?.match(/application\/octet-stream/)
    ) {
      writeToLogFile(
        `Message: Can't run application. ${ErrorMessage.MIME_TYPE}, received: ${mime.getType(pathToApp)}. App: ${appName}, path: ${pathToApp}.`, //eslint-disable-line max-len
        LOG_MESSAGE_TYPE.ERROR,
      );
      cb(false, `Не удалось запустить приложение. Файл не является исполняемым (.exe). Путь: ${pathToApp}`); //eslint-disable-line max-len

      return;
    }
  } else {
    writeToLogFile(
      `Message: Can't run application. ${ErrorMessage.FILE_NOT_FOUND}. App: ${appName}, path: ${pathToApp}.`, //eslint-disable-line max-len
      LOG_MESSAGE_TYPE.ERROR,
    );
    cb(false, `Не удалось запустить приложение. Файл не найден. Путь: ${pathToApp}`);

    return;
  }

  try {
    writeToLogFile(`Try to start ${appName}.`);

    const process = spawn(
    // const process = execFile(
      pathToApp,
      args,
      {
        // encoding: 'binary',
        cwd: GAME_DIR,
      },
      // (error): void => {
      //   if (error) {
      //     writeToLogFile(
      //       `Message: Can't run application. ${iconvDecode('cp866', error.message)} App: ${appName}, path ${pathToApp}.`, //eslint-disable-line max-len
      //       LOG_MESSAGE_TYPE.ERROR,
      //     );

      //     cb(false, `Не удалось запустить приложение. Подробности в лог файле. Путь: ${pathToApp}`); //eslint-disable-line max-len
      //   }
      // },
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
        LOG_MESSAGE_TYPE.ERROR,
      );

      cb(false, `Не удалось запустить приложение. Неизвестный тип файла. Путь: ${pathToApp}`); //eslint-disable-line max-len
    } else {
      writeToLogFile(
        `Message: Can't run application. Unknown error. ${error.message} App: ${appName}, path ${pathToApp}.`, //eslint-disable-line max-len
        LOG_MESSAGE_TYPE.ERROR,
      );

      cb(false, `Не удалось запустить приложение. Неизвестная ошибка. Подробности в лог файле. Путь: ${pathToApp}`); //eslint-disable-line max-len
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

  if (path.extname(pathToFolder)) {
    message = `Message: Can't open folder. ${ErrorMessage.PATH_TO_DIRECTORY}. Path ${pathToFolder}.`; //eslint-disable-line max-len
    writeToLogFile(
      message,
      LOG_MESSAGE_TYPE.ERROR,
    );
    cb(`Не удалось открыть папку. Указан путь к файлу, не папке. Путь: ${pathToFolder}`);

    return;
  }

  if (!fs.existsSync(pathToFolder)) {
    message = `Message: Can't open folder. ${ErrorMessage.DIRECTORY_NOT_FOUND}. Path ${pathToFolder}.`; //eslint-disable-line max-len
    writeToLogFile(
      message,
      LOG_MESSAGE_TYPE.ERROR,
    );
    cb(`Не удалось открыть папку. Папка не найдена. Путь: ${pathToFolder}`);

    return;
  }

  execFile('explorer.exe', [pathToFolder]);
};
