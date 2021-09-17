import React from 'react';

import styles from './styles.module.scss';
import { Button } from '$components/UI/Button';

interface IProps {
  isGameOptionsChanged: boolean,
  isBackuping: boolean,
  isSaving: boolean,
  onCancelSettingsBtnClick: () => void,
  onCreateBackupBtnClick: () => void,
  onBackupsBtnClick: () => void,
}

export const GameSettingsFormControls: React.FunctionComponent<IProps> = ({
  isGameOptionsChanged,
  isBackuping,
  isSaving,
  onCancelSettingsBtnClick,
  onCreateBackupBtnClick,
  onBackupsBtnClick,
}) => (
  <div className={styles['game-settings-form__buttons']}>
    <Button
      className={styles['game-settings-form__btn']}
      isSubmit
      isDisabled={isGameOptionsChanged || isBackuping || isSaving}
    >
      Сохранить
    </Button>
    <Button
      className={styles['game-settings-form__btn']}
      isDisabled={isGameOptionsChanged || isBackuping || isSaving}
      onClick={onCancelSettingsBtnClick}
    >
      Сбросить
    </Button>
    <Button
      className={styles['game-settings-form__btn']}
      onClick={onCreateBackupBtnClick}
      isDisabled={isBackuping || isSaving}
    >
      Создать бэкап
    </Button>
    <Button
      className={styles['game-settings-form__btn']}
      onClick={onBackupsBtnClick}
      isDisabled={isBackuping || isSaving}
    >
      Бэкапы
    </Button>
  </div>
);
