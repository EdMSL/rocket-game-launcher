import { IAction } from '$types/common';
import { SYSTEM_TYPES } from '$types/system';
import { ISystemRootState } from '$reducers/system'; //eslint-disable-line import/no-cycle, max-len

export const setIsFirstLaunch: IAction<ISystemRootState['isFirstLaunch']> = (
  isFirstLaunch,
) => ({
  type: SYSTEM_TYPES.SET_IS_FIRST_LAUNCH,
  payload: isFirstLaunch,
});
