import { createReducer } from 'reduxsauce';

import { MAIN_HANDLERS } from '$handlers/main'; //eslint-disable-line import/no-cycle

export interface IMessage {
  id: string,
  status: 'error'|'warning'|'info'|'success',
  text: string,
}

export type IMainRootState = Readonly<{
  isGameRunning: boolean,
  messages: IMessage[],
}>;

const INITIAL_STATE: IMainRootState = {
  isGameRunning: false,
  messages: [],
};

export const mainReducer = createReducer<IMainRootState>(INITIAL_STATE, MAIN_HANDLERS);
