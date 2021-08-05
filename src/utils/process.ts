import { exec, ChildProcess } from 'child_process';

import { writeToLogFile } from '$utils/log';
import { GAME_DIR } from '$constants/paths';

export const runApplication = (app: string, appName?: string, cb?): any => {
  if (appName === 'Game') {
    writeToLogFile('Game started.');
  }

  try {
    // let process: ChildProcess;
    const process = exec(app);
    process.on('close', () => {
      writeToLogFile(`${appName} closed.`);
      if (cb) {
        cb(false);
      }
    });

    process.on('exit', () => {
      if (cb) {
        cb(true, true);
      }
    });

    process.on('error', (code, signal) => {
      writeToLogFile(`${appName} process error with code ${code} and signal ${signal}.`);
      if (cb) {
        cb(false);
      }
    });

    return process;
  } catch (error) {
    writeToLogFile(error.message);
  }
};
