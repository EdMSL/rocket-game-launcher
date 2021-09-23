import { createReducer } from 'reduxsauce';

import { USER_SETTINGS_HANDLERS } from '$handlers/userSettings';
import { IUserSettingsRootState } from '$types/userSettings';

export const INITIAL_STATE: IUserSettingsRootState = {
  isAutoclose: false,
  theme: '',
};

export const userSettingsReducer = createReducer<IUserSettingsRootState>(
  INITIAL_STATE,
  USER_SETTINGS_HANDLERS,
);
