import React from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { Button } from '$components/UI/Button';

interface IProps {
  isGameOptionsChanged: boolean,
  isBackuping: boolean,
  isSaving: boolean,
  onRefreshSettingsBtnClick: () => void,
  onCancelSettingsBtnClick: () => void,
  onCreateBackupBtnClick: () => void,
  onBackupsBtnClick: () => void,
}

export const GameSettingsFormControls: React.FunctionComponent<IProps> = ({
  isGameOptionsChanged,
  isBackuping,
  isSaving,
  onRefreshSettingsBtnClick,
  onCancelSettingsBtnClick,
  onCreateBackupBtnClick,
  onBackupsBtnClick,
}) => (
  <div className={styles['game-settings-form__buttons']}>
    <Button
      className={classNames('main-btn', styles['game-settings-form__btn'])}
      isSubmit
      isDisabled={isGameOptionsChanged || isBackuping || isSaving}
    >
      Сохранить
    </Button>
    <Button
      className={classNames('main-btn', styles['game-settings-form__btn'])}
      isDisabled={isGameOptionsChanged || isBackuping || isSaving}
      onClick={onCancelSettingsBtnClick}
    >
      Сбросить
    </Button>
    <Button
      className={classNames('main-btn', styles['game-settings-form__btn'])}
      isDisabled={isBackuping || isSaving}
      onClick={onRefreshSettingsBtnClick}
    >
      Обновить
    </Button>
    <Button
      className={classNames('main-btn', styles['game-settings-form__btn'])}
      onClick={onCreateBackupBtnClick}
      isDisabled={isBackuping || isSaving}
    >
      Создать бэкап
    </Button>
    <Button
      className={classNames('main-btn', styles['game-settings-form__btn'])}
      onClick={onBackupsBtnClick}
      isDisabled={isBackuping || isSaving}
    >
      Бэкапы
    </Button>
  </div>
);
