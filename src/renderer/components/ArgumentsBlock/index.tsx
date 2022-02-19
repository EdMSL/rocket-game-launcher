import React, { useCallback } from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { CustomPathName, DefaultCustomPathName } from '$constants/misc';
import { PathSelector } from '$components/UI/PathSelector';
import { GAME_DIR } from '$constants/paths';
import { clearRootDirFromPathString } from '$utils/strings';
import { generateSelectOptions } from '$utils/data';
import { Button } from '$components/UI/Button';

interface IProps {
  args: string[],
  parent: string,
  className?: string,
  addArgumentItem: (id: string) => void,
}

export const ArgumentsBlock: React.FC<IProps> = ({
  args,
  parent,
  className = '',
  addArgumentItem,
}) => {
  const onSelectPathTextInputChange = useCallback(() => {}, []);
  const onSelectPathBtnClick = useCallback(() => {}, []);
  const OnAddArgumentBtnClick = useCallback(({ currentTarget }: React.MouseEvent<HTMLButtonElement>) => {
    addArgumentItem(currentTarget.id);
  }, [addArgumentItem]);
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
              CustomPathName.PATH_VARIABLE_REGEXP.test(currentArg)
                ? (
                  <PathSelector
                    // className={styles['developer-screen__agrs-item']}
                    id={`play_btn_arg${index}`}
                    parent={parent}
                    value={clearRootDirFromPathString(currentArg, GAME_DIR)}
                    options={generateSelectOptions([DefaultCustomPathName.GAME_DIR])}
                    onChange={onSelectPathTextInputChange}
                    onButtonClick={onSelectPathBtnClick}
                  />
                  )
                : (
                  <input
                    className={classNames('text-field__input')}
                    type="text"
                    id={`play_btn_arg${index}`}
                    value={currentArg}
                    onChange={onSelectPathTextInputChange}
                  />
                  )
            }
            <Button className={styles['developer-screen__args-delete-btn']}>Удалить</Button>
          </div>
        ))
        }
        <div className={styles['developer-screen__agrs-btns']}>
          <Button
            id="add_arg_path"
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
            id="add_arg_str"
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
