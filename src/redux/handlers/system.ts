import { IActionHandler } from '$constants/interfaces';
import { SYSTEM_TYPES } from '$types/system';
import { ISystemRootState } from '$reducers/system'; //eslint-disable-line import/no-cycle, max-len
import * as SYSTEM_ACTIONS from '$actions/system'; //eslint-disable-line import/no-cycle, max-len

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
