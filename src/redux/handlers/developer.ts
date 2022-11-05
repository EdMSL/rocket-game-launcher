import { IActionHandler } from '$types/common';
import { DEVELOPER_TYPES, IDeveloperRootState } from '$types/developer';
import * as DEVELOPER_ACTIONS from '$actions/developer';

type IDeveloperActionHadler<P> = IActionHandler<IDeveloperRootState, P>;

const setLauncherConfig: IDeveloperActionHadler<
  typeof DEVELOPER_ACTIONS.setLauncherConfig
> = (
  state,
  { payload: newConfig },
) => ({
  ...state,
  launcherConfig: newConfig,
});

const setIsConfigProcessing: IDeveloperActionHadler<
  typeof DEVELOPER_ACTIONS.setIsConfigProcessing
> = (
  state,
  { payload: isConfigProcessing },
) => ({
  ...state,
  isConfigProcessing,
});

const setIsGameSettingsConfigFileExists: IDeveloperActionHadler<
  typeof DEVELOPER_ACTIONS.setIsGameSettingsConfigFileExists
> = (
  state,
  { payload: isGameSettingsConfigFileExists },
) => ({
  ...state,
  isGameSettingsConfigFileExists,
});

const setGameSettingsConfig: IDeveloperActionHadler<
  typeof DEVELOPER_ACTIONS.setGameSettingsConfig
> = (
  state,
  { payload: gameSettingsConfig },
) => ({
  ...state,
  gameSettingsConfig,
});

const setisGameSettingsConfigDataLoaded: IDeveloperActionHadler<
  typeof DEVELOPER_ACTIONS.setisGameSettingsConfigDataLoaded
> = (
  state,
  { payload: isGameSettingsConfigDataLoaded },
) => ({
  ...state,
  isGameSettingsConfigDataLoaded,
});

const setPathVariables: IDeveloperActionHadler<
  typeof DEVELOPER_ACTIONS.setPathVariablesDeveloper
> = (
  state,
  { payload: newPathVariables },
) => ({
  ...state,
  pathVariables: newPathVariables,
});

const setDeveloperMessages: IDeveloperActionHadler<
  typeof DEVELOPER_ACTIONS.setDeveloperMessages
> = (
  state,
  { payload: messages },
) => ({
  ...state,
  messages,
});

const addDeveloperMessages: IDeveloperActionHadler<
  typeof DEVELOPER_ACTIONS.addDeveloperMessages
> = (
  state,
  { payload: messages },
) => ({
  ...state,
  messages: [
    ...state.messages,
    ...messages,
  ],
});

const deleteDeveloperMessages: IDeveloperActionHadler<
  typeof DEVELOPER_ACTIONS.deleteDeveloperMessages
> = (
  state,
  { payload: messagesID },
) => ({
  ...state,
  messages: state.messages.filter((currentMessage) => !messagesID.includes(currentMessage.id)),
});

export const DEVELOPER_HANDLERS = {
  [DEVELOPER_TYPES.SET_LAUNCHER_CONFIG]: setLauncherConfig,
  [DEVELOPER_TYPES.SET_IS_GAME_SETTINGS_CONFIG_FILE_EXISTS]: setIsGameSettingsConfigFileExists,
  [DEVELOPER_TYPES.SET_GAME_SETTINGS_CONFIG]: setGameSettingsConfig,
  [DEVELOPER_TYPES.SET_IS_CONFIG_PROCESSING]: setIsConfigProcessing,
  [DEVELOPER_TYPES.SET_IS_GAME_SETTINGS_CONFIG_LOADED]: setisGameSettingsConfigDataLoaded,
  [DEVELOPER_TYPES.SET_PATH_VARIABLES]: setPathVariables,
  [DEVELOPER_TYPES.SET_DEVELOPER_MESSAGES]: setDeveloperMessages,
  [DEVELOPER_TYPES.ADD_DEVELOPER_MESSAGES]: addDeveloperMessages,
  [DEVELOPER_TYPES.DELETE_DEVELOPER_MESSAGES]: deleteDeveloperMessages,
};
