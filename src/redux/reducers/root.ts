import { combineReducers } from 'redux';
import { createMemoryHistory } from 'history';
import { connectRouter } from 'connected-react-router';

import { gameSettingsReducer } from './gameSettings';
import { userSettingsReducer } from './userSettings';
import { systemReducer } from './system';
import { mainReducer } from './main';

interface IReducers {
  gameSettings: typeof gameSettingsReducer,
  userSettings: typeof userSettingsReducer,
  system: typeof systemReducer,
  main: typeof mainReducer,
  router?: typeof routerReducer,
}

export const history = createMemoryHistory();

const routerReducer = connectRouter(history);

export const getRootReducer = (scope = 'main') => {
  let reducers: IReducers = {
    gameSettings: gameSettingsReducer,
    userSettings: userSettingsReducer,
    main: mainReducer,
    system: systemReducer,
  };

  if (scope === 'renderer') {
    reducers = {
      ...reducers,
      router: routerReducer,
    };
  }

  return combineReducers({ ...reducers });
};
