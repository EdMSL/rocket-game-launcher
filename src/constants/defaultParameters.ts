import {
  IError,
  ISuccess,
} from '$types/common';
import {
  ILauncherAppButton,
  ILauncherConfig,
  ILauncherCustomButton,
  IModOrganizerParams,
} from '$types/main';
import { LauncherButtonAction } from './misc';

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

export const MinWindowSize = {
  HEIGHT: 400,
  WIDTH: 400,
};

export const defaultLauncherResolution = {
  width: 800,
  height: 600,
  minWidth: MinWindowSize.WIDTH,
  minHeight: MinWindowSize.HEIGHT,
  maxWidth: 0,
  maxHeight: 0,
};

export const defaultDevWindowResolution = {
  width: 1024,
  height: 768,
  minWidth: 800,
  minHeight: 600,
  maxWidth: 0,
  maxHeight: 0,
};

export const defaultLauncherCustomButton: ILauncherCustomButton = {
  id: '',
  action: LauncherButtonAction.OPEN,
  label: '',
  path: '',
  args: [],
};

export const defaultModOrganizerParams: IModOrganizerParams = {
  isUsed: false,
  version: 2,
  pathToMOFolder: '%GAME_DIR%\\Mod Organizer',
  pathToINI: '%MO_DIR%\\ModOrganizer.ini',
  pathToProfiles: '%MO_DIR%\\profiles',
  pathToMods: '%MO_DIR%\\mods',
  profileSection: 'General',
  profileParam: 'selected_profile',
  profileParamValueRegExp: '',
};

export const defaultLauncherConfig: ILauncherConfig = {
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
  gameName: 'Rocket Game Launcher',
  playButton: {
    path: '',
    args: [],
    label: 'Играть',
  },
  customButtons: [],
};
