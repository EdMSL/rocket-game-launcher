
import Joi from 'joi';
import path from 'path';

import {
  Encoding,
  GameSettingParameterControllerType,
  GameSettingsFileView,
  GameSettingsOptionType,
  PathRegExp,
  LauncherButtonAction,
} from '$constants/misc';
import {
  IGameSettingsConfig,
  IGameSettingsFile,
  IGameSettingsGroup,
  IGameSettingsParameter,
  IGameSettingsRootState,
} from '$types/gameSettings';
import {
  LogMessageType, writeToLogFile, writeToLogFileSync,
} from '$utils/log';
import {
  defaultLauncherConfig, defaultLauncherWindowSettings, MinWindowSize,
} from '$constants/defaultParameters';
import { CustomError, ErrorName } from './errors';
import { getRandomId } from './strings';
import { ILauncherConfig, IWindowSettings } from '$types/main';
import { getUniqueValidationErrors } from './data';
import { IValidationErrors } from '$types/common';

export interface IValidationData {
  errors: IValidationErrors,
  isForAdd: boolean,
}

export interface ICheckResult<T> {
  data: T,
  errors: Joi.ValidationError[],
}

const MIN_NAME_LENGTH = 10;

export const getIsPathWithVariableCorrect = (
  value: string,
  action: string,
  extensions: string[] = [],
): boolean => {
  if (action === LauncherButtonAction.OPEN) {
    return !path.extname(value);
  } else if (action === LauncherButtonAction.RUN && !!path.extname(value)) {
    if (extensions.length > 0) {
      return extensions.includes(path.extname(value).substr(1));
    }

    return Boolean(PathRegExp.PATH_EXTNAME.test(path.extname(value)));
  }

  return false;
};

const checkIsPathWithVariableCorrect = (
  value: string,
  helpers: Joi.CustomHelpers,
): string => {
  if (helpers.state.path![0] === 'customButtons') {
    if (!PathRegExp.CUSTOM_BTNS_AVAILABLE_PATH_VARIABLES.test(value)) {
      throw new Error(`path variable is not correct or not available for this path. Path: ${value}`);
    }

    if (!getIsPathWithVariableCorrect(value, helpers.state.ancestors[0].action)) {
      if (helpers.state.ancestors[0].action === LauncherButtonAction.OPEN) {
        throw new Error(`path to folder is not correct. Path: ${value}`);
      } else if (helpers.state.ancestors[0].action === LauncherButtonAction.RUN) {
        throw new Error(`path to file is not correct. Path: ${value}`);
      } else {
        throw new Error(`path value is not correct. Path: ${value}`);
      }
    }

    return value;
  } else if (helpers.state.path![0] === 'gameSettingsFiles') {
    if (!PathRegExp.GAME_PARAMETERS_AVAILABLE_PATH_VARIABLES.test(value)) {
      throw new Error(`path variable is not correct or not available for this path. Path: ${value}`);
    }

    return value;
  }

  throw new Error(`path value is not correct. Path: ${value}`);
};

