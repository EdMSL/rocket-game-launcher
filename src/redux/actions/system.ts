import { SYSTEM_TYPES, ISystemRootState } from '$types/system';

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const setIsFirstLaunch = (
  isFirstLaunch: ISystemRootState['isFirstLaunch'],
) => ({
  type: SYSTEM_TYPES.SET_IS_FIRST_LAUNCH,
  payload: isFirstLaunch,
});
