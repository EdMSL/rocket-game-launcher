import React, { useCallback } from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { Checkbox } from '$components/UI/Checkbox';
import { PathSelector } from '$components/UI/PathSelector';
import { TextField } from '$components/UI/TextField';
import { ILauncherCustomButton } from '$types/main';
import { DefaultCustomPathName, LauncherButtonAction } from '$constants/misc';
import { generateSelectOptions } from '$utils/data';
import { Button } from '$components/UI/Button';

interface IProps {
  item: ILauncherCustomButton,
  onDeleteBtnClick: (id: string) => void,
}

export const CustomBtnItem: React.FC<IProps> = ({
  item,
  onDeleteBtnClick,
}) => {
  const onCheckboxChange = useCallback(() => {}, []);
  const OnTextFieldChange = useCallback(() => {}, []);
  const onSelectPathBtnClick = useCallback(() => {}, []);
  const onSelectPathTextInputChange = useCallback(() => {}, []);

  const onDeleteCustomBtnBtnClick = useCallback(() => {
    onDeleteBtnClick(item.id);
  }, [onDeleteBtnClick, item.id]);

  return (
    <li className={styles['developer-screen__custom-btn-item']}>
      <Checkbox
        id={`item_checkbox-${item.id}`}
        label="Кнопка запуска приложения?"
        isChecked={item.action === LauncherButtonAction.RUN}
        onChange={onCheckboxChange}
      />
      <PathSelector
        id={`item_path-${item.id}`}
        label="Путь до файла\папки"
        value={item.path}
        options={generateSelectOptions([DefaultCustomPathName.GAME_DIR])}
        onButtonClick={onSelectPathBtnClick}
        onChange={onSelectPathTextInputChange}
      />
      <TextField
        id={`item_args-${item.id}`}
        value={item.args?.toString()}
        label="Аргументы запуска"
        onChange={OnTextFieldChange}
      />
      <TextField
        id={`item_label-${item.id}`}
        value={item.label}
        label="Заголовок кнопки"
        onChange={OnTextFieldChange}
      />
      <Button
        className={classNames('button', 'main-btn')}
        onClick={onDeleteCustomBtnBtnClick}
      >
        Удалить
      </Button>
    </li>
  );
};
