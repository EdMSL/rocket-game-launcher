import fs from 'fs';
import path from 'path';

import {
  GAME_DIR,
  BACKUP_DIR,
  BACKUP_DIR_GAME_SETTINGS_FILES,
} from '$constants/paths';
import { getBackupFolderName } from './data';
import { LogMessageType, writeToLogFile } from './log';
import {
  createCopyFileSync,
  createFolderSync,
  deleteFile,
  deleteFolder,
  readDirectory,
  readFileData,
  writeFileDataSync,
} from './files';
import { CustomError, ReadWriteError } from './errors';
import { IBackupFiles, IUserMessage } from '$types/main';
import { CreateUserMessage } from './message';

export const createBackupFolders = (isThrowError = false): void => {
  try {
    createFolderSync(BACKUP_DIR);
    createFolderSync(BACKUP_DIR_GAME_SETTINGS_FILES);
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

export const createGameSettingsFilesBackup = (files: string[]): void => {
  createBackupFolders(true);
  const folderName = getBackupFolderName();

  fs.mkdirSync(path.join(BACKUP_DIR_GAME_SETTINGS_FILES, folderName));

  const filePaths = files.map((file) => {
    if (!path.isAbsolute(file) && process.env.NODE_ENV === 'production') {
      return path.join(GAME_DIR, file);
    }

    return file;
  });

  writeFileDataSync(
    path.join(BACKUP_DIR_GAME_SETTINGS_FILES, folderName, 'path.txt'),
    filePaths.join('\n'),
  );

  filePaths.forEach((file) => {
    createCopyFileSync(
      file,
      path.join(BACKUP_DIR_GAME_SETTINGS_FILES, folderName, path.basename(file)),
    );
  });
};

export const readBackupFolder = async (folderName: string): Promise<IBackupFiles> => {
  const files = await readDirectory(path.join(BACKUP_DIR_GAME_SETTINGS_FILES, folderName));

  // > 1 т.к. в папке есть path.txt со списком файлов.
  if (files.length > 1) {
    if (fs.existsSync(path.join(BACKUP_DIR_GAME_SETTINGS_FILES, folderName, 'path.txt'))) {
      const fileDataResult = readFileData(path.join(
        BACKUP_DIR_GAME_SETTINGS_FILES,
        folderName,
        'path.txt',
      ));
      const pathFileData = fileDataResult.toString().split('\n');
      const newFiles = files.filter((file) => file !== 'path.txt').map((file) => {
        const pathToFile = pathFileData.find((currFile) => currFile.includes(file));

        return {
          name: file,
          path: pathToFile!,
        };
      });

      return {
        name: folderName,
        files: newFiles,
      };
    }

    writeToLogFile(
      `Can't find "path.txt" file in "${folderName}" backup folder.`,
      LogMessageType.WARNING,
    );

    throw new Error();
  }

  writeToLogFile(
    `There are no files in the "${folderName}" backup folder.`,
    LogMessageType.WARNING,
  );

  throw new Error();
};

export const getGameSettingsFilesBackups = async (): Promise<IBackupFiles[]> => {
  const backupFolders = await readDirectory(BACKUP_DIR_GAME_SETTINGS_FILES);

  if (backupFolders.length > 0) {
    const readFolderResult = await Promise.allSettled(backupFolders.map((file) => readBackupFolder(path.join(file))));
    const files = readFolderResult
      .filter((result) => result.status === 'fulfilled')
      .map((folderResult) => (folderResult as PromiseFulfilledResult<IBackupFiles>).value);

    return files;
  }

  return [];
};

export const deleteGameSettingsFilesBackup = async (
  backupFolderName: string,
): Promise<IUserMessage[]> => {
  const resultMessage: IUserMessage[] = [];
  const pathToFolder = path.join(BACKUP_DIR_GAME_SETTINGS_FILES, backupFolderName);

  const backupFolderFiles = await readDirectory(pathToFolder);

  const deleteResult = await Promise.allSettled(
    backupFolderFiles.map(
      (fileName) => deleteFile(
        path.join(pathToFolder, fileName),
      ),
    ),
  );

  const deleteResultsWithError = deleteResult.filter((result) => result.status === 'rejected');

  if (deleteResultsWithError.length > 0) {
    const errorsMessages = deleteResultsWithError.map((result) => (result as PromiseRejectedResult).status);

    writeToLogFile(errorsMessages.join('\n'), LogMessageType.ERROR);

    resultMessage.push(CreateUserMessage.error('Возникла ошибка в процессе удаления файлов бэкапа. Подробности в файле лога.')); //eslint-disable-line max-len
  }

  await deleteFolder(pathToFolder);

  return resultMessage;
};
