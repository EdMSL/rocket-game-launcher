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

export const MainScreen: React.FC = () => {
  const isGameRunning = useSelector((state: IAppState) => state.main.isGameRunning);
  const isGameSettingsAvailable = useSelector((state: IAppState) => state.main.isGameSettingsAvailable); //eslint-disable-line max-len
  const settingGroups = useSelector((state: IAppState) => state.gameSettings.settingGroups);

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
    runApplication('D:\\Oblivion\\Oblivion.exe', 'Oblivion', changeGameState);
  }, [dispatch, changeGameState]);

  const onGameFolderBtnClick = useCallback(() => {
    openFolder(GAME_DIR, sendErrorMessage);
  }, [sendErrorMessage]);

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
        <Button
          className="control-panel__btn"
          onClick={onGameFolderBtnClick}
        >
          Открыть папку игры
        </Button>
        {
          isGameSettingsAvailable && (
            <NavLink
              exact
              to={settingGroups.length > 0
                ? `${Routes.GAME_SETTINGS_SCREEN}/${settingGroups[0].name}`
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
