import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import { gameSettingsReducer } from './gameSettings';
import { userSettingsReducer } from './userSettings';
import { configReducer } from './config';
import { mainReducer } from './main';
import { Scope } from '$constants/misc';

interface IReducers {
  gameSettings: typeof gameSettingsReducer,
  userSettings: typeof userSettingsReducer,
  config: typeof configReducer,
  main: typeof mainReducer,
  router?: ReturnType<typeof connectRouter>,
}

export const getRootReducer = (scope: string, history) => {
  let reducers: IReducers = {
    gameSettings: gameSettingsReducer,
    userSettings: userSettingsReducer,
    main: mainReducer,
    config: configReducer,
  };

  if (scope === Scope.RENDERER) {
    reducers = {
      ...reducers,
      router: connectRouter(history),
    };
  }

  return combineReducers({ ...reducers });
};
