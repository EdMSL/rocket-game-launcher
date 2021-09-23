export const USER_SETTINGS_TYPES = {
  SET_IS_AUTOCLOSE: 'SET_IS_AUTOCLOSE',
  SET_USER_THEME: 'SET_USER_THEME',
};

export type IUserSettingsRootState = Readonly<{
  isAutoclose: boolean,
  theme: string,
}>;
