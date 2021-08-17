import { IActionHandler } from '$types/common';
import { SYSTEM_TYPES } from '$types/system';
import { ISystemRootState } from '$reducers/system';
import * as SYSTEM_ACTIONS from '$actions/system';

const setIsFirstLaunch: IActionHandler<
  ISystemRootState,
  typeof SYSTEM_ACTIONS.setIsFirstLaunch
> = (
  state,
  { payload: isFirstLaunch },
) => ({
  ...state,
  isFirstLaunch,
});

export const SYSTEM_HANDLERS = {
  [SYSTEM_TYPES.SET_IS_FIRST_LAUNCH]: setIsFirstLaunch,
};
