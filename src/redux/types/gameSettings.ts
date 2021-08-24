export const GAME_SETTINGS_TYPES = {
  SET_GAME_SETTINGS_CONFIG: 'SET_GAME_SETTINGS_CONFIG',
  SET_GAME_SETTINGS_USED_FILES: 'SET_GAME_SETTINGS_USED_FILES',
};

interface IGameSettingGroup {
  name: string,
  label: string,
}

interface IGameSettingParameter {
  name: string,
  iniGroup: string,
  settingGroup: string,
  type: string,
  label: string,
  min?: number,
  max?: number,
  step?: number,
  options?: { [key: string]: string, },
}

export interface IUsedFile {
  path: string,
  view: string,
  parameters: IGameSettingParameter[],
  encoding?: string,
}

export interface IUsedFiles {
  [key: string]: IUsedFile,
}

export interface IGameSettingsConfig {
  settingGroups?: IGameSettingsRootState['settingGroups'],
  baseFilesEncoding?: IGameSettingsRootState['baseFilesEncoding'],
  usedFiles: IGameSettingsRootState['usedFiles'],
}

export type IGameSettingsRootState = Readonly<{
  settingGroups: IGameSettingGroup[],
  baseFilesEncoding: string,
  usedFiles: IUsedFiles,
}>;
