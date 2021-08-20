import { IAction } from '$types/common';
import { USER_SETTINGS_TYPES, IUserSettingsRootState } from '$types/userSettings';

export const setLauncherResolution: IAction<IUserSettingsRootState['resolution']> = (
  resolution,
) => ({
  type: USER_SETTINGS_TYPES.SET_RESOLUTION,
  payload: resolution,
});
