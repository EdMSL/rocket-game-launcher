import {
  createStore, applyMiddleware, compose, Store, Middleware, StoreEnhancer,
} from 'redux';
import {
  TypedUseSelectorHook, useSelector,
} from 'react-redux';
import {
  createHashHistory, History,
} from 'history';
import { routerMiddleware } from 'connected-react-router';
import { composeWithStateSync } from 'electron-redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from '@redux-devtools/extension';

import { getRootReducer } from '$reducers/root';
import { SagaManager } from '$sagas/SagaManager';
import { Scope } from '$constants/misc';

///FIXME Выглядит не особо изящно, попробовать переделать
export type IAppState = ReturnType<ReturnType<typeof getRootReducer>>;
export const useAppSelector: TypedUseSelectorHook<IAppState> = useSelector;

export const configureStore = (
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
  const enhancer: StoreEnhancer = composeWithDevTools(composeWithStateSync(enhanced));

  const store = createStore(rootReducer, initialState, enhancer);

  if (scope === Scope.RENDERER) {
    SagaManager.startSagas(sagaMiddleware);
  }

  return { store, history };
};
