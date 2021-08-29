import fs from 'fs';
import path from 'path';

import { showErrorBox } from '$utils/errors';

export const LogMessageType = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
};

export const launcherLogPath = path.resolve(
  process.env.NODE_ENV === 'development'
    ? './app/files/launcher.log'
    : './launcher.log',
);

/**
  * Создать файл лога.
  * @param pathToLogFile Путь до файла.
*/
export const createLogFile = (pathToLogFile = launcherLogPath): void => {
  try {
    fs.writeFileSync(pathToLogFile, `Log file created at: ${new Date().toLocaleString()}`);
  } catch (error) {
    showErrorBox(error.message, "Can't create log file.");
  }
};

/**
  * Синхронно записать информацию в файл лога.
  * @param message Строка для записи в лог.
  * @param messageType Определяет тип сообщения, ошибка, предупреждение или информация.
  * По умолчанию `info`.
*/
//TODO Переделать перехват ошибок для методов
export const writeToLogFileSync = (message: string, messageType = LogMessageType.INFO): void => {
  try {
    fs.appendFileSync(
      launcherLogPath,
      `\n[${messageType}][${new Date().toLocaleString()}]: ${message}`,
    );
  } catch (error) {
    showErrorBox(error.message, "Can't write to log file.");
  }
};

/**
  * Асинхронно записать информацию в файл лога.
  * @param message Строка для записи в лог.
  * @param messageType Определяет тип сообщения, ошибка, предупреждение или информация.
  * По умолчанию `info`.
*/
export const writeToLogFile = (message: string, messageType = LogMessageType.INFO): void => {
  fs.appendFile(
    launcherLogPath,
    `\n[${messageType.toUpperCase()}][${new Date().toLocaleString()}]: ${message}`,
    (error) => {
      if (error) {
        showErrorBox(error.message, "Can't write to log file.");
      }
    },
  );
};
