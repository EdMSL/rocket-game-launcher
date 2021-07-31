import { ILauncherResolution } from '$constants/interfaces';
import { ISystemRootState } from '$reducers/system';

export const defaultLauncherResolution: ILauncherResolution = {
  width: 1024,
  height: 768,
};

export const defaultLauncherConfig: ISystemRootState = {
  isFirstLaunch: true,
};
