import {
  availableOptionSeparators, GameSettingsFileView, GameSettingsOptionType, UIControllerType,
} from '$constants/misc';
import { IGameSettingsFile, IGameSettingsOption } from '$types/gameSettings';
import { ILauncherConfig } from '$types/main';
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

interface IValidationError {
  cause: string,
  text?: string,
}

export interface IValidationData {
  errors: IValidationErrors,
  isForAdd: boolean,
}

export interface IValidationErrors {
  [id: string]: IValidationError[],
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
  errorsArr: IValidationError[],
): string[] => errorsArr.map((error) => error.cause);

/**
 *Очищает при удалении компонента все ошибки валидации, связанные этим компонентом.
 * @param validationErrors Текущие ошибки валидации.
 * @param targetId Идентификатор или массив идентификаторов удаляемого(ых) компонента(ов).
 * @returns Ошибки валидации без ошибок, привязанных к текущему компоненту.
 */
export const clearComponentValidationErrors = (
  validationErrors: IValidationErrors,
  targetId: string|string[],
): IValidationErrors => Object
  .keys(validationErrors)
  .filter((errorId) => (Array.isArray(targetId)
    ? !targetId.some((currentId) => errorId.includes(currentId))
    : !errorId.includes(targetId)))
  .reduce((totalErrors, currentId) => ({
    ...totalErrors,
    [currentId]: validationErrors[currentId],
  }), {});

const getValidationErrorWithUniqueCauses = (
  currentErrors: IValidationError[],
  handledErrors: IValidationError[],
): IValidationError[] => {
  const currentErrorsCauses = getValidationCauses(currentErrors);

  const newErrors = handledErrors.reduce((totalErrors, currentError) => {
    if (currentErrorsCauses.includes(currentError.cause)) {
      return [...totalErrors];
    }

    currentErrorsCauses.push(currentError.cause);

    return [...totalErrors, currentError];
  }, [...currentErrors]);

  return newErrors;
};

/**
 * Получает ошибки валидации полей с уникальными значениями.
 * @param currentErrors Текущие ошибки валидации.
 * @param handledErrors Обрабатываемые ошибки валидации.
 * @param isForAdd Если `true`, добавит обрабатываемые ошибки в общий список, иначе удалит.
 * @returns Объект с ошибками валидации после обработки.
*/
export const getUniqueValidationErrors = (
  currentErrors: IValidationErrors,
  handledErrors: IValidationErrors,
  isForAdd: boolean,
): IValidationErrors => {
  const newErrors = Object.keys(handledErrors).reduce<IValidationErrors>((totalErrors, id) => {
    if (isForAdd) {
      return {
        ...currentErrors,
        ...totalErrors,
        [id]: getValidationErrorWithUniqueCauses(
          currentErrors[id] ? currentErrors[id] : [],
          handledErrors[id],
        ),
      };
    }

    if (currentErrors[id]) {
      const currentCauses = getValidationCauses(handledErrors[id]);

      return {
        ...currentErrors,
        ...totalErrors,
        [id]: [...currentErrors[id].filter((currError) => !currentCauses.includes(currError.cause))],
      };
    }

    return {
      ...currentErrors,
      ...totalErrors,
      [id]: [],
    };
  }, {});

  return Object.keys(newErrors).reduce((totalErrors, id) => {
    if (newErrors[id].length > 0) {
      return {
        ...totalErrors,
        [id]: newErrors[id],
      };
    }

    return {
      ...totalErrors,
    };
  }, {});
};

