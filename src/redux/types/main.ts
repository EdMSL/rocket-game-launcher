import { IPathVariables } from '$constants/paths';
import { IMessage } from '$utils/message';

export const MAIN_TYPES = {
  SET_LAUNCHER_CONFIG: 'SET_LAUNCHER_CONFIG',
  SET_IS_FIRST_LAUNCH: 'SET_IS_FIRST_LAUNCH',
  SAVE_LAUNCHER_CONFIG: 'SAVE_LAUNCHER_CONFIG',
  SET_IS_GAME_RUNNING: 'SET_IS_GAME_RUNNING',
  SET_IS_LAUNCHER_INITIALISED: 'SET_IS_LAUNCHER_INITIALISED',
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
  SET_USER_THEMES: 'SET_USER_THEMES',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGES: 'ADD_MESSAGES',
  DELETE_MESSAGES: 'DELETE_MESSAGES',
};

export interface ILauncherAppButton {
  path: string,
  label: string,
  args?: string[],
}

export interface ILauncherCustomButton extends ILauncherAppButton {
  id: string,
  action: string,
}

export interface IUserMessage extends IMessage {
  id: string,
}

export interface IBackupFile {
  id: string,
  name: string,
  path: string,
}

export interface IGameSettingsBackup {
  name: string,
  files: IBackupFile[],
}

export interface IModOrganizerParams {
  isUsed: boolean,
  version: number,
  pathToMOFolder: string,
  pathToINI: string,
  pathToProfiles: string,
  pathToMods: string,
  profileSection: string,
  profileParam: string,
  profileParamValueRegExp: string,
}

export interface ILauncherConfig {
  isResizable: boolean,
  minWidth: number,
  minHeight: number,
  maxWidth: number,
  maxHeight: number,
  width: number,
  height: number,
  isFirstLaunch: boolean,
  modOrganizer: IModOrganizerParams,
  documentsPath: string,
  gameName: string,
  playButton: ILauncherAppButton,
  customButtons: ILauncherCustomButton[],
}

export type IMainRootState = Readonly<{
  config: ILauncherConfig,
  pathVariables: IPathVariables,
  isLauncherInitialised: boolean,
  isGameRunning: boolean,
  isGameSettingsLoaded: boolean,
  isGameSettingsAvailable: boolean,
  isGameSettingsSaving: boolean,
  isGameSettingsFilesBackuping: boolean,
  gameSettingsFilesBackup: IGameSettingsBackup[],
  userThemes: { [key: string]: string, },
  messages: IUserMessage[],
}>;
