import React, { useCallback } from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { PathRegExp, PathVariableName } from '$constants/misc';
import { PathSelector } from '$components/UI/PathSelector';
import { IPathVariables } from '$constants/paths';
import { generateSelectOptions } from '$utils/data';
import { Button } from '$components/UI/Button';

interface IProps {
  args: string[],
  parent: string,
  pathVariables: IPathVariables,
  className?: string,
  changeArguments: (newArgs: string[], parent: string) => void,
  onPathError: () => void,
}

export const ArgumentsBlock: React.FC<IProps> = ({
  args,
  parent,
  pathVariables,
  className = '',
  changeArguments,
  onPathError,
}) => {
  const onPathSelectorChange = useCallback((value: string|undefined, id: string) => {
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
        );
      }
    } else {
      onPathError();
    }
  }, [args, parent, changeArguments, onPathError]);

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
        ? `${PathVariableName.GAME_DIR}\\`
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
      <p className={styles['developer-screen__agrs-title']}>Аргументы запуска</p>
      <div className={styles['developer-screen__agrs-block']}>
        {
        args.map((currentArg, index) => (
          <div className={styles['developer-screen__agrs-item']}>
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
                  <input
                    className={classNames('text-field__input')}
                    type="text"
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
