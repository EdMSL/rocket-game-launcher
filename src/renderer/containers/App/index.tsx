import React from 'react';
import {
  Switch,
  Route,
} from 'react-router-dom';

import { MainScreen } from '$containers/MainScreen';
import { SettingsScreen } from '$containers/SettingsScreen';
import { Routes } from '$constants/routes';

const styles = require('./styles.module.scss').default;

export const App = (): JSX.Element => {
  console.log('text');

  return (
    <main>
      <Switch>
        <Route
          exact
          path={Routes.MAIN_SCREEN}
          component={MainScreen}
        />
        <Route
          path={Routes.SETTINGS_SCREEN}
          component={SettingsScreen}
        />
      </Switch>
      <div>
        <h1 className={styles.title}>Hello World!!!</h1>
      </div>
    </main>
  );
};
