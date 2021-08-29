import { IAction } from '$types/common';
import {
  GAME_SETTINGS_TYPES,
  IGameSettingsConfig,
  IGameSettingsRootState,
} from '$types/gameSettings';

export const setGameSettingsConfig: IAction<IGameSettingsConfig> = (
  gameSetingsConfig,
) => ({
  type: GAME_SETTINGS_TYPES.SET_GAME_SETTINGS_CONFIG,
  payload: gameSetingsConfig,
});

export const setGameSettingsUsedFiles: IAction<IGameSettingsConfig['usedFiles']> = (
  gameSetingsUsedFiles,
) => ({
  type: GAME_SETTINGS_TYPES.SET_GAME_SETTINGS_USED_FILES,
  payload: gameSetingsUsedFiles,
});

export const setMoProfile: IAction<IGameSettingsRootState['moProfile']> = (
  moProfile,
) => ({
  type: GAME_SETTINGS_TYPES.SET_MO_PROFILE,
  payload: moProfile,
});

export const setMoProfiles: IAction<IGameSettingsRootState['moProfiles']> = (
  moProfiles,
) => ({
  type: GAME_SETTINGS_TYPES.SET_MO_PROFILES,
  payload: moProfiles,
});
