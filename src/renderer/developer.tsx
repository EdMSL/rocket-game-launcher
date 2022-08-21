import React from 'react';
import { render } from 'react-dom';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import { ipcRenderer } from 'electron';

import { INITIAL_STATE as developerInitialState } from '$reducers/developer';
import './styles/developer.scss';
import { Developer } from '$containers/Developer';
import { configureDeveloperStore, IAppState } from '$store/store';
import { AppChannel } from '$constants/misc';
import { unhandled } from '$utils/system';

const { main, gameSettings }: IAppState = await ipcRenderer.invoke(AppChannel.GET_APP_STATE);
const initialState = {
  developer: {
    ...developerInitialState,
    launcherConfig: main.config,
    pathVariables: main.pathVariables,
    isGameSettingsConfigFileExists: main.isGameSettingsFileExists,
    ...main.isGameSettingsLoaded ? {
      isGameSettingsConfigDataLoaded: main.isGameSettingsLoaded,
      gameSettingsConfig: {
        documentsPath: gameSettings.documentsPath,
        baseFilesEncoding: gameSettings.baseFilesEncoding,
        modOrganizer: gameSettings.modOrganizer,
        gameSettingsGroups: gameSettings.gameSettingsGroups,
        gameSettingsFiles: gameSettings.gameSettingsFiles,
        gameSettingsOptions: gameSettings.initialGameSettingsOptions,
      },
    } : {},
  },
};
const { store, history } = configureDeveloperStore(initialState);

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
  unhandled();
}

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Developer />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root'),
);
