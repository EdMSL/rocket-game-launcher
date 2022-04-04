import {
  BrowserWindow,
  ipcMain,
  globalShortcut,
} from 'electron';
import fs from 'fs';
import path from 'path';
import windowStateKeeper from 'electron-window-state';
import { Store } from 'redux';

import { createWaitForWebpackDevServer } from './waitDevServer';
import { defaultLauncherWindowSettings } from '$constants/defaultParameters';
import { ILauncherConfig } from '$types/main';
import { getDisplaysInfo } from '$utils/data';
import { AppChannel, AppWindowName } from '$constants/misc';
import { IPathVariables } from '$constants/paths';
import { changeWindowSize } from '$utils/process';
import { IAppState } from '$store/store';
import {
  setIsLauncherConfigChanged, setLauncherConfig, setPathVariables,
} from '$actions/main';
import { IGameSettingsConfig } from '$types/gameSettings';
import { setGameSettingsConfig } from '$actions/gameSettings';

/**
 * Функция для создания и показа главного окна приложения
*/
export const createMainWindow = (
  appStore: Store<IAppState>,
  closeWindowCallback: () => void,
): BrowserWindow => {
  const { config } = appStore.getState().main;

  const mainWindowState = windowStateKeeper({
    defaultWidth: config.width ? config.width : defaultLauncherWindowSettings.width,
    defaultHeight: config.height ? config.height : defaultLauncherWindowSettings.height,
    file: 'window-main-state.json',
  });

  const mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    minWidth: config.isResizable ? config.minWidth : 0,
    minHeight: config.isResizable ? config.minHeight : 0,
    maxWidth: config.isResizable ? config.maxWidth : 0,
    maxHeight: config.isResizable ? config.maxHeight : 0,
    width: config.isResizable ? mainWindowState.width : config.width,
    height: config.isResizable ? mainWindowState.height : config.height,
    resizable: config.isResizable,
    frame: false,
    title: config.gameName ? config.gameName : 'Game Launcher',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: process.env.NODE_ENV === 'development',
    },
  });

  if (process.env.NODE_ENV === 'production') {
    mainWindow.loadFile('./dist/index.html');
  } else {
    const waitForWebpackDevServer = createWaitForWebpackDevServer(
      mainWindow, 'http://localhost:8081/build/index.html',
    );
    waitForWebpackDevServer();
  }

  const pathToExtension = path.resolve('extensions/reduxDevTools');

  if (process.env.NODE_ENV === 'development' && fs.existsSync(pathToExtension)) {
    mainWindow.webContents.session.loadExtension(pathToExtension);
  }

  getDisplaysInfo();

  if (process.env.NODE_ENV === 'production') {
    globalShortcut.register('F11', () => {
      // отключаем разворачивание окна приложения
    });
  }

  if (process.env.NODE_ENV === 'development') {
    globalShortcut.register('F5', () => {
      mainWindow.reload();
    });

    globalShortcut.register('F11', () => {
      mainWindow.webContents.openDevTools();
    });
  }

  mainWindowState.manage(mainWindow);

  ipcMain.on(AppChannel.MINIMIZE_WINDOW, (event, windowName) => {
    if (windowName === AppWindowName.MAIN) {
      mainWindow.minimize();
    }
  });

  ipcMain.on(AppChannel.MAX_UNMAX_WINDOW, (event, isMax, windowName) => {
    if (windowName === AppWindowName.MAIN) {
      if (isMax) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on(AppChannel.SAVE_CONFIG, (
    event,
    isProcessing: boolean,
    newConfig: ILauncherConfig|IGameSettingsConfig,
    pathVariables: IPathVariables,
    isChangeWindowSize: boolean,
  ) => {
    if (newConfig !== undefined) {
      if ('baseFilesEncoding' in newConfig) {
        appStore.dispatch(setGameSettingsConfig(newConfig));
        appStore.dispatch(setIsLauncherConfigChanged(true));
      } else if ('playButton' in newConfig) {
        if (isChangeWindowSize !== undefined && isChangeWindowSize) {
          changeWindowSize(mainWindow, newConfig);
        }

        if (pathVariables !== undefined) {
          appStore.dispatch(setLauncherConfig(newConfig));
          appStore.dispatch(setPathVariables(pathVariables));
          appStore.dispatch(setIsLauncherConfigChanged(true));
        }
      }
    }

    if (isProcessing !== undefined) {
      mainWindow.webContents.send(AppChannel.SAVE_CONFIG, isProcessing);
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.webContents.send(AppChannel.MAX_UNMAX_WINDOW, mainWindow.isMaximized());
  });

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send(AppChannel.MAX_UNMAX_WINDOW, true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send(AppChannel.MAX_UNMAX_WINDOW, false);
  });

  mainWindow.on('close', () => {
    closeWindowCallback();
  });

  return mainWindow;
};