const configFileDataSchema = Joi.object<ILauncherConfig>({
  isResizable: Joi.bool().optional().default(defaultLauncherConfig.isResizable),
  width: Joi.number().integer().min(MinWindowSize.WIDTH)
    .optional()
    .default(defaultLauncherConfig.width),
  height: Joi.number().integer().min(MinWindowSize.HEIGHT)
    .optional()
    .default(defaultLauncherConfig.height),
  minWidth: Joi.number().integer().min(MinWindowSize.WIDTH).optional()
    .default(defaultLauncherConfig.minWidth),
  minHeight: Joi.number().integer().min(MinWindowSize.HEIGHT).optional()
    .default(defaultLauncherConfig.minHeight),
  maxWidth: Joi.number().integer().optional().default(defaultLauncherConfig.maxWidth),
  maxHeight: Joi.number().integer().optional().default(defaultLauncherConfig.maxHeight),
  modOrganizer: Joi.object({
    isUsed: Joi.bool().optional().default(false),
    version: Joi.number().valid(1, 2).when(Joi.ref('isUsed'), { is: true, then: Joi.required() }),
    pathToMOFolder: Joi.string().optional().default(defaultLauncherConfig.modOrganizer.pathToMOFolder).pattern(PathRegExp.GAME_DIR, 'correct path'),
    pathToINI: Joi.string().optional().default(defaultLauncherConfig.modOrganizer.pathToINI).pattern(PathRegExp.MO_DIR, 'correct path'),
    pathToProfiles: Joi.string().optional().default(defaultLauncherConfig.modOrganizer.pathToProfiles).pattern(PathRegExp.MO_DIR, 'correct path'),
    pathToMods: Joi.string().optional().default(defaultLauncherConfig.modOrganizer.pathToMods).pattern(PathRegExp.MO_DIR, 'correct path'),
    profileSection: Joi.string().optional(),
    profileParam: Joi.string().optional(),
    profileParamValueRegExp: Joi.string().optional().allow(''),
  }).optional().default(defaultLauncherConfig.modOrganizer),
  documentsPath: Joi.string().optional().allow('').default(defaultLauncherConfig.documentsPath)
    .pattern(PathRegExp.DOCUMENTS, 'correct path'),
  isFirstLaunch: Joi.bool().optional().default(defaultLauncherConfig.isFirstLaunch),
  gameName: Joi.string().optional().allow('').default(defaultLauncherConfig.gameName),
  playButton: Joi.object({
    path: Joi.string().optional().allow('').default(defaultLauncherConfig.playButton.path)
      .pattern(PathRegExp.GAME_DIR, 'correct path'),
    args: Joi.array().items(Joi.object({
      id: Joi.string().optional().default(() => getRandomId('play-btn-arg')),
      data: Joi.string().required(),
    })).optional().default(defaultLauncherConfig.playButton.args),
    label: Joi.string().optional().allow('').default(defaultLauncherConfig.playButton.label),
  }).required(),
  customButtons: Joi.array()
    .items(Joi.object({
      id: Joi.string().optional().default(() => getRandomId('custom-btn')),
      path: Joi.string().required().custom(checkIsPathWithVariableCorrect),
      args: Joi.array().items(Joi.object({
        id: Joi.string().optional().default((parent, helpers) => getRandomId(`custom-btn-arg_${helpers.state.ancestors[2].id.split('_')[1]}`)),
        data: Joi.string().required(),
      })).optional().default([]),
      label: Joi.string().optional().default('Запуск'),
      action: Joi.string().required().valid(...Object.values(LauncherButtonAction)),
    })).optional().default([]),
});

export const checkConfigFileData = (configObj: ILauncherConfig): ILauncherConfig => {
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

  return validateResult.value!;
};

const GameSettingsGroupSchema = Joi.object<IGameSettingsGroup>({
  name: Joi.string().required().alphanum().min(MIN_NAME_LENGTH),
  label: Joi.string().optional().default(Joi.ref('name')),
});

const gameSettingsFileSchema = Joi.object<IGameSettingsFile>({
  name: Joi.string().required().alphanum(),
  label: Joi.string().optional().default(Joi.ref('name')),
  path: Joi.string().required().custom(checkIsPathWithVariableCorrect),
  view: Joi.string().required().valid(...Object.values(GameSettingsFileView)),
  encoding: Joi.string().optional().allow(''),
});

// Схема для поверхностной проверки. Нужна для записи в state во время генерации storage.
export const gameSettingsShallowCheckSchema = Joi.object<IGameSettingsConfig>({
  baseFilesEncoding: Joi.string().optional().default(Encoding.WIN1251),
  gameSettingsGroups: Joi.array().optional().default([]).min(1),
  gameSettingsFiles: Joi.array().required().min(1),
  gameSettingsParameters: Joi.array().required().min(1),
});

