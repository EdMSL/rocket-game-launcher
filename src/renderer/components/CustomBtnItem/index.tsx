import React, { useCallback } from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { Checkbox } from '$components/UI/Checkbox';
import { PathSelector } from '$components/UI/PathSelector';
import { TextField } from '$components/UI/TextField';
import { ILauncherCustomButton } from '$types/main';
import {
  PathVariableName,
  LauncherButtonAction,
  FileExtension,
} from '$constants/misc';
import { generateSelectOptions } from '$utils/data';
import { Button } from '$components/UI/Button';
import { IPathVariables } from '$constants/paths';
import { ArgumentsBlock } from '$components/ArgumentsBlock';

interface IProps {
  item: ILauncherCustomButton,
  fieldName: string,
  pathVariables: IPathVariables,
  onDeleteBtnClick: (id: string) => void,
  onChangeBtnData: (newBtnData: ILauncherCustomButton, fieldName: string) => void,
  onPathError: () => void,
}

export const CustomBtnItem: React.FC<IProps> = ({
  item,
  fieldName,
  pathVariables,
  onChangeBtnData,
  onDeleteBtnClick,
  onPathError,
}) => {
  const onCheckboxChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    onChangeBtnData({
      ...item,
      action: target.checked ? LauncherButtonAction.RUN : LauncherButtonAction.OPEN,
    },
    fieldName);
  }, [item, fieldName, onChangeBtnData]);

  const OnTextFieldChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    onChangeBtnData({ ...item, label: target.value }, fieldName);
  }, [item, fieldName, onChangeBtnData]);

  const onPathSelectorChange = useCallback((value) => {
    if (value !== undefined) {
      if (value !== '') {
        onChangeBtnData({ ...item, path: value }, fieldName);
      }
    } else {
      onPathError();
    }
  }, [item, fieldName, onChangeBtnData, onPathError]);

  const onDeleteCustomBtnBtnClick = useCallback(() => {
    onDeleteBtnClick(item.id);
  }, [onDeleteBtnClick, item.id]);

  const onChangeArguments = useCallback((newArgs: string[]) => {
    onChangeBtnData({ ...item, args: newArgs }, fieldName);
  }, [item, fieldName, onChangeBtnData]);

  return (
    <li className={styles['developer-screen__custom-btn-item']}>
      <TextField
        id={`item_label-${item.id}`}
        value={item.label}
        label="Заголовок кнопки"
        description="Текст, который будет отображаться на данной кнопке запуска"//eslint-disable-line max-len
        onChange={OnTextFieldChange}
      />
      <Checkbox
        id={`item_checkbox-${item.id}`}
        label="Кнопка запуска приложения?"
        isChecked={item.action === LauncherButtonAction.RUN}
        description="Определяет действие по нажатию кнопки: запуск приложения\файла иил открываетие папки. Влияет на доступный выбор в селекторе пути ниже"//eslint-disable-line max-len
        onChange={onCheckboxChange}
      />
      <PathSelector
        id={`item_path-${item.id}`}
        label="Путь до файла\папки"
        value={item.path}
        options={generateSelectOptions([PathVariableName.GAME_DIR])}
        pathVariables={pathVariables}
        isSelectFile={item.action === LauncherButtonAction.RUN}
        extensions={FileExtension.EXECUTABLE}
        description="Путь до файла для запуска или папки для открытия в проводнике"//eslint-disable-line max-len
        onChange={onPathSelectorChange}
      />
      <ArgumentsBlock
        args={item.args!}
        parent={fieldName}
        className={styles['developer-screen__item']}
        pathVariables={pathVariables}
        description="Дополнительные агрументы запуска"//eslint-disable-line max-len
        changeArguments={onChangeArguments}
        onPathError={onPathError}
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
