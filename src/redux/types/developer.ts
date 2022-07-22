import { IPathVariables } from '$constants/paths';
import { IUserMessage } from './common';
import { IGameSettingsConfig } from './gameSettings';
import { ILauncherConfig } from './main';

export const DEVELOPER_TYPES = {
  CREATE_GAME_SETTINGS_CONFIG_FILE: 'CREATE_GAME_SETTINGS_CONFIG_FILE',
  SET_LAUNCHER_CONFIG: 'SET_LAUNCHER_CONFIG',
  SAVE_CONFIGURATION: 'SAVE_CONFIGURATION',
  SET_IS_CONFIG_PROCESSING: 'SET_IS_CONFIG_PROCESSING',
  SET_IS_GAME_SETTINGS_CONFIG_FILE_EXISTS: 'SET_IS_GAME_SETTINGS_CONFIG_FILE_EXISTS',
  SET_GAME_SETTINGS_CONFIG: 'SET_GAME_SETTINGS_CONFIG',
  SET_IS_GAME_SETTINGS_CONFIG_LOADED: 'SET_IS_GAME_SETTINGS_CONFIG_LOADED',
  UPDATE_CONFIG: 'UPDATE_CONFIG',
  SET_PATH_VARIABLES: 'SET_PATH_VARIABLES',
  SET_DEVELOPER_MESSAGES: 'SET_DEVELOPER_MESSAGES',
  ADD_DEVELOPER_MESSAGES: 'ADD_DEVELOPER_MESSAGES',
  DELETE_DEVELOPER_MESSAGES: 'DELETE_DEVELOPER_MESSAGES',
};

export type IDeveloperRootState = Readonly<{
  launcherConfig: ILauncherConfig,
  gameSettingsConfig: IGameSettingsConfig,
  isConfigProcessing: boolean,
  isGameSettingsConfigDataLoaded: boolean,
  isGameSettingsConfigFileExists: boolean,
  pathVariables: IPathVariables,
  messages: IUserMessage[],
}>;
