import {
  createStore, applyMiddleware, Store, Middleware, StoreEnhancer,
} from 'redux';
import {
  TypedUseSelectorHook, useSelector,
} from 'react-redux';
import { createHashHistory, History } from 'history';
import { routerMiddleware } from 'connected-react-router';
import { composeWithStateSync } from 'electron-redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevToolsDevelopmentOnly } from '@redux-devtools/extension';

import { getDeveloperRootReducer, getRootReducer } from '$reducers/root';
import { SagaManager } from '$sagas/SagaManager';
import { Scope } from '$constants/misc';

///FIXME Выглядит не особо изящно, попробовать переделать
export type IAppState = ReturnType<ReturnType<typeof getRootReducer>>;
export type IDeveloperState = ReturnType<ReturnType<typeof getDeveloperRootReducer>>;

export const useAppSelector: TypedUseSelectorHook<IAppState> = useSelector;
export const useDeveloperSelector: TypedUseSelectorHook<IDeveloperState> = useSelector;

export const configureAppStore = (
  initialState,
  scope: string,
): { store: Store<IAppState>, history: any, } => {
  const sagaMiddleware = createSagaMiddleware();
  const middlewares: Middleware[] = [];

  let history: History|undefined;

  if (scope === Scope.RENDERER) {
    history = createHashHistory();

    middlewares.push(routerMiddleware(history), sagaMiddleware);
  }

  const enhanced = applyMiddleware(...middlewares);

  const rootReducer = getRootReducer(scope, history);
  const enhancer: StoreEnhancer = composeWithDevToolsDevelopmentOnly(composeWithStateSync(enhanced));

  const store = createStore(rootReducer, initialState, enhancer);

  if (scope === Scope.RENDERER) {
    SagaManager.startAppSagas(sagaMiddleware);
  }

  return { store, history };
};

export const configureDeveloperStore = (
  initialState,
): { store: Store<IDeveloperState>, history: History, } => {
  const sagaMiddleware = createSagaMiddleware();
  const history = createHashHistory();

  const middlewares = [routerMiddleware(history), sagaMiddleware];

  const enhanced = applyMiddleware(...middlewares);

  const rootReducer = getDeveloperRootReducer(history);
  const enhancer: StoreEnhancer = composeWithDevToolsDevelopmentOnly(enhanced);

  const store = createStore(rootReducer, initialState, enhancer);

  SagaManager.startDeveloperSagas(sagaMiddleware);

  return { store, history };
};
