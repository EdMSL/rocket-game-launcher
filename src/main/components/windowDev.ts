import {
  BrowserWindow,
  ipcMain,
} from 'electron';

import { createWaitForWebpackDevServer } from './waitDevServer';

/**
 * Функция для создания и показа окна разработчика
*/
export const createDevWindow = (): void => {
  const devWindow = new BrowserWindow({
    width: 1024,
    height: 650,
    resizable: true,
    frame: false,
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

  ipcMain.on('ready-to-show', () => {
    devWindow.show();
  });
};
