import { IGameSettingsControllerType } from './common';

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
  default: string,
  value: string,
  parent: string,
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
  controllerType?: string,
  iniGroup?: string,
  settingGroup?: string,
  valueName?: string,
  valuePath?: string,
  min?: number,
  max?: number,
  step?: number,
  options?: { [key: string]: string, },
}

export interface IGameSettingsParameter {
  id: string,
  optionType: string,
  file: string,
  name?: string,
  controllerType?: IGameSettingsControllerType,
  iniGroup?: string,
  settingGroup?: string,
  valueName?: string,
  valuePath?: string,
  label: string,
  description: string,
  min?: number,
  max?: number,
  step?: number,
  options?: { [key: string]: string, },
  separator?: string,
  items?: IGameSettingsItemParameter[],
}

export interface IGameSettingsFile {
  name: string,
  label: string,
  path: string,
  view: string,
  encoding: string,
}

// export interface IGameSettingsFiles {
//   [key: string]: IGameSettingsFile,
// }

export interface IGameSettingsConfig {
  gameSettingsGroups: IGameSettingsRootState['gameSettingsGroups'],
  baseFilesEncoding: IGameSettingsRootState['baseFilesEncoding'],
  gameSettingsFiles: IGameSettingsRootState['gameSettingsFiles'],
  gameSettingsParameters: IGameSettingsRootState['gameSettingsParameters'],
}

export type IGameSettingsRootState = Readonly<{
  gameSettingsGroups: IGameSettingsGroup[],
  baseFilesEncoding: string,
  gameSettingsFiles: IGameSettingsFile[],
  gameSettingsParameters: IGameSettingsParameter[],
  moProfile: string,
  moProfiles: string[],
  gameSettingsOptions: IGameSettingsOptions,
}>;
