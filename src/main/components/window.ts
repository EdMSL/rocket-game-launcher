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
import { IConfigRootState } from '$types/config';
import { getDisplaysInfo } from '$utils/data';

/**
 * Функция для создания и показа окна приложения
*/
export const createWindow = (config: IConfigRootState): void => {
  const mainWindowState = windowStateKeeper({
    defaultWidth: defaultLauncherResolution.width,
    defaultHeight: defaultLauncherResolution.height,
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
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  if (process.env.NODE_ENV === 'production') {
    mainWindow.loadFile('./dist/index.html');
  } else {
    const waitForWebpackDevServer = createWaitForWebpackDevServer(mainWindow);
    waitForWebpackDevServer();
  }

  const pathToExtension = path.resolve('extensions/reduxDevTools');

  if (process.env.NODE_ENV === 'development' && fs.existsSync(pathToExtension)) {
    mainWindow.webContents.session.loadExtension(pathToExtension);
  }

  getDisplaysInfo();

  ipcMain.on('minimize window', () => {
    mainWindow.minimize();
  });

  ipcMain.on('max-unmax window', (evt, isMax) => {
    if (isMax) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.webContents.send('max-unmax window', mainWindow.isMaximized());
  });

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('max-unmax window', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('max-unmax window', false);
  });

  if (process.env.NODE_ENV === 'production') {
    globalShortcut.register('F11', () => {
      // отключаем разворачивание окна приложения
    });
  }

  if (process.env.NODE_ENV === 'development') {
    globalShortcut.register('F11', () => {
      mainWindow.webContents.openDevTools();
    });

    globalShortcut.register('F5', () => {
      mainWindow.reload();
    });
  }

  mainWindowState.manage(mainWindow);
};
