import {
  exec, execFile,
} from 'child_process';
import path from 'path';
import fs from 'fs';

import { LOG_MESSAGE_TYPE, writeToLogFile } from '$utils/log';
import { iconvDecode } from '$utils/files';
import { GAME_DIR } from '$constants/paths';
import { ERROR_MESSAGE } from './errors';

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
      } else {
        writeToLogFile(`${appName} started.`);
      }
    },
  );

  process.on('close', () => {
    writeToLogFile(`${appName} closed.`);

    if (cb) {
      cb();
    }
  });

  process.on('exit', () => {
    if (cb) {
      cb();
    }
  });

  process.on('error', (code, signal) => {
    writeToLogFile(
      `${appName} process error with code ${code} and signal ${signal}.`,
      LOG_MESSAGE_TYPE.ERROR,
    );

    if (cb) {
      cb();
    }
  });
};

/**
 * Открыть папку в проводнике.
 * @param pathToFolder Путь к папке.
*/
export const openFolder = (pathToFolder: string): void => {
  if (path.extname(pathToFolder)) {
    writeToLogFile(
      `Message: Can't open folder. ${ERROR_MESSAGE.pathToDirectory}. Path ${pathToFolder}.`, //eslint-disable-line max-len
      LOG_MESSAGE_TYPE.ERROR,
    );

    return;
  }

  if (!fs.existsSync(pathToFolder)) {
    writeToLogFile(
      `Message: Can't open folder. ${ERROR_MESSAGE.directoryNotFound}. Path ${pathToFolder}.`, //eslint-disable-line max-len
      LOG_MESSAGE_TYPE.ERROR,
    );

    return;
  }

  execFile('explorer.exe', [pathToFolder]);
};
