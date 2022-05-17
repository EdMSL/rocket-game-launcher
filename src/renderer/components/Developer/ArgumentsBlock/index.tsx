import React, { useCallback, useState } from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';
import {
  LauncherButtonAction, PathRegExp, PathVariableName,
} from '$constants/misc';
import { PathSelector } from '$components/UI/PathSelector';
import { IPathVariables } from '$constants/paths';
import { generateSelectOptions } from '$utils/data';
import { Button } from '$components/UI/Button';
import { TextField } from '$components/UI/TextField';
import { HintItem } from '$components/HintItem';
import { IButtonArg } from '$types/main';
import { getRandomId } from '$utils/strings';
import { IValidationData } from '$utils/check';
import {
  clearValidationErrors, getUniqueValidationErrors, IValidationErrors, ValidationErrorCause,
} from '$utils/validation';

interface IProps {
  className?: string,
  args: IButtonArg[],
  parent: string,
  parentId?: string,
  pathVariables: IPathVariables,
  validationErrors: IValidationErrors,
  description?: string,
  changeArguments: (newArgs: IButtonArg[], parent: string) => void,
  onValidationError: (errors: IValidationErrors) => void,
}

export const ArgumentsBlock: React.FC<IProps> = ({
  className = '',
  args,
  parent,
  parentId = parent,
  pathVariables,
  description,
  validationErrors,
  changeArguments,
  onValidationError,
}) => {
  const [lastAddedStringArg, setLastAddedStringArg] = useState<string>('');

  const onPathSelectorChange = useCallback((
    value: string,
    id: string,
    validationData: IValidationData,
  ) => {
    if (value) {
      changeArguments(
        args.map((currentArg) => {
          if (currentArg.id === id) {
            return {
              id,
              data: value,
            };
          }

          return currentArg;
        }),
        parent,
      );

      onValidationError(getUniqueValidationErrors(
        validationErrors,
        { ...validationData.errors, [`${parentId}_${id}`]: [{ cause: ValidationErrorCause.ARG }] },
        validationData.isForAdd,
      ));
    }
  }, [args, parent, parentId, validationErrors, changeArguments, onValidationError]);

  const onArgumentTextFieldChange = useCallback((
    { target }: React.ChangeEvent<HTMLInputElement>,
  ) => {
    changeArguments(
      args.map((currentArg) => {
        if (currentArg.id === target.id) {
          return {
            id: target.id,
            data: target.value,
          };
        }

        return currentArg;
      }),
      parent,
    );

    if (target.required) {
      onValidationError(getUniqueValidationErrors(
        validationErrors,
        {
          [target.id]: [{ cause: ValidationErrorCause.PATH }],
          [`${parentId}_${target.id}`]: [{ cause: ValidationErrorCause.ARG }],
        },
        target.value.trim() === '',
      ));
    }
  }, [args, parent, parentId, validationErrors, changeArguments, onValidationError]);

  const onDeleteArgBtnClick = useCallback(({
    currentTarget,
  }: React.MouseEvent<HTMLButtonElement>) => {
    changeArguments(
      args.filter((currentArg) => currentArg.id !== currentTarget.name),
      parent,
    );

    setLastAddedStringArg('');
    onValidationError(clearValidationErrors(validationErrors, currentTarget.name));
  }, [args, parent, validationErrors, changeArguments, onValidationError]);

  const OnAddArgumentBtnClick = useCallback(({
    currentTarget,
  }: React.MouseEvent<HTMLButtonElement>) => {
    const newId = getRandomId();
    const newArgs = [
      ...args,
      {
        id: newId,
        data: currentTarget.name === 'add-arg-path'
          ? `${PathVariableName.GAME_DIR}\\example.exe`
          : '-string',
      },
    ];

    if (currentTarget.name === 'add-arg-string') {
      setLastAddedStringArg(newId);
    }

    changeArguments(newArgs, parent);
  }, [args, parent, changeArguments]);

  return (
    <div className={classNames(
      styles.arguments__container,
      className,
    )}
    >
      <div className={styles.arguments__title}>
        <span>Аргументы запуска</span>
        {
          description && <HintItem description={description} />
        }
      </div>
      <div className={styles.arguments__block}>
        <ul className={styles.arguments__list}>
          {
          args.map((currentArg) => (
            <li
              key={currentArg.id}
              className={styles.arguments__item}
            >
              {
                PathRegExp.PATH_VARIABLE.test(currentArg.data)
                  ? (
                    <PathSelector
                      id={currentArg.id}
                      value={currentArg.data}
                      selectPathVariables={generateSelectOptions([PathVariableName.GAME_DIR])}
                      pathVariables={pathVariables}
                      selectorType={LauncherButtonAction.RUN}
                      validationErrors={validationErrors}
                      onChange={onPathSelectorChange}
                    />
                    )
                  : (
                    <TextField
                      id={currentArg.id}
                      isFocus={currentArg.id === lastAddedStringArg}
                      isSelect={currentArg.id === lastAddedStringArg}
                      value={currentArg.data}
                      isRequied
                      validationErrors={validationErrors}
                      onChange={onArgumentTextFieldChange}
                    />
                    )
              }
              <Button
                name={currentArg.id}
                className={styles.arguments__delete}
                onClick={onDeleteArgBtnClick}
              >
                Удалить
              </Button>
            </li>
          ))
          }
        </ul>
        <div className={styles.arguments__buttons}>
          <Button
            name="add-arg-path"
            className={classNames('main-btn', styles.arguments__button)}
            onClick={OnAddArgumentBtnClick}
          >
            <div className={styles['arguments__button-inner']}>
              {/* eslint-disable */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              {/* eslint-enable */}
              <span>Путь</span>
            </div>
          </Button>
          <Button
            name="add-arg-string"
            className={classNames('main-btn', styles.arguments__button)}
            onClick={OnAddArgumentBtnClick}
          >
            <div className={styles['arguments__button-inner']}>
              {/* eslint-disable */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              {/* eslint-enable */}
              <span>Строка</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};
