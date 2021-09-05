import { string } from 'joi';

export const GAME_SETTINGS_TYPES = {
  SET_GAME_SETTINGS_OPTIONS: 'SET_GAME_SETTINGS_OPTIONS',
  SET_GAME_SETTINGS_CONFIG: 'SET_GAME_SETTINGS_CONFIG',
  SET_GAME_SETTINGS_USED_FILES: 'SET_GAME_SETTINGS_USED_FILES',
  SET_MO_PROFILE: 'SET_MO_PROFILE',
  SET_MO_PROFILES: 'SET_MO_PROFILES',
};

interface IGameSettingsOption {
  default: string,
  value: string,
  parent: string,
  settingGroup?: string,
}

export interface IGameSettingsOptions {
  [key: string]: { [key: string]: IGameSettingsOption, },
}

interface IGameSettingsGroup {
  name: string,
  label?: string,
}

export interface IGameSettingsParameter {
  name: string,
  controllerType: string,
  iniGroup?: string,
  settingGroup?: string,
  attributeName?: string,
  attributePath?: string,
  label?: string,
  min?: number,
  max?: number,
  step?: number,
  options?: { [key: string]: string, },
}

export interface IUsedFile {
  path: string,
  view: string,
  parameters: IGameSettingsParameter[],
  encoding: string,
}

export interface IUsedFiles {
  [key: string]: IUsedFile,
}

export interface IGameSettingsConfig {
  settingGroups?: IGameSettingsRootState['settingGroups'],
  baseFilesEncoding?: IGameSettingsRootState['baseFilesEncoding'],
  usedFiles: IGameSettingsRootState['usedFiles'],
}

export type IGameSettingsRootState = Readonly<{
  settingGroups: IGameSettingsGroup[],
  baseFilesEncoding: string,
  usedFiles: IUsedFiles,
  moProfile: string,
  moProfiles: string[],
  gameOptions: IGameSettingsOptions,
}>;
