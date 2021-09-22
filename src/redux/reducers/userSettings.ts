import { createReducer } from 'reduxsauce';

import { USER_SETTINGS_HANDLERS } from '$handlers/userSettings';
import { IUserSettingsRootState } from '$types/userSettings';

const INITIAL_STATE: IUserSettingsRootState = {
  theme: '',
};

export const userSettingsReducer = createReducer<IUserSettingsRootState>(
  INITIAL_STATE,
  USER_SETTINGS_HANDLERS,
);
