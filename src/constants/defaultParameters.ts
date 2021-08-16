import {
  IError,
  ISuccess,
} from '$types/common';
import { ISystemRootState } from '$reducers/system'; //eslint-disable-line import/no-cycle

export const SUCCESS_STATUS: ISuccess = 'success';
export const ERROR_STATUS: IError = 'error';
export const WARNING_STATUS = 'warning';

export const defaultLauncherResolution = {
  width: 1024,
  height: 768,
  minWidth: 800,
  minHeight: 600,
};

export const defaultLauncherConfig: ISystemRootState = {
  isResizable: true,
  minWidth: defaultLauncherResolution.minWidth,
  minHeight: defaultLauncherResolution.minWidth,
  width: defaultLauncherResolution.width,
  height: defaultLauncherResolution.height,
  isFirstLaunch: true,
  modOrganizer: {
    isUsed: true,
    pathToINI: './Mod Organizer/ModOrganizer.ini',
    profilesParam: 'selected_profile',
    paramValueRegExp: '',
  },
};
