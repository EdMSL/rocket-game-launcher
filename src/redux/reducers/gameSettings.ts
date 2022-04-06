import { createReducer } from 'reduxsauce';

import { GAME_SETTINGS_HANDLERS } from '$handlers/gameSettings';
import { IGameSettingsRootState } from '$types/gameSettings';
import { defaultGameSettingsConfig } from '$constants/defaultData';

// Если добавляем поле в settings.json, то добаляем его здесь в стейт и constants/misc
export const INITIAL_STATE: IGameSettingsRootState = {
  gameSettingsGroups: defaultGameSettingsConfig.gameSettingsGroups,
  baseFilesEncoding: defaultGameSettingsConfig.baseFilesEncoding,
  gameSettingsFiles: defaultGameSettingsConfig.gameSettingsFiles,
  gameSettingsParameters: defaultGameSettingsConfig.gameSettingsParameters,
  moProfile: '',
  moProfiles: [],
  gameSettingsOptions: {},
};

export const gameSettingsReducer = createReducer<IGameSettingsRootState>(
  INITIAL_STATE,
  GAME_SETTINGS_HANDLERS,
);
