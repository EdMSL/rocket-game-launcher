
import Joi from 'joi';

import { Encoding, USED_FILE_AVAILABLE_FIELDS } from '$constants/misc';
import {
  IGameSettingsConfig, IGameSettingsRootState, IUsedFile,
} from '$types/gameSettings';
import { IUserMessage } from '$types/main';
import {
  LogMessageType, writeToLogFile, writeToLogFileSync,
} from '$utils/log';
import {
  pushMessagesToArrays, IMessage, CreateUserMessage,
} from '$utils/message';
import { getTypeOfElement } from '$utils/data';

interface ICheckingResult {
  newUserMessages: IUserMessage[],
  newLogMessages?: IMessage[],
}

interface ISettingsConfigCheckingResult extends ICheckingResult {
  newSettingsConfigObj: IGameSettingsConfig,
}

interface IUsedFilesCheckingResult extends ICheckingResult {
  newUsedFilesObj: IGameSettingsConfig['usedFiles'],
}

/**
 * Проверка полей для конфига игровых настроек с удалением неизвестных ключей
 * и установкой значений по умолчанию для опциональных полей.
 * @param configObj Объект для проверки.
 * @returns Объект, содержащий измененный конфиг, и список ошибок.
*/
const checkGameSettings = (configObj: IGameSettingsConfig): Joi.ValidationResult => {
  const schema = Joi.object({
    settingGroups: Joi.array()
      .items(Joi.object({
        name: Joi.string().required(),
        label: Joi.string().optional().default(Joi.ref('name')),
      })).optional().min(1),
    baseFilesEncoding: Joi.string().optional().default(Encoding.WIN1251),
    basePathToFiles: Joi.string().optional().default('./'),
    usedFiles: Joi.object()
      .pattern(
        Joi.string(),
        Joi.object().pattern(
          Joi.string(),
          Joi.any(),
        ),
      ),
  });

  const validateResult = schema.validate(configObj, {
    abortEarly: false,
    stripUnknown: true,
  });

  return validateResult;
};

/**
 * Проверка файла игровых настроек на соответствие требованиям.
 * Проверка на наличие необходимых и опциональных полей, а так же фильтрация некорректных.
 * На выходе получаем сообщение о результате проверки, записи в логе и итоговый конфиг.
 * Поля используемых файлов для настроек проверяются отдельно.
*/
export const createGameSettingsConfig = (
  configObj: IGameSettingsConfig,
): ISettingsConfigCheckingResult => {
  writeToLogFileSync('Start of settings.json checking');

  let userMessages: IUserMessage[] = [];

  const result = checkGameSettings(configObj);

  if (result.error && result.error?.details?.length > 0) {
    userMessages = [CreateUserMessage.error('При проверке файла настроек settings.json обнаружены ошибки. Игровые настройки будут недоступны. Подробности в файле лога.')]; //eslint-disable-line max-len

    result.error.details.forEach((currentMsg) => {
      writeToLogFile(currentMsg.message, LogMessageType.ERROR);
    });
  }

  return { newUserMessages: userMessages, newSettingsConfigObj: { ...result.value } };
};

const checkUsedFile = (
  usedFile: IUsedFile,
  usedFilesObj: IGameSettingsConfig['usedFiles'],
): IUsedFilesCheckingResult => {
  const messages: IUserMessage[] = [];
  const logMessages: IMessage[] = [];
  const newUsedFilesObj: IGameSettingsConfig['usedFiles'] = {};
  const unknownFields: string[] = [];

  // Фильтруем неизвестные поля
  Object.keys(usedFile).forEach((field) => {
    if (!USED_FILE_AVAILABLE_FIELDS.includes(field)) {
      unknownFields.push(field);
      // delete usedFile[field]
    }
  });

  return {
    newUserMessages: messages,
    newLogMessages: logMessages,
    newUsedFilesObj,
  };
};

export const checkUsedFiles = (usedFiles: IGameSettingsRootState['usedFiles']): IUsedFilesCheckingResult => {
  const userMessages: IUserMessage[] = [];
  const logMessages: IMessage[] = [];
  const usedFilesObj: IGameSettingsConfig['usedFiles'] = {};

  Object.keys(usedFiles).forEach((filename) => {
    const typeOfUsedFileData = getTypeOfElement(usedFiles[filename]);

    if (typeOfUsedFileData === 'object') {
      const {
        newLogMessages, newUserMessages, newUsedFilesObj,
      } = checkUsedFile(usedFiles[filename], usedFilesObj);
    } else {
      pushMessagesToArrays(
        userMessages,
        logMessages,
        `Объект настроек ${filename} имеет некорректный тип. Параметр будет проигнорирован.`,
        `${filename} from usedFiles must be an object, got ${typeOfUsedFileData}`,
        'error',
      );
    }
  });

  return { newUserMessages: userMessages, newUsedFilesObj: usedFilesObj };
};
