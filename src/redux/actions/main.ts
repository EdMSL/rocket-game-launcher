import { IAction } from '$types/common';
import {
  MAIN_TYPES, IMainRootState, IGameSettingsBackup,
} from '$types/main';

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

export const setIsGameSettingsSaving: IAction<IMainRootState['isGameSettingsSaving']> = (
  isGameSettingsSaving,
) => ({
  type: MAIN_TYPES.SET_IS_GAME_SETTINGS_SAVING,
  payload: isGameSettingsSaving,
});

export const setIsGameSettingsAvailable: IAction<IMainRootState['isGameSettingsAvailable']> = (
  isGameSettingsAvailable,
) => ({
  type: MAIN_TYPES.SET_IS_GAME_SETTINGS_AVAILABLE,
  payload: isGameSettingsAvailable,
});

export const createGameSettingsFilesBackup: IAction<boolean> = (isGetBackup = false) => ({
  type: MAIN_TYPES.CREATE_GAME_SETTINGS_FILES_BACKUP,
  payload: isGetBackup,
});

export const deleteGameSettingsFilesBackup: IAction<string> = (
  backupId,
) => ({
  type: MAIN_TYPES.DELETE_GAME_SETTINGS_FILES_BACKUP,
  payload: backupId,
});

export const restoreGameSettingsFilesBackup: IAction<IGameSettingsBackup> = (
  filesBackup,
) => ({
  type: MAIN_TYPES.RESTORE_GAME_SETTINGS_FILES_BACKUP,
  payload: filesBackup,
});

export const getGameSettingsFilesBackup: IAction<void> = () => ({
  type: MAIN_TYPES.GET_GAME_SETTINGS_FILES_BACKUP,
});

export const setIsGameSettingsFilesBackuping: IAction<IMainRootState['isGameSettingsFilesBackuping']> = (
  isGameSettingsFilesBackuping,
) => ({
  type: MAIN_TYPES.SET_IS_GAME_SETTINGS_FILES_BACKUPING,
  payload: isGameSettingsFilesBackuping,
});

export const setGameSettingsFilesBackup: IAction<IMainRootState['gameSettingsFilesBackup']> = (
  gameSettingsFilesBackup,
) => ({
  type: MAIN_TYPES.SET_GAME_SETTINGS_FILES_BACKUP,
  payload: gameSettingsFilesBackup,
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

