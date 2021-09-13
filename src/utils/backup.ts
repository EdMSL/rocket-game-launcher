import fs from 'fs';
import path from 'path';

import {
  BACKUP_DIR, BACKUP_DIR_GAME_SETTINGS_FILES, GAME_DIR,
} from '$constants/paths';
import { getBackupFolderName } from './data';
import { getReadWriteError, ReadWriteError } from './errors';
import {
  LogMessageType, writeToLogFileSync,
} from './log';
import { createCopyFileSync, writeFileDataSync } from './files';

export const createBackupFolder = (directoryPath: string): void => {
  try {
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
    }
  } catch (error: any) {
    const readWriteError = getReadWriteError(error, true);

    throw new ReadWriteError(
      `Can't create backup folder. ${readWriteError.message}`,
      readWriteError,
      directoryPath,
    );
  }
};

export const createBackupFolders = (): void => {
  try {
    createBackupFolder(BACKUP_DIR);
    createBackupFolder(path.join(BACKUP_DIR, 'game_settings_files'));
  } catch (error: any) {
    writeToLogFileSync(
      `Message: ${error.message}. Path: '${error.path}'.`,
      LogMessageType.ERROR,
    );

    throw error;
  }
};

export const GameSettingsFilesBackup = (files: string[]): void => {
  createBackupFolders();
  const folderName = getBackupFolderName();

  fs.mkdirSync(path.join(BACKUP_DIR_GAME_SETTINGS_FILES, folderName));

  const filePaths = files.map((file) => {
    if (!path.isAbsolute(file) && process.env.NODE_ENV === 'production') {
      return path.join(GAME_DIR, file);
    }

    return file;
  });

  writeFileDataSync(path.join(BACKUP_DIR_GAME_SETTINGS_FILES, folderName, 'path.txt'), filePaths.join('\n'));

  filePaths.forEach((file) => {
    createCopyFileSync(
      file,
      path.join(BACKUP_DIR_GAME_SETTINGS_FILES, folderName, path.basename(file)),
    );
  });
};
