import {
  BrowserWindow,
  globalShortcut,
  ipcMain,
} from 'electron';
import windowStateKeeper from 'electron-window-state';

import { createWaitForWebpackDevServer } from './waitDevServer';
import { defaultDevWindowResolution } from '$constants/defaultParameters';

/**
 * Функция для создания и показа окна разработчика
*/
export const createDevWindow = (): BrowserWindow|null => {
  const devWindowState = windowStateKeeper({
    defaultWidth: defaultDevWindowResolution.width,
    defaultHeight: defaultDevWindowResolution.height,
    file: 'window-dev-state.json',
  });

  let devWindow: BrowserWindow|null = new BrowserWindow({
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
      enableRemoteModule: true,
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
      devWindow!.webContents.openDevTools();
    });
  }

  ipcMain.on('minimize window', (event, windowType) => {
    if (windowType === 'dev') {
      devWindow!.minimize();
    }
  });

  ipcMain.on('max-unmax window', (evt, isMax, windowType) => {
    if (windowType === 'dev') {
      if (isMax) {
        devWindow!.unmaximize();
      } else {
        devWindow!.maximize();
      }
    }
  });

  devWindow.on('maximize', () => {
    devWindow!.webContents.send('max-unmax window', true);
  });

  devWindow.on('unmaximize', () => {
    devWindow!.webContents.send('max-unmax window', false);
  });

  devWindow.on('show', () => {
    devWindow!.webContents.send('max-unmax window', devWindow!.isMaximized());
  });

  ipcMain.on('close window', () => {
    devWindow!.hide();
  });

  devWindow.on('close', () => {
    devWindow = null;
  });

  devWindow.on('closed', () => {
    devWindow = null;
  });

  devWindowState.manage(devWindow);

  return devWindow;
};
