import { createReducer } from 'reduxsauce';

import { DEVELOPER_HANDLERS } from '$handlers/developer';
import { IDeveloperRootState } from '$types/developer';
import { defaultGameSettingsConfig, defaultLauncherConfig } from '$constants/defaultParameters';
import { DefaultPathVariable } from '$constants/paths';

export const INITIAL_STATE: IDeveloperRootState = {
  launcherConfig: {
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
  gameSettingsConfig: defaultGameSettingsConfig,
  isLauncherConfigProcessing: false,
  isGameSettingsConfigProcessing: false,
  isGameSettingsConfigLoaded: false,
  isGameSettingsConfigChanged: false,
  pathVariables: DefaultPathVariable,
  messages: [],
};

export const developerReducer = createReducer<IDeveloperRootState>(INITIAL_STATE, DEVELOPER_HANDLERS);
