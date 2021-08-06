import { dialog } from 'electron';

export const ERROR_MESSAGE = {
  default: "There's been an error",
  access: 'Permission denied',
  fileNotFound: 'File not found',
  directoryNotFound: 'No such directory',
  pathToDirectory: 'Got path to directory, not file',
  pathToFile: 'Got path to file, not directory',
  argType: 'Invalid data in path received',
};

export const ERROR_NAME = {
  syntax: 'SyntaxError',
  notFound: 'NotFoundError',
  access: 'AccessError',
  argType: 'InvalidArgumentError',
  pathToDirectory: 'DirectoryError',
  readWrite: 'ReadWriteError',
};

export const ERROR_CODE = {
  access: 'EACCES',
  notFound: 'ENOENT',
  pathToDirectory: 'EISDIR',
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
  cause1: Error,
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
    this.name = ERROR_NAME.readWrite;
  }
}
/**
 * Функция получения конечной ошибки чтения/записи (модуля `fs`) на основе кода из ошибки `NodeJS`
 * @param error Объект ошибки чтения/записи
 * @returns Объект Error
*/
export const getReadWriteError = (error: NodeJS.ErrnoException): Error => {
  if (error.code === ERROR_CODE.access) {
    return new CustomError(ERROR_MESSAGE.access, ERROR_NAME.access);
  }

  if (error.code === ERROR_CODE.notFound) {
    return new CustomError(ERROR_MESSAGE.fileNotFound, ERROR_NAME.notFound);
  }

  if (error.code === ERROR_CODE.pathToDirectory) {
    return new CustomError(ERROR_MESSAGE.pathToDirectory, ERROR_NAME.pathToDirectory);
  }

  if (error.code === ERROR_CODE.argType) {
    return new CustomError(ERROR_MESSAGE.argType, ERROR_NAME.argType);
  }

  return error;
};
