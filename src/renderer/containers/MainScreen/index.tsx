import { ipcRenderer } from 'electron';
import React, { useCallback, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { Routes } from '$constants/routes';
import { runApplication, openFolder } from '$utils/process';
import { Button } from '$components/UI/Button';
import { setIsGameRunning, addMessages } from '$actions/main';
import { useAppSelector } from '$store/store';
import { CreateUserMessage } from '$utils/message';
import { LauncherButtonAction } from '$constants/misc';
import { Modal } from '$components/UI/Modal';
import { LauncherSettings } from '$components/LauncherSettings';
import { getPathToFile } from '$utils/strings';

export const MainScreen: React.FC = () => {
  /* eslint-disable max-len */
  const playButton = useAppSelector((state) => state.main.config.playButton);
  const appButtons = useAppSelector((state) => state.main.config.customButtons);
  const isGameRunning = useAppSelector((state) => state.main.isGameRunning);
  const pathVariables = useAppSelector((state) => state.main.pathVariables);
  const userThemes = useAppSelector((state) => state.main.userThemes);
  const userTheme = useAppSelector((state) => state.userSettings.theme);
  const isAutoclose = useAppSelector((state) => state.userSettings.isAutoclose);
  const isGameSettingsAvailable = useAppSelector((state) => state.main.isGameSettingsAvailable);
  const gameSettingsGroups = useAppSelector((state) => state.gameSettings.gameSettingsGroups);
  /* eslint-enable max-len */

  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const changeGameState = useCallback((errorMessage: string, isRunning: boolean, close = false) => {
    dispatch(setIsGameRunning(isRunning));

    if (errorMessage) {
      dispatch(addMessages([CreateUserMessage.error(errorMessage)]));
    } else if (isAutoclose && close) {
      ipcRenderer.send('close app');
    }
  }, [dispatch, isAutoclose]);

  const sendErrorMessage = useCallback((message: string) => {
    if (message) {
      dispatch(addMessages([CreateUserMessage.error(message)]));
    }
  }, [dispatch]);

  const onDisabledNavLinkClick = useCallback((event) => {
    if (isGameRunning || !isGameSettingsAvailable) event.preventDefault();
  }, [isGameRunning, isGameSettingsAvailable]);

  const onPlayGameBtnClick = useCallback(() => {
    dispatch(setIsGameRunning(true));
    runApplication(
      getPathToFile(playButton.path, pathVariables),
      playButton.args,
      'Game',
      changeGameState,
    );
  }, [dispatch, playButton, pathVariables, changeGameState]);

  const onRunApplicationBtnClick = useCallback(({ currentTarget }) => {
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

  return (
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
          appButtons.map((button) => (
            <Button
              key={button.id}
              className={classNames('main-btn', 'control-panel__btn')}
              btnPath={getPathToFile(button.path, pathVariables)}
              btnArgs={button.args}
              btnLabel={button.label}
              onClick={button.action === LauncherButtonAction.RUN
                ? onRunApplicationBtnClick
                : onOpenFolderBtnClick}
            >
              {button.label}
            </Button>
          ))
        }
        <NavLink
          exact
          to={gameSettingsGroups.length > 0
            ? `${Routes.GAME_SETTINGS_SCREEN}/${gameSettingsGroups[0].name}`
            : Routes.GAME_SETTINGS_SCREEN}
          className={classNames(
            'button',
            'main-btn',
            'control-panel__btn',
            (isGameRunning || !isGameSettingsAvailable || !playButton.path) && 'control-panel__btn--disabled',
            styles['main-screen__btn'],
          )}
          onClick={onDisabledNavLinkClick}
        >
          Настройки
        </NavLink>
        <Button
          className={classNames(
            'main-btn',
            styles['main-screen__bottom-btn'],
            styles['main-screen__bottom-btn--settings'],
          )}
          onClick={onLauncherSettingsBtnClick}
        >
          <span className={styles['main-screen__bottom-btn-text']}>Настройки программы</span>
        </Button>
        <NavLink
          exact
          to={Routes.DEVELOPER_SCREEN}
          className={classNames(
            'main-btn',
            styles['main-screen__bottom-btn'],
            styles['main-screen__bottom-btn--developer'],
          )}
          onClick={onDisabledNavLinkClick}
        >
          <span className={styles['main-screen__bottom-btn-text']}>Экран разработчика</span>
        </NavLink>
      </div>
      {
        isModalOpen && (
        <Modal
          modalParentClassname="launcher-settings"
          onCloseBtnClick={closeModal}
        >
          <LauncherSettings
            isAutoclose={isAutoclose}
            userTheme={userTheme}
            userThemes={userThemes}
          />

        </Modal>
        )
      }
    </main>
  );
};
