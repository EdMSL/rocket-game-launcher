import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import RedBox from 'redbox-react';

import './styles/main.scss';
import { App } from '$containers/App';
import { configureStore } from '$store/store';
import { Scope } from '$constants/misc';

const remote = require('@electron/remote');

const initialState = remote.getGlobal('state');
const { store, history } = configureStore(initialState, Scope.RENDERER);

let renderPage = (): void => {
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
};

if (module.hot) {
  const renderApp = renderPage;
  const renderError = (error): void => {
    render(
      <RedBox error={error} />,
      document.getElementById('root'),
    );
  };

  renderPage = (): void => {
    try {
      renderApp();
    } catch (error) {
      renderError(error);
    }
  };

  module.hot.accept('./containers/MainScreen', () => {
    setTimeout(renderPage);
  });
}

renderPage();
