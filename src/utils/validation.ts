import { MinWindowSize } from '$constants/defaultData';
import {
  GameSettingsFileView, GameSettingsOptionType, UIControllerType,
} from '$constants/misc';
import {
  GameSettingsOptionFields, IGameSettingsFile, IGameSettingsOption,
} from '$types/gameSettings';
import { ILauncherConfig } from '$types/main';
import { deepClone } from './data';
import { getOptionItemSelectValueRegExp } from './strings';

const MAX_PATH_LENGTH = 255;

export enum ValidationErrorCause {
  MIN = 'less min value',
  EMPTY = 'empty value',
  ITEM = 'item error',
  ARG = 'arguments error',
  PATH = 'incorrect path',
  NOT_AVAILABLE = 'not available path',
  EXISTS = 'already exists',
}

export enum ValidationErrorText {
  MIN = 'Значение меньше допустимого',
  EMPTY = 'Значение не может быть пустым',
  PATH = 'Некорректный путь',
  NOT_AVAILABLE = 'Недопустимый путь',
}

interface IValidationErrorData {
  cause: string,
  text?: string,
}

export interface IValidationError {
  id: string,
  error: IValidationErrorData,
  isForAdd: boolean,
}

export interface IValidationErrors {
  [id: string]: IValidationErrorData[],
}

