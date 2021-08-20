import { createReducer } from 'reduxsauce';

import { defaultLauncherResolution } from '$constants/defaultParameters';
import { USER_SETTINGS_HANDLERS } from '$handlers/userSettings';
import { IUserSettingsRootState } from '$types/userSettings';

const INITIAL_STATE: IUserSettingsRootState = {
  resolution: defaultLauncherResolution,
};

export const userSettingsReducer = createReducer<IUserSettingsRootState>(
  INITIAL_STATE,
  USER_SETTINGS_HANDLERS,
);
