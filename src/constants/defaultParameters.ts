import {
  IError,
  ISuccess,
} from '$types/common';
import {
  ILauncherAppButton,
  ILauncherCustomButton,
  IModOrganizerParams,
  ISystemRootState,
} from '$types/system';

export const SUCCESS_STATUS: ISuccess = 'success';
export const ERROR_STATUS: IError = 'error';
export const WARNING_STATUS = 'warning';

interface ILauncherConfigModOrganizerParams {
  isUsed: boolean,
  version?: number,
  path?: string,
  pathToINI?: string,
  pathToProfiles?: string,
  pathToMods?: string,
  profileSection?: string,
  profileParam?: string,
  profileParamValueRegExp?: string,
}

export interface ILauncherConfig {
  isResizable?: boolean,
  minWidth?: number,
  minHeight?: number,
  maxWidth?: number,
  maxHeight?: number,
  width?: number,
  height?: number,
  isFirstLaunch?: boolean,
  modOrganizer?: ILauncherConfigModOrganizerParams,
  documentsPath?: string,
  customPaths?: { [label: string]: string, },
  gameName?: string,
  playButton?: ILauncherAppButton,
  customButtons?: ILauncherCustomButton[],
}

export const defaultLauncherResolution = {
  width: 800,
  height: 600,
  minWidth: 0,
  minHeight: 0,
  maxWidth: 0,
  maxHeight: 0,
};

export const minimalLauncherConfig: ILauncherConfig = {
  isResizable: false,
  width: defaultLauncherResolution.width,
  height: defaultLauncherResolution.height,
  modOrganizer: {
    isUsed: false,
  },
  documentsPath: '',
  isFirstLaunch: true,
  customPaths: {},
  playButton: {
    path: '',
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
  pathToMods: 'Mod Organizer\\mods',
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
