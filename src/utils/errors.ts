import { dialog } from 'electron';

export const ErrorMessage = {
  DEFAULT: "There's been an error",
  ACCESS: 'Permission denied',
  FILE_NOT_FOUND: 'File not found',
  DIRECTORY_NOT_FOUND: 'No such directory',
  PATH_TO_DIRECTORY: 'Got path to directory, not file',
  PATH_TO_FILE: 'Got path to file, not directory',
  ARG_TYPE: 'Invalid data in path received',
  MIME_TYPE: 'Invalid file mime type',
};

export const ErrorName = {
  SYNTAX: 'SyntaxError',
  NOT_FOUND: 'NotFoundError',
  ACCESS: 'AccessError',
  ARG_TYPE: 'InvalidArgumentError',
  PATH_TO_DIRECTORY: 'DirectoryError',
  READ_WRITE: 'ReadWriteError',
};

export const ErrorCode = {
  ACCESS: 'EACCES',
  NOT_FOUND: 'ENOENT',
  PATH_TO_DIRECTORY: 'EISDIR',
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

  constructor(message: string, cause: Error) {
    super(message);
    this.cause = cause;
    this.name = ErrorName.READ_WRITE;
  }
}
/**
 * Функция получения конечной ошибки чтения/записи (модуля `fs`) на основе кода из ошибки `NodeJS`
 * @param error Объект ошибки чтения/записи
 * @returns Объект Error
*/
export const getReadWriteError = (error: NodeJS.ErrnoException): Error => {
  if (error.code === ErrorCode.ACCESS) {
    return new CustomError(ErrorMessage.ACCESS, ErrorName.ACCESS);
  }

  if (error.code === ErrorCode.NOT_FOUND) {
    return new CustomError(ErrorMessage.FILE_NOT_FOUND, ErrorName.NOT_FOUND);
  }

  if (error.code === ErrorCode.PATH_TO_DIRECTORY) {
    return new CustomError(ErrorMessage.PATH_TO_DIRECTORY, ErrorName.PATH_TO_DIRECTORY);
  }

  if (error.code === ErrorCode.ARG_TYPE) {
    return new CustomError(ErrorMessage.ARG_TYPE, ErrorName.ARG_TYPE);
  }

  return error;
};
