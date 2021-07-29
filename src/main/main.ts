import { app, dialog, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';

import { createWaitForWebpackDevServer } from './components/waitDevServer';
import { createStorage } from './components/storage';

require('@electron/remote/main').initialize();

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  if (process.env.NODE_ENV === 'production') {
    win.loadFile('./index.html');
  } else {
    const waitForWebpackDevServer = createWaitForWebpackDevServer(win);
    waitForWebpackDevServer();
  }

  const session = win.webContents.session;

  if (fs.existsSync(path.resolve('extensions/reduxDevToolsExtension'))) {
    session.loadExtension(
      path.resolve('extensions/reduxDevToolsExtension'),
    );
  }
}

const start = async() => {
  createStorage();

  createWindow();
};

app.on('ready', () => {
  start()
    .catch((err) => {
      dialog.showErrorBox('There\'s been an error', err.message);
    });
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
