import React, { useEffect } from 'react';
import {
  Switch,
  Route,
} from 'react-router-dom';
import { useSelector } from 'react-redux';

import styles from './styles.module.scss';
import { Routes } from '$constants/routes';
import { MainScreen } from '$containers/MainScreen';
import { GameSettingsScreen } from '$containers/GameSettingsScreen';
import { Messages } from '$containers/Messages';
import { Header } from '$components/Header';
import { IAppState } from '$store/store';

export const App = (): JSX.Element => {
  const userTheme = useSelector((state: IAppState) => state.userSettings.theme);

  useEffect(() => {
    document
      .getElementById('theme')?.setAttribute(
        'href',
        userTheme === '' ? 'css/styles.css' : `../../../themes/${userTheme}/styles.css`,
      );
    // Служит для загрузки стилей пользователя при запуске приложения.
    // Дальше изменение стилей идет через UI. Поэтому у useEffect нет заваисимостей.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.app}>
      <Header />
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
};
