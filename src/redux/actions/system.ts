import { SYSTEM_TYPES } from '$types/system';
import { ISystemRootState } from '$reducers/system'; //eslint-disable-line import/no-cycle, max-len

interface IActionReturnType<T> {
  type: string,
  payload?: T,
  meta?: {
    scope: string,
  },
}

export const setIsFirstLaunch = (
  isFirstLaunch: ISystemRootState['isFirstLaunch'],
): IActionReturnType<typeof isFirstLaunch> => ({
  type: SYSTEM_TYPES.SET_IS_FIRST_LAUNCH,
  payload: isFirstLaunch,
});
