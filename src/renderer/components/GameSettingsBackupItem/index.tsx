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
import { getPathToParentFileFolder, isValidName } from '$utils/strings';
import {
  deleteGameSettingsFilesBackup,
  renameGameSettingsFilesBackup,
  restoreGameSettingsFilesBackup,
} from '$actions/main';

interface IProps {
  backupName: string,
  backupFiles: IBackupFile[],
  allBackups: string[],
  isGameSettingsFilesBackuping: IMainRootState['isGameSettingsFilesBackuping'],
  sendErrorMessage: (message: string) => void,
}

export const GameSettingsBackupItem: React.FC<IProps> = ({
  backupName,
  backupFiles,
  allBackups,
  isGameSettingsFilesBackuping,
  sendErrorMessage,
}) => {
  const dispatch = useDispatch();

  const nameInput = useRef<HTMLInputElement>(null);
  const backupSummary = useRef<HTMLDetailsElement>(null);

  const [selectedBackupFiles, setSelectedBackupFiles] = useState<string[]>([]);
  const [isEditBackupNameMode, setIsEditBackupNameMode] = useState<boolean>(false);
  const [currentBackupName, setCurrentBackupName] = useState<string>('');
  const [isBackupNameError, setIsBackupNameError] = useState<boolean>(false);

  const cancelBackupRename = useCallback(() => {
    setCurrentBackupName('');
    setIsEditBackupNameMode(false);
    setIsBackupNameError(false);
  }, []);

  const onEscKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Escape') {
      cancelBackupRename();
      backupSummary.current?.focus();
    }
  }, [cancelBackupRename]);

  // При нажатии пробела summary сворачивается\разворачивается.
  // Для этого отключаем этот функционал, когда инпут внутри него в фокусе.
  const onSpaceKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space' && document.activeElement === nameInput.current) {
      event.preventDefault();
    }
  }, []);

  useEffect(() => {
    const input = nameInput.current;
    const summary = backupSummary.current;

    nameInput.current?.addEventListener('keyup', onEscKeyPress);
    backupSummary.current?.addEventListener('keyup', onSpaceKeyPress);

    return (): void => {
      if (input !== null) {
        input.removeEventListener('keyup', onEscKeyPress);
      }

      if (summary !== null) {
        summary.removeEventListener('keyup', onSpaceKeyPress);
      }
    };
    // Нам не нужно перерисовывать компонент при изменении значений в nameInput,
    // нужно лишь повесить обработчик, когда он будет смонтирован, так как он изначально null
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onEscKeyPress, onSpaceKeyPress, nameInput.current]);

  const onBackupEditBtnClick = useCallback(() => {
    setIsEditBackupNameMode(true);
  }, []);

  const onBackupConfirmBtnClick = useCallback(() => {
    dispatch(renameGameSettingsFilesBackup(backupName, currentBackupName.trim()));
    setIsEditBackupNameMode(false);
    setCurrentBackupName('');
  }, [dispatch, backupName, currentBackupName]);

  const onBackupCancelBtnClick = useCallback(() => {
    cancelBackupRename();
  }, [cancelBackupRename]);

  const onBackupDeleteBtnClick = useCallback(() => {
    dispatch(deleteGameSettingsFilesBackup(backupName));
  }, [dispatch, backupName]);

  const onBackupNameInputChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    if (
      allBackups.includes(target.value.trim().toLocaleLowerCase())
      || !isValidName(target.value)
      || (target.value.length > 0 && target.value.trim().length === 0)
    ) {
      setIsBackupNameError(true);
    } else {
      setIsBackupNameError(false);
    }

    setCurrentBackupName(target.value);
  }, [allBackups]);

  const onFormSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isBackupNameError && currentBackupName) {
      onBackupConfirmBtnClick();
    }
  }, [isBackupNameError, currentBackupName, onBackupConfirmBtnClick]);

  const onOpenOriginalFileDirectoryBtnClick = useCallback(({ currentTarget }) => {
    openFolder(getPathToParentFileFolder(currentTarget.innerText), sendErrorMessage);
  }, [sendErrorMessage]);

  const onBackupFileCheckboxChange = useCallback((
    { target }: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newSelectedFiles = target.checked
      ? [...selectedBackupFiles, target.id]
      : selectedBackupFiles.filter((fileId) => fileId !== target.id);

    setSelectedBackupFiles(newSelectedFiles);
  }, [selectedBackupFiles]);

  const onBackupNameInputBlur = useCallback(() => {
    cancelBackupRename();
  }, [cancelBackupRename]);

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
      <details
        className={styles['game-settings-backup__item']}
      >
        <summary
          className={styles['game-settings-backup__title']}
          ref={backupSummary}
        >
          {
            isEditBackupNameMode && (
              <React.Fragment>
                <form
                  className={styles['game-settings-backup__form']}
                  onSubmit={onFormSubmit}
                >
                  <input
                    className={classNames(
                      styles['game-settings-backup__name-field'],
                      isBackupNameError && styles['game-settings-backup__name-field--error'],
                    )}
                    ref={nameInput}
                    type="text"
                    placeholder={backupName}
                    value={currentBackupName}
                    autoFocus
                    onChange={onBackupNameInputChange}
                    // onBlur={onBackupNameInputBlur}
                  />
                </form>
                <Button
                  className={classNames(
                    styles['game-settings-backup__item-btn--confirm'],
                    styles['game-settings-backup__item-btn'],
                  )}
                  isDisabled={!currentBackupName || isBackupNameError}
                  onClick={onBackupConfirmBtnClick}
                >
                  Принять
                </Button>
                <Button
                  className={classNames(
                    styles['game-settings-backup__item-btn--cancel'],
                    styles['game-settings-backup__item-btn'],
                  )}
                  onClick={onBackupCancelBtnClick}
                >
                  Отменить
                </Button>
              </React.Fragment>
            )
          }
          {
            !isEditBackupNameMode && (
              <React.Fragment>
                <span className={styles['game-settings-backup__title-text']}>
                  {backupName}
                </span>
                <Button
                  className={classNames(
                    styles['game-settings-backup__item-btn--edit'],
                    styles['game-settings-backup__item-btn'],
                  )}
                  isDisabled={isEditBackupNameMode}
                  onClick={onBackupEditBtnClick}
                >
                  Редактировать
                </Button>
                <Button
                  className={classNames(
                    styles['game-settings-backup__item-btn--delete'],
                    styles['game-settings-backup__item-btn'],
                  )}
                  onClick={onBackupDeleteBtnClick}
                >
                  Удалить
                </Button>
              </React.Fragment>
            )
          }
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
