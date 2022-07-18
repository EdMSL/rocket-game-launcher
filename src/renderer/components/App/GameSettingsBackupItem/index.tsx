import React, {
  useCallback, useState, useEffect, useRef,
} from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';

import styles from './styles.module.scss';
import {
  IBackupFile, IMainRootState,
} from '$types/main';
import { Button } from '$components/UI/Button';
import { Checkbox } from '$components/UI/Checkbox';
import { openFolder } from '$utils/process';
import { isValidFolderName } from '$utils/validation';
import {
  deleteGameSettingsFilesBackup,
  renameGameSettingsFilesBackup,
  restoreGameSettingsFilesBackup,
} from '$actions/main';
import { EditableItem } from '$components/Developer/EditableItem';

interface IProps {
  id: string,
  backupName: string,
  backupFiles: IBackupFile[],
  allBackups: string[],
  isGameSettingsFilesBackuping: IMainRootState['isGameSettingsFilesBackuping'],
  sendErrorMessage: (message: string) => void,
}

export const GameSettingsBackupItem: React.FC<IProps> = ({
  id,
  backupName,
  backupFiles,
  allBackups,
  isGameSettingsFilesBackuping,
  sendErrorMessage,
}) => {
  const dispatch = useDispatch();

  const backupSummary = useRef<HTMLDetailsElement>(null);

  const [selectedBackupFiles, setSelectedBackupFiles] = useState<string[]>([]);
  const [isBackupNameError, setIsBackupNameError] = useState<boolean>(false);

  // При нажатии пробела summary сворачивается\разворачивается.
  // Для этого отключаем этот функционал, когда инпут внутри него в фокусе.
  const onSpaceKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault();
    }
  }, []);

  useEffect(() => {
    const summary = backupSummary.current;

    backupSummary.current?.addEventListener('keyup', onSpaceKeyPress);

    return (): void => {
      summary?.removeEventListener('keyup', onSpaceKeyPress);
    };
  }, [onSpaceKeyPress]);

  const onBackupDeleteBtnClick = useCallback(() => {
    dispatch(deleteGameSettingsFilesBackup(backupName));
  }, [dispatch, backupName]);

  const changeBackupName = useCallback((value: string) => {
    if (
      (
        allBackups.includes(value.trim().toLowerCase())
        && backupName.toLowerCase() !== value.trim().toLowerCase()
      )
      || !isValidFolderName(value)
      || (value.length > 0 && value.trim().length === 0)
    ) {
      setIsBackupNameError(true);
    } else {
      setIsBackupNameError(false);
    }
  }, [allBackups, backupName]);

  const renameBackup = useCallback((newName: string) => {
    if (!isBackupNameError && newName && backupName !== newName) {
      dispatch(renameGameSettingsFilesBackup(backupName, newName.trim()));
    }
  }, [dispatch, backupName, isBackupNameError]);

  const onOpenOriginalFileDirectoryBtnClick = useCallback(({ currentTarget }) => {
    openFolder(currentTarget.innerText, sendErrorMessage, true);
  }, [sendErrorMessage]);

  const onBackupFileCheckboxChange = useCallback((
    { target }: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
      id,
      name: backupName,
      files: filesForRestore,
    }));

    setSelectedBackupFiles([]);
  }, [dispatch, id, selectedBackupFiles, backupName, backupFiles]);

  return (
    <li className={styles['game-settings-backup__item-container']}>
      <details
        className={styles['game-settings-backup__item']}
      >
        <summary
          className={styles['game-settings-backup__title']}
          ref={backupSummary}
        >
          <EditableItem
            id={backupName}
            item={backupName}
            isError={isBackupNameError}
            placeholder={backupName}
            onApply={renameBackup}
            onDelete={onBackupDeleteBtnClick}
            onChange={changeBackupName}
          />
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
                  onChange={onBackupFileCheckboxChange}
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
