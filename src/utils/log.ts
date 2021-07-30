import fs from 'fs';
import path from 'path';

import { showErrorBox } from '$utils/errors';

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
  * @param data Строка для записи в лог.
  * @param isError Определяет тип сообщения, ошибка или информация.
*/
export const writeToLogFileSync = (data: string, isError = false): void => {
  try {
    fs.appendFileSync(launcherLogPath, `\n${isError ? 'ERROR:' : 'INFO:'} ${data}`);
  } catch (error) {
    showErrorBox(error.message, 'Can\'t write to log file.');
  }
};

/**
  * Асинхронно записать информацию в файл лога.
  * @param data Строка для записи в лог.
  * @param isError Определяет тип сообщения, ошибка или информация.
*/
export const writeToLogFile = (data: string, isError = false): void => {
  fs.appendFile(launcherLogPath, `\n${isError ? 'ERROR:' : 'INFO:'} ${data}`, (error) => {
    if (error) {
      showErrorBox(error.message, 'Can\'t write to log file.');
    }
  });
};
