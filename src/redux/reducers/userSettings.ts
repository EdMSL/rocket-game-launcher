import { createReducer } from 'reduxsauce';

import { IActionHandler } from '$constants/interfaces';
import { USER_SETTINGS_TYPES } from '$types/userSettings';
import * as USER_SETTINGS_ACTIONS from '$actions/userSettings'; //eslint-disable-line import/no-cycle, max-len
import { defaultLauncherResolution } from '$constants/defaultParameters';

interface IResolution {
  width: number,
  height: number,
}

export type IUserSettingsRootState = Readonly<{
  resolution: IResolution,
}>;

const setLauncherResolution: IActionHandler<
  IUserSettingsRootState,
  typeof USER_SETTINGS_ACTIONS.setLauncherResolution
> = (
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
