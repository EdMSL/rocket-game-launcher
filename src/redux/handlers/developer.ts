import { IActionHandler } from '$types/common';
import { DEVELOPER_TYPES, IDeveloperRootState } from '$types/developer';
import * as DEVELOPER_ACTIONS from '$actions/main';

type IDeveloperActionHadler<P> = IActionHandler<IDeveloperRootState, P>;

const setLauncherConfig: IDeveloperActionHadler<
  typeof DEVELOPER_ACTIONS.setLauncherConfig
> = (
  state,
  { payload: newConfig },
) => ({
  ...state,
  config: newConfig,
});

const setMessages: IDeveloperActionHadler<
  typeof DEVELOPER_ACTIONS.setMessages
> = (
  state,
  { payload: messages },
) => ({
  ...state,
  messages,
});

const addMessages: IDeveloperActionHadler<
  typeof DEVELOPER_ACTIONS.addMessages
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

const deleteMessages: IDeveloperActionHadler<
  typeof DEVELOPER_ACTIONS.deleteMessages
> = (
  state,
  { payload: messagesID },
) => ({
  ...state,
  messages: state.messages.filter((currentMessage) => !messagesID.includes(currentMessage.id)),
});

export const DEVELOPER_HANDLERS = {
  [DEVELOPER_TYPES.SET_LAUNCHER_CONFIG]: setLauncherConfig,
  [DEVELOPER_TYPES.SET_MESSAGES]: setMessages,
  [DEVELOPER_TYPES.ADD_MESSAGES]: addMessages,
  [DEVELOPER_TYPES.DELETE_MESSAGES]: deleteMessages,
};
