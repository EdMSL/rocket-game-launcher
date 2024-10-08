import { IActionHandler } from '$types/common';
import { GAME_SETTINGS_TYPES, IGameSettingsRootState } from '$types/gameSettings';
import * as GAME_SETTINGS_ACTIONS from '$actions/gameSettings';

type IGameSettingsActionHadler<P> = IActionHandler<IGameSettingsRootState, P>;

const setGameSettingsParameters: IGameSettingsActionHadler<
  typeof GAME_SETTINGS_ACTIONS.setGameSettingsParameters
> = (
  state,
  { payload: newGameSettingsParameters },
) => ({
  ...state,
  gameSettingsParameters: newGameSettingsParameters,
});

const setGameSettingsConfig: IGameSettingsActionHadler<
  typeof GAME_SETTINGS_ACTIONS.setGameSettingsConfig
> = (
  state,
  { payload: gameSettingsConfig },
) => ({
  ...state,
  ...gameSettingsConfig,
});

const setGameSettingsFiles: IGameSettingsActionHadler<
  typeof GAME_SETTINGS_ACTIONS.setGameSettingsFiles
> = (
  state,
  { payload: gameSettingsFiles },
) => ({
  ...state,
  gameSettingsFiles,
});

const setGameSettingsOptions: IGameSettingsActionHadler<
  typeof GAME_SETTINGS_ACTIONS.setGameSettingsOptions
> = (
  state,
  { payload: gameSettingsOptions },
) => ({
  ...state,
  gameSettingsOptions,
});

const setInitialGameSettingsOptions: IGameSettingsActionHadler<
  typeof GAME_SETTINGS_ACTIONS.setInitialGameSettingsOptions
> = (
  state,
  { payload: initialGameSettingsOptions },
) => ({
  ...state,
  initialGameSettingsOptions,
});

const setMoProfile: IGameSettingsActionHadler<
  typeof GAME_SETTINGS_ACTIONS.setMoProfile
> = (
  state,
  { payload: moProfile },
) => ({
  ...state,
  moProfile,
});

const setMoProfiles: IGameSettingsActionHadler<
  typeof GAME_SETTINGS_ACTIONS.setMoProfiles
> = (
  state,
  { payload: moProfiles },
) => ({
  ...state,
  moProfiles,
});

const setMoVersion: IGameSettingsActionHadler<
  typeof GAME_SETTINGS_ACTIONS.setMoVersion
> = (
  state,
  { payload: moVersion },
) => ({
  ...state,
  moVersion,
});

export const GAME_SETTINGS_HANDLERS = {
  [GAME_SETTINGS_TYPES.SET_GAME_SETTINGS_PARAMETERS]: setGameSettingsParameters,
  [GAME_SETTINGS_TYPES.SET_GAME_SETTINGS_CONFIG]: setGameSettingsConfig,
  [GAME_SETTINGS_TYPES.SET_GAME_SETTINGS_FILES]: setGameSettingsFiles,
  [GAME_SETTINGS_TYPES.SET_GAME_SETTINGS_OPTIONS]: setGameSettingsOptions,
  [GAME_SETTINGS_TYPES.SET_INITIAL_GAME_SETTINGS_OPTIONS]: setInitialGameSettingsOptions,
  [GAME_SETTINGS_TYPES.SET_MO_PROFILE]: setMoProfile,
  [GAME_SETTINGS_TYPES.SET_MO_VERSION]: setMoVersion,
  [GAME_SETTINGS_TYPES.SET_MO_PROFILES]: setMoProfiles,
};
