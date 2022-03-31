import React from 'react';
import { render } from 'react-dom';
import { ConnectedRouter } from 'connected-react-router';
import unhandled from 'electron-unhandled';
import { Provider } from 'react-redux';
import { ipcRenderer } from 'electron';

import './styles/main.scss';
import { Developer } from '$containers/Developer';
import { LogMessageType, writeToLogFile } from '$utils/log';
import { reportError } from '$utils/errors';
import {
  configureDeveloperStore, IAppState,
} from '$store/store';
import { AppChannel } from '$constants/misc';

const { main }: IAppState = await ipcRenderer.invoke(AppChannel.GET_APP_STATE);
const initialState = {
  developer: {
    config: main.config,
  },
};
const { store, history } = configureDeveloperStore(initialState);

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
      <Developer />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root'),
);