// Полная проверка.
export const gameSettingsDeepCheckSchema = Joi.object<IGameSettingsConfig>({
  baseFilesEncoding: Joi.string().optional().default(Encoding.WIN1251),
  gameSettingsGroups: Joi.array()
    .items(GameSettingsGroupSchema).optional().default([])
    .unique((a, b) => a.name === b.name),
  gameSettingsFiles: Joi.array()
    .items(gameSettingsFileSchema).required().min(1)
    .unique((a, b) => a.name === b.name),
  gameSettingsParameters: Joi.array().required().min(1),
});

const gameSettingsFileOptionTypeSchema = Joi.string().required().valid(...Object.values(GameSettingsOptionType)).label('optionType');

// id для опций не указываются в settings.json, вместо этого они генерируются автоматически.
const defaultOptionTypeSchema = Joi.object({
  id: Joi.string().optional().default(() => getRandomId('game-settings-parameter')),
  file: Joi.string().valid(Joi.in('$gameSettingsFiles', { render: true }))
    .messages({ 'any.only': '"file" must be one of {$gameSettingsFiles}' }),
  optionType: Joi.string().required().valid(GameSettingsOptionType.DEFAULT),
  settingGroup: Joi.string().when(
    Joi.ref('$isGameSettingsGroupsExists'), {
      is: true, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ).valid(Joi.in('$gameSettingsGroups', { render: true }))
    .messages({ 'any.only': '"settingGroup" must be one of {$gameSettingsGroups}' }),
  label: Joi.string().optional().default(Joi.ref('name')),
  description: Joi.string().optional().default('').allow(''),
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
});

const groupOptionTypeSchema = Joi.object({
  id: Joi.string().optional().default(() => getRandomId('game-settings-parameter')),
  file: Joi.string().valid(Joi.in('$gameSettingsFiles', { render: true }))
    .messages({ 'any.only': '"file" must be one of {$gameSettingsFiles}' }),
  optionType: Joi.string().required().valid(GameSettingsOptionType.GROUP),
  settingGroup: Joi.string().when(
    Joi.ref('$isGameSettingsGroupsExists'), {
      is: true, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ).valid(Joi.in('$gameSettingsGroups', { render: true }))
    .messages({ 'any.only': '"settingGroup" must be one of {$gameSettingsGroups}' }),
  label: Joi.string().required(),
  description: Joi.string().optional().default('').allow(''),
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
  id: Joi.string().optional().default(() => getRandomId('game-settings-parameter')),
  file: Joi.string().valid(Joi.in('$gameSettingsFiles', { render: true }))
    .messages({ 'any.only': '"file" must be one of {$gameSettingsFiles}' }),
  optionType: Joi.string().required().valid(GameSettingsOptionType.COMBINED),
  settingGroup: Joi.string().when(
    Joi.ref('$isGameSettingsGroupsExists'), {
      is: true, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ).valid(Joi.in('$gameSettingsGroups', { render: true }))
    .messages({ 'any.only': '"settingGroup" must be one of {$gameSettingsGroups}' }),
  label: Joi.string().required(),
  description: Joi.string().optional().default('').allow(''),
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
  id: Joi.string().optional().default(() => getRandomId('game-settings-parameter')),
  file: Joi.string().valid(Joi.in('$gameSettingsFiles', { render: true }))
    .messages({ 'any.only': '"file" must be one of {$gameSettingsFiles}' }),
  optionType: Joi.string().required().valid(GameSettingsOptionType.RELATED),
  settingGroup: Joi.string().when(
    Joi.ref('$isGameSettingsGroupsExists'), {
      is: true, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ).valid(Joi.in('$gameSettingsGroups', { render: true }))
    .messages({ 'any.only': '"settingGroup" must be one of {$gameSettingsGroups}' }),
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
 * Проверка всех полей из `gameSettingsFiles` на соответствие шаблону.
 * Проверка на наличие необходимых и опциональных полей, а так же фильтрация некорректных.
 * На выходе получаем сообщение о результате проверки и итоговые настройки для каждого файла.
*/
export const checkGameSettingsFiles = (
  gameSettingsFiles: IGameSettingsRootState['gameSettingsFiles'],
  baseFilesEncoding: IGameSettingsRootState['baseFilesEncoding'],
  // gameSettingsGroups: IGameSettingsRootState['gameSettingsGroups'],
): ICheckResult<IGameSettingsRootState['gameSettingsFiles']> => {
  writeToLogFileSync('Started checking "gameSettingsFiles" from settings.json.');

  const validationErrors: Joi.ValidationError[] = [];

  // const availableGameSettingsGroups = gameSettingsGroups.map((group) => group.name);
  const newGameSettingsFilesObj = gameSettingsFiles
    .reduce<IGameSettingsFile[]>((currentFiles, currentFile) => {
      // const validationOptions: Joi.ValidationOptions = {
      //   abortEarly: false,
      //   stripUnknown: true,

      //   context: {
      //     encoding: baseFilesEncoding,
      //     isGameSettingsGroupsExists: availableGameSettingsGroups.length > 0,
      //     // view: gameSettingsFiles[fileName].view,
      //     availableGameSettingsGroups,
      //     // fileName,
      //   },
      // };

      const validationResult = gameSettingsFileSchema.validate(
        currentFile,
        {
          abortEarly: false,
          stripUnknown: true,

          context: {
            encoding: baseFilesEncoding,
            // isGameSettingsGroupsExists: availableGameSettingsGroups.length > 0,
            // view: gameSettingsFiles[fileName].view,
            // availableGameSettingsGroups,
          // fileName,
          },
        },
        // validationOptions,
      );

      if (validationResult.error) {
        validationErrors.push(validationResult.error);

        return [...currentFiles];
      }

      return [...currentFiles, validationResult.value];

      // const {
      //   resultParameters: parameters,
      //   errors,
      // } = checkGameSettingsParameters(
      //   gameSettingsFiles[fileName].optionsList,
      //   validationOptions,
      // );

      // if (errors.length > 0) {
      //   validationErrors.push(...errors);
      // }

      // if (parameters.length > 0) {
      //   return {
      //     ...filesObj,
      //     [fileName]: {
      //       ...validationResult.value,
      //       optionsList: parameters,
      //     },
      //   };
      // }

      // return {
      //   ...filesObj,
      // };
    }, []);

  if (validationErrors.length > 0) {
    validationErrors.forEach((currentError) => {
      writeToLogFile(`${currentError.name}. ${currentError.message}`, LogMessageType.ERROR);//eslint-disable-line
    });
  }

  return {
    data: newGameSettingsFilesObj,
    errors: validationErrors,
  };
};

/**
 * Проверка параметров, указанных в gameSettingsParameters.
 * @param parameters Параметры для проверки.
 * @param validationOptions Опции валидатора.
 * @returns Объект с массивом параметров и массивом ошибок проверки.
*/
export const checkGameSettingsParameters = (
  parameters: IGameSettingsRootState['gameSettingsParameters'],
  gameSettingsGroups: IGameSettingsRootState['gameSettingsGroups'],
  gameSettingsFiles: IGameSettingsRootState['gameSettingsFiles'],
): ICheckResult<IGameSettingsParameter[]> => {
  const errors: Joi.ValidationError[] = [];
  const validationOptions: Joi.ValidationOptions = {
    abortEarly: false,
    stripUnknown: true,

    context: {
      // encoding: baseFilesEncoding,
      // isGameSettingsGroupsExists: gameSettingsGroups.length > 0,
      // view: gameSettingsFiles[fileName].view,
      isGameSettingsGroupsExists: gameSettingsGroups.length > 0,
      gameSettingsGroups: gameSettingsGroups.map((group) => group.name),
      gameSettingsFiles: gameSettingsFiles.map((file) => file.name),
      // fileName,
    },
  };

  const resultParameters = parameters.reduce<IGameSettingsParameter[]>((currentParams, currentParam) => {
    let validationResult: Joi.ValidationResult;

    validationResult = gameSettingsFileOptionTypeSchema.validate(
      currentParam.optionType,
      validationOptions,
    );

    if (validationResult.error) {
      errors.push(validationResult.error);
      // errors.push({
      //   parent: `"parameters[${index}]"`,
      //   error: validationResult.error,
      // });

      return [...currentParams];
    }

    switch (currentParam.optionType) {
      case GameSettingsOptionType.COMBINED:
        validationResult = combinedOptionTypeSchema.validate(currentParam, validationOptions);
        break;
      case GameSettingsOptionType.RELATED:
        validationResult = relatedOptionTypeSchema.validate(currentParam, validationOptions);
        break;
      case GameSettingsOptionType.GROUP:
        validationResult = groupOptionTypeSchema.validate(currentParam, validationOptions);
        break;
      default:
        validationResult = defaultOptionTypeSchema.validate(currentParam, validationOptions);
        break;
    }

    if (validationResult.error) {
      errors.push(validationResult.error);
      // errors.push({
      //   parent: `"parameters[${index}]"`,
      //   error: validationResult.error,
      // });

      return [...currentParams];
    }

    return [...currentParams, validationResult.value];
  }, []);

  return {
    data: resultParameters,
    errors,
  };
};

/**
 * Проверка файла игровых настроек на соответствие требованиям.
 * Проверка на наличие необходимых и опциональных полей, а так же фильтрация некорректных.
 * На выходе получаем сообщение о результате проверки и итоговый конфиг.
 * Поля используемых файлов для настроек проверяются отдельно.
*/
export const checkGameSettingsConfigShallow = (
  configObj: IGameSettingsConfig,
): IGameSettingsConfig => {
  writeToLogFileSync('Started shallow checking the settings.json file.');

  const validateResult = gameSettingsShallowCheckSchema.validate(configObj, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (validateResult.error) {
    throw new CustomError(`settings.json validation error. ${validateResult.error.message}.`); //eslint-disable-line max-len
  }

  return validateResult.value;
};

export const checkGameSettingsConfigFull = (
  configObj: IGameSettingsConfig,
): ICheckResult<IGameSettingsConfig> => {
  writeToLogFileSync('Started full checking the settings.json file.');
  const validationErrors: Joi.ValidationError[] = [];

  const validationResult = gameSettingsDeepCheckSchema.validate(configObj, {
    abortEarly: false,
    stripUnknown: true,
  });
  console.log('error: ', validationResult.error?.details);
  console.log('validationResult.value: ', validationResult.value);
  if (validationResult.error) {
    validationErrors.push(validationResult.error);
  }

  const { data: parameters, errors: paramErrors } = checkGameSettingsParameters(
    validationResult.value!.gameSettingsParameters,
    validationResult.value!.gameSettingsGroups,
    validationResult.value!.gameSettingsFiles,
  );

  if (paramErrors.length > 0) {
    validationErrors.push(...paramErrors);
  }

  const newConfigObj = {
    ...validationResult.value!,
    gameSettingsParameters: parameters,
  };

  return {
    data: newConfigObj,
    errors: validationErrors,
  };
};

/**
  Сравнение двух объектов на равенство полей с помощью JSON.stringify.
  @param a Первый объект.
  @param b Второй объект.
  @returns Равны ли объекты.
*/
export const checkObjectForEqual = (a: object, b: object): boolean => JSON.stringify(a) === JSON.stringify(b);

const getWindowSettingsFromLauncherConfig = (
  config: ILauncherConfig,
): IWindowSettings => Object.keys(defaultLauncherWindowSettings).reduce<IWindowSettings>(
  (acc, current) => ({
    ...acc,
    [current]: config[current],
  }), {} as IWindowSettings,
);

/**
  Сравнение двух объектов настроек окна приложения на равенство полей.
  @param settingsFirst Первый объект.
  @param settingsSecond Второй объект.
  @returns Равны ли объекты.
*/
export const getIsWindowSettingEqual = (
  settingsFirst: ILauncherConfig,
  settingsSecond: ILauncherConfig,
): boolean => checkObjectForEqual(
  getWindowSettingsFromLauncherConfig(settingsFirst),
  getWindowSettingsFromLauncherConfig(settingsSecond),
);

/**
  Валидация значений полей `number` в `developer screen`.
  @param target Поле `target` объекта `event`.
  @param currentConfig Текущие значения конфигурации лаунчера.
  @param currentErrors Текущие ошибки валидации.
  @returns Массив из двух массивов: ошибки для добавления и ошибки для удаления.
*/
export const validateNumberInputs = (
  target: EventTarget & HTMLInputElement,
  currentConfig: ILauncherConfig,
  currentErrors: IValidationErrors,
): IValidationErrors => {
  let errors: IValidationErrors = { ...currentErrors };

  errors = getUniqueValidationErrors(
    errors,
    { [target.id]: ['less min value'] },
    +target.value < +target.min,
  );

  if (currentConfig.isResizable) {
    const namesAndValues = target.id.toLowerCase().includes('width')
      ? {
          default: currentConfig.width,
          min: currentConfig.minWidth,
          max: currentConfig.maxWidth,
          defaultName: 'width',
          minName: 'minWidth',
          maxName: 'maxWidth',
        }
      : {
          default: currentConfig.height,
          min: currentConfig.minHeight,
          max: currentConfig.maxHeight,
          defaultName: 'height',
          minName: 'minHeight',
          maxName: 'maxHeight',
        };

    if (target.id === 'width' || target.id === 'height') {
      errors = getUniqueValidationErrors(
        errors,
        {
          [target.id]: [`less config ${namesAndValues.minName}`],
          [namesAndValues.minName]: [`more config ${target.id}`],
        },
        +target.value < namesAndValues.min,
      );

      errors = getUniqueValidationErrors(
        errors,
        {
          [target.id]: [`more config ${namesAndValues.maxName}`],
          [namesAndValues.maxName]: [`less config ${target.id}`],
        },
        +target.value > namesAndValues.max && namesAndValues.max > 0,
      );
    } else if (target.id === 'minWidth' || target.id === 'minHeight') {
      errors = getUniqueValidationErrors(
        errors,
        {
          [target.id]: [`more config ${namesAndValues.defaultName}`],
          [namesAndValues.defaultName]: [`less config ${target.id}`],
        },
        +target.value > namesAndValues.default,
      );

      errors = getUniqueValidationErrors(
        errors,
        {
          [target.id]: [`more config ${namesAndValues.maxName}`],
          [namesAndValues.maxName]: [`less config ${target.id}`],
        },
        +target.value > namesAndValues.max && namesAndValues.max > 0,
      );
    } else if (target.id === 'maxWidth' || target.id === 'maxHeight') {
      errors = getUniqueValidationErrors(
        errors,
        {
          [target.id]: [`less config ${namesAndValues.defaultName}`],
          [namesAndValues.defaultName]: [`more config ${target.id}`],
        },
        +target.value < namesAndValues.default && +target.value > 0,
      );
      errors = getUniqueValidationErrors(
        errors,
        {
          [target.id]: [`less config ${namesAndValues.minName}`],
          [namesAndValues.minName]: [`more config ${target.id}`],
        },
        +target.value < namesAndValues.min && +target.value > 0,
      );
    }
  }
  return errors;
};
