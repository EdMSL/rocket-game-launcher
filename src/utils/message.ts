import { BrowserWindow } from 'electron';

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

/**
 * Показывает нативное диалоговое окно выбранного типа, содержащее текстовое сообщение и,
 * если указаны, кнопки для выполнения действий.
 * @param message Текст сообщения.
 * @param title Заголовок окна.
 * @param type Тип окна: `info`, `warning` или `error`.
 * @param buttons Кнопки, которые будут отображены в диалоговом окне.
 * @param browserWindow Если указано, то данное окно программы будет родительским для диалогового
 * окна, что сделает его модальным.
*/
export const showMessageBox = (
  dialog: Electron.Dialog,
  message: string,
  title = '',
  type = 'info',
  buttons?: string[],
  browserWindow?: BrowserWindow,
): Promise<Electron.MessageBoxReturnValue> => {
  if (browserWindow) {
    return dialog.showMessageBox(browserWindow, {
      message, title, type, buttons,
    });
  }

  return dialog.showMessageBox({
    message, title, type, buttons,
  });
};

