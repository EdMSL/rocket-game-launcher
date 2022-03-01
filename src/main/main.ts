import {
  app,
  ipcMain,
  dialog,
  globalShortcut,
  BrowserWindow,
} from 'electron';

import { createStorage } from './components/storage';
import { addMainWindowListeners, createMainWindow } from './components/windowMain';
import { addDevWindowListeners, createDevWindow } from './components/windowDev';
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
import { AppChannel } from '$constants/misc';

require('@electron/remote/main').initialize();

let mainWindow: BrowserWindow|null = null;
let devWindow: BrowserWindow|null = null;

const quitApp = (): void => {
  if (process.env.NODE_ENV === 'development') {
    if (devWindow) {
      devWindow.webContents.closeDevTools();
    }

    if (mainWindow) {
      mainWindow.webContents.closeDevTools();
    }
  }

  devWindow = null;
  mainWindow = null;

  globalShortcut.unregisterAll();

  // Изменено ввиду проблем с закрытием окон из панели задач системы
  app.exit();
};

const start = async (): Promise<void> => {
  createLogFile();
  getSystemInfo();

  const store = createStorage();

  mainWindow = createMainWindow(store.getState().main.config);

  addMainWindowListeners(mainWindow!, devWindow!, quitApp);

  if (process.env.NODE_ENV === 'production') {
    createBackupFolders();
    createFolderSync(USER_THEMES_DIR);
  }

  globalShortcut.register('Alt+Q', () => {
    quitApp();
  });

  writeToLogFileSync('Application ready.');
};

const showDevWindow = (): void => {
  devWindow!.show();
  devWindow!.focus();
};

ipcMain.on(AppChannel.OPEN_DEV_WINDOW, () => {
  if (!devWindow) {
    devWindow = createDevWindow();
    addDevWindowListeners(devWindow, mainWindow!, showDevWindow);

    //FIXME ресайз срабатывает только при повторном открытии окна
    mainWindow!.on('resized', () => {
      devWindow!.webContents.send(AppChannel.WINDOW_RESIZED, mainWindow!.getSize());
    });
  } else {
    showDevWindow();
  }
});

ipcMain.handle(
  AppChannel.GET_PATH_BY_PATH_SELECTOR,
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

ipcMain.on(AppChannel.CLOSE_APP, () => {
  quitApp();
});

app.on('ready', () => {
  start()
    .catch((error: Error) => {
      writeToLogFileSync(error.message, LogMessageType.ERROR);
      showErrorBox(`${error.message} See log for more details\nApplication will be closed.`, "Can't run application."); //eslint-disable-line max-len
      quitApp();
    });
});
