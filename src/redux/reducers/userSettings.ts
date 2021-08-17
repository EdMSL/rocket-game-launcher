import { createReducer } from 'reduxsauce';

import { defaultLauncherResolution } from '$constants/defaultParameters';
import { USER_SETTINGS_HANDLERS } from '$handlers/userSettings';

interface IResolution {
  width: number,
  height: number,
}

export type IUserSettingsRootState = Readonly<{
  resolution: IResolution,
}>;

const INITIAL_STATE: IUserSettingsRootState = {
  resolution: defaultLauncherResolution,
};

export const userSettingsReducer = createReducer<IUserSettingsRootState>(
  INITIAL_STATE,
  USER_SETTINGS_HANDLERS,
);
