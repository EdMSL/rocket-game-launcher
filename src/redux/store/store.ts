import {
  createStore, applyMiddleware, compose, Store, Middleware,
} from 'redux';
import { createBrowserHistory, History } from 'history';
import { routerMiddleware } from 'connected-react-router';
import {
  forwardToMain,
  forwardToRenderer,
  triggerAlias,
  replayActionMain,
  replayActionRenderer,
} from 'electron-redux';
import createSagaMiddleware from 'redux-saga';

import { getRootReducer } from '$reducers/root';
import gameSetingsSaga from '$sagas/gameSettings'; //eslint-disable-line import/no-cycle
import { Scope } from '$constants/misc';

///FIXME Выглядит не особо изящно, попробовать переделать
export type IAppState = ReturnType<ReturnType<typeof getRootReducer>>;

export const configureStore = (
  initialState,
  scope: string,
): { store: Store<IAppState>, history: any, } => {
  const sagaMiddleware = createSagaMiddleware();
  let history: History<unknown>|undefined;

  let middleware: Middleware[] = [];

  if (scope === Scope.RENDERER) {
    history = createBrowserHistory();

    const router = routerMiddleware(history);

    middleware = [
      forwardToMain,
      router,
      sagaMiddleware,
    ];
  } else if (scope === Scope.MAIN) {
    middleware = [
      triggerAlias,
      forwardToRenderer,
    ];
  }

  const enhanced = [
    applyMiddleware(...middleware),
  ];

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const composeEnhancers = typeof window === 'object'
    && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const rootReducer = getRootReducer(scope, history);

  const store = createStore(rootReducer, initialState, composeEnhancers(...enhanced));

  if (scope === Scope.MAIN) {
    replayActionMain(store);
  } else {
    sagaMiddleware.run(gameSetingsSaga);

    replayActionRenderer(store);
  }

  return { store, history };
};
