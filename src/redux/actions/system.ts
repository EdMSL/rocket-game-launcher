import { IAction } from '$types/common';
import { SYSTEM_TYPES } from '$types/system';
import { ISystemRootState } from '$reducers/system';

export const setIsFirstLaunch: IAction<ISystemRootState['isFirstLaunch']> = (
  isFirstLaunch,
) => ({
  type: SYSTEM_TYPES.SET_IS_FIRST_LAUNCH,
  payload: isFirstLaunch,
});
