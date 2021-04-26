import { createReducer } from 'reduxsauce';

import { SETTINGS_TYPES } from '$types/settings';
import * as SETTINGS_ACTIONS from '$actions/settings';

interface ISettingsGroup {
  name: string,
  label: string,
}

export type ISettingsRootState = Readonly<{
  settingsGroups: ISettingsGroup[],
}>;

/* eslint-disable @typescript-eslint/no-explicit-any */
type UnsafeReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
/* eslint-enable @typescript-eslint/no-explicit-any */

interface IActionHandler<T> {
  (state: ISettingsRootState, payload: UnsafeReturnType<T>): ISettingsRootState,
}

const setSettingsGroups: IActionHandler<typeof SETTINGS_ACTIONS.setSettingsGroups> = (
  state,
  { payload: settingsGroups },
) => ({
  ...state,
  settingsGroups,
});

const HANDLERS = {
  [SETTINGS_TYPES.SET_SETTINGS_GROUPS]: setSettingsGroups,
};

const INITIAL_STATE: ISettingsRootState = {
  settingsGroups: [],
};

export const settingsReducer = createReducer<ISettingsRootState>(INITIAL_STATE, HANDLERS);
