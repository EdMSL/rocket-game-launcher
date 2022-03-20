import { ipcRenderer } from 'electron';
import React, {
  useCallback,
} from 'react';
import classNames from 'classnames';
import {
  NavLink, Redirect, Route, Switch,
} from 'react-router-dom';

import styles from './styles.module.scss';
import { useAppSelector } from '$store/store';
import {
  AppChannel,
} from '$constants/misc';
import { Loader } from '$components/UI/Loader';
import { Header } from '$components/Header';
import { DeveloperScreenConfig } from '$containers/DeveloperScreenConfig';
import { Routes } from '$constants/routes';
import { DeveloperScreenGameSettings } from '$containers/DeveloperScreenGameSettings';

export const DeveloperScreen: React.FC = () => {
  const isGameSettingsSaving = useAppSelector((state) => state.main.isGameSettingsSaving);
  const isGameSettingsLoading = useAppSelector((state) => state.main.isGameSettingsLoading);
  const isFirstLaunch = useAppSelector((state) => state.main.config.isFirstLaunch);

  const onCloseWindowBtnClick = useCallback(() => {
    ipcRenderer.send(AppChannel.CLOSE_DEV_WINDOW, true);
  }, []);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <React.Fragment>
      <Header
        onClose={onCloseWindowBtnClick}
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
            component={DeveloperScreenConfig}
          />
          <Route
            exact
            path={Routes.DEVELOPER_SCREEN_GAME_SETTINGS}
            component={DeveloperScreenGameSettings}
          />
          <Redirect to={Routes.DEVELOPER_SCREEN_CONFIG} />
        </Switch>
        {
          (isGameSettingsSaving || isGameSettingsLoading) && <Loader />
        }
      </main>
    </React.Fragment>
  );
};
