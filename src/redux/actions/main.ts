import { IGameSettingsConfig } from '$types/gameSettings';
import {
  MAIN_TYPES, IMainRootState, IGameSettingsBackup,
} from '$types/main';

/* eslint-disable @typescript-eslint/explicit-function-return-type */

export const setLauncherConfig = (
  newConfig: IMainRootState['config'],
) => ({
  type: MAIN_TYPES.SET_LAUNCHER_CONFIG,
  payload: newConfig,
});

export const setPathVariables = (
  newPathVariables: IMainRootState['pathVariables'],
) => ({
  type: MAIN_TYPES.SET_PATH_VARIABLES,
  payload: newPathVariables,
});

export const setIsFirstLaunch = (
  isFirstLaunch: IMainRootState['config']['isFirstLaunch'],
) => ({
  type: MAIN_TYPES.SET_IS_FIRST_LAUNCH,
  payload: isFirstLaunch,
});

export const setIsGameSettingsFileExists = (
  isGameSettingsFileExists: IMainRootState['isGameSettingsFileExists'],
) => ({
  type: MAIN_TYPES.SET_IS_FIRST_LAUNCH,
  payload: isGameSettingsFileExists,
});

export const setIsGameSettingsConfigChanged = (
  isGameSettingsConfigChanged: IMainRootState['isGameSettingsConfigChanged'],
) => ({
  type: MAIN_TYPES.SET_IS_LAUNCHER_CONFIG_CHANGED,
  payload: isGameSettingsConfigChanged,
});
export const setIsGameRunning = (
  isGameRunning: IMainRootState['isGameRunning'],
) => ({
  type: MAIN_TYPES.SET_IS_GAME_RUNNING,
  payload: isGameRunning,
});

export const setIsLauncherInitialised = (
  isLauncherInitialised: IMainRootState['isLauncherInitialised'],
) => ({
  type: MAIN_TYPES.SET_IS_LAUNCHER_INITIALISED,
  payload: isLauncherInitialised,
});

export const setIsConfigLoading = (
  isConfigLoading: IMainRootState['isConfigLoading'],
) => ({
  type: MAIN_TYPES.SET_IS_CONFIG_LOADING,
  payload: isConfigLoading,
});

export const setIsGameSettingsLoading = (
  isGameSettingsLoading: IMainRootState['isGameSettingsLoading'],
) => ({
  type: MAIN_TYPES.SET_IS_GAME_SETTINGS_LOADING,
  payload: isGameSettingsLoading,
});

export const setIsGameSettingsLoaded = (
  isGameSettingsLoaded: IMainRootState['isGameSettingsLoaded'],
) => ({
  type: MAIN_TYPES.SET_IS_GAME_SETTINGS_LOADED,
  payload: isGameSettingsLoaded,
});

export const setIsGameSettingsSaving = (
  isGameSettingsSaving: IMainRootState['isGameSettingsSaving'],
) => ({
  type: MAIN_TYPES.SET_IS_GAME_SETTINGS_SAVING,
  payload: isGameSettingsSaving,
});

export const setIsGameSettingsAvailable = (
  isGameSettingsAvailable: IMainRootState['isGameSettingsAvailable'],
) => ({
  type: MAIN_TYPES.SET_IS_GAME_SETTINGS_AVAILABLE,
  payload: isGameSettingsAvailable,
});

export const setIsDevWindowOpening = (
  isDevWindowOpening: IMainRootState['isDevWindowOpening'],
) => ({
  type: MAIN_TYPES.SET_IS_DEV_WINDOW_OPENING,
  payload: isDevWindowOpening,
});

export const setIsDeveloperMode = (
  isDeveloperMode: IMainRootState['isDeveloperMode'],
) => ({
  type: MAIN_TYPES.SET_IS_DEVELOPER_MODE,
  payload: isDeveloperMode,
});

export const createGameSettingsFilesBackup = (isGetBackup = false) => ({
  type: MAIN_TYPES.CREATE_GAME_SETTINGS_FILES_BACKUP,
  payload: isGetBackup,
});

export const deleteGameSettingsFilesBackup = (
  backupName: string,
) => ({
  type: MAIN_TYPES.DELETE_GAME_SETTINGS_FILES_BACKUP,
  payload: backupName,
});

export const renameGameSettingsFilesBackup = (
  backupName: string,
  newBackupName: string,
) => ({
  type: MAIN_TYPES.RENAME_GAME_SETTINGS_FILES_BACKUP,
  payload: { backupName, newBackupName },
});

export const restoreGameSettingsFilesBackup = (
  filesBackup: IGameSettingsBackup,
) => ({
  type: MAIN_TYPES.RESTORE_GAME_SETTINGS_FILES_BACKUP,
  payload: filesBackup,
});

export const getGameSettingsFilesBackup = () => ({
  type: MAIN_TYPES.GET_GAME_SETTINGS_FILES_BACKUP,
});

export const setIsGameSettingsFilesBackuping = (
  isGameSettingsFilesBackuping: IMainRootState['isGameSettingsFilesBackuping'],
) => ({
  type: MAIN_TYPES.SET_IS_GAME_SETTINGS_FILES_BACKUPING,
  payload: isGameSettingsFilesBackuping,
});

export const setGameSettingsFilesBackup = (
  gameSettingsFilesBackup: IMainRootState['gameSettingsFilesBackup'],
) => ({
  type: MAIN_TYPES.SET_GAME_SETTINGS_FILES_BACKUP,
  payload: gameSettingsFilesBackup,
});

export const setUserThemes = (
  userThemes: IMainRootState['userThemes'],
) => ({
  type: MAIN_TYPES.SET_USER_THEMES,
  payload: userThemes,
});

export const setMessages = (
  messages: IMainRootState['messages'],
) => ({
  type: MAIN_TYPES.SET_MESSAGES,
  payload: messages,
});

export const addMessages = (
  messages: IMainRootState['messages'],
) => ({
  type: MAIN_TYPES.ADD_MESSAGES,
  payload: messages,
});

export const deleteMessages = (
  messagesID: string[],
) => ({
  type: MAIN_TYPES.DELETE_MESSAGES,
  payload: messagesID,
});

