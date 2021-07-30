import { USER_SETTINGS_TYPES } from '$types/userSettings';
import { IUserSettingsRootState } from '$reducers/userSettings'; //eslint-disable-line import/no-cycle, max-len

interface IActionReturnType<T> {
  type: string,
  payload?: T,
  meta?: {
    scope: string,
  },
}

export const setLauncherResolution = (
  resolution: IUserSettingsRootState['resolution'],
): IActionReturnType<typeof resolution> => ({
  type: USER_SETTINGS_TYPES.SET_RESOLUTION,
  payload: resolution,
});
