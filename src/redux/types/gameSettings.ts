export const GAME_SETTINGS_TYPES = {
  SET_GAME_SETTINGS_CONFIG: 'SET_GAME_SETTINGS_CONFIG',
};

interface IGameSettingsGroup {
  name: string,
  label: string,
}

export interface IUsedFile {
  path: string,
  type: string,
  parameters: any[],
  encoding?: string,
  isFromMOProfile?: boolean,
}

export interface IUsedFiles {
  [key: string]: IUsedFile,
}

export interface IGameSettingsConfig {
  settingGroups?: IGameSettingsRootState['settingGroups'],
  basePathToFiles?: IGameSettingsRootState['basePathToFiles'],
  baseFilesEncoding?: IGameSettingsRootState['baseFilesEncoding'],
  usedFiles: IGameSettingsRootState['usedFiles'],
}

export type IGameSettingsRootState = Readonly<{
  settingGroups: IGameSettingsGroup[],
  basePathToFiles: string,
  baseFilesEncoding: string,
  usedFiles: IUsedFiles,
}>;
