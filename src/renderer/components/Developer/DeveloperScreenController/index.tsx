import React, { useCallback } from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { Button } from '$components/UI/Button';
import { Routes } from '$constants/routes';

interface IProps {
  isFirstStart: boolean,
  isConfigChanged: boolean,
  isHaveValidationErrors: boolean,
  isUpdateBtnEnabled: boolean,
  saveChanges: (pathToGo: string) => void,
  onCancelBtnClick: (event: React.MouseEvent<HTMLButtonElement>) => void,
  onResetBtnClick: (event: React.MouseEvent<HTMLButtonElement>) => void,
  onUpdateBtnClick: (event: React.MouseEvent<HTMLButtonElement>) => void,
}

export const DeveloperScreenController: React.FC<IProps> = ({
  isFirstStart,
  isConfigChanged,
  isHaveValidationErrors,
  isUpdateBtnEnabled,
  saveChanges,
  onCancelBtnClick,
  onResetBtnClick,
  onUpdateBtnClick,
}) => {
  const onSaveBtnClick = useCallback(({ currentTarget }: React.MouseEvent<HTMLButtonElement>) => {
    saveChanges(currentTarget.name === 'ok_save_config_btn' ? Routes.MAIN_SCREEN : '');
  }, [saveChanges]);

  return (
    <div className={styles.develover__controller}>
      <Button
        name="ok_save_config_btn"
        className={classNames(
          'main-btn',
          styles['develover__controller-btn'],
        )}
        isDisabled={!isFirstStart && (!isConfigChanged || isHaveValidationErrors)}
        onClick={onSaveBtnClick}
      >
        ОК
      </Button>
      <Button
        name="save_config_btn"
        className={classNames(
          'main-btn',
          styles['develover__controller-btn'],
        )}
        isDisabled={isFirstStart}
        onClick={onCancelBtnClick}
      >
        Отмена
      </Button>
      <Button
        className={classNames(
          'main-btn',
          styles['develover__controller-btn'],
        )}
        isDisabled={!isFirstStart && (!isConfigChanged || isHaveValidationErrors)}
        onClick={onSaveBtnClick}
      >
        Сохранить
      </Button>
      <Button
        className={classNames(
          'main-btn',
          styles['develover__controller-btn'],
        )}
        isDisabled={!isConfigChanged}
        onClick={onResetBtnClick}
      >
        Сбросить
      </Button>
      {
      isUpdateBtnEnabled && (
      <Button
        className={classNames(
          'main-btn',
          styles['develover__controller-btn'],
        )}
        onClick={onUpdateBtnClick}
      >
        Обновить
      </Button>
      )
    }
    </div>
  );
};
