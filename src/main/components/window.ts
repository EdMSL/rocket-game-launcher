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
import { ISystemRootState } from '$types/system';
import { getDisplaysInfo } from '$utils/data';

/**
 * Функция для создания и показа окна приложения
*/
export const createWindow = (systemConfig: ISystemRootState): void => {
  const mainWindowState = windowStateKeeper({
    defaultWidth: defaultLauncherResolution.width,
    defaultHeight: defaultLauncherResolution.height,
  });

  const mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    minWidth: systemConfig.isResizable ? systemConfig.minWidth : 0,
    minHeight: systemConfig.isResizable ? systemConfig.minHeight : 0,
    maxWidth: systemConfig.isResizable ? systemConfig.maxWidth : 0,
    maxHeight: systemConfig.isResizable ? systemConfig.maxHeight : 0,
    width: systemConfig.isResizable ? mainWindowState.width : systemConfig.width,
    height: systemConfig.isResizable ? mainWindowState.height : systemConfig.height,
    resizable: systemConfig.isResizable,
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
