import fs from 'fs';
import path from 'path';

import { showErrorBox } from '$utils/errors';

export const launcherLogPath = path.resolve('./launcher.log');

export const createLogFile = (): void => {
  try {
    fs.writeFileSync(launcherLogPath, '------Log file------');
  } catch (error) {
    showErrorBox(error);
  }
};

export const writeToLogFileSync = (data: string): void => {
  try {
    fs.appendFileSync(launcherLogPath, `\n${data}`);
  } catch (error) {
    showErrorBox(error);
  }
};

export const writeToLogFile = (data: string): void => {
  fs.appendFile(launcherLogPath, `\n${data}`, (error) => {
    showErrorBox(error);
  });
};