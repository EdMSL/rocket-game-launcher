import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { ipcRenderer } from 'electron';

import './styles/app.scss';

import { App } from '$containers/App';
import { configureAppStore, IAppState } from '$store/store';
import { AppChannel, Scope } from '$constants/misc';
import { unhandled } from '$utils/system';

const initialState: IAppState = await ipcRenderer.invoke(AppChannel.GET_APP_STATE);
const { store, history } = configureAppStore(initialState, Scope.RENDERER);

if (process.env.NODE_ENV === 'production') {
  unhandled();
}

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root'),
);
