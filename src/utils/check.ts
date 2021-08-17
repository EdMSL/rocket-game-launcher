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

const checkSettingGroups = (obj: IGameSettingsConfig): ICheckingResult => {
  const groupsMessages: IMessage[] = [];
  const logMessages: ICheckingLogMessage[] = [];

  if (obj.settingGroups?.some((group) => !group.name)) {
    groupsMessages.push({
      id: getRandomId('check'),
      status: 'error',
      text: 'Некоторые из групп настроек не имеют обязательного поля "name"',
    });
    logMessages.push({
      msg: 'Some of setting grops have\'t required field "name"',
      type: 'error',
    });
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

    optionalMessages.push({
      id: getRandomId('check'),
      status: 'info',
      text: `Отсутствуют опциональные поля в файле игровых настроек: ${missedOptionalFields}.`,
    });
    logMessages.push({
      msg: `Missed optional fields on settings.json: ${missedOptionalFields}`,
      type: 'info',
    });
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
    if (Object.keys(currentSettingsObj.usedFiles).length === 0) {
      messages.push({
        id: getRandomId('check'),
        status: 'warning',
        text: 'В файл игровых настроек не добавлено ни одного файла.',
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
  const optionalCheckResult = checkSettingOptionalFileds(currentSettingsObj);

  messages = [...messages, ...optionalCheckResult.mainMessages];
  logMessages = [...logMessages, ...optionalCheckResult.logMessages];

  logMessages.forEach((currentMsg) => {
    writeToLogFile(currentMsg.msg, currentMsg.type);
  });

  return messages;
};
