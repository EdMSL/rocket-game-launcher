import { IActionHandler } from '$types/common';
import { MAIN_TYPES, IMainRootState } from '$types/main';
import * as MAIN_ACTIONS from '$actions/main';

type IMainActionHadler<P> = IActionHandler<IMainRootState, P>;

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
  [MAIN_TYPES.SET_IS_GAME_RUNNING]: setIsGameRunning,
  [MAIN_TYPES.SET_IS_LAUNCHER_INITIALISED]: setIsLauncherInitialised,
  [MAIN_TYPES.SET_IS_GAME_SETTINGS_LOADED]: setIsGameSettingsLoaded,
  [MAIN_TYPES.SET_IS_GAME_SETTINGS_AVAILABLE]: setIsGameSettingsAvailable,
  [MAIN_TYPES.SET_IS_GAME_SETTINGS_SAVING]: setIsGameSettingsSaving,
  [MAIN_TYPES.SET_IS_GAME_SETTINGS_FILES_BACKUPING]: setIsGameSettingsFilesBackuping,
  [MAIN_TYPES.SET_GAME_SETTINGS_FILES_BACKUP]: setGameSettingsFilesBackup,
  [MAIN_TYPES.SET_USER_THEMES]: setUserThemes,
  [MAIN_TYPES.SET_MESSAGES]: setMessages,
  [MAIN_TYPES.ADD_MESSAGES]: addMessages,
  [MAIN_TYPES.DELETE_MESSAGES]: deleteMessages,
};
