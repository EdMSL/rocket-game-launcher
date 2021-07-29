import { createReducer } from 'reduxsauce';

import { USER_SETTINGS_TYPES } from '$types/userSettings';
import * as USER_SETTINGS_ACTIONS from '$actions/userSettings';
import { defaultLauncherResolution } from '$constants/defaultParameters';

interface IResolution {
  width: number,
  height: number,
}

export type IUserSettingsRootState = Readonly<{
  resolution: IResolution,
}>;

/* eslint-disable @typescript-eslint/no-explicit-any */
type UnsafeReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
/* eslint-enable @typescript-eslint/no-explicit-any */

interface IActionHandler<T> {
  (state: IUserSettingsRootState, payload: UnsafeReturnType<T>): IUserSettingsRootState,
}

const setLauncherResolution: IActionHandler<typeof USER_SETTINGS_ACTIONS.setLauncherResolution> = (
  state,
  { payload: resolution },
) => ({
  ...state,
  resolution,
});

const HANDLERS = {
  [USER_SETTINGS_TYPES.SET_RESOLUTION]: setLauncherResolution,
};

const INITIAL_STATE: IUserSettingsRootState = {
  resolution: defaultLauncherResolution,
};

export const userSettingsReducer = createReducer<IUserSettingsRootState>(INITIAL_STATE, HANDLERS);
