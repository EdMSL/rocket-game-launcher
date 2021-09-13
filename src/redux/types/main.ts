import { IMessage } from '$utils/message';

export const MAIN_TYPES = {
  SET_IS_GAME_RUNNING: 'SET_IS_GAME_RUNNING',
  SET_IS_LAUNCHER_INITIALISED: 'SET_IS_LAUNCHER_INITIALISED',
  SET_IS_GAME_SETTINGS_LOADED: 'SET_IS_GAME_SETTINGS_LOADED',
  SET_IS_GAME_SETTINGS_AVAILABLE: 'SET_IS_GAME_SETTINGS_AVAILABLE',
  SET_IS_GAME_SETTINGS_SAVING: 'SET_IS_GAME_SETTINGS_SAVING',
  CREATE_GAME_SETTING_BACKUP: 'CREATE_GAME_SETTING_BACKUP',
  SET_IS_GAME_SETTINGS_FILES_BACKUPING: 'SET_IS_GAME_SETTINGS_FILES_BACKUPING',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGES: 'ADD_MESSAGES',
  DELETE_MESSAGES: 'DELETE_MESSAGES',
};

export interface IUserMessage extends IMessage {
  id: string,
}

export type IMainRootState = Readonly<{
  isLauncherInitialised: boolean,
  isGameRunning: boolean,
  isGameSettingsLoaded: boolean,
  isGameSettingsAvailable: boolean,
  isGameSettingsSaving: boolean,
  isGameSettingsFilesBackuping: boolean,
  messages: IUserMessage[],
}>;
