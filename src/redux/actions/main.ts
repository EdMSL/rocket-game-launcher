import { IAction } from '$constants/interfaces';
import { MAIN_TYPES } from '$types/main';
import { IMainRootState } from '$reducers/main'; //eslint-disable-line import/no-cycle, max-len

export const setIsGameRunning: IAction<IMainRootState['isGameRunning']> = (
  isGameRunning,
) => ({
  type: MAIN_TYPES.SET_IS_GAME_RUNNING,
  payload: isGameRunning,
});

export const setMessages: IAction<IMainRootState['messages']> = (
  messages,
) => ({
  type: MAIN_TYPES.SET_MESSAGES,
  payload: messages,
});

