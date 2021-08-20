import { createReducer } from 'reduxsauce';

import { defaultLauncherConfig } from '$constants/defaultParameters';
import { SYSTEM_HANDLERS } from '$handlers/system';
import { ISystemRootState } from '$types/system';

const INITIAL_STATE: ISystemRootState = {
  isResizable: defaultLauncherConfig.isResizable,
  minWidth: defaultLauncherConfig.minWidth,
  minHeight: defaultLauncherConfig.minHeight,
  width: defaultLauncherConfig.width,
  height: defaultLauncherConfig.height,
  isFirstLaunch: defaultLauncherConfig.isFirstLaunch,
  modOrganizer: defaultLauncherConfig.modOrganizer,
};

export const systemReducer = createReducer<ISystemRootState>(INITIAL_STATE, SYSTEM_HANDLERS);
