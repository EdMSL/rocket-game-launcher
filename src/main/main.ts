import {
  app, ipcMain, globalShortcut,
} from 'electron';

import { createStorage } from './components/storage';
import { createWindow } from './components/window';
import {
  createLogFile,
  LogMessageType,
  writeToLogFileSync,
} from '$utils/log';
import { showErrorBox } from '$utils/errors';
import { getSystemInfo } from '$utils/data';
import { createBackupFolders } from '$utils/backup';

require('@electron/remote/main').initialize();

const start = async (): Promise<void> => {
  createLogFile();
  getSystemInfo();

  const store = createStorage();

  createWindow(store.getState().system);

  createBackupFolders();

  globalShortcut.register('Alt+Q', () => {
    app.quit();
  });

  writeToLogFileSync('Application ready.');
};

ipcMain.on('close app', () => {
  app.quit();
});

app.on('ready', () => {
  start()
    .catch((error: Error) => {
      writeToLogFileSync(error.message, LogMessageType.ERROR);
      showErrorBox(`${error.message}\nApplication will be closed.`, "Can't run application.");
      app.quit();
    });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
