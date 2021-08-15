import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import { gameSettingsReducer } from './gameSettings';
import { userSettingsReducer } from './userSettings';
import { systemReducer } from './system';
import { mainReducer } from './main';
import { Scope } from '$constants/misc';

interface IReducers {
  gameSettings: typeof gameSettingsReducer,
  userSettings: typeof userSettingsReducer,
  system: typeof systemReducer,
  main: typeof mainReducer,
  router?: ReturnType<typeof connectRouter>,
}

export const getRootReducer = (scope: string, history) => {
  let reducers: IReducers = {
    gameSettings: gameSettingsReducer,
    userSettings: userSettingsReducer,
    main: mainReducer,
    system: systemReducer,
  };

  if (scope === Scope.RENDERER) {
    reducers = {
      ...reducers,
      router: connectRouter(history),
    };
  }

  return combineReducers({ ...reducers });
};
