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
  onDeleteBtnClick: (id: string) => void,
  onChangeBtnData: (newBtnData: ILauncherCustomButton) => void,
  onValidationError: (errors: IValidationErrors) => void,
}

export const CustomBtnItem: React.FC<IProps> = ({
  item,
  validationErrors,
  pathVariables,
  onChangeBtnData,
  onDeleteBtnClick,
  onValidationError,
}) => {
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

  const onDeleteCustomBtnBtnClick = useCallback(() => {
    onDeleteBtnClick(item.id);
  }, [onDeleteBtnClick, item.id]);

  const onChangeArguments = useCallback((
    newArgs: IButtonArg[],
  ) => {
    onChangeBtnData({ ...item, args: newArgs });
  }, [item, onChangeBtnData]);

  return (
    <li className={styles['custom-btn__item']}>
      <details
        className={styles['custom-btn__block']}
      >
        <summary className={classNames(
          styles['custom-btn-title'],
          Object.keys(validationErrors).find((error) => error.includes(item.id)) && styles['custom-btn-title--error'],
        )}
        >
          <span className={styles['custom-btn-text']}>Заголовок:</span>
          <span className={styles['custom-btn-text']}>{item.label}</span>
          <span className={styles['custom-btn-text']}>Путь:</span>
          <span className={styles['custom-btn-text']}>{item.path}</span>
          <Button
            className={classNames(
              styles['custom-btn__title-btn'],
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
            'custom-btn__button',
          )}
          onClick={onDeleteCustomBtnBtnClick}
        >
          Удалить
        </Button>
      </details>
    </li>
  );
};
