import React, { useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { Routes } from '$constants/routes';
import { GAME_DIR } from '$constants/paths';
import { runApplication, openFolder } from '$utils/process';
import { Button } from '$components/UI/Button';
import { setIsGameRunning, addMessages } from '$actions/main';
import { IAppState } from '$store/store';
import { CreateUserMessage } from '$utils/message';
import { LauncherButtonAction } from '$constants/misc';
import { getPathToFile } from '$utils/strings';

export const MainScreen: React.FC = () => {
  /* eslint-disable max-len */
  const playButton = useSelector((state: IAppState) => state.system.playButton);
  const appButtons = useSelector((state: IAppState) => state.system.customButtons);
  const customPaths = useSelector((state: IAppState) => state.system.customPaths);
  const isGameRunning = useSelector((state: IAppState) => state.main.isGameRunning);
  const isGameSettingsAvailable = useSelector((state: IAppState) => state.main.isGameSettingsAvailable);
  const gameSettingsGroups = useSelector((state: IAppState) => state.gameSettings.gameSettingsGroups);
  /* eslint-enable max-len */

  const dispatch = useDispatch();

  const changeGameState = useCallback((isRunning: boolean, errorMessage: string) => {
    dispatch(setIsGameRunning(isRunning));

    if (errorMessage) {
      dispatch(addMessages([CreateUserMessage.error(errorMessage)]));
    }
  }, [dispatch]);

  const sendErrorMessage = useCallback((message: string) => {
    dispatch(addMessages([CreateUserMessage.error(message)]));
  }, [dispatch]);

  const onDisabledNavLinkClick = useCallback((event) => {
    if (isGameRunning || !isGameSettingsAvailable) event.preventDefault();
  }, [isGameRunning, isGameSettingsAvailable]);

  const onPlayGameBtnClick = useCallback(() => {
    dispatch(setIsGameRunning(true));
    runApplication(getPathToFile(playButton, customPaths, ''), 'Game', changeGameState);
  }, [dispatch, playButton, customPaths, changeGameState]);

  const onRunApplicationBtnClick = useCallback(({ currentTarget }) => {
    dispatch(setIsGameRunning(true));
    runApplication(
      currentTarget.dataset.path!,
       currentTarget.dataset.label!,
       changeGameState,
    );
  }, [dispatch, changeGameState]);

  const onOpenFolderBtnClick = useCallback(({ currentTarget }) => {
    openFolder(currentTarget.dataset.path!, sendErrorMessage);
  }, [sendErrorMessage]);

  const getPathForCustomBtn = useCallback((path) => {
    try {
      return getPathToFile(path, customPaths, '');
    } catch (error) {
      console.log(error);
      // dispatch(addMessages([CreateUserMessage.error(error.message)]));
      return '';
    }
  }, [customPaths]);

  return (
    <main className={classNames('main', styles['main-screen__main'])}>
      <div className={classNames('control-panel', styles['main-screen__control-panel'])}>
        <Button
          className="control-panel__btn"
          isDisabled={isGameRunning}
          onClick={onPlayGameBtnClick}
        >
          Играть
        </Button>
        {
          appButtons.map((button) => (
            <Button
              key={button.path}
              className="control-panel__btn"
              btnPath={getPathForCustomBtn(button.path)}
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
          isGameSettingsAvailable && (
            <NavLink
              exact
              to={gameSettingsGroups.length > 0
                ? `${Routes.GAME_SETTINGS_SCREEN}/${gameSettingsGroups[0].name}`
                : Routes.GAME_SETTINGS_SCREEN}
              className={classNames(
                'control-panel__btn',
                (isGameRunning || !isGameSettingsAvailable) && 'control-panel__btn--disabled',
                styles['main-screen__btn'],
              )}
              onClick={onDisabledNavLinkClick}
            >
              Настройки
            </NavLink>
          )
        }
      </div>
      <div className={classNames('content', styles['main-screen__content'])}>
        <p>Content</p>
      </div>
    </main>
  );
};
