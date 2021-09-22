import React, { useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { Routes } from '$constants/routes';
import { runApplication, openFolder } from '$utils/process';
import { Button } from '$components/UI/Button';
import { setIsGameRunning, addMessages } from '$actions/main';
import { IAppState } from '$store/store';
import { CreateUserMessage } from '$utils/message';
import { LauncherButtonAction } from '$constants/misc';
import { Select } from '$components/UI/Select';
import { generateSelectOptions } from '$utils/data';
import { setUserTheme } from '$actions/userSettings';

export const MainScreen: React.FC = () => {
  /* eslint-disable max-len */
  const playButton = useSelector((state: IAppState) => state.system.playButton);
  const appButtons = useSelector((state: IAppState) => state.system.customButtons);
  const isGameRunning = useSelector((state: IAppState) => state.main.isGameRunning);
  const userThemes = useSelector((state: IAppState) => state.main.userThemes);
  const userTheme = useSelector((state: IAppState) => state.userSettings.theme);
  const isGameSettingsAvailable = useSelector((state: IAppState) => state.main.isGameSettingsAvailable);
  const gameSettingsGroups = useSelector((state: IAppState) => state.gameSettings.gameSettingsGroups);
  /* eslint-enable max-len */

  const dispatch = useDispatch();

  const changeGameState = useCallback((isRunning: boolean, errorMessage: string) => {
    dispatch(setIsGameRunning(isRunning));

    if (errorMessage) {
      dispatch(addMessages([CreateUserMessage.error(errorMessage)]));
    }
  }, [dispatch]);

  const sendErrorMessage = useCallback((message: string) => {
    dispatch(addMessages([CreateUserMessage.error(message)]));
  }, [dispatch]);

  const onDisabledNavLinkClick = useCallback((event) => {
    if (isGameRunning || !isGameSettingsAvailable) event.preventDefault();
  }, [isGameRunning, isGameSettingsAvailable]);

  const onPlayGameBtnClick = useCallback(() => {
    dispatch(setIsGameRunning(true));
    runApplication(playButton, 'Game', changeGameState);
  }, [dispatch, playButton, changeGameState]);

  const onRunApplicationBtnClick = useCallback(({ currentTarget }) => {
    runApplication(
      currentTarget.dataset.path!,
      currentTarget.dataset.label!,
      changeGameState,
    );
  }, [changeGameState]);

  const onOpenFolderBtnClick = useCallback(({ currentTarget }) => {
    openFolder(currentTarget.dataset.path!, sendErrorMessage);
  }, [sendErrorMessage]);

  const onUserThemeSelectChange = useCallback((
    { target }: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    document.getElementById('theme')?.setAttribute('href', `../../../themes/${target.value}/styles.css`);

    dispatch(setUserTheme(target.value));
  }, [dispatch]);

  return (
    <main className={classNames('main', styles['main-screen__main'])}>
      <div className={classNames('control-panel', styles['main-screen__control-panel'])}>
        <Button
          className="control-panel__btn"
          isDisabled={isGameRunning}
          onClick={onPlayGameBtnClick}
        >
          Играть
        </Button>
        {
          appButtons.map((button) => (
            <Button
              key={button.path}
              className="control-panel__btn"
              btnPath={button.path}
              btnLabel={button.label}
              onClick={button.action === LauncherButtonAction.RUN
                ? onRunApplicationBtnClick
                : onOpenFolderBtnClick}
            >
              {button.label}
            </Button>
          ))
        }
        {
          isGameSettingsAvailable && (
            <NavLink
              exact
              to={gameSettingsGroups.length > 0
                ? `${Routes.GAME_SETTINGS_SCREEN}/${gameSettingsGroups[0].name}`
                : Routes.GAME_SETTINGS_SCREEN}
              className={classNames(
                'control-panel__btn',
                (isGameRunning || !isGameSettingsAvailable) && 'control-panel__btn--disabled',
                styles['main-screen__btn'],
              )}
              onClick={onDisabledNavLinkClick}
            >
              Настройки
            </NavLink>
          )
        }
      </div>
      <div className={classNames('content', styles['main-screen__content'])}>
        <p>Content</p>
        <Select
          optionsArr={generateSelectOptions(userThemes)}
          id="user-themes"
          value={userTheme}
          onChange={onUserThemeSelectChange}
        />
      </div>
    </main>
  );
};
