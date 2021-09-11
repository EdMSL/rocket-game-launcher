import React from 'react';

import styles from './styles.module.scss';
import { Button } from '$components/UI/Button';

interface IProps {
  isDisabled: boolean,
  isGameSettingsFilesBackuping: boolean,
  onCancelSettingsBtnClick: () => void,
  onCreateBackupBtnClick: () => void,
}

export const GameSettingsFormControls: React.FunctionComponent<IProps> = ({
  isDisabled,
  isGameSettingsFilesBackuping,
  onCancelSettingsBtnClick,
  onCreateBackupBtnClick,
}) => (
  <div className={styles['game-settings-form__buttons']}>
    <Button
      className={styles['game-settings-form__btn']}
      isSubmit
      isDisabled={isDisabled}
    >
      Сохранить
    </Button>
    <Button
      className={styles['game-settings-form__btn']}
      isDisabled={isDisabled}
      onClick={onCancelSettingsBtnClick}
    >
      Сбросить
    </Button>
    <Button
      className={styles['game-settings-form__btn']}
      onClick={onCreateBackupBtnClick}
      isDisabled={isGameSettingsFilesBackuping}
    >
      Создать бэкап
    </Button>
  </div>
);
