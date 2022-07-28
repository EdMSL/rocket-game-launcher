import { createReducer } from 'reduxsauce';

import { GAME_SETTINGS_HANDLERS } from '$handlers/gameSettings';
import { IGameSettingsRootState } from '$types/gameSettings';
import { defaultGameSettingsConfig } from '$constants/defaultData';

// Если добавляем поле в settings.json, то добаляем его здесь в стейт и constants/misc
export const INITIAL_STATE: IGameSettingsRootState = {
  modOrganizer: defaultGameSettingsConfig.modOrganizer,
  gameSettingsGroups: defaultGameSettingsConfig.gameSettingsGroups,
  baseFilesEncoding: defaultGameSettingsConfig.baseFilesEncoding,
  gameSettingsFiles: defaultGameSettingsConfig.gameSettingsFiles,
  gameSettingsOptions: defaultGameSettingsConfig.gameSettingsOptions,
  initialGameSettingsOptions: defaultGameSettingsConfig.gameSettingsOptions,
  moProfile: '',
  moVersion: 0,
  moProfiles: [],
  gameSettingsParameters: {},
};

export const gameSettingsReducer = createReducer<IGameSettingsRootState>(
  INITIAL_STATE,
  GAME_SETTINGS_HANDLERS,
);
