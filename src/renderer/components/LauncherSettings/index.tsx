import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import styles from './styles.module.scss';
import { IUserSettingsRootState } from '$types/userSettings';
import { Select } from '$components/UI/Select';
import { IMainRootState } from '$types/main';
import { generateSelectOptions } from '$utils/data';
import { setUserTheme } from '$actions/userSettings';

interface IProps {
  userTheme: IUserSettingsRootState['theme'],
  userThemes: IMainRootState['userThemes'],
}

export const LauncherSettings: React.FC<IProps> = ({ userTheme, userThemes }) => {
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

  return (
    <div className={styles['launcher-settings__container']}>
      <Select
        optionsArr={generateSelectOptions(userThemes)}
        id="user-themes"
        value={userTheme}
        label="Тема"
        onChange={onUserThemeSelectChange}
      />
    </div>
  );
};
