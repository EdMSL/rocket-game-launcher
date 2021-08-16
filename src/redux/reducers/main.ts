import { createReducer } from 'reduxsauce';

import { MAIN_HANDLERS } from '$handlers/main'; //eslint-disable-line import/no-cycle

export interface IMessage {
  id: string,
  status: 'error'|'warning'|'info'|'success',
  text: string,
}

export type IMainRootState = Readonly<{
  isLauncherInitialised: boolean,
  isGameRunning: boolean,
  isGameSettingsLoaded: boolean,
  messages: IMessage[],
}>;

const INITIAL_STATE: IMainRootState = {
  isLauncherInitialised: false,
  isGameRunning: false,
  isGameSettingsLoaded: false,
  messages: [],
};

export const mainReducer = createReducer<IMainRootState>(INITIAL_STATE, MAIN_HANDLERS);
