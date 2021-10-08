import {
  GAME_SETTINGS_TYPES,
  IGameSettingsConfig,
  IGameSettingsOptionsItem,
  IGameSettingsOptions,
  IGameSettingsRootState,
} from '$types/gameSettings';

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const setGameSettingsOptions = (
  gameSettingsOptions: IGameSettingsOptions,
) => ({
  type: GAME_SETTINGS_TYPES.SET_GAME_SETTINGS_OPTIONS,
  payload: gameSettingsOptions,
});

export const changeGameSettingsOption = (
  parent: string,
  gameSettingsOptions: IGameSettingsOptionsItem,
) => ({
  type: GAME_SETTINGS_TYPES.CHANGE_GAME_SETTINGS_OPTION,
  payload: { parent, gameSettingsOptions },
});

export const updateGameSettingsOptions = () => ({
  type: GAME_SETTINGS_TYPES.UPDATE_GAME_SETTINGS_OPTIONS,
});

export const setGameSettingsConfig = (
  gameSetingsConfig: IGameSettingsConfig,
) => ({
  type: GAME_SETTINGS_TYPES.SET_GAME_SETTINGS_CONFIG,
  payload: gameSetingsConfig,
});

export const setGameSettingsFiles = (
  gameSetingsFiles: IGameSettingsConfig['gameSettingsFiles'],
) => ({
  type: GAME_SETTINGS_TYPES.SET_GAME_SETTINGS_FILES,
  payload: gameSetingsFiles,
});

export const saveGameSettingsFiles = (
  changedGameSettingsOptions: IGameSettingsOptions,
) => ({
  type: GAME_SETTINGS_TYPES.SAVE_GAME_SETTINGS_FILES,
  payload: changedGameSettingsOptions,
});

export const changeMoProfile = (
  newMOProfile: IGameSettingsRootState['moProfile'],
) => ({
  type: GAME_SETTINGS_TYPES.CHANGE_MO_PROFILE,
  payload: newMOProfile,
});

export const setMoProfile = (
  moProfile: IGameSettingsRootState['moProfile'],
) => ({
  type: GAME_SETTINGS_TYPES.SET_MO_PROFILE,
  payload: moProfile,
});

export const setMoProfiles = (
  moProfiles: IGameSettingsRootState['moProfiles'],
) => ({
  type: GAME_SETTINGS_TYPES.SET_MO_PROFILES,
  payload: moProfiles,
});
