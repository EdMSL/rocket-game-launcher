import { GAME_SETTINGS_TYPES } from '$types/gameSettings';
import { IGameSettingsRootState } from '$reducers/gameSettings'; //eslint-disable-line import/no-cycle, max-len

interface IActionReturnType<T> {
  type: string,
  payload?: T,
  meta?: {
    scope: string,
  },
}

export const setSettingsGroups = (
  settingsGroups: IGameSettingsRootState['settingsGroups'],
): IActionReturnType<typeof settingsGroups> => ({
  type: GAME_SETTINGS_TYPES.SET_SETTINGS_GROUPS,
  payload: settingsGroups,
});
