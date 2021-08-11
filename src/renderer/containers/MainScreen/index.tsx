import React, { useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import styles from './styles.module.scss';
import { Routes } from '$constants/routes';
import { GAME_DIR } from '$constants/paths';
import { runApplication, openFolder } from '$utils/process';
import { getMessage } from '$utils/data';
import { Button } from '$components/UI/Button';
import { setIsGameRunning, addMessages } from '$actions/main';
import { IMessage } from '$reducers/main';

export const MainScreen: React.FC = () => {
  const dispatch = useDispatch();

  const changeGameState = useCallback((isRunning: boolean) => {
    dispatch(setIsGameRunning(isRunning));
  }, [dispatch]);

  const sendErrorMessage = useCallback((message: string) => {
    const errorMessage: IMessage = getMessage(message);

    dispatch(addMessages([errorMessage]));
  }, [dispatch]);

  const onPlayGameBtnClick = useCallback(() => {
    runApplication('D:\\Oblivion\\Oblivion.exe', 'Oblivion', changeGameState);
  }, [changeGameState]);

  const onGameFolderBtnClick = useCallback(() => {
    openFolder(GAME_DIR, sendErrorMessage);
  }, [sendErrorMessage]);

  return (
    <div>
      <p className={styles.title}>Main Screen</p>
      <Button
        className="main-btn"
        onClick={onPlayGameBtnClick}
      >
        Start
      </Button>
      <Button
        className="main-btn"
        onClick={onGameFolderBtnClick}
      >
        Open game folder
      </Button>
      <NavLink
        exact
        to={Routes.GAME_SETTINGS_SCREEN}
      >
        Настройки
      </NavLink>
    </div>
  );
};

