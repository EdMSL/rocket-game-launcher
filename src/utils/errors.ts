import { dialog } from 'electron';

export const ErrorTypes = {
  SyntaxError: 'SyntaxError',
  NotFoundError: 'NotFoundError',
  ReadError: 'ReadError',
};

/**
 * Показать модальное нативное окно Electron с ошибкой.
 * @param error Текст ошибки.
 * @param title Заголовок окна.
*/
export const showErrorBox = (message: string, title = 'There\'s been an error'): void => {
  dialog.showErrorBox(title, message);
};

export interface IReadError extends Error {
  cause: Error,
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ReadError extends Error {
  public cause: Error;

  constructor(message: string, cause: Error) {
    super(message);
    this.cause = cause;
    this.name = 'ReadError';
  }
}
