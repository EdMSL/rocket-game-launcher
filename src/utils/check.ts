import {
  GAME_SETTINGS_CONFIG_ALL_FIELDS,
  GAME_SETTINGS_CONFIG_OPTIONAL_FIELDS,
  GAME_SETTINGS_CONFIG_REQUIRE_FIELDS,
} from '$constants/misc';
import { IGameSettingsConfig } from '$reducers/gameSettings';
import { IMessage } from '$reducers/main';
import { writeToLogFile } from './log';
import { getRandomId } from './strings';

interface ICheckingLogMessage {
  msg: string,
  type: IMessage['status'],
}

interface ICheckingResult {
  mainMessages: IMessage[],
  logMessages: ICheckingLogMessage[],
}

const pushMessagesToArrays = (
  mainMessages: IMessage[],
  logMessages: ICheckingLogMessage[],
  userMessageText: string,
  logMessageText: string,
  msgStatus: IMessage['status'] = 'warning',
): void => {
  mainMessages.push({
    id: getRandomId('check'),
    status: msgStatus,
    text: userMessageText,
  });
  logMessages.push({
    msg: logMessageText,
    type: msgStatus,
  });
};

const checkSettingGroups = (obj: IGameSettingsConfig): ICheckingResult => {
  const groupsMessages: IMessage[] = [];
  const logMessages: ICheckingLogMessage[] = [];

  if (obj.settingGroups?.some((group) => !group.name)) {
    pushMessagesToArrays(
      groupsMessages,
      logMessages,
      'Некоторые из групп настроек не имеют обязательного поля "name". Игровые настройки будут недоступны.', //eslint-disable-line max-len
      'Some of setting grops have\'t required field "name"',
      'error',
    );
  }

  return { mainMessages: groupsMessages, logMessages };
};

const checkSettingOptionalFileds = (obj: IGameSettingsConfig): ICheckingResult => {
  let optionalMessages: IMessage[] = [];
  let logMessages: ICheckingLogMessage[] = [];

  if (GAME_SETTINGS_CONFIG_OPTIONAL_FIELDS.some((field) => !Object.keys(obj).includes(field))) {
    const missedOptionalFields = GAME_SETTINGS_CONFIG_OPTIONAL_FIELDS.filter(
      (currKey) => !Object.keys(obj).includes(currKey),
    );

    pushMessagesToArrays(
      optionalMessages,
      logMessages,
      `Отсутствуют опциональные поля в файле игровых настроек: ${missedOptionalFields}.`,
      `Missed optional fields on settings.json: ${missedOptionalFields}`,
      'info',
    );
  }

  if (obj.settingGroups!.length > 0) {
    const groupsCheckResult = checkSettingGroups(obj);

    optionalMessages = [...optionalMessages, ...groupsCheckResult.mainMessages];
    logMessages = [...logMessages, ...groupsCheckResult.logMessages];
  }

  return { mainMessages: optionalMessages, logMessages };
};

export const checkGameSettingsFile = (configObj: IGameSettingsConfig): IMessage[] => {
  const currentSettingsObj = { ...configObj };

  let messages: IMessage[] = [];
  let logMessages: ICheckingLogMessage[] = [];
  const ignoredKeys: string[] = [];

  // Отфильтруем невалидные поля.
  const filteredObjKeys = Object.keys(configObj).filter((currentKey) => {
    if (!GAME_SETTINGS_CONFIG_ALL_FIELDS.includes(currentKey)) {
      ignoredKeys.push(currentKey);
      delete currentSettingsObj[currentKey];

      return false;
    }

    return true;
  });

  if (ignoredKeys.length > 0) {
    pushMessagesToArrays(
      messages,
      logMessages,
      `Найдены некорректные поля в файле игровых настроек: ${ignoredKeys}`,
      `Invalid fields detected on settings.json: ${ignoredKeys}`,
    );
  }

  // Проверка на наличие необходимых полей
  if (!GAME_SETTINGS_CONFIG_REQUIRE_FIELDS.some((field) => !filteredObjKeys.includes(field))) {
    if (Object.keys(currentSettingsObj.usedFiles).length === 0) {
      pushMessagesToArrays(
        messages,
        logMessages,
        'В файл игровых настроек не добавлено ни одного файла.',
        'No game settings files on settings.json',
      );
    }
  } else {
    const missedRequredFields = GAME_SETTINGS_CONFIG_REQUIRE_FIELDS.filter(
      (currKey) => !filteredObjKeys.includes(currKey),
    );

    pushMessagesToArrays(
      messages,
      logMessages,
      `Отсутствуют необходимые поля в файле игровых настроек: ${missedRequredFields}. Игровые настройки будут недоступны.`, //eslint-disable-line max-len
      `Missed required fields on settings.json: ${missedRequredFields}`,
      'error',
    );
  }

  // Проверка наличия опциональных полей
  const optionalCheckResult = checkSettingOptionalFileds(currentSettingsObj);

  messages = [...messages, ...optionalCheckResult.mainMessages];
  logMessages = [...logMessages, ...optionalCheckResult.logMessages];

  logMessages.forEach((currentMsg) => {
    writeToLogFile(currentMsg.msg, currentMsg.type);
  });

  return messages;
};
