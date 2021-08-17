import { IAction } from '$types/common';
import { USER_SETTINGS_TYPES } from '$types/userSettings';
import { IUserSettingsRootState } from '$reducers/userSettings';

export const setLauncherResolution: IAction<IUserSettingsRootState['resolution']> = (
  resolution,
) => ({
  type: USER_SETTINGS_TYPES.SET_RESOLUTION,
  payload: resolution,
});
