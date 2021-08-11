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
