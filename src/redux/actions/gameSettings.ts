import { IAction } from '$types/common';
import { GAME_SETTINGS_TYPES } from '$types/gameSettings';
import { IGameSettingsRootState } from '$reducers/gameSettings'; //eslint-disable-line import/no-cycle, max-len

export const setSettingsGroups: IAction<IGameSettingsRootState['settingGroups']> = (
  settingsGroups,
) => ({
  type: GAME_SETTINGS_TYPES.SET_SETTINGS_GROUPS,
  payload: settingsGroups,
});
