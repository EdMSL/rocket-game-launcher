import {
  app, ipcMain,
} from 'electron';

import { createStorage } from './components/storage';
import { createWindow } from './components/window';
import { createLogFile, writeToLogFileSync } from '$utils/log';
import { showErrorBox } from '$utils/errors';
import { getSystemInfo } from '$utils/data';
import { GAME_DIR } from '$constants/paths';

require('@electron/remote/main').initialize();

createLogFile();

const start = async (): Promise<void> => {
  if (module.hot) {
    module.hot.accept();
  }

  getSystemInfo();

  const store = createStorage();

  createWindow(store.getState().system);

  writeToLogFileSync(`Working directory: ${GAME_DIR}`);
  writeToLogFileSync('Application ready.');
};

ipcMain.on('close app', () => {
  app.quit();
});

app.on('ready', () => {
  start()
    .catch((error: Error) => {
      showErrorBox(error.message, "Can't load application");
    });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
