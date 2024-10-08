import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';

import styles from './styles.module.scss';
import { Button } from '$components/UI/Button';
import { BACKUP_DIR_GAME_SETTINGS_FILES } from '$constants/paths';
import { openFolder } from '$utils/process';
import {
  addMessages,
  createGameSettingsFilesBackup,
  getGameSettingsFilesBackup,
} from '$actions/main';
import { CreateUserMessage } from '$utils/message';
import { IMainRootState } from '$types/main';
import { Loader } from '$components/UI/Loader';
import { GameSettingsBackupItem } from '$components/App/GameSettingsBackupItem';
import { ScrollbarsBlock } from '$components/UI/ScrollbarsBlock';

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
  const dispatch = useDispatch();

  const gameSettingsBackupsNames = gameSettingsFilesBackup.map(
    (backup) => backup.name.toLowerCase(),
  );

  const sendErrorMessage = useCallback((message: string) => {
    dispatch(addMessages([CreateUserMessage.error(message)]));
  }, [dispatch]);

  const onRefreshBackupsBtnClick = useCallback(() => {
    dispatch(getGameSettingsFilesBackup());
  }, [dispatch]);

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

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <div className={styles['game-settings-backup__container']}>
      <React.Fragment>
        <ul className={styles['game-settings-backup__list']}>
          <ScrollbarsBlock>
            {
              gameSettingsFilesBackup.length > 0
                ? gameSettingsFilesBackup.map((backupFolder) => (
                  <GameSettingsBackupItem
                    key={backupFolder.id}
                    id={backupFolder.id}
                    backupName={backupFolder.name}
                    backupFiles={backupFolder.files}
                    allBackups={gameSettingsBackupsNames}
                    isGameSettingsFilesBackuping={isGameSettingsFilesBackuping}
                    sendErrorMessage={sendErrorMessage}
                  />
                ))
                : <li className={styles['game-settings-backup__item']}>Нет доступных бэкапов</li>
            }
          </ScrollbarsBlock>
        </ul>
        <div className={styles['game-settings-backup__controls']}>
          <Button
            className={classNames('main-btn', styles['game-settings-backup__btn'])}
            isDisabled={isGameSettingsFilesBackuping}
            onClick={onCreateBackupWithRefreshBtnClick}
          >
            Создать бэкап
          </Button>
          <Button
            className={classNames('main-btn', styles['game-settings-backup__btn'])}
            isDisabled={isGameSettingsFilesBackuping}
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
            className={classNames('main-btn', styles['game-settings-backup__btn'])}
            isDisabled={isGameSettingsFilesBackuping}
            onClick={onCancelBtnClick}
          >
            Отмена
          </Button>
        </div>
        {
          isGameSettingsFilesBackuping && <Loader />
        }
      </React.Fragment>
    </div>
  );
};
