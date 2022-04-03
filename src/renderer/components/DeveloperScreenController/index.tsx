import React from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { Button } from '$components/UI/Button';

interface IProps {
  isFirstLaunch: boolean,
  isConfigChanged: boolean,
  isHaveValidationErrors: boolean,
  isUpdateBtnDisabled?: boolean,
  onSaveBtnClick: (event: React.MouseEvent<HTMLButtonElement>) => void,
  onCancelBtnClick: (event: React.MouseEvent<HTMLButtonElement>) => void,
  onResetBtnClick: (event: React.MouseEvent<HTMLButtonElement>) => void,
  onUpdateBtnClick: (event: React.MouseEvent<HTMLButtonElement>) => void,
}

export const DeveloperScreenController: React.FC<IProps> = ({
  isFirstLaunch,
  isConfigChanged,
  isHaveValidationErrors,
  isUpdateBtnDisabled = false,
  onSaveBtnClick,
  onCancelBtnClick,
  onResetBtnClick,
  onUpdateBtnClick,
}) => (
  <div className={styles['develover-screen__controller']}>
    <Button
      id="ok_save_config_btn"
      className={classNames(
        'main-btn',
        'control-panel__btn',
      )}
      isDisabled={!isFirstLaunch && (!isConfigChanged || isHaveValidationErrors)}
      onClick={onSaveBtnClick}
    >
      ОК
    </Button>
    <Button
      id="save_config_btn"
      className={classNames(
        'main-btn',
        'control-panel__btn',
      )}
      isDisabled={isFirstLaunch}
      onClick={onCancelBtnClick}
    >
      Отмена
    </Button>
    <Button
      className={classNames(
        'main-btn',
        'control-panel__btn',
      )}
      isDisabled={!isFirstLaunch && (!isConfigChanged || isHaveValidationErrors)}
      onClick={onSaveBtnClick}
    >
      Сохранить
    </Button>
    <Button
      className={classNames(
        'main-btn',
        'control-panel__btn',
      )}
      isDisabled={!isConfigChanged}
      onClick={onResetBtnClick}
    >
      Сбросить
    </Button>
    {
      !isUpdateBtnDisabled && (
      <Button
        className={classNames(
          'main-btn',
          'control-panel__btn',
        )}
        onClick={onUpdateBtnClick}
      >
        Обновить
      </Button>
      )
    }
  </div>
);
