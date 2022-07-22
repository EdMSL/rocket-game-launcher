import {
  DEVELOPER_TYPES, IDeveloperRootState,
} from '$types/developer';
import { IGameSettingsConfig } from '$types/gameSettings';
import { ILauncherConfig } from '$types/main';

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const createGameSettingsConfigFile = () => ({
  type: DEVELOPER_TYPES.CREATE_GAME_SETTINGS_CONFIG_FILE,
});

export const setLauncherConfig = (
  newConfig: IDeveloperRootState['launcherConfig'],
) => ({
  type: DEVELOPER_TYPES.SET_LAUNCHER_CONFIG,
  payload: newConfig,
});

export const setIsConfigProcessing = (
  isProcessing: IDeveloperRootState['isConfigProcessing'],
) => ({
  type: DEVELOPER_TYPES.SET_IS_CONFIG_PROCESSING,
  payload: isProcessing,
});

export const setIsGameSettingsConfigFileExists = (
  isGameSettingsConfigFileExists: IDeveloperRootState['isGameSettingsConfigFileExists'],
) => ({
  type: DEVELOPER_TYPES.SET_IS_GAME_SETTINGS_CONFIG_FILE_EXISTS,
  payload: isGameSettingsConfigFileExists,
});

export const setGameSettingsConfig = (
  gameSetingsConfig: IGameSettingsConfig,
) => ({
  type: DEVELOPER_TYPES.SET_GAME_SETTINGS_CONFIG,
  payload: gameSetingsConfig,
});

export const saveConfiguration = (
  newConfig: IGameSettingsConfig|ILauncherConfig,
  pathToGo = '',
) => ({
  type: DEVELOPER_TYPES.SAVE_CONFIGURATION,
  payload: { newConfig, pathToGo },
});

export const setisGameSettingsConfigDataLoaded = (
  isLoaded: IDeveloperRootState['isGameSettingsConfigDataLoaded'],
) => ({
  type: DEVELOPER_TYPES.SET_IS_GAME_SETTINGS_CONFIG_LOADED,
  payload: isLoaded,
});

export const updateConfig = (config: string) => ({
  type: DEVELOPER_TYPES.UPDATE_CONFIG,
  payload: config,
});

export const setPathVariablesDeveloper = (
  newPathVariables: IDeveloperRootState['pathVariables'],
) => ({
  type: DEVELOPER_TYPES.SET_PATH_VARIABLES,
  payload: newPathVariables,
});

export const setDeveloperMessages = (
  messages: IDeveloperRootState['messages'],
) => ({
  type: DEVELOPER_TYPES.SET_DEVELOPER_MESSAGES,
  payload: messages,
});

export const addDeveloperMessages = (
  messages: IDeveloperRootState['messages'],
) => ({
  type: DEVELOPER_TYPES.ADD_DEVELOPER_MESSAGES,
  payload: messages,
});

export const deleteDeveloperMessages = (
  messagesID: string[],
) => ({
  type: DEVELOPER_TYPES.DELETE_DEVELOPER_MESSAGES,
  payload: messagesID,
});

