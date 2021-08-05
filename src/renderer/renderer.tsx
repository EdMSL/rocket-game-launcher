import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';

import { App } from '$containers/App';
import { configureStore } from '$store/store';
import { history } from '$reducers/root';

import './styles/main.scss';

const remote = require('@electron/remote');

const initialState = remote.getGlobal('state');
const store = configureStore(initialState, 'renderer');

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <HashRouter>
        <App />
      </HashRouter>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root'),
);
