import React from 'react';
import {
  Switch,
  Route,
} from 'react-router-dom';

import styles from './styles.module.scss';
import { Routes } from '$constants/routes';
import { MainScreen } from '$containers/MainScreen';
import { GameSettingsScreen } from '$containers/GameSettingsScreen';
import { Messages } from '$containers/Messages';

export const App = (): JSX.Element => (
  <div className={styles.app}>
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
    <Messages />
  </div>
);
