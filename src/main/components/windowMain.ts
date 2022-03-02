import {
  BrowserWindow,
  ipcMain,
  globalShortcut,
} from 'electron';
import fs from 'fs';
import path from 'path';
import windowStateKeeper from 'electron-window-state';

import { createWaitForWebpackDevServer } from './waitDevServer';
import { defaultLauncherWindowSettings, MinWindowSize } from '$constants/defaultParameters';
import { IMainRootState, IWindowSettings } from '$types/main';
import { getDisplaysInfo } from '$utils/data';
import { AppChannel, AppWindowName } from '$constants/misc';

/**
 * Функция для создания и показа главного окна приложения
*/
export const createMainWindow = (
  config: IMainRootState['config'],
): BrowserWindow => {
  const mainWindowState = windowStateKeeper({
    defaultWidth: config.width ? config.width : defaultLauncherWindowSettings.width,
    defaultHeight: config.height ? config.height : defaultLauncherWindowSettings.height,
    file: 'window-main-state.json',
  });

  const mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    minWidth: config.isResizable ? config.minWidth : 0,
    minHeight: config.isResizable ? config.minHeight : 0,
    maxWidth: config.isResizable ? config.maxWidth : 0,
    maxHeight: config.isResizable ? config.maxHeight : 0,
    width: config.isResizable ? mainWindowState.width : config.width,
    height: config.isResizable ? mainWindowState.height : config.height,
    resizable: config.isResizable,
    frame: false,
    title: config.gameName ? `${config.gameName} Launcher` : 'Game Launcher',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      devTools: process.env.NODE_ENV === 'development',
    },
  });

  if (process.env.NODE_ENV === 'production') {
    mainWindow.loadFile('./dist/index.html');
  } else {
    const waitForWebpackDevServer = createWaitForWebpackDevServer(
      mainWindow, 'http://localhost:8081/build/index.html',
    );
    waitForWebpackDevServer();
  }

  const pathToExtension = path.resolve('extensions/reduxDevTools');

  if (process.env.NODE_ENV === 'development' && fs.existsSync(pathToExtension)) {
    mainWindow.webContents.session.loadExtension(pathToExtension);
  }

  getDisplaysInfo();

  if (process.env.NODE_ENV === 'production') {
    globalShortcut.register('F11', () => {
      // отключаем разворачивание окна приложения
    });
  }

  if (process.env.NODE_ENV === 'development') {
    globalShortcut.register('F5', () => {
      mainWindow.reload();
    });

    globalShortcut.register('F11', () => {
      mainWindow.webContents.openDevTools();
    });
  }

  mainWindowState.manage(mainWindow);

  return mainWindow;
};

export const addMainWindowListeners = (
  mainWindow: BrowserWindow,
  devWindow: BrowserWindow,
  closeWindowCallback: () => void,
): void => {
  ipcMain.on(AppChannel.MINIMIZE_WINDOW, (event, windowName) => {
    if (windowName === AppWindowName.MAIN) {
      mainWindow.minimize();
    }
  });

  ipcMain.on(AppChannel.MAX_UNMAX_WINDOW, (event, isMax, windowName) => {
    if (windowName === AppWindowName.MAIN) {
      if (isMax) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on(AppChannel.CHANGE_WINDOW_SETTINGS, (event, windowSettings: IWindowSettings) => {
    if (mainWindow.isFullScreen()) {
      mainWindow.unmaximize();
    }

    mainWindow.setResizable(windowSettings.isResizable);

    if (windowSettings.isResizable) {
      mainWindow.setMinimumSize(windowSettings.minWidth, windowSettings.minHeight);
      mainWindow.setMaximumSize(windowSettings.maxWidth, windowSettings.maxHeight);

      const currentSize = mainWindow.getSize();

      if (currentSize[0] < windowSettings.minWidth || currentSize[1] < windowSettings.minHeight) {
        mainWindow.setSize(windowSettings.minWidth, windowSettings.minHeight);
      } else if (currentSize[0] > windowSettings.maxWidth || currentSize[1] > windowSettings.maxHeight) {
        mainWindow.setSize(windowSettings.maxWidth, windowSettings.maxHeight);
      }
    } else {
      mainWindow.setMinimumSize(MinWindowSize.WIDTH, MinWindowSize.HEIGHT);
      mainWindow.setMaximumSize(0, 0);
      mainWindow.setSize(windowSettings.width, windowSettings.height);
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.webContents.send(AppChannel.MAX_UNMAX_WINDOW, mainWindow.isMaximized());
  });

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send(AppChannel.MAX_UNMAX_WINDOW, true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send(AppChannel.MAX_UNMAX_WINDOW, false);
  });

  mainWindow.on('close', () => {
    closeWindowCallback();
  });
};
