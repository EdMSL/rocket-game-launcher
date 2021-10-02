import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';

import styles from './styles.module.scss';
import { Button } from '$components/UI/Button';
import { Checkbox } from '$components/UI/Checkbox';
import { BACKUP_DIR_GAME_SETTINGS_FILES } from '$constants/paths';
import { openFolder } from '$utils/process';
import {
  addMessages,
  createGameSettingsFilesBackup,
  deleteGameSettingsFilesBackup,
  getGameSettingsFilesBackup,
  restoreGameSettingsFilesBackup,
} from '$actions/main';
import { CreateUserMessage } from '$utils/message';
import { IMainRootState } from '$types/main';
import { Loader } from '$components/UI/Loader';
import { getPathToParentFileFolder } from '$utils/strings';

interface ISelectedFiles {
  [key: string]: string[],
}

interface IProps {
  gameSettingsFilesBackup: IMainRootState['gameSettingsFilesBackup'],
  isGameSettingsFilesBackuping: IMainRootState['isGameSettingsFilesBackuping'],
  onCreateBackupBtnClick?: () => void,
  onCancelBtnClick?: () => void,
}

export const GameSettingsBackup: React.FC<IProps> = ({
  gameSettingsFilesBackup,
  isGameSettingsFilesBackuping,
  onCreateBackupBtnClick,
  onCancelBtnClick: onCancelBtnClickProp,
}) => {
  const [selectedBackupFiles, setSelectedBackupFiles] = useState<ISelectedFiles>({});

  const dispatch = useDispatch();

  const sendErrorMessage = useCallback((message: string) => {
    dispatch(addMessages([CreateUserMessage.error(message)]));
  }, [dispatch]);

  const onRestoreBackupBtnClick = useCallback(({ currentTarget }: React.SyntheticEvent) => {
    const folderName = currentTarget.id.split('-')[1];

    const filesPathForRestore = selectedBackupFiles[folderName].map((file) => {
      const backup = gameSettingsFilesBackup.find((backupFolder) => backupFolder.name === folderName)!;

      return backup.files.find((backupFile) => backupFile.name === file)!;
    });

    dispatch(restoreGameSettingsFilesBackup({
      name: folderName,
      files: filesPathForRestore,
    }));

    setSelectedBackupFiles({
      ...selectedBackupFiles,
      [folderName]: [],
    });
  }, [dispatch, selectedBackupFiles, gameSettingsFilesBackup]);

  const onBackupDeleteBtn = useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();

    dispatch(deleteGameSettingsFilesBackup(event.currentTarget.id.split('-')[1]));
  }, [dispatch]);

  const onRefreshBackupsBtnClick = useCallback(() => {
    dispatch(getGameSettingsFilesBackup());
  }, [dispatch]);

  const onSelectAllFilesInputChange = useCallback(({ target }) => {
    const selectedFilesFolder: string = target.id.split('-')[1];
    const newFilesArr = target.checked
      ? gameSettingsFilesBackup.find((backup) => backup.name === selectedFilesFolder)!.files.map((file) => file.name)
      : [];

    const newSelectedFiles = {
      ...selectedBackupFiles,
      [selectedFilesFolder]: newFilesArr,
    };

    setSelectedBackupFiles(newSelectedFiles);
  }, [selectedBackupFiles, gameSettingsFilesBackup]);

  const onFileInputChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const fileArr = target.id.split('&');
    const newFilesArr = target.checked
      ? [...selectedBackupFiles[fileArr[0]] ? selectedBackupFiles[fileArr[0]] : [], fileArr[1]]
      : selectedBackupFiles[fileArr[0]].filter((file) => file !== fileArr[1]);

    const newSelectedFiles = {
      ...selectedBackupFiles,
      [fileArr[0]]: newFilesArr,
    };

    setSelectedBackupFiles(newSelectedFiles);
  }, [selectedBackupFiles]);

  const onCancelBtnClick = useCallback(() => {
    if (onCancelBtnClickProp) {
      onCancelBtnClickProp();
    }
  }, [onCancelBtnClickProp]);

  const onCreateBackupWithRefreshBtnClick = useCallback(() => {
    if (onCreateBackupBtnClick) {
      onCreateBackupBtnClick();
    } else {
      dispatch(createGameSettingsFilesBackup(true));
    }
  }, [dispatch, onCreateBackupBtnClick]);

  const onOpenBackupFolderBtnClick = useCallback(() => {
    openFolder(BACKUP_DIR_GAME_SETTINGS_FILES, sendErrorMessage);
  }, [sendErrorMessage]);

  const onOpenOriginalFileDirectoryBtnClick = useCallback(({ currentTarget }) => {
    openFolder(getPathToParentFileFolder(currentTarget.innerText), sendErrorMessage);
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
                      <li className={styles['game-settings-backup__item-container']}>
                        <details className={styles['game-settings-backup__item']}>
                          <summary className={styles['game-settings-backup__title']}>
                            <span className={styles['game-settings-backup__title-text']}>
                              {backupFolder.name}
                            </span>
                            <Button
                              className={styles['game-settings-backup__delete-btn']}
                              id={`delete-${backupFolder.name}`}
                              onClick={onBackupDeleteBtn}
                            >
                              Удалить
                            </Button>
                          </summary>
                          <ul className={styles['game-settings-backup__item-list']}>
                            <li className={styles['game-settings-backup__file']}>
                              <Checkbox
                                className={styles['game-settings-backup__checkbox-block']}
                                id={`selectall-${backupFolder.name}`}
                                label="Выбрать все"
                                isChecked={(
                                  selectedBackupFiles[backupFolder.name]
                                  && selectedBackupFiles[backupFolder.name].length === backupFolder.files.length)
                                  || false}
                                onChange={onSelectAllFilesInputChange}
                              />
                            </li>
                            {
                              backupFolder.files.map((file) => (
                                <li
                                  key={`key-${file.name}`}
                                  className={styles['game-settings-backup__file']}
                                >
                                  <Checkbox
                                    className={styles['game-settings-backup__checkbox-block']}
                                    id={`${backupFolder.name}&${file.name}`}
                                    label={file.name}
                                    isChecked={(selectedBackupFiles[backupFolder.name]
                                      && selectedBackupFiles[backupFolder.name].includes(file.name))
                                      || false}
                                    onChange={onFileInputChange}
                                  />
                                  <Button
                                    className={styles['game-settings-backup__path']}
                                    onClick={onOpenOriginalFileDirectoryBtnClick}
                                  >
                                    {file.path}
                                  </Button>
                                </li>
                              ))
                            }
                          </ul>
                          <Button
                            className={classNames(
                              'main-btn',
                              styles['game-settings-backup__restore-btn'],
                            )}
                            id={`restore-${backupFolder.name}`}
                            isDisabled={
                              isGameSettingsFilesBackuping
                              || !selectedBackupFiles[backupFolder.name]
                              || selectedBackupFiles[backupFolder.name].length === 0
                            }
                            onClick={onRestoreBackupBtnClick}
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
            <div className={styles['game-settings-backup__controls']}>
              <Button
                className={classNames('main-btn', styles['game-settings-backup__btn'])}
                onClick={onCreateBackupWithRefreshBtnClick}
              >
                Создать бэкап
              </Button>
              <Button
                className={classNames('main-btn', styles['game-settings-backup__btn'])}
                onClick={onRefreshBackupsBtnClick}
              >
                Обновить
              </Button>
              <Button
                className={classNames('main-btn', styles['game-settings-backup__btn'])}
                onClick={onOpenBackupFolderBtnClick}
              >
                Открыть папку с бэкапами
              </Button>
              <Button
                className={classNames('main-btn', styles['settings__main-btn'])}
                isDisabled={isGameSettingsFilesBackuping}
                onClick={onCancelBtnClick}
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
