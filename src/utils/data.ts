import { Display } from 'electron';

import { IMessage } from '$reducers/main';
import { getRandomId } from '$utils/strings';

/**
 * Получить объект сообщения для вывода пользователю.
 * @param content Текст сообщения.
 * @param status Статус сообщения: `info`, `error`, `warning` или `success`. По-умолчанию `error.`
 * @returns Объект сообщения.
*/
export const getMessage = (
  content: string,
  status: IMessage['status'] = 'error',
): IMessage => ({
  id: getRandomId(status),
  status,
  text: content,
});

/**
 * Получить информацию о доступных дисплеях.
 * @param mainDisplay Объект с информацией об основном дисплее.
 * @param displays Массив объектов с информацией о всех доступных дисплеях.
 * @returns Строка со всей информацией о дисплеях.
*/
export const getDisplaysInfo = (mainDisplay: Display, displays: Display[]): string => {
  let result = `Main display info. Resolution: ${mainDisplay.size.width}x${mainDisplay.size.height}, Work Area: ${mainDisplay.workArea.width}x${mainDisplay.workArea.height}, Work Area Size: ${mainDisplay.workAreaSize.width}x${mainDisplay.workAreaSize.height}, Scale: ${mainDisplay.scaleFactor}`; //eslint-disable-line max-len

  result += '\r\n  All displays:';

  displays.forEach((display, index) => {
    result += `\r\n  ${index}: Resolution: ${display.size.width}x${display.size.height}, Work Area: ${display.workArea.width}x${display.workArea.height}, Work Area Size: ${display.workAreaSize.width}x${display.workAreaSize.height}, Scale: ${mainDisplay.scaleFactor}`; //eslint-disable-line max-len
  });

  return result;
};

