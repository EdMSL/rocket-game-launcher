import {
  exec, execFile,
} from 'child_process';
import path from 'path';
import fs from 'fs';

import { LOG_MESSAGE_TYPE, writeToLogFile } from '$utils/log';
import { iconvDecode } from '$utils/files';
import { GAME_DIR } from '$constants/paths';
import { ErrorMessage } from './errors';

/**
 * Запустить приложение (.exe).
 * @param pathToApp Путь до файла.
 * @param appName Название файла, который требуется запустить.
 * @param cb Callack функция, которая выполнится после закрытия приложения (с ошибкой или без).
*/
///FIXME Добавить проверку на exe.
export const runApplication = (
  pathToApp: string,
  appName = path.basename(pathToApp),
  cb?,
): void => {
  const process = execFile(
    pathToApp,
    { encoding: 'binary', cwd: GAME_DIR },
    (error): void => {
      if (error) {
        writeToLogFile(
          `Message: ${iconvDecode('cp866', error.message)} App: ${appName}, path ${pathToApp}.`,
          LOG_MESSAGE_TYPE.ERROR,
        );

        cb(false, `Невозможно запустить приложение. Файл не найден. Путь: ${pathToApp}`);
      } else {
        writeToLogFile(`${appName} started.`);
      }
    },
  );

  process.on('close', () => {
    writeToLogFile(`${appName} closed.`);

    if (cb) {
      cb(false);
    }
  });

  process.on('exit', () => {
    if (cb) {
      cb(true);
    }
  });
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
    cb(`Невозможно открыть папку. Указан путь к файлу, не папке. Путь: ${pathToFolder}`);

    return;
  }

  if (!fs.existsSync(pathToFolder)) {
    message = `Message: Can't open folder. ${ErrorMessage.DIRECTORY_NOT_FOUND}. Path ${pathToFolder}.`; //eslint-disable-line max-len
    writeToLogFile(
      message,
      LOG_MESSAGE_TYPE.ERROR,
    );
    cb(`Невозможно открыть папку. Папка не найдена. Путь: ${pathToFolder}`);

    return;
  }

  execFile('explorer.exe', [pathToFolder]);
};
