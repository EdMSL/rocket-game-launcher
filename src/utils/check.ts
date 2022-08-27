
import Joi from 'joi';
import path from 'path';

import {
  Encoding,
  UIControllerType,
  GameSettingsFileView,
  GameSettingsOptionType,
  PathRegExp,
  LauncherButtonAction,
} from '$constants/misc';
import {
  IGameSettingsConfig,
  IGameSettingsFile,
  IGameSettingsGroup,
  IGameSettingsOption,
  IGameSettingsRootState,
} from '$types/gameSettings';
import {
  LogMessageType, writeToLogFileSync,
} from '$utils/log';
import {
  defaultGameSettingsConfig,
  defaultLauncherConfig,
  GAME_SETTINGS_CONFIG_FILE_NAME,
  LAUNCHER_CONFIG_FILE_NAME,
  MinWindowSize,
} from '$constants/defaultData';
import { CustomError, ErrorName } from './errors';
import { generateSelectOptionsString, getRandomId } from './strings';
import { ILauncherConfig } from '$types/main';
import { getGameSettingsElementsNames } from './data';

export interface ICheckResult<T> {
  data: T,
  errors: Joi.ValidationError[],
}

const MIN_NAME_LENGTH = 10;

const writeErrorsToLog = (error: Joi.ValidationError|Joi.ValidationError[]): void => {
  if (Array.isArray(error)) {
    error.forEach((currentError) => {
      writeErrorsToLog(currentError);
    });
  } else {
    error.details.forEach((errorItem) => {
      writeToLogFileSync(errorItem.message, LogMessageType.ERROR);
    });
  }
};

