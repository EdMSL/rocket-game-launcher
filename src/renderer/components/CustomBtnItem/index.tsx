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
import {
  getIsPathWithVariableCorrect,
  IValidationData,
} from '$utils/check';
import { IValidationErrors } from '$types/common';

interface IProps {
  item: ILauncherCustomButton,
  pathVariables: IPathVariables,
  validationErrors: IValidationErrors,
  onDeleteBtnClick: (id: string) => void,
  onChangeBtnData: (
    newBtnData: ILauncherCustomButton,
    validationData: IValidationData,
  ) => void,
  onPathError: () => void,
}

export const CustomBtnItem: React.FC<IProps> = ({
  item,
  validationErrors,
  pathVariables,
  onChangeBtnData,
  onDeleteBtnClick,
  onPathError,
}) => {
  const onCheckboxChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const newSelectorType = target.checked ? LauncherButtonAction.RUN : LauncherButtonAction.OPEN;
    const isPathCorrect = getIsPathWithVariableCorrect(item.path, newSelectorType);

    onChangeBtnData({
      ...item,
      action: newSelectorType,
    },
    { errors: { [`item-path_${item.id}`]: ['incorrect path'] }, isForAdd: !isPathCorrect });
  }, [item, onChangeBtnData]);

  const OnTextFieldChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    onChangeBtnData({ ...item, label: target.value }, { errors: {}, isForAdd: false });
  }, [item, onChangeBtnData]);

  const onPathSelectorChange = useCallback((
    value: string,
    id: string,
    validationData: IValidationData,
  ) => {
    if (value) {
      onChangeBtnData({ ...item, path: value }, validationData);
    }
  }, [item, onChangeBtnData]);

  const onDeleteCustomBtnBtnClick = useCallback(() => {
    onDeleteBtnClick(item.id);
  }, [onDeleteBtnClick, item.id]);

  const onChangeArguments = useCallback((
    newArgs: IButtonArg[],
    parent: string,
    validationData: IValidationData,
  ) => {
    onChangeBtnData({ ...item, args: newArgs }, validationData);
  }, [item, onChangeBtnData]);

  return (
    <li className={styles['developer-screen__custom-btn-item']}>
      <TextField
        className="developer-screen__item"
        id={`item-label_${item.id}`}
        name="custom-btn-label"
        value={item.label}
        label="Заголовок кнопки"
        description="Текст, который будет отображаться на данной кнопке запуска"
        onChange={OnTextFieldChange}
      />
      <Checkbox
        className="developer-screen__item"
        id={`item-checkbox_${item.id}`}
        label="Кнопка запуска приложения?"
        isChecked={item.action === LauncherButtonAction.RUN}
        description="Определяет действие по нажатию кнопки: запуск приложения\файла или открытие папки. Влияет на доступный выбор в селекторе пути ниже"//eslint-disable-line max-len
        onChange={onCheckboxChange}
      />
      <PathSelector
        className="developer-screen__item"
        id={`item-path_${item.id}`}
        label="Путь до файла\папки"
        value={item.path}
        options={generateSelectOptions([PathVariableName.GAME_DIR])}
        pathVariables={pathVariables}
        selectorType={item.action}
        description="Путь до файла для запуска или папки для открытия в проводнике"
        validationErrors={validationErrors[`item-path_${item.id}`]}
        onChange={onPathSelectorChange}
      />
      <ArgumentsBlock
        args={item.args!}
        parent="customButtons"
        className="developer-screen__item"
        pathVariables={pathVariables}
        description="Дополнительные агрументы запуска"
        validationErrors={validationErrors}
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
