import {
  BrowserWindow,
  globalShortcut,
  ipcMain,
} from 'electron';
import windowStateKeeper from 'electron-window-state';

import { createWaitForWebpackDevServer } from './waitDevServer';
import { defaultDevWindowResolution } from '$constants/defaultData';
import {
  AppChannel, AppWindowName, AppWindowStateAction,
} from '$constants/misc';

/**
 * Функция для создания и показа окна разработчика
*/
export const createDevWindow = (): BrowserWindow => {
  const devWindowState = windowStateKeeper({
    defaultWidth: defaultDevWindowResolution.width,
    defaultHeight: defaultDevWindowResolution.height,
    file: 'window-dev-state.json',
  });

  const devWindow: BrowserWindow = new BrowserWindow({
    x: devWindowState.x,
    y: devWindowState.y,
    minWidth: defaultDevWindowResolution.minWidth,
    minHeight: defaultDevWindowResolution.minHeight,
    maxWidth: defaultDevWindowResolution.maxWidth,
    maxHeight: defaultDevWindowResolution.maxHeight,
    width: devWindowState.width,
    height: devWindowState.height,
    resizable: true,
    frame: false,
    show: false,
    title: 'Developer Screen',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test',
    },
  });

  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
    devWindow.loadURL(`file://${__dirname}/developer.html`);
  } else {
    const waitForWebpackDevServer = createWaitForWebpackDevServer(
      devWindow, 'http://localhost:8081/build/developer.html',
    );
    waitForWebpackDevServer();
  }

  if (process.env.NODE_ENV === 'development') {
    globalShortcut.register('F6', () => {
      devWindow.reload();
    });

    globalShortcut.register('F10', () => {
      devWindow.webContents.openDevTools();
    });
  }

  devWindowState.manage(devWindow);

  return devWindow;
};

export const addDevWindowListeners = (
  devWindow: BrowserWindow,
  mainWindow: BrowserWindow,
): void => {
  ipcMain.on(AppChannel.CHANGE_WINDOW_SIZE_STATE, (
    event,
    action: string,
    windowName: string,
  ) => {
    if (windowName === AppWindowName.DEV) {
      if (action === AppWindowStateAction.MINIMIZE_WINDOW) {
        devWindow.minimize();
      } else if (action === AppWindowStateAction.MAXIMIZE_WINDOW) {
        devWindow.maximize();
      } else if (action === AppWindowStateAction.UNMAXIMIZE_WINDOW) {
        devWindow.unmaximize();
      }
    }
  });

  ipcMain.on(AppChannel.CHANGE_DEV_WINDOW_STATE, (
    event,
    isOpen: boolean,
  ) => {
    if (devWindow && isOpen !== undefined) {
      if (isOpen) {
        devWindow.show();
        devWindow.focus();
      } else {
        devWindow.close();
      }
    }
  });

  devWindow.on('ready-to-show', () => {
    const isMax = devWindow.isMaximized();

    devWindow.show();
    devWindow.focus();

    devWindow.webContents.send(
      AppChannel.CHANGE_WINDOW_SIZE_STATE,
      isMax ? AppWindowStateAction.MAXIMIZE_WINDOW : AppWindowStateAction.UNMAXIMIZE_WINDOW,
      AppWindowName.DEV,
      isMax,
    );
  });

  devWindow.on('maximize', () => {
    devWindow.webContents.send(
      AppChannel.CHANGE_WINDOW_SIZE_STATE,
      AppWindowStateAction.MAXIMIZE_WINDOW,
      AppWindowName.DEV,
    );
  });

  devWindow.on('unmaximize', () => {
    devWindow.webContents.send(
      AppChannel.CHANGE_WINDOW_SIZE_STATE,
      AppWindowStateAction.UNMAXIMIZE_WINDOW,
      AppWindowName.DEV,
    );
  });

  devWindow.on('show', () => {
    mainWindow.webContents.send(AppChannel.CHANGE_DEV_WINDOW_STATE, true);
    devWindow.webContents.send(AppChannel.CHANGE_DEV_WINDOW_STATE, true);
  });

  devWindow.on('close', (event) => {
    // Изменено ввиду проблем с закрытием окон из панели задач системы
    event.preventDefault();
    mainWindow.webContents.send(AppChannel.CHANGE_DEV_WINDOW_STATE, false);
    devWindow.webContents.send(AppChannel.CHANGE_DEV_WINDOW_STATE, false);
    devWindow.hide();
    mainWindow.focus();
  });
};
