import { ipcRenderer } from 'electron';
import React, {
  useCallback, useState,
} from 'react';
import classNames from 'classnames';
import {
  NavLink, Redirect, Route, Switch, useHistory,
} from 'react-router-dom';
import { useDispatch } from 'react-redux';

import styles from './styles.module.scss';
import { useDeveloperSelector } from '$store/store';
import {
  AppChannel, AppWindowName,
} from '$constants/misc';
import { Loader } from '$components/UI/Loader';
import { Header } from '$components/Header';
import { LauncherConfigurationScreen } from '$containers/LauncherConfigurationScreen';
import { DeveloperScreenName, Routes } from '$constants/routes';
import { GameSettingsConfigurationScreen } from '$containers/GameSettingsConfigurationScreen';
import { Messages } from '$components/Messages';
import {
  deleteDeveloperMessages,
  saveConfiguration,
  setDeveloperMessages,
  updateConfig,
} from '$actions/developer';
import { IGameSettingsConfig } from '$types/gameSettings';
import { ILauncherConfig } from '$types/main';
import { IValidationErrors } from '$utils/validation';
import { ScrollbarsBlock } from '$components/UI/ScrollbarsBlock';
import { DeveloperScreenController } from '$components/Developer/DeveloperScreenController';
import { checkObjectForEqual } from '$utils/check';
import { getPathFromLinkHash } from '$utils/strings';

