import { IActionHandler } from '$constants/interfaces';
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

const setMessages: IActionHandler<
  IMainRootState,
  typeof MAIN_ACTIONS.setMessages
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

export const MAIN_HANDLERS = {
  [MAIN_TYPES.SET_IS_GAME_RUNNING]: setIsGameRunning,
  [MAIN_TYPES.SET_MESSAGES]: setMessages,
};
