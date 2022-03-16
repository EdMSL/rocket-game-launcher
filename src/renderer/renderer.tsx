import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import unhandled from 'electron-unhandled';

import './styles/main.scss';
import { App } from '$containers/App';
import { configureStore } from '$store/store';
import { Scope } from '$constants/misc';
import { LogMessageType, writeToLogFile } from '$utils/log';
import { reportError } from '$utils/errors';

const remote = require('@electron/remote');

const initialState = remote.getGlobal('state');
const { store, history } = configureStore(initialState, Scope.RENDERER);

if (!module.hot) {
  unhandled({
    showDialog: true,
    logger: (error) => writeToLogFile(
      `Message: error.message. Stack: ${error.stack}`,
      LogMessageType.ERROR,
    ),
    reportButton: reportError,
  });
}

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root'),
);
