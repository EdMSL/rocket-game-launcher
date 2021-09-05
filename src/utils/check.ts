
import Joi from 'joi';

import {
  Encoding, SettingParameterControllerType, UsedFileView,
} from '$constants/misc';
import { IGameSettingsConfig, IGameSettingsRootState } from '$types/gameSettings';
import { IUserMessage } from '$types/main';
import {
  LogMessageType, writeToLogFile, writeToLogFileSync,
} from '$utils/log';
import { CreateUserMessage } from '$utils/message';
import { defaultLauncherConfig } from '$constants/defaultParameters';
import { ISystemRootState } from '$types/system';

interface ICheckingResult {
  newUserMessages: IUserMessage[],
}

interface ISettingsConfigCheckingResult extends ICheckingResult {
  newSettingsConfigObj: IGameSettingsConfig,
}

interface IUsedFilesCheckingResult extends ICheckingResult {
  newUsedFilesObj: IGameSettingsConfig['usedFiles'],
}

interface IUsedFileError {
  parent: string,
  error: Joi.ValidationError,
}

const configFileDataSchema = Joi.object({
  isResizable: Joi.bool().optional().default(defaultLauncherConfig.isResizable),
  minWidth: Joi.number().optional().default(defaultLauncherConfig.minWidth),
  minHeight: Joi.number().optional().default(defaultLauncherConfig.minHeight),
  width: Joi.number().optional().default(defaultLauncherConfig.width),
  height: Joi.number().optional().default(defaultLauncherConfig.height),
  modOrganizer: {
    isUsed: Joi.bool().optional().default(defaultLauncherConfig.modOrganizer.isUsed),
    path: Joi.string().optional().default(defaultLauncherConfig.modOrganizer.path),
    pathToINI: Joi.string().optional().default(defaultLauncherConfig.modOrganizer.pathToINI),
    pathToProfiles: Joi.string().optional().default(
      defaultLauncherConfig.modOrganizer.pathToProfiles,
    ),
    profileSection: Joi.string().optional().default(defaultLauncherConfig.modOrganizer.profileSection),
    profileParam: Joi.string().optional().default(defaultLauncherConfig.modOrganizer.profileParam),
    profileParamValueRegExp: Joi.string().optional().allow('').default(
      defaultLauncherConfig.modOrganizer.profileParamValueRegExp,
    ),
  },
  documentsPath: Joi.string().optional().default(defaultLauncherConfig.documentsPath),
  isFirstLaunch: Joi.bool().optional().default(defaultLauncherConfig.isFirstLaunch),
  customPaths: Joi.object().pattern(
    Joi.string(),
    Joi.string(),
  ),
}).optional().default(defaultLauncherConfig.customPaths);

