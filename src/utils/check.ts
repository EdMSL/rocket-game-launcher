
import Joi from 'joi';

import {
  Encoding,
  GameSettingParameterControllerType,
  GameSettingsFileView,
  GameSettingParameterType,
} from '$constants/misc';
import { IGameSettingsConfig, IGameSettingsRootState } from '$types/gameSettings';
import {
  LogMessageType, writeToLogFile, writeToLogFileSync,
} from '$utils/log';
import { defaultLauncherConfig } from '$constants/defaultParameters';
import { ISystemRootState } from '$types/system';
import { CustomError } from './errors';
import { getRandomId } from './strings';

interface IGameSettingsFileError {
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
  gameSettingsGroups: Joi.array()
    .items(Joi.object({
      name: Joi.string().required(),
      label: Joi.string().optional().default(Joi.ref('name')),
    })).optional().min(1)
    .default([])
    .unique((a, b) => a.name === b.name),
  baseFilesEncoding: Joi.string().optional().default(Encoding.WIN1251),
  gameSettingsFiles: Joi.object()
    .pattern(
      Joi.string(),
      Joi.object().pattern(
        Joi.string(),
        Joi.any(),
      ),
    ).required(),
});

// id для параметров не указываются в settings.json, вместо этого они генерируются автоматически.
const settingParameterSchemaDefault = Joi.object({
  id: Joi.string().optional().default(() => getRandomId('parameter')),
  parameterType: Joi.string().optional().default(GameSettingParameterType.DEFAULT).valid(GameSettingParameterType.DEFAULT),
  name: Joi.string().required(),
  label: Joi.string().optional().default(Joi.ref('name')),
  description: Joi.string().optional().default('').allow(''),
  iniGroup: Joi.string().when(
    Joi.ref('$view'), {
      is: GameSettingsFileView.SECTIONAL, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ),
  attributeName: Joi.string().when(
    Joi.ref('$view'), {
      is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ),
  attributePath: Joi.string().when(
    Joi.ref('$view'), {
      is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ),
  settingGroup: Joi.string().when(
    Joi.ref('$isGameSettingsGroupsExists'), {
      is: true, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ).valid(Joi.ref('$availableGameSettingsGroups', { in: true })),
  controllerType: Joi.string().required().valid(...Object.values(GameSettingParameterControllerType)),
  options: Joi.object().pattern(
    Joi.string(),
    Joi.string(),
  ).when(
    Joi.ref('controllerType'), { is: GameSettingParameterControllerType.SELECT, then: Joi.required() },
  ),
  min: Joi.number().when(
    Joi.ref('controllerType'), { is: GameSettingParameterControllerType.RANGE, then: Joi.required() },
  ),
  max: Joi.number().when(
    Joi.ref('controllerType'), { is: GameSettingParameterControllerType.RANGE, then: Joi.required() },
  ),
  step: Joi.number().when(
    Joi.ref('controllerType'), { is: GameSettingParameterControllerType.RANGE, then: Joi.required() },
  ),
});

const settingParameterSchemaGroup = Joi.object({
  id: Joi.string().optional().default(() => getRandomId('parameter')),
  parameterType: Joi.string().required().valid(GameSettingParameterType.GROUP),
  settingGroup: Joi.string().when(
    Joi.ref('$isGameSettingsGroupsExists'), {
      is: true, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ).valid(Joi.ref('$availableGameSettingsGroups', { in: true })),
  controllerType: Joi.string().required().valid(...Object.values(GameSettingParameterControllerType)),
  options: Joi.object().pattern(
    Joi.string(),
    Joi.string(),
  ).when(
    Joi.ref('controllerType'), { is: GameSettingParameterControllerType.SELECT, then: Joi.required() },
  ),
  min: Joi.number().when(
    Joi.ref('controllerType'), { is: GameSettingParameterControllerType.RANGE, then: Joi.required() },
  ),
  max: Joi.number().when(
    Joi.ref('controllerType'), { is: GameSettingParameterControllerType.RANGE, then: Joi.required() },
  ),
  step: Joi.number().when(
    Joi.ref('controllerType'), { is: GameSettingParameterControllerType.RANGE, then: Joi.required() },
  ),
  label: Joi.string().required(),
  description: Joi.string().optional().default('').allow(''),
  items: Joi.array()
    .items(Joi.object({
      id: Joi.string().optional().default(() => getRandomId('item')),
      name: Joi.string().required(),
      iniGroup: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.SECTIONAL, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ),
      attributeName: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ),
      attributePath: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ),
    })).required().min(2),
});

const settingParameterSchemaCombined = Joi.object({
  id: Joi.string().optional().default(() => getRandomId('parameter')),
  parameterType: Joi.string().required().valid(GameSettingParameterType.COMBINED),
  settingGroup: Joi.string().when(
    Joi.ref('$isGameSettingsGroupsExists'), {
      is: true, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ).valid(Joi.ref('$availableGameSettingsGroups', { in: true })),
  controllerType: Joi.string().required().valid(GameSettingParameterControllerType.SELECT),
  separator: Joi.string().optional().default(':'),
  options: Joi.object().pattern(
    Joi.string(),
    Joi.string(),
  ).when(
    Joi.ref('controllerType'), { is: GameSettingParameterControllerType.SELECT, then: Joi.required() },
  ).custom((value, helpers) => {
    Object.keys(value).forEach((element) => {
      if (element.split(helpers.state.ancestors[0].separator).length !== helpers.state.ancestors[0].items.length) {
        throw new Error('the number of parts of the option key is not equal to the number of "items" or incorrect "separator" used.'); //eslint-disable-line max-len
      }
    });
    return value;
  }),
  min: Joi.number().when(
    Joi.ref('controllerType'), { is: GameSettingParameterControllerType.RANGE, then: Joi.required() },
  ),
  max: Joi.number().when(
    Joi.ref('controllerType'), { is: GameSettingParameterControllerType.RANGE, then: Joi.required() },
  ),
  step: Joi.number().when(
    Joi.ref('controllerType'), { is: GameSettingParameterControllerType.RANGE, then: Joi.required() },
  ),
  label: Joi.string().required(),
  description: Joi.string().optional().default('').allow(''),
  items: Joi.array()
    .items(Joi.object({
      id: Joi.string().optional().default(() => getRandomId('item')),
      name: Joi.string().required(),
      iniGroup: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.SECTIONAL, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ),
      attributeName: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ),
      attributePath: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ),
    })).required().min(2),
});

