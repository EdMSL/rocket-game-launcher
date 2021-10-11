
import Joi from 'joi';

import {
  Encoding,
  GameSettingParameterControllerType,
  GameSettingsFileView,
  GameSettingsOptionType,
  CustomPathName,
  DefaultCustomPathName,
} from '$constants/misc';
import {
  IGameSettingsConfig,
  IGameSettingsFiles,
  IGameSettingsParameter,
  IGameSettingsRootState,
} from '$types/gameSettings';
import {
  LogMessageType, writeToLogFile, writeToLogFileSync,
} from '$utils/log';
import {
  defaultLauncherConfig,
  ILauncherConfig,
  minimalLauncherConfig,
} from '$constants/defaultParameters';
import { ISystemRootState } from '$types/system';
import { CustomError, ErrorName } from './errors';
import { getRandomId } from './strings';

interface IGameSettingsFileError {
  parent: string,
  error: string,
}

export interface IGameSettingsConfigCheckResult {
  files: IGameSettingsConfig['gameSettingsFiles'],
  isError: boolean,
}

const configFileDataSchema = Joi.object({
  isResizable: Joi.bool().optional().default(defaultLauncherConfig.isResizable),
  minWidth: Joi.number().optional().default(defaultLauncherConfig.minWidth),
  minHeight: Joi.number().optional().default(defaultLauncherConfig.minHeight),
  maxWidth: Joi.number().optional().default(defaultLauncherConfig.maxWidth),
  maxHeight: Joi.number().optional().default(defaultLauncherConfig.maxHeight),
  width: Joi.number().optional().default(defaultLauncherConfig.width),
  height: Joi.number().optional().default(defaultLauncherConfig.height),
  modOrganizer: Joi.object({
    isUsed: Joi.bool().optional(),
    version: Joi.number().valid(1, 2).when(Joi.ref('isUsed'), { is: true, then: Joi.required() }),
    path: Joi.string().optional().pattern(CustomPathName.CORRECT_PATH_REGEXP, 'correct path'),
    pathToINI: Joi.string().optional().pattern(CustomPathName.CORRECT_PATH_REGEXP, 'correct path'),
    pathToProfiles: Joi.string().optional().pattern(CustomPathName.CORRECT_PATH_REGEXP, 'correct path'),
    pathToMods: Joi.string().optional().pattern(CustomPathName.CORRECT_PATH_REGEXP, 'correct path'),
    profileSection: Joi.string().optional(),
    profileParam: Joi.string().optional(),
    profileParamValueRegExp: Joi.string().optional().allow(''),
  }).default(minimalLauncherConfig.modOrganizer),
  documentsPath: Joi.string().optional().allow('').default(defaultLauncherConfig.documentsPath)
    .pattern(CustomPathName.CORRECT_PATH_REGEXP, 'correct path'),
  isFirstLaunch: Joi.bool().optional().default(defaultLauncherConfig.isFirstLaunch),
  customPaths: Joi.object().pattern(
    Joi.string().pattern(CustomPathName.CUSTOM_NAME_REGEXP, 'custom path name').not(...Object.values(DefaultCustomPathName)),
    Joi.string(),
  ).optional().default(defaultLauncherConfig.customPaths),
  gameName: Joi.string().optional().allow(''),
  playButton: Joi.object({
    path: Joi.string().optional().allow('').default(''),
    args: Joi.array().items(Joi.string()).optional().default([]),
    label: Joi.string().optional().allow('').default('Играть'),
  }).optional().default(defaultLauncherConfig.playButton),
  customButtons: Joi.array()
    .items(Joi.object({
      id: Joi.string().optional().default(() => getRandomId('custom-btn')),
      path: Joi.string().required(),
      args: Joi.array().items(Joi.string()).optional().default([]),
      label: Joi.string().required(),
    })).optional().default([]),
});

