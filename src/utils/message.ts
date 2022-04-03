import { IMessageType, IUserMessage } from '$types/common';
import { getRandomId } from '$utils/strings';

/**
 * Создает сообщение для вывода на главный экран приложения.
 * @param type Тип сообщения.
 * @param text Текст сообщения.
 * @returns Объект сообщения.
*/
const createMessage = (
  type: IMessageType,
  text: string,
): IUserMessage => ({
  id: getRandomId(type),
  type,
  text,
});

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
