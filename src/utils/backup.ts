import fs from 'fs';
import path from 'path';

import {
  BACKUP_DIR, BACKUP_DIR_GAME_SETTINGS_FILES, GAME_DIR,
} from '$constants/paths';
import { getBackupFolderName } from './data';
import { LogMessageType, writeToLogFile } from './log';
import {
  createCopyFileSync, createFolderSync, writeFileDataSync,
} from './files';
import { CustomError, ReadWriteError } from './errors';

export const createBackupFolders = (isThrowError = false): void => {
  try {
    createFolderSync(BACKUP_DIR);
    createFolderSync(path.join(BACKUP_DIR, 'game_settings_files', 'sdf'));
  } catch (error: any) {
    let errorMsg = error.message;

    if (error instanceof ReadWriteError) {
      errorMsg = `Failed to create backup folders. ${error.message}. Path: '${error.path}'.`;
    }

    if (isThrowError) {
      throw new CustomError(errorMsg);
    } else {
      writeToLogFile(errorMsg, LogMessageType.WARNING);
    }
  }
};

export const GameSettingsFilesBackup = (files: string[]): void => {
  createBackupFolders(true);
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
