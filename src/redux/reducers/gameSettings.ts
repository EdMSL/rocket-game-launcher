import { createReducer } from 'reduxsauce';

import { GAME_SETTINGS_HANDLERS } from '$handlers/gameSettings'; //eslint-disable-line import/no-cycle, max-len

interface ISettingsGroup {
  name: string,
  label: string,
}

export type IGameSettingsRootState = Readonly<{
  settingsGroups: ISettingsGroup[],
}>;

const INITIAL_STATE: IGameSettingsRootState = {
  settingsGroups: [],
};

export const gameSettingsReducer = createReducer<IGameSettingsRootState>(
  INITIAL_STATE,
  GAME_SETTINGS_HANDLERS,
);
