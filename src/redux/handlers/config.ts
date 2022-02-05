import { IActionHandler } from '$types/common';
import { CONFIG_TYPES, IConfigRootState } from '$types/config';
import * as CONFIG_ACTIONS from '$actions/config';

type ISystemActionHadler<P> = IActionHandler<IConfigRootState, P>;

const setIsFirstLaunch: ISystemActionHadler<
  typeof CONFIG_ACTIONS.setIsFirstLaunch
> = (
  state,
  { payload: isFirstLaunch },
) => ({
  ...state,
  isFirstLaunch,
});

export const CONFIG_HANDLERS = {
  [CONFIG_TYPES.SET_IS_FIRST_LAUNCH]: setIsFirstLaunch,
};
