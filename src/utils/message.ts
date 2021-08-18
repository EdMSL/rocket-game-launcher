import { IUserMessage } from '$reducers/main';
import { getRandomId } from '$utils/strings';

export type IMessageType = 'error'|'warning'|'info'|'success';

export interface IMessage {
  type: IMessageType,
  text: string,
}

/**
 * Создает сообщение для вывода на главный экран приложения.
 * @param type Тип сообщения.
 * @param text Текст сообщения.
 * @param word Слово для генерации id. По умолчанию параметр `type`.
 * @returns Объект сообщения.
*/
const createMessage = (
  type: IMessageType,
  text: string,
  word: IMessageType|string = type,
): IUserMessage => ({
  id: getRandomId(word),
  type,
  text,
});

/**
 * Добавляет сообщение в списки пользовательских сообщений и сообщений лога.
 * @param userMessages Массив для добавления сообщения пользователю.
 * @param logMessages Массив для добавления сообщения лога.
 * @param userMessageText Текст сообщения пользователю.
 * @param logMessageText Текст сообщения лога.
 * @param msgStatus Тип сообщения. По умолчанию `warning`.
*/
export const pushMessagesToArrays = (
  userMessages: IUserMessage[],
  logMessages: IMessage[],
  userMessageText: string,
  logMessageText: string,
  msgStatus: IMessageType = 'warning',
): void => {
  userMessages.push(createMessage(msgStatus, userMessageText, 'check'));
  logMessages.push({
    type: msgStatus,
    text: logMessageText,
  });
};

export const CreateUserMessage = {
  /**
   * Создать сообщение пользователю об ошибке.
   * @param text Текст сообщения.
   * @returns Объект сообщения.
  */
  error: (text: string): IUserMessage => createMessage('error', text),
  /**
   * Создать информационное сообщение пользователю с предупреждением.
   * @param text Текст сообщения.
   * @returns Объект сообщения.
  */
  warning: (text: string): IUserMessage => createMessage('warning', text),
  /**
   * Создать информационное сообщение пользователю.
   * @param text Текст сообщения.
   * @returns Объект сообщения.
  */
  info: (text: string): IUserMessage => createMessage('info', text),
  /**
   * Создать информационное сообщение пользователю об успехе.
   * @param text Текст сообщения.
   * @returns Объект сообщения.
  */
  success: (text: string): IUserMessage => createMessage('success', text),
};
