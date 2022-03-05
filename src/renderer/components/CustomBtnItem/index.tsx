import React, { useCallback } from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { Checkbox } from '$components/UI/Checkbox';
import { PathSelector } from '$components/UI/PathSelector';
import { TextField } from '$components/UI/TextField';
import { IButtonArg, ILauncherCustomButton } from '$types/main';
import {
  PathVariableName,
  LauncherButtonAction,
} from '$constants/misc';
import { generateSelectOptions } from '$utils/data';
import { Button } from '$components/UI/Button';
import { IPathVariables } from '$constants/paths';
import { ArgumentsBlock } from '$components/ArgumentsBlock';
import { getIsPathWithVariableCorrect } from '$utils/check';

interface IProps {
  item: ILauncherCustomButton,
  fieldName: string,
  pathVariables: IPathVariables,
  onDeleteBtnClick: (id: string) => void,
  onChangeBtnData: (
    newBtnData: ILauncherCustomButton,
    fieldName: string,
    isValidationError?: boolean,
  ) => void,
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
    fieldName,
    getIsPathWithVariableCorrect(
      item.path,
      item.action,
    ));
  }, [item, fieldName, onChangeBtnData]);

  const OnTextFieldChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    onChangeBtnData({ ...item, label: target.value }, fieldName);
  }, [item, fieldName, onChangeBtnData]);

  const onPathSelectorChange = useCallback((
    value: string,
    isValidationError: boolean,
  ) => {
    if (value) {
      onChangeBtnData({ ...item, path: value }, fieldName, isValidationError);
    }
  }, [item, fieldName, onChangeBtnData]);

  const onDeleteCustomBtnBtnClick = useCallback(() => {
    onDeleteBtnClick(item.id);
  }, [onDeleteBtnClick, item.id]);

  const onChangeArguments = useCallback((
    newArgs: IButtonArg[],
    parent: string,
    isValidationError: boolean|undefined,
  ) => {
    onChangeBtnData({ ...item, args: newArgs }, fieldName, isValidationError);
  }, [item, fieldName, onChangeBtnData]);

  return (
    <li className={styles['developer-screen__custom-btn-item']}>
      <TextField
        className="developer-screen__item"
        id={`item_label-${item.id}`}
        value={item.label}
        label="Заголовок кнопки"
        description="Текст, который будет отображаться на данной кнопке запуска"//eslint-disable-line max-len
        onChange={OnTextFieldChange}
      />
      <Checkbox
        className="developer-screen__item"
        id={`item_checkbox-${item.id}`}
        label="Кнопка запуска приложения?"
        isChecked={item.action === LauncherButtonAction.RUN}
        description="Определяет действие по нажатию кнопки: запуск приложения\файла или открытие папки. Влияет на доступный выбор в селекторе пути ниже"//eslint-disable-line max-len
        onChange={onCheckboxChange}
      />
      <PathSelector
        className="developer-screen__item"
        id={`item_path-${item.id}`}
        label="Путь до файла\папки"
        value={item.path}
        options={generateSelectOptions([PathVariableName.GAME_DIR])}
        pathVariables={pathVariables}
        selectorType={item.action}
        description="Путь до файла для запуска или папки для открытия в проводнике"//eslint-disable-line max-len
        onChange={onPathSelectorChange}
      />
      <ArgumentsBlock
        args={item.args!}
        parent={fieldName}
        className="developer-screen__item"
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
