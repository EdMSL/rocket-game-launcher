import { IAction } from '$types/common';
import { GAME_SETTINGS_TYPES, IGameSettingsConfig } from '$types/gameSettings';

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
