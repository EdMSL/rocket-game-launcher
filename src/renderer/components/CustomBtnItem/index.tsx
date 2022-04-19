import React, {
  useCallback, useEffect, useRef,
} from 'react';
import classNames from 'classnames';

import { Checkbox } from '$components/UI/Checkbox';
import { PathSelector } from '$components/UI/PathSelector';
import { TextField } from '$components/UI/TextField';
import { IButtonArg, ILauncherCustomButton } from '$types/main';
import {
  PathVariableName,
  LauncherButtonAction,
} from '$constants/misc';
import { generateSelectOptions, getUniqueValidationErrors } from '$utils/data';
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
  lastItemId: string,
  deleteBtnItem: (id: string) => void,
  сhangeBtnData: (btnId: string, newBtnData: ILauncherCustomButton) => void,
  onValidationError: (errors: IValidationErrors) => void,
}

export const CustomBtnItem: React.FC<IProps> = ({
  item,
  validationErrors,
  pathVariables,
  lastItemId,
  сhangeBtnData,
  deleteBtnItem,
  onValidationError,
}) => {
  const detailsElementRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (item.id === lastItemId) {
      detailsElementRef.current?.setAttribute('open', 'open');
    }
  }, [item.id, lastItemId]);

  const onCheckboxChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const newSelectorType = target.checked ? LauncherButtonAction.RUN : LauncherButtonAction.OPEN;
    const isPathCorrect = getIsPathWithVariableCorrect(item.path, newSelectorType);

    сhangeBtnData(item.id, {
      ...item,
      [target.name]: newSelectorType,
    });

    onValidationError(getUniqueValidationErrors(
      validationErrors,
      { [`path_${item.id}`]: ['incorrect path'] },
      !isPathCorrect,
    ));
  }, [item, validationErrors, onValidationError, сhangeBtnData]);

  const OnTextFieldChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    сhangeBtnData(item.id, {
      ...item,
      [target.name]: target.value,
    });
  }, [item, сhangeBtnData]);

  const onPathSelectorChange = useCallback((
    value: string,
    id: string,
    validationData: IValidationData,
  ) => {
    if (value) {
      сhangeBtnData(item.id, {
        ...item,
        path: value,
      });

      onValidationError(getUniqueValidationErrors(
        validationErrors,
        validationData.errors,
        validationData.isForAdd,
      ));
    }
  }, [item, validationErrors, onValidationError, сhangeBtnData]);

  const onChangeArguments = useCallback((
    newArgs: IButtonArg[],
  ) => {
    сhangeBtnData(item.id, {
      ...item,
      args: newArgs,
    });
  }, [item, сhangeBtnData]);

  const onDeleteCustomBtnBtnClick = useCallback(() => {
    deleteBtnItem(item.id);
  }, [deleteBtnItem, item.id]);

  return (
    <React.Fragment>
      <TextField
        className="developer-screen__item"
        id={`label_${item.id}`}
        name="label"
        value={item.label}
        label="Заголовок кнопки"
        description="Текст, который будет отображаться на данной кнопке запуска"
        onChange={OnTextFieldChange}
      />
      <Checkbox
        id={`action_${item.id}`}
        className="developer-screen__item"
        name="action"
        label="Кнопка запуска приложения?"
        isChecked={item.action === LauncherButtonAction.RUN}
        description="Определяет действие по нажатию кнопки: запуск приложения\файла или открытие папки. Влияет на доступный выбор в селекторе пути ниже"//eslint-disable-line max-len
        onChange={onCheckboxChange}
      />
      <PathSelector
        className="developer-screen__item"
        id={`path_${item.id}`}
        name="path"
        label="Путь до файла\папки"
        value={item.path}
        options={generateSelectOptions([PathVariableName.GAME_DIR])}
        pathVariables={pathVariables}
        selectorType={item.action}
        description="Путь до файла для запуска или папки для открытия в проводнике"
        validationErrors={validationErrors[`path_${item.id}`]}
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
        onValidationError={onValidationError}
      />
      <Button
        className={classNames(
          'main-btn',
          'developer-screen__spoiler-button',
        )}
        onClick={onDeleteCustomBtnBtnClick}
      >
        Удалить
      </Button>
    </React.Fragment>
  );
};
