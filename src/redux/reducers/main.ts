import { createReducer } from 'reduxsauce';

import { MAIN_HANDLERS } from '$handlers/main';
import { IMessage } from '$utils/message';

export interface IUserMessage extends IMessage {
  id: string,
}

export type IMainRootState = Readonly<{
  isLauncherInitialised: boolean,
  isGameRunning: boolean,
  isGameSettingsLoaded: boolean,
  isGameSettingsAvailable: boolean,
  messages: IUserMessage[],
}>;

const INITIAL_STATE: IMainRootState = {
  isLauncherInitialised: false,
  isGameRunning: false,
  isGameSettingsLoaded: false,
  isGameSettingsAvailable: false,
  messages: [],
};

export const mainReducer = createReducer<IMainRootState>(INITIAL_STATE, MAIN_HANDLERS);
