import { IMessage } from '$utils/message';

export const MAIN_TYPES = {
  SET_IS_GAME_RUNNING: 'SET_IS_GAME_RUNNING',
  SET_IS_LAUNCHER_INITIALISED: 'SET_IS_LAUNCHER_INITIALISED',
  SET_IS_GAME_SETTINGS_LOADED: 'SET_IS_GAME_SETTINGS_LOADED',
  SET_IS_GAME_SETTINGS_AVAILABLE: 'SET_IS_GAME_SETTINGS_AVAILABLE',
  SET_IS_GAME_SETTINGS_SAVING: 'SET_IS_GAME_SETTINGS_SAVING',
  CREATE_GAME_SETTINGS_FILES_BACKUP: 'CREATE_GAME_SETTINGS_FILES_BACKUP',
  SET_GAME_SETTINGS_FILES_BACKUP: 'SET_GAME_SETTINGS_FILES_BACKUP',
  GET_GAME_SETTINGS_FILES_BACKUP: 'GET_GAME_SETTINGS_FILES_BACKUP',
  DELETE_GAME_SETTINGS_FILES_BACKUP: 'DELETE_GAME_SETTINGS_FILES_BACKUP',
  RESTORE_GAME_SETTINGS_FILES_BACKUP: 'RESTORE_GAME_SETTINGS_FILES_BACKUP',
  SET_IS_GAME_SETTINGS_FILES_BACKUPING: 'SET_IS_GAME_SETTINGS_FILES_BACKUPING',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGES: 'ADD_MESSAGES',
  DELETE_MESSAGES: 'DELETE_MESSAGES',
};

export interface IUserMessage extends IMessage {
  id: string,
}

interface IBackupFile {
  name: string,
  path: string,
}

export interface IBackupFiles {
  name: string,
  files: IBackupFile[],
}

export type IMainRootState = Readonly<{
  isLauncherInitialised: boolean,
  isGameRunning: boolean,
  isGameSettingsLoaded: boolean,
  isGameSettingsAvailable: boolean,
  isGameSettingsSaving: boolean,
  isGameSettingsFilesBackuping: boolean,
  gameSettingsFilesBackup: IBackupFiles[],
  messages: IUserMessage[],
}>;
