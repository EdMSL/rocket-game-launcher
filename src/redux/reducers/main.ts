import { createReducer } from 'reduxsauce';

import { MAIN_HANDLERS } from '$handlers/main';
import { IMainRootState } from '$types/main';
import { defaultLauncherConfig } from '$constants/defaultData';
import { DefaultPathVariable } from '$constants/paths';

export const INITIAL_STATE: IMainRootState = {
  config: {
    isResizable: defaultLauncherConfig.isResizable,
    minWidth: defaultLauncherConfig.minWidth,
    minHeight: defaultLauncherConfig.minHeight,
    maxWidth: defaultLauncherConfig.maxWidth,
    maxHeight: defaultLauncherConfig.maxHeight,
    width: defaultLauncherConfig.width,
    height: defaultLauncherConfig.height,
    isFirstStart: defaultLauncherConfig.isFirstStart,
    gameName: defaultLauncherConfig.gameName,
    playButton: defaultLauncherConfig.playButton,
    customButtons: defaultLauncherConfig.customButtons,
  },
  launcherVersion: '',
  pathVariables: DefaultPathVariable,
  isLauncherInitialised: false,
  isGameSettingsConfigChanged: false,
  isDevWindowOpening: false,
  isGameRunning: false,
  isConfigLoading: false,
  isGameSettingsLoading: false,
  isGameSettingsLoaded: false,
  isGameSettingsAvailable: true,
  isGameSettingsFileExists: true,
  isGameSettingsSaving: false,
  isGameSettingsFilesBackuping: false,
  isDeveloperMode: false,
  gameSettingsFilesBackup: [],
  userThemes: {},
  messages: [],
};

export const mainReducer = createReducer<IMainRootState>(INITIAL_STATE, MAIN_HANDLERS);
