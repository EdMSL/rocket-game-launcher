import {
  app,
  ipcMain,
  dialog,
  globalShortcut,
  BrowserWindow,
} from 'electron';
import { Store } from 'redux';

import { createStorage } from './components/storage';
import { createMainWindow } from './components/windowMain';
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
import { USER_THEMES_DIR } from '$constants/paths';
import { AppChannel } from '$constants/misc';
import { IAppState } from '$store/store';

let appStore: Store<IAppState>;
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

  appStore = createStorage();

  mainWindow = createMainWindow(appStore, quitApp);

  if (process.env.NODE_ENV === 'production') {
    createBackupFolders();
    createFolderSync(USER_THEMES_DIR);
  }

  globalShortcut.register('Alt+Q', () => {
    quitApp();
  });

  writeToLogFileSync('Application ready.');
};

ipcMain.on(AppChannel.CHANGE_DEV_WINDOW_STATE, (event, isOpen: boolean) => {
  //отработает один раз
  if (!devWindow && isOpen !== undefined && isOpen) {
    devWindow = createDevWindow();
    addDevWindowListeners(devWindow, mainWindow!);

    appStore.subscribe(() => {
      if (devWindow) {
        const state = appStore.getState();

        devWindow.webContents.send(
          AppChannel.APP_STORE_UPDATED,
          state.main.isGameSettingsLoaded,
          {
            gameSettingsFiles: state.gameSettings.gameSettingsFiles,
            gameSettingsGroups: state.gameSettings.gameSettingsGroups,
            gameSettingsParameters: state.gameSettings.gameSettingsParameters,
            baseFilesEncoding: state.gameSettings.baseFilesEncoding,
          },
        );
      }
    });
  }
});

ipcMain.handle(
  AppChannel.GET_PATH_BY_PATH_SELECTOR,
  (
    event,
    selectorType: string,
    startPath?: string,
    extensions?: string[],
  ) => getPathFromFileInput(
    dialog,
    BrowserWindow.getFocusedWindow()!,
    selectorType,
    startPath,
    extensions,
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
