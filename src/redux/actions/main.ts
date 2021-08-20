import { IAction } from '$types/common';
import { MAIN_TYPES, IMainRootState } from '$types/main';

export const setIsGameRunning: IAction<IMainRootState['isGameRunning']> = (
  isGameRunning,
) => ({
  type: MAIN_TYPES.SET_IS_GAME_RUNNING,
  payload: isGameRunning,
});

export const setIsLauncherInitialised: IAction<IMainRootState['isLauncherInitialised']> = (
  isLauncherInitialised,
) => ({
  type: MAIN_TYPES.SET_IS_LAUNCHER_INITIALISED,
  payload: isLauncherInitialised,
});

export const setIsGameSettingsLoaded: IAction<IMainRootState['isGameSettingsLoaded']> = (
  isGameSettingsLoaded,
) => ({
  type: MAIN_TYPES.SET_IS_GAME_SETTINGS_LOADED,
  payload: isGameSettingsLoaded,
});

export const setIsGameSettingsAvailable: IAction<IMainRootState['isGameSettingsAvailable']> = (
  isGameSettingsAvailable,
) => ({
  type: MAIN_TYPES.SET_IS_GAME_SETTINGS_AVAILABLE,
  payload: isGameSettingsAvailable,
});

export const setMessages: IAction<IMainRootState['messages']> = (
  messages,
) => ({
  type: MAIN_TYPES.SET_MESSAGES,
  payload: messages,
});

export const addMessages: IAction<IMainRootState['messages']> = (
  messages,
) => ({
  type: MAIN_TYPES.ADD_MESSAGES,
  payload: messages,
});

export const deleteMessages: IAction<string[]> = (
  messagesID,
) => ({
  type: MAIN_TYPES.DELETE_MESSAGES,
  payload: messagesID,
});

