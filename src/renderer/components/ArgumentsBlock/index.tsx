import React, { useCallback } from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { PathRegExp, PathVariableName } from '$constants/misc';
import { PathSelector } from '$components/UI/PathSelector';
import { IPathVariables } from '$constants/paths';
import { generateSelectOptions } from '$utils/data';
import { Button } from '$components/UI/Button';
import { TextField } from '$components/UI/TextField';
import { HintItem } from '$components/HintItem';

interface IProps {
  className?: string,
  args: string[],
  parent: string,
  pathVariables: IPathVariables,
  description?: string,
  changeArguments: (newArgs: string[], parent: string, isValidationError?: boolean) => void,
  onPathError: () => void,
}

export const ArgumentsBlock: React.FC<IProps> = ({
  className = '',
  args,
  parent,
  pathVariables,
  description,
  changeArguments,
}) => {
  const onPathSelectorChange = useCallback((
    value: string|undefined,
    isValidationError: boolean,
    id: string,
  ) => {
    if (value !== undefined) {
      if (value !== '') {
        changeArguments(
          args.map((currentArg, index) => {
            if (index === Number(id.split('-')[2])) {
              return value;
            }

            return currentArg;
          }),
          parent,
          isValidationError,
        );
      }
    }
  }, [args, parent, changeArguments]);

  const onArgumentTextFieldChange = useCallback((
    { target }: React.ChangeEvent<HTMLInputElement>,
  ) => {
    changeArguments(
      args.map((currentArg, index) => {
        if (index === Number(target.id.split('-')[2])) {
          return target.value;
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
      args.filter((currentArg, index) => index !== Number(currentTarget.id.split('-')[2])),
      parent,
    );
  }, [args, parent, changeArguments]);

  const OnAddArgumentBtnClick = useCallback(({
    currentTarget,
  }: React.MouseEvent<HTMLButtonElement>) => {
    const newArgs = [...args,
      currentTarget.id === `${parent}-add_arg_path`
        ? `${PathVariableName.GAME_DIR}\\example.exe`
        : '',
    ];

    changeArguments(newArgs, parent);
  }, [args, parent, changeArguments]);

  return (
    <div className={classNames(
      styles['developer-screen__args'],
      className,
    )}
    >
      <p className={styles['developer-screen__agrs-title']}>
        <span>Аргументы запуска</span>
        {
          description && <HintItem description={description} />
        }
      </p>
      <div className={styles['developer-screen__agrs-block']}>
        {
        args.map((currentArg, index) => (
          <div
            className={styles['developer-screen__agrs-item']}
            key={`${parent}-${index}`} //eslint-disable-line react/no-array-index-key
          >
            {
              PathRegExp.PATH_VARIABLE_REGEXP.test(currentArg)
                ? (
                  <PathSelector
                    id={`${parent}-arg-${index}`}
                    value={currentArg}
                    options={generateSelectOptions([PathVariableName.GAME_DIR])}
                    pathVariables={pathVariables}
                    isSelectFile
                    onChange={onPathSelectorChange}
                  />
                  )
                : (
                  <TextField
                    id={`${parent}-arg-${index}`}
                    value={currentArg}
                    onChange={onArgumentTextFieldChange}
                  />
                  )
            }
            <Button
              id={`${parent}-arg_delete-${index}`}
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
            id={`${parent}-add_arg_path`}
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
            id={`${parent}-add_arg_str`}
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
