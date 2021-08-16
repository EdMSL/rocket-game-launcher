import { IActionHandler } from '$types/common';
import { MAIN_TYPES } from '$types/main';
import { IMainRootState } from '$reducers/main'; //eslint-disable-line import/no-cycle, max-len
import * as MAIN_ACTIONS from '$actions/main'; //eslint-disable-line import/no-cycle, max-len

const setIsGameRunning: IActionHandler<
  IMainRootState,
  typeof MAIN_ACTIONS.setIsGameRunning
> = (
  state,
  { payload: isGameRunning },
) => ({
  ...state,
  isGameRunning,
});

const setIsGameSettingsLoaded: IActionHandler<
  IMainRootState,
  typeof MAIN_ACTIONS.setIsGameSettingsLoaded
> = (
  state,
  { payload: isGameSettingsLoaded },
) => ({
  ...state,
  isGameSettingsLoaded,
});

const setMessages: IActionHandler<
  IMainRootState,
  typeof MAIN_ACTIONS.setMessages
> = (
  state,
  { payload: messages },
) => ({
  ...state,
  messages,
});

const addMessages: IActionHandler<
  IMainRootState,
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

const deleteMessages: IActionHandler<
  IMainRootState,
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
  [MAIN_TYPES.SET_IS_GAME_SETTINGS_LOADED]: setIsGameSettingsLoaded,
  [MAIN_TYPES.SET_MESSAGES]: setMessages,
  [MAIN_TYPES.ADD_MESSAGES]: addMessages,
  [MAIN_TYPES.DELETE_MESSAGES]: deleteMessages,
};
