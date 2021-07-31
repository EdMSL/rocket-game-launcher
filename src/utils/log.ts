import fs from 'fs';
import path from 'path';

import { showErrorBox } from '$utils/errors';

export const LOG_MESSAGE_TYPE = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
};

export const launcherLogPath = path.resolve('./launcher.log');

/**
  * Создать файл лога.
  * @param path Путь до файла.
*/
export const createLogFile = (path = launcherLogPath): void => {
  try {
    fs.writeFileSync(path, '------Log file------');
  } catch (error) {
    showErrorBox(error.message, 'Can\'t create log file.');
  }
};

/**
  * Синхронно записать информацию в файл лога.
  * @param message Строка для записи в лог.
  * @param messageType Определяет тип сообщения, ошибка, предупреждение или информация.
*/
export const writeToLogFileSync = (message: string, messageType = LOG_MESSAGE_TYPE.INFO): void => {
  try {
    fs.appendFileSync(launcherLogPath, `\n${messageType}: ${message}`);
  } catch (error) {
    showErrorBox(error.message, 'Can\'t write to log file.');
  }
};

/**
  * Асинхронно записать информацию в файл лога.
  * @param message Строка для записи в лог.
  * @param messageType Определяет тип сообщения, ошибка, предупреждение или информация.
*/
export const writeToLogFile = (message: string, messageType = LOG_MESSAGE_TYPE.INFO): void => {
  fs.appendFile(launcherLogPath, `\n${messageType}: ${message}`, (error) => {
    if (error) {
      showErrorBox(error.message, 'Can\'t write to log file.');
    }
  });
};
