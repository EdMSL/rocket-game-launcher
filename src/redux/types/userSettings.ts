export const USER_SETTINGS_TYPES = {
  SET_RESOLUTION: 'SET_RESOLUTION',
};

interface IResolution {
  width: number,
  height: number,
}

export type IUserSettingsRootState = Readonly<{
  resolution: IResolution,
}>;
