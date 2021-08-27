import {
  IError,
  ISuccess,
} from '$types/common';
import { ISystemRootState } from '$types/system';

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
  isResizable: false,
  minWidth: defaultLauncherResolution.minWidth,
  minHeight: defaultLauncherResolution.minHeight,
  width: defaultLauncherResolution.width,
  height: defaultLauncherResolution.height,
  isFirstLaunch: true,
  modOrganizer: {
    isUsed: true,
    path: '.\\Mod Organizer',
    pathToINI: '.\\Mod Organizer\\ModOrganizer.ini',
    pathToProfiles: '.\\Mod Organizer\\profiles',
    profileSection: 'General',
    profileParam: 'selected_profile',
    profileParamValueRegExp: '',
    isSectional: true,
  },
  documentsPath: '.\\My Games\\Oblivion',
  customPaths: {},
};
