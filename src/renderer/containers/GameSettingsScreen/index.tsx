import { Routes } from '$constants/routes';
import React from 'react';
import { NavLink } from 'react-router-dom';

interface IProps {
  props?: any,
}

export const GameSettingsScreen: React.FC<IProps> = (props) => (
    <div>
      <p>Settings Screen</p>
      <NavLink
        exact
        to={Routes.MAIN_SCREEN}
      >
        Настройки
      </NavLink>
    </div>
);