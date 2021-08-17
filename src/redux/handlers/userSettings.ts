import { IActionHandler } from '$types/common';
import { USER_SETTINGS_TYPES } from '$types/userSettings';
import { IUserSettingsRootState } from '$reducers/userSettings';
import * as USER_SETTINGS_ACTIONS from '$actions/userSettings';

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

export const USER_SETTINGS_HANDLERS = {
  [USER_SETTINGS_TYPES.SET_RESOLUTION]: setLauncherResolution,
};