export const getIsPathWithVariableCorrect = (
  value: string,
  action: string,
  extensions: string[] = [],
): boolean => {
  if (action === LauncherButtonAction.OPEN) {
    return !path.extname(value);
  } else if (action === LauncherButtonAction.RUN && !!path.extname(value)) {
    if (extensions.length > 0) {
      return extensions.includes(path.extname(value).substring(1));
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
      throw new Error(`path variable is not correct or not available for this path. Path: ${value}`); //eslint-disable-line max-len
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
  isFirstStart: Joi.bool().optional().default(defaultLauncherConfig.isFirstStart),
  gameName: Joi.string().optional().allow('').default(defaultLauncherConfig.gameName),
  playButton: Joi.object({
    path: Joi.string().optional().allow('').default(defaultLauncherConfig.playButton.path)
      .pattern(PathRegExp.GAME_DIR, 'correct path'),
    args: Joi.array().items(Joi.object({
      id: Joi.string().optional().default(() => getRandomId()),
      data: Joi.string().required(),
    })).optional().default(defaultLauncherConfig.playButton.args),
    label: Joi.string().optional().allow(''),
  }).required(),
  customButtons: Joi.array()
    .items(Joi.object({
      id: Joi.string().optional().default(() => getRandomId()),
      path: Joi.string().required().custom(checkIsPathWithVariableCorrect),
      args: Joi.array().items(Joi.object({
        id: Joi.string().optional().default(() => getRandomId()),
        data: Joi.string().required(),
      })).optional().default([]),
      label: Joi.string().optional().default('Запуск'),
      action: Joi.string().required().valid(...Object.values(LauncherButtonAction)),
    })).optional().default([]),
});

export const checkLauncherConfigFileData = (configObj: ILauncherConfig): ILauncherConfig => {
  writeToLogFileSync(`Started checking the ${LAUNCHER_CONFIG_FILE_NAME} file.`);

  const validateResult = configFileDataSchema.validate(configObj, {
    abortEarly: false,
  });

  if (validateResult.error && validateResult.error?.details?.length > 0) {
    validateResult.error.details.forEach((currentMsg) => {
      writeToLogFileSync(currentMsg.message, LogMessageType.ERROR);
    });

    throw new CustomError(
      `Failed to validate the ${LAUNCHER_CONFIG_FILE_NAME} file.`,
      ErrorName.VALIDATION,
    );
  }

  return validateResult.value!;
};

const GameSettingsGroupSchema = Joi.object<IGameSettingsGroup>({
  name: Joi.string().required().alphanum().min(MIN_NAME_LENGTH),
  label: Joi.string().optional().default(Joi.ref('name')),
});

const gameSettingsFileSchema = Joi.object<IGameSettingsFile>({
  id: Joi.string().optional().default(() => getRandomId('game-settings-file')),
  name: Joi.string().required().alphanum(),
  label: Joi.string().optional().default(Joi.ref('name')),
  path: Joi.string().required().custom(checkIsPathWithVariableCorrect),
  view: Joi.string().required().valid(...Object.values(GameSettingsFileView)),
  encoding: Joi.string().optional().allow(''),
});

// Схема для поверхностной проверки. Нужна для записи в state во время генерации storage.
export const gameSettingsShallowCheckSchema = Joi.object<IGameSettingsConfig>({
  modOrganizer: Joi.object({}).required(),
  baseFilesEncoding: Joi.string().optional().default(Encoding.WIN1251),
  gameSettingsGroups: Joi.array().optional().default([]),
  gameSettingsFiles: Joi.array().required(),
  gameSettingsOptions: Joi.array().required(),
});

// Полная проверка.
export const gameSettingsDeepCheckSchema = Joi.object<IGameSettingsConfig>({
  baseFilesEncoding: Joi.string().optional().default(Encoding.WIN1251),
  documentsPath: Joi.string().optional()
    .default(defaultGameSettingsConfig.documentsPath)
    .pattern(PathRegExp.DOCUMENTS, 'correct path'),
  modOrganizer: Joi.object({
    isUsed: Joi.bool().optional().default(false),
    pathToMOFolder: Joi.string().optional()
      .pattern(PathRegExp.GAME_DIR, 'correct path')
      .default(defaultGameSettingsConfig.modOrganizer.pathToMOFolder),
  }).optional().default(defaultGameSettingsConfig.modOrganizer),
  gameSettingsGroups: Joi.array()
    .items(GameSettingsGroupSchema).optional().default([])
    .unique((a, b) => a.name === b.name),
  gameSettingsFiles: Joi.array()
    .items(gameSettingsFileSchema).required().min(1)
    .unique((a, b) => a.name === b.name),
  gameSettingsOptions: Joi.array().required().min(1),
});

const gameSettingsFileOptionTypeSchema = Joi.string().required().valid(...Object.values(GameSettingsOptionType)).label('optionType');

// id для опций не указываются в settings.json, вместо этого они генерируются автоматически.
const defaultOptionTypeSchema = Joi.object({
  id: Joi.string().optional().default(() => getRandomId()),
  optionType: Joi.string().required().valid(GameSettingsOptionType.DEFAULT),
  file: Joi.string().valid(Joi.in('$gameSettingsFiles'))
    .messages({ 'any.only': '"file" must be one of {$gameSettingsFiles}' }),
  label: Joi.string().optional().default(Joi.ref('name')),
  description: Joi.string().optional().default('').allow(''),
  settingGroup: Joi.string().when(
    Joi.ref('$isGameSettingsGroupsExists'), {
      is: true, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ).valid(Joi.in('$gameSettingsGroups'))
    .messages({ 'any.only': '"settingGroup" must be one of {$gameSettingsGroups}' }),
  controllerType: Joi.string().required().valid(...Object.values(UIControllerType)),
  selectOptions: Joi.object().pattern(
    Joi.string(),
    Joi.string(),
  ).when(
    Joi.ref('controllerType'), { is: UIControllerType.SELECT, then: Joi.required() },
  ),
  selectOptionsValueString: Joi.string().when(
    Joi.ref('controllerType'), {
      is: UIControllerType.SELECT,
      then: Joi.optional().default((parent) => (parent.selectOptions !== undefined ? generateSelectOptionsString(parent.selectOptions) : '')),
      otherwise: Joi.forbidden(),
    },
  ),
  min: Joi.number().when(
    Joi.ref('controllerType'), { is: UIControllerType.RANGE, then: Joi.required() },
  ),
  max: Joi.number().when(
    Joi.ref('controllerType'), { is: UIControllerType.RANGE, then: Joi.required() },
  ),
  step: Joi.number().when(
    Joi.ref('controllerType'), { is: UIControllerType.RANGE, then: Joi.required() },
  ),
  items: Joi.array()
    .items(Joi.object({
      id: Joi.string().optional().default(() => getRandomId()),
      name: Joi.string().required(),
      iniGroup: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.SECTIONAL, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ),
      valueAttribute: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ).allow(''),
      valuePath: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ).allow(''),
    })).required().length(1),
});

