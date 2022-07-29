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
  SET_MO_VERSION: 'SET_MO_VERSION',
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

export interface IGameSettingsFile {
  id: string,
  name: string,
  label: string,
  path: string,
  view: string,
  encoding: string,
}

export enum GameSettingsOptionFields {
  ID = 'id',
  NAME = 'name',
  OPTION_TYPE = 'optionType',
  FILE = 'file',
  LABEL = 'label',
  DESCRIPTION = 'description',
  SETTING_GROUP = 'settingGroup',
  ITEMS = 'items',
  INI_GROUP = 'iniGroup',
  VALUE_ATTRIBUTE = 'valueAttribute',
  VALUE_PATH = 'valuePath',
  CONTROLLER_TYPE = 'controllerType',
  SELECT_OPTIONS = 'selectOptions',
  SELECT_OPTIONS_VALUE_STRING = 'selectOptionsValueString',
  MIN = 'min',
  MAX = 'max',
  STEP = 'step',
  SEPARATOR = 'separator',
}

export interface IGameSettingsOptionBase {
  id: string,
  optionType: GameSettingsOptionType,
  file: string,
  label: string,
  description: string,
  settingGroup?: string,
  items: IGameSettingsOptionItem[],
}

export interface IGameSettingsOptionFileViewFields {
  iniGroup?: string,
  valueAttribute?: string,
  valuePath?: string,
}

export interface IGameSettingsOptionControllerFields {
  controllerType?: UIControllerType,
  selectOptions?: { [key: string]: string, },
  selectOptionsValueString?: string,
  min?: number,
  max?: number,
  step?: number,
  separator?: string,
}

export interface IGameSettingsOptionItem extends
  IGameSettingsOptionControllerFields,
  IGameSettingsOptionFileViewFields {
    id: string,
    name: string,
  }

export interface IGameSettingsOption extends
  IGameSettingsOptionBase,
  IGameSettingsOptionControllerFields {}

export interface IModOrganizerParams {
  isUsed: boolean,
  pathToMOFolder: string,
}

export interface IGameSettingsConfig {
  modOrganizer: IModOrganizerParams,
  baseFilesEncoding: IGameSettingsRootState['baseFilesEncoding'],
  gameSettingsGroups: IGameSettingsRootState['gameSettingsGroups'],
  gameSettingsFiles: IGameSettingsRootState['gameSettingsFiles'],
  gameSettingsOptions: IGameSettingsRootState['gameSettingsOptions'],
}

export type IGameSettingsRootState = Readonly<{
  modOrganizer: IModOrganizerParams,
  baseFilesEncoding: Encoding,
  gameSettingsGroups: IGameSettingsGroup[],
  gameSettingsFiles: IGameSettingsFile[],
  gameSettingsOptions: IGameSettingsOption[],
  initialGameSettingsOptions: IGameSettingsOption[],
  moProfile: string,
  moVersion: number,
  moProfiles: string[],
  gameSettingsParameters: IGameSettingsParameters,
}>;
