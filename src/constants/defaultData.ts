import {
  IError,
  ISuccess,
} from '$types/common';
import {
  IGameSettingsConfig, IGameSettingsItemParameter, IGameSettingsParameter,
} from '$types/gameSettings';
import {
  ILauncherConfig,
  ILauncherCustomButton,
  IModOrganizerParams,
  IWindowSettings,
} from '$types/main';
import {
  Encoding, GameSettingControllerType, GameSettingsOptionType, LauncherButtonAction,
} from './misc';

export const SUCCESS_STATUS: ISuccess = 'success';
export const ERROR_STATUS: IError = 'error';
export const WARNING_STATUS = 'warning';

export const MinWindowSize = {
  HEIGHT: 300,
  WIDTH: 300,
};

export const TEXT_INPUT_MAX_LENGTH = 50;

export const emptyGameSettingsGroup = {
  id: '', name: '', label: '',
};

export const defaultLauncherWindowSettings: IWindowSettings = {
  isResizable: false,
  width: 800,
  height: 600,
  minWidth: MinWindowSize.WIDTH,
  minHeight: MinWindowSize.HEIGHT,
  maxWidth: 0,
  maxHeight: 0,
};

export const defaultDevWindowResolution = {
  width: 1100,
  height: 700,
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
  isResizable: defaultLauncherWindowSettings.isResizable,
  minWidth: defaultLauncherWindowSettings.minWidth,
  minHeight: defaultLauncherWindowSettings.minHeight,
  maxWidth: defaultLauncherWindowSettings.maxWidth,
  maxHeight: defaultLauncherWindowSettings.maxHeight,
  width: defaultLauncherWindowSettings.width,
  height: defaultLauncherWindowSettings.height,
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

export const defaultGameSettingsConfig: IGameSettingsConfig = {
  baseFilesEncoding: Encoding.WIN1251,
  gameSettingsGroups: [],
  gameSettingsFiles: [],
  gameSettingsParameters: [],
};

export const defaultGameSettingsParameterItem: IGameSettingsItemParameter = {
  id: '',
  name: '',
  controllerType: GameSettingControllerType.CHECKBOX,
  iniGroup: '',
  min: 0,
  max: 1,
  step: 0.1,
  options: {},
  valueName: '',
  valuePath: '',
};

export const defaultFullGameSettingsParameter: IGameSettingsParameter = {
  id: '',
  description: '',
  file: '',
  label: '',
  optionType: GameSettingsOptionType.DEFAULT,
  controllerType: GameSettingControllerType.CHECKBOX,
  iniGroup: '',
  items: [defaultGameSettingsParameterItem],
  min: 0,
  max: 1,
  step: 0.1,
  name: '',
  options: {},
  separator: ':',
  settingGroup: '',
  valueName: '',
  valuePath: '',
};
