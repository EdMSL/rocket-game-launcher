import {
  Encoding,
  GAME_SETTINGS_CONFIG_ALL_MAIN_FIELDS,
  GAME_SETTINGS_CONFIG_OPTIONAL_FIELDS,
  GAME_SETTINGS_CONFIG_REQUIRE_FIELDS,
  GAME_SETTINGS_CONFIG_SETTING_GROUP_FIELDS,
} from '$constants/misc';
import { IGameSettingsConfig } from '$reducers/gameSettings';
import { IUserMessage } from '$reducers/main';
import { writeToLogFile, writeToLogFileSync } from '$utils/log';
import {
  pushMessagesToArrays, IMessage, CreateUserMessage,
} from '$utils/message';

interface ICheckingResult {
  newUserMessages: IUserMessage[],
  newLogMessages?: IMessage[],
  newSettingsConfigObj: IGameSettingsConfig,
}

const checkSettingGroups = (obj: IGameSettingsConfig): ICheckingResult => {
  const groupsMessages: IUserMessage[] = [];
  const logMessages: IMessage[] = [];
  const noNameGroups: number[] = [];
  const noLabelGroups: number[] = [];
  const unknownFieldsGroupsMessages: string[][] = [];
  const currentSettingsConfigObj = { ...obj };

  obj.settingGroups?.forEach((group, index) => {
    // Проверка основных полей в группах
    if (!group.name) {
      noNameGroups.push(index + 1);
    }

    if (!group.label) {
      noLabelGroups.push(index + 1);

      currentSettingsConfigObj.settingGroups![index].label = currentSettingsConfigObj.settingGroups![index].name.toString();
    }

    // Проверка на лишние поля в группах
    const unknonGroupFields: string[] = [];

    Object.keys(group).forEach((field) => {
      if (!GAME_SETTINGS_CONFIG_SETTING_GROUP_FIELDS.includes(field)) {
        unknonGroupFields.push(field);
        delete currentSettingsConfigObj.settingGroups![index][field];
      }
    });

    if (unknonGroupFields.length > 0) {
      unknownFieldsGroupsMessages.push([
        `Группа ${index + 1} имеет неизвестные поля: ${unknonGroupFields}`,
        `Group ${index + 1} have unknown fields: ${unknonGroupFields}`,
      ]);
    }
  });

  if (noNameGroups.length > 0) {
    pushMessagesToArrays(
      groupsMessages,
      logMessages,
      `Группа(ы) ${noNameGroups} не имеют обязательного поля "name". Игровые настройки будут недоступны.`, //eslint-disable-line max-len
      `Groups ${noNameGroups} have't required field "name".`,
      'error',
    );
  }

  if (noLabelGroups.length > 0) {
    pushMessagesToArrays(
      groupsMessages,
      logMessages,
      `Группа(ы) ${noLabelGroups} не имеют поля "label".`,
      `Groups ${noLabelGroups} have't field "label".`,
      'info',
    );
  }

  if (unknownFieldsGroupsMessages.length > 0) {
    unknownFieldsGroupsMessages.forEach((group) => {
      pushMessagesToArrays(
        groupsMessages,
        logMessages,
        group[0],
        group[1],
        'warning',
      );
    });
  }

  return {
    newUserMessages: groupsMessages,
    newLogMessages: logMessages,
    newSettingsConfigObj: currentSettingsConfigObj,
  };
};

const checkSettingOptionalFileds = (obj: IGameSettingsConfig): ICheckingResult => {
  let optionalMessages: IUserMessage[] = [];
  let logMessages: IMessage[] = [];
  let currentSettingsConfigObj = { ...obj };

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
    const {
      newUserMessages, newLogMessages, newSettingsConfigObj,
    } = checkSettingGroups(currentSettingsConfigObj);

    optionalMessages = [...optionalMessages, ...newUserMessages];
    logMessages = [...logMessages, ...newLogMessages!];
    currentSettingsConfigObj = { ...newSettingsConfigObj };
  }

  if (!currentSettingsConfigObj.baseFilesEncoding) {
    currentSettingsConfigObj.baseFilesEncoding = Encoding.WIN1251;
  }

  if (!currentSettingsConfigObj.basePathToFiles) {
    currentSettingsConfigObj.basePathToFiles = './';
  }

  return {
    newUserMessages: optionalMessages,
    newLogMessages: logMessages,
    newSettingsConfigObj: currentSettingsConfigObj,
  };
};

export const createGameSettingsConfig = (configObj: IGameSettingsConfig): ICheckingResult => {
  writeToLogFileSync('Start of settings.json checking');

  let currentSettingsObj = { ...configObj };
  let userMessages: IUserMessage[] = [];
  let logMessages: IMessage[] = [];
  const ignoredKeys: string[] = [];

  // Отфильтруем невалидные поля.
  const filteredObjKeys = Object.keys(configObj).filter((currentKey) => {
    if (!GAME_SETTINGS_CONFIG_ALL_MAIN_FIELDS.includes(currentKey)) {
      ignoredKeys.push(currentKey);
      delete currentSettingsObj[currentKey];

      return false;
    }

    return true;
  });

  if (ignoredKeys.length > 0) {
    pushMessagesToArrays(
      userMessages,
      logMessages,
      `Найдены неизвестные поля в файле игровых настроек: ${ignoredKeys}`,
      `Invalid fields detected on settings.json: ${ignoredKeys}`,
    );
  }

  // Проверка необходимых полей
  if (!GAME_SETTINGS_CONFIG_REQUIRE_FIELDS.some((field) => !filteredObjKeys.includes(field))) {
    if (Object.keys(currentSettingsObj.usedFiles).length === 0) {
      pushMessagesToArrays(
        userMessages,
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
      userMessages,
      logMessages,
      `Отсутствуют необходимые поля в файле игровых настроек: ${missedRequredFields}. Игровые настройки будут недоступны.`, //eslint-disable-line max-len
      `Missed required fields on settings.json: ${missedRequredFields}`,
      'error',
    );
  }

  // Проверка опциональных полей
  const {
    newUserMessages, newLogMessages, newSettingsConfigObj,
  } = checkSettingOptionalFileds(currentSettingsObj);

  userMessages = [...userMessages, ...newUserMessages];
  logMessages = [...logMessages, ...newLogMessages!];
  currentSettingsObj = { ...newSettingsConfigObj };

  if (userMessages.length > 0) {
    if (userMessages.some((message) => message.type === 'error')) {
      userMessages = [CreateUserMessage.error('При проверке файла настроек settings.json обнаружены ошибки. Игровые настройки будут недоступны. Подробности в файле лога')]; //eslint-disable-line max-len
    } else if (userMessages.some((message) => message.type === 'warning')) {
      userMessages = [CreateUserMessage.warning('При проверке файла настроек settings.json обнаружены недочеты. Подробности в файле лога')]; //eslint-disable-line max-len
    } else {
      userMessages = [CreateUserMessage.info('При проверке файла настроек settings.json критических ошибок не обнаружено. Подробности в файле лога')]; //eslint-disable-line max-len
    }
  } else {
    userMessages = [];
  }

  if (logMessages.length > 0) {
    logMessages.forEach((currentMsg) => {
      writeToLogFile(currentMsg.text, currentMsg.type);
    });
  }

  return { newUserMessages: userMessages, newSettingsConfigObj: currentSettingsObj };
};
