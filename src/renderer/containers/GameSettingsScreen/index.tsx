import React, { useCallback, useState } from 'react';
import {
  Switch, Route, NavLink,
} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { Routes } from '$constants/routes';
import { useAppSelector } from '$store/store';
import {
  generateSelectOptions,
  getChangedGameSettingsOptions,
  getGameSettingsOptionsWithDefaultValues,
} from '$utils/data';
import { GameSettingsContent } from '$components/GameSettingsContent';
import { Select } from '$components/UI/Select';
import {
  changeGameSettingsOption,
  changeMoProfile,
  saveGameSettingsFiles,
  setGameSettingsOptions,
  updateGameSettingsOptions,
} from '$actions/gameSettings';
import { IGameSettingsOptionsItem } from '$types/gameSettings';
import { Loader } from '$components/UI/Loader';
import { GameSettingsFormControls } from '$components/GameSettingsFormControls';
import { createGameSettingsFilesBackup, getGameSettingsFilesBackup } from '$actions/main';
import { Modal } from '$components/UI/Modal';
import { GameSettingsBackup } from '$components/GameSettingsBackup';

/**
 * Контейнер, в котором располагаются блок (`GameSettingsContent`) с контроллерами для изменения
 * игровых настроек и селектор выбора профиля Mod Organizer (если МО используется).
*/
export const GameSettingsScreen: React.FC = () => {
  /* eslint-disable max-len */
  const isGameSettingsLoading = useAppSelector((state) => state.main.isGameSettingsLoading);
  const isGameSettingsLoaded = useAppSelector((state) => state.main.isGameSettingsLoaded);
  const isGameSettingsFilesBackuping = useAppSelector((state) => state.main.isGameSettingsFilesBackuping);
  const gameSettingsFilesBackup = useAppSelector((state) => state.main.gameSettingsFilesBackup);
  const isGameSettingsSaving = useAppSelector((state) => state.main.isGameSettingsSaving);
  const gameSettingsFiles = useAppSelector((state) => state.gameSettings.gameSettingsFiles);
  const gameSettingsGroups = useAppSelector((state) => state.gameSettings.gameSettingsGroups);
  const gameSettingsOptions = useAppSelector((state) => state.gameSettings.gameSettingsOptions);
  const moProfile = useAppSelector((state) => state.gameSettings.moProfile);
  const moProfiles = useAppSelector((state) => state.gameSettings.moProfiles);
  const isModOrganizerUsed = useAppSelector((state) => state.main.config.modOrganizer.isUsed);
  /* eslint-enable max-len */

  const dispatch = useDispatch();

  const [isGameOptionsChanged, setIsGameOptionsChanged] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isBackupsModalFirstOpen, setIsBackupsModalFirstOpen] = useState<boolean>(true);

  const onMOProfilesSelectChange = useCallback(
    ({ target }: React.ChangeEvent<HTMLSelectElement>) => {
      dispatch(changeMoProfile(target.value));
    }, [dispatch],
  );

  const onSettingOptionChange = useCallback((
    parent: string,
    options: IGameSettingsOptionsItem,
  ) => {
    dispatch(changeGameSettingsOption(parent, options));
  }, [dispatch]);

  const onGameSettingsFormSubmit = useCallback((event) => {
    event.preventDefault();

    if (isGameOptionsChanged) {
      dispatch(saveGameSettingsFiles(getChangedGameSettingsOptions(gameSettingsOptions)));
    }
  }, [dispatch, gameSettingsOptions, isGameOptionsChanged]);

  const onRefreshSettingsBtnClick = useCallback(() => {
    dispatch(updateGameSettingsOptions());
  }, [dispatch]);

  const onCancelSettingsBtnClick = useCallback(() => {
    dispatch(setGameSettingsOptions(getGameSettingsOptionsWithDefaultValues(gameSettingsOptions)));
    setIsGameOptionsChanged(false);
  }, [dispatch, gameSettingsOptions]);

  ///TODO Пересмотреть механиз отслеживания изменения параметров для кнопок
  const getIsSaveResetSettingsButtonsDisabled = useCallback(() => {
    if (
      Object.keys(getChangedGameSettingsOptions(gameSettingsOptions)).length > 0
      && !isGameSettingsFilesBackuping
    ) {
      if (!isGameOptionsChanged) {
        setIsGameOptionsChanged(true);
      }
      return false;
    }

    return true;
  },
  [gameSettingsOptions, isGameOptionsChanged, isGameSettingsFilesBackuping]);

  const onCreateBackupBtnClick = useCallback(() => {
    setIsBackupsModalFirstOpen(true);
    dispatch(createGameSettingsFilesBackup(false));
  }, [dispatch]);

  const onBackupsBtnClick = useCallback(() => {
    if (isBackupsModalFirstOpen) {
      setIsBackupsModalFirstOpen(false);
      dispatch(getGameSettingsFilesBackup());
    }
    setIsModalOpen(true);
  }, [dispatch, isBackupsModalFirstOpen]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <main className={classNames('main', styles['game-settings-screen__main'])}>
      <div className={classNames('control-panel', styles['game-settings-screen__navigation'])}>
        {
          gameSettingsGroups.map((group) => (
            <NavLink
              key={group.name}
              className={classNames('button', 'main-btn', 'control-panel__btn')}
              activeClassName="control-panel__btn--active"
              to={`${Routes.GAME_SETTINGS_SCREEN}/${group.name}`}
            >
              <span className={classNames('control-panel__btn-text')}>
                {group.label}
              </span>
            </NavLink>
          ))
            }
        <NavLink
          exact
          to={Routes.MAIN_SCREEN}
          className={classNames('button', 'main-btn', 'control-panel__btn')}
        >
          <span className={classNames('control-panel__btn-text')}>
            Назад
          </span>
        </NavLink>
      </div>
      <div className={styles['game-settings-screen__content']}>
        {
        isModOrganizerUsed
        && moProfile
        && moProfiles.length > 0
        && (Object.keys(gameSettingsOptions).length > 0 || isGameSettingsLoaded)
        && (
          <div className={styles['game-settings-screen__profiles']}>
            <Select
              className={styles['game-settings-screen__select']}
              id="profiles-select"
              label="Профиль Mod Organizer"
              value={moProfile}
              optionsArr={generateSelectOptions(moProfiles)}
              onChange={onMOProfilesSelectChange}
            />
          </div>
        )
        }
        <form
          className={styles['game-settings-screen__form']}
          onSubmit={onGameSettingsFormSubmit}
        >
          <div className={styles['game-settings-screen__options']}>
            <Switch>
              <Route
                path={gameSettingsGroups.length > 0
                  ? `${Routes.GAME_SETTINGS_SCREEN}/:settingGroup/`
                  : Routes.GAME_SETTINGS_SCREEN}
                render={(): React.ReactElement => (
                  <React.Fragment>
                    <GameSettingsContent
                      isGameSettingsLoaded={isGameSettingsLoaded}
                      gameSettingsOptions={gameSettingsOptions}
                      gameSettingsFiles={gameSettingsFiles}
                      gameSettingsGroups={gameSettingsGroups}
                      onSettingOptionChange={onSettingOptionChange}
                    />
                  </React.Fragment>
                )}
              />
            </Switch>
          </div>
          <GameSettingsFormControls
            isGameOptionsChanged={getIsSaveResetSettingsButtonsDisabled()}
            isBackuping={isGameSettingsFilesBackuping}
            isSaving={isGameSettingsSaving}
            onRefreshSettingsBtnClick={onRefreshSettingsBtnClick}
            onCancelSettingsBtnClick={onCancelSettingsBtnClick}
            onCreateBackupBtnClick={onCreateBackupBtnClick}
            onBackupsBtnClick={onBackupsBtnClick}
          />
        </form>
        {
          isModalOpen && (
            <Modal
              modalParentClassname="game-settings-screen"
              title="Бэкапы"
              onCloseBtnClick={closeModal}
            >
              <GameSettingsBackup
                gameSettingsFilesBackup={gameSettingsFilesBackup}
                isGameSettingsFilesBackuping={isGameSettingsFilesBackuping}
                onCancelBtnClick={closeModal}
              />
            </Modal>
          )
        }
        {
          isGameSettingsLoading && <Loader />
        }
      </div>
    </main>
  );
};
