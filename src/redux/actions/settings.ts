import { SETTINGS_TYPES } from '$types/settings';
import { ISettingsRootState } from '$reducers/settings';

interface IActionReturnType<T> {
  type: string,
  payload?: T,
  meta?: {
    scope: string,
  },
}

export const setSettingsGroups = (
  settingsGroups: ISettingsRootState['settingsGroups'],
): IActionReturnType<typeof settingsGroups> => ({
  type: SETTINGS_TYPES.SET_SETTINGS_GROUPS,
  payload: settingsGroups,
});
