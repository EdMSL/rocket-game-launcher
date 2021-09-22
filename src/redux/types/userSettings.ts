export const USER_SETTINGS_TYPES = {
  SET_USER_THEME: 'SET_USER_THEME',
};

export type IUserSettingsRootState = Readonly<{
  theme: string,
}>;
