import { app, dialog, BrowserWindow } from 'electron';

import { createStorage } from './components/storage';
import { createWindow } from './components/window';
import { createLogFile } from '$utils/log';

require('@electron/remote/main').initialize();

createLogFile();

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
