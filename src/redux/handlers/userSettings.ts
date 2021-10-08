import { IActionHandler } from '$types/common';
import { USER_SETTINGS_TYPES, IUserSettingsRootState } from '$types/userSettings';
import * as USER_SETTINGS_ACTIONS from '$actions/userSettings';

type IUserSettingsActionHadler<P> = IActionHandler<IUserSettingsRootState, P>;

const setIsAutoClose: IUserSettingsActionHadler<
  typeof USER_SETTINGS_ACTIONS.setIsAutoClose
> = (
  state,
  { payload: isAutoclose },
) => ({
  ...state,
  isAutoclose,
});

const setUserTheme: IUserSettingsActionHadler<
  typeof USER_SETTINGS_ACTIONS.setUserTheme
> = (
  state,
  { payload: theme },
) => ({
  ...state,
  theme,
});

export const USER_SETTINGS_HANDLERS = {
  [USER_SETTINGS_TYPES.SET_IS_AUTOCLOSE]: setIsAutoClose,
  [USER_SETTINGS_TYPES.SET_USER_THEME]: setUserTheme,
};
