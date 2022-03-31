import React from 'react';
import { render } from 'react-dom';
import { ConnectedRouter } from 'connected-react-router';
import unhandled from 'electron-unhandled';
import { Provider } from 'react-redux';
import { ipcRenderer } from 'electron';

import { LogMessageType, writeToLogFile } from '$utils/log';
import { reportError } from '$utils/errors';
import { Developer } from '$containers/Developer';
import { configureDeveloperStore } from '$store/store';
import { AppChannel } from '$constants/misc';

const { main } = await ipcRenderer.invoke(AppChannel.GET_APP_STATE);
const { store, history } = configureDeveloperStore(main.config);

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
