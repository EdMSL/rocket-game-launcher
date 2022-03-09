
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
  IGameSettingsFiles,
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

interface IGameSettingsFileError {
  parent: string,
  error: string,
}

export interface IValidationData {
  errors: IValidationErrors,
  isForAdd: boolean,
}

export interface IGameSettingsConfigCheckResult {
  files: IGameSettingsConfig['gameSettingsFiles'],
  isError: boolean,
}

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

    return Boolean(/\.[a-zA-Z0-9]{2,}/.test(path.extname(value)));
  }

  return false;
};

const getIsPathWithVariableCorrectForCustomBtn = (
  value: string,
  helpers: Joi.CustomHelpers,
): string => {
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
};

const configFileDataSchema = Joi.object({
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
    pathToMOFolder: Joi.string().optional().default(defaultLauncherConfig.modOrganizer.pathToMOFolder).pattern(PathRegExp.GAME_DIR_REGEXP, 'correct path'),
    pathToINI: Joi.string().optional().default(defaultLauncherConfig.modOrganizer.pathToINI).pattern(PathRegExp.MO_DIR_REGEXP, 'correct path'),
    pathToProfiles: Joi.string().optional().default(defaultLauncherConfig.modOrganizer.pathToProfiles).pattern(PathRegExp.MO_DIR_REGEXP, 'correct path'),
    pathToMods: Joi.string().optional().default(defaultLauncherConfig.modOrganizer.pathToMods).pattern(PathRegExp.MO_DIR_REGEXP, 'correct path'),
    profileSection: Joi.string().optional(),
    profileParam: Joi.string().optional(),
    profileParamValueRegExp: Joi.string().optional().allow(''),
  }).optional().default(defaultLauncherConfig.modOrganizer),
  documentsPath: Joi.string().optional().allow('').default(defaultLauncherConfig.documentsPath)
    .pattern(PathRegExp.DOCUMENTS_REGEXP, 'correct path'),
  isFirstLaunch: Joi.bool().optional().default(defaultLauncherConfig.isFirstLaunch),
  gameName: Joi.string().optional().allow('').default(defaultLauncherConfig.gameName),
  playButton: Joi.object({
    path: Joi.string().optional().allow('').default(defaultLauncherConfig.playButton.path)
      .pattern(PathRegExp.GAME_DIR_REGEXP, 'correct path'),
    args: Joi.array().items(Joi.object({
      id: Joi.string().optional().default(() => getRandomId('play-btn-arg')),
      data: Joi.string().required(),
    })).optional().default(defaultLauncherConfig.playButton.args),
    label: Joi.string().optional().allow('').default(defaultLauncherConfig.playButton.label),
  }).required(),
  customButtons: Joi.array()
    .items(Joi.object({
      id: Joi.string().optional().default(() => getRandomId('custom-btn')),
      path: Joi.string().required().custom(getIsPathWithVariableCorrectForCustomBtn),
      args: Joi.array().items(Joi.object({
        id: Joi.string().optional().default(() => getRandomId('custom-btn-arg')),
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

  return validateResult.value;
};

const settingsMainSchema = Joi.object<IGameSettingsConfig>({
  gameSettingsGroups: Joi.array()
    .items(Joi.object({
      name: Joi.string().required().alphanum(),
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
