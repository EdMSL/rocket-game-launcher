import {
  app, BrowserWindow, ipcMain,
} from 'electron';

import { createStorage } from './components/storage';
import { createWindow } from './components/window';
import { createLogFile, writeToLogFileSync } from '$utils/log';
import { showErrorBox } from '$utils/errors';

require('@electron/remote/main').initialize();

createLogFile();

const start = async (): Promise<void> => {
  if (module.hot) {
    module.hot.accept();
  }

  createStorage();

  createWindow();

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

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
