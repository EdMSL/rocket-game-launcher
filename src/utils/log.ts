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

/* eslint-disable no-console */

/**
  * Создать файл лога.
  * @param pathToLogFile Путь до файла.
*/
export const createLogFile = (pathToLogFile = launcherLogPath): void => {
  try {
    fs.writeFileSync(pathToLogFile, `Log file created at: ${new Date().toLocaleString()}.`);
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    showErrorBox(error.message, "Can't create log file.");
  }
};

const getLogMessage = (
  message: string,
  messageType = LogMessageType.INFO,
): string => `\n[${messageType}][${new Date().toLocaleString()}]: ${message}`;

const writeToLogErrorCallback = (
  error: Error,
): void => console.warn(`Can't write to log file. ${error.message}`);

/**
  * Синхронно записать информацию в файл лога.
  * @param message Строка для записи в лог.
  * @param messageType Тип сообщения: ошибка, предупреждение или информация. По умолчанию `info`.
*/
export const writeToLogFileSync = (message: string, messageType = LogMessageType.INFO): void => {
  try {
    fs.appendFileSync(
      launcherLogPath,
      getLogMessage(message, messageType),
    );
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    writeToLogErrorCallback(error);
  }
};

/**
  * Асинхронно записать информацию в файл лога.
  * @param message Строка для записи в лог.
  * @param messageType Тип сообщения: ошибка, предупреждение или информация. По умолчанию `info`.
*/
export const writeToLogFile = (message: string, messageType = LogMessageType.INFO): void => {
  fs.appendFile(
    launcherLogPath,
    getLogMessage(message, messageType),
    (error) => {
      if (error) {
        writeToLogErrorCallback(error);
      }
    },
  );
};
