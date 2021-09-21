import { createReducer } from 'reduxsauce';

import { defaultLauncherConfig } from '$constants/defaultParameters';
import { SYSTEM_HANDLERS } from '$handlers/system';
import { ISystemRootState } from '$types/system';

const INITIAL_STATE: ISystemRootState = {
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
  playButton: defaultLauncherConfig.playButton,
  customButtons: defaultLauncherConfig.customButtons,
};

export const systemReducer = createReducer<ISystemRootState>(INITIAL_STATE, SYSTEM_HANDLERS);
