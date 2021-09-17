import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';

import styles from './styles.module.scss';
import { Button } from '$components/UI/Button';
import { Checkbox } from '$components/UI/Checkbox';
import { BACKUP_DIR } from '$constants/paths';
import { openFolder } from '$utils/process';
import { addMessages } from '$actions/main';
import { CreateUserMessage } from '$utils/message';
import { IMainRootState } from '$types/main';
import { Loader } from '$components/UI/Loader';

interface ISelectedFiles {
  [key: string]: string[],
}

interface IProps {
  gameSettingsFilesBackup: IMainRootState['gameSettingsFilesBackup'],
  isGameSettingsFilesBackuping: IMainRootState['isGameSettingsFilesBackuping'],
  onCloseBtnClick: () => void,
}

export const GameSettingsBackup: React.FC<IProps> = ({
  gameSettingsFilesBackup,
  isGameSettingsFilesBackuping,
  onCloseBtnClick,
}) => {
  const [selectedBackupFiles, setSelectedBackupFiles] = useState<ISelectedFiles>({});

  const dispatch = useDispatch();

  const sendErrorMessage = useCallback((message: string) => {
    dispatch(addMessages([CreateUserMessage.error(message)]));
  }, [dispatch]);

  const onRestoreBackupBtnClick = useCallback(() => {}, []);
  const onBackupDeleteBtn = useCallback(() => {}, []);
  const onSelectAllFilesInputChange = useCallback(() => {}, []);
  const onRefreshBackupsBtnClick = useCallback(() => {}, []);
  const onFileInputChange = useCallback(() => {}, []);

  const onOpenBackupFolderBtnClick = useCallback(() => {
    openFolder(BACKUP_DIR, sendErrorMessage);
  }, [sendErrorMessage]);

  return (
    <div className={styles['game-settings-backup__container']}>
      {
        !isGameSettingsFilesBackuping && (
          <React.Fragment>
            <ul className={styles['game-settings-backup__list']}>
              {
                gameSettingsFilesBackup.length > 0
                  ? gameSettingsFilesBackup.map((backupFolder) => (
                    <React.Fragment key={backupFolder.name}>
                      <li className={styles['game-settings-backup__item']}>
                        <details>
                          <summary className={styles['settings__backup-title']}>
                            {backupFolder.name}
                            <Button
                              className={styles['game-settings-backup__btn']}
                              id={`delete-${backupFolder.name}`}
                              onClick={onBackupDeleteBtn}
                            >
                              Удалить
                            </Button>
                          </summary>
                          <ul className={styles['settings__backup-list']}>
                            <li
                              className={styles['settings__backup-item']}
                            >
                              <Checkbox
                                classNameCheckbox={styles.setting__checkbox}
                                id={`selectall-${backupFolder.name}`}
                                label="Выбрать все"
                                isChecked={(selectedBackupFiles[backupFolder.name] && selectedBackupFiles[backupFolder.name].length === backupFolder.files.length) || false}
                                onChange={onSelectAllFilesInputChange}
                              />
                            </li>
                            {
                          backupFolder.files.map((file) => (
                            <li
                              key={`key-${file.name}`}
                              className={styles['settings__backup-item']}
                            >
                              <Checkbox
                                classNameCheckbox={styles.setting__checkbox}
                                id={`${backupFolder.name}&${file.name}`}
                                label={file.name}
                                isChecked={(selectedBackupFiles[backupFolder.name] && selectedBackupFiles[backupFolder.name].includes(file.name)) || false}
                                onChange={onFileInputChange}
                              />
                            </li>
                          ))
                        }
                          </ul>
                          <Button
                            className={classNames('button', 'main-btn')}
                            onClick={onRestoreBackupBtnClick}
                            id={`restore-${backupFolder.name}`}
                            isDisabled={isGameSettingsFilesBackuping || !selectedBackupFiles[backupFolder.name] || selectedBackupFiles[backupFolder.name].length === 0}
                          >
                            Восстановить выбранное
                          </Button>
                        </details>
                      </li>
                    </React.Fragment>
                  ))
                  : <li className={styles['game-settings-backup__item']}>Нет доступных бэкапов</li>
              }
            </ul>
            <div>
              <Button
                className={classNames('button', 'main-btn', styles['settings__main-btn'])}
                onClick={onOpenBackupFolderBtnClick}
              >
                Открыть папку с бэкапами
              </Button>
              <Button
                className={classNames(styles['settings__backup-btn'], isGameSettingsFilesBackuping && styles['settings__backup-btn--refresh'])}
                onClick={onRefreshBackupsBtnClick}
                isDisabled={isGameSettingsFilesBackuping}
              >
                Восстановить из бэкапа
              </Button>
              <Button
                className={classNames(styles['settings__backup-btn'], isGameSettingsFilesBackuping && styles['settings__backup-btn--refresh'])}
                onClick={onCloseBtnClick}
                isDisabled={isGameSettingsFilesBackuping}
              >
                Отмена
              </Button>
            </div>
          </React.Fragment>
        )
      }
      {
        isGameSettingsFilesBackuping && <Loader />
      }
    </div>
  );
};
