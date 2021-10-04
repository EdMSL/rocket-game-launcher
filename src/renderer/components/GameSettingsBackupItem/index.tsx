import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';

import styles from './styles.module.scss';
import {
  IBackupFile, IMainRootState,
} from '$types/main';
import { Button } from '$components/UI/Button';
import { Checkbox } from '$components/UI/Checkbox';
import { openFolder } from '$utils/process';
import { getPathToParentFileFolder } from '$utils/strings';
import { deleteGameSettingsFilesBackup, restoreGameSettingsFilesBackup } from '$actions/main';

interface IProps {
  backupName: string,
  backupFiles: IBackupFile[],
  isGameSettingsFilesBackuping: IMainRootState['isGameSettingsFilesBackuping'],
  sendErrorMessage: (message: string) => void,
}

export const GameSettingsBackupItem: React.FC<IProps> = ({
  backupName,
  backupFiles,
  isGameSettingsFilesBackuping,
  sendErrorMessage,
}) => {
  const dispatch = useDispatch();

  const [selectedBackupFiles, setSelectedBackupFiles] = useState<string[]>([]);

  const onBackupEditBtn = useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();

    dispatch(deleteGameSettingsFilesBackup(event.currentTarget.id.split('-')[1]));
  }, [dispatch]);

  const onBackupDeleteBtn = useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();

    dispatch(deleteGameSettingsFilesBackup(event.currentTarget.id.split('-')[1]));
  }, [dispatch]);

  const onOpenOriginalFileDirectoryBtnClick = useCallback(({ currentTarget }) => {
    openFolder(getPathToParentFileFolder(currentTarget.innerText), sendErrorMessage);
  }, [sendErrorMessage]);

  const onFileInputChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const newSelectedFiles = target.checked
      ? [...selectedBackupFiles, target.id]
      : selectedBackupFiles.filter((fileId) => fileId !== target.id);

    setSelectedBackupFiles(newSelectedFiles);
  }, [selectedBackupFiles]);

  const onAllFilesInputChange = useCallback(({ target }) => {
    const newSelectedFiles = target.checked
      ? backupFiles.map((file) => file.id)
      : [];

    setSelectedBackupFiles(newSelectedFiles);
  }, [backupFiles]);

  const onRestoreBackupBtnClick = useCallback(() => {
    const filesForRestore = selectedBackupFiles.map(
      (fileId) => backupFiles.find((backupFile) => backupFile.id === fileId)!,
    );

    dispatch(restoreGameSettingsFilesBackup({
      name: backupName,
      files: filesForRestore,
    }));

    setSelectedBackupFiles([]);
  }, [dispatch, selectedBackupFiles, backupName, backupFiles]);

  return (
    <li className={styles['game-settings-backup__item-container']}>
      <details className={styles['game-settings-backup__item']}>
        <summary className={styles['game-settings-backup__title']}>
          <span className={styles['game-settings-backup__title-text']}>
            {backupName}
          </span>
          <Button
            className={classNames(
              styles['game-settings-backup__item-btn--edit'],
              styles['game-settings-backup__item-btn'],
            )}
            onClick={onBackupEditBtn}
          >
            Редактировать
          </Button>
          <Button
            className={classNames(
              styles['game-settings-backup__item-btn--delete'],
              styles['game-settings-backup__item-btn'],
            )}
            onClick={onBackupDeleteBtn}
          >
            Удалить
          </Button>
        </summary>
        <ul className={styles['game-settings-backup__item-list']}>
          <li className={styles['game-settings-backup__file']}>
            <Checkbox
              className={styles['game-settings-backup__checkbox-block']}
              id={`selectall-${backupName}`}
              label="Выбрать все"
              isChecked={(
                selectedBackupFiles.length === backupFiles.length)
                || false}
              onChange={onAllFilesInputChange}
            />
          </li>
          {
            backupFiles.map((file) => (
              <li
                key={`key-${file.name}`}
                className={styles['game-settings-backup__file']}
              >
                <Checkbox
                  className={styles['game-settings-backup__checkbox-block']}
                  id={file.id}
                  label={file.name}
                  isChecked={
                    selectedBackupFiles.includes(file.id)
                    || false
                  }
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
          id={`restore-${backupName}`}
          isDisabled={
            isGameSettingsFilesBackuping
            || selectedBackupFiles.length === 0
          }
          onClick={onRestoreBackupBtnClick}
        >
          Восстановить выбранное
        </Button>
      </details>
    </li>
  );
};
