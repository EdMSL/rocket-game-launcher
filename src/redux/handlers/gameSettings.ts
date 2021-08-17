import { IActionHandler } from '$types/common';
import { GAME_SETTINGS_TYPES } from '$types/gameSettings';
import { IGameSettingsRootState } from '$reducers/gameSettings';
import * as GAME_SETTINGS_ACTIONS from '$actions/gameSettings';

const setSettingGroups: IActionHandler<
  IGameSettingsRootState,
  typeof GAME_SETTINGS_ACTIONS.setSettingGroups
> = (
  state,
  { payload: settingsGroups },
) => ({
  ...state,
  settingsGroups,
});

export const GAME_SETTINGS_HANDLERS = {
  [GAME_SETTINGS_TYPES.SET_SETTINGS_GROUPS]: setSettingGroups,
};
