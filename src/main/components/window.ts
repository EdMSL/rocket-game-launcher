import { BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import windowStateKeeper from 'electron-window-state';

import { createWaitForWebpackDevServer } from './waitDevServer';
import { defaultLauncherResolution } from '$constants/defaultParameters';

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

  const session = mainWindow.webContents.session;

  if (fs.existsSync(path.resolve('extensions/reduxDevToolsExtension'))) {
    session.loadExtension(
      path.resolve('extensions/reduxDevToolsExtension'),
    );
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindowState.manage(mainWindow);
};
