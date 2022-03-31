import {
  DEVELOPER_TYPES, IDeveloperRootState,
} from '$types/developer';

/* eslint-disable @typescript-eslint/explicit-function-return-type */

export const setLauncherConfig = (
  newConfig: IDeveloperRootState['config'],
) => ({
  type: DEVELOPER_TYPES.SET_LAUNCHER_CONFIG,
  payload: newConfig,
});

export const setMessages = (
  messages: IDeveloperRootState['messages'],
) => ({
  type: DEVELOPER_TYPES.SET_MESSAGES,
  payload: messages,
});

export const addMessages = (
  messages: IDeveloperRootState['messages'],
) => ({
  type: DEVELOPER_TYPES.ADD_MESSAGES,
  payload: messages,
});

export const deleteMessages = (
  messagesID: string[],
) => ({
  type: DEVELOPER_TYPES.DELETE_MESSAGES,
  payload: messagesID,
});

