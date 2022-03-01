import { createReducer } from 'reduxsauce';

import { MAIN_HANDLERS } from '$handlers/main';
import { IMainRootState } from '$types/main';
import { defaultLauncherConfig } from '$constants/defaultParameters';
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
    isFirstLaunch: defaultLauncherConfig.isFirstLaunch,
    modOrganizer: defaultLauncherConfig.modOrganizer,
    documentsPath: defaultLauncherConfig.documentsPath,
    gameName: defaultLauncherConfig.gameName,
    playButton: defaultLauncherConfig.playButton,
    customButtons: defaultLauncherConfig.customButtons,
  },
  launcherVersion: '',
  pathVariables: DefaultPathVariable,
  isLauncherInitialised: false,
  isLauncherConfigChanged: false,
  isGameRunning: false,
  isGameSettingsLoaded: false,
  isGameSettingsAvailable: false,
  isGameSettingsSaving: false,
  isGameSettingsFilesBackuping: false,
  isDevWindowOpen: false,
  gameSettingsFilesBackup: [],
  userThemes: {},
  messages: [],
};

export const mainReducer = createReducer<IMainRootState>(INITIAL_STATE, MAIN_HANDLERS);