export const checkConfigFileData = (configObj: ISystemRootState): ISystemRootState => {
  writeToLogFileSync('Start of config.json checking.');

  const validateResult = configFileDataSchema.validate(configObj, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (validateResult.error && validateResult.error?.details?.length > 0) {
    validateResult.error.details.forEach((currentMsg) => {
      writeToLogFile(currentMsg.message, LogMessageType.ERROR);
    });
  }

  return validateResult.value;
};

const settingsMainSchema = Joi.object({
  settingGroups: Joi.array()
    .items(Joi.object({
      name: Joi.string().required(),
      label: Joi.string().optional().default(Joi.ref('name')),
    })).optional().min(1)
    .default([]),
  baseFilesEncoding: Joi.string().optional().default(Encoding.WIN1251),
  usedFiles: Joi.object()
    .pattern(
      Joi.string(),
      Joi.object().pattern(
        Joi.string(),
        Joi.any(),
      ),
    ).required(),
});

const settingParameterSchema = Joi.object({
  name: Joi.string().required(),
  controllerType: Joi.string().required().valid(...Object.values(SettingParameterControllerType)),
  label: Joi.string().optional().default(Joi.ref('name')),
  iniGroup: Joi.string().when(
    Joi.ref('$view'), {
      is: UsedFileView.SECTIONAL, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ),
  attributeName: Joi.string().when(
    Joi.ref('$view'), {
      is: UsedFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ),
  attributePath: Joi.string().when(
    Joi.ref('$view'), {
      is: UsedFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ),
  settingGroup: Joi.string().when(
    Joi.ref('$isSettingGroupsExists'), {
      is: true, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ).valid(Joi.ref('$availableSettingGroups', { in: true })),
  options: Joi.object().pattern(
    Joi.string(),
    Joi.string(),
  ).when(
    Joi.ref('controllerType'), { is: SettingParameterControllerType.SELECT, then: Joi.required() },
  ),
  min: Joi.number().when(
    Joi.ref('controllerType'), { is: SettingParameterControllerType.RANGE, then: Joi.required() },
  ),
  max: Joi.number().when(
    Joi.ref('controllerType'), { is: SettingParameterControllerType.RANGE, then: Joi.required() },
  ),
  step: Joi.number().when(
    Joi.ref('controllerType'), { is: SettingParameterControllerType.RANGE, then: Joi.required() },
  ),
});

const usedFileSchema = Joi.object({
  encoding: Joi.string().optional().default(Joi.ref('$encoding')),
  path: Joi.string().required(),
  view: Joi.string().required().valid(...Object.values(UsedFileView)),
  parameters: Joi.array().items(settingParameterSchema),
});

/**
 * Проверка файла игровых настроек на соответствие требованиям.
 * Проверка на наличие необходимых и опциональных полей, а так же фильтрация некорректных.
 * На выходе получаем сообщение о результате проверки и итоговый конфиг.
 * Поля используемых файлов для настроек проверяются отдельно.
*/
export const checkGameSettingsConfigMainFields = (
  configObj: IGameSettingsConfig,
): ISettingsConfigCheckingResult => {
  writeToLogFileSync('Start of settings.json checking.');

  let userMessages: IUserMessage[] = [];

  const validateResult = settingsMainSchema.validate(configObj, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (validateResult.error && validateResult.error?.details?.length > 0) {
    userMessages = [CreateUserMessage.error('При проверке файла настроек settings.json обнаружены ошибки. Игровые настройки будут недоступны. Подробности в файле лога.')]; //eslint-disable-line max-len

    validateResult.error.details.forEach((currentMsg) => {
      writeToLogFile(currentMsg.message, LogMessageType.ERROR);
    });
  }

  return { newUserMessages: userMessages, newSettingsConfigObj: { ...validateResult.value } };
};

/**
 * Проверка всех полей из `usedFiles` на соответствие шаблону.
 * Проверка на наличие необходимых и опциональных полей, а так же фильтрация некорректных.
 * На выходе получаем сообщение о результате проверки и итоговые настройки для каждого файла.
*/
export const checkUsedFiles = (
  usedFiles: IGameSettingsRootState['usedFiles'],
  baseFilesEncoding: IGameSettingsRootState['baseFilesEncoding'],
  settingGroups: IGameSettingsRootState['settingGroups'],
): IUsedFilesCheckingResult => {
  writeToLogFileSync('Start checking of used files in settings.json.');

  let userMessages: IUserMessage[] = [];
  const validationErrors: IUsedFileError[] = [];

  const availableSettingGroups = settingGroups.map((group) => group.name);
  const newUsedFilesObj = Object.keys(usedFiles).reduce((acc, key) => {
    const result = usedFileSchema.validate(usedFiles[key], {
      abortEarly: false,
      stripUnknown: true,
      context: {
        encoding: baseFilesEncoding,
        isSettingGroupsExists: settingGroups.length > 0,
        view: usedFiles[key].view,
        availableSettingGroups,
      },
    });

    if (result.error) {
      validationErrors.push({ parent: key, error: result.error });

      return {
        ...acc,
      };
    }
    return {
      ...acc,
      [key]: result.value,
    };
  }, {});

  if (validationErrors.length > 0) {
    userMessages = [CreateUserMessage.error('При проверке данных для игровых настроек в файле settings.json обнаружены ошибки. Некоторые настройки будут недоступны. Подробности в файле лога.')]; //eslint-disable-line max-len

    validationErrors.forEach((currentMsg) => {
      writeToLogFile(`${currentMsg.parent}: ${currentMsg.error.message}`, LogMessageType.ERROR);
    });
  }

  return { newUserMessages: userMessages, newUsedFilesObj };
};
