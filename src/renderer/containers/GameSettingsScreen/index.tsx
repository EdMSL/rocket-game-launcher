import React from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { Routes } from '$constants/routes';

interface IProps {
  props?: any,
}

export const GameSettingsScreen: React.FC<IProps> = (props) => (
  <main className={classNames('main', styles['game-settings-screen__main'])}>
    <div className={classNames('control-panel', styles['game-settings-screen__control-panel'])}>
      <NavLink
        exact
        to={Routes.MAIN_SCREEN}
        className="control-panel__btn"
      >
        Назад
      </NavLink>
    </div>
    <div className={classNames('content', styles['game-settings-screen__content'])}>
      <p>Content</p>
    </div>
  </main>
);
