import { createReducer } from 'reduxsauce';

import { defaultLauncherConfig } from '$constants/defaultParameters';
import { CONFIG_HANDLERS } from '$handlers/config';
import { IConfigRootState } from '$types/config';

export const INITIAL_STATE: IConfigRootState = {
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
  customPaths: defaultLauncherConfig.customPaths,
  gameName: defaultLauncherConfig.gameName,
  playButton: defaultLauncherConfig.playButton,
  customButtons: defaultLauncherConfig.customButtons,
};

export const configReducer = createReducer<IConfigRootState>(INITIAL_STATE, CONFIG_HANDLERS);
