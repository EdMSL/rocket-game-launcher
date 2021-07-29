import { combineReducers } from 'redux';
import { createMemoryHistory } from 'history';
import { connectRouter } from 'connected-react-router';
import { settingsReducer } from './settings';

interface IReducers {
  settings: typeof settingsReducer,
  router?: any,
}

export const history = createMemoryHistory();

export const getRootReducer = (scope = 'main') => {
  let reducers: IReducers = {
    settings: settingsReducer,
  };

  if (scope === 'renderer') {
    reducers = {
      ...reducers,
      router: connectRouter(history),
    };
  }

  return combineReducers({ ...reducers });
};
