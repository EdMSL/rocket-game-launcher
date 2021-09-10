import React, { useCallback } from 'react';
import {
  Switch, Route, NavLink,
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { Routes } from '$constants/routes';
import { IAppState } from '$store/store';
import { generateSelectOptions } from '$utils/data';
import { GameSettingsContent } from '$components/GameSettingsContent';
import { Select } from '$components/UI/Select';
import { changeMoProfile } from '$actions/gameSettings';

/**
 * Контейнер, в котором располагаются блок (`GameSettingsContent`) с контроллерами для изменения
 * игровых настроек и селектор выбора профиля Mod Organizer (если МО используется).
*/
export const GameSettingsScreen: React.FC = () => {
  const gameSettingsFiles = useSelector((state: IAppState) => state.gameSettings.gameSettingsFiles);
  const gameSettingsGroups = useSelector((state: IAppState) => state.gameSettings.gameSettingsGroups);
  const gameSettingsOptions = useSelector((state: IAppState) => state.gameSettings.gameSettingsOptions);
  const moProfile = useSelector((state: IAppState) => state.gameSettings.moProfile);
  const moProfiles = useSelector((state: IAppState) => state.gameSettings.moProfiles);
  const isModOrganizerUsed = useSelector((state: IAppState) => state.system.modOrganizer.isUsed);

  const dispatch = useDispatch();

  const onMOProfilesSelectChange = useCallback(({ target }) => {
    dispatch(changeMoProfile(target.value));
  }, [dispatch]);

  return (
    <main className={classNames('main', styles['game-settings-screen__main'])}>
      <div className={classNames('control-panel', styles['game-settings-screen__navigation'])}>
        {
          gameSettingsGroups.map((group) => (
            <NavLink
              key={group.name}
              className="control-panel__btn"
              activeClassName={styles['control-panel__btn--active']}
              to={`${Routes.GAME_SETTINGS_SCREEN}/${group.name}`}
            >
              {group.label}
            </NavLink>
          ))
            }
        <NavLink
          exact
          to={Routes.MAIN_SCREEN}
          className="control-panel__btn"
        >
          Назад
        </NavLink>
      </div>
      <div className={classNames('content', styles['game-settings-screen__content'])}>
        {
        isModOrganizerUsed
        && moProfile
        && moProfiles.length > 0
        && gameSettingsOptions
        && (
          <div className={styles['game-settings-screen__profiles']}>
            <Select
              className={styles['game-settings-screen__select']}
              id="profiles-select"
              name="profiles-select"
              label="Выберите профиль Mod Organizer"
              value={moProfile}
              optionsArr={generateSelectOptions(moProfiles)}
              onChange={onMOProfilesSelectChange}
            />
          </div>
        )
        }
        <div className={styles['game-settings-screen__options']}>
          <Switch>
            <Route
              path={gameSettingsGroups.length > 0
                ? `${Routes.GAME_SETTINGS_SCREEN}/:settingGroup/`
                : Routes.GAME_SETTINGS_SCREEN}
              render={(): React.ReactElement => (
                <React.Fragment>
                  {
                    Object.keys(gameSettingsOptions).length > 0 && (
                      <GameSettingsContent
                        gameSettingsOptions={gameSettingsOptions}
                        gameSettingsFiles={gameSettingsFiles}
                        gameSettingsGroups={gameSettingsGroups}
                      />
                    )
                  }
                </React.Fragment>
              )}
            />
          </Switch>
        </div>
      </div>
    </main>
  );
};
