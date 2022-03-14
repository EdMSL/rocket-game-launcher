import { RoutesWindowName } from '$constants/routes';
import { IUserMessage } from '$types/main';
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
 * @param window Окно, где будет выводиться сообщение.
 * @returns Объект сообщения.
*/
const createMessage = (
  type: IMessageType,
  text: string,
  window = RoutesWindowName.MAIN,
): IUserMessage => ({
  id: getRandomId(type),
  type,
  text,
  window,
});

export const CreateUserMessage = {
  /**
   * Создать сообщение пользователю об ошибке.
   * @param text Текст сообщения.
   * @returns Объект сообщения.
  */
  error: (text: string, window?: string): IUserMessage => createMessage('error', text, window),
  /**
   * Создать информационное сообщение пользователю с предупреждением.
   * @param text Текст сообщения.
   * @returns Объект сообщения.
  */
  warning: (text: string, window?: string): IUserMessage => createMessage('warning', text, window),
  /**
   * Создать информационное сообщение пользователю.
   * @param text Текст сообщения.
   * @returns Объект сообщения.
  */
  info: (text: string, window?: string): IUserMessage => createMessage('info', text, window),
  /**
   * Создать информационное сообщение пользователю об успехе.
   * @param text Текст сообщения.
   * @returns Объект сообщения.
  */
  success: (text: string, window?: string): IUserMessage => createMessage('success', text, window),
};
