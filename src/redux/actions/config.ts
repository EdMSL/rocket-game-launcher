import { CONFIG_TYPES, IConfigRootState } from '$types/config';

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const setIsFirstLaunch = (
  isFirstLaunch: IConfigRootState['isFirstLaunch'],
) => ({
  type: CONFIG_TYPES.SET_IS_FIRST_LAUNCH,
  payload: isFirstLaunch,
});
