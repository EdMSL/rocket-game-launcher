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
  UNKNOWN: 'An unknown error occurred',
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
  UNKNOWN: 'UnknownError',
};

export const ErrorCode = {
  ACCESS: 'EACCES',
  NOT_FOUND: 'ENOENT',
  PATH_TO_DIRECTORY: 'EISDIR',
  PATH_TO_FILE: 'ENOTDIR',
  ARG_TYPE: 'ERR_INVALID_ARG_TYPE',
  UNKNOWN: 'UNKNOWN',
};

export class CustomError extends Error {
  public code?: string;

  constructor(message: string, name = 'Error', code?: string) {
    super(message);
    this.name = name;
    this.code = code;
  }
}

export class ReadWriteError extends Error {
  public path: string;
  public causeName: string;
  public causeCode: string;

  constructor(message: string, causeName: string, path: string, code: string) {
    super(message);
    this.path = path;
    this.name = ErrorName.READ_WRITE;
    this.causeName = causeName;
    this.causeCode = code;
  }
}

export class SagaError extends Error {
  public sagaName: string;
  public reason: Error|CustomError|ReadWriteError;

  constructor(sagaName: string, message: string, reason: Error|CustomError|ReadWriteError) {
    super(message);
    this.name = ErrorName.SAGA_ERROR;
    this.sagaName = sagaName;
    this.reason = reason;
  }
}

/**
 * Показывает модальное нативное окно Electron с ошибкой.
 * @param message Текст ошибки.
 * @param title Заголовок окна.
*/
export const showErrorBox = (message: string, title = ErrorMessage.DEFAULT): void => {
  dialog.showErrorBox(title, message);
};

/**
 * Получает конечную ошибку чтения/записи (модуля `fs`) на основе кода из ошибки `NodeJS`
 * @param error Объект ошибки чтения/записи.
 * @param path Путь к обрабатываемому файлу/папке.
 * @param messageTitle Часть конечного сообщения об ошибке. Добавится в начало сообщения.
 * @param isDirOperation Если `true`, то выполняется операция над директорией, иначе над файлом.
 * Влияет только на сообщение об ошибке.
 * @returns Объект Error
*/
export const getReadWriteError = (
  error: NodeJS.ErrnoException,
  path: string,
  messageTitle = '',
  isDirOperation = false,
): ReadWriteError => {
  let errorMessage = ErrorMessage.UNKNOWN;
  let errorCauseName = ErrorName.UNKNOWN;
  let errorCauseCode = ErrorCode.UNKNOWN;

  if (error.code === ErrorCode.ACCESS) {
    errorMessage = `${messageTitle} ${ErrorMessage.ACCESS}`;
    errorCauseName = ErrorName.ACCESS;
    errorCauseCode = error.code;
  }

  if (error.code === ErrorCode.NOT_FOUND) {
    errorMessage = `${messageTitle} ${isDirOperation ? ErrorMessage.DIRECTORY_NOT_FOUND : ErrorMessage.FILE_NOT_FOUND}`;
    errorCauseName = ErrorName.NOT_FOUND;
    errorCauseCode = error.code;
  }

  if (error.code === ErrorCode.PATH_TO_DIRECTORY) {
    errorMessage = `${messageTitle} ${ErrorMessage.PATH_TO_DIRECTORY}`;
    errorCauseName = ErrorName.PATH_TO_DIRECTORY;
    errorCauseCode = error.code;
  }

  if (error.code === ErrorCode.PATH_TO_FILE) {
    errorMessage = `${messageTitle} ${ErrorMessage.PATH_TO_FILE}`;
    errorCauseName = ErrorName.PATH_TO_FILE;
    errorCauseCode = error.code;
  }

  if (error.code === ErrorCode.ARG_TYPE) {
    errorMessage = `${messageTitle} ${ErrorMessage.ARG_TYPE}`;
    errorCauseName = ErrorName.ARG_TYPE;
    errorCauseCode = error.code;
  }

  return new ReadWriteError(
    errorMessage,
    errorCauseName,
    path,
    errorCauseCode,
  );
};

/**
 * Выполняет указанные внутри операции при нажатии кнопки 'Report' модуля `unhandled`.
 * @param error Объект ошибки.
 */
export const reportError = (error) => {
  shell.openExternal(reportLink);
};