const settingParameterSchemaRelated = Joi.object({
  id: Joi.string().optional().default(() => getRandomId('parameter')),
  parameterType: Joi.string().required().valid(GameSettingParameterType.RELATED),
  settingGroup: Joi.string().when(
    Joi.ref('$isGameSettingsGroupsExists'), {
      is: true, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ).valid(Joi.ref('$availableGameSettingsGroups', { in: true })),
  description: Joi.string().optional().default('').allow(''),
  label: Joi.string().required(),
  items: Joi.array()
    .items(Joi.object({
      id: Joi.string().optional().default(() => getRandomId('item')),
      name: Joi.string().required(),
      iniGroup: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.SECTIONAL, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ),
      attributeName: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ),
      attributePath: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ),
      controllerType: Joi.string().required().valid(...Object.values(GameSettingParameterControllerType)),
      options: Joi.object().pattern(
        Joi.string(),
        Joi.string(),
      ).when(
        Joi.ref('controllerType'), { is: GameSettingParameterControllerType.SELECT, then: Joi.required() },
      ),
      min: Joi.number().when(
        Joi.ref('controllerType'), { is: GameSettingParameterControllerType.RANGE, then: Joi.required() },
      ),
      max: Joi.number().when(
        Joi.ref('controllerType'), { is: GameSettingParameterControllerType.RANGE, then: Joi.required() },
      ),
      step: Joi.number().when(
        Joi.ref('controllerType'), { is: GameSettingParameterControllerType.RANGE, then: Joi.required() },
      ),
    })).required().min(2),
});

const gameSettingsFileSchema = Joi.object({
  encoding: Joi.string().optional().default(Joi.ref('$encoding')),
  path: Joi.string().required(),
  view: Joi.string().required().valid(...Object.values(GameSettingsFileView)),
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
 * Проверка всех полей из `gameSettingsFiles` на соответствие шаблону.
 * Проверка на наличие необходимых и опциональных полей, а так же фильтрация некорректных.
 * На выходе получаем сообщение о результате проверки и итоговые настройки для каждого файла.
*/
export const checkGameSettingsFiles = (
  gameSettingsFiles: IGameSettingsRootState['gameSettingsFiles'],
  baseFilesEncoding: IGameSettingsRootState['baseFilesEncoding'],
  gameSettingsGroups: IGameSettingsRootState['gameSettingsGroups'],
): IGameSettingsConfig['gameSettingsFiles'] => {
  writeToLogFileSync('Start checking of game settings files in settings.json.');

  const validationErrors: IGameSettingsFileError[] = [];

  const availableGameSettingsGroups = gameSettingsGroups.map((group) => group.name);
  const newGameSettingsFilesObj = Object.keys(gameSettingsFiles).reduce((filesObj, fileName) => {
    const validationResult = gameSettingsFileSchema.validate(gameSettingsFiles[fileName], {
      abortEarly: false,
      stripUnknown: true,
      context: {
        encoding: baseFilesEncoding,
        isGameSettingsGroupsExists: gameSettingsGroups.length > 0,
        view: gameSettingsFiles[fileName].view,
        availableGameSettingsGroups,
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

  if (Object.keys(newGameSettingsFilesObj).length === 0) {
    throw new CustomError('No options available after game settings validation.');
  }

  return newGameSettingsFilesObj;
};
