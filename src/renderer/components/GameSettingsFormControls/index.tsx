import React from 'react';

import styles from './styles.module.scss';
import { Button } from '$components/UI/Button';

interface IProps {
  isGameOptionsChanged: boolean,
  isBackuping: boolean,
  isSaving: boolean,
  onCancelSettingsBtnClick: () => void,
  onCreateBackupBtnClick: () => void,
}

export const GameSettingsFormControls: React.FunctionComponent<IProps> = ({
  isGameOptionsChanged,
  isBackuping,
  isSaving,
  onCancelSettingsBtnClick,
  onCreateBackupBtnClick,
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
  </div>
);
