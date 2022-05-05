import {
  GAME_SETTINGS_TYPES,
  IGameSettingsConfig,
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

export const updateGameSettingsOptions = (
  gameSetingsConfig?: IGameSettingsConfig,
) => ({
  type: GAME_SETTINGS_TYPES.UPDATE_GAME_SETTINGS_OPTIONS,
  payload: gameSetingsConfig,
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

export const setGameSettingsParameters = (
  gameSettingsParameters: IGameSettingsConfig['gameSettingsParameters'],
) => ({
  type: GAME_SETTINGS_TYPES.SET_GAME_SETTINGS_PARAMETERS,
  payload: gameSettingsParameters,
});

export const setInitialGameSettingsParameters = (
  initialGameSettingsParameters: IGameSettingsRootState['initialGameSettingsParameters'],
) => ({
  type: GAME_SETTINGS_TYPES.SET_INITIAL_GAME_SETTINGS_PARAMETERS,
  payload: initialGameSettingsParameters,
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
