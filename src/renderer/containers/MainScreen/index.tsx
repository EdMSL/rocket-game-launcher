import React from 'react';
import { NavLink } from 'react-router-dom';

import { Routes } from '$constants/routes';

interface IProps {
  props?: any,
}

export const MainScreen: React.FC<IProps> = (props) => (
  <div>
    <p>Main Screen</p>
    <NavLink
      exact
      to={Routes.GAME_SETTINGS_SCREEN}
    >
      Настройки
    </NavLink>
  </div>
);
