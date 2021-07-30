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
    showErrorBox(error.message);
  }
};

/**
  * Синхронно записать информацию в файл лога.
  * @param data Строка для записи в лог.
*/
export const writeToLogFileSync = (data: string): void => {
  try {
    fs.appendFileSync(launcherLogPath, `\n${data}`);
  } catch (error) {
    showErrorBox(error.message);
  }
};

/**
  * Асинхронно записать информацию в файл лога.
  * @param data Строка для записи в лог.
*/
export const writeToLogFile = (data: string): void => {
  fs.appendFile(launcherLogPath, `\n${data}`, (error) => {
    showErrorBox(error.message);
  });
};