const groupOptionTypeSchema = Joi.object({
  id: Joi.string().optional().default(() => getRandomId()),
  optionType: Joi.string().required().valid(GameSettingsOptionType.GROUP),
  file: Joi.string().valid(Joi.in('$gameSettingsFiles'))
    .messages({ 'any.only': '"file" must be one of {$gameSettingsFiles}' }),
  label: Joi.string().required(),
  description: Joi.string().optional().default('').allow(''),
  settingGroup: Joi.string().when(
    Joi.ref('$isGameSettingsGroupsExists'), {
      is: true, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ).valid(Joi.in('$gameSettingsGroups'))
    .messages({ 'any.only': '"settingGroup" must be one of {$gameSettingsGroups}' }),
  controllerType: Joi.string().required().valid(...Object.values(UIControllerType)),
  selectOptions: Joi.object().pattern(
    Joi.string(),
    Joi.string(),
  ).when(
    Joi.ref('controllerType'), { is: UIControllerType.SELECT, then: Joi.required() },
  ),
  selectOptionsValueString: Joi.string().when(
    Joi.ref('controllerType'), {
      is: UIControllerType.SELECT,
      then: Joi.optional().default((parent) => (parent.selectOptions !== undefined ? generateSelectOptionsString(parent.selectOptions) : '')),
      otherwise: Joi.forbidden(),
    },
  ),
  min: Joi.number().when(
    Joi.ref('controllerType'), { is: UIControllerType.RANGE, then: Joi.required() },
  ),
  max: Joi.number().when(
    Joi.ref('controllerType'), { is: UIControllerType.RANGE, then: Joi.required() },
  ),
  step: Joi.number().when(
    Joi.ref('controllerType'), { is: UIControllerType.RANGE, then: Joi.required() },
  ),
  items: Joi.array()
    .items(Joi.object({
      id: Joi.string().optional().default(() => getRandomId()),
      name: Joi.string().required(),
      iniGroup: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.SECTIONAL, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ),
      valueAttribute: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ),
      valuePath: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ).allow(''),
    })).required().min(2),
});

const combinedOptionTypeSchema = Joi.object({
  id: Joi.string().optional().default(() => getRandomId()),
  optionType: Joi.string().required().valid(GameSettingsOptionType.COMBINED),
  file: Joi.string().valid(Joi.in('$gameSettingsFiles'))
    .messages({ 'any.only': '"file" must be one of {$gameSettingsFiles}' }),
  label: Joi.string().required(),
  description: Joi.string().optional().default('').allow(''),
  settingGroup: Joi.string().when(
    Joi.ref('$isGameSettingsGroupsExists'), {
      is: true, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ).valid(Joi.in('$gameSettingsGroups'))
    .messages({ 'any.only': '"settingGroup" must be one of {$gameSettingsGroups}' }),
  controllerType: Joi.string().required().valid(UIControllerType.SELECT),
  separator: Joi.string().optional().default(':'),
  selectOptions: Joi.object().pattern(
    Joi.string(),
    Joi.string(),
  ).when(
    Joi.ref('controllerType'), { is: UIControllerType.SELECT, then: Joi.required() },
  ).custom((value: { [key: string]: string, }, helpers) => {
    Object.values(value).forEach((element) => {
      if (element.split(helpers.state.ancestors[0].separator).length !== helpers.state.ancestors[0].items.length) {
        throw new Error('the number of parts of the option key is not equal to the number of "items" or incorrect "separator" used.'); //eslint-disable-line max-len
      }
    });
    return value;
  }),
  selectOptionsValueString: Joi.string().when(
    Joi.ref('controllerType'), {
      is: UIControllerType.SELECT,
      then: Joi.optional().default((parent) => (parent.selectOptions !== undefined ? generateSelectOptionsString(parent.selectOptions) : '')),
      otherwise: Joi.forbidden(),
    },
  ),
  items: Joi.array()
    .items(Joi.object({
      id: Joi.string().optional().default(() => getRandomId()),
      name: Joi.string().required(),
      iniGroup: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.SECTIONAL, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ),
      valueAttribute: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ),
      valuePath: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ).allow(''),
    })).required().min(2),
});