/**
 * Проверка имени папки на корректность.
 * @param name Имя для проверки.
 * @returns Является ли имя корректным.
*/
export const isValidFolderName = (name: string): boolean => {
  if (typeof name !== 'string' || name.length > MAX_PATH_LENGTH) {
    return false;
  }

  if (/.+\.\s*$/.test(name)) {
    return false;
  }

  return !/[<>:"/\\|?*]/.test(name);
};

/**
 * Получает список всех причин ошибок валидации для заданного поля.
 * @param errorsArr Массив объектов ошибок поля.
 * @returns Массив строк с причинами ошибки.
 */
export const getValidationCauses = (
  errorsArr: IValidationErrorData[],
): string[] => errorsArr.map((error) => error.cause);

/**
 *Очищает все ошибки валидации, связанные этим компонентом.
 * @param validationErrors Текущие ошибки валидации.
 * @param target Идентификатор, массив идентификаторов или регулярное выражение, представляющие ID.
 * @returns Ошибки валидации без ошибок, привязанных к текущему компоненту.
 */
export const clearIDRelatedValidationErrors = (
  validationErrors: IValidationErrors,
  target: string|string[]|RegExp|RegExp[],
): IValidationErrors => Object
  .keys(validationErrors)
  .filter((errorId) => {
    if (Array.isArray(target)) {
      return !target.some((current: string|RegExp) => {
        if (current instanceof RegExp) {
          return current.test(errorId);
        }

        return errorId.includes(current);
      });
    }

    if (target instanceof RegExp) {
      return !target.test(errorId);
    }

    return !errorId.includes(target);
  })
  .reduce<IValidationErrors>((totalErrors, current) => ({
    ...totalErrors,
    [current]: validationErrors[current],
  }), {});

/**
 * Получает ошибки валидации полей с уникальными значениями.
 * @param currentErrors Текущие ошибки валидации.
 * @param handledErrors Обрабатываемые ошибки валидации.
 * @returns Объект с ошибками валидации после обработки.
*/
export const getUniqueValidationErrors = (
  currentErrors: IValidationErrors,
  handledErrors: IValidationError[],
): IValidationErrors => {
  let newErrors = deepClone<IValidationErrors>(currentErrors);

  handledErrors.forEach((currentError) => {
    if (newErrors[currentError.id] !== undefined) {
      const currentErrorsCauses = getValidationCauses(newErrors[currentError.id]);

      if (currentError.isForAdd) {
        if (!currentErrorsCauses.includes(currentError.error.cause)) {
          newErrors[currentError.id].push(currentError.error);
        }
      } else {
        newErrors[currentError.id] = newErrors[currentError.id].filter(
          (filteredError) => filteredError.cause !== currentError.error.cause,
        );
      }
    } else if (currentError.isForAdd) {
      newErrors[currentError.id] = [currentError.error];
    }
  });

  newErrors = Object.keys(newErrors).reduce<IValidationErrors>((acc, currentError) => {
    if (newErrors[currentError].length > 0) {
      return {
        ...acc,
        [currentError]: newErrors[currentError],
      };
    }

    return { ...acc };
  }, {});

  return newErrors;
};
/**
 * Проверяет, есть ли среди ошибок валидации ошибки, привязанные к текущей опции.
 * @param optionId ID опции для проверки.
 * @param validationErrors Ошибки валидации.
 * @returns Есть ли ошибки, привязанные к переданному ID.
 */
const getIsOptionHasValidationErrors = (
  optionId: string,
  validationErrors: IValidationErrors,
): boolean => Object.keys(validationErrors).some((errorKey) => errorKey.includes(`_${optionId}`));

/**
  Проверяет значения полей `number` в компоненте `developer screen` на корректность.
  @param id id поля.
  @param value Значение поля.
  @param name Имя поля.
  @param min Минимальное значение для `value`.
  @param currentConfig Объект конфигурации лаунчера.
  @param currentErrors Текущие ошибки валидации.
  @returns Новый объект ошибок валидации.
*/
export const validateUserWindowSizeFields = (
  id: string,
  value: number,
  name: string,
  min: number|undefined,
  currentConfig: ILauncherConfig,
  currentErrors: IValidationErrors,
): IValidationErrors => {
  const errors: IValidationError[] = [];

  if (min !== undefined) {
    errors.push({
      id,
      error: {
        cause: ValidationErrorCause.MIN,
        text: ValidationErrorText.MIN,
      },
      isForAdd: +value < min,
    });
  }

  const namesAndValues = name.toLowerCase().includes('width')
    ? {
        default: currentConfig.width,
        min: currentConfig.minWidth,
        max: currentConfig.maxWidth,
        defaultName: 'width',
        minName: 'minWidth',
        maxName: 'maxWidth',
        text: 'ширины',
      }
    : {
        default: currentConfig.height,
        min: currentConfig.minHeight,
        max: currentConfig.maxHeight,
        defaultName: 'height',
        minName: 'minHeight',
        maxName: 'maxHeight',
        text: 'высоты',
      };

  if (name === 'width' || name === 'height') {
    errors.push(
      {
        id,
        error: {
          cause: `less config ${namesAndValues.minName}`,
          text: `Значение меньше минимальной ${namesAndValues.text}`,
        },
        isForAdd: currentConfig.isResizable && +value < namesAndValues.min,
      },
      {
        id,
        error: {
          cause: `more config ${namesAndValues.maxName}`,
          text: `Значение больше максимальной ${namesAndValues.text}`,
        },
        isForAdd: currentConfig.isResizable
        && namesAndValues.max > 0
        && +value > namesAndValues.max,
      },
      {
        id: namesAndValues.minName,
        error: {
          cause: `more config ${id}`,
          text: `Значение больше ${namesAndValues.text} по умолчанию`,
        },
        isForAdd: currentConfig.isResizable && +value < namesAndValues.min,
      },
      {
        id: namesAndValues.maxName,
        error: {
          cause: `less config ${id}`,
          text: `Значение меньше ${namesAndValues.text} по умолчанию`,
        },
        isForAdd: currentConfig.isResizable
        && namesAndValues.max > 0
        && +value > namesAndValues.max,
      },
    );
  } else if (name === 'minWidth' || name === 'minHeight') {
    errors.push(
      {
        id,
        error: {
          cause: `more config ${namesAndValues.defaultName}`,
          text: `Значение больше ${namesAndValues.text} по умолчанию`,
        },
        isForAdd: currentConfig.isResizable && +value > namesAndValues.default,
      },
      {
        id,
        error: {
          cause: `more config ${namesAndValues.maxName}`,
          text: `Значение больше максимальной ${namesAndValues.text}`,
        },
        isForAdd: currentConfig.isResizable
        && namesAndValues.max > 0
        && +value > namesAndValues.max,
      },
      {
        id: namesAndValues.defaultName,
        error: {
          cause: `less config ${id}`,
          text: `Значение меньше максимальной ${namesAndValues.text}`,
        },
        isForAdd: currentConfig.isResizable && +value > namesAndValues.default,
      },
      {
        id: namesAndValues.maxName,
        error: {
          cause: `less config ${id}`,
          text: `Значение меньше ${namesAndValues.text} по умолчанию`,
        },
        isForAdd: currentConfig.isResizable
        && namesAndValues.max > 0
        && +value > namesAndValues.max,
      },
    );
  } else if (name === 'maxWidth' || name === 'maxHeight') {
    errors.push(
      {
        id,
        error: {
          cause: ValidationErrorCause.MIN,
          text: ValidationErrorText.MIN,
        },
        isForAdd: currentConfig.isResizable
        && +value < MinWindowSize[name === 'maxWidth' ? 'WIDTH' : 'HEIGHT']
        && +value > 0,
      },
      {
        id,
        error: {
          cause: `less config ${namesAndValues.defaultName}`,
          text: `Значение меньше ${namesAndValues.text} по умолчанию`,
        },
        isForAdd: currentConfig.isResizable && +value < namesAndValues.default && +value > 0,
      },
      {
        id,
        error: {
          cause: `less config ${namesAndValues.minName}`,
          text: `Значение меньше минимальной ${namesAndValues.text}`,
        },
        isForAdd: currentConfig.isResizable && +value < namesAndValues.min && +value > 0,
      },
      {
        id: namesAndValues.defaultName,
        error: {
          cause: `more config ${id}`,
          text: `Значение больше максимальной ${namesAndValues.text}`,
        },
        isForAdd: currentConfig.isResizable && +value < namesAndValues.default && +value > 0,
      },
      {
        id: namesAndValues.minName,
        error: {
          cause: `more config ${id}`,
          text: `Значение больше максимальной ${namesAndValues.text}`,
        },
        isForAdd: currentConfig.isResizable && +value < namesAndValues.min && +value > 0,
      },
    );
  }

  return getUniqueValidationErrors(currentErrors, errors);
};

const validateSelectOptions = (
  value: string,
  id: string,
  option: IGameSettingsOption,
  currentErrors: IValidationErrors,
): IValidationErrors => {
  const errors: IValidationError[] = [];
  const valueArr = value.split('\n').filter((subStr) => subStr !== '');
  let incorrectIndexes: number[] = [];

  valueArr.forEach((subStr, index) => {
    if (!getOptionItemSelectValueRegExp(
      option.optionType,
      option.separator,
      option.items.length - 1,
    ).test(subStr)) {
      incorrectIndexes.push(index + 1);
    }
  });

  errors.push(
    {
      id,
      error: {
        cause: ValidationErrorCause.EMPTY,
        text: 'Значение не может быть пустым',
      },
      isForAdd: value === '',
    },
    {
      id,
      error: {
        cause: 'less min quantity',
        text: 'Должно быть минимум две опции',
      },
      isForAdd: valueArr.length < 2,
    },
    {
      id,
      error: {
        cause: 'incorrect value',
        text: `Значение не соответствует заданному шаблону ${option.optionType === GameSettingsOptionType.COMBINED ? `Заголовок=Значение первого параметра${option.separator}Значение второго параметра(и т.д.)` : 'Заголовок=Значение'}`, //eslint-disable-line max-len
      },
      isForAdd: incorrectIndexes.length > 0,
    },
    {
      id: option.id,
      error: {
        cause: ValidationErrorCause.ITEM,
      },
      isForAdd: value === '' || valueArr.length < 2 || incorrectIndexes.length > 0,
    },
  );

  if (option.optionType === GameSettingsOptionType.COMBINED && incorrectIndexes.length === 0) {
    incorrectIndexes = [];

    valueArr.forEach((pairStr, index) => {
      if (!new RegExp(`^[^${option.separator}=]+(?<=\\S)(${option.separator}[^${option.separator}=\\s][^${option.separator}=]*){${option.items.length - 1}}[^${option.separator}=]*$`, 'g').test(pairStr.split('=')[1])) { //eslint-disable-line max-len
        incorrectIndexes.push(index + 1);
      }
    });

    errors.push(
      {
        id,
        error: {
          cause: 'not equal values quantity',
          text: `Количество значений в строках ${incorrectIndexes.join()} не равно количеству параметров в опции`, //eslint-disable-line max-len
        },
        isForAdd: incorrectIndexes.length > 0,
      },
      {
        id: option.id,
        error: {
          cause: ValidationErrorCause.ITEM,
        },
        isForAdd: incorrectIndexes.length > 0,
      },
    );
  }

  return getUniqueValidationErrors(currentErrors, errors);
};

export const validateFileRelatedFields = (
  option: IGameSettingsOption,
  file: IGameSettingsFile,
  currentErrors: IValidationErrors,
): IValidationErrors => {
  const errors: IValidationError[] = [];
  let newErrors = { ...currentErrors };

  option.items.forEach((item) => {
    newErrors = clearIDRelatedValidationErrors(
      { ...currentErrors },
      [
        new RegExp(`${GameSettingsOptionFields.SELECT_OPTIONS_VALUE_STRING}_.+_${item.id}`),
        new RegExp(`${GameSettingsOptionFields.INI_GROUP}_.+_${item.id}`),
      ],
    );

    errors.push(
      {
        id: `${GameSettingsOptionFields.NAME}_${option.id}_${item.id}`,
        error: {
          cause: ValidationErrorCause.EMPTY,
          text: ValidationErrorText.EMPTY,
        },
        isForAdd: item[GameSettingsOptionFields.NAME] === '',
      },
      {
        id: option.id,
        error: {
          cause: ValidationErrorCause.ITEM,
        },
        isForAdd: item[GameSettingsOptionFields.NAME] === '',
      },
    );

    if (file.view === GameSettingsFileView.SECTIONAL) {
      errors.push(
        {
          id: `${GameSettingsOptionFields.INI_GROUP}_${option.id}_${item.id}`,
          error: {
            cause: ValidationErrorCause.EMPTY,
            text: ValidationErrorText.EMPTY,
          },
          isForAdd: item[GameSettingsOptionFields.INI_GROUP] === '',
        },
        {
          id: option.id,
          error: {
            cause: ValidationErrorCause.ITEM,
          },
          isForAdd: item[GameSettingsOptionFields.INI_GROUP] === '',
        },
      );
    }
  });

  return getUniqueValidationErrors(newErrors, errors);
};

export const validateControllerTypeRelatedFields = (
  option: IGameSettingsOption,
  currentErrors: IValidationErrors,
): IValidationErrors => {
  let errors = { ...currentErrors };

  errors = clearIDRelatedValidationErrors(
    errors,
    `${GameSettingsOptionFields.SELECT_OPTIONS_VALUE_STRING}_${option.id}`,
  );

  if (option.controllerType && option.controllerType === UIControllerType.SELECT) {
    errors = validateSelectOptions(
      option.selectOptionsValueString!,
      `${GameSettingsOptionFields.SELECT_OPTIONS_VALUE_STRING}_${option.id}`,
      option,
      errors,
    );
  }

  option.items.forEach((item) => {
    errors = clearIDRelatedValidationErrors(
      errors,
      new RegExp(`${GameSettingsOptionFields.SELECT_OPTIONS_VALUE_STRING}_.+_${item.id}`),
    );

    if (item.controllerType && item.controllerType === UIControllerType.SELECT) {
      errors = validateSelectOptions(
          item.selectOptionsValueString!,
          `${GameSettingsOptionFields.SELECT_OPTIONS_VALUE_STRING}_${option.id}_${item.id}`,
          option,
          errors,
      );
    }
  });

  if (!getIsOptionHasValidationErrors(option.id, errors)) {
    errors = clearIDRelatedValidationErrors(errors, option.id);
  }

  return errors;
};

export const validateOptionTypeRelatedFields = (
  option: IGameSettingsOption,
  file: IGameSettingsFile,
  currentErrors: IValidationErrors,
): IValidationErrors => {
  let errors = { ...currentErrors };

  errors = validateFileRelatedFields(option, file, currentErrors);
  errors = validateControllerTypeRelatedFields(option, errors);

  return errors;
};

export const validateTargetGameSettingsOption = (
  target: EventTarget & (HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement),
  option: IGameSettingsOption,
  file: IGameSettingsFile,
  currentErrors: IValidationErrors,
): IValidationErrors => {
  let errors = { ...currentErrors };

  if (target.required && (target.type === 'text' || target.tagName === 'TEXTAREA')) {
    errors = getUniqueValidationErrors(
      errors,
      [
        {
          id: target.id,
          error: {
            cause: ValidationErrorCause.EMPTY,
            text: ValidationErrorText.EMPTY,
          },
          isForAdd: target.value === '',
        },
        {
          id: option.id,
          error: {
            cause: ValidationErrorCause.ITEM,
          },
          isForAdd: target.value === '',
        },
      ],
    );
  }

  if (target.name === GameSettingsOptionFields.FILE) {
    errors = validateFileRelatedFields(option, file, errors);
  } else if (target.name === GameSettingsOptionFields.OPTION_TYPE) {
    errors = validateOptionTypeRelatedFields(option, file, errors);
  } else if (target.name === GameSettingsOptionFields.CONTROLLER_TYPE
    || target.name === GameSettingsOptionFields.SEPARATOR) {
    errors = validateControllerTypeRelatedFields(option, errors);
  } else if (target.name === GameSettingsOptionFields.SELECT_OPTIONS_VALUE_STRING) {
    errors = validateSelectOptions(target.value, target.id, option, errors);
  } else if (target.name === GameSettingsOptionFields.NAME
    && option.optionType !== GameSettingsOptionType.DEFAULT) {
    errors = getUniqueValidationErrors(
      errors,
      [
        {
          id: target.id,
          error: {
            cause: ValidationErrorCause.EXISTS,
            text: 'Параметр с таким именем уже есть',
          },
          isForAdd: target.value !== ''
        && option.items.filter((currtItem) => currtItem.name === target.value).length > 1,
        },
      ],
    );
  }

  return errors;
};