export const checkConfigFileData = (configObj: ILauncherConfig): ISystemRootState => {
  writeToLogFileSync('Started checking the config.json file.');

  const validateResult = configFileDataSchema.validate(configObj, {
    abortEarly: false,
  });

  if (validateResult.error && validateResult.error?.details?.length > 0) {
    validateResult.error.details.forEach((currentMsg) => {
      writeToLogFileSync(currentMsg.message, LogMessageType.ERROR);
    });

    throw new CustomError('Failed to validate the config.json file.', ErrorName.VALIDATION);
  }

  return validateResult.value;
};

const settingsMainSchema = Joi.object<IGameSettingsConfig>({
  gameSettingsGroups: Joi.array()
    .items(Joi.object({
      name: Joi.string().required(),
      label: Joi.string().optional().default(Joi.ref('name')),
    })).optional().default([])
    .unique((a, b) => a.name === b.name),
  baseFilesEncoding: Joi.string().optional().default(Encoding.WIN1251),
  gameSettingsFiles: Joi.object()
    .pattern(
      Joi.string(),
      Joi.any(),
    ).required().min(1),
});

const gameSettingsFileSchema = Joi.object({
  encoding: Joi.string().optional().default(Joi.ref('$encoding')),
  path: Joi.string().required(),
  view: Joi.string().required().valid(...Object.values(GameSettingsFileView)),
  optionsList: Joi.array().items(Joi.object().pattern(
    Joi.string(),
    Joi.any(),
  )),
});

// id для опций не указываются в settings.json, вместо этого они генерируются автоматически.
const defaultOptionTypeSchema = Joi.object({
  id: Joi.string().optional().default(() => getRandomId('option')),
  optionType: Joi.string().required().valid(GameSettingsOptionType.DEFAULT),
  name: Joi.string().required(),
  label: Joi.string().optional().default(Joi.ref('name')),
  description: Joi.string().optional().default('').allow(''),
  iniGroup: Joi.string().when(
    Joi.ref('$view'), {
      is: GameSettingsFileView.SECTIONAL, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ),
  valueName: Joi.string().when(
    Joi.ref('$view'), {
      is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ),
  valuePath: Joi.string().when(
    Joi.ref('$view'), {
      is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ),
  settingGroup: Joi.string().when(
    Joi.ref('$isGameSettingsGroupsExists'), {
      is: true, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ).valid(Joi.in('$availableGameSettingsGroups', { render: true }))
    .messages({ 'any.only': '"settingGroup" must be one of {$availableGameSettingsGroups}' }),
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

const groupOptionTypeSchema = Joi.object({
  id: Joi.string().optional().default(() => getRandomId('option')),
  optionType: Joi.string().required().valid(GameSettingsOptionType.GROUP),
  settingGroup: Joi.string().when(
    Joi.ref('$isGameSettingsGroupsExists'), {
      is: true, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ).valid(Joi.in('$availableGameSettingsGroups', { render: true }))
    .messages({ 'any.only': '"settingGroup" must be one of {$availableGameSettingsGroups}' }),
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
      valueName: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ),
      valuePath: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ),
    })).required().min(2),
});

const combinedOptionTypeSchema = Joi.object({
  id: Joi.string().optional().default(() => getRandomId('option')),
  optionType: Joi.string().required().valid(GameSettingsOptionType.COMBINED),
  settingGroup: Joi.string().when(
    Joi.ref('$isGameSettingsGroupsExists'), {
      is: true, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ).valid(Joi.in('$availableGameSettingsGroups', { render: true }))
    .messages({ 'any.only': '"settingGroup" must be one of {$availableGameSettingsGroups}' }),
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
      valueName: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ),
      valuePath: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ),
    })).required().min(2),
});

