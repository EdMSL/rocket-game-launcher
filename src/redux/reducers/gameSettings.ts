import { createReducer } from 'reduxsauce';

import { GAME_SETTINGS_HANDLERS } from '$handlers/gameSettings';

interface IGameSettingsGroup {
  name: string,
  label: string,
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
  usedFiles: Record<string, unknown>,
}>;

// Если добавляем поле в settings.json, то добаляем его здесь в стейт и constants/misc
const INITIAL_STATE: IGameSettingsRootState = {
  settingGroups: [],
  basePathToFiles: '',
  baseFilesEncoding: '',
  usedFiles: {},
};

export const gameSettingsReducer = createReducer<IGameSettingsRootState>(
  INITIAL_STATE,
  GAME_SETTINGS_HANDLERS,
);
