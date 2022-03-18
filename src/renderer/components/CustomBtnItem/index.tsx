import React, {
  useCallback, useEffect, useRef,
} from 'react';
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
  position: number,
  quantity: number,
  pathVariables: IPathVariables,
  validationErrors: IValidationErrors,
  lastItemId: string,
  onDeleteBtnClick: (id: string) => void,
  onChangeBtnData: (newBtnData: ILauncherCustomButton) => void,
  onChangeBtnOrder: (position: number, isUpInOrder: boolean) => void,
  onValidationError: (errors: IValidationErrors) => void,
}

export const CustomBtnItem: React.FC<IProps> = ({
  item,
  position,
  quantity,
  validationErrors,
  pathVariables,
  lastItemId,
  onChangeBtnData,
  onDeleteBtnClick,
  onChangeBtnOrder,
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

    onChangeBtnData({
      ...item,
      action: newSelectorType,
    });

    onValidationError(getUniqueValidationErrors(
      validationErrors,
      { [`item-path_${item.id}`]: ['incorrect path'] },
      !isPathCorrect,
    ));
  }, [item, validationErrors, onValidationError, onChangeBtnData]);

  const OnTextFieldChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    onChangeBtnData({ ...item, label: target.value });
  }, [item, onChangeBtnData]);

  const onPathSelectorChange = useCallback((
    value: string,
    id: string,
    validationData: IValidationData,
  ) => {
    if (value) {
      onChangeBtnData({ ...item, path: value });

      onValidationError(getUniqueValidationErrors(
        validationErrors,
        validationData.errors,
        validationData.isForAdd,
      ));
    }
  }, [item, validationErrors, onValidationError, onChangeBtnData]);

  const onChangeArguments = useCallback((
    newArgs: IButtonArg[],
  ) => {
    onChangeBtnData({ ...item, args: newArgs });
  }, [item, onChangeBtnData]);

  const onDeleteCustomBtnBtnClick = useCallback(() => {
    onDeleteBtnClick(item.id);
  }, [onDeleteBtnClick, item.id]);

  const onChangeButtonsOrderBtnClick = useCallback((
    { currentTarget }: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onChangeBtnOrder(position, currentTarget.name === 'up');
  }, [position, onChangeBtnOrder]);

  return (
    <li className={classNames('developer-screen__spoiler-item', styles['custom-btn__item'])}>
      <details
        className="developer-screen__spoiler-block"
        ref={detailsElementRef}
      >
        <summary className={classNames(
          'developer-screen__spoiler-title',
          Object.keys(validationErrors).find((error) => error.includes(item.id))
            && 'developer-screen__spoiler-title--error',
        )}
        >
          <span className="developer-screen__spoiler-text">Заголовок:</span>
          <span className="developer-screen__spoiler-text">{item.label}</span>
          <span className="developer-screen__spoiler-text">Путь:</span>
          <span className="developer-screen__spoiler-text">{item.path}</span>
          <Button
            className={classNames(
              'developer-screen__spoiler-title-btn',
              'developer-screen__spoiler-title-btn--up',
            )}
            name="up"
            isDisabled={quantity === 1 || position === 0}
            onClick={onChangeButtonsOrderBtnClick}
          >
            Вверх
          </Button>
          <Button
            className={classNames(
              'developer-screen__spoiler-title-btn',
              'developer-screen__spoiler-title-btn--down',
            )}
            name="down"
            isDisabled={quantity === 1 || position === quantity - 1}
            onClick={onChangeButtonsOrderBtnClick}
          >
            Вниз
          </Button>
          <Button
            className={classNames(
              'developer-screen__spoiler-title-btn',
              'developer-screen__spoiler-title-btn--delete',
            )}
            onClick={onDeleteCustomBtnBtnClick}
          >
            Удалить
          </Button>
        </summary>
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
          parentId={item.id}
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
      </details>
    </li>
  );
};