const relatedOptionTypeSchema = Joi.object({
  id: Joi.string().optional().default(() => getRandomId('option')),
  optionType: Joi.string().required().valid(GameSettingsOptionType.RELATED),
  settingGroup: Joi.string().when(
    Joi.ref('$isGameSettingsGroupsExists'), {
      is: true, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ).valid(Joi.in('$availableGameSettingsGroups', { render: true }))
    .messages({ 'any.only': '"settingGroup" must be one of {$availableGameSettingsGroups}' }),
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
      valueName: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ),
      valuePath: Joi.string().when(
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

/**
 * Проверка файла игровых настроек на соответствие требованиям.
 * Проверка на наличие необходимых и опциональных полей, а так же фильтрация некорректных.
 * На выходе получаем сообщение о результате проверки и итоговый конфиг.
 * Поля используемых файлов для настроек проверяются отдельно.
*/
export const checkGameSettingsConfigMainFields = (
  configObj: IGameSettingsConfig,
): IGameSettingsConfig => {
  writeToLogFileSync('Started checking the settings.json file.');

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
 * Проверка опций, указанных для файла в gameSettingsFiles.
 * @param optionsList Опции из файла для проверки.
 * @param validationOptions Опции валидатора.
 * @returns Объект с массивом игровых опций и массивом ошибок проверки.
*/
const checkGameSettingsFileOptionsList = (
  optionsList: IGameSettingsParameter[],
  validationOptions: Joi.ValidationOptions,
): { options: IGameSettingsParameter[], errors: string[], } => {
  const errors: string[] = [];

  const options = optionsList.reduce<IGameSettingsParameter[]>((totalOptions, currentOption) => {
    let validationResult: Joi.ValidationResult;

    if (!Object.values(GameSettingsOptionType).includes(currentOption.optionType)) {
      errors.push(`"optionType" must be one of [${Object.values(GameSettingsOptionType).join(', ')}]`);

      return [...totalOptions];
    }

    switch (currentOption.optionType) {
      case GameSettingsOptionType.COMBINED:
        validationResult = combinedOptionTypeSchema.validate(currentOption, validationOptions);
        break;
      case GameSettingsOptionType.RELATED:
        validationResult = relatedOptionTypeSchema.validate(currentOption, validationOptions);
        break;
      case GameSettingsOptionType.GROUP:
        validationResult = groupOptionTypeSchema.validate(currentOption, validationOptions);
        break;
      default:
        validationResult = defaultOptionTypeSchema.validate(currentOption, validationOptions);
        break;
    }

    if (validationResult.error) {
      errors.push(validationResult.error.message);

      return [...totalOptions];
    }

    return [...totalOptions, validationResult.value];
  }, []);

  return {
    options,
    errors,
  };
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
): IGameSettingsConfigCheckResult => {
  writeToLogFileSync('Started checking "gameSettingsFiles" from settings.json.');

  const validationErrors: IGameSettingsFileError[] = [];

  const availableGameSettingsGroups = gameSettingsGroups.map((group) => group.name);
  const newGameSettingsFilesObj = Object
    .keys(gameSettingsFiles)
    .reduce<IGameSettingsFiles>((filesObj, fileName) => {
      const validationOptions = {
        abortEarly: false,
        stripUnknown: true,
        context: {
          encoding: baseFilesEncoding,
          isGameSettingsGroupsExists: gameSettingsGroups.length > 0,
          view: gameSettingsFiles[fileName].view,
          availableGameSettingsGroups,
        },
      };

      const validationResult = gameSettingsFileSchema.validate(
        gameSettingsFiles[fileName],
        validationOptions,
      );

      if (validationResult.error) {
        validationErrors.push({ parent: fileName, error: validationResult.error.message });

        return {
          ...filesObj,
        };
      }

      const {
        options,
        errors,
      } = checkGameSettingsFileOptionsList(
        gameSettingsFiles[fileName].optionsList,
        validationOptions,
      );

      if (errors.length > 0) {
        validationErrors.push({ parent: fileName, error: errors.join() });
      }

      if (options.length > 0) {
        return {
          ...filesObj,
          [fileName]: {
            ...validationResult.value,
            optionsList: options,
          },
        };
      }

      return {
        ...filesObj,
      };
    }, {});

  if (validationErrors.length > 0) {
    validationErrors.forEach((currentError) => {
      if (currentError.error) {
        writeToLogFile(`${currentError.parent}: ${currentError.error}`, LogMessageType.ERROR);
      }
    });
  }

  return {
    files: newGameSettingsFilesObj,
    isError: validationErrors.length > 0,
  };
};
