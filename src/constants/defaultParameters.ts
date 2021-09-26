import {
  IError,
  ISuccess,
} from '$types/common';
import { IModOrganizerParams, ISystemRootState } from '$types/system';

export const SUCCESS_STATUS: ISuccess = 'success';
export const ERROR_STATUS: IError = 'error';
export const WARNING_STATUS = 'warning';

export const defaultLauncherResolution = {
  width: 800,
  height: 600,
  minWidth: 0,
  minHeight: 0,
  maxWidth: 0,
  maxHeight: 0,
};

export const minimalLauncherConfig = {
  isResizable: false,
  width: defaultLauncherResolution.width,
  height: defaultLauncherResolution.height,
  modOrganizer: {
    isUsed: false,
  },
  documentsPath: 'My Games\\Oblivion',
  isFirstLaunch: true,
  customPaths: {},
  playButton: {
    path: '%GAME_DIR%\\Oblivion.exe',
    label: 'Играть',
  },
  customButtons: [],
};

export const defaultModOrganizerParams: IModOrganizerParams = {
  isUsed: false,
  version: 2,
  path: 'Mod Organizer',
  pathToINI: 'Mod Organizer\\ModOrganizer.ini',
  pathToProfiles: 'Mod Organizer\\profiles',
  profileSection: 'General',
  profileParam: 'selected_profile',
  profileParamValueRegExp: '',
};

export const defaultLauncherConfig: ISystemRootState = {
  isResizable: false,
  minWidth: defaultLauncherResolution.minWidth,
  minHeight: defaultLauncherResolution.minHeight,
  maxWidth: defaultLauncherResolution.maxWidth,
  maxHeight: defaultLauncherResolution.maxHeight,
  width: defaultLauncherResolution.width,
  height: defaultLauncherResolution.height,
  isFirstLaunch: true,
  modOrganizer: defaultModOrganizerParams,
  documentsPath: '',
  customPaths: {},
  gameName: '',
  playButton: {
    path: '',
    args: [],
    label: 'Играть',
  },
  customButtons: [],
};
