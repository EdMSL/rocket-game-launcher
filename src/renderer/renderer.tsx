import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import { history } from '$reducers/root';

import { getGlobal } from '@electron/remote';
// const remote = require('@electron/remote');
// const getGlobal = remote.getGlobal;
// const getGlobal = require('@electron/remote').getGlobal;

declare global {
  interface Window {
    require: (module: '@electron/remote') => {
      getGlobal: typeof getGlobal,
    };
  }
}

const remote = window.require('@electron/remote');
import { App } from '$containers/App';
import { configureStore } from '$store/store';

import './styles/main.scss';

const initialState = remote.getGlobal('state');
// const initialState = remote.getGlobal('state');
const store = configureStore(initialState);
// const store = configureStore({});


render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <HashRouter>
        <App />
      </HashRouter>
    </ConnectedRouter>,
  </Provider>,
  // <App />,
  document.getElementById('root'),
);
