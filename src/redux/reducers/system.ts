import { createReducer } from 'reduxsauce';

import { SYSTEM_TYPES } from '$types/system';
import * as SYSTEM_ACTIONS from '$actions/system'; //eslint-disable-line import/no-cycle, max-len

export type ISystemRootState = Readonly<{
  isFirstLaunch: boolean,
}>;

/* eslint-disable @typescript-eslint/no-explicit-any */
type UnsafeReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
/* eslint-enable @typescript-eslint/no-explicit-any */

interface IActionHandler<T> {
  (state: ISystemRootState, payload: UnsafeReturnType<T>): ISystemRootState,
}

const setIsFirstLaunch: IActionHandler<typeof SYSTEM_ACTIONS.setIsFirstLaunch> = (
  state,
  { payload: isFirstLaunch },
) => ({
  ...state,
  isFirstLaunch,
});

const HANDLERS = {
  [SYSTEM_TYPES.SET_IS_FIRST_LAUNCH]: setIsFirstLaunch,
};

const INITIAL_STATE: ISystemRootState = {
  isFirstLaunch: true,
};

export const systemReducer = createReducer<ISystemRootState>(INITIAL_STATE, HANDLERS);
