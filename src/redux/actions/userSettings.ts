import { USER_SETTINGS_TYPES, IUserSettingsRootState } from '$types/userSettings';

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const setIsAutoClose = (
  isAutoclose: IUserSettingsRootState['isAutoclose'],
) => ({
  type: USER_SETTINGS_TYPES.SET_IS_AUTOCLOSE,
  payload: isAutoclose,
});

export const setUserTheme = (
  theme: IUserSettingsRootState['theme'],
) => ({
  type: USER_SETTINGS_TYPES.SET_USER_THEME,
  payload: theme,
});
