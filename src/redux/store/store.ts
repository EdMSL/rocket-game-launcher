import { createStore, applyMiddleware, compose } from 'redux';
// import { persistState } from 'redux-devtools';
// import thunk from 'redux-thunk';
// import promise from 'redux-promise';
// import createLogger from 'redux-logger';
// import { hashHistory } from 'react-router';
// import { routerMiddleware } from 'react-router-redux';
import { routerMiddleware } from 'connected-react-router';
import { getRootReducer, history } from '../reducers/root';
// import {
//   forwardToMain,
//   forwardToRenderer,
//   triggerAlias,
//   replayActionMain,
//   replayActionRenderer,
// } from 'electron-redux';

// const {
//   forwardToMain,
//   forwardToRenderer,
//   triggerAlias,
//   replayActionMain,
//   replayActionRenderer,
// } = require('electron-redux');

import {
  forwardToMain as ForwardToMain,
  forwardToRenderer as ForwardToRenderer,
  triggerAlias as TriggerAlias,
  replayActionMain as ReplayActionMain,
  replayActionRenderer as ReplayActionRenderer,
} from 'electron-redux';

declare global {
  interface window {
    require: (module: 'electron-redux') => {
      forwardToMain: typeof ForwardToMain,
      forwardToRenderer: typeof ForwardToRenderer,
      triggerAlias: typeof TriggerAlias,
      replayActionMain: typeof ReplayActionMain,
      replayActionRenderer: typeof ReplayActionRenderer,
    };
  }
}

const { forwardToMain,
  forwardToRenderer,
  triggerAlias,
  replayActionMain,
  replayActionRenderer, } = require('electron-redux');

export const configureStore = (initialState, scope = 'main') => {
  const router = routerMiddleware(history);

  let middleware = [];

  if (!process.env.NODE_ENV) {
    // middleware.push(logger);
  }

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

  if (scope === 'main') {
    replayActionMain(store);
  } else {
    replayActionRenderer(store);
  }

  return store;
};
