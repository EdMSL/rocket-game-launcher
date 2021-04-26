import React from 'react';
import {
  Switch,
  Route,
} from 'react-router-dom';

import { MainScreen } from '$containers/MainScreen';
import { SettingsScreen } from '$containers/SettingsScreen';
import { Routes } from '$constants/routes';

const styles = require('./styles.module.scss').default;

export const App = () => {
  console.log('text');

  return (
    <main>
      {/* <Switch>
        <Route
          exact
          path={Routes.MAIN_SCREEN}
          component={MainScreen}
        />
        <Route
          path={Routes.SETTINGS_SCREEN}
          component={SettingsScreen}
        />
      </Switch> */}
      <div>
        <h1 className={styles.title}>Hello World!</h1>
        <p>
            We are using Node.js <span id="node-version"></span>,
            Chromium <span id="chrome-version"></span>,
            and Electron <span id="electron-version"></span>.
        </p>
      </div>
    </main>
  );
};
