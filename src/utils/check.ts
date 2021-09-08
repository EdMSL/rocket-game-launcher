
import Joi from 'joi';

import {
  Encoding,
  SettingParameterControllerType,
  UsedFileView,
  SettingsParameterType,
} from '$constants/misc';
import { IGameSettingsConfig, IGameSettingsRootState } from '$types/gameSettings';
import { IUserMessage } from '$types/main';
import {
  LogMessageType, writeToLogFile, writeToLogFileSync,
} from '$utils/log';
import { defaultLauncherConfig } from '$constants/defaultParameters';
import { ISystemRootState } from '$types/system';
import { CustomError } from './errors';

interface IUsedFileError {
  parent: string,
  error: string,
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

const settingsMainSchema = Joi.object<IGameSettingsConfig>({
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

const settingParameterSchemaDefault = Joi.object({
  parameterType: Joi.string().optional().default(SettingsParameterType.DEFAULT).valid(SettingsParameterType.DEFAULT),
  name: Joi.string().required(),
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
  controllerType: Joi.string().required().valid(...Object.values(SettingParameterControllerType)),
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

const settingParameterSchemaGroup = Joi.object({
  parameterType: Joi.string().required().valid(SettingsParameterType.GROUP),
  settingGroup: Joi.string().when(
    Joi.ref('$isSettingGroupsExists'), {
      is: true, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ).valid(Joi.ref('$availableSettingGroups', { in: true })),
  controllerType: Joi.string().required().valid(...Object.values(SettingParameterControllerType)),
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
  label: Joi.string().required(),
  items: Joi.array()
    .items(Joi.object({
      name: Joi.string().required(),
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
    })).required().min(2),
});

const settingParameterSchemaCombined = Joi.object({
  parameterType: Joi.string().required().valid(SettingsParameterType.COMBINED),
  settingGroup: Joi.string().when(
    Joi.ref('$isSettingGroupsExists'), {
      is: true, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ).valid(Joi.ref('$availableSettingGroups', { in: true })),
  controllerType: Joi.string().required().valid(SettingParameterControllerType.SELECT),
  separator: Joi.string().optional().default(':'),
  options: Joi.object().pattern(
    Joi.string(),
    Joi.string(),
  ).when(
    Joi.ref('controllerType'), { is: SettingParameterControllerType.SELECT, then: Joi.required() },
  ).custom((value, helpers) => {
    Object.keys(value).forEach((element) => {
      if (element.split(helpers.state.ancestors[0].separator).length !== helpers.state.ancestors[0].items) {
        throw new Error('the number of parts of the option key is not equal to the number of "items" or incorrect "separator" used.'); //eslint-disable-line max-len
      }
      return value;
    });
  }),
  min: Joi.number().when(
    Joi.ref('controllerType'), { is: SettingParameterControllerType.RANGE, then: Joi.required() },
  ),
  max: Joi.number().when(
    Joi.ref('controllerType'), { is: SettingParameterControllerType.RANGE, then: Joi.required() },
  ),
  step: Joi.number().when(
    Joi.ref('controllerType'), { is: SettingParameterControllerType.RANGE, then: Joi.required() },
  ),
  label: Joi.string().required(),
  items: Joi.array()
    .items(Joi.object({
      name: Joi.string().required(),
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
    })).required().min(2),
});

const settingParameterSchemaRelated = Joi.object({
  parameterType: Joi.string().required().valid(SettingsParameterType.RELATED),
  settingGroup: Joi.string().when(
    Joi.ref('$isSettingGroupsExists'), {
      is: true, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ).valid(Joi.ref('$availableSettingGroups', { in: true })),
  label: Joi.string().required(),
  items: Joi.array()
    .items(Joi.object({
      name: Joi.string().required(),
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
      controllerType: Joi.string().required().valid(...Object.values(SettingParameterControllerType)),
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
    })).required().min(2),
});

const usedFileSchema = Joi.object({
  encoding: Joi.string().optional().default(Joi.ref('$encoding')),
  path: Joi.string().required(),
  view: Joi.string().required().valid(...Object.values(UsedFileView)),
  parameters: Joi.array().items(Joi.alternatives().try(
    settingParameterSchemaDefault,
    settingParameterSchemaGroup,
    settingParameterSchemaRelated,
    settingParameterSchemaCombined,
  )),
});

/**
 * Проверка файла игровых настроек на соответствие требованиям.
 * Проверка на наличие необходимых и опциональных полей, а так же фильтрация некорректных.
 * На выходе получаем сообщение о результате проверки и итоговый конфиг.
 * Поля используемых файлов для настроек проверяются отдельно.
*/
export const checkGameSettingsConfigMainFields = (
  configObj: IGameSettingsConfig,
): IGameSettingsConfig => {
  writeToLogFileSync('Start of settings.json checking.');

  const validateResult = settingsMainSchema.validate(configObj, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (validateResult.error) {
    throw new CustomError(`settings.json main fields validation error. ${validateResult.error.message}.`); //eslint-disable-line max-len
  }

  return validateResult.value;
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
): IGameSettingsConfig['usedFiles'] => {
  writeToLogFileSync('Start checking of used files in settings.json.');

  const validationErrors: IUsedFileError[] = [];

  const availableSettingGroups = settingGroups.map((group) => group.name);
  const newUsedFilesObj = Object.keys(usedFiles).reduce((filesObj, fileName) => {
    const validationResult = usedFileSchema.validate(usedFiles[fileName], {
      abortEarly: false,
      stripUnknown: true,
      context: {
        encoding: baseFilesEncoding,
        isSettingGroupsExists: settingGroups.length > 0,
        view: usedFiles[fileName].view,
        availableSettingGroups,
      },
    });

    if (validationResult.error) {
      validationResult.error.details.forEach((detail) => {
        if (detail.type === 'alternatives.match') {
          validationErrors.push({ parent: fileName, error: detail.context!.message });
        } else {
          validationErrors.push({ parent: fileName, error: detail.message });
        }
      });

      return {
        ...filesObj,
      };
    }
    return {
      ...filesObj,
      [fileName]: validationResult.value,
    };
  }, {});

  if (validationErrors.length > 0) {
    validationErrors.forEach((currentError) => {
      writeToLogFile(`${currentError.parent}: ${currentError.error}`, LogMessageType.WARNING);
    });
  }

  if (Object.keys(newUsedFilesObj).length === 0) {
    throw new CustomError('No options available after game settings validation.');
  }

  return newUsedFilesObj;
};
