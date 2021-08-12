import { createReducer } from 'reduxsauce';

import { SYSTEM_HANDLERS } from '$handlers/system'; //eslint-disable-line import/no-cycle
import { defaultLauncherConfig } from '$constants/defaultParameters'; //eslint-disable-line import/no-cycle, max-len

export type ISystemRootState = Readonly<{
  isResizable: boolean,
  minWidth: number,
  minHeight: number,
  width: number,
  height: number,
  isFirstLaunch: boolean,
}>;

const INITIAL_STATE: ISystemRootState = {
  isResizable: true,
  minWidth: defaultLauncherConfig.minWidth,
  minHeight: defaultLauncherConfig.minHeight,
  width: defaultLauncherConfig.width,
  height: defaultLauncherConfig.height,
  isFirstLaunch: true,
};

export const systemReducer = createReducer<ISystemRootState>(INITIAL_STATE, SYSTEM_HANDLERS);
