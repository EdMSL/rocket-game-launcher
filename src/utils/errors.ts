import { dialog, shell } from 'electron';

export const reportLink = 'https://rubarius.ru/forums/topic/631-%D0%BE%D1%88%D0%B8%D0%B1%D0%BA%D0%B8/'; //eslint-disable-line

export const ErrorMessage = {
  DEFAULT: "There's been an error",
  ACCESS: 'Permission denied',
  FILE_NOT_FOUND: 'File not found',
  DIRECTORY_NOT_FOUND: 'No such directory',
  PATH_TO_DIRECTORY: 'Got path to directory, not file',
  PATH_TO_FILE: 'Got path to file, not directory',
  ARG_TYPE: 'Invalid data in path received',
  MIME_TYPE: 'Invalid file extension',
};

export const ErrorName = {
  SYNTAX: 'SyntaxError',
  NOT_FOUND: 'NotFoundError',
  ACCESS: 'AccessError',
  ARG_TYPE: 'InvalidArgumentError',
  PATH_TO_DIRECTORY: 'DirectoryError',
  PATH_TO_FILE: 'NotDirectoryError',
  READ_WRITE: 'ReadWriteError',
  SAGA_ERROR: 'SagaError',
  MIME_TYPE: 'IncorrectFileTypeError',
  VALIDATION: 'ValidationTypeError',
};

export const ErrorCode = {
  ACCESS: 'EACCES',
  NOT_FOUND: 'ENOENT',
  PATH_TO_DIRECTORY: 'EISDIR',
  PATH_TO_FILE: 'ENOTDIR',
  ARG_TYPE: 'ERR_INVALID_ARG_TYPE',
  UNKNOWN: 'UNKNOWN',
};

/**
 * Показать модальное нативное окно Electron с ошибкой.
 * @param error Текст ошибки.
 * @param title Заголовок окна.
*/
export const showErrorBox = (message: string, title = ErrorMessage.DEFAULT): void => {
  dialog.showErrorBox(title, message);
};

/**
 * Показать модальное нативное окно с выбранным типом.
 * @param error Текст ошибки.
 * @param title Заголовок окна.
 * @param type Тип окна: `info`, `warning` или `error`.
*/
export const showMessageBox = (
  message: string,
  title = ErrorMessage.DEFAULT,
  type = 'info',
): void => {
  dialog.showMessageBox({
    message, title, type,
  });
};

export interface IReadWriteError extends Error {
  cause: Error,
}

export class CustomError extends Error {
  public code?: string;

  constructor(message: string, name = 'Error', code?: string) {
    super(message);
    this.name = name;
    this.code = code;
  }
}

export class ReadWriteError extends Error {
  public cause: Error;
  public path: string;

  constructor(message: string, cause: Error, path: string) {
    super(message);
    this.cause = cause;
    this.path = path;
    this.name = ErrorName.READ_WRITE;
  }
}

export class SagaError extends Error {
  public sagaName: string;
  public reason: Error|undefined;

  constructor(sagaName: string, message: string, reason?: Error) {
    super(message);
    this.name = ErrorName.SAGA_ERROR;
    this.sagaName = sagaName;
    this.reason = reason;
  }
}

/**
 * Функция получения конечной ошибки чтения/записи (модуля `fs`) на основе кода из ошибки `NodeJS`
 * @param error Объект ошибки чтения/записи
 * @param isDirOperation Операция над директорией или нет. По умолчанию `false`
 * @returns Объект Error
*/
export const getReadWriteError = (error: NodeJS.ErrnoException, isDirOperation = false): Error => {
  if (error.code === ErrorCode.ACCESS) {
    return new CustomError(ErrorMessage.ACCESS, ErrorName.ACCESS);
  }

  if (error.code === ErrorCode.NOT_FOUND) {
    return new CustomError(
      isDirOperation ? ErrorMessage.DIRECTORY_NOT_FOUND : ErrorMessage.FILE_NOT_FOUND,
      ErrorName.NOT_FOUND,
    );
  }

  if (error.code === ErrorCode.PATH_TO_DIRECTORY) {
    return new CustomError(ErrorMessage.PATH_TO_DIRECTORY, ErrorName.PATH_TO_DIRECTORY);
  }

  if (error.code === ErrorCode.PATH_TO_FILE) {
    return new CustomError(ErrorMessage.PATH_TO_FILE, ErrorName.PATH_TO_FILE);
  }

  if (error.code === ErrorCode.ARG_TYPE) {
    return new CustomError(ErrorMessage.ARG_TYPE, ErrorName.ARG_TYPE);
  }

  return error;
};

export const reportError = (error) => {
  shell.openExternal(reportLink);
};
