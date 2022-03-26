import {
  BrowserWindow,
  globalShortcut,
  ipcMain,
} from 'electron';
import windowStateKeeper from 'electron-window-state';

import { createWaitForWebpackDevServer } from './waitDevServer';
import { defaultDevWindowResolution } from '$constants/defaultParameters';
import { AppChannel, AppWindowName } from '$constants/misc';

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
      devTools: process.env.NODE_ENV === 'development',
    },
  });

  if (process.env.NODE_ENV === 'production') {
    devWindow.loadURL(`file://${__dirname}/index.html#/developer`);
  } else {
    const waitForWebpackDevServer = createWaitForWebpackDevServer(
      devWindow, 'http://localhost:8081/build/index.html/#developer',
    );
    waitForWebpackDevServer();
  }

  if (process.env.NODE_ENV === 'development') {
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
  afterCreateCallback: () => void,
): void => {
  ipcMain.on(AppChannel.OPEN_DEV_WINDOW, () => {
    devWindow.show();
    devWindow.focus();
  });

  ipcMain.on(AppChannel.MINIMIZE_WINDOW, (event, windowName) => {
    if (windowName === AppWindowName.DEV) {
      devWindow.minimize();
    }
  });

  ipcMain.on(AppChannel.MAX_UNMAX_WINDOW, (evt, isMax, windowName) => {
    if (windowName === AppWindowName.DEV) {
      if (isMax) {
        devWindow.unmaximize();
      } else {
        devWindow.maximize();
      }
    }
  });

  devWindow.on('ready-to-show', () => {
    afterCreateCallback();
  });

  devWindow.on('show', () => {
    mainWindow.webContents.send(AppChannel.DEV_WINDOW_OPENED);
  });

  devWindow.on('maximize', () => {
    devWindow.webContents.send(AppChannel.MAX_UNMAX_WINDOW, true);
  });

  devWindow.on('unmaximize', () => {
    devWindow.webContents.send(AppChannel.MAX_UNMAX_WINDOW, false);
  });

  devWindow.on('show', () => {
    devWindow.webContents.send(AppChannel.MAX_UNMAX_WINDOW, devWindow.isMaximized());
  });

  ipcMain.on(AppChannel.CLOSE_DEV_WINDOW, (event, isByCloseWindowBtnClick = false) => {
    devWindow.webContents.send(AppChannel.DEV_WINDOW_CLOSED, isByCloseWindowBtnClick);
    mainWindow.webContents.send(AppChannel.DEV_WINDOW_CLOSED);
    devWindow.hide();
  });

  devWindow.on('close', (event) => {
    // Изменено ввиду проблем с закрытием окон из панели задач системы
    event.preventDefault();
    mainWindow.webContents.send(AppChannel.DEV_WINDOW_CLOSED);
    devWindow.hide();
  });
};