export const Developer: React.FC = () => {
  /* eslint-disable max-len */
  const isConfigProcessing = useDeveloperSelector((state) => state.developer.isConfigProcessing);
  const isFirstStart = useDeveloperSelector((state) => state.developer.launcherConfig.isFirstStart);
  const launcherConfig = useDeveloperSelector((state) => state.developer.launcherConfig);
  const gameSettingsConfig = useDeveloperSelector((state) => state.developer.gameSettingsConfig);
  const gameName = useDeveloperSelector((state) => state.developer.launcherConfig.gameName);
  const messages = useDeveloperSelector((state) => state.developer.messages);

  const history = useHistory();
  const dispatch = useDispatch();

  const [currentConfig, setCurrentConfig] = useState<IGameSettingsConfig|ILauncherConfig>(launcherConfig);
  const [isConfigChanged, setIsConfigChanged] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<IValidationErrors>({});
  /* eslint-enable max-len */

  const closeDevWindow = useCallback(() => {
    ipcRenderer.send(AppChannel.CHANGE_DEV_WINDOW_STATE, false);
  }, []);

  const setNewCurrentConfigData = useCallback((
    newConfig: IGameSettingsConfig|ILauncherConfig,
    isCheckForChanges = true,
  ) => {
    if (isCheckForChanges) {
      let isChanged = false;

      if ('playButton' in currentConfig) {
        isChanged = !checkObjectForEqual(launcherConfig, newConfig);
      } else if ('baseFilesEncoding' in currentConfig) {
        isChanged = !checkObjectForEqual(gameSettingsConfig, newConfig);
      }

      setIsConfigChanged(isChanged);
    }

    setCurrentConfig(newConfig);
  }, [currentConfig, launcherConfig, gameSettingsConfig]);

  const saveConfigChanges = useCallback((
    pathToGo: string = '',
  ) => {
    dispatch(saveConfiguration(currentConfig, pathToGo));
    setIsConfigChanged(false);
  }, [currentConfig, dispatch]);

  const resetConfigChanges = useCallback(() => {
    if ('playButton' in currentConfig) {
      setCurrentConfig(launcherConfig);
    } else if ('baseFilesEncoding' in currentConfig) {
      setCurrentConfig(gameSettingsConfig);
    }

    setIsConfigChanged(false);
  }, [currentConfig, launcherConfig, gameSettingsConfig]);

  const cancelConfigChanges = useCallback(() => {
    resetConfigChanges();
    ipcRenderer.send(AppChannel.CHANGE_DEV_WINDOW_STATE, false);
  }, [resetConfigChanges]);

  const updateConfigData = useCallback(() => {
    if ('playButton' in currentConfig) {
      dispatch(updateConfig(DeveloperScreenName.LAUNCHER));
    } else if ('baseFilesEncoding' in currentConfig) {
      dispatch(updateConfig(DeveloperScreenName.GAME_SETTINGS));
    }
  }, [currentConfig, dispatch]);

  ///TODO Добавить тип для event. React.MouseEvent<HTMLAnchorElement> не понимает target.hash
  const onNavLinkClick = useCallback(async (event) => {
    if (isConfigChanged) {
      event.preventDefault();

      const messageBoxResponse: Electron.MessageBoxReturnValue = await ipcRenderer.invoke(
        AppChannel.GET_MESSAGE_BOX_RESPONSE,
        'Изменения не сохранены. Сохранить?', //eslint-disable-line max-len
        'Выберите действие',
        undefined,
        ['Да', 'Нет', 'Отмена'],
        AppWindowName.DEV,
      );

      if (messageBoxResponse.response === 0) {
        saveConfigChanges(getPathFromLinkHash(event.target.hash));
      } else if (messageBoxResponse.response === 1) {
        resetConfigChanges();
        history.push(getPathFromLinkHash(event.target.hash));
      }
    }
  }, [isConfigChanged, history, saveConfigChanges, resetConfigChanges]);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <div className={styles.developer}>
      <Header
        isResizable
        gameName={gameName}
        onClose={closeDevWindow}
        isCloseBtnDisabled={isFirstStart}
      />
      <main className={styles.developer__main}>
        <nav className={styles.developer__navigation}>
          <NavLink
            className={classNames(
              'button', 'main-btn', styles['developer__navigation-btn'],
            )}
            activeClassName="developer__navigation-btn--active"
            to={Routes.DEVELOPER_SCREEN_CONFIG}
            onClick={onNavLinkClick}
          >
            Конфигурация
          </NavLink>
          <NavLink
            className={classNames(
              'button', 'main-btn', styles['developer__navigation-btn'],
            )}
            activeClassName="developer__navigation-btn--active"
            to={Routes.DEVELOPER_SCREEN_GAME_SETTINGS}
            onClick={onNavLinkClick}
          >
            Игровые настройки
          </NavLink>
        </nav>
        <DeveloperScreenController
          isConfigChanged={isConfigChanged}
          isHaveValidationErrors={Object.keys(validationErrors).length > 0}
          isFirstStart={isFirstStart}
          saveChanges={saveConfigChanges}
          onCancelBtnClick={cancelConfigChanges}
          onResetBtnClick={resetConfigChanges}
          onUpdateBtnClick={updateConfigData}
        />
        <ScrollbarsBlock>
          <Switch>
            <Route
              exact
              path={Routes.DEVELOPER_SCREEN_CONFIG}
              render={(): React.ReactElement => (
                <LauncherConfigurationScreen
                  currentConfig={currentConfig as ILauncherConfig}
                  setNewConfig={setNewCurrentConfigData}
                  resetConfigChanges={resetConfigChanges}
                  validationErrors={validationErrors}
                  setValidationErrors={setValidationErrors}
                />
              )}
            />
            <Route
              exact
              path={Routes.DEVELOPER_SCREEN_GAME_SETTINGS}
              render={(): React.ReactElement => (
                <GameSettingsConfigurationScreen
                  currentConfig={currentConfig as IGameSettingsConfig}
                  setNewConfig={setNewCurrentConfigData}
                  resetConfigChanges={resetConfigChanges}
                  validationErrors={validationErrors}
                  setValidationErrors={setValidationErrors}
                />
              )}
            />
            <Redirect to={Routes.DEVELOPER_SCREEN_CONFIG} />
          </Switch>
        </ScrollbarsBlock>
        <Messages
          messages={messages}
          setMessages={setDeveloperMessages}
          deleteMessages={deleteDeveloperMessages}
        />
        {
          isConfigProcessing && <Loader />
        }
      </main>
    </div>
  );
};
