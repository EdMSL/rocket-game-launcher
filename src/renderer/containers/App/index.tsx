import React from 'react';
import {
  Switch,
  Route,
} from 'react-router-dom';

import { MainScreen } from '$containers/MainScreen';
import { GameSettingsScreen } from '$containers/GameSettingsScreen';
import { Routes } from '$constants/routes';

const styles = require('./styles.module.scss').default;

export const App = (): JSX.Element => (
    <main>
      <Switch>
        <Route
          exact
          path={Routes.MAIN_SCREEN}
          component={MainScreen}
        />
        <Route
          path={Routes.GAME_SETTINGS_SCREEN}
          component={GameSettingsScreen}
        />
      </Switch>
      <div>
        <h1 className={styles.title}>Hello World!!!</h1>
      </div>
    </main>
);
