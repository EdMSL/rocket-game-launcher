import {
  Encoding, UIControllerType, GameSettingsOptionType,
} from '$constants/misc';

export const GAME_SETTINGS_TYPES = {
  SET_GAME_SETTINGS_PARAMETERS: 'SET_GAME_SETTINGS_PARAMETERS',
  UPDATE_GAME_SETTINGS_PARAMETERS: 'UPDATE_GAME_SETTINGS_PARAMETERS',
  SET_GAME_SETTINGS_CONFIG: 'SET_GAME_SETTINGS_CONFIG',
  SET_GAME_SETTINGS_FILES: 'SET_GAME_SETTINGS_FILES',
  SET_GAME_SETTINGS_OPTIONS: 'SET_GAME_SETTINGS_OPTIONS',
  SET_INITIAL_GAME_SETTINGS_OPTIONS: 'SET_INITIAL_GAME_SETTINGS_OPTIONS',
  SAVE_GAME_SETTINGS_FILES: 'SAVE_GAME_SETTINGS_FILES',
  SET_MO_PROFILE: 'SET_MO_PROFILE',
  SET_MO_PROFILES: 'SET_MO_PROFILES',
  CHANGE_MO_PROFILE: 'CHANGE_MO_PROFILE',
};

export interface IGameSettingsParameterElem {
  name: string,
  default: string,
  value: string,
  option: string,
  file: string,
}

export interface IGameSettingsParameters {
  [key: string]: IGameSettingsParameterElem,
}

export interface IGameSettingsGroup {
  name: string,
  label: string,
}

export interface IGameSettingsOptionBase {
  id: string,
  optionType: GameSettingsOptionType,
  file: string,
  label: string,
  description: string,
  settingGroup?: string,
}

export interface IGameSettingsOptionItem {
  id: string,
  name: string,
  iniGroup?: string,
  valueName?: string,
  valuePath?: string,
  controllerType?: UIControllerType,
  selectOptions?: { [key: string]: string, },
  min?: number,
  max?: number,
  step?: number,
}

export interface IGameSettingsOption extends IGameSettingsOptionBase {
  name?: string,
  iniGroup?: string,
  valueName?: string,
  valuePath?: string,
  controllerType?: UIControllerType,
  separator?: string,
  selectOptions?: { [key: string]: string, },
  min?: number,
  max?: number,
  step?: number,
  items?: IGameSettingsOptionItem[],
}

export interface IGameSettingsFile {
  id: string,
  name: string,
  label: string,
  path: string,
  view: string,
  encoding: string,
}

export interface IGameSettingsConfig {
  baseFilesEncoding: IGameSettingsRootState['baseFilesEncoding'],
  gameSettingsGroups: IGameSettingsRootState['gameSettingsGroups'],
  gameSettingsFiles: IGameSettingsRootState['gameSettingsFiles'],
  gameSettingsOptions: IGameSettingsRootState['gameSettingsOptions'],
}

export type IGameSettingsRootState = Readonly<{
  baseFilesEncoding: Encoding,
  gameSettingsGroups: IGameSettingsGroup[],
  gameSettingsFiles: IGameSettingsFile[],
  gameSettingsOptions: IGameSettingsOption[],
  initialGameSettingsOptions: IGameSettingsOption[],
  moProfile: string,
  moProfiles: string[],
  gameSettingsParameters: IGameSettingsParameters,
}>;
