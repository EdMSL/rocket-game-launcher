import React from 'react';
import {
  Switch, Route, NavLink,
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { Routes } from '$constants/routes';
import { IAppState } from '$store/store';

interface IProps {
  props?: any,
}

export const GameSettingsScreen: React.FC<IProps> = (props) => {
  const usedFiles = useSelector((state: IAppState) => state.gameSettings.usedFiles);

  const dispatch = useDispatch();

  return (
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
        <div>
          <Switch>
            <Route
              path={`${Routes.GAME_SETTINGS_SCREEN}/:settingGroup/`}
              render={(): React.ReactElement => <div />}
            />
          </Switch>
        </div>
      </div>
    </main>
  );
};
