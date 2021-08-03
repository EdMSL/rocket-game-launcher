import { dialog } from 'electron';

export const ERROR_MESSAGE = {
  default: 'There\'s been an error',
  access: 'Permission denied',
  notFound: 'File not found',
  directory: 'Got path to directory, not file',
  argType: 'Invalid data in path received',
};

export const ERROR_TYPE = {
  syntax: 'SyntaxError',
  NotFoundError: 'NotFoundError',
  AccessError: 'AccessError',
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

export class CustomError extends Error {
  public code: string;

  constructor(message: string, name = 'Error', code?: string){
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
    return new CustomError(ERROR_MESSAGE.access, ERROR_TYPE.AccessError);
  } else if (error?.code === ERROR_CODE.notFound) {
    return new CustomError(ERROR_MESSAGE.notFound, ERROR_TYPE.AccessError);
  } else if (error?.code === ERROR_CODE.directory) {
    return new CustomError(ERROR_MESSAGE.directory, ERROR_TYPE.AccessError);
  } else if (error?.code === ERROR_CODE.argType) {
    return new CustomError(ERROR_MESSAGE.argType, ERROR_TYPE.AccessError);
  } else {
    return error;
  }
};
