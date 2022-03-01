import {
  BrowserWindow,
  ipcMain,
  globalShortcut,
} from 'electron';
import fs from 'fs';
import path from 'path';
import windowStateKeeper from 'electron-window-state';

import { createWaitForWebpackDevServer } from './waitDevServer';
import { defaultLauncherResolution } from '$constants/defaultParameters';
import { IMainRootState } from '$types/main';
import { getDisplaysInfo } from '$utils/data';
import { AppEvent, AppWindowName } from '$constants/misc';

/**
 * Функция для создания и показа главного окна приложения
*/
export const createMainWindow = (
  config: IMainRootState['config'],
  windowCloseCallback: () => void,
  devWindow?: BrowserWindow|null,
): BrowserWindow => {
  const mainWindowState = windowStateKeeper({
    defaultWidth: config.width ? config.width : defaultLauncherResolution.width,
    defaultHeight: config.height ? config.height : defaultLauncherResolution.height,
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

  ipcMain.on(AppEvent.MINIMIZE_WINDOW, (event, windowName) => {
    if (windowName === AppWindowName.MAIN) {
      mainWindow.minimize();
    }
  });

  ipcMain.on(AppEvent.MAX_UNMAX_WINDOW, (event, isMax, windowName) => {
    if (windowName === AppWindowName.MAIN) {
      if (isMax) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on(AppEvent.RESIZE_WINDOW, (event, width, height) => {
    if (mainWindow.isFullScreen()) {
      mainWindow.unmaximize();
    }

    mainWindow.setMinimumSize(width, height);
    mainWindow.setSize(width, height);
  });

  ipcMain.on(AppEvent.SET_RESIZABLE_WINDOW, (event, isResizable) => {
    mainWindow.setResizable(isResizable);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.webContents.send(AppEvent.MAX_UNMAX_WINDOW, mainWindow.isMaximized());
  });

  mainWindow.on('resized', () => {
    devWindow!.webContents.send(AppEvent.WINDOW_RESIZED, mainWindow.getSize());
  });

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send(AppEvent.MAX_UNMAX_WINDOW, true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send(AppEvent.MAX_UNMAX_WINDOW, false);
  });

  mainWindow.on('close', () => {
    windowCloseCallback();
  });

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
