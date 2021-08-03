import { dialog } from 'electron';

export const ERROR_MESSAGE = {
  default: 'There\'s been an error',
  access: 'Permission denied',
  notFound: 'File not found',
  directory: 'Got path to directory, not file',
  argType: 'Invalid data in path received',
};

export const ERROR_TYPE = {
  SyntaxError: 'SyntaxError',
  NotFoundError: 'NotFoundError',
  PermissionError: 'PermissionError',
  InvalidArgumentError: 'InvalidArgumentError',
  ReadWriteError: 'ReadWriteError',
};

export const ERROR_CODE = {
  access: 'EACCES',
  notFound: 'ENOENT',
  directory: 'EISDIR',
  argType: 'ERR_INVALID_ARG_TYPE',
};

/**
 * Показать модальное нативное окно Electron с ошибкой.
 * @param error Текст ошибки.
 * @param title Заголовок окна.
*/
export const showErrorBox = (message: string, title = ERROR_MESSAGE.default): void => {
  dialog.showErrorBox(title, message);
};

export interface IReadWriteError extends Error {
  cause: Error,
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ERROR_TYPE.NotFoundError;
  }
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ERROR_TYPE.PermissionError;
  }
}

export class InvalidArgumentError extends Error {
  public code: string;

  constructor(message: string) {
    super(message);
    this.message = `An invalid argument was received. ${message}`;
    this.name = ERROR_TYPE.InvalidArgumentError;
    this.code = ERROR_CODE.argType;
  }
}

export class ReadWriteError extends Error {
  public cause: Error;

  constructor(message: string, cause: Error) {
    super(message);
    this.cause = cause;
    this.name = ERROR_TYPE.ReadWriteError;
  }
}
/**
 * Функция получения конечной ошибки чтения/записи (модуля `fs`) на основе кода из ошибки `NodeJS`
 * @param error Объект ошибки чтения/записи
 * @returns Объект Error
*/
export const getReadWriteError = (error: NodeJS.ErrnoException): Error => {
  if (error?.code === ERROR_CODE.access) {
    return new PermissionError(ERROR_MESSAGE.access);
  } else if (error?.code === ERROR_CODE.notFound) {
    return new NotFoundError(ERROR_MESSAGE.notFound);
  } else if (error?.code === ERROR_CODE.directory) {
    return new Error(ERROR_MESSAGE.directory);
  } else if (error?.code === ERROR_CODE.argType) {
    return new Error(ERROR_MESSAGE.argType);
  } else {
    return new Error(error.message);
  }
};
