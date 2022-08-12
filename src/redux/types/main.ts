import { IPathVariables } from '$constants/paths';
import { IUserMessage } from './common';

export const MAIN_TYPES = {
  SET_LAUNCHER_CONFIG: 'SET_LAUNCHER_CONFIG',
  SET_PATH_VARIABLES: 'SET_PATH_VARIABLES',
  SET_IS_FIRST_START: 'SET_IS_FIRST_START',
  SET_IS_DEV_WINDOW_OPENING: 'SET_IS_DEV_WINDOW_OPENING',
  SET_IS_GAME_RUNNING: 'SET_IS_GAME_RUNNING',
  SET_IS_LAUNCHER_INITIALISED: 'SET_IS_LAUNCHER_INITIALISED',
  SET_IS_GAME_SETTINGS_CONFIG_CHANGED: 'SET_IS_GAME_SETTINGS_CONFIG_CHANGED',
  SET_IS_CONFIG_LOADING: 'SET_IS_CONFIG_LOADING',
  SET_IS_GAME_SETTINGS_FILE_EXISTS: 'SET_IS_GAME_SETTINGS_FILE_EXISTS',
  SET_IS_GAME_SETTINGS_LOADING: 'SET_IS_GAME_SETTINGS_LOADING',
  SET_IS_GAME_SETTINGS_LOADED: 'SET_IS_GAME_SETTINGS_LOADED',
  SET_IS_GAME_SETTINGS_AVAILABLE: 'SET_IS_GAME_SETTINGS_AVAILABLE',
  SET_IS_GAME_SETTINGS_SAVING: 'SET_IS_GAME_SETTINGS_SAVING',
  CREATE_GAME_SETTINGS_FILES_BACKUP: 'CREATE_GAME_SETTINGS_FILES_BACKUP',
  SET_GAME_SETTINGS_FILES_BACKUP: 'SET_GAME_SETTINGS_FILES_BACKUP',
  GET_GAME_SETTINGS_FILES_BACKUP: 'GET_GAME_SETTINGS_FILES_BACKUP',
  DELETE_GAME_SETTINGS_FILES_BACKUP: 'DELETE_GAME_SETTINGS_FILES_BACKUP',
  RENAME_GAME_SETTINGS_FILES_BACKUP: 'RENAME_GAME_SETTINGS_FILES_BACKUP',
  RESTORE_GAME_SETTINGS_FILES_BACKUP: 'RESTORE_GAME_SETTINGS_FILES_BACKUP',
  SET_IS_GAME_SETTINGS_FILES_BACKUPING: 'SET_IS_GAME_SETTINGS_FILES_BACKUPING',
  SET_IS_DEVELOPER_MODE: 'SET_IS_DEVELOPER_MODE',
  SET_USER_THEMES: 'SET_USER_THEMES',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGES: 'ADD_MESSAGES',
  DELETE_MESSAGES: 'DELETE_MESSAGES',
};

export interface IButtonArg {
  id: string,
  data: string,
}

export interface ILauncherAppButton {
  path: string,
  label: string,
  args: IButtonArg[],
}

export interface ILauncherCustomButton extends ILauncherAppButton {
  id: string,
  action: string,
}

export interface IBackupFile {
  id: string,
  name: string,
  path: string,
}

export interface IGameSettingsBackup {
  id: string,
  name: string,
  files: IBackupFile[],
}
export interface IWindowSizeSettings {
  minWidth: number,
  minHeight: number,
  maxWidth: number,
  maxHeight: number,
  width: number,
  height: number,
}
export interface IWindowSettings extends IWindowSizeSettings {
  isResizable: boolean,
}

export interface ILauncherConfig extends IWindowSettings {
  isFirstStart: boolean,
  documentsPath: string,
  gameName: string,
  playButton: ILauncherAppButton,
  customButtons: ILauncherCustomButton[],
}

export type IMainRootState = Readonly<{
  config: ILauncherConfig,
  launcherVersion: string,
  pathVariables: IPathVariables,
  isLauncherInitialised: boolean,
  isGameSettingsConfigChanged: boolean,
  isDevWindowOpening: boolean,
  isGameRunning: boolean,
  isConfigLoading: boolean,
  isGameSettingsLoading: boolean,
  isGameSettingsLoaded: boolean,
  isGameSettingsAvailable: boolean,
  isGameSettingsFileExists: boolean,
  isGameSettingsSaving: boolean,
  isGameSettingsFilesBackuping: boolean,
  isDeveloperMode: boolean,
  gameSettingsFilesBackup: IGameSettingsBackup[],
  userThemes: { [key: string]: string, },
  messages: IUserMessage[],
}>;