/**
  Проверяет значения полей `number` в компоненте `developer screen` на корректность.
  @param target Поле `target` объекта `event`.
  @param currentConfig Объект конфигурации лаунчера.
  @param currentErrors Текущие ошибки валидации.
  @returns Новый объект ошибок валидации.
*/
export const validateNumberInputs = (
  target: EventTarget & HTMLInputElement,
  currentConfig: ILauncherConfig,
  currentErrors: IValidationErrors,
): IValidationErrors => {
  let errors: IValidationErrors = { ...currentErrors };

  errors = getUniqueValidationErrors(
    errors,
    { [target.id]: [{ cause: ValidationErrorCause.MIN, text: 'Значение меньше допустимого' }] },
    +target.value < +target.min,
  );

  if (currentConfig.isResizable) {
    const namesAndValues = target.name.toLowerCase().includes('width')
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

    if (target.name === 'width' || target.name === 'height') {
      errors = getUniqueValidationErrors(
        errors,
        {
          [target.id]: [{ cause: `less config ${namesAndValues.minName}` }],
          [namesAndValues.minName]: [{ cause: `more config ${target.id}` }],
        },
        +target.value < namesAndValues.min,
      );

      errors = getUniqueValidationErrors(
        errors,
        {
          [target.id]: [{ cause: `more config ${namesAndValues.maxName}` }],
          [namesAndValues.maxName]: [{ cause: `less config ${target.id}` }],
        },
        namesAndValues.max > 0 && +target.value > namesAndValues.max,
      );
    } else if (target.name === 'minWidth' || target.name === 'minHeight') {
      errors = getUniqueValidationErrors(
        errors,
        {
          [target.id]: [{ cause: `more config ${namesAndValues.defaultName}` }],
          [namesAndValues.defaultName]: [{ cause: `less config ${target.id}` }],
        },
        +target.value > namesAndValues.default,
      );

      errors = getUniqueValidationErrors(
        errors,
        {
          [target.id]: [{ cause: `more config ${namesAndValues.maxName}` }],
          [namesAndValues.maxName]: [{ cause: `less config ${target.id}` }],
        },
        namesAndValues.max > 0 && +target.value > namesAndValues.max,
      );
    } else if (target.name === 'maxWidth' || target.name === 'maxHeight') {
      errors = getUniqueValidationErrors(
        errors,
        {
          [target.id]: [{ cause: `less config ${namesAndValues.defaultName}` }],
          [namesAndValues.defaultName]: [{ cause: `more config ${target.id}` }],
        },
        +target.value < namesAndValues.default && +target.value > 0,
      );
      errors = getUniqueValidationErrors(
        errors,
        {
          [target.id]: [{ cause: `less config ${namesAndValues.minName}` }],
          [namesAndValues.minName]: [{ cause: `more config ${target.id}` }],
        },
        +target.value < namesAndValues.min && +target.value > 0,
      );
    }
  }
  return errors;
};

const validateTextArea = (
  value: string,
  id: string,
  option: IGameSettingsOption,
  currentErrors: IValidationErrors,
): IValidationErrors => {
  let errors: IValidationErrors = { ...currentErrors };
  let incorrectIndexes: number[] = [];
  const valueArr = value.split('\n').filter((subStr) => subStr !== '');

  valueArr.forEach((subStr, index) => {
    if (!getOptionItemSelectValueRegExp(
      option.optionType,
      option.separator,
      option.items.length - 1,
    ).test(subStr)) {
      incorrectIndexes.push(index + 1);
    }
  });

  errors = getUniqueValidationErrors(
    errors,
    {
      [id]: [{
        cause: ValidationErrorCause.EMPTY,
        text: 'Значение не может быть пустым',
      }],
      [`${option.id}:${id}`]: [{ cause: ValidationErrorCause.ITEM }],
    },
    value === '',
  );

  errors = getUniqueValidationErrors(
    errors,
    {
      [id]: [{
        cause: 'less min quantity',
        text: 'Должно быть минимум две опции',
      }],
      [`${option.id}:${id}`]: [{ cause: ValidationErrorCause.ITEM }],
    },
    valueArr.length < 2,
  );

  errors = getUniqueValidationErrors(
    errors,
    {
      [id]: [{
        cause: 'incorrect value',
        text: `Значение не соответствует заданному шаблону ${option.optionType === GameSettingsOptionType.COMBINED ? `Заголовок=Значение первого параметра${option.separator}Значение второго параметра(и т.д.)` : 'Заголовок=Значение'}`, //eslint-disable-line max-len
      }],
      [`${option.id}:${id}`]: [{ cause: ValidationErrorCause.ITEM }],
    },
    incorrectIndexes.length > 0,
  );

  if (option.optionType === GameSettingsOptionType.COMBINED && incorrectIndexes.length === 0) {
    incorrectIndexes = [];

    valueArr.forEach((pairStr, index) => {
      if (!new RegExp(`^[^${option.separator}=]+(?<=\\S)(${option.separator}[^${option.separator}=\\s][^${option.separator}=]*){${option.items.length - 1}}[^${option.separator}=]*$`, 'g').test(pairStr.split('=')[1])) { //eslint-disable-line max-len
        incorrectIndexes.push(index + 1);
      }
    });

    errors = getUniqueValidationErrors(
      errors,
      {
        [id]: [{
          cause: 'not equal values quantity',
          text: `Количество значений в строках ${incorrectIndexes.join()} не равно количеству параметров в опции`, //eslint-disable-line max-len
        }],
        [`${option.id}:${id}`]: [{ cause: ValidationErrorCause.ITEM }],
      },
      incorrectIndexes.length > 0,
    );
  }

  return errors;
};

