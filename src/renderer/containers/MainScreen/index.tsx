import React, { useCallback } from 'react';
import { NavLink } from 'react-router-dom';

import { Routes } from '$constants/routes';
import { Button } from '$components/UI/Button';
import { runApplication } from '$utils/process';

interface IProps {
  props?: any,
}

export const MainScreen: React.FC<IProps> = (props) => {
  const onPlayGameBtnClick = useCallback(() => {
    runApplication('D:\\Oblivion\\Oblivion.exe', 'Oblivion');
  }, []);

  return (
    <div>
      <p>Main Screen</p>
      <Button
        className="main-btn"
        onClick={onPlayGameBtnClick}
      >
        Start
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

