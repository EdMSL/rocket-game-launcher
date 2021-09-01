import { createReducer } from 'reduxsauce';

import { GAME_SETTINGS_HANDLERS } from '$handlers/gameSettings';
import { IGameSettingsRootState } from '$types/gameSettings';

// Если добавляем поле в settings.json, то добаляем его здесь в стейт и constants/misc
const INITIAL_STATE: IGameSettingsRootState = {
  settingGroups: [],
  baseFilesEncoding: '',
  usedFiles: {},
  moProfile: '',
  moProfiles: [],
  gameOptions: {},
};

export const gameSettingsReducer = createReducer<IGameSettingsRootState>(
  INITIAL_STATE,
  GAME_SETTINGS_HANDLERS,
);