const relatedOptionTypeSchema = Joi.object({
  id: Joi.string().optional().default(() => getRandomId()),
  optionType: Joi.string().required().valid(GameSettingsOptionType.RELATED),
  file: Joi.string().valid(Joi.in('$gameSettingsFiles'))
    .messages({ 'any.only': '"file" must be one of {$gameSettingsFiles}' }),
  label: Joi.string().required(),
  description: Joi.string().optional().default('').allow(''),
  settingGroup: Joi.string().when(
    Joi.ref('$isGameSettingsGroupsExists'), {
      is: true, then: Joi.required(), otherwise: Joi.forbidden(),
    },
  ).valid(Joi.in('$gameSettingsGroups'))
    .messages({ 'any.only': '"settingGroup" must be one of {$gameSettingsGroups}' }),
  items: Joi.array()
    .items(Joi.object({
      id: Joi.string().optional().default(() => getRandomId()),
      name: Joi.string().required(),
      iniGroup: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.SECTIONAL, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ),
      valueAttribute: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ),
      valuePath: Joi.string().when(
        Joi.ref('$view'), {
          is: GameSettingsFileView.TAG, then: Joi.required(), otherwise: Joi.forbidden(),
        },
      ).allow(''),
      controllerType: Joi.string().required().valid(UIControllerType.SELECT),
      selectOptions: Joi.object().pattern(
        Joi.string(),
        Joi.string(),
      ).when(
        Joi.ref('controllerType'), { is: UIControllerType.SELECT, then: Joi.required() },
      ),
      selectOptionsValueString: Joi.string().when(
        Joi.ref('controllerType'), {
          is: UIControllerType.SELECT,
          then: Joi.optional().default((parent) => (parent.selectOptions !== undefined ? generateSelectOptionsString(parent.selectOptions) : '')),
          otherwise: Joi.forbidden(),
        },
      ),
      min: Joi.number().when(
        Joi.ref('controllerType'), { is: UIControllerType.RANGE, then: Joi.required() },
      ),
      max: Joi.number().when(
        Joi.ref('controllerType'), { is: UIControllerType.RANGE, then: Joi.required() },
      ),
      step: Joi.number().when(
        Joi.ref('controllerType'), { is: UIControllerType.RANGE, then: Joi.required() },
      ),
    })).required().min(2),
});

/**
 * Проверка опций, указанных в gameSettingsOptions.
 * @param gameSettingsOptions Опции для проверки.
 * @param gameSettingsGroups Группы игровых настроек.
 * @param gameSettingsFiles Файлы игровых настроек.
 * @returns Объект с массивом параметров и массивом ошибок проверки.
*/
export const checkGameSettingsOptions = (
  gameSettingsOptions: IGameSettingsRootState['gameSettingsOptions'],
  gameSettingsGroups: IGameSettingsRootState['gameSettingsGroups'],
  gameSettingsFiles: IGameSettingsRootState['gameSettingsFiles'],
): ICheckResult<IGameSettingsOption[]> => {
  const errors: Joi.ValidationError[] = [];
  const validationOptions: Joi.ValidationOptions = {
    abortEarly: false,
    stripUnknown: true,
    context: {
      isGameSettingsGroupsExists: gameSettingsGroups.length > 0,
      gameSettingsGroups: getGameSettingsElementsNames(gameSettingsGroups),
      gameSettingsFiles: getGameSettingsElementsNames(gameSettingsFiles),
    },
  };

  const resultOptions = gameSettingsOptions.reduce<IGameSettingsOption[]>((totalOptions, currentOption, index) => {
    const fileForOption = gameSettingsFiles.find((file) => file.name === currentOption.file);
    validationOptions.context!.index = index;

    let validationResult: Joi.ValidationResult<IGameSettingsOption>;

    if (fileForOption) {
        validationOptions.context!.view = fileForOption.view;
    }

    validationResult = gameSettingsFileOptionTypeSchema.validate(
      currentOption.optionType,
      validationOptions,
    );

    if (validationResult.error) {
      validationResult.error.details.forEach((item) => {
        //eslint-disable-next-line no-param-reassign
        item.message = `gameSettingsOptions[${index}] ${item.message}`;
      });
      errors.push(validationResult.error);

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
      validationResult.error.details.forEach((item) => {
        //eslint-disable-next-line no-param-reassign
        item.message = `gameSettingsOptions[${index}] ${item.message}`;
      });
      errors.push(validationResult.error);

      return [...totalOptions];
    }

    return [...totalOptions, validationResult.value];
  }, []);

  return {
    data: resultOptions,
    errors,
  };
};

