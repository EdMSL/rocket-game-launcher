import { IActionHandler } from '$types/common';
import { MAIN_TYPES, IMainRootState } from '$types/main';
import * as MAIN_ACTIONS from '$actions/main';

type IMainActionHadler<P> = IActionHandler<IMainRootState, P>;

const setLauncherConfig: IMainActionHadler<
  typeof MAIN_ACTIONS.setLauncherConfig
> = (
  state,
  { payload: newConfig },
) => ({
  ...state,
  config: newConfig,
});

const setPathVariables: IMainActionHadler<
  typeof MAIN_ACTIONS.setPathVariables
> = (
  state,
  { payload: newPathVariables },
) => ({
  ...state,
  pathVariables: newPathVariables,
});

const setIsFirstLaunch: IMainActionHadler<
  typeof MAIN_ACTIONS.setIsFirstLaunch
> = (
  state,
  { payload: isFirstLaunch },
) => ({
  ...state,
  config: {
    ...state.config,
    isFirstLaunch,
  },
});

const setIsLauncherConfigChanged: IMainActionHadler<
  typeof MAIN_ACTIONS.setIsLauncherConfigChanged
> = (
  state,
  { payload: isLauncherConfigChanged },
) => ({
  ...state,
  isLauncherConfigChanged,
});

const setIsGameRunning: IMainActionHadler<
  typeof MAIN_ACTIONS.setIsGameRunning
> = (
  state,
  { payload: isGameRunning },
) => ({
  ...state,
  isGameRunning,
});

const setIsLauncherInitialised: IMainActionHadler<
  typeof MAIN_ACTIONS.setIsLauncherInitialised
> = (
  state,
  { payload: isLauncherInitialised },
) => ({
  ...state,
  isLauncherInitialised,
});

const setIsConfigLoading: IMainActionHadler<
  typeof MAIN_ACTIONS.setIsConfigLoading
> = (
  state,
  { payload: isConfigLoading },
) => ({
  ...state,
  isConfigLoading,
});

const setIsGameSettingsLoading: IMainActionHadler<
  typeof MAIN_ACTIONS.setIsGameSettingsLoading
> = (
  state,
  { payload: isGameSettingsLoading },
) => ({
  ...state,
  isGameSettingsLoading,
});

const setIsGameSettingsLoaded: IMainActionHadler<
  typeof MAIN_ACTIONS.setIsGameSettingsLoaded
> = (
  state,
  { payload: isGameSettingsLoaded },
) => ({
  ...state,
  isGameSettingsLoaded,
});

const setIsGameSettingsAvailable: IMainActionHadler<
  typeof MAIN_ACTIONS.setIsGameSettingsAvailable
> = (
  state,
  { payload: isGameSettingsAvailable },
) => ({
  ...state,
  isGameSettingsAvailable,
});

const setIsGameSettingsSaving: IMainActionHadler<
  typeof MAIN_ACTIONS.setIsGameSettingsSaving
> = (
  state,
  { payload: isGameSettingsSaving },
) => ({
  ...state,
  isGameSettingsSaving,
});

const setIsGameSettingsFilesBackuping: IMainActionHadler<
  typeof MAIN_ACTIONS.setIsGameSettingsFilesBackuping
> = (
  state,
  { payload: isGameSettingsFilesBackuping },
) => ({
  ...state,
  isGameSettingsFilesBackuping,
});

const setIsDevWindowOpening: IMainActionHadler<
  typeof MAIN_ACTIONS.setIsDevWindowOpening
> = (
  state,
  { payload: isDevWindowOpening },
) => ({
  ...state,
  isDevWindowOpening,
});

const setIsDeveloperMode: IMainActionHadler<
  typeof MAIN_ACTIONS.setIsDeveloperMode
> = (
  state,
  { payload: isDeveloperMode },
) => ({
  ...state,
  isDeveloperMode,
});

const setGameSettingsFilesBackup: IMainActionHadler<
  typeof MAIN_ACTIONS.setGameSettingsFilesBackup
> = (
  state,
  { payload: gameSettingsFilesBackup },
) => ({
  ...state,
  gameSettingsFilesBackup,
});

const setUserThemes: IMainActionHadler<
  typeof MAIN_ACTIONS.setUserThemes
> = (
  state,
  { payload: userThemes },
) => ({
  ...state,
  userThemes,
});

const setMessages: IMainActionHadler<
  typeof MAIN_ACTIONS.setMessages
> = (
  state,
  { payload: messages },
) => ({
  ...state,
  messages,
});

const addMessages: IMainActionHadler<
  typeof MAIN_ACTIONS.addMessages
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

const deleteMessages: IMainActionHadler<
  typeof MAIN_ACTIONS.deleteMessages
> = (
  state,
  { payload: messagesID },
) => ({
  ...state,
  messages: state.messages.filter((currentMessage) => !messagesID.includes(currentMessage.id)),
});

export const MAIN_HANDLERS = {
  [MAIN_TYPES.SET_LAUNCHER_CONFIG]: setLauncherConfig,
  [MAIN_TYPES.SET_PATH_VARIABLES]: setPathVariables,
  [MAIN_TYPES.SET_IS_FIRST_LAUNCH]: setIsFirstLaunch,
  [MAIN_TYPES.SET_IS_LAUNCHER_CONFIG_CHANGED]: setIsLauncherConfigChanged,
  [MAIN_TYPES.SET_IS_GAME_RUNNING]: setIsGameRunning,
  [MAIN_TYPES.SET_IS_LAUNCHER_INITIALISED]: setIsLauncherInitialised,
  [MAIN_TYPES.SET_IS_CONFIG_LOADING]: setIsConfigLoading,
  [MAIN_TYPES.SET_IS_GAME_SETTINGS_LOADING]: setIsGameSettingsLoading,
  [MAIN_TYPES.SET_IS_GAME_SETTINGS_LOADED]: setIsGameSettingsLoaded,
  [MAIN_TYPES.SET_IS_GAME_SETTINGS_AVAILABLE]: setIsGameSettingsAvailable,
  [MAIN_TYPES.SET_IS_GAME_SETTINGS_SAVING]: setIsGameSettingsSaving,
  [MAIN_TYPES.SET_IS_GAME_SETTINGS_FILES_BACKUPING]: setIsGameSettingsFilesBackuping,
  [MAIN_TYPES.SET_IS_DEV_WINDOW_OPENING]: setIsDevWindowOpening,
  [MAIN_TYPES.SET_IS_DEVELOPER_MODE]: setIsDeveloperMode,
  [MAIN_TYPES.SET_GAME_SETTINGS_FILES_BACKUP]: setGameSettingsFilesBackup,
  [MAIN_TYPES.SET_USER_THEMES]: setUserThemes,
  [MAIN_TYPES.SET_MESSAGES]: setMessages,
  [MAIN_TYPES.ADD_MESSAGES]: addMessages,
  [MAIN_TYPES.DELETE_MESSAGES]: deleteMessages,
};
