import React, { useCallback } from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';
import {
  LauncherButtonAction, PathRegExp, PathVariableName,
} from '$constants/misc';
import { PathSelector } from '$components/UI/PathSelector';
import { IPathVariables } from '$constants/paths';
import { generateSelectOptions, getUniqueValidationErrors } from '$utils/data';
import { Button } from '$components/UI/Button';
import { TextField } from '$components/UI/TextField';
import { HintItem } from '$components/HintItem';
import { IButtonArg } from '$types/main';
import { getRandomId } from '$utils/strings';
import { IValidationData } from '$utils/check';
import { IValidationErrors } from '$types/common';

interface IProps {
  className?: string,
  args: IButtonArg[],
  parent: string,
  pathVariables: IPathVariables,
  description?: string,
  validationErrors: IValidationErrors,
  changeArguments: (newArgs: IButtonArg[], parent: string) => void,
  onValidationError: (errors: IValidationErrors) => void,
}

export const ArgumentsBlock: React.FC<IProps> = ({
  className = '',
  args,
  parent,
  pathVariables,
  description,
  validationErrors,
  changeArguments,
  onValidationError,
}) => {
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
        validationData.errors,
        validationData.isForAdd,
      ));
    }
  }, [args, parent, validationErrors, changeArguments, onValidationError]);

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
  }, [args, parent, changeArguments]);

  const onDeleteArgBtnClick = useCallback(({
    currentTarget,
  }: React.MouseEvent<HTMLButtonElement>) => {
    changeArguments(
      args.filter((currentArg) => currentArg.id !== currentTarget.id.split(':')[1]),
      parent,
    );
  }, [args, parent, changeArguments]);

  const OnAddArgumentBtnClick = useCallback(({
    currentTarget,
  }: React.MouseEvent<HTMLButtonElement>) => {
    const newArgs = [
      ...args,
      {
        id: getRandomId(`${parent}-arg`),
        data: currentTarget.name === 'add-arg-path'
          ? `${PathVariableName.GAME_DIR}\\example.exe`
          : '',
      },
    ];

    changeArguments(newArgs, parent);
  }, [args, parent, changeArguments]);

  return (
    <div className={classNames(
      styles['developer-screen__args'],
      className,
    )}
    >
      <div className={styles['developer-screen__agrs-title']}>
        <span>Аргументы запуска</span>
        {
          description && <HintItem description={description} />
        }
      </div>
      <div className={styles['developer-screen__agrs-block']}>
        {
        args.map((currentArg) => (
          <div
            className={styles['developer-screen__agrs-item']}
            key={currentArg.id}
          >
            {
              PathRegExp.PATH_VARIABLE_REGEXP.test(currentArg.data)
                ? (
                  <PathSelector
                    id={currentArg.id}
                    name="btn-arg-input"
                    value={currentArg.data}
                    options={generateSelectOptions([PathVariableName.GAME_DIR])}
                    pathVariables={pathVariables}
                    selectorType={LauncherButtonAction.RUN}
                    validationErrors={validationErrors[currentArg.id]}
                    onChange={onPathSelectorChange}
                  />
                  )
                : (
                  <TextField
                    id={currentArg.id}
                    name="btn-arg-input"
                    value={currentArg.data}
                    onChange={onArgumentTextFieldChange}
                  />
                  )
            }
            <Button
              id={`delete:${currentArg.id}`}
              className={styles['developer-screen__args-delete-btn']}
              onClick={onDeleteArgBtnClick}
            >
              Удалить
            </Button>
          </div>
        ))
        }
        <div className={styles['developer-screen__agrs-btns']}>
          <Button
            name="add-arg-path"
            className={classNames('main-btn', styles['developer-screen__agrs-btn'])}
            onClick={OnAddArgumentBtnClick}
          >
            <div className={styles['developer-screen__agrs-btn-inner']}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  d="M0 0h24v24H0z"
                  fill="none"
                />
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              <span>Путь</span>
            </div>
          </Button>
          <Button
            name="add-arg-string"
            className={classNames('main-btn', styles['developer-screen__agrs-btn'])}
            onClick={OnAddArgumentBtnClick}
          >
            <div className={styles['developer-screen__agrs-btn-inner']}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  d="M0 0h24v24H0z"
                  fill="none"
                />
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              <span>Строка</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};
