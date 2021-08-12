import { BrowserWindow, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import windowStateKeeper from 'electron-window-state';

import { createWaitForWebpackDevServer } from './waitDevServer';
import { defaultLauncherResolution } from '$constants/defaultParameters';

/**
 * Функция для создания и показа окна приложения
*/
export const createWindow = (): void => {
  const mainWindowState = windowStateKeeper({
    defaultWidth: defaultLauncherResolution.width,
    defaultHeight: defaultLauncherResolution.height,
  });

  const mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  if (process.env.NODE_ENV === 'production') {
    mainWindow.loadFile('./index.html');
  } else {
    const waitForWebpackDevServer = createWaitForWebpackDevServer(mainWindow);
    waitForWebpackDevServer();
  }

  const pathToExtension = path.resolve('extensions/reduxDevTools');

  if (process.env.NODE_ENV === 'development' && fs.existsSync(pathToExtension)) {
    mainWindow.webContents.session.loadExtension(pathToExtension);
  }

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

  mainWindowState.manage(mainWindow);
};
