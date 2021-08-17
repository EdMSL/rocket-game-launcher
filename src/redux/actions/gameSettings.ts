import { IAction } from '$types/common';
import { GAME_SETTINGS_TYPES } from '$types/gameSettings';
import { IGameSettingsRootState } from '$reducers/gameSettings';

export const setSettingGroups: IAction<IGameSettingsRootState['settingGroups']> = (
  settingsGroups,
) => ({
  type: GAME_SETTINGS_TYPES.SET_SETTINGS_GROUPS,
  payload: settingsGroups,
});
