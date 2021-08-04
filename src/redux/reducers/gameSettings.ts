import { createReducer } from 'reduxsauce';

import { IActionHandler } from '$constants/interfaces';
import { GAME_SETTINGS_TYPES } from '$types/gameSettings';
import * as GAME_SETTINGS_ACTIONS from '$actions/gameSettings'; //eslint-disable-line import/no-cycle, max-len

interface ISettingsGroup {
  name: string,
  label: string,
}

export type IGameSettingsRootState = Readonly<{
  settingsGroups: ISettingsGroup[],
}>;

const setSettingsGroups: IActionHandler<
  IGameSettingsRootState,
  typeof GAME_SETTINGS_ACTIONS.setSettingsGroups
> = (
  state,
  { payload: settingsGroups },
) => ({
  ...state,
  settingsGroups,
});

const HANDLERS = {
  [GAME_SETTINGS_TYPES.SET_SETTINGS_GROUPS]: setSettingsGroups,
};

const INITIAL_STATE: IGameSettingsRootState = {
  settingsGroups: [],
};

export const gameSettingsReducer = createReducer<IGameSettingsRootState>(INITIAL_STATE, HANDLERS);
