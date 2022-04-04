import {
  BrowserWindow,
  globalShortcut,
  ipcMain,
} from 'electron';
import windowStateKeeper from 'electron-window-state';

import { createWaitForWebpackDevServer } from './waitDevServer';
import { defaultDevWindowResolution } from '$constants/defaultParameters';
import {
  AppChannel, AppWindowName, AppWindowStateAction,
} from '$constants/misc';
import { ILauncherConfig } from '$types/main';
import { IGameSettingsConfig } from '$types/gameSettings';

/**
 * Функция для создания и показа окна разработчика
*/
export const createDevWindow = (): BrowserWindow => {
  const devWindowState = windowStateKeeper({
    defaultWidth: defaultDevWindowResolution.width,
    defaultHeight: defaultDevWindowResolution.height,
    file: 'window-dev-state.json',
  });

  const devWindow: BrowserWindow = new BrowserWindow({
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
      devTools: process.env.NODE_ENV === 'development',
    },
  });

  if (process.env.NODE_ENV === 'production') {
    devWindow.loadURL(`file://${__dirname}/developer.html`);
  } else {
    const waitForWebpackDevServer = createWaitForWebpackDevServer(
      devWindow, 'http://localhost:8081/build/developer.html',
    );
    waitForWebpackDevServer();
  }

  if (process.env.NODE_ENV === 'development') {
    globalShortcut.register('F6', () => {
      devWindow.reload();
    });

    globalShortcut.register('F10', () => {
      devWindow.webContents.openDevTools();
    });
  }

  devWindowState.manage(devWindow);

  return devWindow;
};

export const addDevWindowListeners = (
  devWindow: BrowserWindow,
  mainWindow: BrowserWindow,
  afterCreateCallback: () => void,
): void => {
  ipcMain.on(AppChannel.OPEN_DEV_WINDOW, () => {
    devWindow.show();
    devWindow.focus();
  });

  ipcMain.on(AppChannel.CHANGE_WINDOW_SIZE_STATE, (
    event,
    action: string,
    windowName: string,
  ) => {
    if (windowName === AppWindowName.DEV) {
      if (action === AppWindowStateAction.MINIMIZE_WINDOW) {
        devWindow.minimize();
      } else if (action === AppWindowStateAction.MAXIMIZE_WINDOW) {
        devWindow.maximize();
      } else if (action === AppWindowStateAction.UNMAXIMIZE_WINDOW) {
        devWindow.unmaximize();
      }
    }
  });

  devWindow.on('ready-to-show', () => {
    afterCreateCallback();
  });

  devWindow.on('show', (
    event,
    launcherConfig: ILauncherConfig,
    gameSettingsConfig: IGameSettingsConfig,
  ) => {
    mainWindow.webContents.send(AppChannel.DEV_WINDOW_OPENED, {
      launcherConfig,
      gameSettingsConfig,
    });
  });

  devWindow.on('maximize', () => {
    devWindow.webContents.send(
      AppChannel.CHANGE_WINDOW_SIZE_STATE,
      AppWindowStateAction.MAXIMIZE_WINDOW,
      AppWindowName.DEV,
    );
  });

  devWindow.on('unmaximize', () => {
    devWindow.webContents.send(
      AppChannel.CHANGE_WINDOW_SIZE_STATE,
      AppWindowStateAction.UNMAXIMIZE_WINDOW,
      AppWindowName.DEV,
    );
  });

  devWindow.on('show', () => {
    const isMax = devWindow.isMaximized();

    devWindow.webContents.send(
      AppChannel.CHANGE_WINDOW_SIZE_STATE,
      isMax ? AppWindowStateAction.MAXIMIZE_WINDOW : AppWindowStateAction.UNMAXIMIZE_WINDOW,
      AppWindowName.DEV,
      isMax,
    );
  });

  ipcMain.on(AppChannel.CLOSE_DEV_WINDOW, (event, isByCloseWindowBtnClick = false) => {
    devWindow.webContents.send(AppChannel.DEV_WINDOW_CLOSED, isByCloseWindowBtnClick);
    mainWindow.webContents.send(AppChannel.DEV_WINDOW_CLOSED);
    devWindow.hide();
  });

  devWindow.on('close', (event) => {
    // Изменено ввиду проблем с закрытием окон из панели задач системы
    event.preventDefault();
    mainWindow.webContents.send(AppChannel.DEV_WINDOW_CLOSED);
    devWindow.hide();
  });
};
