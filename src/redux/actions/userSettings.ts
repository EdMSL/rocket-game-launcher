import { IAction } from '$types/common';
import { USER_SETTINGS_TYPES, IUserSettingsRootState } from '$types/userSettings';

export const setUserTheme: IAction<IUserSettingsRootState['theme']> = (
  theme,
) => ({
  type: USER_SETTINGS_TYPES.SET_USER_THEME,
  payload: theme,
});
