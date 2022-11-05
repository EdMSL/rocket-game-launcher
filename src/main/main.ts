import {
  app,
  ipcMain,
  dialog,
  globalShortcut,
  BrowserWindow,
  protocol,
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
import { getDisplaysInfo, getSystemInfo } from '$utils/system';
import { createBackupFolders } from '$utils/backup';
import { createFolderSync, getPathFromFileInput } from '$utils/files';
import { USER_THEMES_DIR } from '$constants/paths';
import {
  AppChannel, AppWindowName, LauncherButtonAction,
} from '$constants/misc';
import { IAppState } from '$store/store';
import { showMessageBox } from '$utils/message';
import { handleUnhandledError } from './components/unhandled';

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
  getDisplaysInfo();
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

  protocol.registerFileProtocol('image-protocol', (request, callback) => {
    const url = request.url.replace('image-protocol://getMediaFile/', '');

    callback({ path: url });
  });

  writeToLogFileSync('Application ready.');
};

process.on('uncaughtException', (error) => {
  handleUnhandledError('Unhandled Error', error);
});

process.on('unhandledRejection', (error) => {
  handleUnhandledError('Unhandled Promise Rejection', error);
});

ipcMain.on(AppChannel.CHANGE_DEV_WINDOW_STATE, (event, isOpen: boolean) => {
  //отработает один раз
  if (!devWindow && isOpen !== undefined && isOpen) {
    devWindow = createDevWindow();
    addDevWindowListeners(devWindow, mainWindow!);
  }
});

ipcMain.handle(AppChannel.ERROR_HANDLER_CHANNEL, async (evt, title, error) => {
  handleUnhandledError(title, error);
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
    selectorType === LauncherButtonAction.RUN,
    startPath,
    extensions,
  ),
);

ipcMain.handle(
  AppChannel.GET_MESSAGE_BOX_RESPONSE,
  (
    event,
    message: string,
    title: string,
    messageBoxType: string,
    buttons: string[]|undefined,
    windowName: AppWindowName|undefined,
  ) => showMessageBox(
    dialog,
    message,
    title,
    messageBoxType,
    buttons,
    windowName ? windowName === AppWindowName.DEV ? devWindow! : mainWindow! : undefined, // eslint-disable-line no-nested-ternary, max-len
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
