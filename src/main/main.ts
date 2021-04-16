const { app, BrowserWindow } = require('electron');

const { createWaitForWebpackDevServer } = require('./components/waitDevServer');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  if (process.env.NODE_ENV === 'production') {
    win.loadFile('./index.html');
  } else {
    const waitForWebpackDevServer = createWaitForWebpackDevServer(win);
    waitForWebpackDevServer();
  }
}

app.on('ready', () => {
  createWindow();
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
