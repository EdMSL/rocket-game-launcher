import {
  GAME_SETTINGS_CONFIG_ALL_FIELDS,
  GAME_SETTINGS_CONFIG_OPTIONAL_FIELDS,
  GAME_SETTINGS_CONFIG_REQUIRE_FIELDS,
} from '$constants/misc';
import { IGameSettingsConfig } from '$reducers/gameSettings';
import { IMessage } from '$reducers/main';
import { writeToLogFile } from './log';
import { getRandomId } from './strings';

export const checkGameSettingsFileBaseFields = (configObj: IGameSettingsConfig): IMessage[] => {
  const messages: IMessage[] = [];
  const logMessages: { msg: string, type: IMessage['status'], }[] = [];
  const ignoredKeys: string[] = [];

  // Отфильтруем невалидные поля.
  const filteredObjKeys = Object.keys(configObj).filter((currentKey) => {
    if (!GAME_SETTINGS_CONFIG_ALL_FIELDS.includes(currentKey)) {
      ignoredKeys.push(currentKey);

      return false;
    }

    return true;
  });

  if (ignoredKeys.length > 0) {
    messages.push({
      id: getRandomId('check'),
      status: 'warning',
      text: `Найдены некорректные поля в файле игровых настроек: ${ignoredKeys}`,
    });
    logMessages.push({
      msg: `Invalid fields detected on settings.json: ${ignoredKeys}`,
      type: 'warning',
    });
  }

  // Проверка на наличие необходимых полей
  if (!GAME_SETTINGS_CONFIG_REQUIRE_FIELDS.some((field) => !filteredObjKeys.includes(field))) {
    if (Object.keys(configObj.usedFiles).length === 0) {
      messages.push({
        id: getRandomId('check'),
        status: 'warning',
        text: 'В файл игровых настроек не добавлено ни одного фала.',
      });
      logMessages.push({ msg: 'No game settings files on settings.json', type: 'warning' });
    }
  } else {
    const missedRequredFields = GAME_SETTINGS_CONFIG_REQUIRE_FIELDS.filter(
      (currKey) => !filteredObjKeys.includes(currKey),
    );

    messages.push({
      id: getRandomId('check'),
      status: 'error',
      text: `Отсутствуют необходимые поля в файле игровых настроек: ${missedRequredFields}. Игровые настройки будут недоступны.`, //eslint-disable-line max-len
    });
    logMessages.push({
      msg: `Missed required fields on settings.json: ${missedRequredFields}`,
      type: 'error',
    });
  }

  // Проверка наличия опциональных полей
  if (GAME_SETTINGS_CONFIG_OPTIONAL_FIELDS.some((field) => !filteredObjKeys.includes(field))) {
    const missedOptionalFields = GAME_SETTINGS_CONFIG_OPTIONAL_FIELDS.filter(
      (currKey) => !filteredObjKeys.includes(currKey),
    );

    messages.push({
      id: getRandomId('check'),
      status: 'warning',
      text: `Отсутствуют опциональные поля в файле игровых настроек: ${missedOptionalFields}.`,
    });
    logMessages.push({
      msg: `Missed optional fields on settings.json: ${missedOptionalFields}`,
      type: 'warning',
    });
  }

  logMessages.forEach((currentMsg) => {
    writeToLogFile(currentMsg.msg, currentMsg.type);
  });

  return messages;
};
