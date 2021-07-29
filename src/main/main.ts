import { app, dialog, BrowserWindow } from 'electron';

import { createStorage } from './components/storage';
import { createWindow } from './components/window';

require('@electron/remote/main').initialize();

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
