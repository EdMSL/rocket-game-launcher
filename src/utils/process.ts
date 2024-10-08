import { execFile } from 'child_process';
import { BrowserWindow, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import mime from 'mime';

import { LogMessageType, writeToLogFile } from '$utils/log';
import { getPathToParentFileFolder, iconvDecode } from '$utils/files';
import { ErrorCode, ErrorMessage } from '$utils/errors';
import { getApplicationArgs, getOneFromThree } from './data';
import { ILauncherConfig } from '$types/main';
import { MinWindowSize } from '$constants/defaultData';

/**
 * Запустить приложение (.exe).
 * @param pathToApp Путь до файла.
 * @param args Аргументы доп. параметров запуска.
 * @param appName Название файла, который требуется запустить.
 * @param cb Callack функция, которая выполнится после закрытия приложения (с ошибкой или без).
*/
export const runApplication = (
  pathToApp: string,
  args: string[] = [],
  appName = path.basename(pathToApp),
  cb?: (errorMessage: string, runningState: boolean, isClosed?: boolean) => void,
): void => {
  let execTarget = pathToApp;
  let execArgs: string[] = [];
  let execCwd = getPathToParentFileFolder(pathToApp);

  if (fs.existsSync(pathToApp)) {
    if (fs.statSync(pathToApp).isDirectory()) {
      writeToLogFile(
        `Message: Can't run application. ${ErrorMessage.PATH_TO_DIRECTORY}. App: ${appName}, path: ${pathToApp}.`, //eslint-disable-line max-len
        LogMessageType.ERROR,
      );

      if (cb) {
        cb(`Не удалось запустить приложение. Указан путь к папке, не файлу. Путь: ${pathToApp}.`, false); //eslint-disable-line max-len
      }

      return;
    }

    const pathToAppExtname = path.extname(pathToApp);

    if (pathToAppExtname === '.lnk') {
      const parsed = shell.readShortcutLink(pathToApp);

      if (parsed.args) {
        execArgs = [parsed.args];
      }

      execTarget = parsed.target;

      if (parsed.cwd) {
        execCwd = parsed.cwd;
      }
    }

    if (pathToAppExtname === '.exe' && args.length > 0) {
      execArgs = getApplicationArgs(args);
    }

    if (
      path.extname(execTarget) !== '.exe'
      || !mime.getType(execTarget)?.match(/application\/octet-stream/)
    ) {
      writeToLogFile(
        `Message: Can't run application. ${ErrorMessage.MIME_TYPE}, received: ${mime.getType(pathToApp)}. App: ${execTarget}, path: ${pathToApp}.`, //eslint-disable-line max-len
        LogMessageType.ERROR,
      );
      if (cb) {
        cb(`Не удалось запустить приложение. Файл не является исполняемым (.exe). Путь: ${pathToApp}.`, false); //eslint-disable-line max-len
      }

      return;
    }
  } else {
    writeToLogFile(
      `Message: Can't run application. ${ErrorMessage.FILE_NOT_FOUND}. App: ${appName}, path: ${pathToApp}.`, //eslint-disable-line max-len
      LogMessageType.ERROR,
    );

    if (cb) {
      cb(`Не удалось запустить приложение. Файл не найден. Путь: ${pathToApp}.`, false);
    }

    return;
  }

  try {
    writeToLogFile(`Try to start ${appName}.`);

    const process = execFile(
      `"${execTarget}"`,
      execArgs,
      {
        encoding: 'binary',
        cwd: execCwd,
        shell: true,
      },
      (error): void => {
        if (error) {
          writeToLogFile(
            `Message: Can't run application. ${iconvDecode(error.message)} App: ${appName}, path ${pathToApp}.`, //eslint-disable-line max-len
            LogMessageType.ERROR,
          );

          if (cb) {
            cb(`Не удалось запустить приложение. Подробности в файле лога. Путь: ${pathToApp}.`, false); //eslint-disable-line max-len
          }
        }
      },
    );

    process.on('exit', () => {
      if (cb) {
        cb('', true, true);
      }
    });

    process.on('close', () => {
      writeToLogFile(`${appName} closed.`);

      if (cb) {
        cb('', false);
      }
    });
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    if (error.code === ErrorCode.UNKNOWN) {
      writeToLogFile(
        `Message: Can't run application. Unknown file type. ${error.message} App: ${appName}, path ${pathToApp}.`, //eslint-disable-line max-len
        LogMessageType.ERROR,
      );

      if (cb) {
        cb(`Не удалось запустить приложение. Неизвестный тип файла. Путь: ${pathToApp}.`, false); //eslint-disable-line max-len
      }
    } else if (error.code === ErrorCode.ACCESS) {
      writeToLogFile(
        `Message: Can't run application. ${ErrorMessage.ACCESS} App: ${appName}, path ${pathToApp}.`, //eslint-disable-line max-len
        LogMessageType.ERROR,
      );

      if (cb) {
        cb(`Не удалось запустить приложение. Нет доступа. Путь: ${pathToApp}.`, false); //eslint-disable-line max-len
      }
    } else {
      writeToLogFile(
        `Message: Can't run application. Unknown error. ${error.message} App: ${appName}, path ${pathToApp}.`, //eslint-disable-line max-len
        LogMessageType.ERROR,
      );

      if (cb) {
        cb(`Не удалось запустить приложение. Неизвестная ошибка. Подробности в файле лога. Путь: ${pathToApp}.`, false); //eslint-disable-line max-len
      }
    }
  }
};

/**
 * Открыть папку в проводнике. Если передан путь к файлу, то выбрать этот файл.
 * @param pathToOpen Путь к папке.
 * @param cb callback-функция, которая будет вызвана при ошибке.
 * @param isPathToFile Задает тип открываемого пути для вывода текста ошибки.
*/
export const openFolder = (
  pathToOpen: string,
  cb?: (errorMessage: string) => void,
  isPathToFile = false,
): void => {
  let isFolder = true;

  if (fs.existsSync(pathToOpen)) {
    if (!fs.statSync(pathToOpen).isDirectory()) {
      isFolder = false;
    }
  } else {
    writeToLogFile(
      `Message: Can't open folder. ${isPathToFile ? ErrorMessage.FILE_NOT_FOUND : ErrorMessage.DIRECTORY_NOT_FOUND}${isPathToFile ? ' in folder.' : ''}. Path ${pathToOpen}.`, //eslint-disable-line max-len
      LogMessageType.ERROR,
    );

    if (cb) {
      cb(`Не удалось открыть папку. ${isPathToFile ? 'Папка не существует или в ней не найден указанный файл' : 'Папка не найдена'}. Путь: ${pathToOpen}.`);//eslint-disable-line max-len
    }

    return;
  }

  try {
    if (isFolder) {
      shell.openPath(pathToOpen);
    } else {
      shell.showItemInFolder(pathToOpen);
    }
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    writeToLogFile(
      `Message: Can't open folder. Unknown error. ${error.message} Path ${pathToOpen}.`, //eslint-disable-line max-len
      LogMessageType.ERROR,
    );

    if (cb) {
      cb(`Не удалось открыть папку. Неизвестная ошибка. Подробности в лог файле. Путь: ${pathToOpen}.`); //eslint-disable-line max-len
    }
  }
};

/**
 * Открывает страницу в браузере.
 * @param url Адрес сайта для перехода
 */
export const openSite = (url: string): void => { shell.openExternal(url); };

/**
 * Изменяет размеры выбранного окна программы.
 * @param window Окно для изменения.
 * @param config Конфигурация лаунчера.
 */
export const changeWindowSize = (
  window: BrowserWindow,
  config: ILauncherConfig,
): void => {
  if (window.isFullScreen()) {
    window.unmaximize();
  }

  window.setResizable(config.isResizable);

  if (config.isResizable) {
    window.setMinimumSize(config.minWidth, config.minHeight);
    window.setMaximumSize(config.maxWidth, config.maxHeight);

    const [currentWidth, currentHeight] = window.getSize();
    const newWidth = getOneFromThree(currentWidth, config.minWidth, config.maxWidth);
    const newHeight = getOneFromThree(currentHeight, config.minHeight, config.maxHeight);

    if (newWidth !== currentWidth || newHeight !== currentHeight) {
      window.setSize(newWidth, newHeight);
    }
  } else {
    window.setMinimumSize(MinWindowSize.WIDTH, MinWindowSize.HEIGHT);
    window.setMaximumSize(0, 0);
    window.setSize(config.width, config.height);
  }
};
