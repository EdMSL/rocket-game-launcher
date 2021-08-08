import React from 'react';
import { NavLink } from 'react-router-dom';

import styles from './styles.module.scss';
import { Routes } from '$constants/routes';

interface IProps {
  props?: any,
}

export const GameSettingsScreen: React.FC<IProps> = (props) => (
  <div>
    <p className={styles.title}>Settings Screen</p>
    <NavLink
      exact
      to={Routes.MAIN_SCREEN}
    >
      Настройки
    </NavLink>
  </div>
);
