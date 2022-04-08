import {
  Encoding, GameSettingControllerType, GameSettingsOptionType,
} from '$constants/misc';

export const GAME_SETTINGS_TYPES = {
  SET_GAME_SETTINGS_OPTIONS: 'SET_GAME_SETTINGS_OPTIONS',
  UPDATE_GAME_SETTINGS_OPTIONS: 'UPDATE_GAME_SETTINGS_OPTIONS',
  SET_GAME_SETTINGS_CONFIG: 'SET_GAME_SETTINGS_CONFIG',
  SET_GAME_SETTINGS_FILES: 'SET_GAME_SETTINGS_FILES',
  SET_GAME_SETTINGS_PARAMETERS: 'SET_GAME_SETTINGS_PARAMETERS',
  SAVE_GAME_SETTINGS_FILES: 'SAVE_GAME_SETTINGS_FILES',
  SET_MO_PROFILE: 'SET_MO_PROFILE',
  CHANGE_MO_PROFILE: 'CHANGE_MO_PROFILE',
  SET_MO_PROFILES: 'SET_MO_PROFILES',
};

export interface IGameSettingsOptionsItem {
  name: string,
  default: string,
  value: string,
  parameter: string,
  file: string,
}

export interface IGameSettingsOptions {
  [key: string]: IGameSettingsOptionsItem,
}

export interface IGameSettingsGroup {
  name: string,
  label: string,
}

export interface IGameSettingsItemParameter {
  id: string,
  name: string,
  controllerType?: GameSettingControllerType,
  iniGroup?: string,
  valueName?: string,
  valuePath?: string,
  min?: number,
  max?: number,
  step?: number,
  options?: { [key: string]: string, },
}

export interface IGameSettingsParameter {
  id: string,
  file: string,
  optionType: GameSettingsOptionType,
  controllerType: GameSettingControllerType,
  label: string,
  description: string,
  name?: string,
  settingGroup?: string,
  iniGroup?: string,
  items?: IGameSettingsItemParameter[],
  separator?: string,
  valueName?: string,
  valuePath?: string,
  min?: number,
  max?: number,
  step?: number,
  options?: { [key: string]: string, },
}

export interface IGameSettingsFile {
  name: string,
  label: string,
  path: string,
  view: string,
  encoding: string,
}

export interface IGameSettingsConfig {
  gameSettingsGroups: IGameSettingsRootState['gameSettingsGroups'],
  baseFilesEncoding: IGameSettingsRootState['baseFilesEncoding'],
  gameSettingsFiles: IGameSettingsRootState['gameSettingsFiles'],
  gameSettingsParameters: IGameSettingsRootState['gameSettingsParameters'],
}

export type IGameSettingsRootState = Readonly<{
  gameSettingsGroups: IGameSettingsGroup[],
  baseFilesEncoding: Encoding,
  gameSettingsFiles: IGameSettingsFile[],
  gameSettingsParameters: IGameSettingsParameter[],
  moProfile: string,
  moProfiles: string[],
  gameSettingsOptions: IGameSettingsOptions,
}>;
