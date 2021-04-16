import React from 'react';
import { render } from 'react-dom';

import './styles/main.scss';

import { App } from '$containers/App';

render(
  <App />, document.getElementById('root'),
);
