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
  const playButton = useSelector((state: IAppState) => state.system.playButton);
  const appButtons = useSelector((state: IAppState) => state.system.buttons);
  const customPaths = useSelector((state: IAppState) => state.system.customPaths);
  const isGameRunning = useSelector((state: IAppState) => state.main.isGameRunning);
  const isGameSettingsAvailable = useSelector((state: IAppState) => state.main.isGameSettingsAvailable); //eslint-disable-line max-len
  const gameSettingsGroups = useSelector((state: IAppState) => state.gameSettings.gameSettingsGroups);

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

  const onPlayGameBtnClick = useCallback(() => {
    dispatch(setIsGameRunning(true));
    runApplication(playButton, 'Game', changeGameState);
  }, [dispatch, playButton, changeGameState]);

  const onRunApplicationBtnClick = useCallback(({ target }) => {
    dispatch(setIsGameRunning(true));
    runApplication(target.dataset.path!, target.dataset.label!, changeGameState);
  }, [dispatch, changeGameState]);

  const onOpenFolderBtnClick = useCallback(({ target }) => {
    console.log(target.dataset.path);
    openFolder(target.dataset.path!, sendErrorMessage);
  }, [sendErrorMessage]);

  // const onGameFolderBtnClick = useCallback(() => {
  //   openFolder(GAME_DIR, sendErrorMessage);
  // }, [sendErrorMessage]);

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
        {/* <Button
          className="control-panel__btn"
          onClick={onGameFolderBtnClick}
        >
          Открыть папку игры
        </Button> */}
        {
          appButtons.map((button) => (
            <Button
              className="control-panel__btn"
              // isDisabled={isGameRunning}
              data-path={getPathToFile(button.path, customPaths, '') || ''}
              data-label={button.label}
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
              className="control-panel__btn"
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
