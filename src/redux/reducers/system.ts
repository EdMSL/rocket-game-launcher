import { createReducer } from 'reduxsauce';

import { SYSTEM_HANDLERS } from '$handlers/system'; //eslint-disable-line import/no-cycle

export type ISystemRootState = Readonly<{
  isFirstLaunch: boolean,
}>;

const INITIAL_STATE: ISystemRootState = {
  isFirstLaunch: true,
};

export const systemReducer = createReducer<ISystemRootState>(INITIAL_STATE, SYSTEM_HANDLERS);
