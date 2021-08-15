import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';

import './styles/main.scss';
import { App } from '$containers/App';
import { configureStore } from '$store/store';
import { Scope } from '$constants/misc';

const remote = require('@electron/remote');

if (module.hot) {
  module.hot.accept();
}

const initialState = remote.getGlobal('state');
const { store, history } = configureStore(initialState, Scope.RENDERER);

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
