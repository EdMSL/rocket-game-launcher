import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import styles from './styles.module.scss';
import { IUserSettingsRootState } from '$types/userSettings';
import { Select } from '$components/UI/Select';
import { IMainRootState } from '$types/main';
import { generateSelectOptions } from '$utils/data';
import { setIsAutoclose, setUserTheme } from '$actions/userSettings';
import { Switcher } from '$components/UI/Switcher';

interface IProps {
  isAutoclose: IUserSettingsRootState['isAutoclose'],
  userTheme: IUserSettingsRootState['theme'],
  userThemes: IMainRootState['userThemes'],
}

export const LauncherSettings: React.FC<IProps> = ({
  isAutoclose,
  userTheme,
  userThemes,
}) => {
  const dispatch = useDispatch();

  const onUserThemeSelectChange = useCallback((
    { target }: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    document
      .getElementById('theme')?.setAttribute(
        'href',
        target.value === '' ? 'css/styles.css' : `../../../themes/${target.value}/styles.css`,
      );

    dispatch(setUserTheme(target.value));
  }, [dispatch]);

  const onConfigIniSwitcherToggle = useCallback((
    { target }: React.ChangeEvent<HTMLInputElement>,
  ) => {
    dispatch(setIsAutoclose(target.checked));
  }, [dispatch]);

  return (
    <div className={styles['launcher-settings__container']}>
      <Select
        className={styles['launcher-settings__item']}
        optionsArr={generateSelectOptions(userThemes)}
        id="user-themes"
        value={userTheme}
        label="Тема"
        onChange={onUserThemeSelectChange}
      />
      <Switcher
        className={styles['launcher-settings__item']}
        id="is-autoclose"
        label="Автозакрытие программы при старте игры"
        isChecked={isAutoclose}
        parentClassname="launcher-settings"
        onChange={onConfigIniSwitcherToggle}
      />
    </div>
  );
};