/**
 * Поверхностная проверка файла игровых настроек на соответствие требованиям.
 * Проверяются только данные на первом уровне объекта.
 * На выходе получаем сообщение о результате проверки и итоговый конфиг.
 * @param configObj Объект для проверки.
 * @returns Объект конфигурации игровых настроек.
*/
export const checkGameSettingsConfigShallow = (
  configObj: IGameSettingsConfig,
): IGameSettingsConfig => {
  writeToLogFileSync(`Started shallow checking the ${GAME_SETTINGS_CONFIG_FILE_NAME} file.`);

  const validateResult = gameSettingsShallowCheckSchema.validate(configObj, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (validateResult.error) {
    throw new CustomError(`${GAME_SETTINGS_CONFIG_FILE_NAME} validation error. ${validateResult.error.message}.`); //eslint-disable-line max-len
  }

  return validateResult.value;
};

/**
 * Полная проверка файла игровых настроек на соответствие требованиям.
 * На выходе получаем сообщение о результате проверки и итоговый конфиг.
 * @param configObj Объект для проверки.
 * @returns Объект с данными об игровых настройках и ошибками.
*/
export const checkGameSettingsConfigFull = (
  configObj: IGameSettingsConfig,
): ICheckResult<IGameSettingsConfig> => {
  writeToLogFileSync(`Started full checking the ${GAME_SETTINGS_CONFIG_FILE_NAME} file.`);
  const validationErrors: Joi.ValidationError[] = [];

  const validationResult = gameSettingsDeepCheckSchema.validate(configObj, {
    abortEarly: false,
    stripUnknown: true,
  });

  let config = validationResult.value!;

  if (validationResult.error) {
    let newGroups = config.gameSettingsGroups;
    let newFiles = config.gameSettingsFiles;

    validationErrors.push(validationResult.error);

    validationResult.error.details.forEach((errorItem) => {
      if (errorItem.path[0] === 'gameSettingsGroups') {
        newGroups = newGroups.filter((group) => group[errorItem.path[2]] !== errorItem.context?.value);
      } else if (errorItem.path[0] === 'gameSettingsFiles') {
        newFiles = newFiles.filter((file) => file[errorItem.path[2]] !== errorItem.context?.value);
      }
    });

    config = {
      ...config,
      gameSettingsGroups: newGroups,
      gameSettingsFiles: newFiles,
    };
  }

  const { data: options, errors: paramErrors } = checkGameSettingsOptions(
    config.gameSettingsOptions,
    config.gameSettingsGroups,
    config.gameSettingsFiles,
  );

  if (paramErrors.length > 0) {
    validationErrors.push(...paramErrors);
  }

  if (validationErrors.length > 0) {
    writeErrorsToLog(validationErrors);
  }

  config = {
    ...config,
    gameSettingsOptions: options,
  };

  writeToLogFileSync('Checking completed.');

  return {
    data: config,
    errors: validationErrors,
  };
};

/**
  Сравнение двух объектов на равенство полей.
  @param a Первый объект.
  @param b Второй объект.
  @returns Равны ли объекты.
*/
export const checkObjectForEqual = (a, b): boolean => {
  if (a === b) return true;
  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) return a === b;
  if (a === null || a === undefined || b === null || b === undefined) return false;
  if (a.prototype !== b.prototype) return false;
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every((k) => checkObjectForEqual(a[k], b[k]));
};
