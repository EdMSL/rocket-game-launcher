import {
  DEVELOPER_TYPES, IDeveloperRootState,
} from '$types/developer';
import { IGameSettingsConfig } from '$types/gameSettings';

/* eslint-disable @typescript-eslint/explicit-function-return-type */

export const setLauncherConfig = (
  newConfig: IDeveloperRootState['launcherConfig'],
) => ({
  type: DEVELOPER_TYPES.SET_LAUNCHER_CONFIG,
  payload: newConfig,
});

export const saveLauncherConfig = (
  newConfig: IDeveloperRootState['launcherConfig'],
  isGoToMainScreen = false,
) => ({
  type: DEVELOPER_TYPES.SAVE_LAUNCHER_CONFIG,
  payload: { newConfig, isGoToMainScreen },
});

export const setIsLauncherConfigProcessing = (
  isProcessing: IDeveloperRootState['isLauncherConfigProcessing'],
) => ({
  type: DEVELOPER_TYPES.SET_IS_LAUNCHER_CONFIG_PROCESSING,
  payload: isProcessing,
});

export const setGameSettingsConfig = (
  gameSetingsConfig: IGameSettingsConfig,
) => ({
  type: DEVELOPER_TYPES.SET_GAME_SETTINGS_CONFIG,
  payload: gameSetingsConfig,
});

export const saveGameSettingsConfig = (
  newConfig: IGameSettingsConfig,
  isGoToMainScreen = false,
) => ({
  type: DEVELOPER_TYPES.SAVE_GAME_SETTINGS_CONFIG,
  payload: { newConfig, isGoToMainScreen },
});

export const setIsGameSettingsConfigProcessing = (
  isProcessing: IDeveloperRootState['isGameSettingsConfigProcessing'],
) => ({
  type: DEVELOPER_TYPES.SET_IS_GAME_SETTINGS_CONFIG_PROCESSING,
  payload: isProcessing,
});

export const setIsGameSettingsConfigLoaded = (
  isLoaded: IDeveloperRootState['isGameSettingsConfigLoaded'],
) => ({
  type: DEVELOPER_TYPES.SET_IS_GAME_SETTINGS_CONFIG_LOADED,
  payload: isLoaded,
});

export const updateConfig = (config: string) => ({
  type: DEVELOPER_TYPES.UPDATE_CONFIG,
  payload: config,
});

export const setPathVariables = (
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

