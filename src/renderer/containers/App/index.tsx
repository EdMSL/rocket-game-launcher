import React, {
  useEffect, useCallback, useState,
} from 'react';
import {
  Switch,
  Route,
  useLocation,
  Redirect,
} from 'react-router-dom';
import { ipcRenderer } from 'electron';

import styles from './styles.module.scss';
import { Routes } from '$constants/routes';
import { MainScreen } from '$containers/MainScreen';
import { GameSettingsScreen } from '$containers/GameSettingsScreen';
import { Messages } from '$components/Messages';
import { Header } from '$components/Header';
import { useAppSelector } from '$store/store';
import { Modal } from '$components/UI/Modal';
import { AppInfo } from '$components/AppInfo';
import { Developer } from '$containers/Developer';
import { AppChannel, userThemeStyleFile } from '$constants/misc';
import { setMessages } from '$actions/main';

export const App = (): JSX.Element => {
  const userTheme = useAppSelector((state) => state.userSettings.theme);
  const launcherVersion = useAppSelector((state) => state.main.launcherVersion);
  const gameName = useAppSelector((state) => state.main.config.gameName);
  const isResizable = useAppSelector((state) => state.main.config.isResizable);
  const messages = useAppSelector((state) => state.main.messages);

  const [isOpenAppInfo, setIsOpenAppInfo] = useState<boolean>(false);

  useEffect(() => {
    document.addEventListener('auxclick', (e) => {
      if (e.button === 1) {
        e.preventDefault();
      }
    });

    if (userTheme) {
      document.getElementById('theme')?.setAttribute(
        'href',
        `../../../themes/${userTheme}/${userThemeStyleFile}`,
      );
      // Служит для загрузки стилей пользователя при запуске приложения.
      // Дальше изменение стилей идет через UI. Поэтому у useEffect нет заваисимостей.
    }
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
            isResizable={isResizable}
            gameName={gameName}
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
          component={Developer}
        />
        <Redirect
          from="/"
          to={Routes.MAIN_SCREEN}
        />
      </Switch>
      <Messages
        messages={messages}
        setMessages={setMessages}
      />
      {
        isOpenAppInfo && (
          <Modal
            title="О программе"
            onCloseBtnClick={onCloseAppInfoModal}
          >
            <AppInfo launcherVersion={launcherVersion} />
          </Modal>
        )
      }
    </div>
  );
};
