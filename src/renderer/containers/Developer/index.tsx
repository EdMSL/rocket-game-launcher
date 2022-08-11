import { ipcRenderer } from 'electron';
import React, {
  useCallback, useState,
} from 'react';
import classNames from 'classnames';
import {
  NavLink, Redirect, Route, Switch, useHistory, useLocation,
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
import { getPathFromLinkHash, replacePathVariableByRootDir } from '$utils/strings';

export const Developer: React.FC = () => {
  /* eslint-disable max-len */
  const isConfigProcessing = useDeveloperSelector((state) => state.developer.isConfigProcessing);
  const launcherConfig = useDeveloperSelector((state) => state.developer.launcherConfig);
  const gameSettingsConfig = useDeveloperSelector((state) => state.developer.gameSettingsConfig);
  const messages = useDeveloperSelector((state) => state.developer.messages);

  const [currentConfig, setCurrentConfig] = useState<IGameSettingsConfig|ILauncherConfig>(launcherConfig);
  const [isSettingsInitialized, setIsSettingsInitialized] = useState<boolean>(false);
  const [isConfigChanged, setIsConfigChanged] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<IValidationErrors>({});

  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  /* eslint-enable max-len */

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

    setValidationErrors({});
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

    setIsSettingsInitialized(false);
  }, [currentConfig, dispatch]);

  const closeDevWindow = useCallback(() => {
    resetConfigChanges();
    ipcRenderer.send(AppChannel.CHANGE_DEV_WINDOW_STATE, false);
  }, [resetConfigChanges]);

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

  ///TODO Добавить тип для event. React.MouseEvent<HTMLAnchorElement> не понимает target.hash
  const onNavLinkClick = useCallback(async (event) => {
    if (isConfigChanged) {
      event.preventDefault();

      const isHaveErrors = Object.keys(validationErrors).length > 0;
      const messageBoxResponse: Electron.MessageBoxReturnValue = await ipcRenderer.invoke(
        AppChannel.GET_MESSAGE_BOX_RESPONSE,
        isHaveErrors
          ? 'Изменения не сохранены и есть ошибки в текущей конфигурации. При переходе изменения будут потеряны.' //eslint-disable-line max-len
          : 'Изменения не сохранены. Сохранить?',
        'Выберите действие',
        undefined,
        isHaveErrors ? ['ОК', 'Отмена'] : ['Да', 'Нет', 'Отмена'],
        AppWindowName.DEV,
      );

      if (!isHaveErrors && messageBoxResponse.response === 0) {
        saveConfigChanges(getPathFromLinkHash(event.target.hash));
        setIsSettingsInitialized(false);
      } else if (
        (!isHaveErrors && messageBoxResponse.response === 1)
        || (isHaveErrors && messageBoxResponse.response === 0)
      ) {
        resetConfigChanges();
        setValidationErrors({});
        history.push(getPathFromLinkHash(event.target.hash));
        setIsSettingsInitialized(false);
      }
    }
  }, [isConfigChanged, history, validationErrors, saveConfigChanges, resetConfigChanges]);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <div className={styles.developer}>
      <Header
        isResizable
        gameName={launcherConfig.gameName}
        icon={replacePathVariableByRootDir(launcherConfig.icon)}
        isDevWindow
        onClose={closeDevWindow}
        isCloseBtnDisabled={launcherConfig.isFirstStart}
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
          isFirstStart={launcherConfig.isFirstStart}
          isUpdateBtnEnabled={location.pathname === Routes.DEVELOPER_SCREEN_GAME_SETTINGS}
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
                  isSettingsInitialized={isSettingsInitialized}
                  validationErrors={validationErrors}
                  setNewConfig={setNewCurrentConfigData}
                  setIsSettingsInitialized={setIsSettingsInitialized}
                  resetConfigChanges={resetConfigChanges}
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
                  isSettingsInitialized={isSettingsInitialized}
                  validationErrors={validationErrors}
                  setNewConfig={setNewCurrentConfigData}
                  setIsSettingsInitialized={setIsSettingsInitialized}
                  resetConfigChanges={resetConfigChanges}
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
