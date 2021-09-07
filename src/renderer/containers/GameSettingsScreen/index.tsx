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
import { GameSettingsBlock } from '$components/GameSettingsBlock';
import { Select } from '$components/UI/Select';

interface IProps {
  props?: any,
}
/**
 * Контейнер, в котором располагаются блок (`GameSettingsBlock`) с контроллерами для изменения
 * игровых настроек и селектор выбора профиля Mod Organizer (если МО используется).
*/
export const GameSettingsScreen: React.FC<IProps> = (props) => {
  const usedFiles = useSelector((state: IAppState) => state.gameSettings.usedFiles);
  const settingGroups = useSelector((state: IAppState) => state.gameSettings.settingGroups);
  const gameOptions = useSelector((state: IAppState) => state.gameSettings.gameOptions);
  const moProfile = useSelector((state: IAppState) => state.gameSettings.moProfile);
  const moProfiles = useSelector((state: IAppState) => state.gameSettings.moProfiles);
  const isModOrganizerUsed = useSelector((state: IAppState) => state.system.modOrganizer.isUsed);

  const dispatch = useDispatch();

  const onMOProfilesSelectChange = useCallback(({ target }) => {
    // dispatch(writeMOIni(target.value));
  }, []);

  return (
    <main className={classNames('main', styles['game-settings-screen__main'])}>
      <div className={classNames('control-panel', styles['game-settings-screen__control-panel'])}>
        {
          settingGroups.map((group) => (
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
        && gameOptions
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
        <Switch>
          <Route
            path={`${Routes.GAME_SETTINGS_SCREEN}/:settingGroup/`}
            render={(): React.ReactElement => (
              <React.Fragment>
                <GameSettingsBlock
                  gameOptions={gameOptions}
                  usedFiles={usedFiles}
                />
              </React.Fragment>
            )}
          />
        </Switch>
      </div>
    </main>
  );
};
