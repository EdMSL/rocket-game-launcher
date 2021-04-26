import { app, dialog, BrowserWindow } from 'electron';
// const { app, dialog, BrowserWindow } = require('electron');
import fs from 'fs';
import path from 'path';

import { createWaitForWebpackDevServer } from './components/waitDevServer';
// const { createWaitForWebpackDevServer } = require('./components/waitDevServer');
// import { configureStore } from '$store/store';
import { createStorage } from './components/createStorage';

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

  if (fs.existsSync(path.resolve('./ReduxDevToolsExtension'))) {
    session.loadExtension(
      path.resolve('./ReduxDevToolsExtension'),
    );
  }
}

const start = async() => {
  createStorage();

  // global['state'] = await storage.get('state');
  // const store = configureStore(global.state, 'main');

  // store.subscribe(async () => {
  //   global.state = store.getState();
  //   // persist store changes
  //   // TODO: should this be blocking / wait? _.throttle?
  //   await storage.set('state', global.state);
  // });

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
