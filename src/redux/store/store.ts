import {
  createStore, applyMiddleware, compose, Store, Middleware,
} from 'redux';
import { routerMiddleware } from 'connected-react-router';
import {
  forwardToMain,
  forwardToRenderer,
  triggerAlias,
  replayActionMain,
  replayActionRenderer,
} from 'electron-redux';
import createSagaMiddleware from 'redux-saga';

import { getRootReducer, history } from '$reducers/root';

export const configureStore = (
  initialState,
  scope = 'main',
): Store<ReturnType<ReturnType<typeof getRootReducer>>> => {
  const router = routerMiddleware(history);
  const sagaMiddleware = createSagaMiddleware();

  let middleware: Middleware[] = [sagaMiddleware];

  if (scope === 'renderer') {
    middleware = [
      forwardToMain,
      router,
      ...middleware,
    ];
  }

  if (scope === 'main') {
    middleware = [
      triggerAlias,
      ...middleware,
      forwardToRenderer,
    ];
  }

  const enhanced = [
    applyMiddleware(...middleware),
  ];

  const composeEnhancers = typeof window === 'object'
  /* eslint-disable @typescript-eslint/no-explicit-any */
    && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const rootReducer = getRootReducer(scope);

  const store = createStore(rootReducer, initialState, composeEnhancers(...enhanced));

  // sagaMiddleware.run(mainSaga);

  if (scope === 'main') {
    replayActionMain(store);
  } else {
    replayActionRenderer(store);
  }

  return store;
};
