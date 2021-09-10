import { IAction } from '$types/common';
import {
  GAME_SETTINGS_TYPES,
  IGameSettingsConfig,
  IGameSettingsOptions,
  IGameSettingsRootState,
} from '$types/gameSettings';

export const setGameSettingsOptions: IAction<IGameSettingsOptions> = (
  gameSetingsOptions,
) => ({
  type: GAME_SETTINGS_TYPES.SET_GAME_SETTINGS_OPTIONS,
  payload: gameSetingsOptions,
});

export const setGameSettingsConfig: IAction<IGameSettingsConfig> = (
  gameSetingsConfig,
) => ({
  type: GAME_SETTINGS_TYPES.SET_GAME_SETTINGS_CONFIG,
  payload: gameSetingsConfig,
});

export const setGameSettingsFiles: IAction<IGameSettingsConfig['gameSettingsFiles']> = (
  gameSetingsFiles,
) => ({
  type: GAME_SETTINGS_TYPES.SET_GAME_SETTINGS_FILES,
  payload: gameSetingsFiles,
});

export const changeMoProfile: IAction<IGameSettingsRootState['moProfile']> = (
  moProfile,
) => ({
  type: GAME_SETTINGS_TYPES.CHANGE_MO_PROFILE,
  payload: moProfile,
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
