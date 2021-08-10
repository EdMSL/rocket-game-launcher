import { IAction } from '$constants/interfaces';
import { MAIN_TYPES } from '$types/main';
import { IMainRootState } from '$reducers/main'; //eslint-disable-line import/no-cycle, max-len

export const setIsGameRunning: IAction<IMainRootState['isGameRunning']> = (
  isGameRunning,
) => ({
  type: MAIN_TYPES.SET_IS_GAME_RUNNING,
  payload: isGameRunning,
});

export const addMessages: IAction<IMainRootState['messages']> = (
  messages,
) => ({
  type: MAIN_TYPES.ADD_MESSAGES,
  payload: messages,
});

export const deleteMessages: IAction<string[]> = (
  messagesID,
) => ({
  type: MAIN_TYPES.DELETE_MESSAGES,
  payload: messagesID,
});

