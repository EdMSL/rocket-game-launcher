import { createReducer } from 'reduxsauce';

import { SYSTEM_HANDLERS } from '$handlers/system';
import { defaultLauncherConfig } from '$constants/defaultParameters';

interface IModOrganizerParams {
  isUsed: boolean,
  pathToINI: string,
  profilesParam: string,
  paramValueRegExp: string,
}

export type ISystemRootState = Readonly<{
  isResizable: boolean,
  minWidth: number,
  minHeight: number,
  width: number,
  height: number,
  isFirstLaunch: boolean,
  modOrganizer: IModOrganizerParams,
}>;

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