export const validateOptionFields = (
  target: EventTarget & (HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement),
  option: IGameSettingsOption,
  currentErrors: IValidationErrors,
): IValidationErrors => {
  let errors: IValidationErrors = { ...currentErrors };

  if (target.required && (target.type === 'text' || target.tagName === 'TEXTAREA')) {
    errors = getUniqueValidationErrors(
      errors,
      {
        [target.id]: [{
          cause: ValidationErrorCause.EMPTY,
          text: 'Значение не может быть пустым',
        }],
        [`${option.id}:${target.id}`]: [{ cause: ValidationErrorCause.ITEM }],
      },
      target.value === '',
    );
  }

  if (target.name === 'separator') {
    errors = getUniqueValidationErrors(
      errors,
      {
        [target.id]: [{
          cause: 'not available separator',
          text: `Значение разделителя недопустимо. Допустимые значения: [${availableOptionSeparators}]`, //eslint-disable-line max-len
        }],
        [`${option.id}:${target.id}`]: [{ cause: ValidationErrorCause.ITEM }],
      },
      !availableOptionSeparators.includes(target.value),
    );
  } else if (target.tagName === 'TEXTAREA' && target.value !== '') {
    errors = { ...validateTextArea(target.value, target.id, option, errors) };
  }

  return errors;
};

export const validateOptionOnCreate = (
  option: IGameSettingsOption,
  file: IGameSettingsFile,
  currentErrors: IValidationErrors,
): IValidationErrors => {
  let errors: IValidationErrors = { ...currentErrors };

  if (option.controllerType && option.controllerType === UIControllerType.SELECT) {
    errors = { ...validateTextArea(option.selectOptionsValueString!, `selectOptionsValueString_${option.id}`, option, errors) };
  }

  option.items.forEach((item) => {
    if (item.name === '') {
      errors = getUniqueValidationErrors(
        errors,
        {
          [`name_${item.id}`]: [{
            cause: ValidationErrorCause.EMPTY,
            text: 'Значение не может быть пустым',
          }],
          [`${option.id}:name_${item.id}`]: [{ cause: ValidationErrorCause.ITEM }],
        },
        item.name === '',
      );
    }

    if (item.controllerType && item.controllerType === UIControllerType.SELECT) {
      errors = { ...validateTextArea(item.selectOptionsValueString!, `selectOptionsValueString_${item.id}`, option, errors) };
    }

    if (file.view === GameSettingsFileView.SECTIONAL) {
      errors = getUniqueValidationErrors(
        errors,
        {
          [`iniGroup_${item.id}`]: [{
            cause: ValidationErrorCause.EMPTY,
            text: 'Значение не может быть пустым',
          }],
          [`${option.id}:iniGroup_${item.id}`]: [{ cause: ValidationErrorCause.ITEM }],
        },
        item.iniGroup === '',
      );
    }

    if (file.view === GameSettingsFileView.TAG) {
      if (item.valueName !== undefined) {
        errors = getUniqueValidationErrors(
          errors,
          {
            [`valueName_${item.id}`]: [{
              cause: ValidationErrorCause.EMPTY,
              text: 'Значение не может быть пустым',
            }],
            [`${option.id}:valueName_${item.id}`]: [{ cause: ValidationErrorCause.ITEM }],
          },
          item.valueName === '',
        );
      }

      if (item.valuePath !== undefined) {
        errors = getUniqueValidationErrors(
          errors,
          {
            [`valuePath_${item.id}`]: [{
              cause: ValidationErrorCause.EMPTY,
              text: 'Значение не может быть пустым',
            }],
            [`${option.id}:valuePath_${item.id}`]: [{ cause: ValidationErrorCause.ITEM }],
          },
          item.valuePath === '',
        );
      }
    }
  });

  return errors;
};
