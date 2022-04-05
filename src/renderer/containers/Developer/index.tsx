import { ipcRenderer } from 'electron';
import React, {
  useCallback, useEffect,
} from 'react';
import classNames from 'classnames';
import {
  NavLink, Redirect, Route, Switch,
} from 'react-router-dom';
import { useDispatch } from 'react-redux';

import styles from './styles.module.scss';
import { useDeveloperSelector } from '$store/store';
import {
  AppChannel,
} from '$constants/misc';
import { Loader } from '$components/UI/Loader';
import { Header } from '$components/Header';
import { DeveloperConfigScreen } from '$containers/DeveloperConfigScreen';
import { Routes } from '$constants/routes';
import { DeveloperGameSettingsScreen } from '$containers/DeveloperGameSettingsScreen';
import { setGameSettingsConfig, setIsGameSettingsConfigLoaded } from '$actions/developer';

export const Developer: React.FC = () => {
  /* eslint-disable max-len */
  const isGameSettingsConfigProcessing = useDeveloperSelector((state) => state.developer.isGameSettingsConfigProcessing);
  const isGameSettingsConfigLoaded = useDeveloperSelector((state) => state.developer.isGameSettingsConfigLoaded);
  const isLauncherConfigProcessing = useDeveloperSelector((state) => state.developer.isLauncherConfigProcessing);
  const isFirstLaunch = useDeveloperSelector((state) => state.developer.launcherConfig.isFirstLaunch);
  const gameName = useDeveloperSelector((state) => state.developer.launcherConfig.gameName);
  /* eslint-enable max-len */

  const dispatch = useDispatch();

  useEffect(() => {
    ipcRenderer.on(AppChannel.APP_STORE_UPDATED, (event, isGameSettingsLoaded, gameSettingsConfig) => {
      if (isGameSettingsLoaded !== undefined && gameSettingsConfig !== undefined) {
        if (isGameSettingsLoaded && !isGameSettingsConfigLoaded) {
          dispatch(setGameSettingsConfig(gameSettingsConfig));
          dispatch(setIsGameSettingsConfigLoaded(true));
        }
      }
    });

    return (): void => { ipcRenderer.removeAllListeners(AppChannel.APP_STORE_UPDATED); };
  }, [dispatch, isGameSettingsConfigLoaded]);

  const closeDevWindow = useCallback(() => {
    ipcRenderer.send(AppChannel.CHANGE_DEV_WINDOW_STATE, false, true);
  }, []);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <div className={styles.developer}>
      <Header
        isResizable
        gameName={gameName}
        onClose={closeDevWindow}
        isCloseBtnDisabled={isFirstLaunch}
      />
      <main className={classNames('main', styles['developer-screen__main'])}>
        <nav className={styles['developer-screen__navigation']}>
          <NavLink
            className={classNames('button', 'main-btn', 'control-panel__btn')}
            activeClassName="control-panel__btn--active"
            to={Routes.DEVELOPER_SCREEN_CONFIG}
          >
            <span className="control-panel__btn-text">
              Конфигурация
            </span>
          </NavLink>
          <NavLink
            className={classNames('button', 'main-btn', 'control-panel__btn')}
            activeClassName="control-panel__btn--active"
            to={Routes.DEVELOPER_SCREEN_GAME_SETTINGS}
          >
            <span className="control-panel__btn-text">
              Игровые настройки
            </span>
          </NavLink>
        </nav>
        <Switch>
          <Route
            exact
            path={Routes.DEVELOPER_SCREEN_CONFIG}
            component={DeveloperConfigScreen}
          />
          <Route
            exact
            path={Routes.DEVELOPER_SCREEN_GAME_SETTINGS}
            component={DeveloperGameSettingsScreen}
          />
          <Redirect to={Routes.DEVELOPER_SCREEN_CONFIG} />
        </Switch>
        {
          (isLauncherConfigProcessing || isGameSettingsConfigProcessing) && <Loader />
        }
      </main>
    </div>
  );
};
