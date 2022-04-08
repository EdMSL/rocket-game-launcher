import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import styles from './styles.module.scss';
import { IUserSettingsRootState } from '$types/userSettings';
import { Select } from '$components/UI/Select';
import { IMainRootState } from '$types/main';
import { generateSelectOptions } from '$utils/data';
import { setIsAutoClose, setUserTheme } from '$actions/userSettings';
import { Switcher } from '$components/UI/Switcher';
import { appProcess, userThemeStyleFile } from '$constants/misc';
import { checkIsThemeExists } from '$utils/files';
import { addMessages } from '$actions/main';
import { CreateUserMessage } from '$utils/message';

interface IProps {
  isAutoclose: IUserSettingsRootState['isAutoclose'],
  userTheme: IUserSettingsRootState['theme'],
  userThemes: IMainRootState['userThemes'],
}

export const LauncherUserSettings: React.FC<IProps> = ({
  isAutoclose,
  userTheme,
  userThemes,
}) => {
  const dispatch = useDispatch();

  const onUserThemeSelectChange = useCallback((
    { target }: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    let theme = target.value;

    if (target.value !== '') {
      const isExists = checkIsThemeExists(target.value);

      if (!isExists) {
        theme = '';
        dispatch(addMessages([CreateUserMessage.warning('Не найдена выбранная пользовательская тема оформления. Установлена тема по умолчанию.')])); //eslint-disable-line
      }
    }

    document
      .getElementById('theme')?.setAttribute(
        'href',
        theme === ''
          ? `css/${appProcess}.css`
          : `../../../themes/${target.value}/${userThemeStyleFile}`,
      );

    dispatch(setUserTheme(theme));
  }, [dispatch]);

  const onConfigIniSwitcherToggle = useCallback((
    { target }: React.ChangeEvent<HTMLInputElement>,
  ) => {
    dispatch(setIsAutoClose(target.checked));
  }, [dispatch]);

  return (
    <div className={styles['launcher-settings__container']}>
      <Select
        className={styles['launcher-settings__item']}
        options={generateSelectOptions(userThemes)}
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
