import {
  exec, execFile,
} from 'child_process';

import { LOG_MESSAGE_TYPE, writeToLogFile } from '$utils/log';
import { iconvDecode } from '$utils/files';
import { GAME_DIR } from '$constants/paths';

export const runApplication = (
  app: string,
  appName: string,
  cb?,
): void => {
  const process = execFile(
    app,
    { encoding: 'binary', cwd: 'D\\Oblivion\\' },
    (error, stdout, stderr): void => {
      if (error) {
        writeToLogFile(
          `Message: ${iconvDecode('cp866', stderr)} App: ${app}.`,
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
      cb(false);
    }
  });

  process.on('exit', () => {
    if (cb) {
      cb(true, true);
    }
  });

  process.on('error', (code, signal) => {
    writeToLogFile(
      `${appName} process error with code ${code} and signal ${signal}.`,
      LOG_MESSAGE_TYPE.ERROR,
    );

    if (cb) {
      cb(false);
    }
  });
};
