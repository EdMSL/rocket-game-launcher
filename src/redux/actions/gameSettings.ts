import {
  GAME_SETTINGS_TYPES,
  IGameSettingsConfig,
  IGameSettingsParameters,
  IGameSettingsRootState,
} from '$types/gameSettings';

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const setGameSettingsParameters = (
  gameSettingsParameters: IGameSettingsParameters,
) => ({
  type: GAME_SETTINGS_TYPES.SET_GAME_SETTINGS_PARAMETERS,
  payload: gameSettingsParameters,
});

export const updateGameSettingsParameters = (
  gameSetingsConfig?: IGameSettingsConfig,
) => ({
  type: GAME_SETTINGS_TYPES.UPDATE_GAME_SETTINGS_PARAMETERS,
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

export const setGameSettingsOptions = (
  gameSettingsOptions: IGameSettingsConfig['gameSettingsOptions'],
) => ({
  type: GAME_SETTINGS_TYPES.SET_GAME_SETTINGS_OPTIONS,
  payload: gameSettingsOptions,
});

export const setInitialGameSettingsOptions = (
  initialGameSettingsOptions: IGameSettingsRootState['initialGameSettingsOptions'],
) => ({
  type: GAME_SETTINGS_TYPES.SET_INITIAL_GAME_SETTINGS_OPTIONS,
  payload: initialGameSettingsOptions,
});

export const saveGameSettingsFiles = (
  changedGameSettingsParameters: IGameSettingsParameters,
) => ({
  type: GAME_SETTINGS_TYPES.SAVE_GAME_SETTINGS_FILES,
  payload: changedGameSettingsParameters,
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
