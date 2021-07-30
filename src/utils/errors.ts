import { dialog } from 'electron';

/**
 * Показать модальное нативное окно Electron с ошибкой.
 * @param error Текст ошибки.
 * @param title Заголовок окна.
*/
export const showErrorBox = (message: string, title = 'There\'s been an error'): void => {
  dialog.showErrorBox(title, message);
};
