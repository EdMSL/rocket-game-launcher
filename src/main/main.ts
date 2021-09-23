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
import { createFolderSync } from '$utils/files';
import { USER_THEMES_PATH } from '$constants/paths';

require('@electron/remote/main').initialize();

const start = async (): Promise<void> => {
  createLogFile();
  getSystemInfo();

  const store = createStorage();

  createWindow(store.getState().system);

  createBackupFolders();
  createFolderSync(USER_THEMES_PATH);

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
      showErrorBox(`${error.message} See log for more details\nApplication will be closed.`, "Can't run application."); //eslint-disable-line max-len
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
