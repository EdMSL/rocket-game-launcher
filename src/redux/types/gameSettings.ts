export const GAME_SETTINGS_TYPES = {
  SET_GAME_SETTINGS_OPTIONS: 'SET_GAME_SETTINGS_OPTIONS',
  CHANGE_GAME_SETTINGS_OPTION: 'CHANGE_GAME_SETTINGS_OPTION',
  SET_GAME_SETTINGS_CONFIG: 'SET_GAME_SETTINGS_CONFIG',
  SET_GAME_SETTINGS_FILES: 'SET_GAME_SETTINGS_FILES',
  SET_MO_PROFILE: 'SET_MO_PROFILE',
  CHANGE_MO_PROFILE: 'CHANGE_MO_PROFILE',
  SET_MO_PROFILES: 'SET_MO_PROFILES',
};

interface IGameSettingsOptionContent {
  default: string,
  value: string,
  parent: string,
  settingGroup?: string,
}

export interface IGameSettingsOptionsItem {
  [key: string]: IGameSettingsOptionContent,
}

export interface IGameSettingsOptions {
  [key: string]: IGameSettingsOptionsItem,
}

interface IGameSettingsGroup {
  name: string,
  label?: string,
}

export interface IGameSettingsItemParameter {
  id: string,
  name: string,
  controllerType?: string,
  iniGroup?: string,
  settingGroup?: string,
  attributeName?: string,
  attributePath?: string,
  min?: number,
  max?: number,
  step?: number,
  options?: { [key: string]: string, },
}

export interface IGameSettingsParameter {
  id: string,
  parameterType: string,
  name?: string,
  controllerType?: string,
  iniGroup?: string,
  settingGroup?: string,
  attributeName?: string,
  attributePath?: string,
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
  path: string,
  view: string,
  parameters: IGameSettingsParameter[],
  encoding: string,
}

export interface IGameSettingsFiles {
  [key: string]: IGameSettingsFile,
}

export interface IGameSettingsConfig {
  gameSettingsGroups?: IGameSettingsRootState['gameSettingsGroups'],
  baseFilesEncoding?: IGameSettingsRootState['baseFilesEncoding'],
  gameSettingsFiles: IGameSettingsRootState['gameSettingsFiles'],
}

export type IGameSettingsRootState = Readonly<{
  gameSettingsGroups: IGameSettingsGroup[],
  baseFilesEncoding: string,
  gameSettingsFiles: IGameSettingsFiles,
  moProfile: string,
  moProfiles: string[],
  gameSettingsOptions: IGameSettingsOptions,
}>;
