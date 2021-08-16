import { IActionHandler } from '$types/common';
import { USER_SETTINGS_TYPES } from '$types/userSettings';
import { IUserSettingsRootState } from '$reducers/userSettings'; //eslint-disable-line import/no-cycle, max-len
import * as USER_SETTINGS_ACTIONS from '$actions/userSettings'; //eslint-disable-line import/no-cycle, max-len

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
