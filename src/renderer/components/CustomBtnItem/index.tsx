import React, { useCallback } from 'react';

import styles from './styles.module.scss';
import { Checkbox } from '$components/UI/Checkbox';
import { PathSelector } from '$components/UI/PathSelector';
import { TextField } from '$components/UI/TextField';
import { ILauncherDevCustomButton } from '$types/system';
import { LauncherButtonAction } from '$constants/misc';

interface IProps {
  item: ILauncherDevCustomButton,
}

export const CustomBtnItem: React.FC<IProps> = ({ item }) => {
  const onCheckboxChange = useCallback(() => {}, []);
  const OnTextFieldChange = useCallback(() => {}, []);
  const onSelectPathBtnClick = useCallback(() => {}, []);
  const onSelectPathTextInputChange = useCallback(() => {}, []);

  return (
    <li className={styles['developer-screen__custom-btn-item']}>
      <Checkbox
        className={styles['developer-screen__item']}
        id="btn_item"
        label="Кнопка запуска приложения?"
        isChecked={item.action === LauncherButtonAction.RUN || true}
        onChange={onCheckboxChange}
      />
      <PathSelector
        className={styles['developer-screen__item']}
        id=""
        label="Путь до файла\папки"
        onButtonClick={onSelectPathBtnClick}
        onChange={onSelectPathTextInputChange}
      />
      <TextField
        className={styles['developer-screen__item']}
        id="args"
        value={item.args?.toString()}
        label="Аргументы запуска"
        onChange={OnTextFieldChange}
      />
      <TextField
        className={styles['developer-screen__item']}
        id="label"
        value={item.label}
        label="Заголовок кнопки"
        onChange={OnTextFieldChange}
      />
    </li>
  );
};
