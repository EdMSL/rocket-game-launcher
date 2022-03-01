import React, {
  useEffect, useCallback, useState,
} from 'react';
import {
  Switch,
  Route,
  useLocation,
} from 'react-router-dom';
import { ipcRenderer } from 'electron';

import styles from './styles.module.scss';
import { Routes } from '$constants/routes';
import { MainScreen } from '$containers/MainScreen';
import { GameSettingsScreen } from '$containers/GameSettingsScreen';
import { Messages } from '$containers/Messages';
import { Header } from '$components/Header';
import { useAppSelector } from '$store/store';
import { Modal } from '$components/UI/Modal';
import { AppInfo } from '$components/AppInfo';
import { DeveloperScreen } from '$containers/DeveloperScreen';
import { AppChannel } from '$constants/misc';

export const App = (): JSX.Element => {
  const userTheme = useAppSelector((state) => state.userSettings.theme);
  const launcherVersion = useAppSelector((state) => state.main.launcherVersion);

  const [isOpenAppInfo, setIsOpenAppInfo] = useState<boolean>(false);

  useEffect(() => {
    document
      .getElementById('theme')?.setAttribute(
        'href',
        userTheme === '' ? 'css/styles.css' : `../../../themes/${userTheme}/styles.css`,
      );
    // Служит для загрузки стилей пользователя при запуске приложения.
    // Дальше изменение стилей идет через UI. Поэтому у useEffect нет заваисимостей.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { pathname } = useLocation<{ [key: string]: string, }>();

  const openAppInfo = useCallback(() => {
    if (isOpenAppInfo) {
      return;
    }

    setIsOpenAppInfo(true);
  }, [isOpenAppInfo]);

  const onCloseAppInfoModal = useCallback(() => {
    setIsOpenAppInfo(false);
  }, []);

  const closeApp = useCallback(() => {
    ipcRenderer.send(AppChannel.CLOSE_APP);
  }, []);

  return (
    <div className={styles.app}>
      {
        !pathname.includes(Routes.DEVELOPER_SCREEN)
          && (
          <Header
            openAppInfo={openAppInfo}
            onClose={closeApp}
          />
          )
      }
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
        <Route
          path={Routes.DEVELOPER_SCREEN}
          component={DeveloperScreen}
        />
      </Switch>
      {
        !pathname.includes(Routes.DEVELOPER_SCREEN)
          && <Messages />
      }
      {
        isOpenAppInfo && (
          <Modal
            title="About app"
            onCloseBtnClick={onCloseAppInfoModal}
          >
            <AppInfo launcherVersion={launcherVersion} />
          </Modal>
        )
      }
    </div>
  );
};
