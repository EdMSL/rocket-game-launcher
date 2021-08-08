import React, { useCallback } from 'react';
import { NavLink } from 'react-router-dom';

import styles from './styles.module.scss';
import { Routes } from '$constants/routes';
import { Button } from '$components/UI/Button';
import { runApplication, openFolder } from '$utils/process';
import { GAME_DIR } from '$constants/paths';

interface IProps {
  props?: any,
}

export const MainScreen: React.FC<IProps> = (props) => {
  const onPlayGameBtnClick = useCallback(() => {
    runApplication('D:\\Oblivion\\Oblivion.exe', 'Oblivion');
  }, []);

  const onGameFolderBtnClick = useCallback(() => {
    openFolder(GAME_DIR);
  }, []);

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

