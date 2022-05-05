import { ipcRenderer } from 'electron';
import React, {
  useCallback, useEffect, useState,
} from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { Routes } from '$constants/routes';
import { runApplication, openFolder } from '$utils/process';
import { Button } from '$components/UI/Button';
import {
  setIsGameRunning,
  addMessages,
  setIsDeveloperMode,
  setIsDevWindowOpening,
  setIsConfigLoading,
  setIsGameSettingsConfigChanged,
} from '$actions/main';
import { useAppSelector } from '$store/store';
import { CreateUserMessage } from '$utils/message';
import { LauncherButtonAction, AppChannel } from '$constants/misc';
import { Modal } from '$components/UI/Modal';
import { LauncherUserSettings } from '$components/App/LauncherUserSettings';
import { getPathToFile } from '$utils/strings';
import { Loader } from '$components/UI/Loader';
import { IButtonArg } from '$types/main';
import { ILocationState } from '$types/common';
import { IGameSettingsConfig } from '$types/gameSettings';
import { setGameSettingsConfig } from '$actions/gameSettings';

export const MainScreen: React.FC = () => {
  /* eslint-disable max-len */
  const isConfigLoading = useAppSelector((state) => state.main.isConfigLoading);
  const playButton = useAppSelector((state) => state.main.config.playButton);
  const customButtons = useAppSelector((state) => state.main.config.customButtons);
  const isGameRunning = useAppSelector((state) => state.main.isGameRunning);
  const pathVariables = useAppSelector((state) => state.main.pathVariables);
  const isDevWindowOpening = useAppSelector((state) => state.main.isDevWindowOpening);
  const isDeveloperMode = useAppSelector((state) => state.main.isDeveloperMode);
  const userThemes = useAppSelector((state) => state.main.userThemes);
  const userTheme = useAppSelector((state) => state.userSettings.theme);
  const isAutoclose = useAppSelector((state) => state.userSettings.isAutoclose);
  const isGameSettingsAvailable = useAppSelector((state) => state.main.isGameSettingsAvailable);
  const isGameSettingsFileExists = useAppSelector((state) => state.main.isGameSettingsFileExists);
  const gameSettingsGroups = useAppSelector((state) => state.gameSettings.gameSettingsGroups);

  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  /* eslint-enable max-len */

  useEffect(() => {
    ipcRenderer.on(AppChannel.CHANGE_DEV_WINDOW_STATE, (event, isOpened: boolean) => {
      if (isOpened !== undefined) {
        if (isOpened) {
          dispatch(setIsDevWindowOpening(false));
          dispatch(setIsDeveloperMode(true));
        } else {
          dispatch(setIsDeveloperMode(false));
          document.querySelector<HTMLButtonElement>('button[name=developer]')?.focus();
        }
      }
    });

    ipcRenderer.on(AppChannel.SAVE_DEV_CONFIG, (
      event: Electron.Event,
      isLauncherConfigProcessing: boolean,
      newConfig: IGameSettingsConfig,
    ) => {
      if (isLauncherConfigProcessing !== undefined) {
        dispatch(setIsConfigLoading(isLauncherConfigProcessing));
      }

      if (newConfig !== undefined) {
        dispatch(setGameSettingsConfig(newConfig));
        dispatch(setIsGameSettingsConfigChanged(true));
      }
    });

    return (): void => {
      ipcRenderer.removeAllListeners(AppChannel.CHANGE_DEV_WINDOW_STATE);
      ipcRenderer.removeAllListeners(AppChannel.SAVE_DEV_CONFIG);
    };
  }, [dispatch]);

  const changeGameState = useCallback((errorMessage: string, isRunning: boolean, close = false) => {
    dispatch(setIsGameRunning(isRunning));

    if (errorMessage) {
      dispatch(addMessages([CreateUserMessage.error(errorMessage)]));
    } else if (isAutoclose && close) {
      ipcRenderer.send(AppChannel.CLOSE_APP);
    }
  }, [dispatch, isAutoclose]);

  const sendErrorMessage = useCallback((message: string) => {
    if (message) {
      dispatch(addMessages([CreateUserMessage.error(message)]));
    }
  }, [dispatch]);

  const onDisabledNavLinkClick = useCallback((event) => {
    if (isGameRunning || (!isGameSettingsAvailable && !isDeveloperMode)) event.preventDefault();
  }, [isGameRunning, isGameSettingsAvailable, isDeveloperMode]);

  const onPlayGameBtnClick = useCallback(() => {
    dispatch(setIsGameRunning(true));
    runApplication(
      getPathToFile(playButton.path, pathVariables),
      playButton.args.map((arg) => arg.data),
      'Game',
      changeGameState,
    );
  }, [dispatch, playButton, pathVariables, changeGameState]);

  const onRunApplicationBtnClick = useCallback((
    { currentTarget }: React.MouseEvent<HTMLButtonElement>,
  ) => {
    runApplication(
      currentTarget.dataset.path!,
      currentTarget.dataset.args!.split(','),
      currentTarget.dataset.label!,
      sendErrorMessage,
    );
  }, [sendErrorMessage]);

  const onOpenFolderBtnClick = useCallback(({ currentTarget }) => {
    openFolder(currentTarget.dataset.path!, sendErrorMessage);
  }, [sendErrorMessage]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const onLauncherSettingsBtnClick = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const onDeveloperScreenBtnClick = useCallback(() => {
    dispatch(setIsDevWindowOpening(true));
    ipcRenderer.send(AppChannel.CHANGE_DEV_WINDOW_STATE, true);
  }, [dispatch]);

  const getBtnArgs = useCallback((
    btnArg: IButtonArg[],
  ) => btnArg.map((arg) => arg.data).join(), []);

  return (
    <React.Fragment>
      <main className={classNames('main', styles['main-screen__main'])}>
        <div className={classNames('control-panel', styles['main-screen__control-panel'])}>
          <Button
            className={classNames('main-btn', 'control-panel__btn')}
            isDisabled={isGameRunning || !playButton.path}
            onClick={onPlayGameBtnClick}
          >
            {playButton.label}
          </Button>
          {
            customButtons.map((button) => (
              <Button
                key={button.id}
                id={button.id}
                className={classNames('main-btn', 'control-panel__btn')}
                btnPath={getPathToFile(button.path, pathVariables)}
                btnArgs={getBtnArgs(button.args)}
                btnLabel={button.label}
                onClick={button.action === LauncherButtonAction.RUN
                  ? onRunApplicationBtnClick
                  : onOpenFolderBtnClick}
              >
                {button.label}
              </Button>
            ))
          }
          {
            isGameSettingsFileExists && (
            <Link<ILocationState>
              to={{
                pathname: gameSettingsGroups.length > 0
                  ? `${Routes.GAME_SETTINGS_SCREEN}/${gameSettingsGroups[0].name}`
                  : Routes.GAME_SETTINGS_SCREEN,
                state: { isFromMainPage: true },
              }}
              className={classNames(
                'button',
                'main-btn',
                'control-panel__btn',
                (isGameRunning
                  || !playButton.path
                  || (!isGameSettingsAvailable && !isDeveloperMode))
                  && 'control-panel__btn--disabled',
                styles['main-screen__btn'],
              )}
              onClick={onDisabledNavLinkClick}
            >
              Настройки
            </Link>
            )
          }
          <Button
            className={classNames(
              'main-btn',
              styles['main-screen__bottom-btn'],
              styles['main-screen__bottom-btn--settings'],
            )}
            name="user"
            onClick={onLauncherSettingsBtnClick}
          >
            <span className={styles['main-screen__bottom-btn-text']}>Настройки программы</span>
          </Button>
          <Button
            className={classNames(
              'main-btn',
              styles['main-screen__bottom-btn'],
              styles['main-screen__bottom-btn--developer'],
            )}
            name="developer"
            onClick={onDeveloperScreenBtnClick}
            isDisabled={isDeveloperMode}
          >
            <span className={styles['main-screen__bottom-btn-text']}>Экран разработчика</span>
          </Button>
        </div>
        {
          isModalOpen && (
          <Modal
            modalParentClassname="launcher-settings"
            title="Пользовательские настройки"
            onCloseBtnClick={closeModal}
          >
            <LauncherUserSettings
              isAutoclose={isAutoclose}
              userTheme={userTheme}
              userThemes={userThemes}
            />

          </Modal>
          )
        }
        {
          (isDevWindowOpening || isConfigLoading) && <Loader />
        }
      </main>
    </React.Fragment>
  );
};
