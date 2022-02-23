import {
  app,
  ipcMain,
  dialog,
  globalShortcut,
  BrowserWindow,
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
import { createFolderSync, getPathFromFileInput } from '$utils/files';
import { IPathVariables, USER_THEMES_DIR } from '$constants/paths';

require('@electron/remote/main').initialize();

const start = async (): Promise<void> => {
  createLogFile();
  getSystemInfo();

  const store = createStorage();

  createWindow(store.getState().main.config);

  if (process.env.NODE_ENV === 'production') {
    createBackupFolders();
    createFolderSync(USER_THEMES_DIR);
  }

  globalShortcut.register('Alt+Q', () => {
    app.quit();
  });

  writeToLogFileSync('Application ready.');
};

ipcMain.handle(
  'get path from native window',
  (
    event,
    pathVariables: IPathVariables,
    startPath?: string,
    isPathToFile?: boolean,
    extensions?: string[],
    isGameDocuments?: boolean,
  ) => getPathFromFileInput(
    dialog,
    BrowserWindow.getFocusedWindow()!,
    pathVariables,
    startPath,
    isPathToFile,
    extensions,
    isGameDocuments,
  ),
);

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
